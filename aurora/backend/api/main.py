from fastapi import FastAPI

app = FastAPI(title="Aurora Core API")

@app.get("/health")
async def health():
    return {"status": "ok"}
