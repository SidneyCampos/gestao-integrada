module.exports = {
  apps: [
    {
      name: 'Gestao-Integrada-Backend',
      script: 'src/server.js',
      cwd: './backend',
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Gestao-Integrada-Frontend',
      script: 'watch-frontend.js',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
