var program = require('commander'),
  fs = require('fs'),
  parser = require('./parser');

program
  .option('-a, --append', 'Append result')
  .option('-s, --social', 'Social retrieval')
  .option('-u, --url <link>', 'News url')
  .option('-r, --result <file>', 'Result json file')
  .parse(process.argv);


if (!(
  program.url &&
  program.result &&
  /https?\:\/\/\w+((\:\d+)?\/\S*)?/i.test(program.url)
  )) {
  program.help();
}

var previous = [];
if (program.append && fs.existsSync(program.result)) {
  previous = JSON.parse(fs.readFileSync(program.result, 'utf8'));
}

parser.parse(program.url.trim(), {
  append: program.append,
  social: program.social,
  previous: previous
})
  .then(function (result) {
    console.log(result);
    fs.writeFileSync(program.result, JSON.stringify(result), 'utf8');
  })
  .fail(function (err){
    console.error('error',err);
    process.exit(2);
  });

