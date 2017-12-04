import bunyan from 'bunyan'
export default class Logger extends bunyan {
  constructor (...args) {
    super(...args)
    this.debug()
  }
}
