# Backend Deployment Action Plan

## Problem Diagnosis
**Current Issue**: Backend API calls return HTML 404 pages instead of JSON responses.

**Root Cause**: The Render service at `https://moderator-1-zi2v.onrender.com` is serving the **frontend application** (Next.js), not the FastAPI backend. The frontend is configured to call this same URL for API requests, causing routing failures.

**Evidence**: 
- Curl request to backend returns HTML with `<html>`, `<head>`, `<title>` tags
- Response contains frontend markup instead of JSON API responses
- The deployment has both frontend and backend running on the same service

---

## Solution Overview
**Separate the deployments** into:
1. **Frontend**: Vercel (already working)
2. **Backend**: New separate Render service for FastAPI

---

## Action Plan

### Phase 1: Prepare Backend for Deployment (Local Setup)
**Status**: ✅ COMPLETED

- [x] Added `/api/v1/health` endpoint in `backend/app/routers/users.py`
- [x] Endpoint returns `{"status": "ok"}` for connectivity verification
- [x] Backend application properly configured with FastAPI, SQLAlchemy, JWT auth
- [x] CORS middleware enabled for cross-origin requests

**Files verified**:
- `backend/app/main.py` - FastAPI app initialization
- `backend/app/routers/users.py` - Authentication endpoints + health check
- `backend/requirements.txt` - Python dependencies
- `backend/app/models.py` - Database models
- `backend/app/schemas.py` - Pydantic schemas

---

### Phase 2: Create New Render Service for Backend
**Status**: ⏳ PENDING - Action Required

#### Step 1: Create New Render Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub repository (if using GitHub deployment) or manually configure

#### Step 2: Configure Render Service Settings

**Basic Settings**:
- **Name**: `rebuilder-backend` (or similar)
- **Environment**: `Python 3.11` (or your preferred Python version)
- **Region**: Select closest to your users (e.g., us-east-1)

**Build & Deploy**:
- **Root Directory**: `backend/`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  gunicorn -w 4 -b 0.0.0.0:8000 app.main:app --reload
  ```
  
  *Alternative (development)*:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL or SQLite connection string
  - PostgreSQL: `postgresql://user:password@host:port/dbname`
  - SQLite: `sqlite:///./database.db`
- `SECRET_KEY`: Strong random key for JWT signing
- `ENVIRONMENT`: `production`
- Any other required API keys (OpenAI API key, etc.)

#### Step 3: Deploy & Record Backend URL
After deployment succeeds, Render will provide:
- **Backend URL**: `https://<your-service-name>.onrender.com` (e.g., `https://rebuilder-backend.onrender.com`)

---

### Phase 3: Update Frontend Configuration
**Status**: ⏳ PENDING - Action Required

#### Step 1: Update Environment Variables

**File**: `.env.production` (Vercel):
```bash
NEXT_PUBLIC_API_BASE_URL=https://rebuilder-backend.onrender.com/api/v1
```

**File**: `.env.local` (local development):
```bash
NEXT_PUBLIC_API_BASE_URL=https://rebuilder-backend.onrender.com/api/v1
```

#### Step 2: Update Vercel Deployment
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Add:
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://rebuilder-backend.onrender.com/api/v1`
   - Select: Production, Preview, Development (applies to all)
5. Redeploy application

---

### Phase 4: Test Connectivity
**Status**: ⏳ PENDING - Action Required

#### Test 1: Health Check (Backend Running)
```bash
curl https://rebuilder-backend.onrender.com/api/v1/health
```

**Expected Response**:
```json
{"status": "ok"}
```

#### Test 2: Frontend API Calls
1. Open frontend application in browser
2. Open Developer Console (F12)
3. Check Network tab for API requests
4. Verify responses are JSON (not HTML)

#### Test 3: Authentication Flow
1. Register new account
2. Login with credentials
3. Verify JWT token returned
4. Check subsequent authenticated requests work

#### Test 4: Mobile & Desktop Compatibility
- Test on mobile device/browser
- Test on desktop
- Verify API connectivity on all platforms

---

### Phase 5: Update CORS Configuration
**Status**: ⏳ PENDING - Action Required

**File**: `backend/app/main.py`

Update CORS allowed origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-frontend.vercel.app",  # Production frontend
        "http://localhost:3000",  # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Phase 6: Monitor & Debug
**Status**: ⏳ PENDING - Action Required

#### Enable Logging
- Monitor Render backend logs for errors
- Check frontend browser console for API errors
- Verify database connections are working

#### Common Issues & Solutions:

| Issue | Cause | Solution |
|-------|-------|----------|
| 503 Service Unavailable | Backend starting up | Wait 30-60 seconds for cold start |
| 504 Gateway Timeout | Long-running requests | Optimize queries, increase timeout |
| CORS errors | Origin not allowed | Update CORS configuration |
| 401 Unauthorized | Invalid JWT | Check SECRET_KEY matches |
| Database connection error | Invalid DATABASE_URL | Verify database connection string |

---

## Verification Checklist

- [ ] Backend code deployed to new Render service
- [ ] Backend health endpoint returns `{"status": "ok"}`
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Vercel deployment redeployed with new env vars
- [ ] CORS origins updated to include frontend URL
- [ ] Health check test passes
- [ ] Authentication flow works (register → login → token)
- [ ] API calls return JSON (not HTML)
- [ ] Mobile and desktop connectivity verified
- [ ] Database queries working correctly
- [ ] Error handling returns proper error messages
- [ ] Logs show no critical errors

---

## Rollback Plan

If deployment fails:

1. **Frontend**: Revert Vercel deployment to previous version
2. **Backend**: Keep legacy Render service running temporarily
3. **DNS**: Update frontend again to point to legacy service if needed
4. **Debug**: Analyze error logs before reattempting

---

## Performance Checklist

After successful deployment:

- [ ] API response times < 200ms (excluding cold starts)
- [ ] Database queries optimized
- [ ] Unnecessary logs removed (production only)
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting configured (if needed)
- [ ] SSL/TLS certificates valid

---

## Security Checklist

- [ ] JWT SECRET_KEY is strong (32+ characters, random)
- [ ] Database passwords not in version control
- [ ] API keys stored in environment variables only
- [ ] CORS origins whitelisted (not `*`)
- [ ] HTTPS enforced
- [ ] Password hashing verified
- [ ] SQL injection protection verified
- [ ] Rate limiting implemented

---

## Next Steps

1. **Create new Render backend service** (Phase 2)
2. **Deploy backend code** to Render
3. **Update frontend environment variables** (Phase 3)
4. **Redeploy frontend** to Vercel
5. **Run all tests** (Phase 4)
6. **Monitor logs** for any issues

---

## Support & Troubleshooting

If issues arise:

1. Check Render backend logs: Dashboard → Select service → Logs
2. Check Vercel frontend logs: Dashboard → Select project → Deployments → Logs
3. Verify environment variables are set correctly
4. Test health endpoint: `curl https://your-backend.onrender.com/api/v1/health`
5. Check browser console for detailed error messages
6. Verify CORS configuration matches frontend URL

---

## Timeline Estimate

- **Phase 2** (Setup new service): 5-10 minutes
- **Phase 3** (Update config): 5 minutes
- **Phase 4** (Testing): 10-15 minutes
- **Phase 5** (CORS config): 5 minutes
- **Phase 6** (Monitoring): Ongoing

**Total estimated time**: 30-40 minutes
