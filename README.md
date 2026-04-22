# Platform Regression Test Suite & Management Dashboard

## 📖 Project Overview
This project is an end-to-end automated quality assurance ecosystem designed to accelerate software testing. It provides a robust regression testing engine and a centralized management platform. 

Instead of writing custom tests for every single web application, this framework comes pre-loaded with a comprehensive suite of **Regression Test Cases** (SEO, Performance, Navigation, and Responsiveness) that can automatically test *any* website. The engine executes these scripts using Python and Selenium, and the results are monitored via a centralized Web Dashboard.

---

## 🚀 Key Features
1. **Comprehensive Test Suite:** Includes universal regression tests covering Page Fundamentals, Broken Links, Mobile/Tablet Responsiveness, SEO Tags, and Performance metrics.
2. **Dynamic URL Targeting:** Tests can be run against any web application simply by passing a target URL.
3. **Centralized Web Dashboard:** A React-based portal to view test suites, track execution history, and analyze pass/fail metrics.
4. **Automated Test Runner:** A Python testing engine utilizing Pytest to execute the regression scripts and output detailed HTML reports.

---

## 📂 System Architecture
The project is divided into three main modular components:

- **`/backend`**: A Node.js & Express REST API that handles database operations (MongoDB) and connects the dashboard to the testing engine.
- **`/dashboard`**: A React.js frontend providing the visual UI for QA leads and developers to manage regression suites and analytics.
- **`/testing-engine`**: The Python core containing `runner.py` and the `tests/` directory. It utilizes Selenium and Pytest to execute the regression automated tests.

---

## ⚙️ Setup & Installation Guide

### Prerequisites
To run this project locally, ensure you have the following installed on your system:
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (Running locally or a cloud URI)
- **Google Chrome & ChromeDriver** (For Selenium execution)

---

### Step 1: Start the Backend Server
The backend handles API requests and database management.

```bash
# Navigate to the backend directory
cd backend

# Install Node dependencies
npm install

# Start the Node.js server
node server.js
# (Alternatively, use 'npm start' or 'nodemon server.js' if configured)
```

---

### Step 2: Start the Web Dashboard
The React frontend provides the graphical interface.

```bash
# Open a new terminal and navigate to the dashboard directory
cd dashboard

# Install React dependencies
npm install

# Start the development server
npm start
# (The dashboard will typically open at http://localhost:3000)
```

---

### Step 3: Setup the Python Testing Engine
The engine executes the Selenium scripts.

```bash
# Open a new terminal and navigate to the testing engine directory
cd testing-engine

# (Optional but recommended) Create a virtual environment
python -m venv venv
# Activate it: 
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install required Python packages (Selenium, Pytest, etc.)
pip install -r requirements.txt

# Run the test execution engine
python runner.py
```

---

## 📊 Workflow Summary
1. **Target:** Provide the target URL to the testing engine.
2. **Execute:** The **Testing Engine** runs the Python regression scripts.
3. **Sync:** The system syncs the execution data to the MongoDB backend.
4. **Review:** Users log into the React **Dashboard** to view the exact HTML error logs and overall Pass/Fail velocity of the target website.
