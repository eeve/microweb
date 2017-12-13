/**
 * 指定合法参数中间件
 * @params {array[string]} 指定的合法参数
 */
export function params (...fields) {
  return async (ctx, next) => {
    // 设置合法参数
    ctx.$fields = fields
    try {
      let result = await next()
      if (result === undefined) {
        return
      }
      ctx.body = {
        error: false,
        model: result
      }
    } catch (err) {
      ctx.logger && ctx.logger.error('API处理异常', err)
      ctx.body = {
        error: true,
        model: err.message
      }
    }
  }
}
