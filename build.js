const fs = require('fs');
const execSync = require('child_process').execSync;

const COMMENT = '//[remove_before_rollup]';

function beforeRollup() {
  const script = fs.readFileSync('./src/d3.js', 'utf-8')
  fs.writeFileSync('./src/d3.js', script.replace(COMMENT, ''), 'utf-8');
}

function rollup() {
  execSync('rollup -c', { encoding: 'utf-8' });
}

function afterRollup() {
  const script = fs.readFileSync('./src/d3.js', 'utf-8')
  fs.writeFileSync('./src/d3.js', COMMENT+script, 'utf-8');
}

beforeRollup();
rollup();
afterRollup();
