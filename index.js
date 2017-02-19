#!/usr/local/bin/node

const { spawn } = require('child_process');
const path = require('path');

const chokidar = require('chokidar');
const debounce = require('lodash.debounce');

let args = [];

let _process;

process.chdir(process.cwd().substring(0, process.cwd().indexOf('/node_modules')));

let config = {};

try {
    config = require(path.resolve(process.cwd(), '.nwdp.js'));
} catch (e) {
    console.log(e);
}

if (process.env.NODE_OPTIONS) {
    args.unshift(process.env.NODE_OPTIONS);
}

if (config.nodeArgv) {
    args = args.concat(config.nodeArgv);
}

if (config.entryPoint) {
    args.push(config.entryPoint);
}

if (config.appArgv) {
    args = args.concat(config.appArgv);
}

function _spawn() {
    if (_process) {
        _process.kill();
    }

    _process = spawn(config.exec || 'node', args);

    _process.stdout.on('data', config.stdout || function (data) {
                           process.stdout.write(data);
                       });

    _process.stderr.on('data', config.stderr || function (data) {
                           process.stderr.write(data);
                       });
}

let fn = () => {
    _spawn();
};

if (config.debounce) {
    fn = debounce(fn, config.debounce);
}

chokidar.watch(config.filesToWatch || process.cwd()).on('all', fn);
