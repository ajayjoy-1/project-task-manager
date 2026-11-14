from fastapi import FastAPI

from . import models  # noqa: F401  (registers the tables)
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project & Task Manager API")


@app.get("/")
def root():
    return {"message": "API is running"}