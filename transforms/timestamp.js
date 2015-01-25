var moment = require('moment');
var through = require('through2');
var path = require('path');

module.exports = function(options){
  return through.obj(function(obj, enc, cb){
    options || (options = {});
    var formatString = options.formatString || 'YYYYMMDD-HHmm';
    var workingPath = obj.newPath || obj.oldPath;
    var dirname = path.dirname(workingPath);
    var extname = path.extname(workingPath);
    var basename = path.basename(workingPath, extname);

    this.push({
      oldPath: obj.oldPath,
      newPath: path.join(
        dirname,
        basename + '.' + moment().format(formatString) + extname
      )
    });

    cb();
  });
};