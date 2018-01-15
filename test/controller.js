import { Controller, rt, params } from '../src'
import { TestService } from './service'

@rt.controller('/test')
export class TestController extends Controller {
  constructor (app) {
    super(app, [ TestService ])
  }

  @rt.get(params(), '测试接口')
  find (ctx) {
    return this.testService.find()
  }
}
