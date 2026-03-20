# API Connection Fixes - Root Cause Analysis

## 🚨 CRITICAL ISSUE: Backend returning HTML instead of JSON

### Root Cause
When testing `https://moderator-1-zi2v.onrender.com/`, the server returns **HTML (Next.js frontend page)** instead of **JSON (FastAPI backend response)**.

This means one of:
1. **Frontend deployed to backend URL** - Next.js app deployed on the backend Render service instead of FastAPI
2. **Backend service not running** - Render backend service is sleeping or failed
3. **Wrong credentials/access** - Backend service misconfigured

### Current State
- **`.env.local`**: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` ❌ (localhost won't work in production)
- **Expected for production**: `NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1`
- **Actual backend response**: HTML page (Next.js frontend)

---

## ✅ Fix Steps (IN ORDER)

### Step 1: Update Environment Variable
**File**: `.env.local`

**CHANGE FROM:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**CHANGE TO:**
```
NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1
```

**Why**: In production (Vercel/deployed app), `localhost:8000` is:
- `localhost` = the frontend server (Vercel), not your backend
- Port `8000` doesn't exist on Vercel
- Results in frontend trying to call itself → 404 error

### Step 2: Verify Backend is Properly Deployed on Render

1. Go to https://dashboard.render.com/services
2. Find your **backend** service (should be named something like `moderator-backend`)
3. Check **Status**: Should be `Live` or `Available`
4. If status is `Failed` or `Building`:
   - Click on it
   - Check logs for error messages
   - Fix and redeploy

5. Verify it's **FastAPI** not **Next.js**:
   - Click service name
   - Click "Logs" tab
   - Look for: `Uvicorn running on` or `Application startup complete`
   - NOT: `> next dev` or `> next build`

### Step 3: Test Backend Directly

```bash
# Test 1: Check if backend root endpoint works
curl https://moderator-1-zi2v.onrender.com/

# Expected response (JSON):
# {"message":"ModForge AI Studio Backend"}

# Test 2: Try login endpoint
curl -X POST https://moderator-1-zi2v.onrender.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Expected response: JSON with error or success

# WRONG response (HTML):
# <!DOCTYPE html><html>...
```

### Step 4: Update Frontend Environment on Vercel

1. Go to https://vercel.com/dashboard
2. Select your **frontend** project
3. Settings → Environment Variables
4. Add or update:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1
   ```
5. Redeploy (or git push to trigger auto-deploy)

### Step 5: Test Frontend Login

1. Open your Vercel frontend URL
2. Open browser DevTools (F12) → Console tab
3. Register or login
4. You should see console logs like:
   ```
   [AUTH] Logging in at: https://moderator-1-zi2v.onrender.com/api/v1/login
   [HEALTH] Backend is healthy: {message: "ModForge AI Studio Backend"}
   ```
5. If you see HTML error, backend is wrong

---

## 🔍 Troubleshooting

### Issue 1: "Backend error 404" still showing

**Check:**
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
// Should print: https://moderator-1-zi2v.onrender.com/api/v1
```

If `undefined`, environment variable not set.

### Issue 2: Backend at root returns HTML

```bash
curl -I https://moderator-1-zi2v.onrender.com/
# Look for: Content-Type: text/html (WRONG)
# or: Content-Type: application/json (CORRECT)
```

If HTML, frontend is deployed at that URL. Check Render dashboard for correct backend service.

### Issue 3: Works on laptop, fails on mobile

1. Hard refresh on mobile: Ctrl+Shift+R or Cmd+Shift+R
2. Clear browser cache
3. Try incognito/private mode
4. Check network tab to see actual request URL

### Issue 4: CORS errors in browser console

```javascript
// Error: "Access to XMLHttpRequest blocked by CORS policy"
```

**Fix:**
1. Backend's `CORS_ALLOWED_ORIGINS` must include your Vercel frontend URL
2. On Render backend service, set environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app
   ```
3. Redeploy backend

---

## 📊 Configuration Verification Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1`
- [ ] `https://moderator-1-zi2v.onrender.com/` returns JSON (not HTML)
- [ ] `https://moderator-1-zi2v.onrender.com/api/v1/login` endpoint exists
- [ ] Vercel frontend environment variable set
- [ ] Backend Render service is `Live` (not `Failed`)
- [ ] CORS includes frontend URL
- [ ] npm run build succeeds locally
- [ ] Login works on desktop after redeploy
- [ ] Login works on mobile after redeploy

---

## 📈 All API Endpoints

Your frontend calls these endpoints on the backend:

```
POST   /api/v1/register              → Create new user
POST   /api/v1/login                 → Get JWT token
GET    /api/v1/projects              → List user projects
POST   /api/v1/projects              → Create project
GET    /api/v1/projects/{id}         → Get project details
PATCH  /api/v1/projects/{id}         → Update project
DELETE /api/v1/projects/{id}         → Delete project
GET    /api/v1/projects/{id}/data    → Get project data
PUT    /api/v1/projects/{id}/data    → Update project data
POST   /api/v1/projects/{id}/upload  → Upload files
GET    /api/v1/projects/{id}/files   → List files
POST   /api/v1/ai/prompt             → Send prompt to AI
POST   /api/v1/projects/{id}/analyze → Analyze files
```

All these MUST go to `https://moderator-1-zi2v.onrender.com`, NOT localhost or frontend.

---

## 🔑 Key Takeaway

**Your error "Backend error 404" happens because:**
1. ✅ Code is correct (all API calls use centralized `API_BASE`)
2. ✅ Backend endpoint exists on Render
3. ❌ **Backend URL returns frontend HTML instead of API JSON**
4. ❌ **Or environment variable is set to localhost**

**Solution:**
- Fix environment variable: `NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1`
- Verify backend is actually running (check Render logs)
- Ensure backend returns JSON, not HTML
