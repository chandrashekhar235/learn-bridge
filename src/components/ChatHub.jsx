import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSocket } from "../context/SocketContext";
import BASE_URL from "../config";

const ChatHub = () => {
  const socket = useSocket();

  // =========================================================
  // AUTH
  // =========================================================

  const token = localStorage.getItem("token");

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId = String(
    storedUser?._id ||
      storedUser?.id ||
      ""
  );

  // =========================================================
  // STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [requests, setRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] =
    useState([]);

  const [connections, setConnections] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingRequests, setLoadingRequests] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("people");

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = (obj) => {
    if (!obj) return "";

    return String(
      obj._id ||
        obj.id ||
        obj.userId ||
        ""
    );
  };

  const getUserFromRequest = (request, type) => {
    if (!request) return null;

    if (type === "from") {
      return request.fromUser || request.from || null;
    }

    return request.toUser || request.to || null;
  };

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingUsers(true);

      const response = await fetch(
        `${BASE_URL}/chat/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch users"
        );
      }

      const data = await response.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "FETCH USERS ERROR:",
        error
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  // =========================================================
  // FETCH REQUESTS + CONNECTIONS
  // =========================================================

  const fetchRequests = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingRequests(true);

      const [
        incomingRes,
        outgoingRes,
        connectionsRes,
      ] = await Promise.all([
        fetch(
          `${BASE_URL}/chat/requests/incoming`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${BASE_URL}/chat/requests/outgoing`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `${BASE_URL}/chat/connections`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      if (
        !incomingRes.ok ||
        !outgoingRes.ok ||
        !connectionsRes.ok
      ) {
        throw new Error(
          "Failed to fetch connection data"
        );
      }

      const [
        incomingData,
        outgoingData,
        connectionsData,
      ] = await Promise.all([
        incomingRes.json(),
        outgoingRes.json(),
        connectionsRes.json(),
      ]);

      setRequests(
        Array.isArray(incomingData)
          ? incomingData
          : []
      );

      setOutgoingRequests(
        Array.isArray(outgoingData)
          ? outgoingData
          : []
      );

      setConnections(
        Array.isArray(connectionsData)
          ? connectionsData
          : []
      );
    } catch (error) {
      console.error(
        "FETCH REQUESTS ERROR:",
        error
      );
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!token) return;

    fetchUsers();
    fetchRequests();
  }, [
    token,
    fetchUsers,
    fetchRequests,
  ]);

  // =========================================================
  // SELECT USER
  // =========================================================

  const handleSelectUser = async (user) => {
    if (!user) return;

    try {
      setSelectedUser(user);
      setMessages([]);
      setConversation(null);
      setLoadingMessages(true);

      const userId = getId(user);

      // -----------------------------------------------------
      // Check connection status
      // -----------------------------------------------------

      const statusResponse =
        await fetch(
          `${BASE_URL}/chat/status/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!statusResponse.ok) {
        throw new Error(
          "Failed to check connection status"
        );
      }

      const statusData =
        await statusResponse.json();

      // -----------------------------------------------------
      // Only connected users can chat
      // -----------------------------------------------------

      if (
        statusData.status !== "connected"
      ) {
        setLoadingMessages(false);
        return;
      }

      // -----------------------------------------------------
      // Get conversations
      // -----------------------------------------------------

      const conversationsResponse =
        await fetch(
          `${BASE_URL}/chat/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!conversationsResponse.ok) {
        throw new Error(
          "Failed to fetch conversations"
        );
      }

      const conversations =
        await conversationsResponse.json();

      // -----------------------------------------------------
      // Find conversation with selected user
      // -----------------------------------------------------

      const userConversation =
        conversations.find((conv) => {
          const participantIds =
            (conv.participants || []).map(
              (participant) =>
                getId(participant)
            );

          return (
            participantIds.includes(
              String(userId)
            ) &&
            participantIds.includes(
              String(currentUserId)
            )
          );
        });

      if (!userConversation) {
        setLoadingMessages(false);
        return;
      }

      setConversation(userConversation);

      // -----------------------------------------------------
      // Fetch messages
      // -----------------------------------------------------

      const messagesResponse =
        await fetch(
          `${BASE_URL}/chat/messages/${userConversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!messagesResponse.ok) {
        throw new Error(
          "Failed to fetch messages"
        );
      }

      const messagesData =
        await messagesResponse.json();

      setMessages(
        Array.isArray(messagesData)
          ? messagesData
          : []
      );
    } catch (error) {
      console.error(
        "SELECT USER ERROR:",
        error
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================================================
  // SEND CONNECTION REQUEST
  // =========================================================

  const sendConnectionRequest = async (
    userId
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/chat/request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to send request"
        );
      }

      // Refresh request/user data
      await fetchRequests();
      await fetchUsers();

    } catch (error) {
      console.error(
        "SEND REQUEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to send request"
      );
    }
  };

  // =========================================================
  // ACCEPT REQUEST
  // =========================================================

  const acceptRequest = async (
    requestId
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/chat/request/${requestId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to accept request"
        );
      }

      // -----------------------------------------------------
      // Conversation created by backend
      // -----------------------------------------------------

      if (result.conversation) {
        const newConversation =
          result.conversation;

        setConversation(
          newConversation
        );

        const otherParticipant =
          (
            newConversation.participants ||
            []
          ).find(
            (participant) =>
              getId(participant) !==
              currentUserId
          );

        if (otherParticipant) {
          setSelectedUser(
            otherParticipant
          );
        }

        // Load messages
        const messagesResponse =
          await fetch(
            `${BASE_URL}/chat/messages/${newConversation._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (messagesResponse.ok) {
          const messagesData =
            await messagesResponse.json();

          setMessages(
            Array.isArray(messagesData)
              ? messagesData
              : []
          );
        }
      }

      // Refresh
      await fetchRequests();
      await fetchUsers();

      // Automatically switch to chats
      setActiveTab("chats");

    } catch (error) {
      console.error(
        "ACCEPT REQUEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to accept request"
      );
    }
  };

  // =========================================================
  // REJECT REQUEST
  // =========================================================

  const rejectRequest = async (
    requestId
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/chat/request/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to reject request"
        );
      }

      await fetchRequests();
      await fetchUsers();

    } catch (error) {
      console.error(
        "REJECT REQUEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to reject request"
      );
    }
  };

  // =========================================================
  // CANCEL REQUEST
  // =========================================================

  const cancelRequest = async (
    requestId
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/chat/request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to cancel request"
        );
      }

      await fetchRequests();
      await fetchUsers();

    } catch (error) {
      console.error(
        "CANCEL REQUEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to cancel request"
      );
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = () => {
    if (
      !socket ||
      !conversation ||
      !selectedUser ||
      !input.trim()
    ) {
      return;
    }

    const text = input.trim();

    socket.emit(
      "send-message",
      {
        conversationId:
          conversation._id,

        receiverId:
          getId(selectedUser),

        text,
      }
    );

    setInput("");
  };

  // =========================================================
  // RECEIVE MESSAGE
  // =========================================================

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage =
      (message) => {
        if (
          !conversation ||
          String(
            message.conversationId
          ) !==
            String(
              conversation._id
            )
        ) {
          return;
        }

        setMessages((prev) => {
          // Prevent duplicates
          if (
            prev.some(
              (msg) =>
                String(msg._id) ===
                String(message._id)
            )
          ) {
            return prev;
          }

          return [...prev, message];
        });
      };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, [
    socket,
    conversation,
  ]);

  // =========================================================
  // MESSAGE SENT CONFIRMATION
  // =========================================================

  useEffect(() => {
    if (!socket) return;

    const handleMessageSent =
      (message) => {
        if (
          !conversation ||
          String(
            message.conversationId
          ) !==
            String(
              conversation._id
            )
        ) {
          return;
        }

        setMessages((prev) => {
          if (
            prev.some(
              (msg) =>
                String(msg._id) ===
                String(message._id)
            )
          ) {
            return prev;
          }

          return [...prev, message];
        });
      };

    socket.on(
      "message-sent",
      handleMessageSent
    );

    return () => {
      socket.off(
        "message-sent",
        handleMessageSent
      );
    };
  }, [
    socket,
    conversation,
  ]);

  // =========================================================
  // CONNECTION REQUEST SOCKET EVENTS
  // =========================================================

  useEffect(() => {
    if (!socket) return;

    const handleNewRequest =
      (request) => {
        setRequests((prev) => {
          const exists = prev.some(
            (item) =>
              getId(item) ===
              getId(request)
          );

          if (exists) return prev;

          return [
            ...prev,
            request,
          ];
        });
      };

    const handleRequestSent =
      (request) => {
        setOutgoingRequests(
          (prev) => {
            const exists = prev.some(
              (item) =>
                getId(item) ===
                getId(request)
            );

            if (exists) return prev;

            return [
              ...prev,
              request,
            ];
          }
        );
      };

    const handleRequestAccepted =
      (conversationData) => {
        setConversation(
          conversationData
        );

        const otherUser =
          (
            conversationData.participants ||
            []
          ).find(
            (participant) =>
              getId(participant) !==
              currentUserId
          );

        if (otherUser) {
          setSelectedUser(
            otherUser
          );
        }

        fetch(
          `${BASE_URL}/chat/messages/${conversationData._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((res) =>
            res.json()
          )
          .then((data) => {
            setMessages(
              Array.isArray(data)
                ? data
                : []
            );
          })
          .catch((error) =>
            console.error(
              "LOAD MESSAGES ERROR:",
              error
            )
          );

        fetchRequests();
        fetchUsers();
      };

    const handleRequestRejected =
      (requestId) => {
        setRequests((prev) =>
          prev.filter(
            (request) =>
              getId(request) !==
              String(requestId)
          )
        );

        setOutgoingRequests(
          (prev) =>
            prev.filter(
              (request) =>
                getId(request) !==
                String(requestId)
            )
        );
      };

    const handleRequestCancelled =
      (requestId) => {
        setOutgoingRequests(
          (prev) =>
            prev.filter(
              (request) =>
                getId(request) !==
                String(requestId)
            )
        );
      };

    socket.on(
      "new-connection-request",
      handleNewRequest
    );

    socket.on(
      "request-sent",
      handleRequestSent
    );

    socket.on(
      "request-accepted",
      handleRequestAccepted
    );

    socket.on(
      "request-rejected",
      handleRequestRejected
    );

    socket.on(
      "request-cancelled",
      handleRequestCancelled
    );

    return () => {
      socket.off(
        "new-connection-request",
        handleNewRequest
      );

      socket.off(
        "request-sent",
        handleRequestSent
      );

      socket.off(
        "request-accepted",
        handleRequestAccepted
      );

      socket.off(
        "request-rejected",
        handleRequestRejected
      );

      socket.off(
        "request-cancelled",
        handleRequestCancelled
      );
    };
  }, [
    socket,
    token,
    currentUserId,
    fetchRequests,
    fetchUsers,
  ]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex h-screen text-white">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <div className="w-80 border-r border-white/10 flex flex-col">

        {/* TABS */}

        <div className="flex border-b border-white/10">

          <button
            onClick={() =>
              setActiveTab("people")
            }
            className={`flex-1 py-3 text-sm ${
              activeTab === "people"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            People
          </button>

          <button
            onClick={() =>
              setActiveTab("requests")
            }
            className={`flex-1 py-3 text-sm ${
              activeTab === "requests"
                ? "bg-yellow-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-2 bg-red-500 rounded-full px-2 py-0.5 text-xs">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              setActiveTab("chats")
            }
            className={`flex-1 py-3 text-sm ${
              activeTab === "chats"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Chats
          </button>

        </div>

        {/* ================================================= */}
        {/* PEOPLE */}
        {/* ================================================= */}

        {activeTab === "people" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {loadingUsers ? (
              <p className="text-gray-400">
                Loading people...
              </p>
            ) : users.length === 0 ? (
              <p className="text-gray-400">
                No other users found.
              </p>
            ) : (
              users.map((user) => {

                const userId =
                  getId(user);

                const isConnected =
                  connections.some(
                    (connection) =>
                      getId(connection) ===
                      userId
                  );

                const requestSent =
                  outgoingRequests.some(
                    (request) =>
                      getId(
                        getUserFromRequest(
                          request,
                          "to"
                        )
                      ) === userId
                  );

                const requestReceived =
                  requests.some(
                    (request) =>
                      getId(
                        getUserFromRequest(
                          request,
                          "from"
                        )
                      ) === userId
                  );

                return (
                  <div
                    key={userId}
                    className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
                  >

                    <div className="flex items-center gap-3">

                      {/* AVATAR */}

                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">

                        {user.avatar ? (
                          <img
                            src={`${BASE_URL}${user.avatar}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </span>
                        )}

                      </div>

                      {/* USER */}

                      <div className="flex-1 min-w-0">

                        <p className="font-medium truncate">
                          {user.name}
                        </p>

                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-3 flex items-center justify-between">

                      {isConnected ? (
                        <button
                          onClick={() =>
                            handleSelectUser(
                              user
                            )
                          }
                          className="text-xs bg-green-600/20 text-green-400 px-3 py-1.5 rounded-lg"
                        >
                          Connected
                        </button>
                      ) : requestSent ? (
                        <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg">
                          Request Sent
                        </span>
                      ) : requestReceived ? (
                        <button
                          onClick={() =>
                            setActiveTab(
                              "requests"
                            )
                          }
                          className="text-xs bg-yellow-600/20 text-yellow-400 px-3 py-1.5 rounded-lg"
                        >
                          View Request
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            sendConnectionRequest(
                              userId
                            )
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                        >
                          + Connect
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>
        )}

        {/* ================================================= */}
        {/* REQUESTS */}
        {/* ================================================= */}

        {activeTab === "requests" && (
          <div className="flex-1 overflow-y-auto p-4">

            {/* INCOMING */}

            <h2 className="text-sm font-semibold text-yellow-400 mb-3">
              Incoming Requests
            </h2>

            {loadingRequests ? (
              <p className="text-gray-400">
                Loading...
              </p>
            ) : requests.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No incoming requests.
              </p>
            ) : (
              <div className="space-y-3">

                {requests.map(
                  (request) => {

                    const user =
                      getUserFromRequest(
                        request,
                        "from"
                      );

                    return (
                      <div
                        key={getId(request)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            {user?.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="flex-1">

                            <p className="font-medium">
                              {user?.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {user?.email}
                            </p>

                          </div>

                        </div>

                        <div className="flex gap-2 mt-3">

                          <button
                            onClick={() =>
                              acceptRequest(
                                getId(request)
                              )
                            }
                            className="flex-1 bg-green-600 hover:bg-green-700 py-1.5 rounded-lg text-sm"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              rejectRequest(
                                getId(request)
                              )
                            }
                            className="flex-1 bg-red-600 hover:bg-red-700 py-1.5 rounded-lg text-sm"
                          >
                            Reject
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

            {/* OUTGOING */}

            <h2 className="text-sm font-semibold text-blue-400 mt-8 mb-3">
              Sent Requests
            </h2>

            {outgoingRequests.length ===
            0 ? (
              <p className="text-gray-500 text-sm">
                No outgoing requests.
              </p>
            ) : (
              <div className="space-y-3">

                {outgoingRequests.map(
                  (request) => {

                    const user =
                      getUserFromRequest(
                        request,
                        "to"
                      );

                    return (
                      <div
                        key={getId(request)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            {user?.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="flex-1">

                            <p className="font-medium">
                              {user?.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {user?.email}
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            cancelRequest(
                              getId(request)
                            )
                          }
                          className="w-full mt-3 bg-gray-700 hover:bg-gray-600 py-1.5 rounded-lg text-sm"
                        >
                          Cancel Request
                        </button>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

        {/* ================================================= */}
        {/* CHATS */}
        {/* ================================================= */}

        {activeTab === "chats" && (
          <div className="flex-1 overflow-y-auto p-4">

            <h2 className="text-sm font-semibold text-green-400 mb-3">
              Your Chats
            </h2>

            {connections.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No connections yet.
              </p>
            ) : (
              <div className="space-y-2">

                {connections.map(
                  (user) => {

                    const userId =
                      getId(user);

                    return (
                      <button
                        key={userId}
                        onClick={() =>
                          handleSelectUser(
                            user
                          )
                        }
                        className="w-full p-3 rounded-xl border border-white/10 hover:bg-white/5 flex items-center gap-3 text-left"
                      >

                        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">

                          {user.avatar ? (
                            <img
                              src={`${BASE_URL}${user.avatar}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold">
                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </span>
                          )}

                        </div>

                        <div className="flex-1 min-w-0">

                          <p className="font-medium truncate">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* =================================================== */}
      {/* CHAT AREA */}
      {/* =================================================== */}

      <div className="flex-1 flex flex-col">

        {!selectedUser ||
        !conversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a connection to start chatting
          </div>
        ) : (
          <>

            {/* HEADER */}

            <div className="p-4 border-b border-white/10 flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">

                {selectedUser.avatar ? (
                  <img
                    src={`${BASE_URL}${selectedUser.avatar}`}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold">
                    {selectedUser.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>
                )}

              </div>

              <div>

                <p className="font-semibold">
                  {selectedUser.name}
                </p>

                <p className="text-xs text-green-400">
                  Connected
                </p>

              </div>

            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-6 space-y-3">

              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map(
                  (message) => {

                    const senderId =
                      getId(
                        message.sender
                      ) ||
                      String(
                        message.sender
                      );

                    const isMine =
                      String(
                        senderId
                      ) ===
                      String(
                        currentUserId
                      );

                    return (
                      <div
                        key={
                          message._id ||
                          message.id
                        }
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isMine
                              ? "bg-blue-600"
                              : "bg-gray-700"
                          }`}
                        >
                          {message.text}
                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

            {/* INPUT */}

            <div className="p-4 border-t border-white/10 flex gap-2">

              <input
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                onClick={sendMessage}
                disabled={
                  !socket ||
                  !input.trim()
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 rounded-xl"
              >
                Send
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
};

export default ChatHub;