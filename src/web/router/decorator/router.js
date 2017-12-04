const PREFIX = '$$route_'

function formatArgs (args) {
  const hasRoute = typeof args[0] === 'string'
  const hasDesc = args.length > 1 && typeof args[args.length - 1] === 'string'
  const route = hasRoute ? (args[0].indexOf('/') !== 0 ? '/' + args[0] : args[0]) : ''
  const desc = hasDesc ? args[args.length - 1] : ''
  if (hasDesc) {
    args = args.slice(0, -1)
  }
  const middleware = hasRoute ? args.slice(1) : args
  if (middleware.some(m => typeof m !== 'function')) {
    throw new Error('Middleware must be function')
  }
  return [ route, middleware, desc ]
}

export function controller (...args) {
  const [ controllerRoute, controllerMiddleware ] = formatArgs(args)
  return function (target) {
    const proto = target.prototype
    proto.$routes = Object.getOwnPropertyNames(proto)
      .filter(prop => prop.indexOf(PREFIX) === 0)
      .map(prop => {
        const {method, route: actionRoute, middleware: actionMiddleware, desc} = proto[prop]
        const url = `${controllerRoute}${actionRoute}`
        const middleware = [].concat(controllerMiddleware, actionMiddleware)
        const fnName = prop.substring(PREFIX.length)
        proto[`${PREFIX}${fnName}`].fullRoute = url
        return {
          method: method === 'del' ? 'delete' : method,
          url,
          middleware,
          desc,
          fnName
        }
      })
  }
}

export function mapping (method, ...args) {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method')
  }
  const [ route, middleware, desc ] = formatArgs(args)
  return function (target, name, descriptor) {
    target[`${PREFIX}${name}`] = { method, route, middleware, desc }
  }
}

const methods = ['head', 'options', 'get', 'post', 'put', 'patch', 'del', 'delete', 'all']
methods.forEach(method => (exports[method] = mapping.bind(null, method)))
