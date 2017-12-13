import path from 'path'
import fs from 'fs'

export const resolve = file => path.resolve(process.cwd(), file)

export const firstLowerCase = str => str.replace(/^\S/, (s) => s.toLowerCase())
export const firstUpperCase = str => str.replace(/^\S/, (s) => s.toUpperCase())

export const notExistMkdir = filepath => {
  const dirname = path.dirname(filepath)
  !fs.existsSync(dirname) && fs.mkdirSync(dirname)
  return filepath
}

const allMethods = targetClass => {
  const propertys = Object.getOwnPropertyNames(Object.getPrototypeOf(targetClass))
  propertys.splice(propertys.indexOf('constructor'), 1)
  return propertys
}

export const es6ClassBindAll = (targetClass, methodNames = []) => {
  for (const name of !methodNames.length ? allMethods(targetClass) : methodNames) {
    targetClass[name] = targetClass[name].bind(targetClass)
  }
}
