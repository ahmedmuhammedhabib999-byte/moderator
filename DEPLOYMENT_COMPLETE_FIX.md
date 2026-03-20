# ModForge AI Studio - Complete Deployment Guide

## 🎯 Authentication System Overview

Your app uses a **custom JWT-based authentication** with:
- **Frontend**: Next.js (React) with localStorage token storage
- **Backend**: FastAPI with OAuth2 + JWT tokens
- **Database**: SQLite (local) or PostgreSQL (production)
- **API Communication**: RESTful JSON endpoints

**Authentication Flow:**
1. User submits email/password on login page
2. Frontend calls `fetch(API_BASE + '/login')`
3. Backend validates credentials, returns JWT token
4. Frontend stores token in localStorage
5. Subsequent API calls include token in Authorization header
6. Backend validates token on each request

---

## ✅ Current Fix Applied

### Files Modified:

#### 1. **src/lib/api.ts** ✅
**What was wrong:**
- Hardcoded localhost fallback could confuse deployment
- No environment detection logic
- Poor error handling for 404 responses
- Difficult to debug API routing failures

**What's fixed:**
- Smart API_BASE detection:
  - Checks `NEXT_PUBLIC_API_BASE_URL` env var first (deployment override)
  - Detects localhost automatically for development
  - Falls back to production Render URL
- Proper error messages for debugging
- HTML response detection (404 page errors)
- Console logging for development troubleshooting

**Code:**
```typescript
function getAPIBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL
  if (typeof window === 'undefined') return 'https://moderator-1-zi2v.onrender.com/api/v1'
  
  const hostname = window.location.hostname
  return (hostname === 'localhost' || hostname === '127.0.0.1')
    ? 'http://localhost:8000/api/v1'
    : 'https://moderator-1-zi2v.onrender.com/api/v1'
}
```

#### 2. **src/components/AuthForm.tsx** ✅
**What was wrong:**
- Generic error messages don't help users understand what happened
- Raw error objects shown to users
- No context for connection failures

**What's fixed:**
- User-friendly error message translation
- Specific handling for common errors:
  - Connection failures
  - Invalid credentials
  - Email already registered
- Better logging for debugging

#### 3. **backend/app/main.py** ✅
**What was wrong:**
- Placeholder CORS URLs not filled in
- Wildcard CORS with credentials (CORS violation)
- No clear comments about production setup

**What's fixed:**
- Proper CORS origin detection from env var
- Smart fallback to safe defaults
- Comments for production configuration
- Wildcard temporarily enabled for migration (disable for production)

---

## 🚀 Deployment: Step-by-Step 

### **Option 1: Backend on Render + Frontend on Vercel (Recommended)**

#### A. Backend Setup (Already Running on Render)

Your backend is at: `https://moderator-1-zi2v.onrender.com`

**Verify it's running:**
```bash
curl https://moderator-1-zi2v.onrender.com/
# Response: {"message":"ModForge AI Studio Backend"}
```

**Check Render backend service environment variables are set:**
- ✅ `DATABASE_URL` (if using Postgres)
- ✅ `OPENAI_API_KEY`
- ✅ `SECRET_KEY`
- ✅ `CORS_ALLOWED_ORIGINS=*` (for now, restrict later)

#### B. Frontend Deploy to Vercel

1. **Create Vercel project:**
   - Go to https://vercel.com/new
   - Select your GitHub repo: `moderator`
   - Framework: `Next.js`
   - Root: `.`

2. **Environment Variables (Settings > Environment Variables):**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://moderator-1-zi2v.onrender.com/api/v1
   ```
   (optional, since it's already hardcoded as fallback)

3. **Deploy**
   - Vercel auto-deploys from GitHub

4. **After deployment:**
   - Get your Vercel URL: `https://your-project.vercel.app`
   - Update backend `CORS_ALLOWED_ORIGINS` to include this URL

#### C. Fix CORS on Backend (After Frontend is Deployed)

1. Go to Render dashboard → backend service → Settings
2. Set environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
3. Redeploy backend

---

### **Option 2: Both Services on Render (Alternative)**

1. Create frontend web service (same as backend setup)
2. Root: `.`
3. Build: `npm run build`
4. Start: `npm run start`  
5. Env var:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-name.onrender.com/api/v1
   ```

---

## 🧪 Testing After Deployment

### From Desktop:
1. Open your frontend URL
2. Open browser DevTools (F12) → Console tab
3. Register or login
4. Verify:
   - No 404 page shown
   - Token saved in localStorage
   - Dashboard loads with projects

### From Mobile:
1. Open your frontend URL on phone
2. Register or login
3. Same checks as desktop

### Test API Directly:
```bash
# Test backend is reachable
curl https://moderator-1-zi2v.onrender.com/

# Test login endpoint
curl -X POST https://moderator-1-zi2v.onrender.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## ❌ Common Issues & Fixes

### Issue: 404 page on login (seen on mobile)

**Possible causes:**
1. Frontend using wrong API URL
2. Backend not reachable
3. CORS blocked the request

**Fix:**
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
// Should print your backend URL, not undefined
```

### Issue: "Could not validate credentials" after login

**Cause:** Backend not setting `CORS_ALLOWED_ORIGINS` to frontend URL

**Fix:**
- Add frontend URL to backend env: `CORS_ALLOWED_ORIGINS=https://your-front end.vercel.app`
- Redeploy backend

### Issue: Login works on laptop but not on phone

**Cause:** Cached environment variables or browser data

**Fix:**
- Hard-refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache / use incognito mode
- Check network tab in DevTools to see actual request URL

### Issue: "Failed to fetch" after typing email/password

**Cause:** Backend not running or network issue

**Fix:**
- Test backend:
  ```bash
  curl https://moderator-1-zi2v.onrender.com/
  ```
- If 503 error: backend is starting up (Render has startup delay)
- Wait 30-60 seconds and try again

---

## 📋 Production Checklist

- [ ] Backend env vars set (API_KEY, SECRET_KEY, DATABASE_URL)
- [ ] Frontend env var set (`NEXT_PUBLIC_API_BASE_URL` or relying on hardcoded fallback)
- [ ] Both services deployed and running
- [ ] Backend CORS includes frontend URL
- [ ] Login works on desktop
- [ ] Login works on mobile (fresh browser)
- [ ] Projects load after login
- [ ] File upload works
- [ ] AI features work
- [ ] Export functionality works

---

## 🔐 Security Notes (Before Production)

1. **Change `SECRET_KEY`:**
   - Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Set on Render: `SECRET_KEY=<generated-key>`

2. **Restrict CORS:**
   - Change `CORS_ALLOWED_ORIGINS` from `*` to specific frontend URL:
     ```
     CORS_ALLOWED_ORIGINS=https://your-front-end.vercel.app
     ```

3. **Enable HTTPS:**
   - Vercel/Render both provide HTTPS by default ✅

4. **Secure token storage:**
   - Currently using localStorage (acceptable for SPA)
   - For extra security, use httpOnly cookies (requires backend change)

---

## 📞 Support

If deployment still fails:
1. Check `console.log()` in browser for API_BASE
2. Check network tab in DevTools for actual request URL
3. Check Render/Vercel deployment logs
4. Verify backend env vars are set correctly
5. Test backend directly with curl command

