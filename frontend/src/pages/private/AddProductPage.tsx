import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { isAxiosError } from "axios";

const initialForm = { title: "", image: "", images: [] as string[], pricePi: "", description: "", category: "Electronics", location: "", sellerContact: "" };

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const selectImages = (files?: FileList | null) => {
    setError("");
    const selected = Array.from(files || []).slice(0, 5);
    if (!selected.length) return;
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)) return setError("Choose up to five images, each 2 MB or smaller.");
    Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = reject; reader.readAsDataURL(file); }))).then((images) => setForm((current) => ({ ...current, image: images[0], images }))).catch(() => setError("Could not read the selected images."));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const pricePi = Number(form.pricePi);
    if (form.title.trim().length < 3) return setError("Product title must be at least 3 characters.");
    if (!form.image) return setError("Choose a product image before publishing.");
    if (!Number.isFinite(pricePi) || pricePi <= 0) return setError("Enter a valid Pi price greater than zero.");
    if (form.category.trim().length < 2) return setError("Enter a valid category.");
    if (form.description.trim().length < 20) return setError("Description must be at least 20 characters.");
    if (!form.location.trim() || !form.sellerContact.trim()) return setError("Location and seller contact are required.");
    setSubmitting(true);
    try {
      await axiosClient.post("/marketplace/products", { ...form, title: form.title.trim(), description: form.description.trim(), category: form.category.trim(), location: form.location.trim(), sellerContact: form.sellerContact.trim(), pricePi });
      setSuccess("Product submitted for admin review. It will appear in SMAJ Store after approval.");
      window.setTimeout(() => navigate("/seller"), 900);
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not add product." : "Could not add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">SELLER TOOLS</p><h1>Add Product</h1><p>Create a simple product listing priced in Pi.</p></div></section>
      <form className="private-form" onSubmit={(event) => void submit(event)}>
        <label>Product title<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Product gallery (up to 5 images)<input required multiple type="file" accept="image/*" onChange={(event) => selectImages(event.target.files)} /></label>
        {form.images.length ? <div className="product-upload-preview gallery-preview">{form.images.map((image) => <img src={image} alt="Product preview" key={image.slice(-30)} />)}</div> : null}
        <div className="private-form-row">
          <label>Price in Pi<input required type="number" min="0.01" step="0.01" value={form.pricePi} onChange={(event) => setForm({ ...form, pricePi: event.target.value })} /></label>
          <label>Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Others"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label>Description<textarea required minLength={20} maxLength={1500} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><small className="form-help">{form.description.length}/1500 characters</small></label>
        <div className="private-form-row">
          <label>Location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
          <label>Seller contact<input required placeholder="Email, phone, or Pi username" value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label>
        </div>
        {error ? <div className="private-alert error">{error}</div> : null}
        {success ? <div className="private-alert success">{success}</div> : null}
        <button className="private-primary-button" disabled={submitting}>{submitting ? "Saving product..." : "Publish Product"}</button>
      </form>
    </main>
  );
};

export default AddProductPage;
