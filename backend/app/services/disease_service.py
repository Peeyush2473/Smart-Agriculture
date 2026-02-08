import os
import numpy as np
import tensorflow as tf
import cv2
import pickle
from app.core.config import settings

# Define paths
MODEL_PATH = os.path.join(settings.BASE_DIR, "app/models/ml_models/cropDisease/disease_detect_model.keras")
LABEL_ENCODER_PATH = os.path.join(settings.BASE_DIR, "app/models/ml_models/cropDisease/label_encoder.pkl")
IMG_SIZE = 224

class DiseaseService:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.load_error = None
        self._load_models()

    def _load_models(self):
        try:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            with open(LABEL_ENCODER_PATH, "rb") as f:
                self.label_encoder = pickle.load(f)
            print(f"Disease detection models loaded successfully from {MODEL_PATH}")
        except Exception as e:
            self.load_error = str(e)
            print(f"Error loading disease models from {MODEL_PATH}: {e}")

    def predict_disease(self, image_bytes: bytes) -> dict:
        if not self.model or not self.label_encoder:
            error_msg = self.load_error if self.load_error else "Models not loaded (unknown reason)"
            raise RuntimeError(f"Models not loaded: {error_msg}")

        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Preprocess image
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = tf.cast(img, tf.float32)
            img = tf.keras.applications.efficientnet.preprocess_input(img)
            img = tf.expand_dims(img, axis=0)

            # Predict
            preds = self.model.predict(img)[0]
            class_idx = np.argmax(preds)
            class_name = self.label_encoder.inverse_transform([class_idx])[0]
            confidence = float(preds[class_idx])

            return {
                "disease_name": class_name,
                "confidence": confidence,
                "treatment": self._get_treatment(class_name), # Simple lookup for now
                "description": f"Detected {class_name} with {confidence*100:.1f}% confidence."
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            raise e

    def _get_treatment(self, disease_name: str) -> str:
        # Dictionary of treatments (can be expanded)
        treatments = {
            "Apple___Apple_scab": "Use fungicides specifically for apple scab. Remove infected leaves.",
            "Apple___Black_rot": "Remove infected fruit and mummified fruit. Prune out cankers.",
            "Apple___Cedar_apple_rust": "Remove galls from nearby juniper trees. Use resistant varieties.",
            "Apple___healthy": "Your plant looks healthy! Keep up the good care.",
            "Blueberry___healthy": "Your plant looks healthy! Keep up the good care.",
            "Cherry_(including_sour)___Powdery_mildew": "Prune to improve air circulation. Use sulfur-based fungicides.",
            "Cherry_(including_sour)___healthy": "Your plant looks healthy! Keep up the good care.",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Use resistant hybrids. Rotate crops. Apply fungicides if necessary.",
            "Corn_(maize)___Common_rust_": "Use resistant hybrids. Fungicides may be needed in severe cases.",
            "Corn_(maize)___Northern_Leaf_Blight": "Use resistant hybrids. Rotate crops. Tillage to bury residue.",
            "Corn_(maize)___healthy": "Your plant looks healthy! Keep up the good care.",
            "Grape___Black_rot": "Remove mummified berries. Apply fungicides early in the season.",
            "Grape___Esca_(Black_Measles)": "Remove infected vines. Protect pruning wounds.",
            "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Apply fungicides. Improve air circulation.",
            "Grape___healthy": "Your plant looks healthy! Keep up the good care.",
            "Orange___Haunglongbing_(Citrus_greening)": "Remove infected trees. Control psyllid vectors. Use disease-free nursery stock.",
            "Peach___Bacterial_spot": "Use resistant varieties. Copper sprays may help.",
            "Peach___healthy": "Your plant looks healthy! Keep up the good care.",
            "Pepper,_bell___Bacterial_spot": "Use resistant varieties. Copper sprays. Avoid overhead irrigation.",
            "Pepper,_bell___healthy": "Your plant looks healthy! Keep up the good care.",
            "Potato___Early_blight": "Crop rotation. maximize air flow. Fungicides like chlorothalonil.",
            "Potato___Late_blight": "Destroy infected tubers. Fungicides are critical. Use resistant varieties.",
            "Potato___healthy": "Your plant looks healthy!",
            "Raspberry___healthy": "Your plant looks healthy!",
            "Soybean___healthy": "Your plant looks healthy!",
            "Squash___Powdery_mildew": "Use resistant varieties. Fungicides. Remove infected debris.",
            "Strawberry___Leaf_scorch": "Remove infected leaves. Fungicides.",
            "Strawberry___healthy": "Your plant looks healthy!",
            "Tomato___Bacterial_spot": "Copper sprays. Use disease-free seeds/transplants.",
            "Tomato___Early_blight": "Mulch to prevent soil splash. Fungicides. Remove lower leaves.",
            "Tomato___Late_blight": "Fungicides. Destroy infected plants immediately.",
            "Tomato___Leaf_Mold": "Improve air circulation. Fungicides.",
            "Tomato___Septoria_leaf_spot": "Remove infected leaves. Mulch. Fungicides.",
            "Tomato___Spider_mites Two-spotted_spider_mite": "Use miticides or insecticidal soap. Predatory mites.",
            "Tomato___Target_Spot": "Fungicides. Remove infected debris.",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Control whiteflies. Use resistant varieties. Remove infected plants.",
            "Tomato___Tomato_mosaic_virus": "Wash hands/tools. Remove infected plants. Avoid tobacco use near plants.",
            "Tomato___healthy": "Your plant looks healthy! Keep up the good work!"
        }
        return treatments.get(disease_name, "Consult a local agricultural expert for specific treatment advice.")

disease_service = DiseaseService()
