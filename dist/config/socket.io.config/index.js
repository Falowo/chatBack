"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSocketServer = void 0;
const socket_io_1 = require("socket.io");
const app_1 = require("../../app");
const InitSocketServer = () => {
    let io;
    let users = [];
    const addUser = (userId, socketId) => {
        if (!users.some((user) => user.userId === userId)) {
            users.push({ userId, socketId });
        }
        else {
            users.forEach((u) => {
                if (u.userId === userId) {
                    u.socketId = socketId;
                }
            });
            console.log({ users, userId, socketId });
        }
    };
    const getUser = (userId) => {
        return users.find((user) => user.userId === userId);
    };
    const removeUser = (socketId) => {
        users = users.filter((u) => u.socketId !== socketId);
    };
    io = new socket_io_1.Server(app_1.server, {
        cors: {
            origin: ["http://localhost:3000"],
        },
    });
    io.on("connection", (socket) => {
        console.log("a user connected");
        socket.on("addUser", (userId) => {
            console.log("addUser");
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        });
        socket.on("sendMessage", async (props) => {
            const { receiverId, conversation, message } = props;
            try {
                const receiver = getUser(receiverId);
                console.log({ "sendMessage to": receiver });
                io.to(receiver === null || receiver === void 0 ? void 0 : receiver.socketId).emit("getMessage", {
                    conversation,
                    message,
                });
            }
            catch (error) {
                console.log(error);
            }
        });
        socket.on("gotMessage", async (props) => {
            const { message, receiverId } = props;
            console.log({ gotMessage: message, receiverId });
            try {
                const sender = getUser(message.senderId._id);
                console.log(sender === null || sender === void 0 ? void 0 : sender.socketId);
                io.to(sender === null || sender === void 0 ? void 0 : sender.socketId).emit("receivedMessage", {
                    message,
                    receiverId,
                });
                console.log({
                    receivedMessage: message,
                    receiverId,
                    sender,
                });
            }
            catch (error) {
                console.log(error);
            }
        });
        socket.on("checkMessages", async (props) => {
            const { messages, receiverId } = props;
            console.log({
                checkMessages: messages,
                receiverId: receiverId,
            });
            try {
                for (const message of messages) {
                    const sender = getUser(message.senderId._id);
                    io.to(sender === null || sender === void 0 ? void 0 : sender.socketId).emit("checkedMessage", {
                        message,
                        receiverId,
                    });
                    console.log({
                        checkedMessage: message,
                        receiverId,
                        sender,
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        });
        socket.on("sendFriendRequest", async (props) => {
            const { receiverId, senderId } = props;
            try {
                const receiver = getUser(receiverId);
                const sender = getUser(senderId);
                console.log({
                    "sendFriendRequest to": receiver,
                    from: sender,
                });
                io.to(receiver === null || receiver === void 0 ? void 0 : receiver.socketId).emit("getFriendRequest", senderId);
            }
            catch (error) {
                console.log(error);
            }
        });
        socket.on("disconnecting", () => {
            console.log("a user disconnected");
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};
exports.InitSocketServer = InitSocketServer;
//# sourceMappingURL=index.js.map