let http = require("node:http");
let fs = require("node:fs");
let path = require("node:path");

let mime = require("mime");

let chatServer = require("./lib/chat_server"); // 加载自定义模块

let cache = {};

/* ------------------------------------------------------------------------------------------------------------------ */
/**********************************************************************************************************************/
// ------------------------------------------------------------------------------------------------------------------ //


// ------------------------------------------------------------------------------------------------------------------ //
// 所请求的文件不存在时发送404错误
function _send404(response) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("Error 404: response not found");
    response.end();
}

// 提供文件数据服务
function _sendFile(response, filePath, fileContents) {
    response.writeHead(200,
        {
            "Content-Type": mime.lookup(path.basename(filePath))
        }
    );
    response.end(fileContents);
}

// 提供静态文件服务
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        _sendFile(response, absPath, cache[absPath]);
        return;
    }
    fs.exists(absPath, function (exists) {
        if (exists) {
            fs.readFile(absPath, function (err, data) {
                console.log("readFile");
                if (err) {
                    _send404(response);
                } else {
                    cache[absPath] = data;
                    _sendFile(response, absPath, data);
                }
            });
        } else {
            _send404(response);
        }
    });
}

// ------------------------------------------------------------------------------------------------------------------ //
// 创建HTTP服务器的逻辑
let server = http.createServer(function (request, response) {
    let filePath = false;
    if (request.url === "/") {
        filePath = "public/index.html";
    } else {
        filePath = "public" + request.url;
    }
    let absPath = "./" + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3002, function () {
    console.log("Server running at http://127.0.0.1:3002");
});

chatServer.listen(server);
