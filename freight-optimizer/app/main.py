from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router, get_current_user
from app.ml import predict_cost, train_model_from_csv
import pandas as pd

app = FastAPI(
    title="AI Freight Cost Optimizer",
    version="1.0.0",
    description="Secure ML API to predict freight cost and upload CSV to retrain the model."
)

# CORS (Allow all for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include login routes
app.include_router(auth_router, tags=["Auth"])

@app.get("/")
def root():
    return {"message": "AI Freight Cost Optimizer running."}

@app.post("/predict", tags=["Prediction"])
def predict_api(data: dict, user: str = Depends(get_current_user)):
    cost = predict_cost(data)
    return {"estimated_cost": cost}

@app.post("/upload-csv", tags=["Model Training"])
def upload_csv(file: UploadFile = File(...), user: str = Depends(get_current_user)):
    df = pd.read_csv(file.file)
    train_model_from_csv(df)
    return {"message": "Model trained successfully"}
