import { rt, params } from '../router'
import { Controller } from '../mvc'

@rt.controller('/_probe_')
export class ProbeController extends Controller {
  @rt.get('status', params('id', 'name', 'email'), '探测服务状态')
  get (ctx) {
    return `server lives ${new Date().toLocaleDateString()}${new Date().toLocaleTimeString()}`
  }
}
