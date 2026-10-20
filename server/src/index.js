import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { getActiveRoomCount } from './roomManager.js';
import { registerSocketHandlers } from './socketHandlers.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));

app.get('/', (_req, res) => res.json({ ok: true, name: 'Undercover Party V2 API' }));
app.get('/health', (_req, res) => res.json({ ok: true, activeRooms: getActiveRoomCount() }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN?.split(',') || true, methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

io.on('connection', socket => {
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Undercover Server] Listening on http://0.0.0.0:${PORT}`);
});
