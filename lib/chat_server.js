"use strict";

// 3rd
const socketio = require("socket.io");

// s-const
const constants = {
    initial_name_prefix: "Guest",
    default_room: "Lobby"
};
const events = {
    connection: "connection", // 用户连接事件
    rooms: "rooms", //
    nameResult: "nameResult", // 用户改名事件
    joinResult: "joinResult",
    message: "message",
};

const print = console.log;

// shared
const nickNames = {}; // <socket.id, name>
const namesUsed = []; // name
const currentRoom = {}; // <socket.id, room>
let guestNumber = 1;
let io = null;

exports.events = events;
exports.listen = function (server) {
    io = socketio.listen(server); // 启动 Socket.IO 服务器，运行它搭载在已有的 HTTP 服务器上
    io.set("log level", 1);

    io.sockets.on(events.connection, function (socket) {
        // 注意：socket 就是用户和服务器建立的那个连接，可以标识为用户！

        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, constants.default_room); // 在用户连接上来时，把他放入聊天室 Lobby 里

        // 处理用户的消息、改名命令、聊天室的创建命令、聊天室的变更
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        socket.on(events.rooms, function (_socket) {
            print(_socket);

            socket.emit(events.rooms, io.sockets.manager.rooms);
        });

        handleClientDisconnect(socket, nickNames, namesUsed);
    });
};

function ListenForEvent(socket, event, fn) {
    socket.on(event, fn);
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    /* 分配用户昵称
    * 如果有新的连接过来，分配一个原始编号名
    * */
    const name = constants.initial_name_prefix + guestNumber;
    nickNames[socket.id] = name;
    socket.emit(events.nameResult, {success: true, name: name});
    namesUsed.push(name); // 记录下来已经用过的名字
    return guestNumber + 1;
}

function joinRoom(socket, room) {
    /* 与进入聊天室相关的逻辑 */
    function generateUsersInRoomSummaryStr() {
        let usersInRoom = io.sockets.clients(room);
        if (usersInRoom.length > 1) {
            let usersInRoomSummary = "Users currently in " + room + ": ";
            for (let i in usersInRoom) {
                let userSocketId = usersInRoom[i].id;
                if (userSocketId !== socket.id) {
                    if (i > 0) {
                        usersInRoomSummary += ", ";
                    }
                    usersInRoomSummary += nickNames[userSocketId];
                }
            }
            usersInRoomSummary += ".";
            return usersInRoomSummary;
        }
        return "";
    }

    currentRoom[socket.id] = room;

    socket.join(room); // (Q)!: socket.join：让客户端加入一个特定的房间或频道，以便能够接收和发送消息
    socket.emit(events.joinResult, {room: room});
    // 向房间广播
    socket.broadcast.to(room).emit(events.message, {
        text: nickNames[socket.id] + " has joined " + room + "."
    });

    const usersInRoomSummary = generateUsersInRoomSummaryStr();
    if (usersInRoomSummary !== "") {
        // (N)!: 将房间里其他用户的汇总发送给这个用户，这个用户是谁？socket！connect！
        socket.emit(events.message, {text: usersInRoomSummary});
    }
}

function handleMessageBroadcasting(socket, nickNames, namesUsed) {
    /* 处理用户发送过来的聊天消息 */

    // 监听到客户端的事件（发消息了）发生，则向房间广播（通知所有用户，给他们发送信息）
    // 所有用户在客户端监听到事件发生，则取到数据进行相关处理或者渲染
    socket.on(events.message, function (data) {
        socket.broadcast.to(data.room).emit(events.message, {
            text: nickNames[socket.id] + ": " + data.text
        });
    });
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    /* 更名请求的处理逻辑 */
}

function handleRoomJoining(socket) {
    /* 创建房间 */
}

function handleClientDisconnect(socket, nickNames, namesUsed) {
    /* 用户断开连接 */
}
