import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient.js";
const initial = { category:"arrivage",title:"",body:"",image_url:"",target_url:"",status:"draft",scheduled_at:"" };
const labels={arrivage:"Nouvel arrivage",promotion:"Promotion",evenement:"Événement",showroom:"Showroom",service:"Nouveau service",actualite:"Actualité",rappel:"Rappel",personnalise:"Message personnalisé"};
export default function AdminNotifications() {
 const [form,setForm]=useState(initial),[rows,setRows]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(false),[pairCode,setPairCode]=useState(""),[pairBusy,setPairBusy]=useState(false),[testBusy,setTestBusy]=useState(false),[testResult,setTestResult]=useState(""),[sendingId,setSendingId]=useState(""),[sendResult,setSendResult]=useState(""),[subscribers,setSubscribers]=useState(0);
 async function request(method,body) {
   const {data}=await supabase.auth.getSession();
   if(!data?.session?.access_token) throw new Error("Session expirée");
   const response=await fetch("/api/admin-notifications",{method,headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},...(body?{body:JSON.stringify(body)}:{})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok) throw new Error(result.error||"Service indisponible");
   return result;
 }
 async function createPairCode(){
   setPairBusy(true);setTestResult("");
   try{const {data}=await supabase.auth.getSession();if(!data?.session?.access_token)throw new Error("Session expirée");
     const response=await fetch("/api/admin-push-pair",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token}});
     const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"Appairage indisponible");
     setPairCode(result.code);
   }catch(e){setTestResult(e.message);}finally{setPairBusy(false);}
 }
 async function sendTest(){
   setTestResult("");setTestBusy(true);
   try {
     const {data}=await supabase.auth.getSession();
     if(!data?.session?.access_token) throw new Error("Session expirée");
     const response=await fetch("/api/admin-notification-test",{
       method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},
       body:JSON.stringify({title:form.title.trim()||"GaspardNZ — Test",body:form.body.trim()||"Votre notification de test fonctionne."})
     });
     const result=await response.json().catch(()=>({}));
     if(!response.ok||!result.success) throw new Error(result.reason||result.error||"Apple a refusé la notification.");
     setTestResult("Apple a accepté le push (APNs 200). Vérifiez sa réception sur l’iPhone.");
   }catch(e){setTestResult("Échec du test : "+e.message);}
   finally{setTestBusy(false);}
 }
 async function load(){try {const result=await request("GET");setRows(result.campaigns||[]);setSubscribers(result.subscribers||0);setError("");}catch(e){setError(e.message);}}
 useEffect(()=>{load();},[]);
 async function save(e){e.preventDefault();setLoading(true);setError("");try{await request("POST",form);setForm(initial);await load();}catch(e){setError(e.message);}finally{setLoading(false);}}
 async function sendCampaign(row){
   if(!window.confirm(`Envoyer « ${row.title} » aux iPhone ayant accepté les notifications ?`))return;
   setSendingId(row.id);setSendResult("");
   try{
     const {data}=await supabase.auth.getSession();
     if(!data?.session?.access_token)throw new Error("Session expirée");
     let remaining=1,sent=0,failed=0;
     while(remaining>0){
       const response=await fetch("/api/notifications/send-campaign",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+data.session.access_token},body:JSON.stringify({id:row.id})});
       const result=await response.json().catch(()=>({}));
       if(!response.ok)throw new Error(result.error||"Envoi indisponible");
       remaining=result.remaining;sent+=result.sent||0;failed+=result.failed||0;
       setSendResult(`${sent} accepté(s) par Apple, ${failed} échec(s), ${remaining} restant(s).`);
     }
     await load();
   }catch(e){setSendResult("Envoi interrompu : "+e.message+". Reprenez cette campagne après vérification.");}
   finally{setSendingId("");}
 }
 return <div><div className="gnz-page-heading"><div><h1>Notifications clients</h1><p>{subscribers} iPhone{ subscribers>1?"s":"" } inscrit{ subscribers>1?"s":"" } aux alertes.</p></div></div>
 <section className="gnz-card" style={{padding:16,marginBottom:16}}><h2>Test push Apple — iPhone</h2><p>Associez une seule fois votre iPhone avec un code temporaire. Ensuite, envoyez les tests sans manipuler de token.</p><button type="button" className="gnz-primary-button" disabled={pairBusy} onClick={createPairCode}>{pairBusy?"Préparation…":"Créer un code d’appairage"}</button>{pairCode&&<p role="status">Code valable 10 minutes : <strong style={{overflowWrap:"anywhere"}}>{pairCode}</strong> — ouvrez GaspardNZ sur l’iPhone et saisissez ce code dans les réglages des notifications.</p>}<button type="button" className="gnz-primary-button" disabled={testBusy} onClick={sendTest}>{testBusy?"Envoi vers Apple…":"Envoyer un push de test sur mon iPhone"}</button>{testResult&&<p role="status">{testResult}</p>}</section>
 <div className="gnz-alert">Les campagnes partent vers les personnes ayant activé les notifications dans l’application. Le lien HTTPS ajouté sera ouvert au toucher : les pages GaspardNZ s’ouvrent dans l’application quand une vue native correspond, les autres liens s’ouvrent dans le navigateur intégré.</div>{sendResult&&<p role="status">{sendResult}</p>}
 {error&&<div className="gnz-alert gnz-alert-error" role="alert">{error}</div>}
 <div className="gnz-split"><article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Campagnes enregistrées</strong><span>{rows.length} campagne(s)</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Campagne</th><th>Type</th><th>Statut</th><th>Action</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.title}</strong><span className="gnz-table-sub">{r.body}</span></td><td>{labels[r.category]||r.category}</td><td>{r.status}</td><td>{["draft","sending"].includes(r.status)&&<button type="button" disabled={!!sendingId} onClick={()=>sendCampaign(r)}>{sendingId===r.id?"Envoi…":r.status==="sending"?"Reprendre":"Envoyer"}</button>}</td></tr>)}{!rows.length&&<tr><td colSpan="4">Aucune campagne enregistrée.</td></tr>}</tbody></table></div></article>
 <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Nouvelle campagne</strong></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
 <label className="gnz-field">Catégorie<select className="gnz-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
 <label className="gnz-field">Titre<input className="gnz-input" required maxLength="120" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
 <label className="gnz-field">Message<textarea className="gnz-textarea" required maxLength="500" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label>
 <label className="gnz-field">Lien à ouvrir au toucher (facultatif)<input className="gnz-input" type="url" placeholder="https://… (site, TikTok, Instagram)" value={form.target_url} onChange={e=>setForm({...form,target_url:e.target.value})}/><small>Une adresse HTTPS peut pointer vers GaspardNZ ou un site externe. Sans lien, le toucher ouvre l’application.</small></label>
 <label className="gnz-field">URL image GaspardNZ (facultatif)<input className="gnz-input" type="url" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/></label>
 <label className="gnz-field">Mode<select className="gnz-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Brouillon</option><option value="scheduled">Préparer une programmation (envoi désactivé)</option></select></label>
 {form.status==="scheduled"&&<label className="gnz-field">Date prévue<input className="gnz-input" type="datetime-local" required value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/></label>}
 <button className="gnz-primary-button" disabled={loading}>{loading?"Enregistrement…":"Enregistrer sans envoyer"}</button>
 </form></aside></div></div>;
}
