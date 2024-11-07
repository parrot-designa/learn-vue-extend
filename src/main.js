
// import Vue from "@/my-vue2/platforms/web/entry-runtime-with-compiler-esm"
import Vue from "vue/dist/vue.esm.browser" 
import Test from "./Test.vue"
 
 
new Vue({
    render:h=>h(Test)
}).$mount("#app") 

console.log(Test)
 
 