const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/*
==================================================
GET ALL USERS
GET /chat/users
==================================================
*/

router.get("/chat/users", protect, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("name email avatar")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

/*
==================================================
CREATE / GET CONVERSATION
POST /chat/conversation/:userId
==================================================
*/

router.post(
  "/chat/conversation/:userId",
  protect,
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const otherUserId = req.params.userId;

      // Don't allow chatting with yourself
      if (String(currentUserId) === String(otherUserId)) {
        return res.status(400).json({
          message: "You cannot create a conversation with yourself",
        });
      }

      // Check that other user actually exists
      const otherUser = await User.findById(otherUserId).select(
        "name email avatar"
      );

      if (!otherUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      /*
       * Look for an existing conversation
       * containing both users.
       */

      let conversation = await Conversation.findOne({
        participants: {
          $all: [currentUserId, otherUserId],
        },
      });

      /*
       * If conversation doesn't exist,
       * create it.
       */

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [currentUserId, otherUserId],
        });
      }

      /*
       * Return useful information to frontend.
       */

      const populatedConversation =
        await Conversation.findById(conversation._id).populate(
          "participants",
          "name email avatar"
        );

      res.json(populatedConversation);
    } catch (error) {
      console.error("CONVERSATION ERROR:", error);

      res.status(500).json({
        message: "Failed to create conversation",
      });
    }
  }
);

/*
==================================================
GET MESSAGES
GET /chat/messages/:conversationId
==================================================
*/

router.get(
  "/chat/messages/:conversationId",
  protect,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      /*
       * First make sure conversation exists
       * and the current user belongs to it.
       */

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id,
      });

      if (!conversation) {
        return res.status(403).json({
          message: "You are not part of this conversation",
        });
      }

      /*
       * Get all messages belonging to this conversation.
       */

      const messages = await Message.find({
        conversationId,
      })
        .populate("sender", "name email avatar")
        .populate("receiver", "name email avatar")
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (error) {
      console.error("GET MESSAGES ERROR:", error);

      res.status(500).json({
        message: "Failed to fetch messages",
      });
    }
  }
);

/*
==================================================
GET MY CONVERSATIONS
GET /chat/conversations
==================================================
*/

router.get(
  "/chat/conversations",
  protect,
  async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: req.user._id,
      })
        .populate("participants", "name email avatar")
        .sort({ lastMessageAt: -1 });

      res.json(conversations);
    } catch (error) {
      console.error(
        "GET CONVERSATIONS ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch conversations",
      });
    }
  }
);

/*
==================================================
CONNECTION REQUESTS
==================================================
*/

const ConnectionRequest = require("../models/ConnectionRequest");

/*
--------------------------------------------------
SEND CONNECTION REQUEST
POST /chat/request/:userId
--------------------------------------------------
*/

router.post(
  "/chat/request/:userId",
  protect,
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const otherUserId = req.params.userId;

      /*
       * Don't allow requesting yourself.
       */

      if (
        String(currentUserId) ===
        String(otherUserId)
      ) {
        return res.status(400).json({
          message:
            "You cannot send a request to yourself",
        });
      }

      /*
       * Make sure other user exists.
       */

      const otherUser = await User.findById(
        otherUserId
      ).select("name email avatar");

      if (!otherUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      /*
       * Check if there is an existing connection
       * (either direction) between both users.
       */

      const existingConnection =
        await ConnectionRequest.findOne({
          $or: [
            {
              fromUser: currentUserId,
              toUser: otherUserId,
              status: "accepted",
            },
            {
              fromUser: otherUserId,
              toUser: currentUserId,
              status: "accepted",
            },
          ],
        });

      if (existingConnection) {
        return res.status(400).json({
          message:
            "You are already connected with this user",
        });
      }

      /*
       * Check if a request already exists
       * (either direction, pending).
       */

      const existingRequest =
        await ConnectionRequest.findOne({
          $or: [
            {
              fromUser: currentUserId,
              toUser: otherUserId,
              status: "pending",
            },
            {
              fromUser: otherUserId,
              toUser: currentUserId,
              status: "pending",
            },
          ],
        });

      if (existingRequest) {
        return res.status(400).json({
          message:
            "A request is already pending between you and this user",
        });
      }

      /*
       * Create new connection request.
       */

      const request =
        await ConnectionRequest.create({
          fromUser: currentUserId,
          toUser: otherUserId,
        });

      const populatedRequest =
        await ConnectionRequest.findById(
          request._id
        ).populate(
          "fromUser",
          "name email avatar"
        );

      res.status(201).json({
        message:
          "Connection request sent successfully",
        request: populatedRequest,
      });
    } catch (error) {
      console.error("SEND REQUEST ERROR:", error);

      res.status(500).json({
        message: "Failed to send connection request",
      });
    }
  }
);

/*
--------------------------------------------------
GET INCOMING REQUESTS
GET /chat/requests/incoming
--------------------------------------------------
*/

router.get(
  "/chat/requests/incoming",
  protect,
  async (req, res) => {
    try {
      const requests =
        await ConnectionRequest.find({
          toUser: req.user._id,
          status: "pending",
        })
          .populate(
            "fromUser",
            "name email avatar"
          )
          .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      console.error(
        "GET INCOMING REQUESTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch incoming requests",
      });
    }
  }
);

/*
--------------------------------------------------
GET OUTGOING REQUESTS
GET /chat/requests/outgoing
--------------------------------------------------
*/

router.get(
  "/chat/requests/outgoing",
  protect,
  async (req, res) => {
    try {
      const requests =
        await ConnectionRequest.find({
          fromUser: req.user._id,
          status: "pending",
        })
          .populate(
            "toUser",
            "name email avatar"
          )
          .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      console.error(
        "GET OUTGOING REQUESTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch outgoing requests",
      });
    }
  }
);

