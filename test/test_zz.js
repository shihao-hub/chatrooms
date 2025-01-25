var a = 1;
var x = function () {
    console.log(a);
};

function f() {
    a = 2;
    x();
}

f(); // 1

console.log(a);


function getMessage() {
    console.log(this);
    return 'this is a message';
}

// getMessage();
// console.log({});


var o = {
    v: 'hello',
    p: ['a1', 'a2'],
    f: function f() {
        var self = this;
        this.p.forEach(function (item) {
            console.log(self.v + ' ' + item);
        });
    }
};

o.f();