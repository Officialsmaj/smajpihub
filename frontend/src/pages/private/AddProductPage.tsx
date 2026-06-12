import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { isAxiosError } from "axios";

const initialForm = { title: "", image: "", pricePi: "", description: "", category: "", location: "", sellerContact: "" };

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const selectImage = (file?: File) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Product image must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await axiosClient.post("/marketplace/products", { ...form, pricePi: Number(form.pricePi) });
      setSuccess("Product published successfully. Redirecting to the Store...");
      window.setTimeout(() => navigate("/store"), 700);
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
        <label>Product image<input required type="file" accept="image/*" onChange={(event) => selectImage(event.target.files?.[0])} /></label>
        {form.image ? <div className="product-upload-preview"><img src={form.image} alt="Product preview" /></div> : null}
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
        {success ? <div className="private-alert success">{success}</div> : null}
        <button className="private-primary-button" disabled={submitting}>{submitting ? "Publishing..." : "Publish Product"}</button>
      </form>
    </main>
  );
};

export default AddProductPage;
