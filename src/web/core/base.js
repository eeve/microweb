import { firstUpperCase } from '../../utils'

export class BaseClass {
  _CurrentApp // APP
  _Log // 当前controller专属日志对象

  constructor (app) {
    this._CurrentApp = app
    this._Log = app.logger.child({ widget_type: this.constructor.name })
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
   * 当前app
   */
  get app () {
    return this._CurrentApp
  }

  /**
   * 根据服务名称获取服务实例
   * @param {string} name 服务名称
   */
  __getServiveInstanceByName__ (name) {
    return this._CurrentApp._Services.get(name)
  }

  /**
   * 获取服务实例
   * @param {string} sname 服务名。首字母小写
   */
  getService (sname) {
    return this.__getServiveInstanceByName__(firstUpperCase(sname))
  }
}
