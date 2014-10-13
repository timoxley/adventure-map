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
