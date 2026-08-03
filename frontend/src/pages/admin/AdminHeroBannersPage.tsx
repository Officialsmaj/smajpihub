import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { axiosClient } from "../../lib/axiosClient";
import { uploadImage } from "../../lib/uploadImage";
import type { HeroBanner } from "../../lib/heroBanners";

const emptyForm = { placement: "dashboard" as HeroBanner["placement"], image: "", title: "", subtitle: "", search: "", active: true, order: 0 };

const AdminHeroBannersPage = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await axiosClient.get<{ banners: HeroBanner[] }>("/admin/hero-banners");
    setBanners(data.banners);
  }, []);

  useEffect(() => { void load().catch(() => setError("Could not load hero banners.")); }, [load]);

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return setError("Choose a JPG, PNG, or WebP image up to 5 MB.");
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.image) return setError("Choose a hero image.");
    setSaving(true); setError(""); setMessage("");
    try {
      const image = await uploadImage(form.image, `hero-${form.placement}`);
      const payload = { ...form, image };
      if (editingId) await axiosClient.patch(`/admin/hero-banners/${editingId}`, payload);
      else await axiosClient.post("/admin/hero-banners", payload);
      setMessage(editingId ? "Banner updated." : "Banner created.");
      setForm(emptyForm); setEditingId("");
      await load();
    } catch (reason: any) {
      setError(reason?.response?.data?.message || reason?.message || "Could not save banner.");
    } finally { setSaving(false); }
  };

  const edit = (banner: HeroBanner) => {
    setEditingId(banner._id);
    setForm({ placement: banner.placement, image: banner.image, title: banner.title || "", subtitle: banner.subtitle || "", search: banner.search || "", active: banner.active, order: banner.order || 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (banner: HeroBanner) => {
    if (!window.confirm(`Delete ${banner.title || "this banner"}?`)) return;
    await axiosClient.delete(`/admin/hero-banners/${banner._id}`);
    setMessage("Banner deleted.");
    await load();
  };

  const toggle = async (banner: HeroBanner) => {
    await axiosClient.patch(`/admin/hero-banners/${banner._id}`, { active: !banner.active });
    await load();
  };

  return <main className="private-page admin-hero-page">
    <section className="private-page-head"><div><p className="private-kicker">ADMIN PANEL</p><h1>Hero Banners</h1><p>Manage Dashboard and Store carousel images.</p></div></section>
    {message ? <div className="private-alert success">{message}</div> : null}
    {error ? <div className="private-alert error">{error}</div> : null}
    <form className="admin-hero-form" onSubmit={submit}>
      <div className="admin-hero-preview">{form.image ? <img src={form.image} alt="Banner preview" /> : <span>Choose an image to preview it</span>}</div>
      <div className="admin-hero-fields">
        <label>Location<select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as HeroBanner["placement"] })}><option value="dashboard">Dashboard</option><option value="store">Store</option></select></label>
        <label>Image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /></label>
        <label>Title<input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title" /></label>
        <label>Description<textarea value={form.subtitle} maxLength={300} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Short banner description" /></label>
        <label>Store search keyword<input value={form.search} maxLength={120} onChange={(e) => setForm({ ...form, search: e.target.value })} placeholder="Example: Electronics" /></label>
        <label>Display order<input type="number" min="0" max="999" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></label>
        <label className="admin-hero-check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
        <div className="admin-hero-actions"><button className="private-primary-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Update banner" : "Add banner"}</button>{editingId ? <button type="button" className="private-secondary-button" onClick={() => { setEditingId(""); setForm(emptyForm); }}>Cancel</button> : null}</div>
      </div>
    </form>
    <section className="admin-hero-list">
      {banners.map((banner) => <article key={banner._id}><img src={banner.image} alt={banner.title || `${banner.placement} banner`} /><div><span>{banner.placement} · order {banner.order}</span><h2>{banner.title || "Untitled banner"}</h2><p>{banner.subtitle || "No description"}</p><strong className={banner.active ? "active" : "inactive"}>{banner.active ? "Active" : "Hidden"}</strong></div><div><button onClick={() => edit(banner)}>Edit</button><button onClick={() => void toggle(banner)}>{banner.active ? "Hide" : "Show"}</button><button className="danger" onClick={() => void remove(banner)}>Delete</button></div></article>)}
      {!banners.length ? <div className="private-state"><h2>No managed banners yet</h2><p>The existing built-in images remain visible until you add active banners.</p></div> : null}
    </section>
  </main>;
};

export default AdminHeroBannersPage;
