"""
Crop Yield Prediction ML Model
Uses a Random Forest Regressor trained on synthetic agricultural data.
Replace with real dataset (e.g., from Kaggle Crop Yield dataset) for production.
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ─── Constants ───────────────────────────────────────────────────────────────

SOIL_TYPES = ["clay", "sandy", "loamy", "silty", "peaty", "chalky"]
SEASONS = ["kharif", "rabi", "zaid"]
CROPS = [
    "wheat", "rice", "maize", "sugarcane", "cotton",
    "soybean", "groundnut", "mustard", "potato", "onion"
]

# Base yield (quintals/acre) per crop
BASE_YIELDS = {
    "wheat": 16, "rice": 20, "maize": 18, "sugarcane": 280, "cotton": 8,
    "soybean": 10, "groundnut": 12, "mustard": 9, "potato": 80, "onion": 60,
}

# Market price (INR per quintal, approximate)
MARKET_PRICES = {
    "wheat": 2200, "rice": 2100, "maize": 1900, "sugarcane": 350, "cotton": 6500,
    "soybean": 4500, "groundnut": 5800, "mustard": 5200, "potato": 1200, "onion": 1500,
}

# ─── Synthetic Dataset Generator ─────────────────────────────────────────────

def _generate_training_data(n_samples: int = 5000):
    """Generate synthetic training data for the yield model."""
    np.random.seed(42)

    crop_enc = LabelEncoder().fit(CROPS)
    soil_enc = LabelEncoder().fit(SOIL_TYPES)
    season_enc = LabelEncoder().fit(SEASONS)

    crops_raw = np.random.choice(CROPS, n_samples)
    soils_raw = np.random.choice(SOIL_TYPES, n_samples)
    seasons_raw = np.random.choice(SEASONS, n_samples)
    land_area = np.random.uniform(0.5, 20.0, n_samples)          # acres
    rainfall = np.random.uniform(200, 1500, n_samples)            # mm
    temperature = np.random.uniform(15, 42, n_samples)            # °C
    fertilizer_use = np.random.uniform(0, 200, n_samples)         # kg/acre

    crops_enc = crop_enc.transform(crops_raw)
    soils_enc = soil_enc.transform(soils_raw)
    seasons_enc = season_enc.transform(seasons_raw)

    # Yield formula with noise
    base = np.array([BASE_YIELDS[c] for c in crops_raw])
    soil_factor = np.where(soils_raw == "loamy", 1.15,
                  np.where(soils_raw == "silty", 1.08,
                  np.where(soils_raw == "clay", 0.92, 1.0)))
    season_factor = np.where(seasons_raw == "rabi", 1.10,
                    np.where(seasons_raw == "kharif", 1.05, 0.95))
    rain_factor = np.clip(rainfall / 800, 0.7, 1.3)
    temp_factor = np.where((temperature >= 20) & (temperature <= 30), 1.1, 0.9)
    fert_factor = 1 + 0.003 * fertilizer_use
    noise = np.random.normal(1, 0.08, n_samples)

    yield_per_acre = base * soil_factor * season_factor * rain_factor * temp_factor * fert_factor * noise

    X = np.column_stack([crops_enc, soils_enc, seasons_enc,
                         rainfall, temperature, fertilizer_use])
    y = yield_per_acre

    return X, y, crop_enc, soil_enc, season_enc


def train_and_save_model(model_path: str = "yield_model.pkl"):
    """Train the Random Forest model and save it."""
    X, y, crop_enc, soil_enc, season_enc = _generate_training_data()

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X, y)

    joblib.dump({
        "model": model,
        "crop_enc": crop_enc,
        "soil_enc": soil_enc,
        "season_enc": season_enc,
    }, model_path)
    print(f"Model saved to {model_path}")
    return model_path


# ─── Prediction Function ──────────────────────────────────────────────────────

def predict_yield(
    crop: str,
    soil_type: str,
    season: str,
    land_area_acres: float,
    rainfall_mm: float = 700,
    temperature_c: float = 25,
    fertilizer_kg_per_acre: float = 80,
    model_path: str = "yield_model.pkl"
) -> dict:
    """
    Predict crop yield and estimated profit.

    Returns:
        dict with yield_per_acre, total_yield, estimated_revenue,
              estimated_cost, estimated_profit, confidence_band
    """
    if not os.path.exists(model_path):
        train_and_save_model(model_path)

    bundle = joblib.load(model_path)
    model: RandomForestRegressor = bundle["model"]
    crop_enc: LabelEncoder = bundle["crop_enc"]
    soil_enc: LabelEncoder = bundle["soil_enc"]
    season_enc: LabelEncoder = bundle["season_enc"]

    # Validate inputs
    crop = crop.lower()
    soil_type = soil_type.lower()
    season = season.lower()

    if crop not in CROPS:
        raise ValueError(f"Unsupported crop: {crop}. Choose from {CROPS}")
    if soil_type not in SOIL_TYPES:
        raise ValueError(f"Unsupported soil: {soil_type}. Choose from {SOIL_TYPES}")
    if season not in SEASONS:
        raise ValueError(f"Unsupported season: {season}. Choose from {SEASONS}")

    crop_idx = crop_enc.transform([crop])[0]
    soil_idx = soil_enc.transform([soil_type])[0]
    season_idx = season_enc.transform([season])[0]

    X_input = np.array([[crop_idx, soil_idx, season_idx,
                          rainfall_mm, temperature_c, fertilizer_kg_per_acre]])

    # Predict using all trees for confidence interval
    tree_preds = np.array([tree.predict(X_input)[0] for tree in model.estimators_])
    yield_per_acre = float(np.mean(tree_preds))
    std_dev = float(np.std(tree_preds))

    total_yield = yield_per_acre * land_area_acres
    price_per_quintal = MARKET_PRICES[crop]
    revenue = total_yield * price_per_quintal

    # Estimated cost (seed + fertilizer + labor + irrigation ~ INR)
    cost_per_acre = 8000 + fertilizer_kg_per_acre * 25
    total_cost = cost_per_acre * land_area_acres
    profit = revenue - total_cost

    return {
        "crop": crop,
        "soil_type": soil_type,
        "season": season,
        "land_area_acres": land_area_acres,
        "yield_per_acre_quintals": round(yield_per_acre, 2),
        "total_yield_quintals": round(total_yield, 2),
        "confidence_band": {
            "low": round((yield_per_acre - std_dev) * land_area_acres, 2),
            "high": round((yield_per_acre + std_dev) * land_area_acres, 2),
        },
        "market_price_per_quintal_inr": price_per_quintal,
        "estimated_revenue_inr": round(revenue),
        "estimated_cost_inr": round(total_cost),
        "estimated_profit_inr": round(profit),
    }


if __name__ == "__main__":
    # Quick test
    result = predict_yield(
        crop="wheat",
        soil_type="loamy",
        season="rabi",
        land_area_acres=5.0,
        rainfall_mm=650,
        temperature_c=22,
        fertilizer_kg_per_acre=90
    )
    for k, v in result.items():
        print(f"  {k}: {v}")
