# Seconds to Survive (EPC6) 🏴‍☠️

A cyberpunk-themed multiplayer quiz game built with React + Django.

---

## 🐳 Production Deployment (Docker)

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

---

## 🛠 Local Development

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8005
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> **Note:** For local dev, update `frontend/vite.config.js` proxy targets to `http://localhost:8005`.

Access at `http://localhost:5173`
