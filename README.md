# Smart Agriculture System

A production-ready mobile application for farmers, featuring AI-based disease detection, crop recommendation, and weather intelligence.

## Architecture
- **Mobile**: React Native (Expo) + TypeScript
- **Backend**: FastAPI (Python) + PostgreSQL
- **ML**: TensorFlow Lite / Scikit-Learn (Placeholders included)

## Prerequisites
- Node.js & npm
- Python 3.9+
- Docker Desktop (for Database)

## Setup & Run

### 1. Database
Start the PostgreSQL database using Docker:
```bash
docker-compose up -d
```

### 2. Backend
Navigate to the backend folder and start the API:
```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. Documentation at `/docs`.

### 3. Mobile App
Navigate to the mobile folder and start the Expo app:
```bash
cd mobile
npm install
npx expo start
```
- Scan the QR code with **Expo Go** on your phone (Android/iOS).
- Or press `a` for Android Emulator / `i` for iOS Simulator.

## Features implemented
1. **Disease Detection**: Upload photo -> Get diagnosis & treatment (Mock).
2. **Crop Recommendation**: Enter soil/weather parameters -> Get list of suitable crops (Mock).
3. **Weather**: View current weather and forecast (Mock).
4. **Authentication**: Login/Signup flows.

## Notes
- The "Mock" ML services effectively simulate the API contract. To make them real, replace the random logic in `backend/app/api/api_v1/endpoints/` with actual model inference calls.
- Update `mobile/src/services/api.ts` if running on a physical device to point to your computer's IP instead of `localhost`.
