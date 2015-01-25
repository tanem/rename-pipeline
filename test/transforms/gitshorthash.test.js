var test = require('tape');
var through = require('through2');
var Readable = require('stream').Readable;
var path = require('path');
var exec = require('child_process').exec;
var os = require('os');
var fs = require('fs');
var gitshorthash = require('../../transforms/gitshorthash');

test('should append the git short hash to the filename', function(t){
  t.plan(1);
    
  exec('git show HEAD -s --format=%h', function(err, stdout, stderr){
    if (err) t.fail(err);

    var filePath = path.join(os.tmpdir(), 'a.txt');
    fs.writeFileSync(filePath, 'Hello from a');

    var rs = new Readable({ objectMode: true });  
    rs.push({ oldPath: filePath, newPath: '' });
    rs.push(null);
    rs.pipe(gitshorthash())
      .pipe(through.obj(function(chunk, encoding, callback){
        t.deepEqual(chunk, {
          oldPath: filePath,
          newPath: path.join(os.tmpdir(), 'a.' + stdout.trim() + '.txt')
        });
        callback();
      }));
  });
});