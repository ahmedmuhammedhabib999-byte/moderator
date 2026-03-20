# ModForge AI Studio - Manual Deployment Guide (Non-Blueprint)

## Deploy Backend on Render (Manual)

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set these values:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: `3.11`

4. Add **Environment Variables** (Settings > Environment):
   ```
   DATABASE_URL=sqlite:///./modforge.db
   OPENAI_API_KEY=<your-key>
   SECRET_KEY=<random-secret>
   CORS_ALLOWED_ORIGINS=*
   ```

## Deploy Frontend on Vercel (Manual)

1. Go to Vercel and import your GitHub repo
2. Set **Root Directory**: `.` (or leave empty)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. Add **Environment Variable**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend>.onrender.com/api/v1
   ```

## Alternative: Deploy Both as Simple Docker (Local Testing)

```bash
# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
npm run build
npm run start
```

Then open `http://localhost:3000`
