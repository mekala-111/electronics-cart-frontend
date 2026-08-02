/**
 * PM2 — Electronics Cart storefront (Next.js)
 * Usage: pm2 startOrReload deployment/ecosystem.config.js --env production --update-env
 */
module.exports = {
  apps: [
    {
      name: "ec-web",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3050 -H 0.0.0.0",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3050",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3050",
      },
      max_memory_restart: "768M",
      kill_timeout: 10_000,
      exp_backoff_restart_delay: 200,
      out_file: "logs/web-out.log",
      error_file: "logs/web-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
