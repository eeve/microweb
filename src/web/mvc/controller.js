import _ from 'lodash'
import { firstLowerCase } from '../../utils'
import BasicController from '../router'

export class Controller extends BasicController {
  /**
   * 构造器
   * @param {App} app App
   * @param {string|array} needServices 控制器所需要的服务
   */
  constructor (app, needServices) {
    super(app)
    this.__injectServices__(needServices)
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
    if (_.isObject(sname)) {
      this.app.mountService(sname)
      sname = sname.name
    }
    this.logger.debug('√ Inject Service %s', sname)
    const serviceInstance = this.__getServiveInstanceByName__(sname)
    if (serviceInstance === undefined) {
      this.logger.error('× Unable to inject service %s', sname)
    }
    this[firstLowerCase(sname)] = serviceInstance
  }
}
