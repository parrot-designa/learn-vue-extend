
import { parseHTML } from "./html-parser";
import { parseText } from "./text-parser";
import { addHandler } from "../helpers";
export const dirRE = /^v-|^@|^:|^#/
export const onRE = /^@|^v-on:/

export function createASTElement(
    tag,
    attrs
){
    return {
        type:1,
        tag,
        attrsList:attrs, 
        children:[]
    }
}

export function parse(template){

    let rootAst;
    const stack = [];

    function closeElement(element){
        processElement(element);
    }
    
    parseHTML(template,{
        start:(startMatch)=>{
            // 当开始元素解析完毕 需要创建一个新的元素 ast节点
            const element = createASTElement(startMatch.tagName, startMatch.attrs)
            // 如果没有根节点 设置根节点
            if(!rootAst){
                rootAst = element
            }
            // 将当前元素推入栈中
            stack.push(element);
        },
        end:(tagName)=>{
            // 如果栈顶元素和当前元素相同
            if(stack[stack.length-1].tag === tagName){
                // 弹出栈顶元素
                const currentElement = stack.pop();
                if(stack.length === 0){
                    rootAst = currentElement;
                }else{
                    // 当前栈顶元素是弹出元素的父元素
                    let currentParent = stack[stack.length-1];
                    currentParent.children = currentParent.children || [];
                    currentParent.children.push(currentElement);
                    // 关闭元素时调用 
                } 
                closeElement(currentElement)
            }
        },
        chars:(text)=>{
            if(text){
                let res,child;
                // 看看是否能解析到插值表达式
                if(res = parseText(text)){
                    child = {
                        type: 2,
                        expression: res.expression,
                        text
                    }
                }else{
                    child = {
                        type:3,
                        text
                    }
                }
                // 获取栈顶元素 即当前处理中的元素 为文字节点的父元素
                let currentParent = stack[stack.length-1];
                currentParent.children = currentParent.children || [];
                currentParent.children.push(child)
            } 
        },
    });  
    return rootAst;
}

export function processElement(element){
    processAttrs(element)
}

function processAttrs(el){
    const list = el.attrsList
    let i, name,value, l;
    for (i = 0, l = list.length; i < l; i++) {
        name = list[i].name;
        value = list[i].value
        // 如果匹配到 v-on、@、v-bind、:
        if(dirRE.test(name)){
            // 说明绑定了一些动态属性
            el.hasBindings = true;
            // 如果是事件
            if(onRE.test(name)){
                // 删除事件相关的修饰符 只剩下名字
                name = name.replace(onRE, '');
                addHandler(el, name, value);
            }
        }
    }
}