import fs from 'fs';
import {execSync} from 'child_process';


function beforeRollup() {
}

function rollup() {
  execSync('rollup -c', { encoding: 'utf-8' });
}

function afterRollup() {
  // copy styles directory
  fs.cpSync('./src/styles', './dist/styles', {recursive: true});
}

beforeRollup();
rollup();
afterRollup();
