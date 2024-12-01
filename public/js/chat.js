"use strict";


// const
const events = {
    message: "message",
    join: "join",
};

class Chat {
    constructor(socket) {
        let self = this;

        self.socket = socket;
    }

    sendMessage(room, text) {
        let self = this;

        self.socket.emit(events.message, {room: room, text: text});
    }

    changeRoom(room) {
        let self = this;

        self.socket.emit(events.join, {newRoom: room});
    }

    processCommand(command) {

    }
}

