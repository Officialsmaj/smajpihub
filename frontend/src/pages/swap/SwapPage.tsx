import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SwapVertOutlinedIcon from "@mui/icons-material/SwapVertOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AppLayout from "../../layouts/AppLayout";
import { formatServicePrice, PI_USDT_RATE } from "../../lib/piPricing";
import "./SwapPage.css";

export type SwapPageKind = "home" | "tokens" | "history" | "pools" | "liquidity" | "confirm" | "receipt";

type Token = {
  symbol: string;
  name: string;
  icon: string;
  priceUsdt: number;
  balance: number;
  color: string;
  verified: boolean;
};
type SwapRecord = {
  id: string;
  from: string;
  to: string;
  fromAmount: number;
  toAmount: number;
  fee: number;
  status: string;
  date: string;
  piRateUsed?: number;
};
type LiquidityRecord = {
  id: string;
  pool: string;
  amountA: number;
  amountB: number;
  status: string;
  date: string;
};

const tokens: Token[] = [
  { symbol: "PI", name: "Pi", icon: "π", priceUsdt: PI_USDT_RATE, balance: 1240.5, color: "#6d3fc0", verified: true },
  { symbol: "SMAJ", name: "SMAJ Token", icon: "S", priceUsdt: 2, balance: 8500, color: "#f2a900", verified: true },
  { symbol: "USDM", name: "USD Mirror", icon: "$", priceUsdt: 1, balance: 382.4, color: "#2a9d68", verified: true },
  { symbol: "AQUA", name: "Aqua Utility", icon: "A", priceUsdt: 0.08, balance: 4200, color: "#238acb", verified: true },
  { symbol: "SOLR", name: "Solar Credit", icon: "☀", priceUsdt: 10, balance: 690, color: "#e8852e", verified: true },
];
const pools = [
  { pair: "PI / SMAJ", tokenA: "PI", tokenB: "SMAJ", liquidity: 482000, apr: 18.4, volume: 68420 },
  { pair: "PI / USDM", tokenA: "PI", tokenB: "USDM", liquidity: 295400, apr: 11.7, volume: 42350 },
  { pair: "SMAJ / USDM", tokenA: "SMAJ", tokenB: "USDM", liquidity: 128900, apr: 24.2, volume: 21780 },
  { pair: "PI / SOLR", tokenA: "PI", tokenB: "SOLR", liquidity: 74200, apr: 15.9, volume: 8930 },
];
const SWAPS = "smaj_swap_history";
const LIQUIDITY = "smaj_swap_liquidity";
const readSwaps = () => {
  try {
    return JSON.parse(localStorage.getItem(SWAPS) || "[]") as SwapRecord[];
  } catch {
    return [];
  }
};
const readLiquidity = () => {
  try {
    return JSON.parse(localStorage.getItem(LIQUIDITY) || "[]") as LiquidityRecord[];
  } catch {
    return [];
  }
};

const SwapHeader = () => (
  <header className="swap-header">
    <Link className="swap-back" to="/app/services">
      ← Hub
    </Link>
    <Link className="swap-brand" to="/services/swap">
      <SwapVertOutlinedIcon /> SMAJ Swap
    </Link>
    <nav>
      <NavLink end to="/services/swap">
        Swap
      </NavLink>
      <NavLink to="/services/swap/pools">Pools</NavLink>
      <NavLink to="/services/swap/tokens">Tokens</NavLink>
      <NavLink to="/services/swap/history">Activity</NavLink>
    </nav>
    <Link className="swap-wallet" to="/services/swap/history">
      <AccountBalanceWalletOutlinedIcon /> π 1,240.50
    </Link>
  </header>
);

const TokenBadge = ({ token }: { token: Token }) => (
  <span className="swap-token-badge" style={{ "--token-color": token.color } as React.CSSProperties}>
    <i>{token.icon}</i>
    <b>{token.symbol}</b>
  </span>
);

