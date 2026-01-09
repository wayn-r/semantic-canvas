# Semantic Canvas Setup Guide

## ✅ Services Status

Your semantic canvas is now fully integrated with PostgreSQL + pgvector!

## 🚀 How to Run

### Option 1: Run Everything with One Command

```bash
# Start database + backend + frontend
npm run dev
```

### Option 2: Run Services Separately (Recommended for Development)

```bash
# Terminal 1: Start PostgreSQL
npm run db:up

# Terminal 2: Start Backend API (port 3001)
npm run dev:backend

# Terminal 3: Start Frontend (port 5173)
npm run dev:frontend
```

## 📍 Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5433

## 🔍 Troubleshooting

### "Unable to connect to server"

If you see this error in the frontend:

1. **Check Backend is Running**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

2. **Check Frontend is Running**
   ```bash
   curl http://localhost:5173 -I
   # Should return: HTTP/1.1 200 OK
   ```

3. **Check Ports are Not Blocked**
   ```bash
   sudo ss -tlnp | grep -E ":(3001|5173)"
   # Should show both ports listening
   ```

4. **Restart Everything**
   ```bash
   # Kill all processes
   pkill -f "nodemon"
   pkill -f "vite"

   # Restart
   npm run dev:backend &
   npm run dev:frontend &
   ```

5. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed API requests

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep semantic-canvas-db

# If not running, start it
npm run db:up

# View database logs
npm run db:logs
```

### Backend Not Starting

```bash
# Check backend logs
cd backend
npm run dev

# Look for errors like:
# - Port already in use → Change PORT in backend/.env
# - Database connection failed → Check DB credentials
# - OpenAI API error → Verify OPENAI_API_KEY in backend/.env
```

## 🧪 Testing the Integration

### 1. Test Backend API
```bash
# Get all blocks
curl http://localhost:3001/api/blocks

# Create a test block
curl -X POST http://localhost:3001/api/blocks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Test block",
    "tags": ["test"],
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 100
  }'

# Run canvas analysis
curl -X POST http://localhost:3001/api/analysis/canvas
```

### 2. Test Frontend
1. Open http://localhost:5173
2. You should see "Loading canvas..." briefly
3. Then an empty canvas (or blocks if database has data)
4. Click the toolbar buttons to add blocks
5. Watch for auto-suggestions when creating blocks

### 3. Test Semantic Search
1. Create a block with content about "Python async"
2. Create another block with similar content
3. You should see a suggestion to connect them (if similarity > 70%)
4. Click "Analyze" button for full canvas analysis

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_OPENROUTER_API_KEY=your-openrouter-key
OPENAI_API_KEY=your-openai-key
```

### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5433
DB_NAME=semantic_canvas
DB_USER=semantic_user
DB_PASSWORD=semantic_pass

OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key

CORS_ORIGIN=http://localhost:5173
```

## 📊 How It Works

1. **Block Creation**: When you create a block, the backend:
   - Saves it to PostgreSQL
   - Generates an OpenAI embedding (1536 dimensions)
   - Searches for semantically similar blocks
   - Returns auto-suggestions if similarity > 70%

2. **Position Updates**: Dragging blocks:
   - Updates UI immediately (optimistic)
   - Saves to backend after 1 second (debounced)

3. **Canvas Analysis**: Clicking "Analyze":
   - Finds all semantic relationships (threshold: 50%)
   - Identifies missing connections
   - Suggests block relocations for better organization

4. **Semantic Search**: Uses pgvector:
   - Cosine similarity between embeddings
   - IVFFlat index for fast queries
   - Results cached for 1 hour

## 🎯 Next Steps

- Open http://localhost:5173 and start creating blocks!
- Try creating blocks with similar content to see auto-suggestions
- Use the "Analyze" button for comprehensive semantic insights
- All changes are automatically saved to the database

## 🛠️ Useful Commands

```bash
# Database
npm run db:up        # Start PostgreSQL
npm run db:down      # Stop PostgreSQL
npm run db:logs      # View database logs

# Development
npm run dev          # Start all services
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only

# Production
npm run build        # Build frontend for production
```

## 📝 Current Status

✅ Backend running on port 3001
✅ Frontend running on port 5173
✅ Database connected and ready
✅ OpenAI embeddings working
✅ Semantic search operational
✅ Auto-suggestions enabled

Everything is ready to use! 🎉
