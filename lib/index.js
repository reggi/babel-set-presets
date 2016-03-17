#!/usr/bin/env node

import { chain } from 'lodash';
import { join } from 'path';
import fs from 'fs';
import Promise from 'bluebird';

Promise.promisifyAll(fs);

const CWD = process.cwd();
const PACKAGE_PATH = join(CWD, 'package.json');

fs.existsAsync = function (path) {
  return fs.openAsync(path, "r").then(function (stats) {
    return true;
  }).catch(function (stats) {
    return false;
  });
};

export function checkExists(file) {
  return fs.existsAsync(file).then(exists => {
    if (!exists) throw new Error(`package.json does not exist in dir ${ CWD }`);
    return exists;
  });
}

export function readPackageJson(file) {
  return fs.readFileAsync(PACKAGE_PATH, 'utf8').then(file => {
    try {
      return JSON.parse(file);
    } catch (e) {
      throw new Error('package.json contains invalid JSON');
    }
  });
}

export function writePackageJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return fs.writeFileAsync(PACKAGE_PATH, content, 'utf8');
}

export function getBabelPresets(packageJson) {
  let deps = packageJson.devDependencies;
  let pat = /^babel-preset-/;
  return chain(deps).keys().filter(dep => dep.match(pat)).map(dep => dep.replace(pat, '')).value();
}

Promise.resolve().then(() => checkExists(PACKAGE_PATH)).then(() => readPackageJson(PACKAGE_PATH)).then(packageJson => {
  packageJson.babel = {};
  packageJson.babel.presets = getBabelPresets(packageJson);
  return packageJson;
}).then(packageJson => writePackageJson(PACKAGE_PATH, packageJson));