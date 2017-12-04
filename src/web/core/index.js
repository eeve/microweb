import _ from 'lodash'

import Koa from 'koa'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import body from 'koa-body'
import historyApiFallback from 'koa2-history-api-fallback'
import serve from 'koa-static2'

import config from '../config'

import { ProbeController } from '../probe'
import { Router } from '../router'
import Logger from '../logger'
import { resolve, notExistMkdir } from '../../utils'

export class App {
  _KoaApp
  _Controllers = new Map()
  _Services = new Map()
  _Config
  _Log

  constructor (cfg) {
    this._Config = _.merge(config, cfg)
    this._KoaApp = new Koa()
    this.__extendctx__()

    this.logger.debug('')
    this.logger.debug('')
    this.logger.debug('*** App init ***')

    this._KoaApp.use(helmet())
    this._KoaApp.use(cors(this.settings.cors))
    let formidable = {}
    if (this.settings.upload_dir) {
      formidable = { uploadDir: resolve(this.settings.upload_dir), keepExtensions: true }
    }
    this.logger.debug('File upload directory %s', formidable.uploadDir)
    this._KoaApp.use(body({ multipart: true, formidable }))
    this.__unhandledrejectionhandler__ = this.__unhandledrejectionhandler__.bind(this)
    process.on('uncaughtException', this.__unhandledrejectionhandler__)
    process.on('unhandledRejection', this.__unhandledrejectionhandler__)
    process.on('exit', () => {
      process.removeListener('uncaughtException', this.__unhandledrejectionhandler__)
      process.removeListener('unhandledRejection', this.__unhandledrejectionhandler__)
    })
  }

  mountController (Ctrl) {
    const ctrlInstance = new Ctrl(this)
    this._Controllers.set(ctrlInstance.constructor.name, ctrlInstance)
  }

  mController (Ctrl) {
    return this.mountController(Ctrl)
  }

  mountService (Service) {
    const serviceInstance = new Service()
    this._Services.set(serviceInstance.constructor.name, serviceInstance)
  }

  mService (Service) {
    return this.mountService(Service)
  }

  use (...args) {
    return this._KoaApp.use(...args)
  }

  get Services () {
    const obj = {}
    for (let item of this._Services.entries()) {
      obj[item[0]] = item[1]
    }
    return obj
  }

  get Controllers () {
    const obj = {}
    for (let item of this._Controllers.entries()) {
      obj[item[0]] = item[1]
    }
    return obj
  }

  get context () {
    return this._KoaApp.context
  }

  get logger () {
    return this._Log
  }

  get settings () {
    return this._Config
  }

  /**
   * 启动应用服务
   */
  listen (port) {
    // pass
    this.__register__()
    // api fallback
    this._KoaApp.use(historyApiFallback({ logger: this.logger.debug.bind(this.logger) }))
    // static file
    if (Object.keys(this.settings.static).length > 0) {
      this.logger.debug('Staring file serve')
      for (let prefix in this.settings.static) {
        this.logger.debug('\t{%s} -> %s', prefix, resolve(this.settings.static[prefix]))
        this._KoaApp.use(serve(prefix, resolve(this.settings.static[prefix])))
      }
    }
    // listen
    const _port = port || this.settings.port
    this._KoaApp.listen(_port)
    this.logger.debug('App Ready. Server running at http://localhost:%d/', _port)
  }

  /**
   * 注册路由
   */
  __register__ () {
    this.__registerprobe__()
    const router = new Router()
    if (this.settings.prefix) {
      this.logger.debug('Api prefix {%s}', this.settings.prefix)
    }
    this.logger.debug('------------------------------------------')
    for (let ctrlName in this.Controllers) {
      const ctrlRouter = this.Controllers[ctrlName].router
      // api prefix
      if (this.settings.prefix) {
        ctrlRouter.prefix(this.settings.prefix)
      }
      // router
      router.use(ctrlRouter.routes(), ctrlRouter.allowedMethods())
      // print log
      const $routes = Object.getPrototypeOf(this.Controllers[ctrlName]).$routes
      this.logger.debug('%s:', ctrlName)
      if ($routes && $routes.length > 0) {
        for (const { method, url, desc } of $routes) {
          this.logger.debug('\t[%s] {%s} %s', `${method}`.toUpperCase(), url, desc)
        }
      }
    }
    this._KoaApp.use(router.routes())
    this._KoaApp.use(router.allowedMethods())
    this.logger.debug('------------------------------------------')
    return router
  }

  /**
   * 注册探针服务
   */
  __registerprobe__ () {
    if (this.settings.probe === true) {
      this.mountController(ProbeController)
    }
  }

  /**
   * 扩展context上面的方法
   */
  __extendctx__ () {
    this._KoaApp.context.getRealIP = function () {
      let ip = this.get('X-Real-IP') || this.ip
      return ip.indexOf('::ffff:') > -1 ? ip.substring(7) : ip
    }
    this._KoaApp.context.logger = this._Log = new Logger({
      name: this.settings.appName,
      src: true,
      level: this.settings.log_level,
      streams: [{
        type: 'rotating-file',
        period: '1d',   // daily rotation
        count: 3,        // keep 3 back copies
        path: notExistMkdir(resolve(this.settings.log_file))
      }]
    })
  }

  /**
   * 处理错误
   * @param {any} err Error
   */
  __unhandledrejectionhandler__ (err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err))
      // err maybe an object, try to copy the name, message and stack to the new error instance
      /* istanbul ignore else */
      if (err) {
        if (err.name) newError.name = err.name
        if (err.message) newError.message = err.message
        if (err.stack) newError.stack = err.stack
      }
      err = newError
    }
    /* istanbul ignore else */
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError'
    }
    this.logger.error(err)
  }
}
