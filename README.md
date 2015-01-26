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
  -d, --dryrun     Print the result of the rename transforms to stdout, without
                   actually renaming the files
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

## Examples

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

## Transforms

There are a few built-in transforms, but the intention is for these to become separate modules that aren't included in this repo.

### contenthash

Append a hash of the file contents:

```
/lib/normalise.js -> /lib/normalise.f93e7a76.js
```

The hash algorithm defaults to `md5`. The hash encoding defaults to `hex`. These can be changed via the command-line:

```
$ rename-pipeline ./src/*.js -t [ contenthash -a sha1 -e hex ]
```

Or via the API:

```js
r.transform({
  name: 'contenthash',
  options: {
    algorithm: 'sha1',
    encoding: 'hex'
  }
});
```

### gitshorthash

Append the git short version hash of `HEAD`:

```
/lib/normalise.js -> /lib/normalise.61949eb.js
```

### timestamp

Append the timestamp (uses [moment](http://momentjs.com/) and defaults to `YYYYMMDD-HHmm`):

```
/lib/normalise.js -> /lib/normalise.20150126-1214.js
```

### cssimgrename

Rename images within css files, based on the current file's new basename.

For a file that is being renamed to `pic.12345.jpg`, the following CSS:

```css
body {
  background: url("./pic.jpg");
  color: green;
}
```

Will be transformed to:

```css
body {
  background: url("./pic.12345.jpg");
  color: green;
}
```

## Tests

```
$ npm test
```
