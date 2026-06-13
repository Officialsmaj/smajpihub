import { Link } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const content = {
  cart: ["Cart / Order", "SMAJ Store uses direct product orders for the MVP.", ShoppingCartOutlinedIcon],
  checkout: ["Checkout", "Review your order, then continue to the secure Pi payment flow.", ReceiptLongOutlinedIcon],
  "payment-method": ["Payment Method", "Pi Wallet is the live payment method. USDC Wallet is coming soon.", AccountBalanceWalletOutlinedIcon],
} as const;
const CommerceFlowPage = ({ mode }: { mode: keyof typeof content }) => { const [title,description,Icon] = content[mode]; return <main className="private-page"><section className="private-state commerce-flow"><Icon /><p className="private-kicker">SMAJ MARKETPLACE</p><h1>{title}</h1><p>{description}</p><div className="form-actions"><Link className="private-primary-button" to="/orders">Open My Orders</Link><Link className="private-secondary-button" to="/store">Continue Shopping</Link></div></section></main>; };
export default CommerceFlowPage;
