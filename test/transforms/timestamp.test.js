var test = require('tape');
var through = require('through2');
var Readable = require('stream').Readable;
var path = require('path');
var moment = require('moment');
var os = require('os');
var fs = require('fs');
var timestamp = require('../../transforms/timestamp');

test('should append the default timestamp to the filename', function(t){
  t.plan(1);
  
  var filePath = path.join(os.tmpdir(), 'a.txt');
  fs.writeFileSync(filePath, 'Hello from a');

  var rs = new Readable({ objectMode: true });
  rs.push({ oldPath: filePath, newPath: '' });
  rs.push(null);
  rs.pipe(timestamp())
    .pipe(through.obj(function(chunk, encoding, callback){
      t.deepEqual(chunk, {
        oldPath: filePath,
        newPath: path.join(os.tmpdir(), 'a.' + moment().format('YYYYMMDD-HHmm') + '.txt')
      });
      callback();
    }));
});

test('should append a custom timestamp to the filename', function(t){
  t.plan(1);
  
  var filePath = path.join(os.tmpdir(), 'a.txt');
  fs.writeFileSync(filePath, 'Hello from a');

  var rs = new Readable({ objectMode: true });
  rs.push({ oldPath: filePath, newPath: '' });
  rs.push(null);
  rs.pipe(timestamp({ formatString: 'HHmm'}))
    .pipe(through.obj(function(chunk, encoding, callback){
      t.deepEqual(chunk, {
        oldPath: filePath,
        newPath: path.join(os.tmpdir(), 'a.' + moment().format('HHmm') + '.txt')
      });
      callback();
    }));
});