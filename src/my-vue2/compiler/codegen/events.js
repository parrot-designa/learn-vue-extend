const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;

export function genHandlers(
    events
){
    const prefix = 'on:';
    let staticHandlers = ``
    for(const name in events){
        const handlerCode = genHandler(events[name]);
        staticHandlers += `"${name}":${handlerCode},`
    }
    // 加上括号+去除逗号
    staticHandlers = `{${staticHandlers.slice(0, -1)}}`
    return prefix + staticHandlers;
}


function genHandler(
    handler
){
    if(!handler){
        return 'function(){}'
    } 
    const handlerCode = handler.value;
    return `function($event){${handlerCode}}`
}