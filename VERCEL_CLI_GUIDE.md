## Quick Vercel Deployment with CLI

If you prefer deploying from command line:

### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

### **2. Login to Vercel**
```bash
vercel login
```

### **3. Deploy Backend**
```bash
cd backend
vercel --prod
```

### **4. Deploy Frontend**
```bash
cd frontend
vercel --prod --env VITE_BACKEND_URL=https://your-backend-url.vercel.app
```

### **5. Update Root Package.json** (Optional - for managing both)
```json
{
  "name": "library-management",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm -C backend run dev\" \"npm -C frontend run dev\""
  }
}
```

Then run:
```bash
npm run dev
```

---

See `VERCEL_DEPLOYMENT.md` for the full dashboard deployment guide.
