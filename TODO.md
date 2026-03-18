# Biometrics UI Fix - NexusHR Frontend

## Current Status
✅ Components implemented (Scanner, Fingerprint, EyeDetector)  
❌ Blocked by CORS/auth errors  
❌ Eye models missing  

## Step-by-Step Fix Plan

### 1. Fix CORS/API Access [Priority 1 - 5min]
```
cd c:/Users/Suriya/Downloads/nexushr-frontend/nexushr-frontend
npm run dev
```
- Open http://localhost:5173/register
- Check console → CORS errors on /api/auth/register
- **Fix:** Add Vite proxy below

### 2. Verify Auth → Attendance Flow
```
1. Register/login successfully
2. → Dashboard → Attendance (/attendance) 
3. See \"Verify Clock In/Out\" buttons with 👆 icon
4. Click → BiometricScanner modal opens
```

### 3. Test Biometrics
```
Fingerprint: WebAuthn (works on desktop/mobile TouchID)
Eye: Camera + ML (needs models + permission)
Manual: Fallback button
```

## Detailed Steps

**Step 1: Vite Proxy Fix (CORS)**
Edit vite.config.js → add server.proxy

**Step 2: Backend CORS (Production)**
```
app.use(cors({ origin: 'http://localhost:5173' }))
```

**Step 3: Eye Models**
```
mkdir public/models
# Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
cp *.pb public/models/
```

**Step 4: Test Commands**
```
npm run dev          # Frontend
npm run build        # Production build
npm run preview      # Preview build
```

## Expected Results
```
✅ No CORS errors
✅ Login/Register works  
✅ /attendance loads
✅ Scanner modal opens on button click
✅ Fingerprint: 95% success (WebAuthn)
✅ Eye: Camera permission → scan progress
✅ Manual: Instant clock-in
```

## Browser Checklist
```
[ ] Allow Camera permission
[ ] Enable WebAuthn (Chrome/Edge/Safari)
[ ] No adblockers (blocks models)
[ ] HTTPS for production (WebAuthn req)
```

Progress: 60% (Proxy ✅, Backend needed, Models pending)

