# OXO Online (Invite-by-Link Multiplayer)

Classic tic-tac-toe with invite-by-link rooms and real-time multiplayer.

## Local Dev

1. Install dependencies
   1. `npm install`
   2. `cd server && npm install`
2. Start the websocket server
   1. `cd server && npm run dev`
3. Start the Next.js app
   1. `npm run dev`
4. Open `http://localhost:3000`

## Environment

Frontend expects `NEXT_PUBLIC_WS_URL`.

Server expects `PORT` and `FRONTEND_ORIGIN`.

Examples are in `.env.example` and `server/.env.example`.

## Deploy to Vercel (frontend live)

The **Next.js app** can go on Vercel. The **WebSocket server** must run on a separate host (Vercel doesn’t support long-lived WebSockets).

### 1. Deploy the Next.js app to Vercel

1. Push your code to **GitHub** (if you haven’t already).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New** → **Project** and import this repo.
4. Leave **Root Directory** as `.` (project root).  
   Vercel will detect Next.js and use `npm run build`.
5. Under **Environment Variables**, add:
   - **Name:** `NEXT_PUBLIC_WS_URL`  
   - **Value:** your WebSocket server URL (see step 2).  
   Example: `https://your-oxo-server.onrender.com`  
   (You can add this after deploying the server; then redeploy the Vercel project.)
6. Click **Deploy**. Your app will be live at `https://your-project.vercel.app`.

### 2. Deploy the WebSocket server (e.g. Render)

You need a Node host that keeps a process running. **Render** has a free tier and works well.

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New** → **Web Service**.
3. Connect the **same repo**, then set:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run dev` or `node index.js`
4. Under **Environment**, add:
   - `FRONTEND_ORIGIN` = `https://your-project.vercel.app` (your Vercel URL)
   - `PORT` is usually set by Render (e.g. `10000`); only add if required.
5. Create the service. Render will give you a URL like `https://oxo-multiplayer-server.onrender.com`.
6. In **Vercel** → your project → **Settings** → **Environment Variables**, set:
   - `NEXT_PUBLIC_WS_URL` = `https://oxo-multiplayer-server.onrender.com`
7. **Redeploy** the Vercel project so the frontend uses the new WebSocket URL.

### Summary

| Part            | Host   | Env / config |
|----------------|--------|--------------|
| Next.js (UI)   | Vercel | `NEXT_PUBLIC_WS_URL` = WebSocket server URL |
| WebSocket (server/) | Render (or Fly.io, Railway) | `FRONTEND_ORIGIN` = Vercel app URL |

**Note:** On Render’s free tier the server may sleep when idle; the first game connection might take a few seconds to wake it.
