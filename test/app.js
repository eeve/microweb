import { App } from '../src'
import * as Controllers from './controller'

const app = new App({
  port: 2000
})

app.mountControllers(Controllers)

app.listen()
