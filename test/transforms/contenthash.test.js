var test = require('tape');
var through = require('through2');
var Readable = require('stream').Readable;
var path = require('path');
var os = require('os');
var fs = require('fs');
var contenthash = require('../../transforms/contenthash');

test('should append the content hash to the filename', function(t){
  t.plan(1);
  
  var filePath = path.join(os.tmpdir(), 'a.txt');
  fs.writeFileSync(filePath, 'Hello from a');

  var rs = new Readable({ objectMode: true });  
  rs.push({ oldPath: filePath, newPath: '' });
  rs.push(null);
  rs.pipe(contenthash())
    .pipe(through.obj(function(chunk, encoding, callback){
      t.deepEqual(chunk, {
        oldPath: filePath,
        newPath: path.join(os.tmpdir(), 'a.dafeaa88.txt')
      });
      callback();
    }));
});