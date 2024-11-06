import { extend } from "@/my-vue2/shared/util";

export function initExtend(Vue){

    // 待完善
    Vue.extend = function(extendOptions){
        extendOptions = extendOptions || {}
        // 新增_Ctor属性 
        const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
        const Super = this;
        const Sub = function VueComponent(options) {
            this._init(options)
        } 
        // 赋予VueComponent继续扩展的能力
        Sub.extend = Super.extend;
        // 给 VueComponent构造函数上新增
        Sub.options = extend({},{...Super.options, ...extendOptions});
        Sub.prototype = Object.create(Super.prototype)
        Sub.prototype.constructor = Sub;

        return Sub;
    }

}