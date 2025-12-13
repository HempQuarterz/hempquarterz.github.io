/**
 * PM2 Ecosystem Configuration for All4Yah
 *
 * Usage:
 *   pm2 start ecosystem.config.js           # Start all apps
 *   pm2 start ecosystem.config.js --only all4yah-api  # Start backend only
 *   pm2 reload ecosystem.config.js          # Zero-downtime reload
 *   pm2 stop ecosystem.config.js            # Stop all apps
 *   pm2 delete ecosystem.config.js          # Remove from PM2
 *
 * Monitoring:
 *   pm2 logs all4yah-api                    # View logs
 *   pm2 monit                               # Real-time dashboard
 *   pm2 status                              # Process status
 */

module.exports = {
  apps: [
    {
      // Backend API Server (LSI Proxy)
      name: 'all4yah-api',
      script: 'backend/server.js',
      cwd: '/var/www/All4Yah',

      // Process settings
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/all4yah-api-error.log',
      out_file: '/var/log/pm2/all4yah-api-out.log',
      merge_logs: true,

      // Restart behavior
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],

  // Deployment configuration for remote servers
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-vps-ip'],
      ref: 'origin/master',
      repo: 'https://github.com/HempQuarterz/hempquarterz.github.io.git',
      path: '/var/www/All4Yah',
      'pre-deploy-local': '',
      'post-deploy':
        'cd frontend && npm install --legacy-peer-deps && npm run build:production && ' +
        'cd ../backend && npm install && ' +
        'pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },

    staging: {
      user: 'deploy',
      host: ['your-staging-ip'],
      ref: 'origin/develop',
      repo: 'https://github.com/HempQuarterz/hempquarterz.github.io.git',
      path: '/var/www/All4Yah-staging',
      'post-deploy':
        'cd frontend && npm install --legacy-peer-deps && npm run build && ' +
        'cd ../backend && npm install && ' +
        'pm2 reload ecosystem.config.js --env development'
    }
  }
};
