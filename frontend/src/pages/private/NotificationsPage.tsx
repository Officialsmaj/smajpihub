import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { axiosClient } from "../../lib/axiosClient";
import type { AppNotification } from "../../types/marketplace";

const demo: AppNotification[] = [
  { _id:"demo-order",type:"new_order",title:"Your order has been confirmed",message:"iPhone 13 Pro order was successfully created.",read:false,relatedId:"orders",createdAt:new Date(Date.now()-120000).toISOString(),image:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=160&q=80" },
  { _id:"demo-message",type:"new_message",title:"Ahmed Electronics sent you a message",message:"Yes, delivery is available.",read:false,relatedId:"messages",createdAt:new Date(Date.now()-600000).toISOString(),image:"https://i.pravatar.cc/160?img=12" },
  { _id:"demo-payment",type:"order_paid",title:"Payment received successfully",message:"0.0045 Pi · ≈ $0.01414",read:true,relatedId:"orders",createdAt:new Date(Date.now()-1800000).toISOString() },
  { _id:"demo-security",type:"security_alert",title:"New login detected",message:"Your SMAJ PI HUB account was accessed.",read:true,relatedId:"settings",createdAt:new Date().toISOString() },
  { _id:"demo-update",type:"announcement",title:"SMAJ PI HUB update",message:"New improvements are available.",read:true,relatedId:"dashboard",createdAt:new Date(Date.now()-86400000).toISOString() },
];
const tabs=["All","Orders","Messages","Payments","Security","Updates"];
const category=(type:string)=>type.includes("message")?"Messages":type.includes("paid")||type.includes("payment")?"Payments":type.includes("security")?"Security":type.includes("announcement")||type.includes("update")?"Updates":"Orders";

const NotificationsPage=()=>{ const navigate=useNavigate(); const [items,setItems]=useState<AppNotification[]>(demo); const [tab,setTab]=useState("All"); const [deleteId,setDeleteId]=useState<string|null>(null);
  useEffect(()=>{ axiosClient.get("/notifications").then(({data})=>setItems((current)=>[...data.notifications,...current.filter((item)=>item._id.startsWith("demo-"))])).catch(()=>undefined); },[]);
  const visible=useMemo(()=>tab==="All"?items:items.filter((item)=>category(item.type)===tab),[items,tab]);
  const open=async(item:AppNotification)=>{ if(!item.read&&!item._id.startsWith("demo-")) await axiosClient.patch(`/notifications/${item._id}/read`); setItems((all)=>all.map((entry)=>entry._id===item._id?{...entry,read:true}:entry)); const target=item.relatedId==="messages"||item.type.includes("message")?"/messages":item.relatedId==="settings"||item.type.includes("security")?"/settings":item.relatedId==="dashboard"?"/dashboard":"/orders"; navigate(target); };
  const remove=async()=>{ if(!deleteId)return; if(!deleteId.startsWith("demo-"))await axiosClient.delete(`/notifications/${deleteId}`); setItems((all)=>all.filter((item)=>item._id!==deleteId)); setDeleteId(null); };
  const markAll=async()=>{ await axiosClient.patch("/notifications/read-all").catch(()=>undefined); setItems((current)=>current.map((item)=>({...item,read:true}))); };
  return <main className="private-page notifications-page"><section className="private-page-head"><div><p className="private-kicker">ACTIVITY CENTER</p><h1>Notifications</h1></div><button className="private-secondary-button" onClick={()=>void markAll()}>Mark all as read</button></section><nav className="notification-tabs">{tabs.map((item)=><button className={tab===item?"active":""} onClick={()=>setTab(item)} key={item}>{item}</button>)}</nav><section className="notification-list rich">{visible.map((item)=><article key={item._id} className={item.read?"":"unread"}><button className="notification-open" onClick={()=>void open(item)}>{item.image?<img src={item.image} alt=""/>:<span className={`notification-type ${category(item.type).toLowerCase()}`}>{category(item.type).slice(0,1)}</span>}<div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>{!item.read?<i className="notification-unread-dot"/>:null}</button><button className="notification-delete" aria-label="Delete notification" onClick={()=>setDeleteId(item._id)}><DeleteOutlineIcon/></button></article>)}</section>{deleteId?<div className="confirm-modal-backdrop" onMouseDown={()=>setDeleteId(null)}><section className="confirm-modal" onMouseDown={(event)=>event.stopPropagation()}><h2>Delete notification?</h2><p>Are you sure you want to remove this notification?</p><div className="confirm-modal-actions"><button className="modal-cancel-button" onClick={()=>setDeleteId(null)}>Cancel</button><button className="modal-signout-button" onClick={()=>void remove()}>Delete</button></div></section></div>:null}</main>;
};
export default NotificationsPage;
