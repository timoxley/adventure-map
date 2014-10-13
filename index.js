#!/usr/bin/env node

"use strict"

var adventure = require('adventure');
var msee = require('msee')
var fs = require('fs')
var path = require('path')
var inquirer = require('inquirer')
var wordwrap = require('wordwrap')
var assert = require('assertf')

module.exports = function(options) {
  var shop = adventure(options);
  shop.on('pass', function() {
    console.log('Type `' + options.name+ '` to show the menu.\n')
  })

  var exercises = Object.keys(options.exercises).map(function(exerciseName) {
    var dir = options.exercises[exerciseName]
    var exercise = require(dir)
    exercise.name = exerciseName
    exercise.problemRaw = exercise.problem
    exercise.problem = formatProblem(exercise.problem)
    exercise.solutionRaw = exercise.solution
    exercise.solution = formatSolution(exercise.solution)
    exercise.dir = dir
    exercise.cleanName = clean(exercise.name)
    return exercise
  })

  exercises.forEach(function(exercise) {
    assert(exercise.name, 'exercise needs name')
    assert(exercise.problem, 'exercise %s needs problem', exercise.name)
    assert(exercise.solution, 'exercise %s needs solution', exercise.name)
    assert(exercise.boilerplate, 'exercise %s needs boilerplate', exercise.name)
    assert(exercise.verify, 'exercise %s needs verify', exercise.name)
  })

  exercises.forEach(function(exercise) {
    shop.add(exercise.name, function() {
      setTimeout(function() {
        setup(exercises)
      }, 10)
      return exercise;
    })
  })
  return shop
}

function setup(exercises) {
  var boilerPlateRequired = exercises.filter(function(exercise) {
    return exercise.boilerplate
  }).filter(function(exercise) {
    return !fs.existsSync(process.cwd() + '/' + exercise.cleanName)
  }).map(function(exercise) {
    return {
      boilerplate: exercise.boilerplate,
      problem: exercise.problemRaw,
      dir: process.cwd() + '/' + exercise.cleanName
    }
  })

  if (boilerPlateRequired.length) {
    console.log('\n' + process.cwd() + '\n')
    inquirer.prompt([{
      'type': 'confirm',
      'name': 'ok',
      'default': true,
      'message': wordwrap(4, 80)(
        "We're about to populate the above directory with some files needed for the exercises." +
        "If they've already been created then don't worry, " +
        "they won't be replaced. Continue?"
      ).replace(/^\s+/, '')
    }], function(result) {
      if (!result.ok) return
      boilerPlateRequired.forEach(function(item) {
        try {
          fs.mkdirSync(item.dir)
        } catch(e) {
          // probably already exists
        }
        fs.writeFileSync(item.dir + '/Readme.md', item.problem)
        fs.writeFileSync(item.dir + '/index.js', item.boilerplate)
      })
    })
  }
}

function formatProblem(md) {
  var out = '\n' + msee.parse(md, {
    paragraphStart: '',
    paragraphEnd: '\n\n'
  }).trimRight()
  return out
}

function formatSolution(solution) {
  return msee.parse([
    'Here\'s the official solution so you can compare notes:',
    '```js',
      solution,
    '```'
  ].join('\n'))
}

function clean(name) {
  return name.trim()
    .toLowerCase()
    .replace(/[^\w]+/gm, '-')
    .replace('/','-')
}

