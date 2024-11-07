
import { mark,measure } from "../util/perf";
import config from "../config";
import { mergeOptions } from "../util/options";
import { initLifeCycle } from "./lifecycle";
import { initEvents } from "./events";
import { initRender } from "./render";
import { initState } from "./state";
import { initProvide,initInjections } from "./inject";
 
let uid = 0;

export function initMixin(Vue){
    Vue.prototype._init = function(options){
        // 获取 vue实例
        const vm = this;
        // vue实例唯一标识
        vm._uid = uid++;  
        // init 函数刚执行时
        let startTag, endTag
        if (__DEV__ && config.performance && mark) {
            startTag = `vue-perf-start:${vm._uid}`
            endTag = `vue-perf-end:${vm._uid}`
            mark(startTag)
        }
        // 用于后续判断是否是有效的 vue实例使用
        vm._isVue = true;
        // 是否跳过视图更新
        vm.__v_skip = true
        // 省略作用域相关的部分
        // xxx 作用域部分
        // 组件合并暂时不讨论
        if(options && options._isComponent){

        }else{
            vm.$options = mergeOptions(
                vm.constructor.options,
                options || {},
                vm
            )
        }
        // 将 vm._self指向实例本身
        vm._self = vm; 
        // 初始化生命周期
        initLifeCycle(vm);
        // 初始化事件中心
        initEvents(vm)
        // 初始化渲染
        initRender(vm)
        // 初始化 inject
        initInjections(vm)
        // 初始化 props、data、computed 等
        initState(vm)
        // 初始化 provider
        initProvide(vm)
        // init 函数初始化逻辑完成
        if (__DEV__ && config.performance && mark) {
            mark(endTag)
            measure(`vue ${vm._uid} init`, startTag, endTag)
        } 
    }
}


// 获取构造函数上的 options选项
export function resolveConstructorOptions(Ctor){
    // Ctor是构造函数 获取构造函数上的 options
    let options = Ctor.options;
    // super代表父类构造器
    // 如果有 super选项 说明这个函数是使用 Vue.extend 生成的 VueComponent
    if(Ctor.super){
        // 表示父类构造函数上的 options
        const superOptions = resolveConstructorOptions(Ctor.super);
        // 表示extend生成子类构造函数时的父类构造函数上的 options
        const cachedSuperOptions = Ctor.superOptions;
        // 如果父类构造函数变化了 如执行了 Vue.mixin
        if (superOptions !== cachedSuperOptions) {
            // 给子类构造函数上设置最新的父类构造函数options
            Ctor.superOptions = superOptions;
            // 获取子类构造函数上的更改项
            const modifiedOptions = resolveModifiedOptions(Ctor)
            // 如果有更改项
            if(modifiedOptions){
                // 将更改项添加到子类构造函数的extendOptions属性上
                extend(Ctor.extendOptions, modifiedOptions);
            }
            // 将最新的父类构造函数选项和子类构造函数选项合并
            options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
            if (options.name) {
                options.components[options.name] = Ctor
            }
        }
    }
}

function resolveModifiedOptions(Ctor){
    let modified
    const latest = Ctor.options
    const sealed = Ctor.sealedOptions
    for (const key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) modified = {}
        modified[key] = latest[key]
      }
    }
    return modified
}