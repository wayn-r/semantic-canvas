# 🌐 Network Access Configuration

## ✅ Configured for Remote Access

Your semantic canvas is now accessible from other devices on your network!

## 📍 Access URLs

**From your laptop or any device on the same network:**

- **Frontend App**: http://192.168.0.7:5173
- **Backend API**: http://192.168.0.7:3001/api
- **Health Check**: http://192.168.0.7:3001/health

## 🔧 Configuration Changes Made

### Frontend (.env)
```env
# Changed from localhost to network IP
VITE_API_BASE_URL=http://192.168.0.7:3001/api
```

### Backend (backend/.env)
```env
# Updated CORS to allow network access
CORS_ORIGIN=http://192.168.0.7:5173
```

## 🎯 How to Access from Your Laptop

1. **Make sure your laptop is on the same network** as the dev machine
2. **Open your browser** on your laptop
3. **Navigate to:** http://192.168.0.7:5173
4. **The app should load** and connect to the backend

## ✅ Services Status

Both services are listening on all network interfaces (0.0.0.0):

- ✅ Backend: Port 3001 (accessible from network)
- ✅ Frontend: Port 5173 (accessible from network)
- ✅ CORS: Configured for http://192.168.0.7:5173

## 🧪 Test from Your Laptop

### Quick Browser Test
Open your laptop's browser and go to:
```
http://192.168.0.7:5173
```

### Test API Connection (in browser console)
Press F12 and run:
```javascript
fetch('http://192.168.0.7:3001/api/blocks')
  .then(r => r.json())
  .then(d => console.log('✅ Connected! Blocks:', d.blocks.length))
  .catch(e => console.error('❌ Error:', e.message));
```

## 🔥 Firewall Note

If you can't connect from your laptop, you may need to allow ports on the dev machine:

```bash
# Allow ports 3001 and 5173 through firewall
sudo ufw allow 3001/tcp
sudo ufw allow 5173/tcp

# Or temporarily disable firewall for testing
sudo ufw disable
```

## 🔄 If IP Address Changes

If your dev machine's IP address changes (e.g., after reboot), you'll need to:

1. **Find new IP:**
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Update .env files:**
   - `.env` → Change `VITE_API_BASE_URL`
   - `backend/.env` → Change `CORS_ORIGIN`

3. **Restart services:**
   ```bash
   pkill -f "nodemon|vite"
   cd backend && npm run dev &
   cd .. && npm run dev:frontend &
   ```

## 🏠 Switch Back to Localhost

If you want to use localhost again (when accessing from the dev machine):

1. **Edit .env:**
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. **Edit backend/.env:**
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Restart services**

## 🌐 Access from Multiple Devices

The backend is already configured to accept connections from anywhere. If you want to allow CORS from multiple origins:

**Edit backend/server.js:**
```javascript
// Replace CORS config with:
app.use(cors({
  origin: true, // Allow all origins (for development)
  credentials: true,
}));
```

**Or specify multiple origins:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.0.7:5173',
    'http://your-laptop-ip:5173'
  ],
  credentials: true,
}));
```

## 📱 Current Network Info

**Dev Machine IP:** 192.168.0.7
**Available from:**
- Same device: http://localhost:5173 (won't work currently - configured for network)
- Local network: http://192.168.0.7:5173 ✅
- Remote devices: Not accessible (requires port forwarding)

## 🎉 You're All Set!

**Open on your laptop:** http://192.168.0.7:5173

The "unable to connect" error should be gone since the frontend will now correctly connect to `http://192.168.0.7:3001/api` instead of trying to reach `localhost:3001` on your laptop.
