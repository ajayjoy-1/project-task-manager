from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["Tasks"])


@router.post(
    "/projects/{project_id}/tasks",
    response_model=schemas.TaskOut,
    status_code=201,
)
def create_task(
    project_id: int, payload: schemas.TaskCreate, db: Session = Depends(get_db)
):
    project = db.get(models.Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    task = models.Task(
        title=payload.title,
        description=payload.description,
        status=payload.status.value,
        project_id=project_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks", response_model=list[schemas.TaskOut])
def list_tasks(
    status_filter: schemas.TaskStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
    project_id: int | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(models.Task)

    if status_filter is not None:
        stmt = stmt.where(models.Task.status == status_filter.value)
    if project_id is not None:
        stmt = stmt.where(models.Task.project_id == project_id)
    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(models.Task.title.ilike(term), models.Task.description.ilike(term))
        )

    stmt = stmt.order_by(models.Task.id.desc())
    return db.scalars(stmt).all()


@router.patch("/tasks/{task_id}/status", response_model=schemas.TaskOut)
def update_task_status(
    task_id: int, payload: schemas.TaskStatusUpdate, db: Session = Depends(get_db)
):
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = payload.status.value
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return Response(status_code=204)