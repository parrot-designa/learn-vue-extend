import { isArray, isUndef } from '@/my-vue2/shared/util';
import { isDef } from "../util"
import VNode from "./vnode"

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export const emptyNode = new VNode({tag:'',data: {},children: []})

export function createPatchFunction({ nodeOps,modules }){
    let i,j;
    const cbs = {};

    for(i = 0; i < hooks.length; ++i){
        cbs[hooks[i]] = []
        for (j = 0; j < modules.length; ++j) {
            if (isDef(modules[j][hooks[i]])) {
                cbs[hooks[i]].push(modules[j][hooks[i]])
            }
        }
    }

    // 调用 create 钩子
    function invokeCreateHooks(vnode){
        for (let i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, vnode)
        }
    }

    // 基于 elm创建一个虚拟节点
    function emptyNodeAt(elm) {
        return new VNode({tag:nodeOps.tagName(elm).toLowerCase(), data:{}, children:[],text:undefined,elm});
    }

    // 待完善
    function insert(parent,elm,referenceElm){
        // 如果是组件挂载 没有 parent
        if (isDef(parent)) {
            if(referenceElm){
                nodeOps.insertBefore(parent,elm,referenceElm)
            }else{
                nodeOps.appendChild(parent,elm)
            }
        } 
    }

    function createChildren(children,parentElm,referenceElm){
        for(let i=0;i<children.length;i++){
            createElm(children[i], parentElm,referenceElm)
        }
    }

    function createElm(vnode,parentElm,referenceElm){
        const tag = vnode.tag;
        const data = vnode.data;
        const text = vnode.text;
        if(isDef(tag)){
            vnode.elm = nodeOps.createElement(tag);
            createChildren(vnode.children, vnode.elm);

            if (isDef(data)) {
                invokeCreateHooks(vnode)
            }

            insert(parentElm, vnode.elm,referenceElm)
        }else if(text){
            vnode.elm = nodeOps.createTextNode(text);
            insert(parentElm, vnode.elm,referenceElm)
        }
    }

    function removeNode(el) {
        const parent = nodeOps.parentNode(el)
        if (isDef(parent)) {
          nodeOps.removeChild(parent, el)
        }
    } 
    
    // oldVnode代表上一次渲染的 vnode
    // vnode代表这次渲染的 vnode
    return function patch(oldVnode,vnode){
        // 没有oldVnode 说明是组件挂载 
        if(isUndef(oldVnode)){
            createElm(
                vnode
            )
        }else{
            // 判断是否是一个真实节点
            const isRealElement = isDef(oldVnode.nodeType)
            if (isRealElement) {
                oldVnode = emptyNodeAt(oldVnode)
            }
            // 将要替换旧的节点
            const oldElm = oldVnode.elm;
            const parentElm = nodeOps.parentNode(oldElm);

            createElm(
                vnode,
                parentElm,
                nodeOps.nextSibling(oldElm)
            );
            if (isDef(parentElm)) { 
                removeNode(oldElm)
            }
        } 
        return vnode.elm;
    }
}