import { Link } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useAuthContext } from "../../contexts/AuthContext";
import TrustBadge from "../../components/TrustBadge";

const accountRows = [
  ["Saved services", "/saved"], ["Set up seller/business profile", "/profile"], ["Seller tools", "/seller"], ["Partner rewards", "/app/services/token"], ["Promotions", "/store"], ["Favorites", "/saved"], ["Manage SMAJ PI HUB Account", "/account/manage"], ["Legal", "/terms"],
] as const;

const AccountDashboardPage = () => { const { user } = useAuthContext(); const name = user?.displayName || user?.username || "Pi User"; return <main className="private-page account-dashboard-page"><section className="account-dashboard-identity"><div className="account-dashboard-avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : name.slice(0,1).toUpperCase()}</div><div><h1>{name}</h1><p>@{user?.piUsername || user?.username}</p><span><StarRoundedIcon /> 4.8</span><TrustBadge level={user?.verificationLevel} /></div></section><section className="account-quick-grid"><Link to="/help"><HelpOutlineOutlinedIcon /><span>Help</span></Link><Link to="/wallet"><AccountBalanceWalletOutlinedIcon /><span>Wallet</span></Link><Link to="/settings"><ShieldOutlinedIcon /><span>Safety</span></Link><Link to="/messages"><InboxOutlinedIcon /><span>Inbox</span></Link></section><section className="account-dashboard-list">{accountRows.map(([label,to]) => <Link to={to} key={label}><span>{label}</span><ChevronRightOutlinedIcon /></Link>)}<div><span>App version</span><small>1.0.0</small></div></section></main>; };
export default AccountDashboardPage;
