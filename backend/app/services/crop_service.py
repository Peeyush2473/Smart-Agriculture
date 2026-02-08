import joblib
import numpy as np
import os
from typing import List
from app.core.config import settings

# Define paths
# settings.BASE_DIR points to app/.. (i.e., backend/)
MODEL_PATH = os.path.join(settings.BASE_DIR, "app/models/ml_models/cropRecommend/crop_recommendation_model.pkl")
SCALER_PATH = os.path.join(settings.BASE_DIR, "app/models/ml_models/cropRecommend/scaler.pkl")

class CropService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.load_error = None
        self._load_models()

    def _load_models(self):
        try:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            print(f"Crop recommendation models loaded successfully from {MODEL_PATH}")
        except Exception as e:
            self.load_error = str(e)
            print(f"Error loading crop models from {MODEL_PATH}: {e}")
            # In production, might want to raise error or retry, 
            # but for now we'll just log it and fail on prediction.

    def predict_crop(self, input_data: list) -> str:
        if not self.model or not self.scaler:
            error_msg = self.load_error if self.load_error else "Models not loaded (unknown reason)"
            raise RuntimeError(f"Models not loaded: {error_msg}")

        # Input data is expected to be [N, P, K, temperature, humidity, ph, rainfall]
        data_np = np.array([input_data])
        
        # Scale the data
        scaled_data = self.scaler.transform(data_np)
        
        # Get prediction
        prediction = self.model.predict(scaled_data)
        return prediction[0].upper()

crop_service = CropService()
