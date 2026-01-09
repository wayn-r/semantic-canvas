# 🔍 Debugging: "Unable to Connect" Error

## Current Status: ✅ Both Services Running

- Backend: http://localhost:3001 (PID 961590) ✅
- Frontend: http://localhost:5173 (PID 961401) ✅
- Database: PostgreSQL on 5433 ✅

## 🎯 Step-by-Step Debugging

### Step 1: Open Browser DevTools

1. Open http://localhost:5173 in your browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab

### Step 2: Run This Diagnostic Script

Copy and paste this into the browser console:

```javascript
console.clear();
console.log('🔍 Starting diagnostics...\n');

// Test 1: Check environment variable
console.log('1️⃣ Environment Variable:');
console.log('   VITE_API_BASE_URL =', import.meta?.env?.VITE_API_BASE_URL || 'NOT SET');
console.log('   Expected: http://localhost:3001/api\n');

// Test 2: Test API connection
console.log('2️⃣ Testing API connection...');
fetch('http://localhost:3001/api/blocks')
  .then(response => {
    console.log('   ✅ API Response:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('   ✅ API Data:', data.blocks?.length || 0, 'blocks found');
  })
  .catch(error => {
    console.error('   ❌ API Error:', error.message);
    console.error('   Error details:', error);
  });

// Test 3: Check for CORS issues
console.log('\n3️⃣ Testing CORS...');
fetch('http://localhost:3001/health', {
  method: 'GET',
  mode: 'cors',
  credentials: 'include'
})
  .then(response => {
    console.log('   ✅ CORS working, status:', response.status);
  })
  .catch(error => {
    console.error('   ❌ CORS Error:', error.message);
  });

// Test 4: Check axios if loaded
setTimeout(() => {
  console.log('\n4️⃣ Checking axios...');
  if (typeof axios !== 'undefined') {
    console.log('   ✅ Axios loaded');
  } else {
    console.log('   ⚠️ Axios not loaded yet (may load later)');
  }
}, 1000);

console.log('\n⏳ Running tests... Results will appear above ⬆️');
```

### Step 3: Check Network Tab

1. In DevTools, click the **Network** tab
2. Refresh the page (Ctrl+R or Cmd+R)
3. Look for these requests:

**Expected requests:**
- `localhost:3001/api/blocks` → Status: **200 OK** ✅
- `localhost:3001/api/connections` → Status: **200 OK** ✅

**If you see these with Status 200, the connection works!**

### Step 4: Identify the Problem

Based on what you see:

#### ✅ If API requests show Status 200:
**The connection is working!** The error message might be:
- Cached in browser memory
- From an old error that already cleared
- A display bug

**Solution:** Hard refresh with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

#### ❌ If you see CORS errors:
```
Access to fetch at 'http://localhost:3001/api/blocks' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**This shouldn't happen** (backend is configured for CORS), but if it does:
1. Check backend is actually running: `curl http://localhost:3001/health`
2. Restart backend: `cd backend && npm run dev`

#### ❌ If you see "Failed to fetch" or "net::ERR_CONNECTION_REFUSED":
```
Failed to fetch
TypeError: Failed to fetch
```

**This means backend is not responding.** Solutions:
1. Verify backend is running: `ps aux | grep server.js`
2. Check port 3001: `sudo ss -tlnp | grep 3001`
3. Restart backend: `cd backend && npm run dev`

#### ❌ If environment variable is wrong:
```
VITE_API_BASE_URL = undefined
// or
VITE_API_BASE_URL = http://localhost:3000/api  (wrong port)
```

**Frontend didn't load the .env file.** Solutions:
1. Verify .env file exists: `cat .env`
2. Kill and restart frontend:
   ```bash
   pkill -f vite
   npm run dev:frontend
   ```
3. Hard refresh browser after restart

## 🔧 Quick Fixes

### Fix 1: Hard Refresh (90% of cases)
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Fix 2: Clear Browser Cache
```javascript
// In browser console, run:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Fix 3: Restart Everything
```bash
# Kill all processes
pkill -9 -f "nodemon|vite"

# Start backend (in backend directory)
cd /home/cursor/programming/semantic-canvas/backend
npm run dev &

# Start frontend (in root directory)
cd /home/cursor/programming/semantic-canvas
npm run dev:frontend &

# Wait and test
sleep 5
curl http://localhost:3001/health
curl http://localhost:5173 -I
```

## 📊 What Success Looks Like

When working correctly, the browser console should show:

```
🔍 Starting diagnostics...

1️⃣ Environment Variable:
   VITE_API_BASE_URL = http://localhost:3001/api
   Expected: http://localhost:3001/api

2️⃣ Testing API connection...
   ✅ API Response: 200 OK
   ✅ API Data: 2 blocks found

3️⃣ Testing CORS...
   ✅ CORS working, status: 200

4️⃣ Checking axios...
   ✅ Axios loaded
```

## 🆘 Still Having Issues?

If after running the diagnostic script you still see errors, **please share**:

1. **Exact error message** from browser console
2. **Network tab screenshot** showing the failed requests
3. **Results** from the diagnostic script above

This will help identify the exact problem!

## 💡 Common Misunderstandings

❌ "Unable to connect" error message **on the screen**
✅ But Network tab shows **Status 200** requests succeeding

**This means:** Connection actually works! The error is cached. Hard refresh will clear it.

---

❌ Console shows old errors from **before** the fix
✅ But recent Network requests succeed

**This means:** Old errors are just logged history. Check the timestamp! Recent requests (after page load) should succeed.
