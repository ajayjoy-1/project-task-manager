from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["Dashboard"])


@router.get("/stats", response_model=schemas.StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total_projects = db.scalar(select(func.count(models.Project.id))) or 0

    rows = db.execute(
        select(models.Task.status, func.count(models.Task.id)).group_by(
            models.Task.status
        )
    ).all()
    counts = {status: count for status, count in rows}

    pending = counts.get("Pending", 0)
    in_progress = counts.get("In Progress", 0)
    completed = counts.get("Completed", 0)
    total_tasks = pending + in_progress + completed
    completion_rate = round(completed / total_tasks * 100) if total_tasks else 0

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "completion_rate": completion_rate,
    }