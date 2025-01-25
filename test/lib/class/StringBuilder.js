function StringBuilder() {
    this._buffer = [];
}

StringBuilder.prototype = {
    constructor: StringBuilder,
    add: function (str) {
        this._buffer.push(str);
    },
    toString: function () {
        return this._buffer.join('');
    }
};

if (require.main === module) {
    
}

exports.StringBuilder = StringBuilder;