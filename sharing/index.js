var async = require('async'),
  request = require('request'),
  Q = require('q'),
  url = require('url');

function processUrl(rUrl) {
  return function (cb) {
    request(rUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(null, body);
      } else {
        cb(null, null);
      }
    })
  }
}

function counters(pageUrl) {
  return {
    facebook: processUrl('https://graph.facebook.com/fql?q=SELECT%20total_count%20FROM%20link_stat%20WHERE%20url=%22' + encodeURIComponent(pageUrl) + '%22&callback=get&_' + Date.now() + '='),
    twitter: processUrl('http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(pageUrl) + '&callback=get&_' + Date.now() + '='),
    linkedin: processUrl('https://www.linkedin.com/countserv/count/share?url=' + encodeURIComponent(pageUrl) + '&callback=get&_' + Date.now() + '='),
    pinterest: processUrl('https://api.pinterest.com/v1/urls/count.json?url=' + encodeURIComponent(pageUrl) + '&callback=get&_' + Date.now() + '='),
    gplus: processUrl('https://plusone.google.com/u/0/_/+1/fastbutton?count=true&url=' + encodeURIComponent(pageUrl) + '&_' + Date.now() + '='),
    vk: processUrl('https://vk.com/share.php?act=count&index=1&url=' + encodeURIComponent(pageUrl) + '&_' + Date.now() + '=')
  }
}

function getJSONPObject(callbackName, data) {
  var m = new RegExp('.*' + callbackName + '.*\\((.+)\\)').exec(data);
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch (err) {

    }
  }
  return {};
}

var parsers = {
  fb: function (data) {
    data = getJSONPObject('get', data);
    if (data.data && data.data[0]) {
      return data.data[0].total_count;
    }
    return 0;
  },
  twitter: function (data) {
    return getJSONPObject('get', data).count || 0;
  },
  linkedin: function (data) {
    return getJSONPObject('get', data).count || 0;
  },
  pinterest: function (data) {
    return getJSONPObject('get', data).count || 0;
  },
  gplus: function (data) {
    m = /<div\s+id="aggregateCount".*>([^<]+)<\/div>/i.exec(data);
    if (m) {
      return parseInt(m[1].replace(/[^\d]+/, ''));
    }
    return 0;
  },
  vk: function (data) {
    var m = /VK\.Share\.count\(\d+, (\d+)\)/i.exec(data);
    if (m) {
      return parseInt(m[1]);
    }
    return 0;
  }
};


exports.queryStats = function (pageUrl) {
  var deferred = Q.defer();
  var stats = {};
  async.parallel(counters(pageUrl), function (err, bodies) {
    if (!err) {
      for (var k in bodies) {
        if (bodies.hasOwnProperty(k) && parsers.hasOwnProperty(k) && bodies[k]) {
          try {
            stats[k] = parsers[k](bodies[k]);
          } catch (err) {
            stats[k] = 0;
          }
        }
      }
    }
    deferred.resolve(stats);
  });
  return deferred.promise;
};