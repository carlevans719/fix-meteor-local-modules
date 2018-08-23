#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process') 

const localModules = {}
const { dependencies } = require(path.join(process.cwd(), 'package.json'))

for (let package in dependencies) {
  if (dependencies[package].slice(0, 5) === 'file:') {
    localModules[package] = dependencies[package].slice(5)
  }
}

const nodeModulesDir = path.join(process.cwd(), 'node_modules')
if (!fs.existsSync(nodeModulesDir)) {
  throw new Error('Couldn\'t find node_modules folder')
}

let destDir = path.join(
  process.argv.slice(2).shift(),
  'bundle', 'programs', 'server', 'npm', 'node_modules'
)

destDir = path.isAbsolute(destDir)
  ? destDir
  : path.resolve(process.cwd(), destDir)

if (!fs.existsSync(destDir)) {
  throw new Error('Couldn\'t find destination folder: ' + destDir)
}

for (let package in localModules) {
  const srcDir = path.resolve(process.cwd(), localModules[package])
  const moduleDir = path.join(destDir, package.replace(/\//g, path.sep))

  const parts = package.split('/')
  let currPath = destDir
  for (const part of parts) {
    currPath = path.join(currPath, part)
    if (!fs.existsSync(currPath)) {
      fs.mkdirSync(currPath)
    }
  }

  console.log(`Copying from ${srcDir}/. to ${moduleDir}/.`)
  spawnSync('cp', ['-r', srcDir + path.sep + '.', moduleDir + path.sep + '.'])
}
