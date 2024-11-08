// 判断是否在浏览器环境
export const inBrowser = typeof window !== 'undefined'

// 判断是否是一个构造函数
export function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
// UA设置
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()

// 判断是否是 IE
export const isIE = UA && /msie|trident/.test(UA)

export const hasSymbol =
  typeof Symbol !== 'undefined' &&
  isNative(Symbol) &&
  typeof Reflect !== 'undefined' &&
  isNative(Reflect.ownKeys)

export const nativeWatch = {}.watch