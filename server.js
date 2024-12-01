"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const mime = require("mime");

const chatServer = require("./lib/chat_server");


const cache = {
    data: {},
    // (N)!: set(){} 和 set:()=>{} 不一样，后者是存粹的函数，前者不只是函数，比如前者可以访问 this，后者没有 this
    set(key, value) {
        this.data[key] = value;
    },
    get(key) {
        return this.data[key];
    }
};

function responseServerStatic(response, absPath) {
    /*
    * 提供静态文件服务，即将服务器上的文件响应给浏览器
    * 涉及文件缓存（更快），而且因为是静态资源，所以缓存很好用
    * */
    if (cache.get(absPath)) {
        console.log(new Date().toLocaleString() + ": " + "取出缓存中键为 " + absPath + " 的数据");
        return sendFile(response, absPath, cache.get(absPath));
    }

    fs.exists(absPath, (exists) => {
        if (!exists) {
            // console.log(new Date().toLocaleString() + ": " + absPath + " 文件不存在");
            return send404(response);
        }
        fs.readFile(absPath, (err, data) => {
            if (err) {
                return send404(response);
            }
            cache.set(absPath, data);
            sendFile(response, absPath, data);
        });
    });


    function sendFile(response, filePath, fileContents, status) {
        status = status || 200;
        response.writeHead(status, {
            // 自动找到对于文件的 MIME
            "Content-Type": mime.lookup(path.basename(filePath)) + "; charset=utf-8;"
        });
        response.write(fileContents);
        response.end();
    }

    function send404(response) {
        const filePath = "./public/404.html";
        fs.readFile(filePath, (err, data) => {
            sendFile(response, filePath, data, 404);
        });
    }

}

(function () {
    /* 1. 创建静态文件服务器 -> serverStatic、send404、sendFile */
    const server = http.createServer(null, (request, response) => {
        console.log(new Date().toLocaleString() + ": " + "HTTP " + request.url);
        // url 分发
        let filePath = "";
        switch (request.url) {
            case ("/"): {
                filePath = "./public/index.html";
                break;
            }
            default: {
                // (N)!: 这个必须要，服务器需要提供将静态资源发给浏览器的功能
                filePath = "./public" + request.url; // (Q)!: url 是 / 开头的吗？而且按照此处的意思，url 就是资源路径
                break;
            }
        }
        responseServerStatic(response, filePath);
    }).listen(3002, null, null, () => {
        console.log("Server running at http://127.0.0.1:3002");
    });

    // 处理浏览器与服务器之间的通信。基于 Socket.IO 的服务端聊天功能。
    // 这个 chatServer 也算是个服务器？上面创建的是静态资源服务器？
    // listen 称为聊天服务器函数
    chatServer.listen(server);


    // // 测试用：测试 server 服务器自动发出的一个事件 -> 确实会
    // server.on("request", (...args) => {
    //     // console.log(args);
    // });
})();




