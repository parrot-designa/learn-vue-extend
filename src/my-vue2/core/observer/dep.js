
let uid = 0

export default class Dep {
    // 存储的是 watcher实例
    subs;

    constructor(){
        this.id = uid++
        this.subs = [];
    }

    depend(info){
        // 增加watcher实例
        if(Dep.target){
            Dep.target.addDep(this);
        }
    }

    // sub指的是 watcher实例
    addSub(sub){
        this.subs.push(sub);
    }

    // 通知 watcher实例进行更新
    notify(){
        for (let i = 0, l = this.subs.length; i < l; i++) {
            const sub = this.subs[i];
            sub.update();
        }
    }
}

Dep.target = null;
const targetStack = [];

export function pushTarget(target){
    targetStack.push(target);
    Dep.target = target;
}

export function popTarget(){
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
}