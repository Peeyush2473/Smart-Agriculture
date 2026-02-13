# 🌾 Smart Agriculture Contribution Guide

Welcome to the team! To maintain code quality and ensure the project remains stable, we follow a strict **Feature Branch Workflow**. Please follow these steps for all contributions.

---

## 1. Initial Setup
If you haven't already, clone the repository and set up your environment:

```bash
# Clone the repo
git clone https://github.com/Peeyush2473/Smart-Agriculture.git

# Enter the directory
cd Smart-Agriculture

# Setup virtual environment (Recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

cd mobile
npm install
```
## 2. The Daily Workflow (Every time you work)
Before starting any work, ensure you pull the latest changes.

```bash
git checkout main
git pull origin main
```

## 3. Create a Feature Branch
Never code directly on `main`. Create a new branch for every task.

```bash
# Syntax: git checkout -b feature/short-description
git checkout -b feature/soil-sensor-integration
```

## 4. Write Code & Commit
Make small, frequent commits with clear messages.

```bash
git add .
git commit -m "feat: added calibration logic for soil moisture sensor"
```

## 5. Push and Open a Pull Request
When the work is ready (or even if it's a work-in-progress), push it to GitHub.

```bash
git push origin feature/soil-sensor-integration
```
## 6. After Push
Once you push, they must follow these steps on the website:

Go to the Smart-Agriculture Repo.

Click the "Compare & pull request" button that appears.

Fill out the Template: Use the PR template we set up to explain what changed.

Request Review: On the right sidebar, they should select you or another teammate as a "Reviewer."

Merge Queue: Once you (the admin) approve it, they click "Add to merge queue."
## 6. After Push
Once you push, you must follow these steps on the website:
- Go to the Smart-Agriculture Repo.
- Click the "Compare & pull request" button that appears.
- Fill out the Template: Use the PR template we set up to explain what changed.
