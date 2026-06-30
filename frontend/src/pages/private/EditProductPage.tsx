import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { isAxiosError } from "axios";

const PI_USDT_RATE = 3141.59;

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    image: "",
    images: [] as string[],
    pricePi: "",
    priceUsdt: "",
    description: "",
    category: "",
    condition: "New",
    quantity: "1",
    country: "",
    stateRegion: "",
    city: "",
    areaAddress: "",
    deliveryOption: "Delivery",
    location: "",
    sellerContact: "",
    sellerAgreementAccepted: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axiosClient.get<{ product: Product }>(`/marketplace/seller/products/${id}`).then(({ data }) => {
      const product = data.product;
      setForm({
        title: product.title,
        image: product.image,
        images: product.images || [product.image],
        pricePi: String(product.pricePi),
        priceUsdt: String(product.priceUsdt ?? product.pricePi * PI_USDT_RATE),
        description: product.description,
        category: product.category,
        condition: product.condition || "New",
        quantity: String(product.quantity || 1),
        country: product.country || product.location.split(" - ")[0] || "",
        stateRegion: product.stateRegion || product.location.split(" - ")[1] || "",
        city: product.city || product.location.split(" - ")[2] || "",
        areaAddress: product.areaAddress || product.location.split(" - ")[3] || product.location,
        deliveryOption: product.deliveryOption || "Delivery",
        location: product.location,
        sellerContact: product.sellerContact,
        sellerAgreementAccepted: product.sellerAgreementAccepted ?? true,
      });
    }).catch(() => setError("Product not found or you do not own it."));
  }, [id]);

  const selectImages = (files?: FileList | null) => {
    setError("");
    const selected = Array.from(files || []).slice(0, 5);
    if (!selected.length) return;
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)) {
      setError("Choose up to five images, each 2 MB or smaller.");
      return;
    }
    Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((images) => setForm((current) => ({ ...current, image: images[0], images }))).catch(() => setError("Could not read the selected images."));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const location = [form.country, form.stateRegion, form.city, form.areaAddress].map((item) => item.trim()).filter(Boolean).join(" - ");
    try {
      await axiosClient.put(`/marketplace/seller/products/${id}`, {
        ...form,
        location,
        pricePi: Number(form.pricePi),
        priceUsdt: Number(form.priceUsdt),
        quantity: Number(form.quantity),
      });
      navigate("/seller");
    }
    catch (err: unknown) { setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not update product." : "Could not update product."); }
    finally { setSaving(false); }
  };

  return <main className="private-page"><Link className="private-back-link" to="/seller">Back to Seller Dashboard</Link><section className="private-page-head"><div><p className="private-kicker">PRODUCT MANAGEMENT</p><h1>Edit Product</h1><p>Update listing details, price, image, and contact information.</p></div></section>
    <form className="private-form" onSubmit={(event) => void submit(event)}>
      <label>Product title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label>Replace gallery<input multiple type="file" accept="image/*" onChange={(event) => selectImages(event.target.files)} /></label>{form.images.length ? <div className="product-upload-preview gallery-preview">{form.images.map((image) => <img src={image} alt="Product preview" key={image.slice(-30)} />)}</div> : null}
      <div className="private-form-row"><label>USDT price<input required type="number" min="0.01" step="0.01" value={form.priceUsdt} onChange={(event) => setForm({ ...form, priceUsdt: event.target.value, pricePi: String(Number(event.target.value) / PI_USDT_RATE) })} /></label><label>Pi price<input required type="number" min="0.00001" step="0.00001" value={form.pricePi} onChange={(event) => setForm({ ...form, pricePi: event.target.value, priceUsdt: String(Number(event.target.value) * PI_USDT_RATE) })} /></label></div>
      <div className="private-form-row"><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Condition<input required value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })} /></label></div>
      <div className="private-form-row"><label>Quantity<input required type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label>Delivery option<input required value={form.deliveryOption} onChange={(event) => setForm({ ...form, deliveryOption: event.target.value })} /></label></div>
      <label>Description<textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <div className="private-form-row"><label>Country<input required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></label><label>State/Region<input required value={form.stateRegion} onChange={(event) => setForm({ ...form, stateRegion: event.target.value })} /></label></div>
      <div className="private-form-row"><label>City<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label>Area/Address summary<input required value={form.areaAddress} onChange={(event) => setForm({ ...form, areaAddress: event.target.value })} /></label></div>
      <div className="private-form-row"><label>Seller contact<input required value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label></div>
      <label className="setting-line"><span><strong>Seller agreement</strong><small>I confirm this listing remains real, accurate, and review-ready.</small></span><input type="checkbox" checked={form.sellerAgreementAccepted} onChange={(event) => setForm({ ...form, sellerAgreementAccepted: event.target.checked })} /></label>
      {error ? <div className="private-alert error">{error}</div> : null}<button className="private-primary-button" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
    </form></main>;
};

export default EditProductPage;
