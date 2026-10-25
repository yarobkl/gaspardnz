import { useState } from 'react';
const descriptions = {
 visitors:'Un identifiant visiteur distinct par ligne. Aucune identité déduite des anciens clics.',
 intentions:'Intentions enregistrées : un clic ne prouve ni un message envoyé ni un rendez-vous confirmé.',
 whatsapp_clicks:'Ouvertures demandées de WhatsApp. Aucun message envoyé n’est présumé.',
 site_conversion_rate:'Visiteurs de la période reliés à une demande créée sur la même période / visiteurs suivis distincts. Les visiteurs sans consentement analytique ne sont pas mesurés.',
 sales_conversion_rate:'Prospects identifiés créés sur la période et reliés à un client avant sa fin / prospects identifiés de cette cohorte.',
 revenue:'Valeur cumulée des fiches clients créées sur la période ; ce montant n’est pas le chiffre d’affaires encaissé pendant cette période.',
};
export default function MetricDetails({metric,data,onClose}) {
 const [page,setPage]=useState(0);
 if(!metric || !data?.period) return null;
 const rows=data?.details?.[metric.key] || [];
 return <section className="gnz-card" aria-label={`Détail ${metric.label}`} style={{marginBottom:20}}>
  <header className="gnz-card-header"><div><strong>{metric.label} — {rows.length} ligne(s)</strong><p>{new Date(data.period.from).toLocaleString('fr-FR')} → {new Date(data.period.to).toLocaleString('fr-FR')} (fin exclue)</p></div><button className="gnz-secondary-button" onClick={onClose}>Fermer le détail</button></header>
  <div className="gnz-card-body"><p>{descriptions[metric.key] || 'Données enregistrées sur la période sélectionnée, hors prospects de test.'}</p></div>
  <div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Nom</th><th>Téléphone / email</th><th>Projet / événement</th><th>Date et heure</th><th>CRM</th></tr></thead><tbody>
   {rows.slice(page*50,(page+1)*50).map((row,index)=><tr key={`${row.id}-${index}`}><td>{row.full_name || 'Anonyme / non renseigné'}</td><td>{row.phone || row.email || '—'}</td><td>{row.request_type || row.title || row.event_name || row.channel || 'Visite'}</td><td>{new Date(row.created_at).toLocaleString('fr-FR', {timeZone:'Europe/Paris'})} (Paris)</td><td>{(row.lead_id || (row.full_name && ['leads','site_conversion_rate','sales_conversion_rate'].includes(metric.key))) ? <a href={`/admin/crm?lead=${encodeURIComponent(row.lead_id || row.id)}`}>Ouvrir la fiche</a> : '—'}</td></tr>)}
   {!rows.length && <tr><td colSpan="5">Aucun enregistrement pour cet indicateur.</td></tr>}
  </tbody></table></div>
  {rows.length>50 && <div className="gnz-card-body"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>Précédent</button> {page+1} / {Math.ceil(rows.length/50)} <button disabled={(page+1)*50>=rows.length} onClick={()=>setPage(p=>p+1)}>Suivant</button></div>}
 </section>;
}
