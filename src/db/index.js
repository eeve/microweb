import knex from 'knex'
import bookshelf from 'bookshelf'
import moment from 'moment'
import mask from 'bookshelf-mask'
import json from 'bookshelf-json-columns'

export const dbs = {}

export function registerDataBase (key, type, config, extraConf = {}) {
  if (dbs[key]) { throw new Error('数据库key已经被使用') }
  if (!type) { throw new Error('不支持的数据库类型') }
  const Knex = knex({
    client: 'mysql',
    connection: config
  })
  const Orm = bookshelf(Knex)
  Orm.plugin('pagination')
  Orm.plugin('visibility')
  Orm.plugin(mask)
  Orm.plugin(json)
  dbs[key] = { key, config, extraConf, Knex, Orm }

  // 同步数据库结构
  const proto = Object.getPrototypeOf(Knex.schema)
  proto._createTableIfNotExists = function (tableName, callback) {
    Knex.schema.hasTable(tableName).then(exists => {
      if (exists) { return }
      Knex.schema.createTableIfNotExists(tableName, callback).then(() => {
        console.log(`${tableName} ddl upgrade.`)
      })
    })
    return this
  }

  class BaseModel extends Orm.Model {
    static hasTimestamps = ['created_at', 'updated_at']
    toJSON (...args) {
      let attrs = super.toJSON(...args)
      BaseModel.hasTimestamps.concat(this.constructor.dateColumns || []).forEach(column => {
        if (this.get(column)) {
          attrs[column] = this.get(column) === '0000-00-00 00:00:00' ? null : moment(this.get(column)).format(extraConf.datefmt || 'YYYY-MM-DD HH:mm:ss')
        }
      })
      return attrs
    }
  }
  return BaseModel
}
