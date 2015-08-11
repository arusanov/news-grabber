var _ = require('lodash'),
  urls = require('url'),
  sharing = require('./sharing'),
  Q = require('q'),
  HtmlParser = require('./parsers/generic-html');


exports.parsers = {
  'bitcoinwarrior.net': new HtmlParser({
    linkSelector: '.entry-title a',
    contentSelector: 'article.post'
  })
};


exports.parse = function (url, opts) {
  var parsed;
  opts = _.defaults(opts, {
    append: false,
    social: false,
    previous: []
  });

  if (url && (parsed = urls.parse(url)) && exports.parsers[parsed.hostname]) {
    return exports.parsers[parsed.hostname].parse(url)
      .then(function (result) {
        if (opts.append && opts.previous.length > 0) {
          return _.uniq(result.concat(opts.previous),'link')
        }
        return result;
      })
      .then(function (result) {
        if (opts.social) {
          return Q.all(result.map(function (r) {
            return sharing.queryStats(r.link).then(function (stats) {
              r.sharings = stats;
              return r;
            })
          }));
        } else {
          return result
        }
      })
  }
  throw new Error('bad url')
};