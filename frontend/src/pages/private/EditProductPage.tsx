import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { isAxiosError } from "axios";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", image: "", pricePi: "", description: "", category: "", location: "", sellerContact: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient.get<{ product: Product }>(`/marketplace/seller/products/${id}`).then(({ data }) => setForm({ ...data.product, pricePi: String(data.product.pricePi) })).catch(() => setError("Product not found or you do not own it."));
  }, [id]);

  const selectImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { setError("Choose an image up to 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await axiosClient.put(`/marketplace/seller/products/${id}`, { ...form, pricePi: Number(form.pricePi) }); navigate("/seller"); }
    catch (err: unknown) { setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not update product." : "Could not update product."); }
    finally { setSaving(false); }
  };

  return <main className="private-page"><Link className="private-back-link" to="/seller">Back to Seller Dashboard</Link><section className="private-page-head"><div><p className="private-kicker">PRODUCT MANAGEMENT</p><h1>Edit Product</h1><p>Update listing details, price, image, and contact information.</p></div></section>
    <form className="private-form" onSubmit={(event) => void submit(event)}>
      <label>Product title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>Replace image<input type="file" accept="image/*" onChange={(event) => selectImage(event.target.files?.[0])} /></label>{form.image ? <div className="product-upload-preview"><img src={form.image} alt="Preview" /></div> : null}
      <div className="private-form-row"><label>Price in Pi<input required type="number" min="0.01" step="0.01" value={form.pricePi} onChange={(event) => setForm({ ...form, pricePi: event.target.value })} /></label><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label></div>
      <label>Description<textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <div className="private-form-row"><label>Location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label>Seller contact<input required value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label></div>
      {error ? <div className="private-alert error">{error}</div> : null}<button className="private-primary-button" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
    </form></main>;
};

export default EditProductPage;
