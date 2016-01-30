#!/usr/bin/env node

"use strict"

var adventure = require('adventure')
var msee = require('msee')
var fs = require('fs')
var path = require('path')
var inquirer = require('inquirer')
var wordwrap = require('wordwrap')
var assert = require('assertf')
var fs = require('fs');

module.exports = function(options) {
  // Prevent automatic close of stdin, so that input is possible after showing the problem description.
  //options.autoclose = false
  var shop = adventure(options)
  var execute = shop.execute;
  //record firstrun
  shop.files.firstrun = path.join(shop.datadir, 'firstrun.json');
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
    assert(exercise.verify, 'exercise %s needs verify', exercise.name)
  })

  exercises.forEach(function(exercise) {
    shop.add(exercise.name, function() {
      return exercise;
    })
  })

  shop.execute = function(args){
    var beenRunPath = path.join(this.datadir, 'has_been_run');
    fs.stat(beenRunPath,function(err, stats){
      if(err){ //first run, prompt for boilerplate
        fs.writeFile(beenRunPath, 'yep',function(){});
        setup(exercises, function(){
          execute.call(shop,[].slice.apply(args));
        });
      }else{
        execute.call(shop,[].slice.apply(args));
      }
    });
  };

  return shop
}

function setup(exercises, done) {
  var boilerPlateRequired = exercises.filter(function(exercise) {
    return exercise.boilerplate
  }).map(function(exercise) {
    return {
      boilerplate: exercise.boilerplate,
      problem: exercise.problemRaw,
      dir: process.cwd() + '/' + exercise.cleanName
    }
  })

  if (boilerPlateRequired.length) {
    inquirer.prompt([{
      'type': 'confirm',
      'name': 'ok',
      'default': true,
      'message': wordwrap(4, 80)(
        "Welcome! These exercises have some boilerplate files/directories included to help " +
        "you get started with each exercise. They are helpful but not necessary. " +
        "If you'd like to have them created now (in the current directory) enter 'Y'. " +
        "If you'd like to start without boilerplate files enter 'n'\n"
      ).replace(/^\s+/, '')
    }], function(result) {
      if (!result.ok) return done();
      boilerPlateRequired.forEach(function(item) {
        try {
          console.log('Creating directory ' + item.dir);
          fs.mkdirSync(item.dir)
        } catch(e) {
          // probably already exists
        }
        fs.writeFileSync(item.dir + '/Readme.md', item.problem)
        fs.writeFileSync(item.dir + '/index.js', item.boilerplate)
      })
      inquirer.prompt([{
        'type': 'confirm',
        'name': 'ok',
        'default': true,
        'message': "Boilerplate files created! Launch exercises? (press enter for yes)"
        }], function(res){
          if(res.ok) return done();
          process.exit(0);
      });
    });
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

