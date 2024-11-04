export function initMixin(Vue){
    Vue.mixin = function(mixin){
        return this;
    }
}