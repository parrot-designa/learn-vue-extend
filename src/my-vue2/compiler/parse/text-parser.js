const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function parseText(text){
    const tagRE = defaultTagRE;
    if (!tagRE.test(text)) {
        return
    }
    let tokens = [];
    // RegExp对象有一个数学叫做 lastIndex,用来记录正则表达式上一次匹配的位置。
    // 这个属性主要用于全局搜索（当使用g标志时），它保存了最后一次匹配结束的位置的索引+1  
    // 使用 test匹配过一次 需要重置 lastIndex 否则无法生效
    tagRE.lastIndex = 0;
    // 匹配模板引擎的占位符
    let match 
    while ((match = tagRE.exec(text))) {
        // 这里的 exp 匹配到的是 {{ }} 中的内容
        const exp = match[1].trim();
        tokens.push(`_s(${exp})`) 
    }
   
    return {
        expression: tokens.join('+')
    }
}