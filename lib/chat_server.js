"use strict";

const socketio = require("socket.io");

const nickNames = {};
const namesUsed = [];
const currentRoom = {};

let guestNumber = 1;
let io;


exports.listen = function (server) {
    io = socketio.listen(server);
    io.set("log level", 1);

    io.sockets.on("connection",function (socket) {
        guestNumber = assignGuestName();
    })
};

