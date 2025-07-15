import joblib
import pandas as pd
import os
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

MODEL_PATH = "model.joblib"

def train_model_from_csv(df: pd.DataFrame):
    X = df[["source", "destination", "weight", "priority"]]
    X = pd.get_dummies(X)
    y = df["cost"]
    model = LinearRegression()
    model.fit(X, y)
    joblib.dump((model, X.columns.tolist()), MODEL_PATH)

def predict_cost(data: dict):
    model, columns = joblib.load(MODEL_PATH)
    df = pd.DataFrame([data])
    df = pd.get_dummies(df)
    for col in columns:
        if col not in df:
            df[col] = 0
    df = df[columns]
    return round(model.predict(df)[0], 2)
