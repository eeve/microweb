import _ from 'lodash'
import { ServiceError } from './error'

export class BaseService {
}

export class BasicService extends BaseService {
  Model
  /**
   * 初始化service
   * @param {object} model 此service的基本model类
   */
  constructor (model) {
    super()
    if (!_.isFunction(model) || !_.isObject(model)) {
      throw new ServiceError('model is‘t a Bookshelf.Model')
    }
    this.Model = model
  }

  /**
   * 根据属性伪造构造一个bookshelf model对象
   * @param {object} args 属性对象
   */
  model (...args) {
    return this.Model.forge(...args)
  }

  /**
   * 获取model主键属性名
   */
  __getPk__ () {
    return this.Model.idAttribute || 'id'
  }

  /**
   * 检查model对象是否设置了主键
   * @param {object} dto model对象
   */
  __checkPk__ (dto) {
    if (!dto[this.__getPk__()]) {
      throw new ServiceError('can‘t find pk.')
    }
  }
}

export class Service extends BasicService {
  /**
   * 查询匹配vo的所有数据
   * @param {object} vo model对象，如果设置了则会where匹配
   */
  find (vo) {
    return this.model(vo).fetchAll()
  }

  /**
   * 按条件查询，并返回分页结果
   * @param {object} params { like: like条件, where: where条件, orwhere: orwhere条件, orderby: 排序, options: 其他条件，作为fetchPage的options参数 }
   */
  async findPage ({like, where, orwhere, orderby = 'desc', options = { page: 1, size: 10 }}) {
    if (options.size === Infinity) {
      options.pageSize = 99999
    } else {
      options.pageSize = options.size
    }
    const result = await this.model().query(qb => {
      if (like) {
        for (let key of Object.keys(like)) {
          qb.where(key, 'LIKE', `%${like[key]}%`)
        }
      }
      if (where) {
        const keys = Object.keys(where)
        keys.forEach(key => {
          if (where[key] instanceof Array) {
            // >,<,<=,>= ...
            const [expression, value] = where[key]
            qb.where(key, expression, value)
          } else {
            // ===
            qb.where(key, where[key])
          }
        })
      }
      if (orwhere) {
        // where 1 = 1 and ( xxx = ? or yyy = ? )
        qb.where(function () {
          let i = 0
          for (let key in orwhere) {
            const val = orwhere[key]
            if (val instanceof Array) {
              this[i === 0 ? 'whereIn' : 'orWhereIn'](key, val)
            } else {
              this[i === 0 ? 'where' : 'orWhere'](key, val)
            }
            i++
          }
        })
      }
    })
    .orderBy('id', orderby)
    .fetchPage(options)
    return { data: options.mask ? result.mask(options.mask) : result, pagination: result.pagination }
  }

  /**
   * 新增一个model到数据库
   * @param {object} dto model对象内容
   * @returns {object} 新增对象
   */
  add (dto) {
    return this.model(dto).save()
  }

  /**
   * 按条件更新一个model到数据库
   * @param {object} dto model条件对象
   * @returns {object} 更新后的对象
   */
  update (dto) {
    this.__checkPk__(dto)
    return this.model(dto).save()
  }

  /**
   * 按条件删除一个model到数据库
   * @param {object} dto model条件对象
   */
  delete (dto) {
    this.__checkPk__(dto)
    return this.model(dto).destroy()
  }
}
