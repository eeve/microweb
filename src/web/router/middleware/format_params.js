import { formatQueryParams, pickParams as pick, clearEmptyParams } from '../utils'

export default (ctx, next) => {
  // 将所有的参数都合并到一个对象, 并丢弃url与querystr中的空值参数
  let allparams = clearEmptyParams({ ...ctx.params, ...ctx.request.query })
  if (ctx.request.body && ctx.request.body.fields && ctx.request.body.files) { // 存在文件上传
    allparams = { ...allparams, ...ctx.request.body.fields }
  } else {
    allparams = { ...allparams, ...ctx.request.body }
  }
  // 格式化请求参数 => { pagination, where, like }
  ctx.$params = formatQueryParams(allparams, ctx.$fields || [])
  ctx.$files = ctx.request.body && ctx.request.body.files ? ctx.request.body.files || {} : {}
  // console.log('pagination: ', ctx.$params.pagination, 'where:', ctx.$params.where, 'like:', ctx.$params.like);
  // 自动拾取合法参数到$query
  ctx.$query = ctx.$fields ? pick({ ...ctx.$params.where, ...ctx.$params.like }, ctx.$fields.map(name => name.replace(/\*/g, ''))) : {}

  // 判断必须参数是否都存在
  ctx.$fields && ctx.$fields.forEach((field) => {
    let name = field.replace(/\*/g, '')
    if (field.indexOf('*') !== -1 && (ctx.$query[name] === null || typeof ctx.$query[name] === 'undefined')) {
      // 是必须参数，但是没有此参数
      throw new Error(`缺少参数${name}`)
    }
  })
  return next()
}
