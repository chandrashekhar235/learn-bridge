require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");

const { Server } = require("socket.io");

const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/UserRoutes");
const blogRoutes = require("./routes/BlogRoutes");
const groupRoutes = require("./routes/GroupRoutes");
const vcRoutes = require("./routes/VcRoutes");
const aiRoutes = require("./routes/AiRoutes");
const chatRoutes = require("./routes/ChatRoutes");

const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();

/*
==================================================
CORS
==================================================
*/

const allowedOrigins = [
  "http://localhost:5173",
  "https://learn-bridge-woad.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/*
==================================================
TEST ROUTE
==================================================
*/

app.get("/", (req, res) => {
  res.send("Main server working");
});

/*
==================================================
ROUTES
==================================================
*/

app.use("/", userRoutes);
app.use("/", blogRoutes);
app.use("/ai", aiRoutes);
app.use("/", groupRoutes);
app.use("/vc", vcRoutes);
app.use("/", chatRoutes);

/*
==================================================
DATABASE
==================================================
*/

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error("DB error:", err);
    process.exit(1);
  });

/*
==================================================
HTTP SERVER
==================================================
*/

const server = http.createServer(app);

/*
==================================================
SOCKET.IO
==================================================
*/

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/*
==================================================
SOCKET AUTHENTICATION
==================================================
*/

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Authentication required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.userId = String(decoded.id);

    next();
  } catch (error) {
    console.error(
      "Socket authentication error:",
      error.message
    );

    next(new Error("Invalid token"));
  }
});

/*
==================================================
ONLINE USERS
==================================================

userId -> socketId

Example:

{
  "68abc123": "xYzSocket123"
}

==================================================
*/

const onlineUsers = new Map();

/*
==================================================
SOCKET CONNECTION
==================================================
*/

