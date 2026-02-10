# Vercel Deployment Guide

## **📋 Prerequisites**
1. GitHub account with your repo pushed
2. Vercel account (vercel.com - sign up free)

## **🚀 Deployment Steps**

### **Part 1: Deploy Backend to Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import your Git repository** (select the LibraryManagement repo)
4. **Configure the project**:
   - Framework Preset: **Other**
   - Root Directory: **backend** ← Set this!
   - Build Command: **Leave empty** (Node.js doesn't need build)
   - Output Directory: **Leave empty**
   - Install Command: **npm install**

5. **Environment Variables** (Add to Vercel):
   - Click "Environment Variables"
   - Add if needed: `NODE_ENV=production`

6. **Deploy**: Click "Deploy"
7. **Save your Backend URL** (e.g., `https://library-backend.vercel.app`)

### **Part 2: Deploy Frontend to Vercel**

1. **Create New Project** in Vercel Dashboard
2. **Import same repository**
3. **Configure the project**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend** ← Set this!
   - Build Command: **npm run build** (default)
   - Output Directory: **dist** (default)

4. **Environment Variables** (Add to Vercel):
   - Name: `VITE_BACKEND_URL`
   - Value: `https://your-backend-url.vercel.app` (use the backend URL from Part 1)

5. **Deploy**: Click "Deploy"

### **Part 3: Update Backend Socket.io CORS**

After getting your frontend URL, update the backend `server.js`:

In `backend/server.js`, find:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

Change to:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

Then add environment variable in Vercel backend settings:
- Name: `FRONTEND_URL`
- Value: `https://your-frontend-url.vercel.app`

Redeploy the backend.

## **✅ Testing**

1. Visit your frontend URL: `https://your-frontend-url.vercel.app`
2. Should connect to backend automatically
3. Test adding books, members, and borrowing features

## **🔧 Troubleshooting**

**CORS Error?** - Check backend environment variable `FRONTEND_URL` is set correctly

**API calls failing?** - Make sure `VITE_BACKEND_URL` is set in frontend environment

**WebSocket not connecting?** - Verify the backend URL in environment variables

## **Local Development**

To test locally:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Visit: `http://localhost:5173`

