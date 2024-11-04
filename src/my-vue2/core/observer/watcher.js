import { isFunction } from "../util";
import { pushTarget,popTarget } from "./dep";
import { queueWatcher } from "./scheduler";

// 每一个实例 也就是每一个组件 都存在一个 watcher 实例
export default class Watcher {

    getter;
    vm;
    active;

    constructor(
        vm, 
        expOrFn
    ){
        if(isFunction(expOrFn)){
            this.getter = expOrFn;
        }
        this.vm = vm; 
        this.newDeps = []
        this.newDepIds = new Set()
        this.get();
    }

    get(){
        pushTarget(this);
        let value
        try{
            // 这里的 getter就是渲染步骤
            value = this.getter.call(this.vm, this.vm);
        }catch(e){
            
        }finally{
            popTarget();
        }
        return value
    }

    addDep(dep){
        const id = dep.id;
        dep.addSub(this);
    }

    update(){
        queueWatcher(this);
    }

    run(){
        const value = this.get()
    }
}