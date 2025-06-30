from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head>
            <title>Real-Time Notes Pad</title>
        </head>
        <body>
            <h1>Welcome to the Real-Time Notes Pad JoOoOon!</h1>
            <p>This is a placeholder for the real-time notes editor.</p>
        </body>
    </html>
    """
