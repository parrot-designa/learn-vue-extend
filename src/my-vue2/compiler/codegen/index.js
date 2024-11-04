import { genHandlers } from "./events";

export class CodegenState {
    options;
    constructor(options){
        this.options = options;
    }
}


export function generate(
    ast
){
    const code = ast ? genElement(ast) : '_c("div")'
    return {
        render:new Function(`with(this){return ${code}}`)
    }
} 
export function genText(text) {
    return `_v(${
        text.type === 2 
        ? text.expression
        : JSON.stringify(text.text)
    })`
}

function genNode(node, state) {
    if (node.type === 1) {
        return genElement(node, state)
    }else{
        return genText(node)
    }
}

function genChildren(el){
    const children = el.children;
    if(children.length){
        return `[${children.map(child=>genNode(child)).join(",")}]`
    }
}

export function genData(el){
    let data = "{"

    if (el.events) {
        // genHandlers 生成的内容为 {on:{click:function($event){msg = '你好世界'}}} 
        data += `${genHandlers(el.events, false)},`
    }
    // 去除最后的逗号并拼接 }
    data = data.replace(/,$/, '') + '}'
    return data;
}

function genElement(el){
    //最终返回的字符串
    let code;
    let tag = `'${el.tag}'`; 
    let data = genData(el);
    let children = genChildren(el);

    code = `_c(${tag}${
        data ? `,${data}`:''
    }${
        children ? `,${children}`:''
    })` 
    return code;
}