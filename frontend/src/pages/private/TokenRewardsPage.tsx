import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import TollRoundedIcon from "@mui/icons-material/TollRounded";
import { Link } from "react-router-dom";

const TokenRewardsPage = () => (
  <main className="token-rewards-page">
    <header className="token-rewards-header">
      <Link to="/profile" aria-label="Back to profile"><ArrowBackRoundedIcon /></Link>
      <div>
        <span>SMAJ ECOSYSTEM</span>
        <h1>SMAJ Token Rewards</h1>
        <p>Your future home for ecosystem rewards, packages, and gift codes.</p>
      </div>
      <span className="token-rewards-soon">COMING SOON</span>
    </header>
    <section className="token-rewards-summary" aria-label="Reward overview">
      <article><span><TollRoundedIcon /></span><strong>0</strong><small>SMAJ Tokens</small></article>
      <article><span><StarsRoundedIcon /></span><strong>0</strong><small>Reward Points</small></article>
      <article className="token-package-card"><span><CardGiftcardOutlinedIcon /></span><strong>Package</strong><small>Available soon</small><b>SOON</b></article>
    </section>
    <section className="token-redeem-card">
      <span className="token-redeem-icon"><RedeemOutlinedIcon /></span>
      <div><h2>Redeem Gift Code</h2><p>Enter a reward code when SMAJ Token Rewards launches.</p></div>
      <button type="button" disabled>Coming soon</button>
    </section>
    <section className="token-rewards-preview">
      <span>REWARDS PREVIEW</span>
      <h2>More ways to benefit from the SMAJ ecosystem</h2>
      <p>Reward packages, milestones, and redemption options will appear here as they become available.</p>
      <div>
        <article><CardGiftcardOutlinedIcon /><strong>Member packages</strong><small>Unlock future ecosystem benefits.</small></article>
        <article><StarsRoundedIcon /><strong>Activity rewards</strong><small>Earn recognition for eligible activity.</small></article>
      </div>
    </section>
  </main>
);

export default TokenRewardsPage;