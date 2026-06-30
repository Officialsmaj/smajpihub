import { useMemo, useState, type FormEvent } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { isAxiosError } from "axios";
import { axiosClient } from "../../lib/axiosClient";

const categories = [
  ["Getting Started", ["Create account", "Use SMAJ PI HUB", "Explore services", "Profile setup"]],
  ["Marketplace Help", ["Buying", "Selling", "Payments", "Product safety", "Seller guide"]],
  ["Wallet & Payments", ["Connect wallet", "Disconnect wallet", "Transactions", "Payment issues"]],
  ["Account & Security", ["Protect account", "Login problems", "Privacy", "Report suspicious activity"]],
  ["Report Center", ["Report a problem", "Report user", "Report product", "Send feedback"]],
] as const;

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Account support");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => categories.map(([title, items]) => [title, items.filter((item) => item.toLowerCase().includes(search.toLowerCase()))] as const).filter(([, items]) => items.length), [search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(false);
    setError("");
    if (message.trim().length < 10) {
      setError("Please write at least 10 characters so support can understand the issue.");
      return;
    }
    setSubmitting(true);
    try {
      await axiosClient.post("/support", { source: "private-help-center", topic, email: email.trim(), message: message.trim() });
      setSubmitted(true);
      setMessage("");
      setEmail("");
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not submit support request." : "Could not submit support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="private-page help-center-page">
      <section className="help-hero">
        <p className="private-kicker">SMAJ PI HUB SUPPORT</p>
        <h1>How can we help you?</h1>
        <label><SearchOutlinedIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help articles..." /></label>
      </section>

      <section className="help-accordion">
        {filtered.map(([title, items]) => (
          <article key={title}>
            <h2>{title}</h2>
            {items.map((item) => (
              <div key={item}>
                <button type="button" onClick={() => setOpen(open === `${title}-${item}` ? "" : `${title}-${item}`)}>
                  <span>{item}</span>
                  <ExpandMoreOutlinedIcon />
                </button>
                {open === `${title}-${item}` ? <p>Find guidance for {item.toLowerCase()} across SMAJ PI HUB. For account-specific help, send a support message below.</p> : null}
              </div>
            ))}
          </article>
        ))}
      </section>

      <section className="support-form-section">
        <div>
          <p className="private-kicker">CONTACT SUPPORT</p>
          <h2>Send feedback or report an issue</h2>
          <p>Your message is saved to the SMAJ PI HUB support queue with your signed-in account, topic, and timestamp.</p>
        </div>
        <form onSubmit={(event) => void submit(event)}>
          <label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}><option>Account support</option><option>Marketplace</option><option>Wallet and payment</option><option>Safety report</option><option>Feedback</option></select></label>
          <label>Reply email optional<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="info@smajpihub.com" /></label>
          <label>Message<textarea required maxLength={1500} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe what happened, what page you were on, and what you expected." /><small className="form-help">{message.length}/1500 characters</small></label>
          {submitted ? <div className="private-alert success">Support request submitted.</div> : null}
          {error ? <div className="private-alert error">{error}</div> : null}
          <button className="private-primary-button" disabled={submitting}>{submitting ? "Submitting..." : "Submit Message"}</button>
        </form>
      </section>
    </main>
  );
};

export default HelpCenterPage;
