# Secure Pastebin

A privacy-focused pastebin with end-to-end encryption. All content is encrypted client-side before being sent to the server, ensuring that only those with the share link can view the content.

## Features

- **End-to-End Encryption** - AES-256-GCM encryption happens in your browser. The server never sees your content.
- **File Attachments** - Attach files up to 25MB each, also encrypted client-side.
- **Rich Text Editor** - Full formatting toolbar with fonts, sizes, colors, and more.
- **Expiration Options** - Set pastes to expire after 5 minutes to 1 month, or never.
- **Burn After Reading** - Automatically delete paste after first view.
- **Anonymous** - No accounts, no tracking, no IP logging.
- **Dark Theme** - Minimalist dark mode interface.

## How It Works

1. Content is encrypted in your browser using AES-256-GCM
2. Only the encrypted data is sent to the server
3. The decryption key is stored in the URL fragment (`#`), which browsers never send to servers
4. Share URL format: `https://example.com/paste/{id}#{key}`

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Encryption**: Web Crypto API (AES-256-GCM)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theLegoSpartan/secure-pastebin.git
   cd secure-pastebin
   ```

2. **Set up the database**
   ```bash
   createdb secure_pastebin
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running Locally

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client** (in another terminal)
   ```bash
   cd client
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## Environment Variables

### Server

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/secure_pastebin` |

### Client

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |

### Example `.env` files

**server/.env**
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/secure_pastebin
```

**client/.env**
```
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
secure-pastebin/
├── server/                   # Express backend
│   └── src/
│       ├── index.ts          # Entry point
│       ├── routes/
│       │   └── pastes.ts     # API endpoints
│       ├── db/
│       │   └── index.ts      # Database connection
│       └── utils/
│           └── cleanup.ts    # Expired paste cleanup
├── client/                   # React frontend
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── CreatePaste.tsx
│       │   ├── ViewPaste.tsx
│       │   ├── RichTextEditor.tsx
│       │   └── Layout.tsx
│       ├── utils/
│       │   ├── crypto.ts     # Encryption utilities
│       │   ├── api.ts        # API client
│       │   └── fontSize.ts   # Font size extension
│       └── styles/
│           └── global.css
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pastes` | Create a new paste |
| `GET` | `/api/pastes/:id` | Get a paste by ID |
| `DELETE` | `/api/pastes/:id` | Delete a paste |
| `GET` | `/health` | Health check |

## Security

- All encryption/decryption happens client-side using the Web Crypto API
- The server only stores encrypted content and cannot decrypt it
- Decryption keys are never sent to the server (stored in URL fragment)
- Expired pastes are automatically cleaned up every minute
- No user data or IP addresses are logged

## License

MIT