/*
--------------------------------------------------
GET ACCEPTED CONNECTIONS
GET /chat/connections
--------------------------------------------------
*/

router.get("/chat/connections", protect, async (req, res) => {
  try {
    /*
     * Find all accepted requests where current
     * user is either fromUser or toUser.
     */

    const acceptedRequests =
      await ConnectionRequest.find({
        $and: [
          {
            $or: [
              { fromUser: req.user._id },
              { toUser: req.user._id },
            ],
          },
          { status: "accepted" },
        ],
      });

    /*
     * Get the OTHER user in each connection.
     */

    const connections =
      await Promise.all(
        acceptedRequests.map(
          async (reqDoc) => {
            const otherUserId =
              String(reqDoc.fromUser) ===
              String(req.user._id)
                ? reqDoc.toUser
                : reqDoc.fromUser;

            return await User.findById(
              otherUserId,
              "name email avatar"
            );
          }
        )
      );

    res.json(
      connections.filter((c) => c !== null)
    );
  } catch (error) {
    console.error(
      "GET CONNECTIONS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch connections",
    });
  }
});

/*
--------------------------------------------------
GET CONNECTION STATUS
GET /chat/status/:userId
--------------------------------------------------
*/

router.get(
  "/chat/status/:userId",
  protect,
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const otherUserId = req.params.userId;

      /*
       * Check for accepted connection first.
       */

      const isConnection =
        await ConnectionRequest.findOne({
          $or: [
            {
              fromUser: currentUserId,
              toUser: otherUserId,
              status: "accepted",
            },
            {
              fromUser: otherUserId,
              toUser: currentUserId,
              status: "accepted",
            },
          ],
        });

      if (isConnection) {
        return res.json({
          status: "connected",
          message: "You are connected",
        });
      }

      /*
       * Check for pending request.
       */

      const pendingRequest =
        await ConnectionRequest.findOne({
          fromUser: currentUserId,
          toUser: otherUserId,
          status: "pending",
        });

      if (pendingRequest) {
        return res.json({
          status: "pending",
          message: "Request already sent",
        });
      }

      res.json({
        status: "not-connected",
        message: "Not connected",
      });
    } catch (error) {
      console.error(
        "GET STATUS ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch connection status",
      });
    }
  }
);

/*
--------------------------------------------------
ACCEPT REQUEST
PUT /chat/request/:id/accept
--------------------------------------------------
*/

router.put(
  "/chat/request/:id/accept",
  protect,
  async (req, res) => {
    try {
      const requestId = req.params.id;

      /*
       * Find request where current user is
       * the receiver.
       */

      const request =
        await ConnectionRequest.findOne({
          _id: requestId,
          toUser: req.user._id,
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      /*
       * If already accepted, skip creation
       * (bidirectional acceptance case).
       */

      const existingConversation =
        await Conversation.findOne({
          participants: {
            $all: [
              request.fromUser,
              request.toUser,
            ],
          },
        });

      if (
        request.status === "accepted" &&
        existingConversation
      ) {
        return res.json({
          message:
            "You are already connected",
          conversation: existingConversation,
        });
      }

      /*
       * Mark request as accepted.
       */

      request.status = "accepted";
      await request.save();

      /*
       * Create conversation if it doesn't
       * exist yet.
       */

      let conversation = existingConversation;

      if (!existingConversation) {
        conversation =
          await Conversation.create({
            participants: [
              request.fromUser,
              request.toUser,
            ],
          });
      }

      const populatedConversation =
        await Conversation.findById(
          conversation._id
        ).populate(
          "participants",
          "name email avatar"
        );

      res.json({
        message: "Request accepted",
        conversation: populatedConversation,
      });
    } catch (error) {
      console.error("ACCEPT REQUEST ERROR:", error);

      res.status(500).json({
        message: "Failed to accept request",
      });
    }
  }
);

/*
--------------------------------------------------
REJECT REQUEST
PUT /chat/request/:id/reject
--------------------------------------------------
*/

router.put(
  "/chat/request/:id/reject",
  protect,
  async (req, res) => {
    try {
      const requestId = req.params.id;

      /*
       * Find request where current user is
       * the receiver.
       */

      const request =
        await ConnectionRequest.findOne({
          _id: requestId,
          toUser: req.user._id,
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.status !== "pending"
      ) {
        return res.status(400).json({
          message:
            "This request can no longer be rejected",
        });
      }

      /*
       * Mark request as rejected.
       */

      request.status = "rejected";
      await request.save();

      res.json({
        message: "Request rejected",
      });
    } catch (error) {
      console.error("REJECT REQUEST ERROR:", error);

      res.status(500).json({
        message: "Failed to reject request",
      });
    }
  }
);

/*
--------------------------------------------------
CANCEL OUTGOING REQUEST
DELETE /chat/request/:id
--------------------------------------------------
*/

router.delete(
  "/chat/request/:id",
  protect,
  async (req, res) => {
    try {
      const requestId = req.params.id;

      /*
       * Find request where current user is
       * the sender.
       */

      const request =
        await ConnectionRequest.findOne({
          _id: requestId,
          fromUser: req.user._id,
        });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (
        request.status !== "pending"
      ) {
        return res.status(400).json({
          message:
            "This request can no longer be cancelled",
        });
      }

      /*
       * Delete request.
       */

      await ConnectionRequest.findByIdAndDelete(
        requestId
      );

      res.json({
        message: "Request cancelled",
      });
    } catch (error) {
      console.error("CANCEL REQUEST ERROR:", error);

      res.status(500).json({
        message: "Failed to cancel request",
      });
    }
  }
);

module.exports = router;