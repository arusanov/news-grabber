var _ = require('lodash'),
  request = require('request'),
  Q = require('q'),
  cheerio = require('cheerio');

function HtmlParser(opts) {
  this.opts = _.defaults(opts, {
    linkSelector: 'a',
    contentSelector: 'div'
  });
}

HtmlParser.prototype.getContents = function (link) {
  var self = this;
  return this.request(link).then(function (html) {
    var $ = cheerio.load(html);
    return {link: link, text: $(self.opts.contentSelector).text()};
  });
};

HtmlParser.prototype.parseToc = function (html) {
  var $ = cheerio.load(html),
    self = this,
    fns = $(this.opts.linkSelector).map(function (i, el) {
      var url = $(el).attr('href');
      return self.getContents(url);
    }).get();
  return Q.all(fns);
};

HtmlParser.prototype.request = function (url) {
  var deferred = Q.defer();
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      deferred.resolve(body);
    } else {
      deferred.reject(new Error(error));
    }
  });
  return deferred.promise;
};

HtmlParser.prototype.parse = function (url) {
  return this.request(url).then(this.parseToc.bind(this));
};


module.exports = HtmlParser;