export function initExtend(Vue){

    Vue.extend = function(extendOptions){
        extendOptions = extendOptions || {};
        const Super = this;

        const Sub = function VueComponent(options) {
            this._init(options)
        } 
        Sub.prototype = Object.create(Super.prototype)
        Sub.prototype.constructor = Sub;

        return Sub;
    }

}