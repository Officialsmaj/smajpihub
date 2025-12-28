# TODO List for Authentication API and Register Form Fix

## Completed Tasks
- [x] Create package.json with Node.js dependencies (express, bcryptjs, jsonwebtoken, cors, body-parser)
- [x] Create server.js with authentication API endpoints (/api/register, /api/login, /api/forgot-password, /api/reset-password)
- [x] Update register.html to match login form design (remove labels, add h1/p, add divider/OR, add Pi register button, add footer, fix script paths)
- [x] Add Pi SDK to register.html and login.html
- [x] Update auth.js to integrate API calls for register, login, forgot password, reset password, and Pi authentication
- [x] Install Node.js dependencies with npm install
- [x] Test the backend server by running `npm start` or `node server.js`
- [x] Test the frontend forms by opening the HTML files in a browser (ensure CORS is handled for local development)
- [x] Create full dashboard API endpoints in server.js (/api/dashboard/stats, /api/dashboard/orders, /api/dashboard/services, /api/dashboard/notifications, /api/provider/stats, /api/provider/orders, /api/provider/services)
- [x] Fix client sidebar to show text labels and icons like other websites (updated client.html)
- [x] Update CSS to make sidebar wider (250px) and visible by default on desktop with proper mobile responsiveness
- [x] Update js/dashboard.js to fetch data from API instead of using static data

## Remaining Tasks
- [ ] Verify Pi Wallet authentication works (requires Pi Browser or Pi SDK setup)
- [ ] Add error handling and user feedback improvements if needed
- [ ] Consider adding a database (e.g., MongoDB) for persistent storage instead of in-memory

## Notes
- Backend uses in-memory storage for simplicity; replace with a database for production.
- Pi SDK is initialized in sandbox mode; set to production when deploying.
- Ensure the server is running on port 3000 for API calls to work.
- Forgot password currently logs the reset token to console; implement email sending in production.
