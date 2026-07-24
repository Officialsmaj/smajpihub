import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import type { Product } from "../../types/marketplace";
import { isAxiosError } from "axios";
import { uploadImage, uploadImages } from "../../lib/uploadImage";
import { formatPiAmount, formatPiInputValue } from "../../lib/formatters";
import { PI_USDT_RATE, piFromUsdt, usdtFromPi } from "../../lib/piPricing";
import { LocationFields } from "../../components/LocationFields";

const MAX_PRODUCT_IMAGES = 5;
const variantFields = ["color", "size", "material", "storage", "ram", "weight", "model", "edition", "style"] as const;
type VariantRow = Record<(typeof variantFields)[number], string> & { stock: string; pricePi: string; priceUsdt: string; image: string };
const emptyVariant = (): VariantRow => ({ color: "", size: "", material: "", storage: "", ram: "", weight: "", model: "", edition: "", style: "", stock: "0", pricePi: "", priceUsdt: "", image: "" });

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
    productStatus: "active" as "draft" | "active" | "out_of_stock" | "hidden",
    variants: [] as VariantRow[],
    specifications: {} as Record<string, string>,
    attributes: {} as Record<string, string>,
    shipping: { weight: "", dimensions: "", method: "Standard Delivery", deliveryTime: "", pickupAvailable: false },
    warranty: "No Warranty",
    returnPolicy: "No Returns",
    seo: { slug: "", metaTitle: "", metaDescription: "" },
    digitalProduct: { enabled: false, fileUrl: "", downloadLimit: "", licenseKey: "" },
    serviceDetails: { enabled: false, duration: "", locationType: "Offline", appointmentRequired: false },
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
        pricePi: formatPiInputValue(product.pricePi),
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
        productStatus: product.productStatus || (product.hidden ? "hidden" : product.active ? "active" : "out_of_stock"),
        variants: (product.variants || []).map((variant) => ({
          color: variant.color || "",
          size: variant.size || "",
          material: variant.material || "",
          storage: variant.storage || "",
          ram: variant.ram || "",
          weight: variant.weight || "",
          model: variant.model || "",
          edition: variant.edition || "",
          style: variant.style || "",
          stock: String(variant.stock ?? 0),
          pricePi: variant.pricePi ? formatPiInputValue(variant.pricePi) : "",
          priceUsdt: variant.priceUsdt ? String(variant.priceUsdt) : "",
          image: variant.image || "",
        })),
        specifications: product.specifications || {},
        attributes: product.attributes || {},
        shipping: { weight: product.shipping?.weight || "", dimensions: product.shipping?.dimensions || "", method: product.shipping?.method || "Standard Delivery", deliveryTime: product.shipping?.deliveryTime || "", pickupAvailable: Boolean(product.shipping?.pickupAvailable) },
        warranty: product.warranty || "No Warranty",
        returnPolicy: product.returnPolicy || "No Returns",
        seo: { slug: product.seo?.slug || "", metaTitle: product.seo?.metaTitle || "", metaDescription: product.seo?.metaDescription || "" },
        digitalProduct: { enabled: Boolean(product.digitalProduct?.enabled), fileUrl: product.digitalProduct?.fileUrl || "", downloadLimit: String(product.digitalProduct?.downloadLimit || ""), licenseKey: product.digitalProduct?.licenseKey || "" },
        serviceDetails: { enabled: Boolean(product.serviceDetails?.enabled), duration: product.serviceDetails?.duration || "", locationType: product.serviceDetails?.locationType || "Offline", appointmentRequired: Boolean(product.serviceDetails?.appointmentRequired) },
        location: product.location,
        sellerContact: product.sellerContact,
        sellerAgreementAccepted: product.sellerAgreementAccepted ?? true,
      });
    }).catch(() => setError("Product not found or you do not own it."));
  }, [id]);

  const selectImages = (files?: FileList | null) => {
    setError("");
    const selected = Array.from(files || []);
    if (!selected.length) return;
    if (form.images.length >= MAX_PRODUCT_IMAGES) {
      setError("You can add up to five product images.");
      return;
    }
    const availableSlots = MAX_PRODUCT_IMAGES - form.images.length;
    const nextFiles = selected.slice(0, availableSlots);
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)) {
      setError("Choose up to five images, each 2 MB or smaller.");
      return;
    }
    if (selected.length > availableSlots) setError(`Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added.`);
    Promise.all(nextFiles.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then((images) => setForm((current) => {
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
    event.preventDefault(); setSaving(true); setError("");
    const location = [form.country, form.stateRegion, form.city, form.areaAddress].map((item) => item.trim()).filter(Boolean).join(" - ");
    if (!form.sellerAgreementAccepted) {
      setSaving(false);
      setError("Accept the seller agreement before saving this product.");
      return;
    }
    if (!form.image) {
      setSaving(false);
      setError("Choose at least one product image before saving.");
      return;
    }
    try {
      const uploadedImages = await uploadImages(form.images.length ? form.images : [form.image], "products");
      const uploadedVariants = await Promise.all(form.variants.map(async (variant) => ({
        ...Object.fromEntries(variantFields.map((field) => [field, variant[field].trim()])),
        stock: Number(variant.stock || 0),
        pricePi: Number(variant.pricePi || 0) || undefined,
        priceUsdt: Number(variant.priceUsdt || 0) || undefined,
        image: variant.image ? await uploadImage(variant.image, "products") : "",
      })));
      await axiosClient.put(`/marketplace/seller/products/${id}`, {
        ...form,
        image: uploadedImages[0],
        images: uploadedImages,
        variants: uploadedVariants,
        digitalProduct: { ...form.digitalProduct, downloadLimit: Number(form.digitalProduct.downloadLimit || 0) },
        location,
        pricePi: Number(form.pricePi),
        priceUsdt: Number(form.priceUsdt),
        quantity: Number(form.quantity),
      });
      navigate("/seller");
    }
    catch (err: unknown) { setError(isAxiosError<{ message?: string }>(err) ? err.response?.data?.message || "Could not update product." : err instanceof Error ? err.message : "Could not update product."); }
    finally { setSaving(false); }
  };

  return <main className="private-page"><Link className="private-back-link" to="/seller">Back to Seller Dashboard</Link><section className="private-page-head"><div><p className="private-kicker">PRODUCT MANAGEMENT</p><h1>Edit Product</h1><p>Update listing details, price, image, and contact information.</p></div></section>
    <form className="private-form" onSubmit={(event) => void submit(event)}>
      <div className="product-form-section-title"><h2>Basic Information</h2><p>Core listing details.</p></div>
      <label>Product title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <div className="private-form-row"><label>Product status<select value={form.productStatus} onChange={(event) => setForm({ ...form, productStatus: event.target.value as typeof form.productStatus })}>{[["draft", "Draft"], ["active", "Active"], ["out_of_stock", "Out of Stock"], ["hidden", "Hidden"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
      <div className="product-form-section-title"><h2>Images</h2><p>Main image, gallery, and variant images.</p></div>
      <label>Product gallery ({form.images.length}/5 images)<input multiple type="file" accept="image/*" onChange={(event) => { selectImages(event.target.files); event.currentTarget.value = ""; }} /></label>{form.images.length ? <div className="product-gallery-preview">{form.images.map((image, index) => <figure key={`${image.slice(-30)}-${index}`}><img src={image} alt={`Product preview ${index + 1}`} />{index === 0 ? <span>Main</span> : null}<button type="button" onClick={() => removeImage(index)}>Remove</button></figure>)}</div> : null}
      <div className="product-form-section-title"><h2>Price & Inventory</h2><p>Base price and overall stock.</p></div>
      <div className="private-form-row"><label>$ price (USDT)<input required type="number" min="0.01" step="0.01" value={form.priceUsdt} onChange={(event) => setForm({ ...form, priceUsdt: event.target.value, pricePi: formatPiInputValue(piFromUsdt(Number(event.target.value))) })} /></label><label>π price<input required type="number" min="0.0000000001" step="any" value={form.pricePi} onChange={(event) => setForm({ ...form, pricePi: event.target.value, priceUsdt: String(usdtFromPi(Number(event.target.value))) })} /></label></div>
      <div className="private-form-row"><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Condition<input required value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })} /></label></div>
      <div className="private-form-row"><label>Quantity<input required type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label>Delivery option<input required value={form.deliveryOption} onChange={(event) => setForm({ ...form, deliveryOption: event.target.value })} /></label></div>
      <label>Description<textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <div className="product-form-section-title"><h2>Variants</h2><p>Per-option inventory, pricing, and image.</p><button type="button" className="private-secondary-button" onClick={addVariant}>Add Variant</button></div>
      {form.variants.length ? <div className="product-variant-list">{form.variants.map((variant, index) => <article key={index}><div className="product-variant-head"><strong>Variant {index + 1}</strong><button type="button" onClick={() => removeVariant(index)}>Remove</button></div><div className="private-form-row">{variantFields.map((field) => <label key={field}>{field}<input value={variant[field]} onChange={(event) => updateVariant(index, { [field]: event.target.value } as Partial<VariantRow>)} /></label>)}</div><div className="private-form-row"><label>Stock<input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, { stock: event.target.value })} /></label><label>π price<input type="number" min="0" step="any" value={variant.pricePi} onChange={(event) => updateVariant(index, { pricePi: event.target.value })} /></label><label>$ price (USDT)<input type="number" min="0" step="any" value={variant.priceUsdt} onChange={(event) => updateVariant(index, { priceUsdt: event.target.value })} /></label><label>Variant image<input type="file" accept="image/*" onChange={(event) => { selectVariantImage(index, event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div>{variant.image ? <img className="product-variant-image" src={variant.image} alt="" /> : null}</article>)}</div> : null}
      {form.variants.length ? <div className="variant-preview-list"><strong>Product Variations Preview</strong>{form.variants.map((variant, index) => <span key={index}>{variantFields.map((field) => variant[field]).filter(Boolean).join(" / ") || `Variant ${index + 1}`} · Price: {variant.pricePi ? formatPiAmount(Number(variant.pricePi)) : "Base price"} · Stock: {variant.stock || 0}</span>)}</div> : null}
      <div className="product-form-section-title"><h2>Specifications</h2><p>Product facts and dynamic attributes.</p></div>
      <div className="private-form-row">{["Brand", "Model", "Storage", "RAM", "Battery", "Screen Size", "CPU", "SSD", "GPU", "Material", "Gender", "Sole", "Weight"].map((field) => <label key={field}>{field}<input value={form.specifications[field] || ""} onChange={(event) => setForm({ ...form, specifications: { ...form.specifications, [field]: event.target.value } })} /></label>)}</div>
      <div className="private-form-row">{["Color", "Size", "Warranty", "Voltage", "Year", "Mileage", "Fuel Type", "Bedrooms", "Bathrooms", "Square meters"].map((field) => <label key={field}>{field}<input value={form.attributes[field] || ""} onChange={(event) => setForm({ ...form, attributes: { ...form.attributes, [field]: event.target.value } })} /></label>)}</div>
      <div className="product-form-section-title"><h2>Shipping</h2><p>Shipping, pickup, warranty, and returns.</p></div>
      <div className="private-form-row"><label>Weight<input value={form.shipping.weight} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, weight: event.target.value } })} /></label><label>Dimensions<input value={form.shipping.dimensions} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, dimensions: event.target.value } })} /></label><label>Shipping method<input value={form.shipping.method} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, method: event.target.value } })} /></label><label>Delivery time<input value={form.shipping.deliveryTime} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, deliveryTime: event.target.value } })} /></label></div>
      <label className="setting-line toggle-line"><span><strong>Pickup available</strong></span><input type="checkbox" checked={form.shipping.pickupAvailable} onChange={(event) => setForm({ ...form, shipping: { ...form.shipping, pickupAvailable: event.target.checked } })} /></label>
      <div className="private-form-row"><label>Warranty<select value={form.warranty} onChange={(event) => setForm({ ...form, warranty: event.target.value })}>{["No Warranty", "7 Days", "30 Days", "6 Months", "1 Year"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Return policy<select value={form.returnPolicy} onChange={(event) => setForm({ ...form, returnPolicy: event.target.value })}>{["No Returns", "7 Days", "14 Days", "30 Days"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <div className="product-form-section-title"><h2>Digital Products & Services</h2><p>Optional file/license or appointment details.</p></div>
      <label className="setting-line toggle-line"><span><strong>Digital product</strong></span><input type="checkbox" checked={form.digitalProduct.enabled} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, enabled: event.target.checked } })} /></label>
      {form.digitalProduct.enabled ? <div className="private-form-row"><label>File URL<input value={form.digitalProduct.fileUrl} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, fileUrl: event.target.value } })} /></label><label>Download limit<input type="number" min="0" value={form.digitalProduct.downloadLimit} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, downloadLimit: event.target.value } })} /></label><label>License key<input value={form.digitalProduct.licenseKey} onChange={(event) => setForm({ ...form, digitalProduct: { ...form.digitalProduct, licenseKey: event.target.value } })} /></label></div> : null}
      <label className="setting-line toggle-line"><span><strong>Service listing</strong></span><input type="checkbox" checked={form.serviceDetails.enabled} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, enabled: event.target.checked } })} /></label>
      {form.serviceDetails.enabled ? <div className="private-form-row"><label>Duration<input value={form.serviceDetails.duration} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, duration: event.target.value } })} /></label><label>Location type<input value={form.serviceDetails.locationType} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, locationType: event.target.value } })} /></label><label className="setting-line toggle-line"><span><strong>Appointment required</strong></span><input type="checkbox" checked={form.serviceDetails.appointmentRequired} onChange={(event) => setForm({ ...form, serviceDetails: { ...form.serviceDetails, appointmentRequired: event.target.checked } })} /></label></div> : null}
      <div className="product-form-section-title"><h2>SEO</h2><p>Future discovery fields.</p></div>
      <div className="private-form-row"><label>Product slug<input value={form.seo.slug} onChange={(event) => setForm({ ...form, seo: { ...form.seo, slug: event.target.value } })} /></label><label>Meta title<input value={form.seo.metaTitle} onChange={(event) => setForm({ ...form, seo: { ...form.seo, metaTitle: event.target.value } })} /></label><label>Meta description<textarea rows={3} value={form.seo.metaDescription} onChange={(event) => setForm({ ...form, seo: { ...form.seo, metaDescription: event.target.value } })} /></label></div>
      <div className="product-form-section-title"><h2>Review & Publish</h2><p>Location, contact, and agreement.</p></div>
      <LocationFields value={form} onChange={(location) => setForm({ ...form, ...location })} />
      <div className="private-form-row"><label>Seller contact<input required placeholder="+971 50 123 4567, email, or Pi username" value={form.sellerContact} onChange={(event) => setForm({ ...form, sellerContact: event.target.value })} /></label></div>
      <label className="setting-line"><span><strong>Seller agreement</strong><small>I confirm this listing remains real, accurate, and review-ready. Read the official <Link className="seller-agreement-link" to="/seller-agreement" target="_blank" rel="noreferrer">SMAJ PI HUB Seller Agreement</Link>.</small></span><input type="checkbox" checked={form.sellerAgreementAccepted} onChange={(event) => setForm({ ...form, sellerAgreementAccepted: event.target.checked })} /></label>
      {error ? <div className="private-alert error">{error}</div> : null}<button className="private-primary-button" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
    </form></main>;
};

export default EditProductPage;
