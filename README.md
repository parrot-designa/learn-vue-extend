🔥 浅析Vue中的继承

# 一、Vue的原型设计

Vue是一个基于原型设计的前端框架。

在Vue被引入时，会通过多个函数给 Vue原型上添加上一系列的方法。

```js
// 该函数在 Vue被引入时执行
export function lifecycleMixin(Vue){
    Vue.prototype._update = ()=>{
        // xxxx
    }
}
```

那么在`Vue.prototype`上定义方法有什么作用呢？ 

如下，Vue本质上是一个构造函数：

```js
function Vue(){
    //xxx
}
```

所以我们可以通过 `new关键字` 来创建一个 vue实例。

```js
const vm = new Vue();
```

1. `构造函数与原型对象`：每个构造函数都有一个 prototype属性，指向一个对象。这个对象被叫做原型对象，包含了由该构造函数创建的实例共享的属性和方法。

2. `实例对象的 __proto__ 属性`：每个实例对象都有一个 `__proto__` 属性，指向构造函数的原型对象。

所以我们可以得出结论：`Vue构造函数的显式原型（Vue.prototype）和基于它创建的实例的隐式原型（vm.__proto__）指向的是同一块内存空间`。

![测试](./1.png)

当 Vue实例访问某个属性时，如果在自身属性中找不到，则会沿着__proto__属性指向的原型对象进行查找，所以通过 vm 可以访问到定义在 Vue.prototype 的属性和方法。

# 二、Vue.extend实现继承

Vue.extend 是定义在 Vue这个构造函数上的方法。

该方法主要用于创建 Vue构造器的子类，该子类继承 Vue构造器上的方法。

虽然 Vue在技术上不是传统意义上的类，但是`Vue.extend`提供了一种类似于面向对象编程中继承的方式来定义组件。

```js
// 对原函数进行了一些简化 只保留了核心
Vue.extend = function(){
    // this 为 Vue构造函数
    const Super = this;
    // Sub 为 VueComponent构造函数，代表组件
    const Sub = function VueComponent(this){
        // 和 Vue构造函数一样 会调用_init方法
        this._init(options);
    };
    // 基于 Vue.prototype 创建一块新的内存，共享其属性和方法。
    Sub.prototype = Object.create(Super.prototype);
    // 修正 constructor指向
    Sub.prototype.constructor = Sub;
    return Sub;
}
```

我们简单的分析一下这几行代码。

首先，声明了Super变量和 Sub变量分别指向`Vue构造函数`，和 `VueComponent构造函数`。

然后基于`Vue原型对象`创建了一块新的内存地址，并将`VueComponent构造函数`的原型对象指向这块地址。
 
所以基于`VueComponent构造函数`创建的实例可以使用定义在 Vue原型上的属性和方法。 

因为原型对象上存在 constructor，所以需要进行修正constructor来确保 constructor指向正确的`VueComponent构造函数`。

这种实现继承的方法被称为`原型链继承`。

## 2.1 在Vue源码内部创建组件时使用

extend方法是为了创建子构造器。

在render阶段（生成组件的vnode）时，会通过 extend方法创建子类构造器。

```js
export function createComponent(Ctor,context){
    // _base在引入时被设置为 Vue
    const base = context.$options._base;
    // 创建Vue子类构造函数
    Ctor = base.extend();
    return new Vnode(
        {componentOptions:{Ctor}}
    )
}
```

> 这里的 context是vm实例，`vm.$options`是在初始化构造函数时通过 `mergeOptions`函数生成的。

然后在update阶段（渲染页面），会基于Ctor生成对应的实例，执行相应的初始化、渲染方法等。

```js
// 每个组件都会调用这个方法来创建对应的实例
export function createComponentInstanceForVnode(vnode){
    return new vnode.componentOptions.Ctor()
}
```

> 所以每一个 Vue组件都存在一个实例，但是这个实例对应的构造函数是 VueComponent，并不是 Vue本身。

## 2.2 在业务中的实际应用场景

在实际业务场景中，有很多地方都可以利用 extend 来扩展组件。

包括创建可复用的组件、动态组件、全局和局部注册、临时组件、自定义指令和插件。

我们常用的 Element框架内部就利用了 Vue.extend 来扩展某些临时性的组件，例如模态对话框、提示信息等。

通过 Vue.extend 创建的组件构造函数可以按需创建和销毁，适合这类临时组件的管理。

```js
const NotificationConstructor = Vue.extend(Main);

let instance;

const Notification = function(options) {
    instance = new NotificationConstructor({
        data: options
    });
    // 使用$mount可以创建一个DOM节点 并挂载到$el上
    instance.$mount();
    document.body.appendChild(instance.$el);
    return instance;
} 
```

> $mount方法如果没有传参可以生成一个真实的 DOM。

# 三、mergeOptions

mergeOptions用于合并多个option，整合成一个完整的 option。

在源码中有多处地方使用了这个方法。

## 3.1 使用场景

### 3.1.1 Vue.prototype._init函数内部

```js
Vue.prototype._init = function(options){
    const vm = this;
    vm.$options = mergeOptions(
        resolveConstructor(vm.constructor),
        options || {},
        this
    )
}
```

在实例化 `Vue / VueComponent构造函数`时，会调用_init方法进行初始化。

使用 resolveConstructor 函数获取构造函数上的 options选项，然后再和当前传入的选项进行合并，并赋值给 vm.$options。

> 可以看出实例上的$options属性既包含了 `Vue / VueComponent构造函数`上的 options选项，也包含了传入的 options。

### 3.1.2 Vue.extend 函数内部

```js
Vue.extend = function(extendOptions){
    //省略部分代码
    Sub.options = mergeOptions(Super.options,extendOptions);
}
```
这里就是将 Vue.options和传入的 extendOptions进行合并，然后赋值到子类构造器的 options上。

### 3.1.3 Vue.mixin 函数内部

```js
Vue.mixin = function(mixin){
    this.options = mergeOptions(this.options, mixin)
    return this;
}
```
Vue.mixin将 Vue.options 和传入的mixin进行合并，然后赋值到 Vue.options上。

> 然后在Vue.extends生成 VueComponent构造函数时，可以将 options合并到子类构造器的 options中。

在实例化 VueComponent后，将 options合并在一起赋值给 vm.$options，进而可以影响所有的 Vue实例。

## 3.2 resolveConstructorOptions

这个方法是在_init函数中调用，用于获取构造函数上的 options.

我们一起来研究一下这个方法。

```js

```






