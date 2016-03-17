'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkExists = checkExists;
exports.readPackageJson = readPackageJson;
exports.writePackageJson = writePackageJson;
exports.getBabelPresets = getBabelPresets;

var _lodash = require('lodash');

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_bluebird2.default.promisifyAll(_fs2.default);

var CWD = process.cwd();
var PACKAGE_PATH = (0, _path.join)(CWD, 'package.json');

_fs2.default.existsAsync = function (path) {
  return _fs2.default.openAsync(path, "r").then(function (stats) {
    return true;
  }).catch(function (stats) {
    return false;
  });
};

function checkExists(file) {
  return _fs2.default.existsAsync(file).then(function (exists) {
    if (!exists) throw new Error('package.json does not exist in dir ' + CWD);
    return exists;
  });
}

function readPackageJson(file) {
  return _fs2.default.readFileAsync(PACKAGE_PATH, 'utf8').then(function (file) {
    try {
      return JSON.parse(file);
    } catch (e) {
      throw new Error('package.json contains invalid JSON');
    }
  });
}

function writePackageJson(file, content) {
  content = JSON.stringify(content, null, 2);
  return _fs2.default.writeFileAsync(PACKAGE_PATH, content, 'utf8');
}

function getBabelPresets(packageJson) {
  var deps = packageJson.devDependencies;
  var pat = /^babel-preset-/;
  return (0, _lodash.chain)(deps).keys().filter(function (dep) {
    return dep.match(pat);
  }).map(function (dep) {
    return dep.replace(pat, '');
  }).value();
}

_bluebird2.default.resolve().then(function () {
  return checkExists(PACKAGE_PATH);
}).then(function () {
  return readPackageJson(PACKAGE_PATH);
}).then(function (packageJson) {
  packageJson.babel = {};
  packageJson.babel.presets = getBabelPresets(packageJson);
  return packageJson;
}).then(function (packageJson) {
  return writePackageJson(PACKAGE_PATH, packageJson);
});