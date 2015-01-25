#!/usr/bin/env node

var fs = require('fs');
var subarg = require('subarg');
var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');
var isArray = require('lodash.isarray');

var argv = subarg(process.argv.slice(2));

if (argv._[0] === 'help' || argv.h || argv.help) {
  return fs.createReadStream(__dirname + '/usage.txt')
    .pipe(process.stdout);
}

if (argv.v || argv.version) {
  return console.log(require('../package.json').version);
}

var transforms;
if (isArray(argv.t)) transforms = argv.t.map(parseTransformOptions);
else transforms = [parseTransformOptions(argv.t)];

var renamePipeline = require('..')();
renamePipeline.files(argv._);
transforms.forEach(renamePipeline.transform.bind(renamer));
renamePipeline.run();

function parseTransformOptions(t) {
  if (isString(t)) return { name: t , options: {} };
  if (isObject(t)) {
    var name = t._[0];
    delete t._;
    return { name: name, options: t };
  }
}