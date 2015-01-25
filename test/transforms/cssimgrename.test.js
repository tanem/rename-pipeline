var test = require('tape');
var through = require('through2');
var Readable = require('stream').Readable;
var path = require('path');
var fs = require('fs');
var os = require('os');
var cssimgrename = require('../../transforms/cssimgrename');

var cssPath = path.join(os.tmpdir(), 'styles.css');

fs.writeFileSync(
  cssPath,
  'body { background: url("./pic.jpg"); color: green; }'
);

test('should update img urls in css files', function(t){
  t.plan(2);
  
  var oldPath = path.join(os.tmpdir(), 'pic.jpg');
  var newPath = path.join(os.tmpdir(), 'pic.12345.jpg');
  
  var rs = new Readable({ objectMode: true });
  rs.push({
    oldPath: oldPath,
    newPath: newPath
  });
  rs.push(null);
  rs.pipe(cssimgrename({ s: cssPath }))
    .pipe(through.obj(function(chunk, encoding, callback){
      t.deepEqual(chunk, {
        oldPath: oldPath,
        newPath: newPath
      });
      t.equal(
        fs.readFileSync(cssPath, { encoding: 'utf-8' }),
        'body { background: url("./pic.12345.jpg"); color: green; }'
      );
      callback();
    }));
});