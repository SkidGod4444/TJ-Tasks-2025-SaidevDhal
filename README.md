# Real-time Chat App (Socket.IO)

## 📘 Overview

This is a **real-time chat application** built using **Node.js**, **Express**, and **Socket.IO** for instant communication between multiple users. The frontend is built using **HTML, CSS, and JavaScript**, designed to be responsive across desktop and mobile devices.

The app supports:

* Live chatting between multiple users.
* Username-based identity.
* Real-time user list updates.
* “User is typing…” status indicator.
* Simple, responsive UI.

---

## 🚀 Approach

The goal was to create a **lightweight yet complete** chat system using WebSockets. Socket.IO was chosen for its simplicity and built-in fallbacks for older browsers. The application follows a **client–server architecture** where the server manages message broadcasting, user sessions, and state updates.

### Architecture

```
Client (Browser)  <——>  Socket.IO Server  <——>  Express (Node.js)
```

1. **Frontend (Client)**

   * Establishes a WebSocket connection using `socket.io-client`.
   * Prompts the user for a username.
   * Sends messages, typing events, and disconnect notifications.
   * Dynamically updates the DOM with messages and user lists.

2. **Backend (Server)**

   * Built with Express and Socket.IO.
   * Manages all connected users with a `Map(socketId → username)`.
   * Listens for the following events:

     * `join`: Add user and broadcast join event.
     * `chatMessage`: Broadcast messages to all clients.
     * `typing` / `stopTyping`: Notify others of typing activity.
     * `disconnect`: Remove user and broadcast leave event.

3. **Real-time updates**

   * Messages, online users, and typing indicators are broadcast instantly via WebSockets.
   * The client receives updates and renders them immediately without page reload.

---

## ⚙️ Algorithm & Logic Flow

### 1. Connection Phase

```js
socket.on('join', (username) => {
  users.set(socket.id, username);
  io.emit('message', { system: true, text: `${username} joined the chat` });
  broadcastUsers();
});
```

When a client connects and joins with a username:

* The username is stored in a `Map`.
* A system message announces the new user.
* The updated user list is broadcast to everyone.

### 2. Messaging Phase

```js
socket.on('chatMessage', (msg) => {
  const username = users.get(socket.id);
  io.emit('message', { username, text: msg, time: Date.now() });
});
```

Each message is sent to the server and rebroadcast to all clients (including the sender), ensuring real-time communication.

### 3. Typing Indicator

To prevent spam, typing events are debounced:

```js
messageInput.addEventListener('input', () => {
  if (!isTyping) {
    socket.emit('typing');
    isTyping = true;
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
    isTyping = false;
  }, 700);
});
```

This ensures the typing status is sent only when actively typing, and stops after a short idle delay.

### 4. Disconnect Phase

When a user disconnects:

* Their name is removed from the map.
* A system message is broadcast announcing their departure.

---

## 🧩 Folder Structure

```
real-time-chat-socketio/
│
├── server.js              # Express + Socket.IO server
├── package.json           # Dependencies and start script
└── public/
    ├── index.html         # Chat UI
    ├── style.css          # Styling
    └── main.js            # Frontend socket logic
```

---

## 🖼️ UI & Responsiveness

* Desktop: Chat sidebar with user list + main chat area.
* Mobile: Sidebar hidden for compact layout.
* Clean UI using neutral colors and rounded chat bubbles.

---

## 🔄 Data Flow Summary

| Action             | Emitted Event | Server Response                       | UI Update             |
| ------------------ | ------------- | ------------------------------------- | --------------------- |
| User joins         | `join`        | Broadcast user list + join message    | Add user to list      |
| User sends message | `chatMessage` | Broadcast message to all              | Append message bubble |
| User typing        | `typing`      | Notify others                         | Show typing indicator |
| User stops typing  | `stopTyping`  | Notify others                         | Remove indicator      |
| User disconnects   | —             | Broadcast leave message + update list | Remove user           |

---

## 🧠 Future Enhancements

* Add multiple chat rooms.
* Store chat history in a database (MongoDB / Redis).
* Integrate authentication (JWT or OAuth).
* Use TypeScript and modular architecture.

---

## 🧰 How to Run

```bash
bun install
bun start
```

Then open `http://localhost:3000` in multiple tabs.

---

## 👨‍💻 Author’s Notes

I've been coding since past 5 years. Here is my portfolio: https://devwtf.in (feel free to connect with me if you have any questions)
