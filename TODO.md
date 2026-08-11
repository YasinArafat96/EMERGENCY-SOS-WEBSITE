# Emergency SOS - Fix & Deployment Plan

## Backend Fixes
- [x] 1. Fix `paymentController.js` — add missing `User` import
- [x] 2. Fix `authController.js` — indentation + graceful OTP failure
- [x] 3. Harden `emergencyController.js` — SOS creation without crash
- [x] 4. Add demo seed data for populated feel
- [x] 5. Ensure CORS + socket config for deployment (Render)

## Frontend Fixes
- [x] 6. `LiveTracking.jsx` — real Google Maps integration
- [x] 7. `BloodPage.jsx` — fix white background on booking form
- [x] 8. `Home.jsx` — resilient stats (no crash on API failure)
- [x] 9. `CommunityBillboard.jsx` — working create post
- [x] 10. `AlertsPage.jsx` — working SOS flow (backend hardened)

## Deployment
- [x] 11. Add `vercel.json` for frontend routing
- [x] 12. Document all environment variables
- [x] 13. Verify build compiles cleanly
