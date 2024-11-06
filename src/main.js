
// import Vue from "@/my-vue2/platforms/web/entry-runtime-with-compiler-esm"
import Vue from "vue" 

const VueComponentConstructor = Vue.extend({
    template:`<div>我是子类构造器</div>`
}); 

const VueComponentChild1Constructor = VueComponentConstructor.extend({
    data(){
        return {
            name:"VueComponentChild1Constructor"
        }
    }
})
console.log(VueComponentConstructor.options)
console.log(VueComponentChild1Constructor.options)
console.log(Vue.options)