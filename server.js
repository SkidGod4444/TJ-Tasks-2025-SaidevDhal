const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Map socketId -> username
const users = new Map();

function broadcastUsers() {
  const list = Array.from(users.values());
  io.emit('users', list);
}

io.on('connection', (socket) => {
  console.log(`socket connected: ${socket.id}`);

  socket.on('join', (username) => {
    // store username
    users.set(socket.id, username);
    // notify everyone
    io.emit('message', { system: true, text: `${username} joined the chat` });
    broadcastUsers();
  });

  socket.on('chatMessage', (msg) => {
    const username = users.get(socket.id) || 'Anonymous';
    const payload = { username, text: msg, time: Date.now() };
    io.emit('message', payload);
  });

  socket.on('typing', () => {
    const username = users.get(socket.id);
    if (username) socket.broadcast.emit('typing', username);
  });

  socket.on('stopTyping', () => {
    const username = users.get(socket.id);
    if (username) socket.broadcast.emit('stopTyping', username);
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('message', { system: true, text: `${username} left the chat` });
      broadcastUsers();
    }
    console.log(`socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});