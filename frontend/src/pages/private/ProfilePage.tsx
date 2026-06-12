import { useState, type FormEvent } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

const ProfilePage = () => {
  const { user, updateProfile } = useAuthContext();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || "");
  const [country, setCountry] = useState(user?.country || "");
  const [role, setRole] = useState<"buyer" | "seller">(user?.role || "buyer");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({ displayName, country, role });
      setMessage("Profile saved.");
    } catch {
      setMessage("Could not save profile.");
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">ACCOUNT</p><h1>Profile</h1><p>Your Pi identity and SMAJ Store role.</p></div></section>
      <form className="private-form" onSubmit={(event) => void submit(event)}>
        <div className="profile-readonly"><span>Pi username</span><strong>@{user?.piUsername || user?.username}</strong></div>
        <div className="profile-readonly"><span>Pi UID</span><strong>{user?.uid}</strong></div>
        <label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
        <label>Country<input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Your country" /></label>
        <label>Account role<select value={role} onChange={(event) => setRole(event.target.value as "buyer" | "seller")}><option value="buyer">Buyer</option><option value="seller">Seller</option></select></label>
        <p className="form-help">Seller accounts can publish products. Both roles can browse and manage their orders.</p>
        {message ? <div className="private-alert">{message}</div> : null}
        <button className="private-primary-button">Save Profile</button>
      </form>
    </main>
  );
};

export default ProfilePage;
