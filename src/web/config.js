export default {
  appName: 'microapp',
  port: 3000,
  prefix: '/api',
  probe: false,
  cors: {},
  log_file: 'log/run.log',
  log_level: 'debug',
  upload_dir: 'uploads',
  static: {
    // '/files': resolve('uploads')
  }
}
