/** PM2 على VPS: cd backend && pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'clinic-api',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
