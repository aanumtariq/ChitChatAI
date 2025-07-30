const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const onlineUsers = new Map(); // userId -> socketId
require('dotenv').config();

const connectDB = require('./config/db');
const authenticateUser = require('./middleware/firebaseAuth');

// Import routes
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ====================
// ⚙️ Connect to MongoDB
// ====================
connectDB();

// ====================
// 📦 Initialize App & Server
// ====================
const app = express();
const server = http.createServer(app);

// ====================
// 📡 Socket.IO setup
// ====================
const io = socketIO(server, {
  cors: {
    origin: '*', // ⚠ Replace with frontend URL in production
    methods: ['GET', 'POST'],
  },
});

// ====================
// 🛡 Middleware
// ====================
app.use(cors());
app.use(express.json());

// ====================
// 📦 API ROUTES
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groups', groupRoutes);

app.use('/api/ai', require('./routes/aiRoutes'));

// app.use('/api/groups', authenticateUser, groupRoutes);
app.use('/api/users', require('./routes/userRoutes'));


// ====================
// 💬 SOCKET.IO EVENTS
// ====================
const ChatMessage = require('./models/ChatMessage');

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('userConnected', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is online`);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} went offline`);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});



// ====================
// 🧪 Test Route
// ====================
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is working!' });
});

// ====================
// 📄 Swagger Docs
// ====================
const swaggerDocs = require('./swagger');
swaggerDocs(app);

// ====================
// 🚀 Start Server
// ====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
