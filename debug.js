# Debug Script for ModForge Deployment
# Run this in your browser console to test the API connection

// Test 1: Check what URL the frontend is trying to use
console.log("Frontend API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

// Test 2: Test backend connectivity
fetch('https://YOUR-BACKEND-URL.onrender.com/')
  .then(response => response.json())
  .then(data => console.log("Backend response:", data))
  .catch(error => console.error("Backend connection failed:", error));

// Test 3: Test login endpoint
fetch('https://YOUR-BACKEND-URL.onrender.com/api/v1/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(response => {
  console.log("Login response status:", response.status);
  return response.text();
})
.then(text => console.log("Login response:", text))
.catch(error => console.error("Login failed:", error));