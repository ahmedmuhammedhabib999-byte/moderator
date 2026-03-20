# Deployment Validation & Testing Guide

## Pre-Deployment Checklist

### Backend Code Review
- [ ] `.../backend/app/main.py` - FastAPI app properly initialized
- [ ] `.../backend/app/routers/users.py` - Has `/health` endpoint
- [ ] `.../backend/requirements.txt` - All dependencies listed
- [ ] `.../backend/app/models.py` - Database models defined
- [ ] `.../backend/app/auth.py` - JWT authentication configured

### Frontend Code Review
- [ ] `.../src/lib/api.ts` - API calls use `NEXT_PUBLIC_API_BASE_URL` env var
- [ ] `.../src/app/` - Components handle API errors gracefully
- [ ] No hardcoded `localhost` URLs in code
- [ ] `./.env.local` - Has correct backend URL for development

---

## Deployment Testing Phases

### Phase 1: Backend Service Health (IMMEDIATE)

**Test 1.1: Service Running**
```bash
# Should return JSON without delay
curl -X GET https://rebuilder-backend.onrender.com/api/v1/health

# Expected: {"status":"ok"}
# If timeout: Service may be starting (wait 30-60 sec)
# If 404: Check Render dashboard for errors
# If HTML: Wrong service deployed (check Render config)
```

**Test 1.2: CORS Configuration**
```bash
# From different origin (browser)
fetch('https://rebuilder-backend.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS OK:', d))
  .catch(e => console.error('❌ CORS Error:', e))
```

**Expected**: `✅ CORS OK: {status: "ok"}`

---

### Phase 2: Authentication Flow

**Test 2.1: Register New Account**

```bash
curl -X POST https://rebuilder-backend.onrender.com/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Expected Response**:
```json
{
  "id": 1,
  "email": "test@example.com"
}
```

**Test 2.2: Login with Credentials**

```bash
curl -X POST https://rebuilder-backend.onrender.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**Test 2.3: Use Token for Protected Request**

```bash
# Replace TOKEN with actual token from login
TOKEN="eyJhbGc..."

curl -X GET https://rebuilder-backend.onrender.com/api/v1/protected \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 200 status with protected resource data

---

### Phase 3: Frontend Integration

**Test 3.1: Browser Console Testing**

Open DevTools (F12) → Console, run:

```javascript
// Test 1: Health Check
fetch('https://rebuilder-backend.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health:', d))
  .catch(e => console.error('❌ Failed:', e))

// Test 2: Check response type
fetch('https://rebuilder-backend.onrender.com/api/v1/health')
  .then(r => {
    const contentType = r.headers.get('content-type')
    console.log('Content-Type:', contentType)
    if (contentType.includes('application/json')) {
      console.log('✅ JSON response')
    } else if (contentType.includes('text/html')) {
      console.error('❌ HTML response - backend misconfigured')
    }
    return r.json()
  })
  .then(d => console.log('Response:', d))
```

**Test 3.2: Login Flow in Frontend**

1. Navigate to login page
2. Enter test credentials from Test 2.1
3. Watch Network tab (F12 → Network)
4. Verify:
   - Request goes to `rebuilder-backend.onrender.com`
   - Response is JSON (not HTML)
   - Status 200 (not 404 or 503)
   - Token received and stored

**Test 3.3: Authenticated API Call**

1. After successful login
2. Navigate to authenticated page
3. Watch Network tab for API requests
4. Verify:
   - Authorization header included
   - Response is JSON
   - Data displays correctly

---

### Phase 4: Error Scenarios

**Test 4.1: Invalid Credentials**
```bash
curl -X POST https://rebuilder-backend.onrender.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

**Expected**: 400 status with JSON error message (NOT HTML)

**Test 4.2: Missing Authorization**
```bash
curl -X GET https://rebuilder-backend.onrender.com/api/v1/me
```

**Expected**: 401 status with JSON error (NOT HTML)

**Test 4.3: Invalid Token**
```bash
curl -X GET https://rebuilder-backend.onrender.com/api/v1/me \
  -H "Authorization: Bearer invalid_token_xyz"
```

**Expected**: 401 or 403 status with JSON error (NOT HTML)

---

### Phase 5: Response Type Verification

**Critical Test: Ensure All Responses are JSON**