const SwapBox = () => {
  const navigate = useNavigate();
  const [fromSymbol, setFromSymbol] = useState("PI");
  const [toSymbol, setToSymbol] = useState("SMAJ");
  const [amount, setAmount] = useState("100");
  const [slippage, setSlippage] = useState(0.5);
  const from = tokens.find(token => token.symbol === fromSymbol) ?? tokens[0];
  const to = tokens.find(token => token.symbol === toSymbol) ?? tokens[1];
  const numericAmount = Math.max(0, Number(amount) || 0);
  const output = (numericAmount * from.priceUsdt) / to.priceUsdt;
  const fee = numericAmount * 0.003;
  const switchTokens = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  };
  const review = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!numericAmount || numericAmount > from.balance || fromSymbol === toSymbol) return;
    const query = new URLSearchParams({
      from: fromSymbol,
      to: toSymbol,
      amount: String(numericAmount),
      output: output.toFixed(6),
      fee: fee.toFixed(6),
      slippage: String(slippage),
    });
    navigate(`/services/swap/confirm?${query}`);
  };
  const invalid = fromSymbol === toSymbol || numericAmount <= 0 || numericAmount > from.balance;
  return (
    <form className="swap-box" onSubmit={review}>
      <div className="swap-box-title">
        <div>
          <small>SWAP TOKENS</small>
          <h1>Trade instantly</h1>
        </div>
        <button type="button" className="swap-settings" onClick={() => setSlippage(value => (value === 0.5 ? 1 : 0.5))}>
          ⚙ {slippage}%
        </button>
      </div>
      <label className="swap-input-card">
        <span>
          You pay{" "}
          <small>
            Balance {from.balance.toLocaleString()} {from.symbol}
          </small>
        </span>
        <div>
          <input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} />
          <select value={fromSymbol} onChange={event => setFromSymbol(event.target.value)}>
            {tokens.map(token => (
              <option key={token.symbol}>{token.symbol}</option>
            ))}
          </select>
        </div>
        <small>≈ ${(numericAmount * from.priceUsdt).toLocaleString()} USDT</small>
      </label>
      <button type="button" className="swap-switch" onClick={switchTokens}>
        <SwapVertOutlinedIcon />
      </button>
      <label className="swap-input-card">
        <span>
          You receive{" "}
          <small>
            Balance {to.balance.toLocaleString()} {to.symbol}
          </small>
        </span>
        <div>
          <input value={output ? output.toFixed(4) : "0"} readOnly />
          <select value={toSymbol} onChange={event => setToSymbol(event.target.value)}>
            {tokens.map(token => (
              <option key={token.symbol}>{token.symbol}</option>
            ))}
          </select>
        </div>
        <small>Simulated quote · price impact 0.12%</small>
      </label>
      <div className="swap-details">
        <p>
          <span>Rate</span>
          <strong>
            1 {from.symbol} = {(from.priceUsdt / to.priceUsdt).toFixed(4)} {to.symbol}
          </strong>
        </p>
        <p>
          <span>Network fee</span>
          <strong>
            {fee.toFixed(4)} {from.symbol}
          </strong>
        </p>
        <p>
          <span>Minimum received</span>
          <strong>
            {(output * (1 - slippage / 100)).toFixed(4)} {to.symbol}
          </strong>
        </p>
      </div>
      {numericAmount > from.balance && <p className="swap-error">Insufficient {from.symbol} balance.</p>}
      {fromSymbol === toSymbol && <p className="swap-error">Choose two different tokens.</p>}
      <button className="swap-primary" disabled={invalid}>
        Review swap
      </button>
      <p className="swap-demo">
        <InfoOutlinedIcon /> Demonstration only. Rates and balances are simulated; no real assets are exchanged.
      </p>
    </form>
  );
};

const Empty = ({ title, text }: { title: string; text: string }) => (
  <div className="swap-empty">
    <HistoryOutlinedIcon />
    <h2>{title}</h2>
    <p>{text}</p>
    <Link to="/services/swap">Start a swap</Link>
  </div>
);

