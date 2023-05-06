import { Server, Socket } from "socket.io";
import {
   httpServer
} from "../../app";
import { IConversation, IPMessage } from "./interfaces";

export const InitSocketServer = () => {
  const io: Server = new Server(httpServer, {
    cors: {
      origin: [
        "https://astonishing-naiad-20ad9f.netlify.app",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
    },
  });
  interface User {
    userId: string;
    socketId: string;
  }

  interface OnSendMessageProps {
    receiverId: string;
    conversation: IConversation;
    message: IPMessage;
  }
  interface OnDeleteMessageProps {
    receiverId: string;
    conversation: IConversation;
    messageId: string;
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

  const disconnectUser = (socketId: string) => {
    users = users.filter((u) => u.socketId !== socketId);
  };

  //  connection 
  io.on("connection", (socket: Socket) => {
    console.log("a user connected to socket");

    // take userId and socketId from user
    socket.on("addUser", (userId: string) => {
      console.log("addUser");

      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });
    // removeUser
    socket.on("removeUser", () => {
      console.log("removeUser");

      disconnectUser(socket.id);

      io.emit("getUsers", users);
      console.log("a user was remove from socket users");

      console.log({ aUserWasRemovedGetUsers: users });
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
    // edit a message

    socket.on(
      "editMessage",
      async (props: OnSendMessageProps) => {
        const { receiverId, conversation, message } = props;
        try {
          const receiver = getUser(receiverId);

          console.log({ "editMessage to": receiver });

          io.to(receiver?.socketId).emit("getMessageEdit", {
            conversation,
            message,
          });
        } catch (error) {
          console.log(error);
        }
      },
    );
    // delete a message

    socket.on(
      "deleteMessage",
      async (props: OnDeleteMessageProps) => {
        const { receiverId, conversation, messageId } = props;
        try {
          const receiver = getUser(receiverId);

          console.log({ "deleteMessage to": receiver });

          io.to(receiver?.socketId).emit("getMessageDelete", {
            conversation,
            messageId,
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
    // acceptFriendRequest
    socket.on(
      "acceptFriendRequest",
      async (props: {
        senderId: string;
        receiverId: string;
      }) => {
        const { receiverId, senderId } = props;
        try {
          const receiver = getUser(receiverId);
          const sender = getUser(senderId);

          console.log({
            "acceptFriendRequest to": receiver,
            from: sender,
          });

          io.to(receiver?.socketId).emit(
            "acceptedFriendRequest",
            senderId,
          );
        } catch (error) {
          console.log(error);
        }
      },
    );
    // declineFriendRequest
    socket.on(
      "declineFriendRequest",
      async (props: {
        senderId: string;
        receiverId: string;
      }) => {
        const { receiverId, senderId } = props;
        try {
          const receiver = getUser(receiverId);
          const sender = getUser(senderId);

          console.log({
            "decline FriendRequest to": receiver,
            from: sender,
          });

          io.to(receiver?.socketId).emit(
            "declinedFriendRequest",
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
      disconnectUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

InitSocketServer();
