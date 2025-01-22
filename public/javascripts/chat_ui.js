let cache = {
    data: {},
    // NOTE: set(){} 和 set:()=>{} 不一样，后者是存粹的函数，前者不只是函数，比如前者可以访问 this，后者没有 this
    set(key, value) {
        this.data[key] = value;
    },
    get(key) {
        return this.data[key];
    }
};

// ------------------------------------------------------------------------------------------------------------------ //
let userName;

// 在用户页面中显示消息及可用房间
function _divEscapedContentElement(message, isRoom) {
    if (isRoom) {
        return "<div id=\"message-content\">" + message + "</div>";
    } else {
        return "<div>" +
            "<div id=\"userNameContent\" class=\"text-info\">" + userName + ":" + "</div>" +
            "<div id=\"message-content\" class=\"text-warning\">" + message + "</div>" +
            "</div>";
    }
}

function _divSystemContentElement(message) {
    return $("<div id=\"systemMessage-content\"></div>").html("<i>" + message + "</i>");
}

// ------------------------------------------------------------------------------------------------------------------ //
// 处理原始的用户输入
function _processUserInput(chatApp, socket) {
    let $sendMessage = $("#send-message");
    let $messages = $("#messages");
    let $room = $("#room");

    let message = $sendMessage.val();
    let systemMessage;

    // if (message.charAt === null) {
    //     message.charAt = function () {
    //         throw new Error("chatAt function don't exist.");
    //     };
    // }

    if (message.charAt(0) === "/") { // 如果是用户输入的内容以斜杠开头, 将其作为聊天命令
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $messages.append(_divSystemContentElement(systemMessage));
        }
    } else {
        // 将非命令输入广播给其他用户
        chatApp.sendMessage($room.text(), message);
        $messages.append(_divEscapedContentElement(message));
        $messages.scrollTop($messages[0].scrollHeight);
    }
    $sendMessage.val("");
}

// ------------------------------------------------------------------------------------------------------------------ //
// 客户端程序初始化逻辑
let socket = io.connect();
$(function () {
    let chatApp = new Chat(socket);

    // 显示更名尝试的结果
    socket.on("nameResult", function (result) {
        let $messages = $("#messages");

        let message;

        if (result.success) {
            userName = result.name;
            message = "你的初始用户名为: " + result.name + ".";
        } else {
            message = result.message;
        }
        $messages.append(_divSystemContentElement(message));
    });

    // 显示房间变更的结果
    socket.on("joinResult", function (result) {
        let $room = $("#room");
        let $messages = $("#messages");

        $room.text(result.room);
        $messages.append(_divSystemContentElement("已进入房间: " + result.room));
    });

    // 显示接收到的消息
    socket.on("message", function (message) {
        let newElement = $("<div></div>").text(message.text);
        $("#messages").append(newElement);
    });

    // 显示可用房间列表
    socket.on("rooms", function (rooms) {
        let $roomList = $("#room-list");
        let $sendMessage = $("#send-message");


        $roomList.empty();
        // debugger;

        for (let room in rooms) {
            room = room.substring(1, room.length);
            if (room !== "") {
                $roomList.append(_divEscapedContentElement(room, true));
            }
        }
        //点击房间名可用换到那个房间中
        $("#room-list div").click(function () {
            chatApp.processCommand("/join " + $(this).text());
            $sendMessage.focus();
        });
    });

    setInterval(function () {
        socket.emit("rooms");
    }, 1000);

    let $sendMessage = $("#send-message");
    let $sendForm = $("#send-form");

    $sendMessage.focus();

    $sendForm.submit(function () {
        _processUserInput(chatApp, socket);
        return false;
    });
});
