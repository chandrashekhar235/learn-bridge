# 🚀 LearnBridge: Complete Documentation & Developer Guide

Welcome to the **LearnBridge** developer guide. This document is designed to help anyone—from a beginner to an experienced developer—understand, build, and extend this project without needing to deep-dive into the existing source code first.

---

## 📖 1. Project Vision
LearnBridge is a real-time collaborative platform where learners can connect, share knowledge via blogs, and study together in private or public "Study Rooms" and "Voice Channels."

---

## 🏗️ 2. Tech Stack & Architecture
- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client, Simple-peer (for WebRTC).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Auth**: JWT (JSON Web Tokens) with local storage persistence.
- **File Storage**: Local `uploads/` folder via Multer.

---

## 🗄️ 3. Database Design (The "Brain")
All data models are located in `backend/models/`.

### **User Model** (`User.js`)
Stores user identities and profile details.
- `name`, `email`, `password` (hashed).
- `avatar`: Path to the uploaded profile picture.
- `interests` & `hobbies`: Arrays of strings to help find study partners.

### **Blog Model** (`Blog.js`)
Used for the knowledge-sharing platform.
- `title`, `description`.
- `author`: The name of the user who wrote it.
- `user`: ObjectId reference to the User model (for ownership/deletion).

### **Group Model** (`Group.js`)
Handles long-term "Study Rooms."
- `type`: Either "public" (anyone join) or "private" (needs approval).
- `members`: List of accepted User IDs.
- `pendingRequests`: List of User IDs waiting for admin approval.

### **VC Room Model** (`VcRoom.js`)
Handles the metadata for transient voice/video channels.
- `isPrivate`: Determines visibility on the landing page.
- `owner`: The creator (only they can delete private channels).

---

## 🔒 4. Security & Authentication
Located in `backend/middleware/auth.js`.
Every request to a "protected" route (like creating a blog or editing a profile) must include a Header:
`Authorization: Bearer <your_jwt_token>`

The server verifies this token, decrypts the User ID, and attaches the full User object to `req.user` before the request reaches the final destination.

---

## 🎙️ 5. Real-Time Logic (Socket.io & WebRTC)
This is the most advanced part of the project.

### **The Signaling Flow** (`backend/server.js`)
WebRTC (video/audio) is peer-to-peer, but peers need a "handshake" first.
1. `join-room`: The server puts the user in a room and tells everyone else.
2. `signal`: The server simply "passes the note" (signaling data) from User A to User B.
3. `user-left`: Triggers cleanup on all connected clients.

### **The Video logic** (`src/pages/Vc.jsx`)
1. User grants camera/mic permissions via `getUserMedia`.
2. A local video stream is started.
3. `Simple-Peer` creates an "Offer."
4. This Offer is sent via Sockets to the other user.
5. The other user responds with an "Answer" via Sockets.
6. A direct P2P connection is established!

---

## 🎨 6. Frontend Anatomy
- **`App.jsx`**: The central router. It checks for a token to determine if a user should see the `Explore` page or be sent to `Login`.
- **`Navbar.jsx`**: Responsive component that handles the logout logic and displays the user's avatar dynamically.
- **`ThemeContext.jsx`**: A React Context provider that wraps the app, allowing any component to toggle between dark and light modes.
- **`Explore.jsx`**: The main entry point for logged-in users, using Tailwind "group-hover" animations for a premium feel.

---

## 🚀 7. Step-by-Step Implementation Roadmap
If you were to rebuild this project, follow this order:

1. **Step 1: The Core Server**: Setup Express, connect to MongoDB.
2. **Step 2: Auth**: Build Signup/Login APIs with JWT.
3. **Step 3: Profile System**: Implement avatar uploads and interest tags.
4. **Step 4: Blogs**: Build the standard CRUD (Create, Read, Update, Delete) for blog posts.
5. **Step 5: The Signaling Server**: Add Socket.io to your Express server.
6. **Step 6: The Connect Page**: Build the real-time chat and friend request system.
7. **Step 7: WebRTC**: Implement the Voice Channels (use `simple-peer` to simplify things).
8. **Step 8: UI Polish**: Add Tailwind transitions and the Theme switcher.

---

## 🛠️ 8. Common Commands
```bash
# Frontend
npm run dev

# Backend
cd backend
node server.js
```

---

*This documentation was automatically generated to help you grow LearnBridge. Keep building!*
