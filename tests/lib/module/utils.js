function _myIsNaN(value) {
    return value !== value;
}


function isNull(obj) {
    // instanceof 运算符可以判断一个值是否为非 null 的对象。
    // null instanceof Object // false
    return !(obj instanceof Object);
}

function bool(value) {
    if (value === undefined
        || value === null
        || value === false
        || value === 0
        || value === ''
        || isNaN(value)) {
        return false;
    }
    return true;
}

function b64Encode(str) {
    // 要将非 ASCII 码字符转为 Base64 编码，必须中间插入一个转码环节
    return btoa(encodeURIComponent(str));
}

function b64Decode(str) {
    return decodeURIComponent(atob(str));
}

if (require.main === module) {
    console.log(bool(undefined));
    console.log(bool(null));
    console.log(bool(0));
    console.log(bool(false));
    console.log(bool(''));
    console.log(bool(NaN));
    console.log('------');

    // tip: slice 是左闭右开
    console.log((function () { /*
        line 1
        line 2
        line 3
    */
    }).toString().split('\n').slice(1, -2).map((e) => e.trim()).join('\n'));
    console.log('------');


    console.log('\xA9');
    console.log('\uD834\uDF06');
    console.log('------');


    let target = b64Encode('你好');
    console.log(target);
    let source = b64Decode(target);
    console.log(source);
    console.log('------');


    let obj = {
        a: 1,
        b: 2,
    };

    console.log(Object.keys(obj));
    if ('toString' in obj) {
        console.log(obj.hasOwnProperty('toString')); // false
    }

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            console.log('not hasOwnProperty: ', key);
            continue;
        }
        console.log('键名：', key, '键值：', obj[key]);
    }

    // 建议不要使用 with 语句，可以考虑用一个临时变量代替 with
    with (obj) {
        console.log(a);
    }
    console.log('------');

    console.log(Math.max(10, 2, 4, 15, 9));
    console.log(Math.max.apply(null, [10, 2, 4, 15, 9]));
    console.log(Array('a', undefined, 'b'));
    console.log(Array.apply(null, ['a', , 'b']));

    console.log(Array.prototype.slice.apply({0: 1, 1: 2, length: 2}, [0, 1]));
    console.log('------');

    // Function.prototype.call 的 this 是 Function.prototype
    // Function.prototype.call.bind(Array.prototype.slice) 将 call 的 this 变成了 Array.prototype.slice <==> Array.prototype.slice.call
    // NOTE:
    //   Function.prototype.bind.call(greet, obj) <==> greet.call(obj)
    let slice = Function.prototype.call.bind(Array.prototype.slice);
    console.log(slice([1, 2, 3], 0, 1));

    function f() {
        console.log(this.value);
    }

    console.log(Function.prototype.bind);
    console.log(Function.prototype.call);
    console.log(Function.prototype.bind.call);
    console.log(Function.prototype.bind.call(f, {value: 111}));
    console.log('------');

    console.log(Object.constructor.name); // Function
    console.log(Array.constructor.name); // Function

    function Foo() {
    }

    let foo = new Foo();
    console.log(foo.constructor.name); // Foo

    console.log('------');

    console.log(isNull(null));
    console.log(isNull({}));
}


exports.isNull = isNull;
exports.bool = bool;
exports.b64Encode = b64Encode;
exports.b64Decode = b64Decode;
