import KoaRouter from 'koa-router'
import formatParamsMiddleware from './middleware/format_params'
import * as methods from './decorator/router'
import { BaseClass } from '../core/base'

export default class BasicController extends BaseClass {
  constructor (args) {
    super(args)

    this.router = new KoaRouter()
    if (this.$routes !== undefined) {
      for (const { method, url, middleware, fnName } of this.$routes) {
        // 所有middleware -+> 参数格式化middleware
        this.router[method](url, ...[ ...middleware, formatParamsMiddleware ], this[fnName].bind(this))
      }
    }
  }
}

export const Router = KoaRouter
export const rt = methods
export * from './middleware/params'
