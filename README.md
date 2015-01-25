# rename-pipeline

[![Build Status](https://travis-ci.org/tanem/rename-pipeline.png?branch=master)](https://travis-ci.org/tanem/rename-pipeline)
[![NPM version](https://badge.fury.io/js/rename-pipeline.svg)](http://badge.fury.io/js/mkclog)

Apply transforms to rename files.

```
Usage: rename-pipeline [source files] {OPTIONS}

Examples:
  rename-pipeline ./src/*.js -t contenthash
  rename-pipeline ./src/**/*.jpg -t gitshorthash -t [ cssimgrename -s ./src/**/*.css ]

Options:
  -t, --transform  Apply a transform to the file [required]
  -h, --help       Show this message

Passing arguments to transforms:

  For -t, you can use subarg syntax to pass options to the
  transforms as the second parameter. For example:

    -t [ foo -x 3 -y ]

  will call the `foo` transform with the following options:

    { x: 3, y: true }
```

## Installation

```
$ npm install -g rename-pipeline
```

## Example

[Globs](https://github.com/isaacs/node-glob#glob-primer) can be used to denote source files:

```
$ rename-pipeline ./src/*.js -t contenthash
```

To perform multiple transforms on a set of files:

```
$ rename-pipeline ./src/*.js -t contenthash -t timestamp
```

To pass options to individual transforms, you can use subarg syntax:

```
$ rename-pipeline ./src/*.jpg -t gitshorthash -t [ cssimgrename -s ./src/*.css ]
```

## API

```js
var renamePipeline = require('rename-pipeline');
```

### var r = renamePipeline()

Initialise a new `RenamePipeline`.

### r.files(files:String)

Set the files to be transformed as a glob.

### r.transform(transform:Object|Function)

Add a transform to the pipeline.

A transform can be either an object denoting which transform to use, plus any options:

```js
r.transform({ name: 'contenthash' });
r.transform({ name: 'cssimgrename', options: { s: './src/*.css' } });
```

Or it can be a function that returns a transform stream:

```js
r.transform(function(){
  return through(function(chunk, enc, cb){
    this.push('foo');
    cb();
  });
});
```

### r.dryRun(dryRun:Boolean)

If true, the result of the rename transforms will be printed to stdout, but no actual renaming will occur.

### r.run(done:Function)

Run the transform pipeline, executing the optional done callback when complete.

## Tests

```
$ npm test
```







