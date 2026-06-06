# VR Assistant

MVP skeleton for a VR desktop assistant:

- `backend/`: Node.js + Express host API for auth and OpenRouter proxy.
- `electron-app/`: Electron + React + Vite desktop client with local SQLite, VRM avatar scaffold, offline STT scaffold, intent detection, and safe command confirmation.

## Milestone 1 scope

Implemented:

- Host auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/verify`.
- JWT expiry: 7 days.
- bcrypt-compatible password hashing cost: 12.
- Host AI proxy skeleton: `POST /api/ai/chat` with prompt builder, OpenRouter call, JSON parsing, action sanitization, and local mock response when no OpenRouter key is configured.
- Electron shell with login, chat screen, settings, VRM viewport scaffold, local SQLite wrappers, keytar JWT storage, mocked offline STT, intent matching, command confirmation modal, and safe command executor.
- Unit/integration tests and GitHub Actions CI.

## Requirements

- Node.js 20+
- npm 10+
- Optional for real offline STT: a Vosk model and the `vosk` native package.

## Setup

```bash
npm install
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=4000
DATABASE_URL=./data/vr-assistant.sqlite
JWT_SECRET=replace-with-a-long-random-secret
OPENROUTER_API_KEY=
DEFAULT_MODEL=openrouter/auto
TOKEN_LIMIT=1800
CLIENT_ORIGIN=http://localhost:5173
```

If `OPENROUTER_API_KEY` is empty, `/api/ai/chat` returns a valid development mock JSON response.

## Run locally

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:electron
```

Register a local user in the Electron login page, then send chat messages. JWT is stored via keytar.

## Tests

```bash
npm run lint
npm test
```

Backend-only:

```bash
npm run lint --workspace backend
npm run test --workspace backend
```

Electron-only:

```bash
npm run lint --workspace electron-app
npm run test --workspace electron-app
```

## Offline STT

Milestone 1 includes a safe mock STT wrapper. To enable Vosk later:

1. Download a small model from https://alphacephei.com/vosk/models.
2. Extract it outside the repo, for example `~/models/vosk-model-small-uz`.
3. Start Electron with:

```bash
VOSK_MODEL_PATH=/absolute/path/to/vosk-model npm run dev:electron
```

## Security notes

- `OPENROUTER_API_KEY` stays on the host and is never returned to clients.
- `/api/auth/login` and `/api/ai/chat` are rate-limited.
- LLM actions are suggestions only; the Electron client requires confirmation by default.
- Client and server sanitize action args and reject network paths, shell metacharacters, and destructive command patterns.
- The current `start_app` executor only allows explicit local aliases. Add human-reviewed aliases before enabling more apps.
- Do not commit `.env`, SQLite databases, Vosk models, or packaged app output.

## Prompt contract

The host builds a compact prompt with:

- `CHAR_NAME`
- one-line `PERSONA`
- compressed `KEY_FACTS`
- limited `RECENT_MESSAGES`
- `USER_MESSAGE`
- `TOKEN_LIMIT`

The model must return JSON only:

```json
{
  "reply": "...",
  "speech": { "voice_hint": "", "rate": 1.0, "pitch": 1.0, "phoneme_timestamps": [] },
  "emotion": { "label": "neutral", "intensity": 0.0 },
  "actions": [{ "type": "command", "name": "open_file", "args": {}, "confidence": 0.0 }],
  "memory_add": ["key=value"],
  "meta": { "language": "uz", "response_tokens_estimate": 0 }
}
```

## Created file map

- `backend/src/server.js`: Express app wiring.
- `backend/src/routes/auth.js`: register/login/verify.
- `backend/src/routes/ai.js`: `/api/ai/chat` proxy, mock fallback, JSON validation, action sanitization.
- `backend/src/services/prompt_builder.js`: token-efficient prompt builder.
- `backend/src/services/summarizer.js`: lightweight memory fact summarizer scaffold.
- `backend/src/prompt_templates/prompt_vr_assistant.txt`: host-side prompt template.
- `backend/migrations/001_create_users.sql`: users table.
- `electron-app/electron/main.js`: Electron window, IPC, keytar, local DB, STT, command execution.
- `electron-app/electron/preload.js`: safe renderer IPC API.
- `electron-app/src/components/*`: login, chat, avatar, settings, confirmation modal.
- `electron-app/src/services/*`: API, SQLite, STT, intent matcher, command executor.
- `electron-app/src/emotion_map.json`: 20+ emotion mappings.
- `.github/workflows/ci.yml`: lint + test workflow.