const SwapPage = ({ kind = "home" }: { kind?: SwapPageKind }) => {
  const { id } = useParams();
  const [notice, setNotice] = useState("");
  const swaps = useMemo(() => readSwaps(), [kind]);
  const positions = useMemo(() => readLiquidity(), [kind]);

  let content;
  if (kind === "home") {
    content = (
      <main className="swap-home">
        <section className="swap-intro">
          <small>DECENTRALIZED EXCHANGE EXPERIENCE</small>
          <h1>Move value across the SMAJ ecosystem.</h1>
          <p>
            Convert real-world token values using the fixed SMAJ ecosystem reference rate:
            1 Pi = 314,159 USDT.
          </p>
          <div className="swap-trust">
            <span>
              <LockOutlinedIcon /> Self-custody design
            </span>
            <span>
              <VerifiedOutlinedIcon /> Verified assets
            </span>
            <span>
              <InfoOutlinedIcon /> Clear fee preview
            </span>
          </div>
        </section>
        <SwapBox />
      </main>
    );
  } else if (kind === "tokens") {
    content = (
      <main className="swap-inner">
        <div className="swap-heading">
          <div>
            <small>SUPPORTED ASSETS</small>
            <h1>Token directory</h1>
          <p>Verified assets use USDT reference prices, with Pi fixed at 314,159 USDT.</p>
          </div>
        </div>
        <div className="swap-table swap-token-table">
          <div className="swap-table-head">
            <span>Asset</span>
            <span>Simulated price</span>
            <span>Wallet balance</span>
            <span>Status</span>
          </div>
          {tokens.map(token => (
            <article key={token.symbol}>
              <span>
                <TokenBadge token={token} />
                <small>{token.name}</small>
              </span>
              <strong>{token.symbol === "PI" ? formatServicePrice(PI_USDT_RATE) : `$${token.priceUsdt.toLocaleString()} USDT`}</strong>
              <strong>
                {token.balance.toLocaleString()} {token.symbol}
              </strong>
              <span className="swap-verified">
                <VerifiedOutlinedIcon /> Verified
              </span>
            </article>
          ))}
        </div>
        <section className="swap-warning">
          <InfoOutlinedIcon />
          <div>
            <strong>Always verify a token before interacting.</strong>
            <p>
              Names and symbols can be copied. Check the verified asset record and never approve an unfamiliar
              transaction.
            </p>
          </div>
        </section>
      </main>
    );
  } else if (kind === "pools") {
    content = (
      <main className="swap-inner">
        <div className="swap-heading">
          <div>
            <small>LIQUIDITY MARKETPLACE</small>
            <h1>Explore liquidity pools</h1>
            <p>Compare simulated pool depth, volume, and estimated annual rewards.</p>
          </div>
          <Link to="/services/swap/liquidity">Manage liquidity</Link>
        </div>
        <div className="swap-pools">
          {pools.map(pool => (
            <article key={pool.pair}>
              <div className="swap-pair">
                <TokenBadge token={tokens.find(token => token.symbol === pool.tokenA)!} />
                <TokenBadge token={tokens.find(token => token.symbol === pool.tokenB)!} />
              </div>
              <h2>{pool.pair}</h2>
              <dl>
                <div>
                  <dt>Total liquidity</dt>
                  <dd>{formatServicePrice(pool.liquidity)}</dd>
                </div>
                <div>
                  <dt>24h volume</dt>
                  <dd>{formatServicePrice(pool.volume)}</dd>
                </div>
                <div>
                  <dt>Estimated APR</dt>
                  <dd>{pool.apr}%</dd>
                </div>
              </dl>
              <Link to={`/services/swap/liquidity?pool=${encodeURIComponent(pool.pair)}`}>Add liquidity</Link>
            </article>
          ))}
        </div>
        <p className="swap-risk">
          <InfoOutlinedIcon /> Liquidity provision can result in impermanent loss. Values shown are simulated and are
          not financial projections.
        </p>
      </main>
    );
  } else if (kind === "liquidity") {
    const manage = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const record: LiquidityRecord = {
        id: `LP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        pool: String(form.get("pool")),
        amountA: Number(form.get("amountA")),
        amountB: Number(form.get("amountB")),
        status: String(form.get("action")),
        date: new Date().toLocaleString(),
      };
      localStorage.setItem(LIQUIDITY, JSON.stringify([record, ...readLiquidity()]));
      setNotice(`${record.status} liquidity request completed in demo mode.`);
      event.currentTarget.reset();
    };
    content = (
      <main className="swap-inner">
        <div className="swap-heading">
          <div>
            <small>YOUR POSITIONS</small>
            <h1>Manage liquidity</h1>
            <p>Add balanced assets to a pool or simulate removing your position.</p>
          </div>
        </div>
        <div className="swap-two">
          <form className="swap-form" onSubmit={manage}>
            <h2>Liquidity request</h2>
            <label>
              Pool
              <select name="pool">
                {pools.map(pool => (
                  <option key={pool.pair}>{pool.pair}</option>
                ))}
              </select>
            </label>
            <label>
              First token amount
              <input name="amountA" type="number" min=".01" step=".01" required />
            </label>
            <label>
              Second token amount
              <input name="amountB" type="number" min=".01" step=".01" required />
            </label>
            <label>
              Action
              <select name="action">
                <option>Add</option>
                <option>Remove</option>
              </select>
            </label>
            <button>Review liquidity request</button>
            {notice && <p className="swap-success">{notice}</p>}
            <small>Demo only. No on-chain transaction occurs.</small>
          </form>
          <section>
            <h2>Recent positions</h2>
            {positions.length ? (
              <div className="swap-activity">
                {positions.map(item => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.pool}</strong>
                      <small>{item.date}</small>
                    </div>
                    <span>
                      {item.status} · {item.amountA} + {item.amountB}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <Empty title="No liquidity positions" text="Your simulated pool activity will appear here." />
            )}
          </section>
        </div>
      </main>
    );
  } else if (kind === "confirm") {
    content = <ConfirmSwap />;
  } else if (kind === "history") {
    content = (
      <main className="swap-inner">
        <div className="swap-heading">
          <div>
            <small>WALLET ACTIVITY</small>
            <h1>Swap history</h1>
            <p>Review transaction status and open detailed receipts.</p>
          </div>
        </div>
        {swaps.length ? (
          <div className="swap-activity">
            {swaps.map(item => (
              <Link to={`/services/swap/receipt/${item.id}`} key={item.id}>
                <div className="swap-activity-icons">
                  <TokenBadge token={tokens.find(token => token.symbol === item.from)!} />
                  <SwapVertOutlinedIcon />
                  <TokenBadge token={tokens.find(token => token.symbol === item.to)!} />
                </div>
                <div>
                  <strong>
                    {item.fromAmount} {item.from} → {item.toAmount.toFixed(4)} {item.to}
                  </strong>
                  <small>
                    {item.date} · {item.id}
                  </small>
                </div>
                <span className={item.status === "Completed" ? "complete" : "failed"}>{item.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="No swaps yet" text="Completed and failed demo swaps will appear here." />
        )}
      </main>
    );
  } else if (kind === "receipt") {
    const swap = swaps.find(item => item.id === id);
    content = swap ? (
      <main className="swap-receipt">
        <section>
          <div className={`swap-status ${swap.status.toLowerCase()}`}>{swap.status === "Completed" ? "✓" : "!"}</div>
          <small>TRANSACTION RECEIPT</small>
          <h1>{swap.status === "Completed" ? "Swap completed" : "Swap failed"}</h1>
          <p>
            {swap.status === "Completed"
              ? "Your simulated exchange was recorded successfully."
              : "The simulated transaction could not be completed."}
          </p>
          <dl>
            <div>
              <dt>Transaction</dt>
              <dd>{swap.id}</dd>
            </div>
            <div>
              <dt>You paid</dt>
              <dd>
                {swap.fromAmount} {swap.from}
              </dd>
            </div>
            <div>
              <dt>You received</dt>
              <dd>
                {swap.toAmount.toFixed(4)} {swap.to}
              </dd>
            </div>
            <div>
              <dt>Fee</dt>
              <dd>
                {swap.fee.toFixed(4)} {swap.from}
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{swap.date}</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>SMAJ Demo Network</dd>
            </div>
          </dl>
          <Link to="/services/swap">Make another swap</Link>
        </section>
      </main>
    ) : (
      <Empty title="Receipt not found" text="Open your activity to find a recorded swap." />
    );
  } else {
    content = <Empty title="Swap page not found" text="Return to the swap interface to continue." />;
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <div className="swap-page">
        <SwapHeader />
        {content}
        <footer className="swap-footer">
          <strong>SMAJ Swap</strong>
          <span>Transparent simulated exchange experience.</span>
          <div>
            <Link to="/services/swap/tokens">Tokens</Link>
            <Link to="/services/swap/pools">Pools</Link>
            <Link to="/services/swap/history">Activity</Link>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
};

const ConfirmSwap = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "PI";
  const to = params.get("to") || "SMAJ";
  const fromAmount = Number(params.get("amount") || 0);
  const toAmount = Number(params.get("output") || 0);
  const fee = Number(params.get("fee") || 0);
  const slippage = Number(params.get("slippage") || 0.5);
  const [submitting, setSubmitting] = useState(false);
  const submit = () => {
    setSubmitting(true);
    const record: SwapRecord = {
      id: `SWP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      from,
      to,
      fromAmount,
      toAmount,
      fee,
      status: "Completed",
      date: new Date().toLocaleString(),
      piRateUsed: PI_USDT_RATE,
    };
    localStorage.setItem(SWAPS, JSON.stringify([record, ...readSwaps()]));
    navigate(`/services/swap/receipt/${record.id}`);
  };
  return (
    <main className="swap-confirm">
      <section>
        <small>REVIEW TRANSACTION</small>
        <h1>Confirm your swap</h1>
        <div className="swap-confirm-flow">
          <div>
            <span>You pay</span>
            <strong>
              {fromAmount.toLocaleString()} {from}
            </strong>
          </div>
          <SwapVertOutlinedIcon />
          <div>
            <span>You receive</span>
            <strong>
              {toAmount.toFixed(4)} {to}
            </strong>
          </div>
        </div>
        <dl>
          <div>
            <dt>Network fee</dt>
            <dd>
              {fee.toFixed(4)} {from}
            </dd>
          </div>
          <div>
            <dt>Maximum slippage</dt>
            <dd>{slippage}%</dd>
          </div>
          <div>
            <dt>Price impact</dt>
            <dd>0.12%</dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>
              {from} → {to}
            </dd>
          </div>
        </dl>
        <div className="swap-confirm-note">
          <LockOutlinedIcon />
          <p>
            <strong>Final confirmation</strong>
            <br />
            This is a frontend demonstration. Confirming records a simulated transaction only.
          </p>
        </div>
        <button disabled={!fromAmount || submitting} onClick={submit}>
          {submitting ? "Confirming..." : "Confirm simulated swap"}
        </button>
        <Link to="/services/swap">Cancel</Link>
      </section>
    </main>
  );
};

export default SwapPage;
