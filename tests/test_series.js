let items = [1, 2, 3, 4, 5, 6];
let results = [];

function async(arg, callback) {
    console.log('参数为 ' + arg + ' , 1秒后返回结果');
    setTimeout(function () {
        callback(arg * 2);
    }, 1000);
}

function final(value) {
    console.log('完成: ', value);
}

function series(item) {
    /**
     * 用于串行执行，items 是串行执行的任务参数队列，results 是每次执行结果的缓存区。
     */
    if (item) {
        async(item, function (result) {
            results.push(result);
            return series(items.shift());
        });
    } else {
        return final(results[results.length - 1]);
    }
}

series(items.shift());