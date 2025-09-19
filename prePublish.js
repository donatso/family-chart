import { execSync, spawn } from 'child_process';

console.log('Deploying documentation...................');
execSync('yarn run docs:deploy', { stdio: 'inherit' });

console.log('Building...................');
execSync('yarn run build', { stdio: 'inherit' });

console.log('Running dev................');
const runDev = spawn('yarn', ['run', 'dev', '--port', '8080'], { stdio: 'inherit' });

console.log('Running test-run.............');
execSync('yarn run test-run', { stdio: 'inherit' });

console.log('Killing dev................');
runDev.kill();