import path from 'path'
import fs from 'fs'

export const resolve = file => path.resolve(process.cwd(), file)

export const firstLowerCase = str => str.replace(/^\S/, (s) => s.toLowerCase())

export const notExistMkdir = filepath => {
  const dirname = path.dirname(filepath)
  !fs.existsSync(dirname) && fs.mkdirSync(dirname)
  return filepath
}
