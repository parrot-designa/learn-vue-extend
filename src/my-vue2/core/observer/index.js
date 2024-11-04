import { isArray, isPlainObject,hasChanged } from "../util";
import Dep from "./dep";

const NO_INITIAL_VALUE = {}

export function defineReactive(
    obj,
    key,
    val
){
    // data上每一个属性都有一个 Dep实例
    const dep = new Dep();

    // 获取属性描述符
    const property = Object.getOwnPropertyDescriptor(obj, key);
    // 如果不可配置 直接返回 不进行处理
    if (property && property.configurable === false) {
        return
    }
    // get描述符
    const getter = property && property.get
    // set描述符
    const setter = property && property.set
    
    val = obj[key];

    Object.defineProperty(obj, key, {
        // 可枚举
        enumerable: true,
        // 可配置
        configurable: true,
        get: function reactiveGetter(){
            const value = getter ? getter.call(obj) : val;
            // 对应的组件watcher实例
            if(Dep.target){ 
                dep.depend()
            }
            return value;
        },
        set: function reactiveSetter(newVal){
            const value = getter ? getter.call(obj) : val;
            if (!hasChanged(value, newVal)) {
                return
            }
            if(setter){
                setter.call(obj, newVal)
            }else if (getter) {
                return 
            }else{
                val = newVal;
            }
            dep.notify()
        }
    });

    return dep;
}

export class Observer{
    constructor(value){
        if(isArray(value)){

        }else{
            const keys = Object.keys(value);
            for(let i = 0;i < keys.length;i++){
                const key = keys[i]
                // 对 data里面的每一项做处理
                defineReactive(value, key, NO_INITIAL_VALUE, undefined)
            }
        }
    }
}

// 为 value 创建一个观察者实例
export function observe(
    value
){
    if(isPlainObject(value)){
        return new Observer(value);
    }
}