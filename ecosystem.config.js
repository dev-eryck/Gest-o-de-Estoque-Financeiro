module.exports = {
  apps: [
    {
      name: 'bar-do-carneiro-api',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        JWT_SECRET: process.env.JWT_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        DB_PATH: process.env.DB_PATH
      }
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:SEU_USUARIO/bar-do-carneiro.git',
      path: '/var/www/bar-do-carneiro',
      'post-deploy': 'npm install && npm run build:prod && pm2 reload ecosystem.config.js --env production'
    }
  }
};
