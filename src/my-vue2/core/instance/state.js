import { isFunction, isPlainObject,warn,isReserved,noop } from "../util";
import { observe } from "../observer";

export function getData(data, vm){
    try{
        return data.call(vm,vm);
    }catch(e){
        return {}
    }
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

export function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
      return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
      this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initData(vm){
    let data = vm.$options.data;
    data = vm._data = isFunction(data) ? getData(data, vm) : data || {}
    if(!isPlainObject(data)){
        data = {};
        __DEV__ && 
            warn(
                "data方法应该返回一个对象"
            )
    }
    // 在实例上代理 data
    // 获取 data上所有的 key
    const keys = Object.keys(data);
    let i = keys.length;
    while(i--){
        const key = keys[i];
        // 不以_或者$开头
        if(!isReserved(key)){
            proxy(vm, `_data`, key)
        }
    }
    // 跟踪的是 data对象
    const ob = observe(data)
}


export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm)
    }
}