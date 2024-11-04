// 判断是否是数组
export const isArray = Array.isArray
// 判断是否是原始类型
export function isPrimitive(value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
}
// 空函数 可以避免undefined错误
export function noop(a, b, c) {}

// 根据字符串创建一个快速查找映射，用于判断一个字符串是否属于预定义的一组关键字之一。
export function makeMap(
  str,
  expectsLowerCase
){
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

// 是否是内置组件
export const isBuiltInTag = makeMap('slot,component', true)

// 判断是否是函数类型
export function isFunction(value){
  return typeof value === 'function'
}

/**
 * 创建一个纯函数的缓存版本。
 */
export function cached(fn) {
  const cache = Object.create(null)
  return function cachedFn(str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

/**
 * 将“-“写法转成驼峰 my-props => myProps
 */
const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

const _toString = Object.prototype.toString
// 查看是否是一个普通对象
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}
// 查看对象类型
export function toRawType(value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * 往目标对象中合并属性
 */
export function extend(
  to,
  _from
) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

// 判断一个值是否是 undefined或者 null
export function isUndef(v){
  return v === undefined || v === null;
}

// 判断一个值是否被定义
export function isDef(v) {
  return v !== undefined && v !== null
}

/**
 * 转化成 string
 */
export function toString(val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
    ? JSON.stringify(val, replacer, 2)
    : String(val)
}


function replacer(_key, val) { 
  if (val && val.__v_isRef) {
    return val.value
  }
  return val
}

// 用于比较两个值 x 和 y 是否发生了改变。
// 检测两个值是否相等，同时处理了一些特殊的情况，比如负零和正零的区别 
export function hasChanged(x, y) {
  // 首先检查 x 是否等于 y
  // 如果它们相等，那么需要进一步检查它们是否都是零，并且是否是负零和正零之一。
  // 这是因为 JavaScript 中的 0 和 -0 被认为是相等的（0 === -0 返回 true），但是它们的倒数是不同的（1 / 0 是 Infinity，而 1 / -0 是 -Infinity）
  if (x === y) {
    return x === 0 && 1 / x !== 1 / y 
  } else {
    // 如果 x 和 y 不相等，那么需要检查它们是否都是 NaN。
    // 这是因为 NaN 不等于任何值，包括自身。因此，NaN === NaN 返回 false
    // 但是，我们需要确保至少有一个值不是 NaN，因为如果两个值都是 NaN，那么它们实际上是相同的（从逻辑上来说，它们都是“不确定”的值）。
    // 所以，如果 x === x 或者 y === y 为真，说明至少有一个值不是 NaN，那么这两个值就被认为是不同的。
    // console.log(hasChanged(0, 0));       // false
    // console.log(hasChanged(-0, 0));      // true
    // console.log(hasChanged(0, -0));      // true
    // console.log(hasChanged(NaN, NaN));   // false
    // console.log(hasChanged(NaN, 0));     // true
    // console.log(hasChanged(1, 1));       // false
    // console.log(hasChanged(1, 2));       // true
    return x === x || y === y
  }
}