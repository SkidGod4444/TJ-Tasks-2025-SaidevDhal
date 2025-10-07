const socket = io();

// DOM
const modal = document.getElementById('modal');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const usernameSpan = document.getElementById('username-span');

const usersList = document.getElementById('users');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');

let myUsername = null;
let typingTimeout = null;

function addMessage(obj) {
  const li = document.createElement('li');
  if (obj.system) {
    li.classList.add('system');
    li.textContent = obj.text;
  } else {
    const who = obj.username === myUsername ? 'me' : '';
    if (who) li.classList.add('me');
    li.innerHTML = `<strong>${obj.username}</strong><div>${escapeHtml(obj.text)}</div>`;
  }
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

joinBtn.addEventListener('click', () => {
  const name = (usernameInput.value || '').trim();
  if (!name) return alert('Please enter a username');
  myUsername = name;
  usernameSpan.textContent = name;
  modal.style.display = 'none';
  socket.emit('join', name);
});

// handle messages
socket.on('message', (msg) => {
  addMessage(msg);
});

// online users
socket.on('users', (list) => {
  usersList.innerHTML = '';
  list.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u;
    usersList.appendChild(li);
  });
});

// typing indicator
const typingSet = new Set();
socket.on('typing', (username) => {
  if (username === myUsername) return;
  typingSet.add(username);
  updateTyping();
});
socket.on('stopTyping', (username) => {
  typingSet.delete(username);
  updateTyping();
});

function updateTyping() {
  if (typingSet.size === 0) typingIndicator.textContent = '';
  else if (typingSet.size === 1) typingIndicator.textContent = `${Array.from(typingSet)[0]} is typing...`;
  else typingIndicator.textContent = `${typingSet.size} people are typing...`;
}

// emit typing with debounce
let isTyping = false;
messageInput.addEventListener('input', () => {
  if (!myUsername) return;
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

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chatMessage', text);
  messageInput.value = '';
  socket.emit('stopTyping');
  isTyping = false;
});

// show modal on load
window.addEventListener('load', () => {
  modal.style.display = 'grid';
  usernameInput.focus();
});