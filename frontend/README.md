# NoteCollab — MERN Stack Collaborative Note-Taking App

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcryptjs
- **Frontend:** React 18, Vite, TipTap rich text editor, Zustand, Axios, Tailwind CSS
- **Auth:** JWT (access token stored in localStorage, attached via Axios interceptor)

---

## Project Structure

```
notecollab/
├── backend/
│   ├── models/
│   │   ├── User.js          ← User schema + password hashing
│   │   └── Note.js          ← Note schema + full-text index + collaborators
│   ├── routes/
│   │   ├── auth.js          ← POST /register, POST /login, GET /me
│   │   ├── notes.js         ← Full CRUD + collaborator management
│   │   └── users.js         ← GET /search (for invite autocomplete)
│   ├── middleware/
│   │   └── auth.js          ← JWT protect middleware
│   ├── server.js            ← Express app entry point
│   ├── .env                 ← Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   └── api.js       ← Axios instance + JWT interceptor + 401 handler
    │   ├── store/
    │   │   ├── authStore.js ← Zustand: login, register, logout, fetchMe
    │   │   └── noteStore.js ← Zustand: CRUD notes + collaborator actions
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   └── NotesPage.jsx   ← Main layout with search
    │   ├── components/
    │   │   ├── Sidebar.jsx     ← Note list, tag filter, pinned section
    │   │   ├── Editor.jsx      ← TipTap rich text editor + title + tags + color
    │   │   └── CollabPanel.jsx ← Invite, permissions, remove collaborators
    │   ├── App.jsx             ← Routes + ProtectedRoute guard
    │   ├── main.jsx
    │   └── index.css           ← Tailwind + TipTap editor styles
    ├── index.html
    ├── vite.config.js          ← Dev proxy to backend on :5000
    ├── tailwind.config.js
    └── package.json
```

---

## Step-by-Step Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

---

### Step 1 — Clone / create project
```bash
mkdir notecollab && cd notecollab
```

### Step 2 — Set up the backend
```bash
cd backend
npm install
```

Edit `.env` if needed:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/notecollab
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
```

Start the backend:
```bash
npm run dev      # uses nodemon (auto-restart)
# or
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user (protected) |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notes | Get all notes (owned + collaborated) |
| GET | /api/notes?search=keyword | Full-text search |
| GET | /api/notes?tag=work | Filter by tag |
| POST | /api/notes | Create note |
| GET | /api/notes/:id | Get single note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note (owner only) |

### Collaborators
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/notes/:id/collaborators | Add collaborator by email |
| PUT | /api/notes/:id/collaborators/:userId | Change permission |
| DELETE | /api/notes/:id/collaborators/:userId | Remove collaborator |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/search?q=email | Search users for invite |

---

## Features

### ✅ JWT Authentication
- Register / Login with hashed passwords (bcryptjs)
- JWT stored in localStorage
- Axios interceptor attaches `Authorization: Bearer <token>` to every request
- Auto-redirect to /login on 401

### ✅ Rich Text Editor (TipTap)
- Bold, Italic, Underline, Strikethrough
- H1, H2 headings
- Bullet list, Ordered list, Task list (checkboxes)
- Code blocks, Blockquotes, Highlight
- Auto-save with 800ms debounce

### ✅ Full-Text Search
- MongoDB text index on `title`, `contentText`, `tags`
- Debounced search input (300ms)
- Live result count

### ✅ Collaborator Management
- Invite by email with autocomplete
- 3 permission levels: view, edit, admin
- Owner can change permissions or remove collaborators
- Collaborators can leave a note

### ✅ Additional Features
- Note pinning
- Note color coding (7 colors)
- Tag system with add/remove
- Pinned notes section in sidebar
- Tag filter buttons in sidebar
- Delete note (owner only)
- User dropdown with logout

---

## Common Issues

**MongoDB not connecting:**
- Make sure `mongod` is running: `sudo service mongod start` (Linux) or `brew services start mongodb-community` (Mac)
- Or use MongoDB Atlas and update MONGO_URI in .env

**Port conflicts:**
- Backend defaults to 5000, frontend to 5173
- Change in .env and vite.config.js if needed

**TipTap not rendering:**
- Make sure all @tiptap/* packages are installed: `npm install`
