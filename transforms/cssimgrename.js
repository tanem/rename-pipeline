var through = require('through2');
var path = require('path');
var gs = require('glob-stream');
var fs = require('fs');
var escape = require('escape-string-regexp');

// mover test/ -p [renamer -s foo/]
// $ browserify -t [ foo --bar=555 ] main.js
// b.transform('foo', { bar: 555 })
// module.exports = function (file, opts) { /* opts.bar === 555 */ }
// options.glob

// options.s for source files
// note this only replaces basenames! not folder.
module.exports = function(options){
  return through.obj(function(chunk, encoding, callback){

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
          var regex = new RegExp('(url\\(.*?\/)' + escape(oldBasename) + '(\\..+?\\))', 'g');
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