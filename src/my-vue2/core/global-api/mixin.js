export function initMixin(Vue){
    Vue.mixin = function(mixin){
        this.options = {...this.options, mixin}
        return this;
    }
}