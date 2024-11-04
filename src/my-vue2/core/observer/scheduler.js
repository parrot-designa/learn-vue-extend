

const queue = []
// 用于控制观察者队列的处理流程
// flushing 的作用是标记当前是否存在正在处理（flush）队列中的观察者
// 当 flushing 为 false 时，表示当前没有在处理队列，此时新的观察者可以直接被添加到队列的末尾。
// 而当 flushing 为 true 时，表示正在处理队列，此时需要根据观察者的 ID 将其插入到合适的位置，以保证按照一定的顺序执行。
let flushing = false;
let index = 0
let waiting = false;
let has = {}

const sortCompareFn = (a, b) => {
    if (a.post) {
      if (!b.post) return 1
    } else if (b.post) {
      return -1
    }
    return a.id - b.id
}
  
export let currentFlushTimestamp = 0

let getNow = Date.now

function flushSchedulerQueue(){
    currentFlushTimestamp = getNow()
    flushing = true
    let watcher, id
    queue.sort(sortCompareFn)

    for (index = 0; index < queue.length; index++) {
        watcher = queue[index]

        has[id] = null
        
        watcher.run()
    }
}
 
// 批量更新
export function queueWatcher(watcher){
    watcher.run();
    // const id = watcher.id;
    // // 检查观察者是否已经在队列中 如果存在则直接返回，不作任何处理
    // if (has[id] != null) {
    //     return
    // }
    // // 将观察者加入到已有的队列标记中 (has[id] = true)
    // has[id] = true
    // if(!flushing){
    //     queue.push(watcher);
    // }else{ 
    //     let i = queue.length - 1;
    //     while (i > index && queue[i].id > watcher.id) {
    //         i--
    //     }
    //     // 如果 flushing 为 true，则需要找到合适的位置插入观察者，以保证顺序执行。通过循环找到比当前观察者 ID 小的位置，并在其后插入观察者。
    //     queue.splice(i + 1, 0, watcher)
    // }
    // if (!waiting) {
    //     // 如果 waiting 为 false，则设置 waiting 为 true 表示队列有等待处理的项。
    //     waiting = true
    //     // 否则使用 nextTick 来调度 flushSchedulerQueue 的执行，这通常是用于异步任务调度的方法，确保在当前任务完成后执行队列刷新。
    //     nextTick(flushSchedulerQueue)
    // }
}