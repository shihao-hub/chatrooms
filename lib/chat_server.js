"use strict";


const socketio = require("socket.io");

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


// shared
const nickNames = {}; // <socket.id, name>
const namesUsed = []; // name
const currentRoom = {}; // <socket.id, room>

let guestNumber = 1;


function listenForEvent(socket, event, fn) {
    socket.on(event, fn);
}

function pushEvent(socket, event, data) {
    socket.emit(event, data);
}


function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    /* 分配用户昵称，如果有新的连接过来，分配一个原始编号名 */
    const name = constants.initial_name_prefix + guestNumber;
    nickNames[socket.id] = name;
    pushEvent(socket, events.nameResult, {success: true, name: name});
    namesUsed.push(name); // 记录下来已经用过的名字
    return guestNumber + 1;
}

function joinRoom(io, socket, room) {
    /* 与进入聊天室相关的逻辑 */
    currentRoom[socket.id] = room;

    // (Q)!: socket.join：让客户端加入一个特定的房间或频道，以便能够接收和发送消息
    // 将用户加入 Socket.IO 房间很容易，只要调用 socket 对象上的 join 方法即可！！！
    socket.join(room);

    pushEvent(socket, events.joinResult, {room: room});
    pushEvent(socket.broadcast.to(room), events.message, {
        text: nickNames[socket.id] + " has joined " + room + "."
    });

    const usersInRoomSummary = generateUsersInRoomSummaryStr();
    if (usersInRoomSummary === null) {
        // (Q)!: 将房间里其他用户的汇总发送给这个用户，这个用户是谁？socket！connect！
        pushEvent(socket, events.message, {text: usersInRoomSummary});
    }

    function generateUsersInRoomSummaryStr() {
        let usersInRoom = io.sockets.clients(room);
        if (usersInRoom.length > 1) {
            let usersInRoomSummary = "Users currently in " + room + ": ";
            // 类似打印列表而已
            for (const i in usersInRoom) {
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
        return null;
    }
}

function handleMessageBroadcasting(socket) {
    /* 处理用户发送过来的聊天消息 */

    // 监听到客户端的事件（发消息了）发生，则向房间广播（通知所有用户，给他们发送信息）
    // 所有用户在客户端监听到事件发生，则取到数据进行相关处理或者渲染
    listenForEvent(socket, events.message, (data) => {
        pushEvent(socket.broadcast.to(data.room), events.message, {
            text: nickNames[socket.id] + ": " + data.text
        });
    });
}

function handleNameChangeAttempts(socket) {
    /* 更名请求的处理逻辑 */
}

function handleRoomJoining(socket) {
    /* 创建房间 */
}

function handleClientDisconnect(socket) {
    /* 用户断开连接 */
}

exports.events = events;
exports.listen = function (server) {
    // 1. 启动 Socket.IO 服务器，运行它搭载在已有的 HTTP 静态资源服务器上
    const io = socketio.listen(server);
    // 2. 限定 Socket.IO 向控制台输出日志的详细程度
    io.set("log level", 1);
    // 3. 确定如何处理每个接进来的连接
    listenForEvent(io.sockets, "connection", (client_socket) => {
        // 注意：client_socket 就是用户和服务器建立的那个连接，可以用来标识用户！

        // 1. 分配 id，加入默认聊天室 Lobby
        guestNumber = assignGuestName(client_socket, guestNumber);
        joinRoom(io, client_socket, constants.default_room);

        // 2.处理用户的消息
        handleMessageBroadcasting(client_socket);

        // 3. 改名命令
        handleNameChangeAttempts(client_socket);

        // 4. 聊天室的创建命令、聊天室的变更
        handleRoomJoining(client_socket);

        // 用户发出请求时，向其提供已经被占用的聊天室列表
        // listenForEvent(client_socket, events.rooms, function (...args) {
        //     pushEvent(client_socket, events.rooms, io.sockets.manager.rooms);
        // });

        // 用户断开连接后的清除逻辑
        handleClientDisconnect(client_socket, nickNames, namesUsed);
    });
};

