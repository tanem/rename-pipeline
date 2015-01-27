var through = require('through2');
var path = require('path');
var gs = require('glob-stream');
var fs = require('fs');
var escape = require('escape-string-regexp');

module.exports = function(options){
  return through.obj(function(chunk, encoding, callback){

    options || (options = {});
    
    var self = this;
    var oldBasename = getBasename(chunk.oldPath);
    var newBasename = getBasename(chunk.newPath);

    if (!newBasename || oldBasename === newBasename || options.dryRun) {
      this.push(chunk);
      return callback();
    }

    var isFileFindComplete = false;
    var filesToProcess = 0;

    gs.create(options.s)
      .pipe(processFile())
      .on('finish', function(){
        isFileFindComplete = true;
        complete();
      });

    function getBasename(workingPath) {
      var dirname = path.dirname(workingPath);
      var extname = path.extname(workingPath);
      return path.basename(workingPath, extname);
    }

    function processFile() {
      return through.obj(function(chunk, encoding, callback){
        filesToProcess++;
        var filePath = chunk.path;
        fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data){
          if (err) throw err;
          var regex = new RegExp('(url\\(.*?)' + escape(oldBasename) + '(\\..+?\\))', 'g');
          data = data.replace(regex, '$1' + newBasename + '$2');
          fs.writeFile(filePath, data, function(err){
            if (err) throw err;
            filesToProcess--;
            complete();
          });
        });
        callback();
      });
    }

    function complete() {
      if (!filesToProcess && isFileFindComplete) {
        self.push(chunk);
        callback();
      }
    }

  });

};