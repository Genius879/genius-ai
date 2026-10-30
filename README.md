# Genius AI — starter project

Genius AI is a responsive web app that can also be packaged for Android using Capacitor. This starter includes:
- AI chat (OpenAI Responses API)
- Image generation (OpenAI Images API)
- Text-to-speech (OpenAI Audio Speech API)

## Requirements
- Node.js 20 or newer
- An OpenAI API key and API billing/usage access
- Android Studio only when you are ready to build the Android package

## 1. Configure the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and add your API key to `OPENAI_API_KEY`. Keep this file private. Never paste the key into the React app or upload it to GitHub. You can change `OPENAI_CHAT_MODEL` to a model enabled for your API project.

## 2. Configure the frontend

In a second terminal:

```bash
cd client
npm install
```

## 3. Run locally

From the project root, install the root helper and start both services:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The backend runs on http://localhost:8787.

If the frontend and backend are hosted on different domains, set `VITE_API_URL` for the client build and set `CLIENT_ORIGIN` on the server to the frontend origin.

## 4. Build for Android

From the project root:

```bash
npm run android:add
```

Then open the generated `client/android` project in Android Studio. For later updates, run:

```bash
npm run android:sync
```

For a web production build:

```bash
npm run build
```

## Important notes
- This is a functional starter, not a finished production service.
- API usage may incur charges. Set usage limits/budgets in your OpenAI Platform account and monitor usage.
- Add user authentication, persistent database-backed chat history, moderation, request quotas, logging, privacy disclosures, and production hosting before releasing publicly.
- The initial chat endpoint sends each message as a standalone request; conversation memory and sign-in are planned next steps.
- The app currently plays generated speech in the browser. Native Android audio behavior should be tested on a physical device.
