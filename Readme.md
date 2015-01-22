# adventure-map

<img align="right" src="https://cloud.githubusercontent.com/assets/43438/4612060/79cb38f0-52c2-11e4-9bc8-87cb0b355666.png"/>

Tools with sensible defaults for guiding the creation of [adventures](https://github.com/substack/adventure).

* Adds syntax highlighting and colour when printing problem description.
* Prints syntax highlighted solution on completion of an exercise.
* Adds support for setting up exercise boilerplate.
* Generates a bootstrapped directory for user's solution in cwd on exercise start.
* Includes copy of problem description in generated solution directory for user.

Also includes optional code generators:

* Minimal bootstrap code for starting to build a new adventure (~20 LOC).
* Bootstrap an exercise with a few [default files](https://github.com/timoxley/adventure-map/tree/dfecf9ec22152216e7e3ba61c6150bde2dee5596/boilerplate/exercises/example) for an exercise (`Readme.md`, `bootstrap.js`, `solution.js` & `verify.js`)

I normally *hate* code generators so I've tried to make the code generation spit out the most unopinionated code that you probably would have written anyway. All generated code is extremely simple and makes minimal assumptions. You can safely and easily modify the generated code to work however you wish.

## CLI Usage

```
> adventure-map --help
  Usage:
    adventure-map init         Bootstrap current directory.
    adventure-map new [name]   Bootstrap new exercise with [name].
```

## Generating Adventures

You can use `adventure-map` to generate the minimal boilerplate for an
entire adventure. It includes a bootstrap file to load all the exercises
and an example exercise to use as a guide.

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

By default, exercises are loaded as `"name": "relative/path/to/exercise"` pairs
from your package.json. You need to add exercises to the package.json manually.

```json
{
  "name": "test-adventure",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "adventure-map": "1.0.0"
  },
  "exercises": {
    "Getting Started": "exercises/example"
  }
}
```
If you don't like this convention of loading from the package.json,
just change where the exercises load from, it's one line of code in
the bootstrap code (see below).

After you've configured at least one exercise, can start your adventure:

```
> node index.js
```

![image](https://cloud.githubusercontent.com/assets/43438/4608128/f6e40db2-5272-11e4-8ff4-7c2347badf27.png)

## Adventure Bootstrap Code

The adventure bootstrap simply finds the exercises defined in your
package.json and loads them into adventure.

```js
#!/usr/bin/env node

var path = require('path')
var adventureMap = require('adventure-map')
var pkg = require('./package.json')

// resolve all package.json exercises relative
// to this directory.
Object.keys(pkg.exercises).forEach(function(name) {
  pkg.exercises[name] = path.resolve(__dirname, pkg.exercises[name])
})

var adventure = adventureMap(pkg)

// auto-execute if run from commandline
if (!module.parent) adventure.execute(process.argv.slice(2))

// export for manual execution
module.exports = adventure
```

### Important

The boilerplate is just provided as a starting point, don't feel bad
about changing any of the generated code.

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
text for you, and provide a verify stub.

## Exercise Bootstrap Code

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

exports.run = function() {
  // TODO
}
```

## API Usage

You don't need to use the generated boilerplate in order to
use adventure-map! Just pass it the adventure name and a mapping of
exercise names and corresponding exercise paths.

You'll be passed back a [substack/adventure](https://github.com/substack/adventure)
instance.

```js
var r = require('path').resolve
var adventureMap = require('adventure-map')

var adventure = adventureMap({
  name: 'test-adventure',
  exercises: {
    'Getting Started': r(__dirname, 'exercises/getting-started'),
    'Learning Things': r(__dirname, 'exercises/learning-things')
  }
})

adventure.execute(process.argv.slice(2))
```


## Exercise Format

`adventure-map` exercises follow the same format as `adventure`
exercises, with an additional `boilerplate` property:

```js
module.exports = {
  problem: 'problem text',
  solution: 'solution code',
  boilerplate: 'boilerplate code' // optional
  verify: function(args, cb) {
    // insert validation logic
    cb(false) // true if submission good
  },
  run: function() {
    // optional 'run' logic
  }
}
```

# Credit

* Map logo designed by Ruben Verhasselt from the [thenounproject.com](http://thenounproject.com).
* Big thanks to substack for the creation of [adventure](https://github.com/substack/adventure).

# License

MIT
