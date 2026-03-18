# Previous Tasks
# Task: Split AuthPages.jsx into separate LoginPage.jsx and RegisterPage.jsx
## Steps:
- [x] 1. Create src/pages/LoginPage.jsx (LoginPage component + shared AuthLayout)
- [x] 2. Create src/pages/RegisterPage.jsx (RegisterPage component + shared AuthLayout)
- [x] 3. Update src/App.jsx imports to use new files
- [x] 4. Delete src/pages/AuthPages.jsx
- [x] 5. Test with `npm run dev` (routes /login and /register)
## Followup:
- Verify login/register functionality, toasts, error handling, user data display.

# Current Task: Fix 33 CORS Errors in API calls

## Steps:
- [x] 1. Update TODO.md with CORS task tracking
- [x] 2. Update src/services/api.js baseURL to use Vite proxy ('/')
- [ ] 3. Restart dev server (`npm run dev`)
- [ ] 4. Test API calls (login, employees list, etc. - check Network tab for no CORS)
- [ ] 5. For production: Set VITE_API_URL=your-prod-backend.com in .env

## Followup:
- Verify no CORS errors in browser console/Network tab.
- Backend CORS middleware recommended for prod.

