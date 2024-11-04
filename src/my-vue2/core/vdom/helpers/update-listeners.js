import { cached, isUndef, warn } from "../../util";

const normalizeEvent = cached(
    (name)=>{
        return {
            name
        }
    }
)

export function updateListeners(
    on,
    oldOn,
    add,
    remove
){
    let name,cur,event;
    for(name in on){
        // 获取具体的事件函数
        cur = on[name]
        // 事件
        event = normalizeEvent(name);
        if(isUndef(cur)){
            __DEV__ &&
            warn(`无效的${event.name}事件处理函数`)
        }else {
            add(event.name, cur, event.capture, event.passive)
        }
    }
}