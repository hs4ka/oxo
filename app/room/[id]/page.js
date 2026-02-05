"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

const emptyBoard = Array(9).fill("");

const getWsUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  return "http://localhost:4000";
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.id?.toString() || "";
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState("X");
  const [status, setStatus] = useState("Connecting...");
  const [youAre, setYouAre] = useState("Spectator");
  const [winner, setWinner] = useState("");
  const [players, setPlayers] = useState({ X: false, O: false });

  const socket = useMemo(() => {
    if (!roomId) return null;
    return io(getWsUrl(), {
      transports: ["websocket"],
      query: { roomId }
    });
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room_joined", (payload) => {
      setYouAre(payload.role);
      setStatus(payload.status);
    });

    socket.on("room_state", (payload) => {
      setBoard(payload.board);
      setTurn(payload.turn);
      setWinner(payload.winner || "");
      setPlayers(payload.players);
      if (payload.status) {
        setStatus(payload.status);
      }
    });

    socket.on("error_message", (message) => {
      setStatus(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const onMove = (index) => {
    if (!socket) return;
    socket.emit("make_move", { index });
  };

  const onReset = () => {
    if (!socket) return;
    socket.emit("reset_game");
  };

  const canPlay = youAre === "X" || youAre === "O";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main>
      <div className="container">
        <section className="card fade-up">
          <h1 className="title">Room {roomId}</h1>
          <div className="status">{status}</div>
          <div className="badge">You are: {youAre}</div>
          <div style={{ marginTop: 16 }}>
            <div className="board">
              {board.map((cell, index) => {
                const isTurn = turn === youAre && !winner && cell === "";
                return (
                  <button
                    key={index}
                    className="cell"
                    onClick={() => onMove(index)}
                    disabled={!isTurn}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="status">
            {winner
              ? winner === "Draw"
                ? "It\u2019s a draw."
                : `${winner} wins!`
              : `Turn: ${turn}`}
          </div>
          <div className="controls">
            <button className="button" onClick={onReset} disabled={!canPlay}>
              Reset Board
            </button>
            <a className="button ghost" href="/">
              New Room
            </a>
          </div>
        </section>

        <section className="card fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="title" style={{ fontSize: "2.2rem" }}>
            Invite Link
          </h2>
          <p className="subtitle">Share this link so another player can join.</p>
          <div className="share">{shareUrl}</div>
          <div style={{ marginTop: 16 }}>
            <div className="badge">Players connected</div>
            <div style={{ marginTop: 10, fontWeight: 600 }}>
              X: {players.X ? "Online" : "Waiting"} 
              <span style={{ marginLeft: 12 }}>
                O: {players.O ? "Online" : "Waiting"}
              </span>
            </div>
          </div>
          <p className="subtitle" style={{ marginTop: 18 }}>
            Spectators can join too, but only X and O can play.
          </p>
        </section>
      </div>
    </main>
  );
}
