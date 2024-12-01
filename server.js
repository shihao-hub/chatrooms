"use strict";

// 核心模块
const http = require("http");
const fs = require("fs");
const path = require("path");
// 用户自定义模块
const chatServer = require("./lib/chat_server");
// 第三方模块
const mime = require("mime");

// 2024-08-28：这个 const 其实没什么必要。。。不如全 let 呢，const 还耗费心力

// s-const
const events = {
    request: "request"
};
// d-const mut
const logger = {
    info: console.log,
    error: console.error
};
const print = console.log;
const cache = {};


/*
* 第一步，创建静态文件服务器 -> serverStatic、send404、sendFile
* 第二步，处理浏览器与服务器之间的通信 -> socket.io 模块
* */


// 创建 HTTP 服务器
let server = http.createServer(function (request, response) {
    print(new Date().toLocaleString() + " HTTP: " + request.url);
    let filePath = "";
    switch (request.url) {
        case ("/"): {
            filePath = "public/index.html";
            break;
        }
        default: {
            filePath = "public" + request.url; // (Q)!: url 是 / 开头的吗？而且按照此处的意思，url 就是资源路径
            break;
        }
    }
    const absPath = "./" + filePath;
    serverStatic(response, cache, absPath);
}).listen(3002, function () {
    print("Server running at http://127.0.0.1:3002");
});

// 自定义模块，用来处理基于 Socket.IO 的服务端聊天功能
chatServer.listen(server);


// 测试用：测试 server 服务器自动发出的一个事件 -> 确实会
server.on(events.request, (...args) => {

});

// ------------------------------------------------------------------------------------------------------------------ //
function send404(response) {
    const filePath = "./404.html";
    fs.readFile(filePath, (err, data) => {
        if (err) {
            response.writeHead(200, {
                "Content-Type": mime.lookup(path.basename(filePath)) + "; charset=utf-8;"
            });
            response.end(filePath + " 文件不存在");
            return;
        }
        sendFile(response, filePath, data);
    });
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {
        "Content-Type": mime.lookup(path.basename(filePath)) + "; charset=utf-8;"
    });
    response.end(fileContents);
}


function serverStatic(response, cache, absPath) {
    /*
    * 提供静态文件服务，即将服务器上的文件响应给浏览器
    * 涉及文件缓存（更快）
    * */
    if (cache[absPath]) return sendFile(response, absPath, cache[absPath]);

    fs.exists(absPath, function (exists) {
        if (!exists) {
            print(absPath + " 文件不存在");
            return send404(response);
        }
        fs.readFile(absPath, function (err, data) {
            if (err) return send404(response);
            cache[absPath] = data;
            sendFile(response, absPath, data);
        });
    });
}
