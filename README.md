# Project & Task Manager

A full-stack web application to manage projects and their tasks, with user authentication and role-based access.

## Features

**Core**
- Create projects
- Add tasks to a project
- View all projects with their tasks
- Update task status: Pending, In Progress, Completed
- Delete tasks
- Search tasks by title or description, and filter by status
- Input validation on both the frontend and the backend

**Bonus**
- User registration and login (JWT authentication, bcrypt password hashing)
- User roles: `admin` and `user`
- Dashboard with task statistics and a completion bar
- Responsive layout (works on mobile and desktop)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python, FastAPI |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT (PyJWT), bcrypt |
| API | REST (JSON) |

## Roles and Access

- All endpoints except registration and login require a logged-in user.
- **The first account registered becomes the `admin`.** Every account after that is a `user`.
- `admin`: can do everything, including deleting projects.
- `user`: can create projects, add tasks, update task status and delete tasks, but cannot delete projects.

## Project Structure

```
project-task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py          # app setup, CORS, router registration
│   │   ├── database.py      # database connection and session
│   │   ├── models.py        # User, Project and Task tables
│   │   ├── schemas.py       # request/response models and validation
│   │   ├── security.py      # password hashing, JWT, role checks
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── projects.py
│   │       ├── tasks.py
│   │       └── stats.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx          # login gate
│       ├── TaskManager.jsx  # main screen
│       ├── api.js           # all backend calls
│       ├── constants.js
│       └── components/
└── README.md
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- Git

## Installation and Running

Clone the repository:

```bash
git clone https://github.com/ajayjoy-1/project-task-manager.git
cd project-task-manager
```

### 1. Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
- macOS / Linux: `source venv/bin/activate`

Install dependencies and start the server:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://127.0.0.1:8000 and interactive API docs are at http://127.0.0.1:8000/docs.
The SQLite database file (`tasks.db`) is created automatically on first run.

Optional: set a `SECRET_KEY` environment variable to sign login tokens. A development default is used if it is not set.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Keep the backend running at the same time.

### 3. First use

On the login screen click **Create one**, register an account (this first account is the admin), and start creating projects. To see the role difference, log out and register a second account.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register and receive a token |
| POST | `/auth/login` | Public | Log in and receive a token |
| GET | `/auth/me` | User | Current user |
| POST | `/projects` | User | Create a project |
| GET | `/projects` | User | List all projects with their tasks |
| DELETE | `/projects/{id}` | **Admin** | Delete a project and its tasks |
| POST | `/projects/{project_id}/tasks` | User | Add a task to a project |
| GET | `/tasks?status=&search=&project_id=` | User | Search and filter tasks |
| PATCH | `/tasks/{id}/status` | User | Update a task's status |
| DELETE | `/tasks/{id}` | User | Delete a task |
| GET | `/stats` | User | Dashboard statistics |

Protected endpoints expect the header `Authorization: Bearer <token>`. In the interactive docs, use the **Authorize** button and paste the token.

## Validation Rules

- Project name: required, 1 to 100 characters (whitespace-only is rejected)
- Project description: optional, up to 500 characters
- Task title: required, 1 to 200 characters
- Task description: optional, up to 1000 characters
- Task status: must be `Pending`, `In Progress` or `Completed`
- Registration: name required, valid email format, password 6 to 72 characters, unique email

The backend returns `422` for invalid input, `401` for missing/invalid login, `403` for insufficient role, `404` for missing records and `409` for a duplicate email. The frontend shows these as readable messages.

## Design Decisions

- **FastAPI + Pydantic:** automatic request validation and auto-generated API docs.
- **SQLite:** zero setup so the project runs immediately after cloning.
- **Search and filtering run on the backend** (`/tasks` endpoint), so the logic is reusable by any client.
- **Single API helper** (`frontend/src/api.js`) keeps all network code in one place.
- **Router-level auth dependency:** one line protects every endpoint in a router, so no route is accidentally left open.

## Not Implemented (Future Work)

- Docker deployment
- Editing task titles/descriptions after creation
- Per-user ownership of projects