"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const makeRoomId = () => Math.random().toString(36).slice(2, 8);

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const suggested = useMemo(() => makeRoomId(), []);

  return (
    <main>
      <div className="container">
        <section className="card fade-up">
          <h1 className="title">OXO Online</h1>
          <p className="subtitle">
            Classic tic‑tac‑toe with invite‑by‑link multiplayer. Create a room, share the
            link, and battle for the center square.
          </p>
          <div className="share">
            <div className="badge">Suggested room</div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>{suggested}</div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button
              className="button"
              onClick={() => router.push(`/room/${suggested}`)}
            >
              Create and Join Room
            </button>
          </div>
        </section>

        <section className="card fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="title" style={{ fontSize: "2.2rem" }}>
            Join a Room
          </h2>
          <p className="subtitle">Paste a room code you received from a friend.</p>
          <input
            className="input"
            placeholder="Room code"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value.trim())}
          />
          <div className="controls">
            <button
              className="button secondary"
              onClick={() => roomId && router.push(`/room/${roomId}`)}
            >
              Join Room
            </button>
            <button className="button ghost" onClick={() => setRoomId("")}>Clear</button>
          </div>
        </section>
      </div>
    </main>
  );
}
