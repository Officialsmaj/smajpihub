# SMAJ PI HUB

## Overview

SMAJ PI HUB is a comprehensive web platform built for the Pi Network ecosystem. It provides a suite of digital services including e-commerce, freelance jobs, telemedicine, online education, and more—all powered by Pi Coin. The platform emphasizes real utility for Pi, enabling users to connect, buy, sell, work, and learn using Pi Coin worldwide.

## Features

### Core Services
- **SMAJ STORE**: Pi-based e-commerce marketplace
- **SMAJ FOOD DELIVERY**: Food ordering aggregator (Coming Soon)
- **SMAJ PI JOBS**: Freelance and gig platform (Coming Soon)
- **SMAJ PI HEALTH**: Telemedicine services (Coming Soon)
- **SMAJ PI EDU**: Online courses and education (Coming Soon)

### Platform Features
- **Pi-Only Payments**: All transactions use Pi Coin with secure escrow
- **Verified Providers**: Service providers build trust through ratings and delivery history
- **Secure Escrow**: Funds are held safely until work is completed and approved
- **Wallet Integration**: Seamless Pi Wallet connection for payments
- **Dashboard**: Separate dashboards for clients and service providers
- **Marketplace**: Browse and purchase services
- **Affiliate Program**: Earn Pi through referrals
- **Community**: Connect with other Pi Network users

### Additional Features
- Responsive design for mobile and desktop
- Multi-language support
- Real-time notifications
- Order tracking and management
- Service ratings and reviews
- Help center and FAQ
- Blog and portfolio showcase

## Tech Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **Boxicons**: Icon library for consistent UI elements

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Integrations
- **Pi Network SDK**: Official Pi Wallet integration
- **Pi Browser API**: Enhanced Pi ecosystem features

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Pi Browser or Pi Network app for wallet features

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smaj-pi-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`

### Frontend Setup
1. Open the project directory in your code editor
2. Serve the static files using any HTTP server (e.g., Live Server extension in VS Code)
3. Open `index.html` in your browser

### Pi Network Integration
1. Install the Pi Browser or use the Pi Network mobile app
2. The platform automatically detects Pi Wallet availability
3. For development, the Pi SDK runs in sandbox mode

## Usage

### For Users
1. **Browse Services**: Visit the homepage to explore available services
2. **Connect Wallet**: Click "Connect Pi" to link your Pi Wallet
3. **Place Orders**: Select services and pay with Pi Coin
4. **Track Orders**: Use the dashboard to monitor order status
5. **Rate Services**: Leave reviews after order completion

### For Service Providers
1. **Register**: Create a provider account
2. **List Services**: Add your services to the marketplace
3. **Manage Orders**: Track and fulfill customer orders
4. **Receive Payments**: Get paid in Pi Coin automatically

### Authentication
- Register with email or Pi Wallet
- Secure login with JWT tokens
- Password reset functionality
- Pi Wallet authentication for seamless access

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Dashboard (Client)
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/orders` - Get user orders
- `GET /api/dashboard/services` - Get recommended services
- `GET /api/dashboard/notifications` - Get user notifications

### Dashboard (Provider)
- `GET /api/provider/stats` - Get provider statistics
- `GET /api/provider/orders` - Get provider orders
- `GET /api/provider/services` - Get provider services

## Project Structure

```
smaj-pi-hub/
├── index.html                 # Landing page
├── package.json               # Node.js dependencies
├── server.js                  # Express server
├── README.md                  # Project documentation
├── TODO.md                    # Development tasks
├── assets/
│   └── images/                # Static images
├── css/
│   ├── style.css              # Main styles
│   ├── responsive.css         # Mobile responsiveness
│   └── [other].css            # Page-specific styles
├── js/
│   ├── main.js                # Main JavaScript
│   ├── auth.js                # Authentication logic
│   ├── dashboard.js           # Dashboard functionality
│   └── [other].js             # Page-specific scripts
└── pages/
    ├── about.html
    ├── service.html
    ├── contact.html
    ├── auth/
    │   ├── login.html
    │   ├── register.html
    │   └── [other].html
    ├── dashboard/
    │   ├── client.html
    │   ├── provider.html
    │   └── settings.html
    └── [other]/
```

## Contributing

We welcome contributions to SMAJ PI HUB! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and structure
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design works on all devices
- Maintain Pi Network integration standards

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions, support, or collaboration opportunities:
- Website: [SMAJ PI HUB](https://smaj.store)
- Email: [contact@smajpihub.com](mailto:contact@smajpihub.com)
- Social Media: Follow us on Telegram, Twitter, and other platforms

## Disclaimer

SMAJ PI HUB is not affiliated with the official Pi Network. This is a third-party platform built to enhance the Pi ecosystem. Always verify transactions and use official Pi Network tools for wallet management.
