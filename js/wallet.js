// Placeholder balances
let piBalance = 0.0000001;
let pendingBalance = 0;
let totalEarned = 0;

// Update balances dynamically
document.getElementById("pi-balance").innerText = piBalance + " π";
document.getElementById("pending-balance").innerText = pendingBalance + " π";
document.getElementById("earned-balance").innerText = totalEarned + " π";

// Transaction list placeholder
const transactions = [
  { date: '2025-12-24', type: 'Send', amount: 0.00000005, status: 'Completed' },
  { date: '2025-12-23', type: 'Receive', amount: 0.00000008, status: 'Pending' }
];

const tbody = document.getElementById("transaction-list");
tbody.innerHTML = "";

transactions.forEach(tx => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${tx.date}</td>
    <td>${tx.type}</td>
    <td>${tx.amount} π</td>
    <td style="color:${tx.status === 'Completed' ? '#4caf50' : tx.status === 'Pending' ? '#ff9800' : '#f44336'}">${tx.status}</td>
  `;
  tbody.appendChild(tr);
});

// Button actions (placeholder)
document.getElementById("send-btn").addEventListener("click", () => {
  alert("Send Pi modal will open (API integration needed)");
});

document.getElementById("receive-btn").addEventListener("click", () => {
  alert("Receive Pi modal will open (API integration needed)");
});

document.getElementById("deposit-btn").addEventListener("click", () => {
  alert("Deposit Pi modal will open (API integration needed)");
});

document.getElementById("withdraw-btn").addEventListener("click", () => {
  alert("Withdraw Pi modal will open (API integration needed)");
});
