// ===== Products =====
const products = [];
const categories = ['electronics', 'fashion', 'cars', 'airplanes', 'home-decor', 'houses', 'lands'];

// Generate 200 products dynamically
for (let i = 1; i <= 200; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const priceUSD = (Math.random() * 20 + 10).toFixed(2); // $10-$30
  const pricePi = (priceUSD / 314159).toFixed(8);
  products.push({
    id: i,
    name: `Product ${i}`,
    description: `High quality ${category} product #${i}. Excellent performance and design.`,
    image: `../../assets/images/services/web.jpg`,
    category: category,
    priceUSD,
    pricePi,
    rating: Math.floor(Math.random() * 5) + 1
  });
}

// ===== Render Products =====
const productGrid = document.getElementById('productGrid');
function renderProducts(filter = 'all') {
  productGrid.innerHTML = '';
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <p class="price">${p.pricePi} π / ${p.priceUSD} $</p>
      <button class="btn primary" onclick="openBuyModal(${p.id})">Buy Now</button>
      <button class="btn secondary" onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
}
renderProducts();

// ===== Filters =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const category = btn.dataset.category;
    renderProducts(category);
  });
});

// ===== Cart System =====
let cart = [];
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

document.getElementById('openCartBtn').addEventListener('click', () => cartSidebar.classList.add('active'));
document.getElementById('closeCart').addEventListener('click', () => cartSidebar.classList.remove('active'));

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  const exist = cart.find(p => p.id === id);
  if (exist) exist.quantity++;
  else cart.push({ ...prod, quantity: 1 });
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = '';
  let totalPi = 0, totalUSD = 0;
  cart.forEach(p => {
    totalPi += p.pricePi * p.quantity;
    totalUSD += p.priceUSD * p.quantity;
    const li = document.createElement('li');
    li.innerHTML = `${p.name} x ${p.quantity} - ${(p.pricePi * p.quantity).toFixed(8)} π / ${(p.priceUSD * p.quantity).toFixed(2)} $ 
    <button onclick="removeFromCart(${p.id})" class="btn secondary">Remove</button>`;
    cartItems.appendChild(li);
  });
  cartTotal.textContent = `${totalPi.toFixed(8)} π / ${totalUSD.toFixed(2)} $`;
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  updateCart();
}

// ===== Buy Modal =====
const buyModal = document.getElementById('buyModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalDescription = document.getElementById('modalDescription');
const modalPricePi = document.getElementById('modalPricePi');
const modalPriceUSD = document.getElementById('modalPriceUSD');
const modalQuantity = document.getElementById('modalQuantity');
const modalAddCart = document.getElementById('modalAddCart');
const modalBuyNow = document.getElementById('modalBuyNow');
let currentProduct = null;

function openBuyModal(id) {
  currentProduct = products.find(p => p.id === id);
  modalImage.src = currentProduct.image;
  modalName.textContent = currentProduct.name;
  modalDescription.textContent = currentProduct.description;
  modalPricePi.textContent = currentProduct.pricePi;
  modalPriceUSD.textContent = currentProduct.priceUSD;
  modalQuantity.value = 1;
  buyModal.style.display = 'block';
}

document.getElementById('closeModal').addEventListener('click', () => buyModal.style.display = 'none');

modalAddCart.addEventListener('click', () => {
  if (currentProduct) {
    const qty = parseInt(modalQuantity.value);
    const exist = cart.find(p => p.id === currentProduct.id);
    if (exist) exist.quantity += qty;
    else cart.push({ ...currentProduct, quantity: qty });
    updateCart();
    buyModal.style.display = 'none';
  }
});

modalBuyNow.addEventListener('click', () => {
  alert(`Purchase successful!\n${currentProduct.name} x ${modalQuantity.value}\nTotal: ${(currentProduct.pricePi * modalQuantity.value).toFixed(8)} π / ${(currentProduct.priceUSD * modalQuantity.value).toFixed(2)} $`);
  buyModal.style.display = 'none';
});

