import { isNative } from "./env";
import { handleError } from "./error";

export let isUsingMicroTask = false
let pending = false

function flushCallbacks(){
    pending = false;
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

const callbacks = [] 

let timerFunc;

if(typeof Promise !== 'undefined' && isNative(Promise)){
    const p = Promise.resolve()
    timerFunc = () => {
        p.then(flushCallbacks)
    }
    isUsingMicroTask = true;
}

export function nextTick(cb,ctx){
    let _resolve
    callbacks.push(()=>{
        if(cb){
            try {
                cb.call(ctx)
            } catch (e) {
                handleError(e, ctx, 'nextTick')
            }
        }
    })
    if (!pending) {
        pending = true
        timerFunc()
    }
}