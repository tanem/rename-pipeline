var through = require('through2');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

module.exports = function(){
  return through.obj(function(chunk, encoding, callback){

    var hash = crypto.createHash('md5');
    var workingPath = chunk.newPath || chunk.oldPath;
    var dirname = path.dirname(workingPath);
    var extname = path.extname(workingPath);
    var basename = path.basename(workingPath, extname);
    var rs = fs.createReadStream(workingPath);

    hash.setEncoding('hex');

    rs.on('end', function(){
      hash.end();
      this.push({
        oldPath: chunk.oldPath,
        newPath: path.join(
          dirname,
          basename + '.' + hash.read().slice(0, 8) + extname
        )
      });
      callback();
    }.bind(this));

    rs.pipe(hash);

  });
};