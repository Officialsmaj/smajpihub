import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useAuthContext } from "../../contexts/AuthContext";

const tabs = ["Home", "Personal info", "Security", "Privacy & Data"] as const;
type Tab = typeof tabs[number];
const rows: Record<Exclude<Tab,"Home">, [string,string][]> = {
  "Personal info": [["Photo","Edit your profile photo"],["Name","Update your display name"],["Phone number","Add or update your phone"],["Email","Manage your contact email"],["Language","Choose your language"],["Address","Manage your address"]],
  Security: [["Password","Managed through your connected account"],["Two-step verification","Add another security layer"],["Recovery phone/email","Keep recovery options current"],["Connected accounts","Review linked accounts"],["Login activity/devices","Review active devices"]],
  "Privacy & Data": [["Privacy center","Control your privacy"],["Communication preferences","Manage how SMAJ contacts you"],["Connected app permissions","Review account access"],["Data controls","Download or manage your data"]],
};

const ManageAccountPage = () => { const { user } = useAuthContext(); const [tab,setTab] = useState<Tab>("Home"); const name=user?.displayName||user?.username||"Pi User"; return <main className="private-page manage-account-page"><header><Link to="/account"><ArrowBackOutlinedIcon /></Link><h1>SMAJ PI HUB Account</h1></header><nav>{tabs.map((item)=><button className={tab===item?"active":""} key={item} onClick={()=>setTab(item)}>{item}</button>)}</nav>{tab==="Home"?<section className="manage-account-home"><div className="manage-account-person"><span>{user?.avatar?<img src={user.avatar} alt=""/>:name.slice(0,1)}</span><h2>{name}</h2><p>@{user?.piUsername||user?.username}</p></div><div className="manage-account-cards">{[["Personal info","Your photo and contact details"],["Security","Login and account protection"],["Privacy & Data","Privacy and connected app controls"]].map(([title,text])=><button key={title} onClick={()=>setTab(title as Tab)}><strong>{title}</strong><span>{text}</span><ChevronRightOutlinedIcon /></button>)}</div><article className="account-checkup"><h2>Complete your account checkup</h2><p>Review your information and security options to keep your SMAJ PI HUB account protected.</p><button onClick={()=>setTab("Security")}>Begin checkup</button></article></section>:<section className="manage-account-detail"><h2>{tab}</h2>{rows[tab].map(([title,text])=><Link to={tab==="Personal info"?"/profile":"/settings"} key={title}><div><strong>{title}</strong><span>{text}</span></div><ChevronRightOutlinedIcon /></Link>)}</section>}</main>; };
export default ManageAccountPage;
