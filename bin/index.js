#!/usr/bin/env node

"use strict"

var fs = require('fs')
var path = require('path')

var minimist = require('minimist')

var lsr = require('lsr')
var mkdirp = require('mkdirp')
var once = require('once')

var BOILERPLATE_DIR = path.resolve(__dirname, '..', 'boilerplate')

var argv = minimist(process.argv, { alias: { h: 'help' } })
var cmd = argv._[2]

if (cmd === 'init') {
  var dest = process.cwd()
  cpr(BOILERPLATE_DIR, dest, function(err, files) {
    if (err) return done(err, files)
    fs.chmod(path.resolve(process.cwd(), 'index.js'), '755', function(err) {
      return done(err, files)
    })
  })
} else if (cmd === 'new') {
  var name = argv._[3]
  if (!name) return done(new Error('exercise name required.'))
  var dest = path.resolve(process.cwd(), 'exercises', name)
  mkdirp(dest, function(err) {
    if (err) return done(err)
    cpr(path.resolve(BOILERPLATE_DIR, 'exercises', 'example'), dest, done)
  })
} else {
  console.log(usage())
  process.exit(1)
}

function cpr(src, dest, fn) {
  var files = []
  var done = once(function(err) {
    fn(err, files)
  })
  lsr(src, function (err, res) {
    if (err) return done(err)
    var pending = 0
    res.forEach(function(item) {
      var destPath = path.resolve(dest, item.path)
      if (item.isDirectory()) {
        pending++
        if (fs.existsSync(destPath)) {
          process.nextTick(function() {
            --pending || done()
          })
          return
        }
        mkdirp(destPath, function(err) {
          if (err) return done(err)
          --pending || done()
        })
      } else if (item.isFile()) {
        pending++
        if (fs.existsSync(destPath)) {
          process.nextTick(function() {
            --pending || done()
          })
          return
        }
        fs.createReadStream(item.fullPath).pipe(fs.createWriteStream(destPath))
        .on('error', done)
        .on('finish', function() {
          files.push(destPath)
          --pending || done()
        })
      }
    })
  })
}

function done(err, files) {
  files = files || []
  files = files.map(function(file) {
    return path.relative(process.cwd(), file)
  }).sort()
  console.log(files.join('\n'))
  if (err) {
    console.error(err)
    console.error(usage())
    process.exit(1)
    return
  }
}

function usage() {
  return [
    '  Usage:',
    '    adventure-map init         Bootstrap current directory.',
    '    adventure-map new [name]   Bootstrap new exercise with [name].'
  ].join('\n')
}
