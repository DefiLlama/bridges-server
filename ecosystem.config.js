module.exports = {
  apps: [
    {
      name: "bridges-server",
      script: "dist/index.cjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      restart_delay: 4000,
      kill_timeout: 3000,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
    },
  ],
};
