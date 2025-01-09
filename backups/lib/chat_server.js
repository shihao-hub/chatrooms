"use strict";


const socketio = require("socket.io");

const {pushEvent, listenForEvent, ListenHelper} = require("./_chat_server_helper");

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


let _guestNumber = 0;

function incrGuestNumber() {
    _guestNumber += 1;
    return _guestNumber;
}

function getGuestNumber() {
    return _guestNumber;
}


exports.events = events;
// exports.listen = function (server) {
//     // 1. 启动 Socket.IO 服务器，运行它搭载在已有的 HTTP 静态资源服务器上
//     const io = socketio.listen(server);
//
//     // 2. 限定 Socket.IO 向控制台输出日志的详细程度
//     io.set("log level", 1);
//
//     const listenHelper = new ListenHelper(constants, events, io);
//
//     // 3. 确定如何处理每个接进来的连接
//     listenForEvent(io.sockets, "connection", (client_socket) => {
//         // 注意：client_socket 就是用户和服务器建立的那个连接，可以用来标识用户！
//
//         // SLAP
//         // 1. 分配 id
//         // 2. 加入默认聊天室
//         // 3. 监听：处理用户的消息
//         // 4. 监听：改名命令
//         // 5. 监听：聊天室的创建命令、聊天室的变更
//
//         listenHelper.assignGuestName(client_socket, incrGuestNumber());
//
//         listenHelper.joinRoom(io, client_socket, constants.default_room);
//
//         listenHelper.handleMessageBroadcasting(client_socket);
//
//         listenHelper.handleNameChangeAttempts(client_socket);
//
//         listenHelper.handleRoomJoining(client_socket);
//
//         // 用户发出请求时，向其提供已经被占用的聊天室列表
//         // listenForEvent(client_socket, events.rooms, function (...args) {
//         //     pushEvent(client_socket, events.rooms, io.sockets.manager.rooms);
//         // });
//
//         // 用户断开连接后的清除逻辑
//         listenHelper.handleClientDisconnect(client_socket);
//     });
// };

function generateUniqueGuestName() {
    const guestNumber = incrGuestNumber();
    const guestName = `Guest ${guestNumber}`;
    return guestName;
}

exports.listen = (function () {
    const DEFAULT_ROOM_NAME = "Lobby";

    const nickNames = {};
    const usedNames = [];
    const rooms = {};


    return function (server) {
        // 启动 Socket.IO 服务器，运行它搭载在已有的 HTTP 静态资源服务器上
        const io = socketio.listen(server);

        // 限定 Socket.IO 向控制台输出日志的详细程度
        io.set("log level", 1);

        // 确定如何处理每个接进来的连接
        io.sockets.on("connection", (socket) => {
            // 注意：client_socket 就是用户和服务器建立的那个连接，可以用来标识用户！

            // SLAP
            // 1. 分配 id
            // 2. 加入默认聊天室
            // 3. 监听：处理用户的消息
            // 4. 监听：改名命令
            // 5. 监听：聊天室的创建命令、聊天室的变更

            /*
            * ### 关于 event
            * - namingCompleted, { success:boolean, name:string }: 客户命名完成触发的事件
            * - message, { text:string }
            * */

            // 此处将保证用户名唯一：重构之注释可能是提取函数的标志
            // 注意这个写法可以参考 python 的 uuid 的使用感觉
            const guestName = generateUniqueGuestName();

            // 分配 id
            (function () {
                nickNames[socket.id] = guestName;
                usedNames.push(guestName);

                socket.emit("namingCompleted", {
                    success: true,
                    name: guestName
                });
            }());

            // 加入默认聊天室
            (function () {
                const roomName = DEFAULT_ROOM_NAME;

                socket.join(roomName);
                rooms[socket.id] = roomName;

                socket.emit("joiningCompleted", {
                    success: true,
                    roomName: roomName
                });

                // Question: socket.broadcast.to 是什么？
                socket.broadcast.to(roomName).emit("message", {
                    text: `${nickNames[socket.id]} has joined ${roomName}`
                });

                // TODO: 获得房间的用户列表，返回值即 client_sockets
                const usersInRoom = io.sockets.clients();

                const messages = [`Users currently in ${roomName}: `];
                for (const user in usersInRoom) {
                    // 排除自己
                    if (user.id === socket.id) {
                        continue;
                    }
                    messages.push(`${nickNames[user.id]}`);
                }

                socket.emit("message", {
                    text: messages.join(", ")
                });
            }());

            // 监听：处理用户的消息
            (function () {
                // 客户收到信息时，将该信息转发给同一 room 中的其他连接/客户
                socket.on("message", (data) => {
                    socket.broadcast.to(data.roomName).emit("message", {
                        text: data.text
                    });
                });
            }());
        });
    };
}());

