import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../lib/axiosClient";
import type { Order, Product } from "../../types/marketplace";

type SellerData = {
  products: Product[];
  orders: Order[];
  stats: { totalProducts: number; totalOrders: number; pendingOrders: number; paidOrders: number };
};

const SellerPage = () => {
  const [data, setData] = useState<SellerData | null>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const response = await axiosClient.get<SellerData>("/marketplace/seller");
    setData(response.data);
  }, []);
  useEffect(() => { axiosClient.get<SellerData>("/marketplace/seller").then(({ data }) => setData(data)); }, []);

  const availability = async (product: Product) => {
    await axiosClient.patch(`/marketplace/seller/products/${product._id}/availability`, { active: !product.active });
    setMessage(product.active ? "Product marked sold out." : "Product marked available.");
    await load();
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.title}? This cannot be undone.`)) return;
    await axiosClient.delete(`/marketplace/seller/products/${product._id}`);
    setMessage("Product deleted.");
    await load();
  };

  return (
    <main className="private-page">
      <section className="private-page-head"><div><p className="private-kicker">SELLER WORKSPACE</p><h1>Seller Dashboard</h1><p>Manage your own products and monitor incoming orders.</p></div><Link className="private-primary-button" to="/add-product">Add Product</Link></section>
      {message ? <div className="private-alert success">{message}</div> : null}
      {!data ? <div className="private-state">Loading seller dashboard...</div> : (
        <>
          <section className="stats-grid">
            <article><span>Total products</span><strong>{data.stats.totalProducts}</strong></article>
            <article><span>Total orders</span><strong>{data.stats.totalOrders}</strong></article>
            <article><span>Pending orders</span><strong>{data.stats.pendingOrders}</strong></article>
            <article><span>Paid orders</span><strong>{data.stats.paidOrders}</strong></article>
          </section>
          <section className="management-section"><div className="section-title"><h2>Your Products</h2><span>{data.products.length} listings</span></div>
            {data.products.length === 0 ? <div className="private-state">You have not published a product yet.</div> : <div className="management-list">{data.products.map((product) => (
              <article className="management-row" key={product._id}>
                <img src={product.image} alt="" /><div className="management-main"><h3>{product.title}</h3><p>{product.pricePi} Pi · {product.category}</p></div>
                <span className={`availability ${product.active ? "available" : "sold"}`}>{product.active ? "Available" : "Sold out"}</span>
                <div className="row-actions"><Link to={`/edit-product/${product._id}`}>Edit</Link><button onClick={() => void availability(product)}>{product.active ? "Sold out" : "Available"}</button><button className="danger" onClick={() => void remove(product)}>Delete</button></div>
              </article>
            ))}</div>}
          </section>
          <section className="management-section"><div className="section-title"><h2>Recent Orders</h2><Link to="/orders">View all</Link></div>
            <div className="management-list">{data.orders.slice(0, 5).map((order) => <article className="management-row compact" key={order._id}><div className="management-main"><h3>{order.productTitle}</h3><p>{order.buyerName} · {order.pricePi} Pi</p></div><span className={`order-status ${order.status}`}>{order.status}</span></article>)}</div>
          </section>
        </>
      )}
    </main>
  );
};

export default SellerPage;
