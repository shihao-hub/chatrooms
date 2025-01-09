function listenForEvent(socket, event, fn) {
    socket.on(event, fn);
}

function pushEvent(socket, event, data) {
    socket.emit(event, data);
}

class ListenHelper {

    constructor(constants, events, io, client_socket) {
        this.constants = constants;
        this.events = events;
        this.io = io;

        // NOTE:
        //  shared: 此处重构前是放在文件头定义的，太混乱，放到类里面就整齐的（但是思考一下会发现，OOP 的功能之一似乎就是天然帮我们组织数据！但是函数+闭包似乎也很方便，只需要模块化就像类了，比如 Lua）
        this.nickNames = {}; // <socket.id, name>
        this.namesUsed = []; // name
        this.currentRoom = {}; // <socket.id, room>
    }


    /**
     * 分配用户昵称，如果有新的连接过来，分配一个原始编号名
     */
    assignGuestName(client_socket, guestNumber) {
        /* 分配用户昵称，如果有新的连接过来，分配一个原始编号名 */
        const constants = this.constants;
        const socket = this.events;
        const events = this.events;
        const namesUsed = this.namesUsed;
        const nickNames = this.nickNames;

        const name = constants.initial_name_prefix + guestNumber;

        nickNames[socket.id] = name;
        pushEvent(socket, events.nameResult, {success: true, name: name});
        namesUsed.push(name); // 记录下来已经用过的名字
        return guestNumber + 1;
    }

    /**
     * 与进入聊天室相关的逻辑
     */
    joinRoom(client_socket, room) {
        const io = this.io;
        const events = this.events;
        const currentRoom = this.currentRoom;
        const nickNames = this.nickNames;

        class Local {
            generateUsersInRoomSummaryStr() {
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

        const loc = new Local();

        const socket = client_socket;

        currentRoom[socket.id] = room;

        // (Q)!: socket.join：让客户端加入一个特定的房间或频道，以便能够接收和发送消息
        // 将用户加入 Socket.IO 房间很容易，只要调用 socket 对象上的 join 方法即可！！！
        socket.join(room);

        pushEvent(socket, events.joinResult, {room: room});
        pushEvent(socket.broadcast.to(room), events.message, {
            text: nickNames[socket.id] + " has joined " + room + "."
        });

        const usersInRoomSummary = loc.generateUsersInRoomSummaryStr(nickNames);
        if (usersInRoomSummary === null) {
            // (Q)!: 将房间里其他用户的汇总发送给这个用户，这个用户是谁？socket！connect！
            pushEvent(socket, events.message, {text: usersInRoomSummary});
        }

    }

    /**
     * 处理用户发送过来的聊天消息
     */
    handleMessageBroadcasting(client_socket) {
        const events = this.events;
        const nickNames = this.nickNames;

        const socket = client_socket;

        // 监听到客户端的事件（发消息了）发生，则向房间广播（通知所有用户，给他们发送信息）
        // 所有用户在客户端监听到事件发生，则取到数据进行相关处理或者渲染
        listenForEvent(socket, events.message, (data) => {
            pushEvent(socket.broadcast.to(data.room), events.message, {
                text: nickNames[socket.id] + ": " + data.text
            });
        });
    }

    /**
     * 更名请求的处理逻辑
     */
    handleNameChangeAttempts(client_socket) {

    }

    /**
     * 创建房间
     */
    handleRoomJoining(client_socket) {

    }

    /**
     * 用户断开连接
     */
    handleClientDisconnect(client_socket) {


    }
}

module.exports = {
    listenForEvent: listenForEvent,
    pushEvent: pushEvent,
    ListenHelper: ListenHelper,
};

