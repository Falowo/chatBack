import { Server } from "socket.io";
import { server } from "../../app";
import { IConversation, IPMessage } from "./interfaces";
// const io = new Server(8900, {
//   cors: {
//     origin: ["http://localhost:3000"],
//   },
// });

export const InitSocketServer = () => {
  let io: Server;
  interface User {
    userId: string;
    socketId: string;
  }

  interface OnSendMessageProps {
    receiverId: string;
    conversation: IConversation;
    message: IPMessage;
  }

  let users: User[] = [];

  const addUser = (userId: string, socketId: string) => {
    if (!users.some((user) => user.userId === userId)) {
      users.push({ userId, socketId });
    } else {
      users.forEach((u) => {
        if (u.userId === userId) {
          u.socketId = socketId;
        }
      });
      console.log({ users, userId, socketId });
    }
  };

  const getUser = (userId: string) => {
    return users.find((user) => user.userId === userId);
  };

  const removeUser = (socketId: string) => {
    users = users.filter((u) => u.socketId !== socketId);
  };

  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
    },
  });

  //  connection
  io.on("connection", (socket) => {
    console.log("a user connected");

    // take userId and socketId from user
    socket.on("addUser", (userId: string) => {
      console.log("addUser");

      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    // send a message

    socket.on(
      "sendMessage",
      async (props: OnSendMessageProps) => {
        const { receiverId, conversation, message } = props;
        try {
          const receiver = getUser(receiverId);

          console.log({ "sendMessage to": receiver });

          io.to(receiver?.socketId).emit("getMessage", {
            conversation,
            message,
          });
        } catch (error) {
          console.log(error);
        }
      },
    );

    // receive a message

    socket.on(
      "gotMessage",
      async (props: {
        message: IPMessage;
        receiverId: string;
      }) => {
        const { message, receiverId } = props;
        console.log({ gotMessage: message, receiverId });

        try {
          const sender = getUser(message.senderId._id);
          console.log(sender?.socketId);
          io.to(sender?.socketId).emit("receivedMessage", {
            message,
            receiverId,
          });
          console.log({
            receivedMessage: message,
            receiverId,
            sender,
          });
        } catch (error) {
          console.log(error);
        }
      },
    );

    // messages of conversation have been checked

    socket.on(
      "checkMessages",
      async (props: {
        messages: IPMessage[];
        receiverId: string;
      }) => {
        const { messages, receiverId } = props;
        console.log({
          checkMessages: messages,
          receiverId: receiverId,
        });

        try {
          for (const message of messages) {
            const sender = getUser(message.senderId._id);
            io.to(sender?.socketId).emit("checkedMessage", {
              message,
              receiverId,
            });
            console.log({
              checkedMessage: message,
              receiverId,
              sender,
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
    );

    // sendFriendRequest
    socket.on(
      "sendFriendRequest",
      async (props: {
        senderId: string;
        receiverId: string;
      }) => {
        const { receiverId, senderId } = props;
        try {
          const receiver = getUser(receiverId);
          const sender = getUser(senderId);

          console.log({
            "sendFriendRequest to": receiver,
            from: sender,
          });

          io.to(receiver?.socketId).emit(
            "getFriendRequest",
            senderId,
          );
        } catch (error) {
          console.log(error);
        }
      },
    );

    // disconnection

    socket.on("disconnecting", () => {
      console.log("a user disconnected");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

// initSocketServer();
