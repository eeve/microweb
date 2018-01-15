export default {
  appName: 'microapp',
  port: 3000,
  prefix: '/api',
  probe: false,
  cors: {
    // Access-Control-Allow-Origin
    // Access-Control-Allow-Methods
    // Access-Control-Expose-Headers
    // Access-Control-Allow-Headers
    // Access-Control-Max-Age
    // Access-Control-Allow-Credentials
    // https://github.com/koajs/cors/blob/master/index.js#L4
  },
  log_file: 'log/run.log',
  log_level: 'debug',
  upload_dir: 'uploads',
  static: {
    '/files': 'uploads'
  }
}
