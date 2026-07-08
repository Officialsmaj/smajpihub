import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import { isAxiosError } from "axios";
import { useAuthContext } from "../../contexts/AuthContext";
import { uploadImage, uploadImages } from "../../lib/uploadImage";
import { formatPiAmount, formatUsdAmount } from "../../lib/formatters";
import type { Product } from "../../types/marketplace";

const PI_USDT_RATE = 314159;
const MAX_PRODUCT_IMAGES = 5;
const SELLER_AGREEMENT_READ_KEY = "smaj_seller_agreement_read";
const variantFields = ["color", "size", "material", "storage", "ram", "weight", "model", "edition", "style"] as const;
const specFieldsByCategory: Record<string, string[]> = {
  Electronics: ["Brand", "Model", "Storage", "RAM", "Battery", "Screen Size", "Warranty", "Voltage"],
  Fashion: ["Size", "Color", "Material", "Gender", "Style"],
  Vehicles: ["Year", "Mileage", "Fuel Type", "Model"],
  Property: ["Bedrooms", "Bathrooms", "Square meters", "Property Type"],
  Services: ["Duration", "Location", "Online / Offline", "Appointment Required"],
  Others: ["Brand", "Model", "Material"],
};
type VariantRow = Record<(typeof variantFields)[number], string> & { stock: string; priceInput: string; priceCurrency: "USDT" | "Pi"; image: string };
const emptyVariant = (): VariantRow => ({ color: "", size: "", material: "", storage: "", ram: "", weight: "", model: "", edition: "", style: "", stock: "0", priceInput: "", priceCurrency: "USDT", image: "" });
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
  productStatus: "active" as "draft" | "active" | "out_of_stock" | "hidden",
  warranty: "No Warranty",
  returnPolicy: "No Returns",
  specifications: {} as Record<string, string>,
  attributes: {} as Record<string, string>,
  variants: [] as VariantRow[],
  shipping: { weight: "", dimensions: "", method: "Standard Delivery", deliveryTime: "", pickupAvailable: false },
  seo: { slug: "", metaTitle: "", metaDescription: "" },
  digitalProduct: { enabled: false, fileUrl: "", downloadLimit: "", licenseKey: "" },
  serviceDetails: { enabled: false, duration: "", locationType: "Offline", appointmentRequired: false },
  sellerContact: "",
  sellerAgreementAccepted: false,
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshPiSession } = useAuthContext();
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
  const activeSpecFields = specFieldsByCategory[form.category] || specFieldsByCategory.Others;

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
    const selected = Array.from(files || []);
    if (!selected.length) return;
    if (form.images.length >= MAX_PRODUCT_IMAGES) return setError("You can add up to five product images.");
    const availableSlots = MAX_PRODUCT_IMAGES - form.images.length;
    const nextFiles = selected.slice(0, availableSlots);
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)) return setError("Choose up to five images, each 2 MB or smaller.");
    if (selected.length > availableSlots) setError(`Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added.`);
    Promise.all(nextFiles.map((file) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = reject; reader.readAsDataURL(file); }))).then((images) => setForm((current) => {
      const gallery = [...current.images, ...images].slice(0, MAX_PRODUCT_IMAGES);
      return { ...current, image: gallery[0] || "", images: gallery };
    })).catch(() => setError("Could not read the selected images."));
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, image: images[0] || "", images };
    });
  };

  const setSpec = (key: string, value: string) => setForm((current) => ({ ...current, specifications: { ...current.specifications, [key]: value } }));
  const setAttribute = (key: string, value: string) => setForm((current) => ({ ...current, attributes: { ...current.attributes, [key]: value } }));
  const updateVariant = (index: number, patch: Partial<VariantRow>) => setForm((current) => ({ ...current, variants: current.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...patch } : variant) }));
  const addVariant = () => setForm((current) => ({ ...current, variants: [...current.variants, emptyVariant()].slice(0, 50) }));
  const removeVariant = (index: number) => setForm((current) => ({ ...current, variants: current.variants.filter((_, variantIndex) => variantIndex !== index) }));
  const selectVariantImage = (index: number, file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return setError("Choose a variant image that is 2 MB or smaller.");
    const reader = new FileReader();
    reader.onload = () => updateVariant(index, { image: String(reader.result || "") });
    reader.onerror = () => setError("Could not read the selected variant image.");
    reader.readAsDataURL(file);
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
      const uploadedVariants = await Promise.all(form.variants.map(async (variant) => {
        const variantPrice = Number(variant.priceInput);
        return {
          ...Object.fromEntries(variantFields.map((field) => [field, variant[field].trim()])),
          stock: Number(variant.stock || 0),
          pricePi: variant.priceInput ? variant.priceCurrency === "Pi" ? variantPrice : variantPrice / PI_USDT_RATE : undefined,
          priceUsdt: variant.priceInput ? variant.priceCurrency === "USDT" ? variantPrice : variantPrice * PI_USDT_RATE : undefined,
          image: variant.image ? await uploadImage(variant.image, "products") : "",
        };
      }));
      const payload = {
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
        productStatus: form.productStatus,
        variants: uploadedVariants,
        specifications: form.specifications,
        attributes: form.attributes,
        shipping: form.shipping,
        warranty: form.warranty,
        returnPolicy: form.returnPolicy,
        seo: form.seo,
        digitalProduct: { ...form.digitalProduct, downloadLimit: Number(form.digitalProduct.downloadLimit || 0) },
        serviceDetails: form.serviceDetails,
        sellerContact: form.sellerContact.trim(),
        pricePi,
        priceUsdt,
        sellerAgreementAccepted: form.sellerAgreementAccepted,
      };
      const postProduct = () => axiosClient.post<{ product: Product }>("/marketplace/products", payload);
      let response;
      try {
        response = await postProduct();
      } catch (err: unknown) {
        if (isAxiosError<{ message?: string }>(err) && err.response?.status === 401 && await refreshPiSession()) {
          response = await postProduct();
        } else {
          throw err;
        }
      }
      const { data } = response;
      setSuccess(data.product.reviewStatus === "approved" ? "Product saved and is live in SMAJ Store." : "Product saved for team review. It will appear in SMAJ Store after approval.");
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
        <div className="product-form-section-title"><h2>Basic Information</h2><p>Name, category, status, and description.</p></div>
        <label>Product name<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <div className="private-form-row">
          <label>Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Electronics", "Fashion", "Vehicles", "Property", "Food", "Services", "Digital", "Others"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Product status<select required value={form.productStatus} onChange={(event) => setForm({ ...form, productStatus: event.target.value as typeof form.productStatus })}>{[["draft", "Draft"], ["active", "Active"], ["out_of_stock", "Out of Stock"], ["hidden", "Hidden"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </div>
        <div className="private-form-row">
          <label>Condition<select required value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}>{["New", "Like New", "Used", "Refurbished"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Quantity<input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
        </div>
        <label>Description<textarea required minLength={20} maxLength={1500} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><small className="form-help">{form.description.length}/1500 characters</small></label>

        <div className="product-form-section-title"><h2>Images</h2><p>Main image, gallery images, and variant images.</p></div>
        <label>Product gallery ({form.images.length}/5 images)<input multiple type="file" accept="image/*" onChange={(event) => { selectImages(event.target.files); event.currentTarget.value = ""; }} /></label>
        {form.images.length ? (
          <div className="product-gallery-preview">
            {form.images.map((image, index) => (
              <figure key={`${image.slice(-30)}-${index}`}>
                <img src={image} alt={`Product preview ${index + 1}`} />
                {index === 0 ? <span>Main</span> : null}
                <button type="button" onClick={() => removeImage(index)}>Remove</button>
              </figure>
            ))}
          </div>
        ) : null}

        <div className="product-form-section-title"><h2>Price & Inventory</h2><p>Base price and overall stock.</p></div>
        <div className="private-form-row">
          <label>Price amount<input required type="number" min="0.0000000001" step="any" value={form.priceInput} onChange={(event) => setForm({ ...form, priceInput: event.target.value })} /></label>
          <label>Price currency<select required value={form.priceCurrency} onChange={(event) => setForm({ ...form, priceCurrency: event.target.value as "USDT" | "Pi" })}><option>USDT</option><option>Pi</option></select></label>
        </div>
        <div className="private-alert success">
          1 Pi = $314159. This listing will show {formatUsdAmount(priceUsdt)} USDT and {formatPiAmount(pricePi)}.
        </div>

        <div className="product-form-section-title"><h2>Variants</h2><p>Track color, size, storage, model, and stock per variant.</p><button type="button" className="private-secondary-button" onClick={addVariant}>Add Variant</button></div>
        {form.variants.length ? <div className="product-variant-list">{form.variants.map((variant, index) => (
          <article key={index}>
            <div className="product-variant-head"><strong>Variant {index + 1}</strong><button type="button" onClick={() => removeVariant(index)}>Remove</button></div>
            <div className="private-form-row">
              {variantFields.slice(0, 4).map((field) => <label key={field}>{field}<input value={variant[field]} onChange={(event) => updateVariant(index, { [field]: event.target.value } as Partial<VariantRow>)} /></label>)}
            </div>
            <div className="private-form-row">
              {variantFields.slice(4).map((field) => <label key={field}>{field}<input value={variant[field]} onChange={(event) => updateVariant(index, { [field]: event.target.value } as Partial<VariantRow>)} /></label>)}
            </div>
            <div className="private-form-row">
              <label>Variant stock<input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, { stock: event.target.value })} /></label>
              <label>Variant price<input type="number" min="0" step="any" value={variant.priceInput} onChange={(event) => updateVariant(index, { priceInput: event.target.value })} /></label>
              <label>Currency<select value={variant.priceCurrency} onChange={(event) => updateVariant(index, { priceCurrency: event.target.value as "USDT" | "Pi" })}><option>USDT</option><option>Pi</option></select></label>
              <label>Variant image<input type="file" accept="image/*" onChange={(event) => { selectVariantImage(index, event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
            </div>
            {variant.image ? <img className="product-variant-image" src={variant.image} alt="" /> : null}
          </article>
        ))}</div> : <div className="private-state compact"><h3>No variants yet</h3><p>Add variants for options like Black / M, White / L, or 256GB / 8GB RAM.</p></div>}
        {form.variants.length ? <div className="variant-preview-list"><strong>Product Variations Preview</strong>{form.variants.map((variant, index) => {
          const parts = variantFields.map((field) => variant[field]).filter(Boolean);
          const amount = Number(variant.priceInput || form.priceInput);
          const variantPi = variant.priceCurrency === "Pi" ? amount : amount / PI_USDT_RATE;
          return <span key={index}>{parts.join(" / ") || `Variant ${index + 1}`} · Price: {Number.isFinite(variantPi) && variantPi > 0 ? formatPiAmount(variantPi) : "Base price"} · Stock: {variant.stock || 0}</span>;
        })}</div> : null}

        <div className="product-form-section-title"><h2>Specifications</h2><p>Category-specific product facts.</p></div>
        <div className="private-form-row">
          {activeSpecFields.map((field) => <label key={field}>{field}<input value={form.specifications[field] || ""} onChange={(event) => setSpec(field, event.target.value)} /></label>)}
        </div>

        <div className="product-form-section-title"><h2>Attributes</h2><p>Dynamic attributes buyers can compare.</p></div>
        <div className="private-form-row">
          {["Size", "Color", "Material", "Brand", "Warranty", "Year", "Mileage", "Fuel Type", "Bedrooms", "Bathrooms", "Square meters"].map((field) => <label key={field}>{field}<input value={form.attributes[field] || ""} onChange={(event) => setAttribute(field, event.target.value)} /></label>)}
        </div>

        <div className="product-form-section-title"><h2>Shipping</h2><p>Weight, dimensions, method, delivery, and pickup.</p></div>
        <div className="private-form-row">
          <label>Delivery option<select required value={form.deliveryOption} onChange={(event) => setForm({ ...form, deliveryOption: event.target.value })}>{["Delivery", "Pickup", "Delivery or Pickup"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Weight<input value={form.shipping.weight} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, weight: event.target.value } })} placeholder="1.2 kg" /></label>
          <label>Dimensions<input value={form.shipping.dimensions} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, dimensions: event.target.value } })} placeholder="30 x 20 x 10 cm" /></label>
          <label>Shipping method<input value={form.shipping.method} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, method: event.target.value } })} /></label>
          <label>Delivery time<input value={form.shipping.deliveryTime} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, deliveryTime: event.target.value } })} placeholder="2-4 days" /></label>
        </div>
        <label className="setting-line toggle-line"><span><strong>Pickup available</strong><small>Buyer can collect directly from seller.</small></span><input type="checkbox" checked={form.shipping.pickupAvailable} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, pickupAvailable: event.target.checked } })} /></label>

        <div className="product-form-section-title"><h2>Warranty & Returns</h2><p>Clear buyer expectations.</p></div>
        <div className="private-form-row">
          <label>Warranty<select value={form.warranty} onChange={(event) => setForm({ ...form, warranty: event.target.value })}>{["No Warranty", "7 Days", "30 Days", "6 Months", "1 Year"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Return Policy<select value={form.returnPolicy} onChange={(event) => setForm({ ...form, returnPolicy: event.target.value })}>{["No Returns", "7 Days", "14 Days", "30 Days"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>

        <div className="product-form-section-title"><h2>Digital Products</h2><p>Optional file, download limit, and license details.</p></div>
        <label className="setting-line toggle-line"><span><strong>Digital product</strong><small>Use for files, downloads, and licenses.</small></span><input type="checkbox" checked={form.digitalProduct.enabled} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, enabled: event.target.checked } })} /></label>
        {form.digitalProduct.enabled ? <div className="private-form-row"><label>File URL<input value={form.digitalProduct.fileUrl} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, fileUrl: event.target.value } })} /></label><label>Download limit<input type="number" min="0" value={form.digitalProduct.downloadLimit} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, downloadLimit: event.target.value } })} /></label><label>License key<input value={form.digitalProduct.licenseKey} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, licenseKey: event.target.value } })} /></label></div> : null}

        <div className="product-form-section-title"><h2>Services</h2><p>Optional service details for appointment-based listings.</p></div>
        <label className="setting-line toggle-line"><span><strong>Service listing</strong><small>Use for online/offline services.</small></span><input type="checkbox" checked={form.serviceDetails.enabled} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, enabled: event.target.checked } })} /></label>
        {form.serviceDetails.enabled ? <div className="private-form-row"><label>Duration<input value={form.serviceDetails.duration} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, duration: event.target.value } })} placeholder="60 minutes" /></label><label>Location type<select value={form.serviceDetails.locationType} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, locationType: event.target.value } })}><option>Online</option><option>Offline</option><option>Online / Offline</option></select></label><label className="setting-line toggle-line"><span><strong>Appointment required</strong></span><input type="checkbox" checked={form.serviceDetails.appointmentRequired} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, appointmentRequired: event.target.checked } })} /></label></div> : null}

        <div className="product-form-section-title"><h2>SEO</h2><p>Future-ready product discovery fields.</p></div>
        <div className="private-form-row">
          <label>Product slug<input value={form.seo.slug} onChange={(event) => setForm({ ...form, seo: { ...form.seo, slug: event.target.value } })} placeholder="blue-phone-256gb" /></label>
          <label>Meta title<input maxLength={120} value={form.seo.metaTitle} onChange={(event) => setForm({ ...form, seo: { ...form.seo, metaTitle: event.target.value } })} /></label>
          <label>Meta description<textarea rows={3} maxLength={240} value={form.seo.metaDescription} onChange={(event) => setForm({ ...form, seo: { ...form.seo, metaDescription: event.target.value } })} /></label>
        </div>

        <div className="product-form-section-title"><h2>Review & Publish</h2><p>Location, contact, and seller agreement.</p></div>
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
