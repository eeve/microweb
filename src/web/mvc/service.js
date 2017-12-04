import _ from 'lodash'
import { ServiceError } from './error'

export class BasicService {
  Model
  constructor (model) {
    if (!_.isFunction(model) || !_.isObject(model)) {
      throw new ServiceError('model is‘t a Bookshelf.Model')
    }
    this.Model = model
  }

  model (...args) {
    return this.Model.forge(...args)
  }

  __getPk__ () {
    return this.Model.idAttribute || 'id'
  }

  __checkPk__ (dto) {
    if (!dto[this.__getPk__()]) {
      throw new ServiceError('can‘t find pk.')
    }
  }
}

export class Service extends BasicService {
  find (vo) {
    return this.model().fetchAll()
  }

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

  add (dto) {
    return this.model(dto).save()
  }

  update (dto) {
    this.__checkPk__(dto)
    return this.model(dto).save()
  }

  delete (dto) {
    this.__checkPk__(dto)
    return this.model(dto).destroy()
  }
}
