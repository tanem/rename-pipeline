var through = require('through2');
var path = require('path');
var exec = require('child_process').exec;

module.exports = function(){
  return through.obj(function(obj, enc, cb){
    exec('git show HEAD -s --format=%h', function(err, stdout, stderr){
      if (err) throw err;
      
      var workingPath = obj.newPath || obj.oldPath;
      var dirname = path.dirname(workingPath);
      var extname = path.extname(workingPath);
      var basename = path.basename(workingPath, extname);

      this.push({
        oldPath: obj.oldPath,
        newPath: path.join(dirname, basename + '.' + stdout.trim() + extname)
      });

      cb();
    }.bind(this));
  });
};