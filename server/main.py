from fastapi import FastAPI
from server.database import engine, Base
import server.models

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Trip system server is running"}