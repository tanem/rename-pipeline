var moment = require('moment');
var through = require('through2');
var path = require('path');

module.exports = function(options){
  return through.obj(function(obj, enc, cb){
    
    var format = options.f || options.format || 'YYYYMMDD-HHmm';

    var workingPath = obj.newPath || obj.oldPath;
    var dirname = path.dirname(workingPath);
    var extname = path.extname(workingPath);
    var basename = path.basename(workingPath, extname);

    this.push({
      oldPath: obj.oldPath,
      newPath: path.join(
        dirname,
        basename + '.' + moment().format(format) + extname
      )
    });

    cb();
  });
};