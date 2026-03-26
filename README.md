# Seconds to Survive (EPC6) 🏴‍☠️

**Seconds to Survive** is a high-octane, cyberpunk-themed 2-player alternate competitive quiz game. Built with React and Django, it features a highly dynamic, tactical UI designed to be projected onto a large screen by a host. 

Players compete to identify images under a strict time limit while building combo streaks, earning speed bonuses, and purchasing powerful tactical abilities (like Time Warps, Shields, and Sabotage) using their accumulated score. The host controls the flow of the game via local keyboard bindings while the players verbally call out the answers.

---

## 🛠 Local Development Setup

To run the project on your local machine for development or testing, you'll need two separate terminal windows—one for the backend and one for the frontend.

### 1. Backend Setup (Django)

The backend provides the API, serves the images/media, and manages the database.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8005
```

*Your backend is now running at `http://localhost:8005`.*

### 2. Required Configuration Changes for Dev
Before starting the frontend, you **must update the proxy configuration**. 
By default, the codebase is configured to route API requests to the production remote server (`http://13.60.94.157:8005`). 

To run the app locally against your own local backend:
1. Open `frontend/vite.config.js`.
2. Locate the `server.proxy` object.
3. Change the `target` URL from `http://13.60.94.157:8005` to `http://localhost:8005` for all three routes (`/api`, `/images`, and `/media`).

It should look like this:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8005', // <-- CHANGE THIS
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:8005', // <-- CHANGE THIS
        changeOrigin: true,
        rewrite: (path) => `/static${path}`,
      },
      '/media': {
        target: 'http://localhost:8005', // <-- CHANGE THIS
        changeOrigin: true,
      },
    },
  },
})
```

### 3. Frontend Setup (React/Vite)

In a new terminal, run the following commands to start the frontend interface:

```bash
cd frontend
npm install
npm run dev
```

*Your frontend is now accessible at `http://localhost:5173`.*

---

## 🐳 Production Deployment (Docker)

If you are deploying to a live server, follow these steps.

### Prerequisites on Server
- Docker & Docker Compose installed
- Git installed
- Port 80 open in firewall/security group

### First-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/Aditya-021005/EPC6.git
cd EPC6

# 2. Build and start all containers
docker compose up --build -d

# 3. Create a Django superuser for the admin portal
docker exec -it epc6-backend python manage.py createsuperuser

# 4. (Optional) Create the restricted 'creator' user
docker exec -it epc6-backend python setup_roles.py
```

Your app is now live at `http://<your-server-ip>/`!

### Deploying Updates

After pushing changes to GitHub, SSH into your server and run:

```bash
cd /path/to/EPC6
./deploy.sh
```

This pulls the latest code, rebuilds containers, and restarts everything.

### Useful Commands

```bash
# View logs
docker compose logs -f

# View only backend logs
docker compose logs -f backend

# Restart just the backend
docker compose restart backend

# Stop everything
docker compose down

# Full rebuild (clears frontend cache)
docker compose down && docker compose up --build -d

# Run Django management commands
docker exec -it epc6-backend python manage.py <command>
```

### Data Persistence

| Data | Storage | Survives Rebuilds? |
|------|---------|-------------------|
| Database (SQLite) | `db_data` volume | ✅ Yes |
| Uploaded images | `media_data` volume | ✅ Yes |
| Frontend build | `frontend_dist` volume | Rebuilt each deploy |
| Django static files | `static_files` volume | Rebuilt each deploy |
