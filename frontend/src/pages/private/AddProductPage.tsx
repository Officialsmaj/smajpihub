import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { isAxiosError } from "axios";

const PI_USDT_RATE = 3141.59;
const initialForm = {
  title: "",
  image: "",
  images: [] as string[],
  priceInput: "",
  priceCurrency: "USDT" as "USDT" | "Pi",
  description: "",
  category: "Electronics",
  condition: "New",
  quantity: "1",
  country: "",
  stateRegion: "",
  city: "",
  areaAddress: "",
  deliveryOption: "Delivery",
  sellerContact: "",
  sellerAgreementAccepted: false,
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const priceValue = Number(form.priceInput);
  const pricePi = form.priceCurrency === "Pi" ? priceValue : priceValue / PI_USDT_RATE;
  const priceUsdt = form.priceCurrency === "USDT" ? priceValue : priceValue * PI_USDT_RATE;
  const location = [form.country, form.stateRegion, form.city, form.areaAddress].map((item) => item.trim()).filter(Boolean).join(" - ");

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
    const quantity = Number(form.quantity);
    if (form.title.trim().length < 3) return setError("Product title must be at least 3 characters.");
    if (!form.image) return setError("Choose a product image before publishing.");
    if (!Number.isFinite(pricePi) || pricePi <= 0 || !Number.isFinite(priceUsdt) || priceUsdt <= 0) return setError("Enter a valid USDT or Pi price greater than zero.");
    if (form.category.trim().length < 2) return setError("Enter a valid category.");
    if (!form.condition || !Number.isFinite(quantity) || quantity < 1) return setError("Condition and quantity are required.");
    if (form.description.trim().length < 20) return setError("Description must be at least 20 characters.");
    if (!form.country.trim() || !form.stateRegion.trim() || !form.city.trim() || !form.areaAddress.trim() || !form.sellerContact.trim()) return setError("Full manual location and seller contact are required.");
    if (!form.deliveryOption) return setError("Choose a delivery option.");
    if (!form.sellerAgreementAccepted) return setError("Accept the seller agreement before submitting.");
    setSubmitting(true);
    try {
      await axiosClient.post("/marketplace/products", {
        title: form.title.trim(),
        image: form.image,
        images: form.images,
        description: form.description.trim(),
        category: form.category.trim(),
        condition: form.condition,
        quantity,
        country: form.country.trim(),
        stateRegion: form.stateRegion.trim(),
        city: form.city.trim(),
        areaAddress: form.areaAddress.trim(),
        location,
        deliveryOption: form.deliveryOption,
        sellerContact: form.sellerContact.trim(),
        pricePi,
        priceUsdt,
        sellerAgreementAccepted: form.sellerAgreementAccepted,
      });
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
      <section className="private-page-head"><div><p className="private-kicker">SELLER TOOLS</p><h1>List Product</h1><p>Create a real product listing with live USDT and Pi marketplace pricing.</p></div></section>
      <form className="private-form" onSubmit={(event) => void submit(event)}>
        <label>Product name<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Product gallery (up to 5 images)<input required multiple type="file" accept="image/*" onChange={(event) => selectImages(event.target.files)} /></label>
        {form.images.length ? <div className="product-upload-preview gallery-preview">{form.images.map((image) => <img src={image} alt="Product preview" key={image.slice(-30)} />)}</div> : null}
        <div className="private-form-row">
          <label>Price amount<input required type="number" min="0.00001" step="0.00001" value={form.priceInput} onChange={(event) => setForm({ ...form, priceInput: event.target.value })} /></label>
          <label>Price currency<select required value={form.priceCurrency} onChange={(event) => setForm({ ...form, priceCurrency: event.target.value as "USDT" | "Pi" })}><option>USDT</option><option>Pi</option></select></label>
        </div>
        <div className="private-alert success">
          1 Pi = 3,141.59 USDT. This listing will show {Number.isFinite(priceUsdt) && priceUsdt > 0 ? priceUsdt.toFixed(2) : "0.00"} USDT and {Number.isFinite(pricePi) && pricePi > 0 ? pricePi.toFixed(5) : "0.00000"} Pi.
        </div>
        <div className="private-form-row">
          <label>Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Others"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Condition<select required value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}>{["New", "Used - Like New", "Used - Good", "Refurbished"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="private-form-row">
          <label>Quantity<input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
          <label>Delivery option<select required value={form.deliveryOption} onChange={(event) => setForm({ ...form, deliveryOption: event.target.value })}>{["Delivery", "Pickup", "Delivery or Pickup"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label>Description<textarea required minLength={20} maxLength={1500} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><small className="form-help">{form.description.length}/1500 characters</small></label>
        <div className="private-form-row">
          <label>Country<input required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Nigeria" /></label>
          <label>State/Region<input required value={form.stateRegion} onChange={(event) => setForm({ ...form, stateRegion: event.target.value })} placeholder="Borno" /></label>
        </div>
        <div className="private-form-row">
          <label>City<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Maiduguri" /></label>
          <label>Area/Address summary<input required value={form.areaAddress} onChange={(event) => setForm({ ...form, areaAddress: event.target.value })} placeholder="Monday Market area" /></label>
        </div>
        <div className="private-form-row">
          <label>Seller contact<input required placeholder="Email, phone, or Pi username" value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label>
        </div>
        <label className="setting-line">
          <span><strong>Seller agreement</strong><small>I confirm this product is real, photos are clear, pricing is fair, location is valid, and SMAJ PI HUB may review before publishing.</small></span>
          <input type="checkbox" checked={form.sellerAgreementAccepted} onChange={(event) => setForm({ ...form, sellerAgreementAccepted: event.target.checked })} />
        </label>
        {error ? <div className="private-alert error">{error}</div> : null}
        {success ? <div className="private-alert success">{success}</div> : null}
        <button className="private-primary-button" disabled={submitting}>{submitting ? "Submitting for review..." : "Submit for Review"}</button>
      </form>
    </main>
  );
};

export default AddProductPage;
