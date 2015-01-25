var through = require('through2');
var fs = require('fs');

module.exports = function(options){
  return through.obj(function(obj, enc, cb){
    if (options.dryRun) {
      if (!options.silence) console.log('%s -> %s', obj.oldPath, obj.newPath);
    } else {
      fs.rename(obj.oldPath, obj.newPath, function(err){
        if (err) throw err;
      });
    }
    cb();
  });
};