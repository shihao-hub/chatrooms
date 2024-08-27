"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const mime = require("mime");


const chatServer = require("./lib/chat_server");


const print = console.log;
const cache = {};


let server = http.createServer(function (request, response) {
    let filePath = "";
    switch (response.url) {
        case ("/"): {
            filePath = "public/index.html";
            break;
        }
        default: {
            filePath = "public" + response.url; // (Q)!: url 是 / 开头的吗？
            break;
        }
    }
    let absPath = "./" + filePath;
    serverStatic(response, cache, absPath);
});

server.listen(3002, function () {
    print("Server running at http://127.0.0.1:3002");
});

chatServer.listen(server);

// ------------------------------------------------------------------------------------------------------------------ //
function send404(response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Error 404: resource not found.");
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {
        "Content-Type": mime.lookup(path.basename(filePath))
    });
    response.end(fileContents);
}


function serverStatic(response, cache, absPath) {
    /**
     * 提供静态文件服务，即将服务器上的文件响应给浏览器
     * 涉及文件缓存
     */
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
        return;
    }
    fs.exists(absPath, function (exists) {
        if (!exists) {
            send404(response);
            return;
        }
        fs.readFile(absPath, function (err, data) {
            if (err) {
                send404(response);
                return;
            }
            cache[absPath] = data;
            sendFile(response, absPath, data);
        });
    });
}
