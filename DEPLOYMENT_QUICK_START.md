# Backend Deployment - Quick Reference

## The Problem
❌ Rendering to Render service returns **HTML 404** instead of JSON API responses
- Frontend and backend are on **same** Render service
- Frontend is running, but backend API calls fail

## The Solution
✅ Separate deployments: Frontend on Vercel, Backend on new Render service

---

## Quick Setup (30-40 minutes)

### 1. Create Backend Service on Render (10 min)
```
Render Dashboard → New Web Service → Select Repository
├─ Name: rebuilder-backend
├─ Root Directory: backend/
├─ Build: pip install -r requirements.txt
└─ Start: gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

**Add Environment Variables** in Render:
- `DATABASE_URL`: Your database connection string
- `SECRET_KEY`: Strong random string (32+ chars)
- `ENVIRONMENT`: production

**Save the URL**: `https://rebuilder-backend.onrender.com`

---

### 2. Update Frontend Config (5 min)

**Local Development** - `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://rebuilder-backend.onrender.com/api/v1
```

**Production** - Vercel Settings:
1. Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_BASE_URL`
3. Value: `https://rebuilder-backend.onrender.com/api/v1`
4. Redeploy

---

### 3. Verify Backend is Working (5 min)

**Test Health Check**:
```bash
curl https://rebuilder-backend.onrender.com/api/v1/health
```

Expected: `{"status":"ok"}`

If failed: Check Render logs for errors

---

### 4. Test in Frontend Browser (10 min)

1. Open frontend app in browser
2. Open Developer Console (F12)
3. Go to Network tab
4. Try login → Watch API requests
5. Verify responses are **JSON not HTML**

---

### 5. Update CORS (if needed)

**File**: `backend/app/main.py`

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| 503 Bad Gateway | Backend still starting (wait 1-2 min) |
| 504 Timeout | Backend hung/crashed (check logs) |
| HTML 404 response | CORS issue or wrong backend URL |
| API returns 401 | AUTH config or JWT SECRET_KEY wrong |
| Database error | DATABASE_URL env var not set |

---

## Files to Review

```
backend/
├── app/
│   ├── main.py          ← CORS config here
│   └── routers/
│       └── users.py     ← /health endpoint
├── requirements.txt     ← Dependencies for deployment
└── .env.example         ← Environment variables needed
```

---

## After Deployment - Final Checks

- [ ] Health check returns JSON
- [ ] Login works (get JWT token)
- [ ] Other API endpoints work
- [ ] Mobile device can access API
- [ ] No HTML responses (all JSON)
- [ ] Logs show no errors

---

## Render Service Cost Check

Render has a free tier:
- 750 hours/month free runtime
- Shared CPU
- Great for testing

After free hours expire, standard charges apply.

---

## Emergency Rollback

If something breaks:

1. Revert Vercel to previous deployment
2. Update `.env.local` back to old backend URL
3. Keep legacy service running temporarily
4. Debug and retry

---

**Status**: Ready for Phase 2 implementation
**Time to implement**: 30-40 minutes
**Expected result**: ✅ Working API connection, JSON responses
