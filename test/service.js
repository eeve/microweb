import { Service } from '../src'

export class TestService extends Service {
  find () {
    return [
      {
        name: 'abc',
        age: 20
      },
      {
        name: 'jike',
        age: 19
      }
    ]
  }
}
