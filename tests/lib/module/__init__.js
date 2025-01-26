let test_module = {};


test_module.m1 = function () {
    console.log('module.m1');
};


exports.test_module = test_module;

// js 的 require 支持相对路径！而且是相对当前文件的路径，而不是 src 源代码路径
exports.util = require('./utils');