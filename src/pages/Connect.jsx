import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function Connect() {
  const [users, setUsers] = useState([
    { id: 1, name: "sahil", status: "none" },
    { id: 2, name: "chetna", status: "requested" },
    { id: 3, name: "Karan", status: "friends" },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");

  const sendRequest = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "requested" } : u
      )
    );
  };

  const acceptRequest = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "friends" } : u
      )
    );
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { sender: "me", text: input },
      ],
    }));

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* PEOPLE SIDEBAR — full width on mobile, fixed width on desktop */}
        <div
          className={`${
            selectedUser ? "hidden md:flex" : "flex"
          } w-full md:w-80 border-r border-white/10 flex-col`}
        >
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">People</h2>
          </div>

          <div className="text-white flex-1 overflow-y-auto p-4 space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 rounded-lg border border-white/10 flex justify-between items-center hover:bg-white/5 cursor-pointer transition"
                onClick={() =>
                  user.status === "friends" && setSelectedUser(user)
                }
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-blue-500">
                    {user.status === "none" && "Not Connected"}
                    {user.status === "requested" && "Request Sent"}
                    {user.status === "friends" && "Friends"}
                  </p>
                </div>

                {user.status === "none" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendRequest(user.id);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Follow
                  </button>
                )}

                {user.status === "requested" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptRequest(user.id);
                    }}
                    className="border border-white/20 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CHAT SECTION — hidden on mobile when no user selected */}
        <div
          className={`${
            selectedUser ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-white/10 font-semibold text-white flex items-center gap-3">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden text-gray-400 hover:text-white text-xl"
                >
                  ←
                </button>
                {selectedUser.name}
              </div>

              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {(messages[selectedUser.id] || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "me"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-xs ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 border-t border-white/10 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  placeholder="Type message..."
                  className="flex-1 border border-white/20 bg-transparent text-white rounded px-3 py-2 text-sm sm:text-base"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 rounded text-sm sm:text-base"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
              Select a friend to start chatting
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
