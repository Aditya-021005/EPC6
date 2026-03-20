# Seconds to Survive (EPC6) 🏴‍☠️

This project consists of a React (Vite) frontend and a Django backend. Follow these instructions to set up the complete environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended for Vite/React)
- [Python 3](https://www.python.org/) 
- [Git](https://git-scm.com/)

---

## 🛠 Backend Setup (Django)

The backend provides the APIs for the game, including questions, leaderboards, and the admin interface.

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   Using a virtual environment keeps your project dependencies isolated.
   ```bash
   # On macOS and Linux:
   python3 -m venv venv
   source venv/bin/activate
   
   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply Database Migrations:**
   Ensure your local SQLite database is up-to-date with all tables (Categories, Subcategories, Questions, Users).
   ```bash
   python manage.py migrate
   ```

5. **(Optional) Create a Superuser:**
   If you want full administrative access to manage all aspects of the database and users:
   ```bash
   python manage.py createsuperuser
   ```
   > **Note:** A limited content creator account has already been set up in the database. If you wish to use it, the credentials are Username: `creator` | Password: `creatorpassword123`.

6. **Start the Django Development Server:**
   We recommend running the backend on port 8005 so it matches the proxy configurations.
   ```bash
   python manage.py runserver 8005
   ```
   The backend API and Admin portal are now accessible at `http://localhost:8005/`.

---

## 🌐 Frontend Setup (React / Vite)

The frontend contains the interactive UI, the game logic, and animations.

1. **Navigate to the Frontend Directory:**
   *(Ensure you are back at the project root before running this)*
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Proxy for Local Development (Important!):**
   By default, the Vite configuration might be pointing to your production server IP (`13.60.94.157`). 
   If you want to test against your **local backend**, open `frontend/vite.config.js` and update the proxy target:
   
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:8005', // Change this to localhost
       changeOrigin: true,
     },
     '/images': {
       target: 'http://localhost:8005', // Change this to localhost
       changeOrigin: true,
       rewrite: (path) => `/static${path}`,
     },
   }
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application:**
   Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

---

## 🚀 Running Both Simultaneously

To test the application locally in its entirety, you will need **two separate terminal windows/tabs**:
1. **Terminal 1:** Running the Django backend (`source venv/bin/activate` -> `python manage.py runserver 8005`)
2. **Terminal 2:** Running the React frontend (`npm run dev`)
