import _ from 'lodash'
import { firstLowerCase } from '../../utils'
import BasicController from '../router'

export class Controller extends BasicController {
  _CurrentApp // APP
  _Log // 当前controller专属日志对象

  /**
   * 构造器
   * @param {App} app App
   * @param {string|array} needServices 控制器所需要的服务
   */
  constructor (app, needServices) {
    super()
    this._CurrentApp = app
    this._Log = app.logger.child({ widget_type: this.constructor.name || 'Controller' })
    this.__injectServices__(needServices)
  }

  /**
   * 日志对象
   */
  get logger () {
    return this._Log
  }

  /**
   * 应用配置信息
   */
  get config () {
    return this._CurrentApp.settings
  }

  /**
   * 根据服务名称获取服务实例
   * @param {string} name 服务名称
   */
  __getServiveInstanceByName__ (name) {
    return this._CurrentApp._Services.get(name)
  }

  /**
   * 往controller中注入一个或多个服务
   * @param {string|array} services 服务名称
   */
  __injectServices__ (services) {
    if (!services || (!_.isArray(services) && !_.isString(services))) { return }
    _.isString(services) && this.__injectOneServices__(services)
    _.isArray(services) && services.forEach(sname => {
      this.__injectOneServices__(sname)
    })
  }

  /**
   * 往controller中注入一个服务
   * @param {string} sname 服务名称
   */
  __injectOneServices__ (sname) {
    this.logger.debug('√ Inject Service %s', sname)
    const serviceInstance = this.__getServiveInstanceByName__(sname)
    if (serviceInstance === undefined) {
      this.logger.error('× Unable to inject service %s', sname)
    }
    this[firstLowerCase(sname)] = serviceInstance
  }
}
