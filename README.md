# Smart Agriculture System

A production-ready mobile application designed to empower farmers and agricultural enthusiasts. The app features AI-based disease detection, intelligent crop recommendations based on environmental factors, and reliable weather intelligence to ensure optimal yield and better crop management.

## 🚀 Key Services & Features

The project is broken down into modular services, ensuring clean abstraction between the API layer and the core processing logic:

1. **User Authentication Service** (`/auth`)
   - Manages user registrations and log in flows securely.
   - Provides JWT-based authentication to secure the inner agricultural tools.
2. **Plant Disease Detection Service** (`/disease`)
   - **How it works:** Users capture or upload an image of a plant/leaf. The app sends the image to the backend which utilizes a trained machine learning model (Accuracy: **96.67%**) to detect potential diseases.
   - **Output:** Returns the identified disease, confidence level, associated symptoms, and a comprehensive treatment or prevention plan.
3. **Crop Recommendation Service** (`/crops`)
   - **How it works:** Users input their soil nutrient values (Nitrogen, Phosphorous, Potassium), soil pH level, temperature, humidity, and rainfall. 
   - **Output:** The service utilizes a trained **Random Forest** model (Accuracy: **99.8%**) via `crop_service.py` to analyze these parameters and recommends the top suitable crops optimized for the specified environment.
4. **Weather Intelligence Service** (`/weather`)
   - Real-time weather viewing and forecasting capabilities to help farmers anticipate changing conditions.

## 🏗 System Architecture & Technology Stack

The project operates on a modern, decoupled architecture allowing separate scaling of the database, backend APIs, and the mobile GUI.

- **Mobile Application (Frontend)**
  - Built using **React Native (Expo)** and **TypeScript**.
  - Provides a cross-platform (iOS and Android) interface. Mobile components are modularized under `mobile/src/`.
- **Backend API Server**
  - Built with **FastAPI (Python)**, offering asynchronous and lightning-fast request handling.
  - Leverages **SQLAlchemy** for ORM operations and **Pydantic** for rigorous data validation.
  - Integrates highly accurate, trained machine learning models for real-time agricultural analysis.
- **Database**
  - **PostgreSQL**, effortlessly containerized using **Docker** for local development.

## 📂 Project Structure

```text
.
├── backend/                           # Fast API Python backend
│   ├── app/
│   │   ├── api/api_v1/endpoints/      # API Controllers (auth, disease, crops, weather)
│   │   ├── core/                      # Configs & security logic
│   │   ├── db/                        # PostgreSQL DB session & setup
│   │   ├── models/                    # SQLAlchemy DB Models
│   │   ├── schemas/                   # Pydantic schemas for request/response validation
│   │   └── services/                  # Core Business Logic (disease_service.py, crop_service.py)
│   ├── main.py                        # FastAPI application entry point
│   └── requirements.txt               # Python package dependencies
├── mobile/                            # React Native App
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   ├── navigation/                # React Navigation routing
│   │   ├── screens/                   # Distinct mobile app pages
│   │   ├── services/                  # Network configuration and API connectors (e.g., api.ts)
│   │   ├── theme/                     # Styling variables
│   │   └── types/                     # TypeScript shared interfaces
│   └── package.json                   # JS/TS dependencies
└── docker-compose.yml                 # Database provisioning
```

## 🛠 Local Setup & Running Instructions

Follow these steps to clone the repository and run all services locally on your machine.

### Prerequisites
- [Node.js & npm](https://nodejs.org/en/) installed.
- [Python 3.9+](https://www.python.org/) installed.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- **Expo Go** app installed on your physical smartphone (available on App Store / Play Store).

### Step 1: Start the Database Container
The application relies on PostgreSQL to store user and application data.

Open your terminal in the root directory and run:
```bash
docker-compose up -d
```
*This fetches the `postgres:15-alpine` image and starts the database instance mapping to your local port 5432.*

### Step 2: Spin Up the Backend Server
Open a new terminal session, navigate to the `backend` directory, and follow these commands:

```bash
cd backend

# Create a virtual environment (Recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install the Python dependencies
pip install -r requirements.txt

# Start the FastAPI web server
uvicorn app.main:app --reload
```
Once started, the backend API will run on `http://localhost:8000`. 
**Tip:** You can view the auto-generated Swagger documentation and test endpoints directly at `http://localhost:8000/docs`.

### Step 3: Launch the Mobile Application
Open *yet another* terminal session and configure the mobile app.

```bash
cd mobile

# Install JavaScript/TypeScript dependencies
npm install

# Start the Expo development server
npx expo start
```
After the server initializes, you will see a QR code in the terminal.
- **Testing on Physical Device**: Scan the QR code using the **Expo Go** application on your smartphone. (Ensure your phone and laptop are on the same WiFi network).
  - *Note: If running on a physical device, ensure you update `mobile/src/services/api.ts` to utilize your computer's local IPv4 address instead of `localhost`.*
- **Testing on Emulator**: Simply press `a` (for Android) or `i` (for iOS) in the terminal to launch the virtual device, provided you have Android Studio/Xcode properly configured.

## 🤝 Roadmap & Contribution
- Expand the dataset for the **Plant Disease Detection** model to support a wider array of crops and localized diseases.
- Integrate real-time edge inference directly on the mobile device utilizing **TensorFlow Lite** for offline operability.
