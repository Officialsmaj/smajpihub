import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { useAuthContext } from "../../contexts/AuthContext";

const initialForm = { title: "", image: "", pricePi: "", description: "", category: "", location: "", sellerContact: "" };

const AddProductPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.role !== "seller") {
    return <main className="private-page"><section className="private-state"><h1>Seller role required</h1><p>Switch your account role to seller before adding a product.</p><Link className="private-primary-button" to="/app/profile">Open Profile</Link></section></main>;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data } = await axiosClient.post("/marketplace/products", { ...form, pricePi: Number(form.pricePi) });
      navigate(`/app/store/${data.product._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">SELLER TOOLS</p><h1>Add Product</h1><p>Create a simple product listing priced in Pi.</p></div></section>
      <form className="private-form" onSubmit={(event) => void submit(event)}>
        <label>Product title<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Product image URL<input type="url" placeholder="https://..." value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
        <div className="private-form-row">
          <label>Price in Pi<input required type="number" min="0.01" step="0.01" value={form.pricePi} onChange={(event) => setForm({ ...form, pricePi: event.target.value })} /></label>
          <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
        </div>
        <label>Description<textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <div className="private-form-row">
          <label>Location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
          <label>Seller contact<input required placeholder="Email, phone, or Pi username" value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label>
        </div>
        {error ? <div className="private-alert error">{error}</div> : null}
        <button className="private-primary-button" disabled={submitting}>{submitting ? "Publishing..." : "Publish Product"}</button>
      </form>
    </main>
  );
};

export default AddProductPage;
