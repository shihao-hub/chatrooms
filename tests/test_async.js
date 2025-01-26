// 下面是两个函数 f1 和 f2，编程的意图是 f2 必须等到 f1 执行完成，才能执行。

function f1(cb) {
    console.log('f1');
    f1.trigger('done'); // 类比 Lua 的 PushEvent

    if (cb) {
        cb();
    }
}


function f2() {
    console.log('f2');
}

// f1();
// f2();

// f1(f2);

// JQuery
// f1.on('done', f2); // 类比 Lua 的 ListenForEvent