```javascript
// Run in browser console
const endpoints = [
  '/api/v1/health',
  '/api/v1/register',
  '/api/v1/login',
]

for (const endpoint of endpoints) {
  fetch(`https://rebuilder-backend.onrender.com${endpoint}`, {
    method: 'GET'
  })
  .then(r => {
    const type = r.headers.get('content-type')
    const isJSON = type.includes('application/json')
    const isHTML = type.includes('text/html')
    
    console.log(`${endpoint}: ${type}`)
    if (isHTML) {
      console.error(`❌ PROBLEM: ${endpoint} returns HTML!`)
    }
    if (isJSON) {
      console.log(`✅ OK: ${endpoint} returns JSON`)
    }
  })
}
```

**Success**: All responses show "✅ OK: ... returns JSON"

**Failure**: Any response shows "❌ PROBLEM: ... returns HTML" indicates backend misconfiguration

---

## Mobile Testing

**Test on Actual Device**:

1. Get your Render backend URL
2. Test on mobile browser:
   ```
   https://rebuilder-backend.onrender.com/api/v1/health
   ```
3. Verify:
   - Page loads (not error page)
   - Shows JSON (not HTML)
   - Response time < 2s

**Test Mobile App (if applicable)**:

1. Login on mobile device
2. Verify token stored correctly
3. Test authenticated endpoints
4. Check offline behavior (if implemented)

---

## Performance Testing

### Response Time Benchmarks

After deployment:
- Health check: < 100ms
- Login: < 500ms
- General API calls: < 200ms

**Test with curl timing**:
```bash
curl -w "Response time: %{time_total}s\n" \
  https://rebuilder-backend.onrender.com/api/v1/health
```

---

## Rollback Criteria

**Stop deployment and rollback if**:

- ❌ Health endpoint doesn't return JSON
- ❌ Health endpoint returns HTML 404
- ❌ CORS errors prevent frontend connection
- ❌ Authentication fails with all endpoints
- ❌ Database connection fails
- ❌ Response times > 5 seconds consistently

---

## Post-Deployment Monitoring

### Daily Checks (First Week)

```bash
# Check backend health
curl https://rebuilder-backend.onrender.com/api/v1/health

# Check Render dashboard for:
# - Memory usage
# - CPU usage
# - Error logs
# - Restart events
```

### Weekly Checks

1. Test full login flow
2. Test authenticated endpoints
3. Monitor response times
4. Check database for issues
5. Review error logs

---

## Success Criteria Checklist

**Backend Deployment Complete When**:

- [x] Render service created and running
- [x] Health endpoint returns `{"status":"ok"}`
- [x] All responses are JSON (not HTML)
- [x] CORS configured correctly
- [x] Environment variables set
- [x] Database connection working
- [x] No 404 errors on valid endpoints

**Frontend Update Complete When**:

- [x] Environment variable updated
- [x] Vercel redeployed
- [x] Login page loads without errors
- [x] Login request goes to correct backend
- [x] Token received successfully
- [x] Authenticated endpoints work

**Full Integration Complete When**:

- [x] Browser shows no errors
- [x] All API tests pass
- [x] Mobile device works
- [x] No HTML responses received
- [x] Performance meets benchmarks
- [x] Error handling works properly

---

## Testing Success Summary

```bash
# Run this after all tests pass
echo "✅ Backend deployed successfully"
echo "✅ API responding with JSON"
echo "✅ Authentication working"
echo "✅ CORS configured"
echo "✅ Frontend connected"
echo "✅ Mobile compatible"
echo "✅ Performance acceptable"
echo ""
echo "🎉 Deployment Complete!"
```

---

## Next Steps if Tests Fail

1. **HTML responses instead of JSON**:
   - Check Render service is running backend (not frontend)
   - Verify Build Command is `pip install -r requirements.txt`
   - Verify Start Command is correct Uvicorn/Gunicorn command

2. **Connection refused**:
   - Ensure Render service is running
   - Check environment variables set
   - Wait 1-2 minutes for cold start

3. **CORS errors**:
   - Update `allow_origins` in `backend/app/main.py`
   - Add frontend URL to whitelist
   - Redeploy backend

4. **Authentication fails**:
   - Check JWT SECRET_KEY environment variable set
   - Verify database connection
   - Check user registration worked

