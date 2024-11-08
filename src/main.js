
// import Vue from "@/my-vue2/platforms/web/entry-runtime-with-compiler-esm"
import Vue from "vue/dist/vue.esm.browser"
import Test from "./Test.vue"


var Parent = Vue.extend({
    methods: {
        handleClick: function () {
            console.log("父类点击事件")
        },
        getParentName: function () {
            console.log("获取父类名称")
        }
    }
})
var Child = Parent.extend({
    methods: {
        handleClick: function () {
            console.log("子类点击事件")
        },
        getChildName: function () {
            console.log("获取父类名称")
        }
    }
})
var vm = new Child().$mount('#app');

console.log(vm.$options.methods);