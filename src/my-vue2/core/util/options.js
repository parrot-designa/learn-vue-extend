import { unicodeRegExp } from './lang'
import { isBuiltInTag, isFunction, isArray, camelize, isPlainObject, toRawType, hasOwn } from '@/my-vue2/shared/util';
import { warn } from './debug'
import config from "../config"

function assertObjectType(name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        `Invalid value for option "${name}": expected an Object, ` +
          `but got ${toRawType(value)}.`,
        vm
      )
    }
}
  

// 默认的策略
const defaultStrat = function (parentVal, childVal) {
    return childVal === undefined ? parentVal : childVal
}

// 引用 config配置 支持用户自定义
let strats = config.optionMergeStrategies;

if (__DEV__) {
    // 待完善
    strats.el = strats.propsData = function (
        parent,
        child,
        vm,
        key
    ) {
        return defaultStrat(parent, child)
    }
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(
    to,
    from,
    recursive = true
) {
    if (!from) return to
    let key, toVal, fromVal

    const keys = hasSymbol
        ? Reflect.ownKeys(from)
        : Object.keys(from)

    for (let i = 0; i < keys.length; i++) {
        key = keys[i]
        // in case the object is already observed...
        if (key === '__ob__') continue
        toVal = to[key]
        fromVal = from[key]
        if (!recursive || !hasOwn(to, key)) {
            set(to, key, fromVal)
        } else if (
            toVal !== fromVal &&
            isPlainObject(toVal) &&
            isPlainObject(fromVal)
        ) {
            mergeData(toVal, fromVal)
        }
    }
    return to
}


export function mergeDataOrFn(
    parentVal,
    childVal,
    vm
) {
    return function mergedInstanceDataFn() {
        // instance merge
        const instanceData = isFunction(childVal)
            ? childVal.call(vm, vm)
            : childVal
        const defaultData = isFunction(parentVal)
            ? parentVal.call(vm, vm)
            : parentVal
        if (instanceData) {
            return mergeData(instanceData, defaultData)
        } else {
            return defaultData
        }
    }
}

strats.data = function (
    parentVal,
    childVal,
    vm
) {
    if (!vm) {
        if (childVal && typeof childVal !== 'function') {
            __DEV__ &&
                warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                )

            return parentVal
        }
        return mergeDataOrFn(parentVal, childVal)
    }
    return mergeDataOrFn(parentVal, childVal, vm)
}

LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeLifecycleHook
})

export function mergeLifecycleHook(
    parentVal,
    childVal
) {
    const res = childVal
        ? parentVal
            ? parentVal.concat(childVal)
            : isArray(childVal)
                ? childVal
                : [childVal]
        : parentVal
    return res ? dedupeHooks(res) : res
}
function dedupeHooks(hooks) {
    const res = []
    for (let i = 0; i < hooks.length; i++) {
        if (res.indexOf(hooks[i]) === -1) {
            res.push(hooks[i])
        }
    }
    return res
}

ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets
})

function mergeAssets(
    parentVal,
    childVal,
    vm,
    key
) {
    const res = Object.create(parentVal || null)
    if (childVal) {
        return extend(res, childVal)
    } else {
        return res
    }
}

// 合并父级和子级的 options
export function mergeOptions(parent, child) {
    // 省略部分代码
    let key
    const options = {};
    for (key in parent) {
        mergeField(key)
    }
    for (key in child) {
        if (!hasOwn(parent, key)) {
            mergeField(key)
        }
    }
    function mergeField(key) {
        const strat = strats[key] || defaultStrat;
        options[key] = strat(parent[key], child[key], vm, key)
    }
    return options;
}

strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
) {
    // work around Firefox's Object.prototype.watch...
    //@ts-expect-error work around
    if (parentVal === nativeWatch) parentVal = undefined
    //@ts-expect-error work around
    if (childVal === nativeWatch) childVal = undefined
    /* istanbul ignore if */
    if (!childVal) return Object.create(parentVal || null)
    if (__DEV__) {
        assertObjectType(key, childVal, vm)
    }
    if (!parentVal) return childVal
    const ret = {}
    extend(ret, parentVal)
    for (const key in childVal) {
        let parent = ret[key]
        const child = childVal[key]
        if (parent && !isArray(parent)) {
            parent = [parent]
        }
        ret[key] = parent ? parent.concat(child) : isArray(child) ? child : [child]
    }
    return ret
}

/**
 * Other object hashes.
 */
strats.props =
    strats.methods =
    strats.inject =
    strats.computed =
    function (
        parentVal,
        childVal,
        vm,
        key
) {
    if (childVal && __DEV__) {
        assertObjectType(key, childVal, vm)
    }
    if (!parentVal) return childVal
    const ret = Object.create(null)
    extend(ret, parentVal)
    if (childVal) extend(ret, childVal)
    return ret
}

strats.provide = function (parentVal, childVal) {
    if (!parentVal) return childVal
    return function () {
      const ret = Object.create(null)
      mergeData(ret, isFunction(parentVal) ? parentVal.call(this) : parentVal)
      if (childVal) {
        mergeData(
          ret,
          isFunction(childVal) ? childVal.call(this) : childVal,
          false // non-recursive
        )
      }
      return ret
    }
}


// 校验options.components组件选项
function checkComponents(options) {
    for (const key in options.components) {
        validateComponentName(key);
    }
}

export function validateComponentName(name) {
    if (
        !new RegExp(`^[a-zA-Z][\\-checkComponents\\.0-9_${unicodeRegExp.source}]*$`).test(name)
    ) {
        warn(
            `组件名称无效：${name} 。组件名称应该符合html5规范中的有效自定义元素名称。`
        )
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
        warn(
            `不要使用内置的或保留的HTML元素作为组件。id: ${name}`
        )
    }
}


function normalizeProps(options, vm) {
    const props = options.props;
    if (!props) return
    const res = {};
    let i, val, name
    if (isArray(props)) {
        i = props.length;
        while (i--) {
            val = props[i]
            if (typeof val === 'string') {
                name = camelize(val)
                res[name] = { type: null }
            } else if (__DEV__) {
                warn('当使用数组语法时，道具必须是字符串。')
            }
        }
    } else if (isPlainObject(props)) {
        for (const key in props) {
            val = props[key]
            name = camelize(key)
            res[name] = isPlainObject(val) ? val : { type: val }
        }
    } else if (__DEV__) {
        warn(
            `props属性应该传入数组类型或者对象类型，但是现在的类型为${toRawType(props)}.`,
        )
    }
    options.props = res
}

function normalizeInject(options, vm) {
    const inject = options.inject
    if (!inject) return
    const normalized = (options.inject = {})
    if (isArray(inject)) {
        for (let i = 0; i < inject.length; i++) {
            normalized[inject[i]] = { from: inject[i] }
        }
    } else if (isPlainObject(inject)) {
        for (const key in inject) {
            const val = inject[key]
            normalized[key] = isPlainObject(val)
                ? extend({ from: key }, val)
                : { from: val }
        }
    } else if (__DEV__) {
        warn(
            `inject属性应该传入数组类型或者对象类型，但是现在的类型为` +
            `但是现在为${toRawType(inject)}.`
        )
    }
}


/**
 * 规范化自定义指令
 */
function normalizeDirectives(options) {
    const dirs = options.directives
    if (dirs) {
        for (const key in dirs) {
            const def = dirs[key]
            if (isFunction(def)) {
                dirs[key] = { bind: def, update: def }
            }
        }
    }
}