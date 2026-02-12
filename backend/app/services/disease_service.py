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

# Comprehensive disease information dictionary
DISEASE_INFO = {
    "Apple___Apple_scab": {
        "name": "Apple Scab",
        "symptoms": "Dark, olive-green to brown spots on leaves and fruit. Leaves may become distorted and fall prematurely.",
        "treatment": "Use fungicides specifically for apple scab. Remove infected leaves and fallen debris. Prune trees to improve air circulation."
    },
    "Apple___Black_rot": {
        "name": "Apple Black Rot",
        "symptoms": "Purple spots on leaves that turn brown. Fruit develops brown, rotted areas with concentric rings.",
        "treatment": "Remove infected fruit, mummified fruit, and dead wood. Prune out cankers. Apply fungicides during the growing season."
    },
    "Apple___Cedar_apple_rust": {
        "name": "Cedar Apple Rust",
        "symptoms": "Yellow-orange spots on upper leaf surfaces. Orange, tube-like structures on leaf undersides.",
        "treatment": "Remove galls from nearby juniper trees. Use resistant apple varieties. Apply fungicides in early spring."
    },
    "Apple___healthy": {
        "name": "Healthy Apple",
        "symptoms": "No visible disease symptoms. Leaves are green and vibrant.",
        "treatment": "Your plant looks healthy! Continue regular watering, proper fertilization, and monitor for pests."
    },
    "Blueberry___healthy": {
        "name": "Healthy Blueberry",
        "symptoms": "No visible disease symptoms. Leaves are green and healthy.",
        "treatment": "Your plant looks healthy! Maintain acidic soil pH, proper watering, and regular monitoring."
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "name": "Cherry Powdery Mildew",
        "symptoms": "White, powdery fungal growth on leaves, shoots, and fruit. Leaves may curl and become distorted.",
        "treatment": "Prune to improve air circulation. Use sulfur-based fungicides. Remove infected plant parts."
    },
    "Cherry_(including_sour)___healthy": {
        "name": "Healthy Cherry",
        "symptoms": "No visible disease symptoms. Foliage is lush and green.",
        "treatment": "Your plant looks healthy! Continue proper care including pruning and pest management."
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "name": "Corn Gray Leaf Spot",
        "symptoms": "Rectangular, gray-brown lesions on leaves parallel to leaf veins. Lesions may merge causing leaf blight.",
        "treatment": "Use resistant corn hybrids. Practice crop rotation. Apply fungicides if necessary. Bury crop residue through tillage."
    },
    "Corn_(maize)___Common_rust_": {
        "name": "Corn Common Rust",
        "symptoms": "Small, circular to elongate, reddish-brown pustules on both leaf surfaces. Pustules rupture releasing spores.",
        "treatment": "Use resistant corn hybrids. Fungicides may be needed in severe cases. Good field drainage."
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "name": "Northern Leaf Blight",
        "symptoms": "Long, elliptical, gray-green lesions on leaves. Lesions may grow together causing large blighted areas.",
        "treatment": "Use resistant corn hybrids. Practice crop rotation. Tillage to bury crop residue. Apply fungicides if severe."
    },
    "Corn_(maize)___healthy": {
        "name": "Healthy Corn",
        "symptoms": "No visible disease symptoms. Plants are vigorous with green leaves.",
        "treatment": "Your plant looks healthy! Maintain proper nutrients, water, and weed control."
    },
    "Grape___Black_rot": {
        "name": "Grape Black Rot",
        "symptoms": "Brown circular leaf spots with dark borders. Fruit develops light brown spots that enlarge and become sunken.",
        "treatment": "Remove mummified berries and infected leaves. Apply fungicides early in the season. Improve air circulation through pruning."
    },
    "Grape___Esca_(Black_Measles)": {
        "name": "Grape Esca (Black Measles)",
        "symptoms": "Tiger-stripe pattern on leaves, yellowing between veins. Dark streaks in wood. Fruit may show black spots.",
        "treatment": "Remove infected vines. Protect pruning wounds with sealants. No effective chemical control available."
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "name": "Grape Leaf Blight",
        "symptoms": "Angular brown spots on leaves, often bordered by veins. Severe infections cause leaf drop.",
        "treatment": "Apply fungicides during the growing season. Improve air circulation through canopy management."
    },
    "Grape___healthy": {
        "name": "Healthy Grape",
        "symptoms": "No visible disease symptoms. Vines are vigorous with healthy foliage.",
        "treatment": "Your plant looks healthy! Continue proper pruning, training, and vineyard management."
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "name": "Citrus Greening (Huanglongbing)",
        "symptoms": "Yellow shoots, blotchy mottled leaves, lopsided fruit with green ends. Fruit is bitter and misshapen.",
        "treatment": "Remove infected trees immediately. Control Asian citrus psyllid vectors. Plant only certified disease-free nursery stock."
    },
    "Peach___Bacterial_spot": {
        "name": "Peach Bacterial Spot",
        "symptoms": "Small purple spots on leaves that fall out creating shot-hole appearance. Fruit has dark, sunken lesions.",
        "treatment": "Use resistant peach varieties. Apply copper sprays during dormancy. Avoid overhead irrigation."
    },
    "Peach___healthy": {
        "name": "Healthy Peach",
        "symptoms": "No visible disease symptoms. Tree shows healthy growth.",
        "treatment": "Your plant looks healthy! Continue proper fertilization, watering, and annual pruning."
    },
    "Pepper,_bell___Bacterial_spot": {
        "name": "Pepper Bacterial Spot",
        "symptoms": "Small, dark brown spots on leaves with yellow halos. Fruit has raised, scab-like spots.",
        "treatment": "Use resistant pepper varieties. Apply copper-based sprays. Avoid overhead irrigation. Use disease-free seeds."
    },
    "Pepper,_bell___healthy": {
        "name": "Healthy Bell Pepper",
        "symptoms": "No visible disease symptoms. Plants are robust with green foliage.",
        "treatment": "Your plant looks healthy! Maintain consistent watering and proper nutrition."
    },
    "Potato___Early_blight": {
        "name": "Potato Early Blight",
        "symptoms": "Dark brown spots with concentric rings (target pattern) on older leaves. Lesions may have yellow halos.",
        "treatment": "Practice crop rotation. Maximize air flow. Apply fungicides like chlorothalonil. Remove infected foliage."
    },
    "Potato___Late_blight": {
        "name": "Potato Late Blight",
        "symptoms": "Water-soaked spots on leaves that turn brown. White fuzzy growth on leaf undersides. Tubers have brown rot.",
        "treatment": "Destroy infected tubers and plants. Apply fungicides preventively. Use resistant varieties. Ensure good drainage."
    },
    "Potato___healthy": {
        "name": "Healthy Potato",
        "symptoms": "No visible disease symptoms. Plants are vigorous and green.",
        "treatment": "Your plant looks healthy! Continue proper hilling, watering, and pest management."
    },
    "Raspberry___healthy": {
        "name": "Healthy Raspberry",
        "symptoms": "No visible disease symptoms. Canes are healthy and productive.",
        "treatment": "Your plant looks healthy! Maintain proper pruning and remove old canes after fruiting."
    },
    "Soybean___healthy": {
        "name": "Healthy Soybean",
        "symptoms": "No visible disease symptoms. Plants show healthy green growth.",
        "treatment": "Your plant looks healthy! Continue monitoring and maintain good field practices."
    },
    "Squash___Powdery_mildew": {
        "name": "Squash Powdery Mildew",
        "symptoms": "White, powdery fungal spots on leaves and stems. Leaves may yellow and die prematurely.",
        "treatment": "Use resistant squash varieties. Apply fungicides preventively. Remove and destroy infected debris."
    },
    "Strawberry___Leaf_scorch": {
        "name": "Strawberry Leaf Scorch",
        "symptoms": "Purple spots on leaves that enlarge and turn brown. Leaves appear scorched at margins.",
        "treatment": "Remove infected leaves. Apply fungicides during wet periods. Plant resistant varieties."
    },
    "Strawberry___healthy": {
        "name": "Healthy Strawberry",
        "symptoms": "No visible disease symptoms. Plants are productive with green leaves.",
        "treatment": "Your plant looks healthy! Continue mulching and remove old leaves after harvest."
    },
    "Tomato___Bacterial_spot": {
        "name": "Tomato Bacterial Spot",
        "symptoms": "Small, dark brown spots on leaves with yellow halos. Fruit has raised, rough spots.",
        "treatment": "Apply copper-based sprays. Use disease-free seeds and transplants. Avoid overhead watering."
    },
    "Tomato___Early_blight": {
        "name": "Tomato Early Blight",
        "symptoms": "Dark brown spots with concentric rings on lower, older leaves. Stem lesions may girdle plants.",
        "treatment": "Apply mulch to prevent soil splash. Use fungicides. Remove lower infected leaves. Practice crop rotation."
    },
    "Tomato___Late_blight": {
        "name": "Tomato Late Blight",
        "symptoms": "Large, water-soaked spots on leaves. White fuzzy growth in humid conditions. Fruit has greasy-looking brown areas.",
        "treatment": "Apply fungicides preventively. Destroy infected plants immediately. Use resistant varieties."
    },
    "Tomato___Leaf_Mold": {
        "name": "Tomato Leaf Mold",
        "symptoms": "Pale green to yellow spots on upper leaf surfaces. Olive-green to gray fuzzy growth on undersides.",
        "treatment": "Improve air circulation through spacing and pruning. Apply fungicides. Reduce humidity in greenhouses."
    },
    "Tomato___Septoria_leaf_spot": {
        "name": "Tomato Septoria Leaf Spot",
        "symptoms": "Small, circular spots with gray centers and dark borders. Numerous tiny black fruiting bodies in spot centers.",
        "treatment": "Remove infected lower leaves. Apply mulch to prevent soil splash. Use fungicides. Practice crop rotation."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "name": "Two-Spotted Spider Mite",
        "symptoms": "Fine stippling on leaves. Webbing on undersides. Leaves may bronze and drop in severe cases.",
        "treatment": "Use miticides or insecticidal soap. Introduce predatory mites. Spray plants with water to reduce populations."
    },
    "Tomato___Target_Spot": {
        "name": "Tomato Target Spot",
        "symptoms": "Brown spots with concentric rings on leaves, stems, and fruit. Severe infections cause defoliation.",
        "treatment": "Apply fungicides preventively. Remove infected plant debris. Improve air circulation."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "name": "Tomato Yellow Leaf Curl Virus",
        "symptoms": "Upward curling leaves, yellowing, stunted growth. Flowers drop, little to no fruit production.",
        "treatment": "Control whitefly vectors with insecticides. Use resistant tomato varieties. Remove and destroy infected plants."
    },
    "Tomato___Tomato_mosaic_virus": {
        "name": "Tomato Mosaic Virus",
        "symptoms": "Mottled light and dark green on leaves. Leaves may be distorted or fern-like. Stunted growth.",
        "treatment": "Wash hands and tools regularly. Remove infected plants immediately. Avoid tobacco products near plants. Use resistant varieties."
    },
    "Tomato___healthy": {
        "name": "Healthy Tomato",
        "symptoms": "No visible disease symptoms. Plants are vigorous with healthy dark green foliage.",
        "treatment": "Your plant looks healthy! Continue proper watering, staking, and monitoring for pests."
    }
}

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

            # Get disease info
            disease_info = DISEASE_INFO.get(class_name, {
                "name": class_name.replace("_", " "),
                "symptoms": "Symptoms information not available.",
                "treatment": "Consult a local agricultural expert for specific treatment advice."
            })

            return {
                "disease_name": disease_info["name"],
                "raw_class_name": class_name,
                "confidence": confidence,
                "symptoms": disease_info["symptoms"],
                "treatment": disease_info["treatment"],
                "description": f"Detected {disease_info['name']} with {confidence*100:.1f}% confidence."
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            raise e

disease_service = DiseaseService()
