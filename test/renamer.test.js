var test = require('tape');
var through = require('through2');
var path = require('path');
var os = require('os');
var fs = require('fs');
var renamePipeline = require('..');

test('should normalise files correctly when supplying them to the first transform', function(t){
  t.plan(1);

  var imgPath = path.join(os.tmpdir(), 'pic.jpg');
  fs.writeFileSync(imgPath);
  
  renamePipeline({ dryRun: true, silence: true })
    .files(imgPath)
    .transform(function(){
      return through.obj(function(chunk, enc, cb){
        t.deepEqual(
          chunk,
          { oldPath: imgPath, newPath: '' }
        )
        cb();
      });
    })
    .run();
});

test('should execute each transform in the pipeline in order', function(t){
  t.plan(1);

  var imgPath = path.join(os.tmpdir(), 'pic.jpg');
  fs.writeFileSync(imgPath);

  renamePipeline({ dryRun: true, silence: true })
    .files(imgPath)
    .transform(function(){
      return through.obj(function(chunk, enc, cb){
        this.push({
          oldPath: chunk.oldPath,
          newPath: chunk.oldPath + '.one'
        });
        cb();
      });
    })
    .transform(function(){
      return through.obj(function(chunk, enc, cb){
        this.push({
          oldPath: chunk.oldPath,
          newPath: chunk.newPath + '.two'
        });
        cb();
      });
    })
    .transform(function(){
      return through.obj(function(chunk, enc, cb){
        t.equal(chunk.newPath, imgPath + '.one.two');
        this.push({
          oldPath: chunk.oldPath,
          newPath: chunk.newPath
        });
        cb();
      })
    })
    .run();
});

test('should rename each file according the newPath value', function(t){
  t.plan(2);

  fs.writeFileSync(
    path.join(os.tmpdir(), 'renamePipeline.a.txt'),
    'Hello from a'
  );
  fs.writeFileSync(
    path.join(os.tmpdir(), 'renamePipeline.b.txt'),
    'Hello from b'
  );

  renamePipeline()
    .files(path.join(os.tmpdir(), 'renamePipeline*.txt'))
    .transform(function(){
      return through.obj(function(chunk, enc, cb){
        this.push({
          oldPath: chunk.oldPath,
          newPath: chunk.oldPath + '.foo'
        });
        cb();
      });
    })
    .run(function(){
      t.equal(
        fs.readFileSync(path.join(os.tmpdir(), 'renamePipeline.a.txt.foo'), { encoding: 'utf-8' }),
        'Hello from a'
      );
      t.equal(
        fs.readFileSync(path.join(os.tmpdir(), 'renamePipeline.b.txt.foo'), { encoding: 'utf-8' }),
        'Hello from b'
      );
    });
});