import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { isAxiosError } from "axios";
import { useAuthContext } from "../../contexts/AuthContext";
import { uploadImages } from "../../lib/uploadImage";
import type { Product } from "../../types/marketplace";

const PI_USDT_RATE = 314159;
const SELLER_AGREEMENT_READ_KEY = "smaj_seller_agreement_read";
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
  const { user, updateProfile } = useAuthContext();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [activatingSeller, setActivatingSeller] = useState(false);
  const [sellerAgreementRead, setSellerAgreementRead] = useState(() => localStorage.getItem(SELLER_AGREEMENT_READ_KEY) === "true");
  const [sellerActivatedHere, setSellerActivatedHere] = useState(false);
  const priceValue = Number(form.priceInput);
  const pricePi = form.priceCurrency === "Pi" ? priceValue : priceValue / PI_USDT_RATE;
  const priceUsdt = form.priceCurrency === "USDT" ? priceValue : priceValue * PI_USDT_RATE;
  const location = [form.country, form.stateRegion, form.city, form.areaAddress].map((item) => item.trim()).filter(Boolean).join(" - ");
  const sellerActive = Boolean(sellerActivatedHere || user?.sellerActive || user?.role === "seller");

  useEffect(() => {
    if (!success && !error) return;
    const timer = window.setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [success, error]);

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
    if (!sellerActive) return setError("Activate seller tools before submitting a product.");
    const quantity = Number(form.quantity);
    if (form.title.trim().length < 3) return setError("Product title must be at least 3 characters.");
    if (!form.image) return setError("Choose a product image before publishing.");
    if (!Number.isFinite(pricePi) || pricePi <= 0 || !Number.isFinite(priceUsdt) || priceUsdt <= 0) return setError("Enter a valid USDT or Pi price greater than zero.");
    if (form.category.trim().length < 2) return setError("Enter a valid category.");
    if (!form.condition || !Number.isFinite(quantity) || quantity < 1) return setError("Condition and quantity are required.");
    if (form.description.trim().length < 20) return setError("Description must be at least 20 characters.");
    if (!form.country.trim() || !form.stateRegion.trim() || !form.city.trim() || !form.areaAddress.trim() || !form.sellerContact.trim()) return setError("Full manual location and seller contact are required.");
    if (!form.deliveryOption) return setError("Choose a delivery option.");
    if (!sellerAgreementRead) return setError("Open and read the seller agreement before accepting it.");
    if (!form.sellerAgreementAccepted) return setError("Accept the seller agreement before submitting.");
    setSubmitting(true);
    try {
      const uploadedImages = await uploadImages(form.images.length ? form.images : [form.image], "products");
      const { data } = await axiosClient.post<{ product: Product }>("/marketplace/products", {
        title: form.title.trim(),
        image: uploadedImages[0],
        images: uploadedImages,
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
      setSuccess(data.product.reviewStatus === "approved" ? "Product saved and is live in SMAJ Store." : "Product saved for admin review. It will appear in SMAJ Store after approval.");
      window.setTimeout(() => navigate("/seller"), 900);
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not add product." : err instanceof Error ? err.message : "Could not add product.");
    } finally {
      setSubmitting(false);
    }
  };

  const markSellerAgreementRead = () => {
    localStorage.setItem(SELLER_AGREEMENT_READ_KEY, "true");
    setSellerAgreementRead(true);
  };

  const activateSeller = async () => {
    if (!user) return;
    setActivatingSeller(true);
    setError("");
    try {
      const updatedUser = await updateProfile({
        displayName: user.displayName || user.username || "Pi User",
        country: user.country || "",
        contactPhone: user.contactPhone || "",
        avatar: user.avatar || "",
        coverImage: user.coverImage || "",
        bio: user.bio || "",
        language: user.language || user.settings?.language || "English",
        sellerActive: true,
        role: user.role === "admin" ? "admin" : "seller",
      });
      setSellerActivatedHere(Boolean(updatedUser?.sellerActive || updatedUser?.role === "seller"));
      setSuccess("Seller tools activated. You can now submit real products for review.");
    } catch (err: unknown) {
      setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Seller tools could not be activated. Try again." : "Seller tools could not be activated. Try again.");
    } finally {
      setActivatingSeller(false);
    }
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">SELLER TOOLS</p><h1>List Product</h1><p>Create a real product listing with live USDT and Pi marketplace pricing.</p></div></section>
      {!sellerActive ? (
        <section className="private-form seller-activation-panel">
          <div>
            <p className="private-kicker">SELLER ACCESS REQUIRED</p>
            <h2>Activate seller tools first</h2>
            <p>Product listing is only available for seller accounts. Activation connects your listing activity to your verified Pi identity.</p>
          </div>
          <button className="private-primary-button" type="button" disabled={activatingSeller} onClick={() => void activateSeller()}>
            {activatingSeller ? "Activating..." : "Activate Seller Tools"}
          </button>
        </section>
      ) : null}
      <form className="private-form" onSubmit={(event) => void submit(event)}>
        <label>Product name<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>Product gallery (up to 5 images)<input required multiple type="file" accept="image/*" onChange={(event) => selectImages(event.target.files)} /></label>
        {form.images.length ? <div className="product-upload-preview gallery-preview">{form.images.map((image) => <img src={image} alt="Product preview" key={image.slice(-30)} />)}</div> : null}
        <div className="private-form-row">
          <label>Price amount<input required type="number" min="0.00001" step="0.00001" value={form.priceInput} onChange={(event) => setForm({ ...form, priceInput: event.target.value })} /></label>
          <label>Price currency<select required value={form.priceCurrency} onChange={(event) => setForm({ ...form, priceCurrency: event.target.value as "USDT" | "Pi" })}><option>USDT</option><option>Pi</option></select></label>
        </div>
        <div className="private-alert success">
          1 Pi = $314,159. This listing will show {Number.isFinite(priceUsdt) && priceUsdt > 0 ? priceUsdt.toFixed(2) : "0.00"} USDT and {Number.isFinite(pricePi) && pricePi > 0 ? pricePi.toFixed(5) : "0.00000"} Pi.
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
          <label>Country<input required value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="United Arab Emirates" /></label>
          <label>State/Region<input required value={form.stateRegion} onChange={(event) => setForm({ ...form, stateRegion: event.target.value })} placeholder="Abu Dhabi" /></label>
        </div>
        <div className="private-form-row">
          <label>City<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Abu Dhabi" /></label>
          <label>Area/Address summary<input required value={form.areaAddress} onChange={(event) => setForm({ ...form, areaAddress: event.target.value })} placeholder="Al Reem Island" /></label>
        </div>
        <div className="private-form-row">
          <label>Seller contact<input required placeholder="+971 50 123 4567, email, or Pi username" value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label>
        </div>
        <label className="setting-line">
          <span>
            <strong>Seller agreement</strong>
            <small>
              Read the official{" "}
              <Link className="seller-agreement-link" to="/seller-agreement" target="_blank" rel="noreferrer" onClick={markSellerAgreementRead}>
                SMAJ PI HUB Seller Agreement
              </Link>
              {" "}before accepting. I confirm this product is real, photos are clear, pricing is fair, location is valid, and SMAJ PI HUB may review before publishing.
            </small>
            {!sellerAgreementRead ? <small className="seller-agreement-required">Open the agreement link first to enable this checkbox.</small> : null}
          </span>
          <input
            type="checkbox"
            disabled={!sellerAgreementRead}
            checked={form.sellerAgreementAccepted}
            onChange={(event) => setForm({ ...form, sellerAgreementAccepted: event.target.checked })}
          />
        </label>
        {error ? <div className="private-alert floating-alert error">{error}</div> : null}
        {success ? <div className="private-alert floating-alert success">{success}</div> : null}
        <button className="private-primary-button" disabled={submitting}>{submitting ? "Submitting for review..." : "Submit for Review"}</button>
      </form>
    </main>
  );
};

export default AddProductPage;
