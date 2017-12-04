import _ from 'lodash'

/**
 * 规范化查询参数
 *
 * @param {Object} query 原有查询参数
 * @param {array} words 查询参数可选key
 * @param {string} [symbol='lk_'] 模糊查询key标识
 * @returns { where, like }
 */
function formatQueryParams (query, words, symbol = 'lk_') {
  // 分页参数
  let pagination = { page: query.page, size: query.size }

  // 去除分页参数
  let otherQuery = _.omitBy(query, (value, key) => {
    return ['page', 'size'].indexOf(key) !== -1
  })

  // 得出where条件
  let where = _.pickBy(otherQuery, (value, key) => {
    return key.indexOf(symbol) === -1 && ((words && words.length > 0) ? (words.indexOf(key) !== -1 || words.indexOf('*' + key) !== -1) : true)
  })

  // 得出like条件
  let like = _.mapKeys(
  _.pickBy(otherQuery, (value, key) => {
    return key.indexOf(symbol) !== -1
  }),
  (value, key) => {
    return key.replace(symbol, '')
  })
  if (words && words.length > 0) {
    like = _.pickBy(like, (value, key) => (words.indexOf(key) || words.indexOf('*' + key) !== -1) !== -1)
  }

  return {
    pagination, where, like
  }
}

/**
 * 去除query对象中的空值属性
 * 去除值为空，或非字符串的属性
 */
function clearEmptyParams (query) {
  return _.omitBy(query, (value, key) => {
    return value === null || typeof value === 'undefined' || (typeof value === 'string' && value.replace(/(^\s*)|(\s*$)/g, '') === '')
  })
}

/**
 * 过滤参数
 * 此函数会从用户传递过来的参数中过滤出需要的参数
 * @param {any} params 客户端传递过来的参数
 * @param {any} fields 需要的参数列表
 * @returns 需要的参数列表
 */
function pickParams (params, fields) {
  return _.pick(params, fields)
}

/**
 * 分页带条件查询的通用函数
 *
 * @param {Object} Service bookshelf Model
 * @param {number} page 页码
 * @param {number} size 条数
 * @param {Object} where where条件
 * @param {Object} like like条件
 * @returns Promise
 */
function findModelPage (Service, page = 1, size = 10, where, like) {
  return findModel(Service, {
    page: page,
    pageSize: size
  }, where, like)
}

/**
 * 查询的通用函数
 *
 * @param {any} Service bookshelf Model
 * @param {any} fetchOptions fetch可选参数 // http://bookshelfjs.org/#Model-instance-fetch
 * @param {any} where where条件
 * @param {any} like like条件
 * @returns
 */
function findModel (Service, fetchOptions, where, like) {
  return Service
    .forge()
    .query((qb) => {
      if (like) {
        for (let key of Object.keys(like)) {
          qb.where(key, 'LIKE', `%${like[key]}%`)
        }
      }
      if (where) {
        qb.where(where)
      }
    })
    .orderBy('id', 'desc') // desc
    .fetchPage(fetchOptions)
}

export {
  formatQueryParams, clearEmptyParams, pickParams, findModelPage, findModel
}
