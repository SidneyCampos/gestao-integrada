const { spawn } = require('child_process');

const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'build', '--', '--watch'], {
  cwd: __dirname + '/frontend',
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
