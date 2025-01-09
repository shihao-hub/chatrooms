"use strict";


class Command {
    execute() {

    }
}

class JoinCommand extends Command {

}

class NickCommand extends Command {

}

class Chat {
    constructor(socket) {
        const self = this;

        self.socket = socket;
    }

    sendMessage(roomName, text) {
        this.socket.emit("message", {
            roomName: roomName,
            text: text
        });
    }

    changeRoom(roomName) {
        this.socket.emit("join", {
            newRoom: roomName
        });
    }

    processCommand(command) {
        let words = command
    }
}

