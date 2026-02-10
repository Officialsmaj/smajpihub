const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // In production, use env variable

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// In-memory user storage (replace with DB in production)
let users = [];
let resetTokens = {};

// Helper function to find user by email or username
function findUser(identifier) {
  return users.find(user => user.email === identifier || user.username === identifier);
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (findUser(email) || findUser(username)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, fullName, email, username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  const user = findUser(identifier);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, fullName: user.fullName } });
});

// Forgot password endpoint
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.json({ message: 'If an account exists, a reset link has been sent' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
  resetTokens[token] = user.id;

  // In production, send email with token
  console.log(`Reset token for ${email}: ${token}`);

  res.json({ message: 'If an account exists, a reset link has been sent' });
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!resetTokens[token]) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const userId = resetTokens[token];
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  delete resetTokens[token];

  res.json({ message: 'Password reset successful' });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// In-memory data for dashboard (replace with DB in production)
let orders = [
  { id: 1, date: '2025-12-24', service: 'Website Development', amount: 0.0000001, usdAmount: 10, status: 'pending', userId: 1 },
  { id: 2, date: '2025-12-23', service: 'Logo Design', amount: 0.0000002, usdAmount: 20, status: 'completed', userId: 1 }
];

let services = [
  { id: 1, name: 'Website Development', category: 'Web', price: 0.00001, status: 'active', userId: 1 },
  { id: 2, name: 'Logo Design', category: 'Design', price: 0.000005, status: 'active', userId: 1 }
];

let notifications = [
  { id: 1, message: 'Your order #123 has been delivered.', userId: 1 },
  { id: 2, message: 'New service "Crypto Training" added.', userId: 1 },
  { id: 3, message: 'Wallet connected successfully.', userId: 1 }
];

let userProfiles = {};
let userSettings = {};
let transactions = [
  { id: 1, date: '2025-12-24', type: 'Deposit', amount: 0, status: 'Pending', userId: 1 }
];
let recommendedServices = [
  { id: 1, name: 'Website Development', category: 'Web', price: 0.0000001, usdPrice: 10, image: '../../assets/images/logo.png' },
  { id: 2, name: 'Logo & Graphic Design', category: 'Design', price: 0.0000002, usdPrice: 20, image: '../../assets/images/logo.png' },
  { id: 3, name: 'Crypto Training', category: 'Education', price: 0.0000001, usdPrice: 10, image: '../../assets/images/logo.png' },
  { id: 4, name: 'Digital Marketing', category: 'Marketing', price: 0.0000002, usdPrice: 20, image: '../../assets/images/logo.png' }
];

// Initialize for existing user
userProfiles[1] = { name: 'John Doe', username: 'johndoe', email: 'john@example.com', socialMedia: { facebook: '', twitter: '', instagram: '', telegram: '', linkedin: '' } };
userSettings[1] = { twoFA: false, securityAlerts: false, emailNotif: true, smsNotif: false, inAppNotif: true, language: 'English', darkMode: false, timezone: 'UTC+0', currency: 'π' };

// Dashboard API endpoints
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(o => o.userId === userId);
  const piBalance = 0.0000001; // Mock balance
  const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
  const completedOrders = userOrders.filter(o => o.status === 'completed').length;

  res.json({
    piBalance,
    pendingOrders,
    completedOrders
  });
});

app.get('/api/dashboard/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

app.get('/api/dashboard/services', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userServices = services.filter(s => s.userId === userId);
  res.json(userServices);
});

app.get('/api/dashboard/notifications', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

// Provider dashboard endpoints
app.get('/api/provider/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userServices = services.filter(s => s.userId === userId);
  const userOrders = orders.filter(o => o.userId === userId);
  const totalServices = userServices.length;
  const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
  const completedOrders = userOrders.filter(o => o.status === 'completed').length;
  const totalEarnings = userOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);

  res.json({
    totalServices,
    pendingOrders,
    completedOrders,
    totalEarnings
  });
});

app.get('/api/provider/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

app.get('/api/provider/services', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userServices = services.filter(s => s.userId === userId);
  res.json(userServices);
});

// Client dashboard additional endpoints
app.post('/api/dashboard/orders', authenticateToken, (req, res) => {
  const { serviceId } = req.body;
  const userId = req.user.id;
  const service = recommendedServices.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const newOrder = {
    id: orders.length + 1,
    date: new Date().toISOString().split('T')[0],
    service: service.name,
    amount: service.price,
    usdAmount: service.usdPrice,
    status: 'pending',
    userId
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/dashboard/orders/:id/cancel', authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user.id;
  const order = orders.find(o => o.id === orderId && o.userId === userId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Can only cancel pending orders' });

  order.status = 'canceled';
  res.json(order);
});

app.get('/api/dashboard/recommended-services', (req, res) => {
  res.json(recommendedServices);
});

// Provider dashboard additional endpoints
app.post('/api/provider/services', authenticateToken, (req, res) => {
  const { name, category, price } = req.body;
  const userId = req.user.id;
  const newService = {
    id: services.length + 1,
    name,
    category,
    price: parseFloat(price),
    status: 'active',
    userId
  };
  services.push(newService);
  res.status(201).json(newService);
});

app.put('/api/provider/services/:id', authenticateToken, (req, res) => {
  const serviceId = parseInt(req.params.id);
  const { name, category, price } = req.body;
  const userId = req.user.id;
  const service = services.find(s => s.id === serviceId && s.userId === userId);
  if (!service) return res.status(404).json({ message: 'Service not found' });

  service.name = name;
  service.category = category;
  service.price = parseFloat(price);
  res.json(service);
});

app.delete('/api/provider/services/:id', authenticateToken, (req, res) => {
  const serviceId = parseInt(req.params.id);
  const userId = req.user.id;
  const index = services.findIndex(s => s.id === serviceId && s.userId === userId);
  if (index === -1) return res.status(404).json({ message: 'Service not found' });

  services.splice(index, 1);
  res.json({ message: 'Service deleted' });
});

app.put('/api/provider/orders/:id/complete', authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user.id;
  const order = orders.find(o => o.id === orderId && o.userId === userId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Can only complete pending orders' });

  order.status = 'completed';
  res.json(order);
});

// Settings endpoints
app.get('/api/settings/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const profile = userProfiles[userId] || {};
  res.json(profile);
});

app.put('/api/settings/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { name, username, email, socialMedia } = req.body;
  userProfiles[userId] = { name, username, email, socialMedia };
  res.json({ message: 'Profile updated' });
});

app.post('/api/settings/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  const user = users.find(u => u.id === userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password changed successfully' });
});

app.get('/api/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const settings = userSettings[userId] || {};
  res.json(settings);
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const updates = req.body;
  userSettings[userId] = { ...userSettings[userId], ...updates };
  res.json({ message: 'Settings updated' });
});

// Wallet endpoints
app.get('/api/wallet/balance', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const balance = 0.0000001; // Mock balance
  res.json({ balance });
});

app.post('/api/wallet/connect', authenticateToken, (req, res) => {
  // Mock wallet connection
  res.json({ message: 'Wallet connected successfully' });
});

app.post('/api/wallet/disconnect', authenticateToken, (req, res) => {
  // Mock wallet disconnection
  res.json({ message: 'Wallet disconnected successfully' });
});

app.get('/api/wallet/transactions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userTransactions = transactions.filter(t => t.userId === userId);
  res.json(userTransactions);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
