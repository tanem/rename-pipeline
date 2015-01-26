var through = require('through2');
var path = require('path');
var normalise = require('./lib/normalise');
var rename = require('./lib/rename');
var gs = require('glob-stream');
var isFunction = require('lodash.isfunction');

module.exports = RenamePipeline;

function RenamePipeline() {
  if (!(this instanceof RenamePipeline)) return new RenamePipeline();
  this._files = [];
  this._transforms = [];
  this._dryRun = false;
  this._silence = false;
}

RenamePipeline.prototype.files = function(files){
  this._files = files;
  return this;
};

RenamePipeline.prototype.transform = function(transform){
  this._transforms.push(transform);
  return this;
};

RenamePipeline.prototype.dryRun = function(dryRun){
  this._dryRun = dryRun;
  return this;
};

RenamePipeline.prototype.silence = function(silence){
  this._silence = silence;
  return this;
};

RenamePipeline.prototype.run = function(done){
  var stream = gs.create(this._files)
    .pipe(normalise());

  this._transforms
    .map(function(t){
      if (isFunction(t)) return t();
      return require(path.join(__dirname, 'transforms', t.name))(t.options || {});
    })
    .forEach(function(t){
      stream = stream.pipe(t);
    }); 

  stream.pipe(rename({
      dryRun: this._dryRun,
      silence: this._silence
    }))
    .on('finish', done || function(){});
};
