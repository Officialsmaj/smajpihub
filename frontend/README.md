# SMAJ PI HUB Frontend

SMAJ PI HUB is the unified Pi-powered digital platform for real-world utility in the Pi Network ecosystem.

One Pi Login. One Pi Wallet. Multiple Digital Services.

## Metadata

- Website Title: `SMAJ PI HUB | The Unified Pi-Powered Digital Platform`
- Production URL: `https://smajpihub.com`
- Purpose: marketplace, services, opportunities, and digital solutions through one verified Pi identity and one Pi wallet.

## Getting Started

For Docker setup, see the [Docker Setup documentation](../doc/docker-setup.md).

### 1. Install dependencies

```sh
npm install
```

### 2. Set up environment variables

Set `.env.development` with the following variables:

| Variable           | Description           | Example                 |
| ------------------ | --------------------- | ----------------------- |
| `PORT`             | Dev server port       | `3314`                  |
| `VITE_API_BASE_URL` | Backend API URL       | `https://smajpihub.onrender.com` |
| `VITE_BACKEND_URL` | Legacy backend API URL alias | `https://smajpihub.onrender.com` |
| `VITE_SANDBOX_SDK` | Enable Pi Sandbox SDK | `true`                  |

### 3. Start the development server

```sh
npm run dev
```

The app will be available on your configured `PORT`.

## Production Build

```sh
npm run build:public
```

The GitHub Pages workflow deploys `frontend/dist-public` to `https://smajpihub.com`.
