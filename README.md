# Offline Geo-Tracking & Prediction System (OGTPS)

OGTPS is a production-ready, offline-first geo-tracking platform with:

- **Mobile app**: React Native (Expo) for live map tracking, dashboards, offline queueing, and sync.
- **Backend API**: Node.js + Express + MongoDB for routes, tracking, sync, and ML proxy.
- **ML service**: FastAPI + scikit-learn for ETA and delay prediction.
- **CI/CD**: GitHub Actions pipelines for frontend, backend, and ML deployments.

## Monorepo Structure

```text
ogtps/
  frontend/
  backend/
  ml/
  .github/workflows/
```

## 1) Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas URI (or local MongoDB)
- Expo CLI (`npx expo`)

### Clone and Enter

```bash
git clone <your-repo-url>
cd ogtps
```

## 2) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### Backend Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ogtps
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=*
```

## 3) ML Service Setup

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

ML service runs on `http://localhost:8000`.

### ML Environment Variables

```env
MODEL_DIR=./model
SEED=42
```

## 4) Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

Set backend URL in `frontend/src/services/api.js` or with Expo `extra.apiBaseUrl`.

## 5) API Highlights

- `GET /api/routes`
- `GET /api/routes/:id`
- `POST /api/routes`
- `GET /api/routes/:id/waypoints`
- `POST /api/track`
- `GET /api/track/:deviceId/history`
- `GET /api/track/:deviceId/status`
- `POST /api/sync`
- `GET /api/sync/status/:deviceId`
- `POST /api/predict`
- `GET /api/health`

## 6) Deploy

### Backend (Render)

- Use `backend/render.yaml` or connect repo directly.
- Add env vars from `.env.example`.
- Set `RENDER_DEPLOY_HOOK` in GitHub Secrets for CI deploy hook.

### ML (Railway)

- Use `ml/railway.toml`.
- Add required vars.
- Set `RAILWAY_TOKEN` in GitHub Secrets.

## 7) CI/CD Pipelines

- `.github/workflows/backend-ci.yml`: test + build + Render deploy hook
- `.github/workflows/ml-ci.yml`: pytest + Railway deploy
- `.github/workflows/frontend-ci.yml`: install + Expo export validation

## 8) Production Notes

- Offline queue sync is automatic when network comes back.
- Backend includes map-matching and ETA fallback logic.
- ML service supports cold start by auto-training synthetic models if none exist.
