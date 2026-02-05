# Step-by-step: Get player O working (Vercel + Render)

Follow these steps in order so both X and O can play on your live Vercel app.

---

## Part A: Deploy the game server on Render

### Step 1: Open Render and sign in

1. Go to **https://render.com** in your browser.
2. Click **Get Started** or **Sign In**.
3. Choose **Sign in with GitHub** and authorize Render to access your GitHub account.

### Step 2: Create a new Web Service

1. On the Render **Dashboard**, click **New +** (top right).
2. Click **Web Service**.

### Step 3: Connect your GitHub repo

1. Under **Connect a repository**, find your repo (e.g. **hs4ka/oxo**).
2. If you don’t see it, click **Configure account** and give Render access to the right GitHub account or organization.
3. Click **Connect** next to your **oxo** repo.

### Step 4: Configure the Web Service

Fill in the form exactly as below:

| Field | Value |
|-------|--------|
| **Name** | `oxo-server` (or any name you like) |
| **Region** | Choose the one closest to you (e.g. Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `server` ← **Important: type exactly `server`** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | **Free** (unless you want a paid plan) |

### Step 5: Add environment variable (Vercel URL)

1. Scroll to **Environment Variables**.
2. Click **Add Environment Variable**.
3. Set:
   - **Key:** `FRONTEND_ORIGIN`
   - **Value:** Your **exact** Vercel app URL, e.g. `https://oxo-xxxx.vercel.app`  
     (No trailing slash. Find it in Vercel → your project → **Domains** or the deployment URL.)
4. Do **not** add `PORT` unless Render asks for it (Render sets it automatically).

### Step 6: Deploy on Render

1. Click **Create Web Service** at the bottom.
2. Wait for the first deploy to finish (a few minutes). The log will show “Your service is live at …”.
3. Copy the **URL** Render shows (e.g. `https://oxo-server-xxxx.onrender.com`).  
   You’ll use this in Part B.  
   (You can also find it later under the service name → **Settings** → **Public URL**.)

---

## Part B: Point Vercel at the game server

### Step 7: Open your Vercel project

1. Go to **https://vercel.com** and sign in.
2. Open the project that hosts your OXO app (e.g. **oxo**).

### Step 8: Add the WebSocket server URL

1. Click **Settings** (top tab).
2. In the left sidebar, click **Environment Variables**.
3. Find **NEXT_PUBLIC_WS_URL**:
   - If it **does not exist**: click **Add New** → **Environment Variable**.
   - If it **already exists**: click **Edit** (pencil) next to it.
4. Set:
   - **Name:** `NEXT_PUBLIC_WS_URL`
   - **Value:** The Render URL from Step 6, e.g. `https://oxo-server-xxxx.onrender.com`  
     (No trailing slash. Use **https**, not http.)
5. Under **Environment**, leave **Production**, **Preview**, and **Development** all checked (or at least **Production**).
6. Click **Save**.

### Step 9: Redeploy the Vercel project

1. Go to the **Deployments** tab.
2. Find the latest deployment (top of the list).
3. Click the **⋮** (three dots) on the right of that deployment.
4. Click **Redeploy**.
5. Confirm **Redeploy** again.
6. Wait until the new deployment shows **Ready**.

---

## Part C: Push your latest code (connection-error UI)

So the live site shows a clear message if the game server can’t be reached:

### Step 10: Commit and push

In your project folder, run:

```bash
cd "/Users/akash/Documents/New project"

git status
git add -A
git commit -m "Add connection error UI for multiplayer"
git push origin main
```

If Vercel is connected to your repo, it will redeploy automatically. If you already redeployed in Step 9, you’re fine; this step just ensures the latest UI (including the “Can’t reach game server” message) is live.

---

## Part D: Check that O can play

### Step 11: Test with two “players”

1. **Player X:**  
   Open your Vercel URL (e.g. `https://oxo-xxxx.vercel.app`) in one browser (e.g. Chrome).  
   Click **Create and Join Room**. You should see **You are: X**.

2. **Player O:**  
   Copy the full room URL from the address bar (e.g. `https://oxo-xxxx.vercel.app/room/abc12xy`).  
   Open that link in a **different** browser or an **incognito/private** window (e.g. Safari or Chrome incognito).  
   You should see **You are: O** (and **not** “Spectator” or “not connected”).

3. **Play:**  
   Take turns: X moves first, then O. Reset and play again. Both should stay in sync.

### Quick check

- If the second player sees **You are: O** → setup is correct; O can play.
- If they see **You are: Spectator** or **You are: … (not connected)** or a “Can’t reach game server” message → the browser is not reaching the Render server. Then:
  - Confirm **NEXT_PUBLIC_WS_URL** in Vercel (Step 8) is exactly the Render URL (https, no trailing slash).
  - Confirm you **Redeployed** Vercel after adding it (Step 9).
  - On Render’s free tier, the first request after idle can take 30–60 seconds; wait and try again.

---

## Summary checklist

- [ ] Render: Web Service created, **Root Directory** = `server`, **Start Command** = `node index.js`
- [ ] Render: Env var **FRONTEND_ORIGIN** = your Vercel app URL
- [ ] Render: Service deployed and URL copied
- [ ] Vercel: **NEXT_PUBLIC_WS_URL** = your Render URL (https, no trailing slash)
- [ ] Vercel: Project **Redeployed** after adding the variable
- [ ] Test: Second player sees **You are: O** and can move

Done. Both X and O can play.
