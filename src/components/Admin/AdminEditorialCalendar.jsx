import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient.js";
import { editorialSlug, prepareEditorialWeek } from "../../data/editorialWeek.js";
import "../../styles/admin-v2.css";

export default function AdminEditorialCalendar() {
  const [drafts, setDrafts] = useState(() => prepareEditorialWeek());
  const [programmed, setProgrammed] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const initialWeekLoaded = useRef(false);

  const load = async () => {
    const { data, error: problem } = await supabase.from("news_posts")
      .select("id,slug,title,published,published_at,metadata,created_at")
      .order("created_at", { ascending: false }).limit(150);
    if (problem) throw problem;
    const weekly = (data || []).filter((post) => post.metadata?.editorial_batch === "weekly")
      .sort((a, b) => String(a.metadata?.scheduled_at || a.published_at || "").localeCompare(String(b.metadata?.scheduled_at || b.published_at || "")));
    setProgrammed(weekly);
    if (!initialWeekLoaded.current) {
      initialWeekLoaded.current = true;
      const last = weekly.filter((post) => post.metadata?.scheduled_at).at(-1);
      if (last && new Date(last.metadata.scheduled_at).getTime() >= Date.now()) {
        setDrafts(prepareEditorialWeek(new Date(last.metadata.scheduled_at)));
      }
    }
  };
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);
  const edit = (index, change) => setDrafts((current) => current.map((item, i) => i === index ? { ...item, ...change } : item));

  const scheduleWeek = async () => {
    setError(""); setMessage("");
    if (drafts.some((item) => !item.title.trim() || !item.body.trim() || !item.excerpt.trim() || !item.scheduled_at || !Number.isFinite(new Date(item.scheduled_at).getTime()) || new Date(item.scheduled_at).getTime() <= Date.now() + 60000)) {
      setError("Renseignez un titre, un résumé, un article et une date future pour chaque journée."); return;
    }
    const slugs = drafts.map((item) => `conseil-${item.scheduled_at.slice(0, 10)}-${editorialSlug(item.title)}`);
    if (new Set(slugs).size !== slugs.length) { setError("Deux articles ont la même date et le même titre."); return; }
    if (!window.confirm("Programmer ces sept articles ? Chaque jour, l’article sera publié et une notification sera envoyée si vous l’avez activée.")) return;
    setBusy(true);
    try {
      const { data: existing, error: existsError } = await supabase.from("news_posts").select("slug").in("slug", slugs);
      if (existsError) throw existsError;
      if (existing?.length) throw new Error("Un ou plusieurs articles existent déjà pour cette semaine. Modifiez la date ou le titre avant de recommencer.");
      const payload = drafts.map((item, i) => ({
        slug: slugs[i], title: item.title.trim(), excerpt: item.excerpt.trim(), body: item.body.trim(),
        locale: "FR", cover_url: null, gallery: [], published: false, published_at: null,
        metadata: { editorial_batch: "weekly", scheduled_at: new Date(item.scheduled_at).toISOString(),
          auto_notify: Boolean(item.auto_notify), tag: item.tag || "Conseil style", location: "Paris" },
      }));
      const { error: saveError } = await supabase.from("news_posts").insert(payload);
      if (saveError) throw saveError;
      setMessage("Les 7 articles sont enregistrés et programmés. Ils restent invisibles jusqu’à leur date.");
      await load();
      setDrafts(prepareEditorialWeek(new Date(drafts[6].scheduled_at)));
    } catch (e) { setError(e.message || "Programmation impossible."); }
    finally { setBusy(false); }
  };
  const cancel = async (post) => {
    if (!window.confirm(`Annuler la publication de « ${post.title} » ?`)) return;
    setBusy(true); setError("");
    try {
      const { error: problem } = await supabase.from("news_posts")
        .update({ metadata: { ...post.metadata, scheduled_at: null, auto_notify: false, editorial_batch: "cancelled" } })
        .eq("id", post.id).eq("published", false);
      if (problem) throw problem;
      await load();
      setMessage("Programmation annulée : l’article reste en brouillon.");
    } catch (e) { setError(e.message || "Annulation impossible."); }
    finally { setBusy(false); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Calendrier éditorial</h1><p>Préparez les sept prochains jours. Les articles sont publiés et notifiés automatiquement à leur heure prévue (Paris).</p></div></div>
    <div className="gnz-alert">Les notifications sont envoyées uniquement aux personnes ayant accepté les alertes sur iPhone. Vous pouvez relire et modifier les articles ci-dessous avant de les programmer.</div>
    {error && <div className="gnz-alert gnz-alert-error" role="alert">{error}</div>}
    {message && <div className="gnz-alert" role="status">{message}</div>}
    <section className="gnz-card" style={{ padding: 16, marginBottom: 20 }}>
      <header className="gnz-card-header"><div className="gnz-card-title"><strong>Les 7 prochains articles</strong><span>Contenus proposés, personnalisables avant publication</span></div></header>
      <div className="gnz-section-grid" style={{ padding: "8px 0" }}>
        {drafts.map((item, i) => <article className="gnz-card gnz-col-6" key={i} style={{ padding: 16 }}>
          <strong>Jour {i + 1}</strong>
          <label className="gnz-field">Date et heure de publication<input className="gnz-input" type="datetime-local" value={item.scheduled_at} onChange={(e) => edit(i, { scheduled_at: e.target.value })} required /></label>
          <label className="gnz-field">Titre<input className="gnz-input" maxLength="120" value={item.title} onChange={(e) => edit(i, { title: e.target.value })} /></label>
          <label className="gnz-field">Résumé<textarea className="gnz-textarea" rows={2} value={item.excerpt} onChange={(e) => edit(i, { excerpt: e.target.value })} /></label>
          <label className="gnz-field">Article<textarea className="gnz-textarea" rows={8} value={item.body} onChange={(e) => edit(i, { body: e.target.value })} /></label>
          <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(item.auto_notify)} onChange={(e) => edit(i, { auto_notify: e.target.checked })} />Notification push automatique à la publication</label>
        </article>)}
      </div>
      <div className="gnz-page-actions" style={{ padding: "8px 0" }}><button type="button" className="gnz-primary-button" disabled={busy} onClick={scheduleWeek}>{busy ? "Programmation…" : "Programmer les 7 articles"}</button><button type="button" className="gnz-secondary-button" disabled={busy} onClick={() => setDrafts(prepareEditorialWeek())}>Recommencer la préparation</button></div>
    </section>
    <section className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Programmations enregistrées</strong><span>{programmed.length} article(s) de calendrier</span></div></header>
      <div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Article</th><th>Date</th><th>État</th><th>Notification</th><th>Action</th></tr></thead><tbody>
      {programmed.map((post) => <tr key={post.id}><td><strong>{post.title}</strong></td><td>{post.metadata?.scheduled_at ? new Date(post.metadata.scheduled_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }) : "—"}</td><td><span className={`gnz-status ${post.published ? "success" : "warning"}`}>{post.published ? "Publié" : post.metadata?.scheduled_at ? "Programmé" : "Brouillon"}</span></td><td>{post.metadata?.auto_notify ? "Activée" : "Désactivée"}</td><td>{!post.published && post.metadata?.scheduled_at ? <button type="button" className="gnz-secondary-button" disabled={busy} onClick={() => cancel(post)}>Annuler</button> : "—"}</td></tr>)}
      {!programmed.length && <tr><td colSpan="5">Aucun article programmé pour le moment.</td></tr>}
      </tbody></table></div>
      <p style={{ padding: 16, margin: 0, fontSize: 12 }}>Pour retoucher un article enregistré, ouvrez « Contenu du site » puis « Actualités ».</p>
    </section>
  </div>;
}
