let util = require('./lib/module/__init__').utils;


console.log(util);

/*
### 变量声明
JavaScript 会自动将变量声明“提升”（hoist）到代码块（block）的头部。

```javascript
if (!x) {
  var x = {};
}

// 等同于
var x;
if (!x) {
  x = {};
}
```

这意味着，变量 x 是 if 代码块之前就存在了。为了避免可能出现的问题，最好把变量声明都放在代码块的头部。

```javascript
for (var i = 0; i < 10; i++) {
  // ...
}

// 写成
var i;
for (i = 0; i < 10; i++) {
  // ...
}
```

上面这样的写法，就容易看出存在一个全局的循环变量i。

另外，所有函数都应该在使用之前定义。函数内部的变量声明，都应该放在函数的头部。

 */
let fn = function () {

};