import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.get("/", (req, res) => {
  res.send("OXO multiplayer server running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGIN }
});

const rooms = new Map();

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const makeRoom = () => ({
  board: Array(9).fill(""),
  turn: "X",
  winner: "",
  players: { X: null, O: null },
  lastActive: Date.now()
});

const evaluateWinner = (board) => {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell)) return "Draw";
  return "";
};

const buildStatus = (room) => {
  if (room.winner) {
    return room.winner === "Draw" ? "Round ended in a draw." : `${room.winner} wins the round.`;
  }
  if (!room.players.X || !room.players.O) {
    return "Waiting for both players to join.";
  }
  return `${room.turn}'s move.`;
};

const broadcastRoom = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("room_state", {
    board: room.board,
    turn: room.turn,
    winner: room.winner,
    players: {
      X: Boolean(room.players.X),
      O: Boolean(room.players.O)
    },
    status: buildStatus(room)
  });
};

io.on("connection", (socket) => {
  const roomId = socket.handshake.query.roomId;
  if (!roomId || typeof roomId !== "string") {
    socket.emit("error_message", "Missing room id.");
    socket.disconnect();
    return;
  }

  const room = rooms.get(roomId) || makeRoom();
  rooms.set(roomId, room);
  socket.join(roomId);

  let role = "Spectator";
  if (!room.players.X) {
    room.players.X = socket.id;
    role = "X";
  } else if (!room.players.O) {
    room.players.O = socket.id;
    role = "O";
  }

  socket.emit("room_joined", { role, status: buildStatus(room) });
  broadcastRoom(roomId);

  socket.on("make_move", ({ index }) => {
    const current = rooms.get(roomId);
    if (!current) return;
    if (current.winner) return;

    const isPlayerX = current.players.X === socket.id;
    const isPlayerO = current.players.O === socket.id;
    const mark = isPlayerX ? "X" : isPlayerO ? "O" : null;

    if (!mark) return;
    if (current.turn !== mark) return;
    if (index < 0 || index > 8) return;
    if (current.board[index]) return;

    current.board[index] = mark;
    current.winner = evaluateWinner(current.board);
    if (!current.winner) {
      current.turn = current.turn === "X" ? "O" : "X";
    }
    current.lastActive = Date.now();
    broadcastRoom(roomId);
  });

  socket.on("reset_game", () => {
    const current = rooms.get(roomId);
    if (!current) return;
    const isPlayer = current.players.X === socket.id || current.players.O === socket.id;
    if (!isPlayer) return;

    current.board = Array(9).fill("");
    current.turn = "X";
    current.winner = "";
    current.lastActive = Date.now();
    broadcastRoom(roomId);
  });

  socket.on("disconnect", () => {
    const current = rooms.get(roomId);
    if (!current) return;
    if (current.players.X === socket.id) current.players.X = null;
    if (current.players.O === socket.id) current.players.O = null;
    current.lastActive = Date.now();
    broadcastRoom(roomId);

    const noPlayers = !current.players.X && !current.players.O;
    if (noPlayers) {
      setTimeout(() => {
        const still = rooms.get(roomId);
        if (still && !still.players.X && !still.players.O) {
          rooms.delete(roomId);
        }
      }, 1000 * 60 * 10);
    }
  });
});

server.listen(PORT, () => {
  console.log(`OXO server listening on ${PORT}`);
});