io.on("connection", (socket) => {
  console.log(
    "User connected:",
    socket.id,
    "User:",
    socket.userId
  );

  /*
   * Add user to online users.
   */

  onlineUsers.set(
    String(socket.userId),
    socket.id
  );

  console.log(
    "Online users:",
    onlineUsers.size
  );

  /*
  ==================================================
  SEND MESSAGE
  ==================================================
  */

  socket.on(
    "send-message",
    async ({
      conversationId,
      receiverId,
      text,
    }) => {
      try {
        /*
         * Validate data.
         */

        if (
          !conversationId ||
          !receiverId ||
          !text ||
          !text.trim()
        ) {
          return;
        }

        /*
         * Make sure conversation exists
         * and current user belongs to it.
         */

        const conversation =
          await Conversation.findOne({
            _id: conversationId,
            participants: socket.userId,
          });

        if (!conversation) {
          socket.emit("message-error", {
            message:
              "You are not part of this conversation",
          });

          return;
        }

        /*
         * Make sure receiver is also
         * part of the conversation.
         */

        const receiverIsParticipant =
          conversation.participants.some(
            (participant) =>
              String(participant) ===
              String(receiverId)
          );

        if (!receiverIsParticipant) {
          socket.emit("message-error", {
            message:
              "Receiver is not part of this conversation",
          });

          return;
        }

        /*
         * Create message in MongoDB.
         */

        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          text: text.trim(),
        });

        /*
         * Update conversation preview.
         */

        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: text.trim(),
            lastMessageAt: new Date(),
          }
        );

        /*
         * Populate sender/receiver information
         * before sending to frontend.
         */

        const populatedMessage =
          await Message.findById(
            message._id
          )
            .populate(
              "sender",
              "name email avatar"
            )
            .populate(
              "receiver",
              "name email avatar"
            );

        /*
         * Send confirmation to sender.
         */

        socket.emit(
          "message-sent",
          populatedMessage
        );

        /*
         * Find receiver's socket.
         */

        const receiverSocketId =
          onlineUsers.get(
            String(receiverId)
          );

        /*
         * Send message to receiver
         * if they are online.
         */

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receive-message",
            populatedMessage
          );
        }

        console.log(
          `Message sent: ${socket.userId} -> ${receiverId}`
        );
      } catch (error) {
        console.error(
          "SEND MESSAGE ERROR:",
          error
        );

        socket.emit("message-error", {
          message: "Failed to send message",
        });
      }
    }
  );

  /*
  ==================================================
  VIDEO CALL / WEBRTC ROOM
  ==================================================
  */

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    socket
      .to(roomId)
      .emit("user-joined", socket.id);

    console.log(
      `Socket ${socket.id} joined room ${roomId}`
    );
  });

  socket.on(
    "signal",
    ({ to, signal }) => {
      io.to(to).emit("signal", {
        from: socket.id,
        signal,
      });
    }
  );

  socket.on(
    "leave-room",
    (roomId) => {
      socket
        .to(roomId)
        .emit(
          "user-left",
          socket.id
        );

      socket.leave(roomId);
    }
  );

  /*
  ==================================================
  CONNECTION REQUESTS
  ==================================================
  */

  socket.on(
    "send-connection-request",
    ({
      toUserId,
      request,
    }) => {
      try {
        /*
         * Validate data.
         */

        if (!toUserId || !request) {
          return;
        }

        /*
         * Emit to sender.
         */

        socket.emit(
          "request-sent",
          request
        );

        /*
         * Send notification to recipient
         * if they are online.
         */

        const recipientSocketId =
          onlineUsers.get(
            String(toUserId)
          );

        if (recipientSocketId) {
          io.to(
            recipientSocketId
          ).emit(
            "new-connection-request",
            request
          );
        }
      } catch (error) {
        console.error(
          "SEND-CONNECTION-REQUEST ERROR:",
          error
        );
      }
    }
  );

  socket.on(
    "accept-connection-request",
    ({
      requestId,
      conversation,
    }) => {
      try {
        const {
          fromUserId,
          toUserId,
        } = conversation || {};

        /*
         * Emit to sender.
         */

        socket.emit(
          "request-accepted",
          conversation
        );

        /*
         * Find sender's socket.
         */

        const senderSocketId = onlineUsers.get(
          String(
            fromUserId ||
              toUserId
          )
        );

        /*
         * Notify sender if online.
         */

        if (senderSocketId) {
          io.to(senderSocketId).emit(
            "request-accepted",
            conversation
          );
        }
      } catch (error) {
        console.error(
          "ACCEPT-CONNECTION-REQUEST ERROR:",
          error
        );
      }
    }
  );

  socket.on(
    "reject-connection-request",
    ({
      fromUserId,
      requestId,
    }) => {
      try {
        socket.emit(
          "request-rejected",
          requestId
        );

        const senderSocketId =
          onlineUsers.get(
            String(fromUserId)
          );

        if (senderSocketId) {
          io.to(senderSocketId).emit(
            "request-rejected",
            requestId
          );
        }
      } catch (error) {
        console.error(
          "REJECT-CONNECTION-REQUEST ERROR:",
          error
        );
      }
    }
  );

  socket.on(
    "cancel-connection-request",
    ({
      requestId,
      toUserId,
    }) => {
      try {
        socket.emit(
          "request-cancelled",
          requestId
        );

        const recipientSocketId =
          onlineUsers.get(
            String(toUserId)
          );

        if (recipientSocketId) {
          io.to(recipientSocketId).emit(
            "request-cancelled",
            requestId
          );
        }
      } catch (error) {
        console.error(
          "CANCEL-CONNECTION-REQUEST ERROR:",
          error
        );
      }
    }
  );

  /*
  ==================================================
  DISCONNECT
  ==================================================
  */

  socket.on("disconnect", () => {
    console.log(
      "User disconnected:",
      socket.id
    );

    /*
     * Remove user from online users.
     *
     * Only remove if this socket is still
     * the socket registered for that user.
     */

    const currentSocket =
      onlineUsers.get(
        String(socket.userId)
      );

    if (
      currentSocket === socket.id
    ) {
      onlineUsers.delete(
        String(socket.userId)
      );
    }

    /*
     * Notify VC rooms.
     */

    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket
          .to(room)
          .emit(
            "user-left",
            socket.id
          );
      }
    }
  });
});

/*
==================================================
PORT
==================================================
*/

const PORT =
  process.env.PORT || 7777;

server.listen(PORT, () => {
  console.log(
    `Backend running on port ${PORT}`
  );
});