var through = require('through2');

module.exports = function(){
  return through.obj(function(chunk, encoding, callback){
    this.push({
      oldPath: chunk.path,
      newPath: ''
    });
    callback();
  });
};