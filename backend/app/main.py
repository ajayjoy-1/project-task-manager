from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (registers the tables)
from .database import Base, engine
from .routers import auth, projects, stats, tasks
from .security import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project & Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

protected = [Depends(get_current_user)]

app.include_router(auth.router)
app.include_router(projects.router, dependencies=protected)
app.include_router(tasks.router, dependencies=protected)
app.include_router(stats.router, dependencies=protected)


@app.get("/")
def root():
    return {"message": "API is running"}