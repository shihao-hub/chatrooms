"use strict";


const socketio = require("socket.io");

const {pushEvent, listenForEvent, ListenHelper} = require("./chat_server_helper");

// s-const
const constants = {
    initial_name_prefix: "Guest",
    default_room: "Lobby"
};

// 记录一下有哪些事件
const events = {
    connection: "connection", // 用户连接事件
    rooms: "rooms", //
    nameResult: "nameResult", // 用户改名事件
    joinResult: "joinResult",
    message: "message",
};


let guestNumber = 1;


exports.events = events;
exports.listen = function (server) {
    // 1. 启动 Socket.IO 服务器，运行它搭载在已有的 HTTP 静态资源服务器上
    const io = socketio.listen(server);

    // 2. 限定 Socket.IO 向控制台输出日志的详细程度
    io.set("log level", 1);

    const listenHelper = new ListenHelper(constants, events, io);

    // 3. 确定如何处理每个接进来的连接
    listenForEvent(io.sockets, "connection", (client_socket) => {
        // 注意：client_socket 就是用户和服务器建立的那个连接，可以用来标识用户！

        // 1. 分配 id，加入默认聊天室 Lobby
        guestNumber = listenHelper.assignGuestName(client_socket, guestNumber);
        listenHelper.joinRoom(io, client_socket, constants.default_room);

        // 2.处理用户的消息
        listenHelper.handleMessageBroadcasting(client_socket);

        // 3. 改名命令
        listenHelper.handleNameChangeAttempts(client_socket);

        // 4. 聊天室的创建命令、聊天室的变更
        listenHelper.handleRoomJoining(client_socket);

        // 用户发出请求时，向其提供已经被占用的聊天室列表
        // listenForEvent(client_socket, events.rooms, function (...args) {
        //     pushEvent(client_socket, events.rooms, io.sockets.manager.rooms);
        // });

        // 用户断开连接后的清除逻辑
        listenHelper.handleClientDisconnect(client_socket);
    });
};

