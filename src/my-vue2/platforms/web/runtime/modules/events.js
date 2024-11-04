import { updateListeners } from "@/my-vue2/core/vdom/helpers/update-listeners";
import { isUndef } from "@/my-vue2/shared/util";

let target;

function add(name,handler){
    target.addEventListener(
        name,
        handler
    )
}

function remove(){

}

// 更新 dom 监听
function updateDOMListeners(oldVnode, vnode){
    // 如果没有on 说明无需进行事件监听 直接返回 不进行处理
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
        return
    }
    const on = vnode.data.on || {};
    const oldOn = oldVnode.data.on || {};
    // 真实DOM
    target = vnode.elm || oldVnode.elm;
    updateListeners(on,oldOn,add,remove)
    target = undefined;
}


export default {
    create: updateDOMListeners
}