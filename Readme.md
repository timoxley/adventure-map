# adventure-map

Pass an object mapping exercise names to exercise files,
adventure-map will generate an adventure for you.

## Features
* Adds syntax highlighting and colour to your exercise.
* Adds syntax highlighting and colour to your exercise.


In addition to exercises should follow the format:

module.exports = {
  problem: 'problem text',
  solution: 'solution code',
  boilerplate: 'boilerplate code'
  verify: function(args, cb) {
    // insert validation logic
    cb(false) // true if submission good
  },
  run: function() {
    // optional 'run' logic
  }
}

## Generating Exercises

You can use `adventure-map` to generate the required boilerplate for an
exercise:

```
> adventure-map new getting-started
exercises/getting-started/Readme.md
exercises/getting-started/boilerplate.js
exercises/getting-started/index.js
exercises/getting-started/solution.js
```

The exercise's script will load up the Readme, boilerplate and solution
text for you, and provide a verify stub for you:

### index.js
```js
"use strict"

var fs = require('fs')
var path = require('path')

exports.problem = fs.readFileSync(__dirname + '/Readme.md', 'utf8')
exports.solution = fs.readFileSync(__dirname + '/solution.js', 'utf8')
exports.boilerplate = fs.readFileSync(__dirname + '/boilerplate.js', 'utf8')

var solution = require('./solution')

exports.verify = function(args, cb) {
  var submission = require(path.resolve(process.cwd(), args[0]))
  // insert validation logic
  cb(false) // true if submission good
}

exports.run // TODO
```

## Generating Adventures

You can use `adventure-map` to generate some simple boilerplate for an
entire adventure:

```
> mkdir test-adventure
> cd test-adventure
> npm init -f
> npm install --save adventure-map
> adventure-map init
exercises/example/Readme.md
exercises/example/boilerplate.js
exercises/example/index.js
exercises/example/solution.js
index.js
```

The adventure boilerplate simply finds the exercises defined in your
package.json and loads them into adventure:

```js
#!/usr/bin/env node

var path = require('path')
var adventureMap = require('adventure-map')
var pkg = require('./package.json')

Object.keys(pkg.exercises).forEach(function(name) {
  pkg.exercises[name] = path.resolve(__dirname, pkg.exercises[name])
})

var adventure = adventureMap(pkg)

if (!module.parent) adventure.execute(process.argv.slice(2))

module.exports = adventure
```

Note you need to add exercises to your package.json manually:

```json
{
  "name": "test-adventure",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "adventure-map": "1.0.0"
  },
  "exercises": {
    "Getting Started": "exercises/getting-started",
    "Learning Things": "exercises/learning-things"
  }
}
```

# License

MIT
