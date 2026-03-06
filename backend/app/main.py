from fastapi import FastAPI
from .routers import meetings, tasks, users, auth
from .models import Base
from .database import engine

app = FastAPI(title="Meeting Protocol API")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Server is running"}

app.include_router(meetings.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(auth.router)