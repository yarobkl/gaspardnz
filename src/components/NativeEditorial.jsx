import { useContext, useMemo, useState, useEffect } from "react";
import { LangCtx } from "../context.jsx";
import { getActualites } from "../data/actualitesData.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";

const readingMinutes = text => Math.max(1, Math.ceil(String(text || "").trim().split(/\\s+/).filter(Boolean).length / 200));
const readingLabel = (text, lang) => `${readingMinutes(text)} ${lang === "FR" ? "min de lecture" : lang === "EN" ? "min read" : lang === "ES" ? "min de lectura" : "分钟阅读"}`;
const mediaUrl = value => /^(https?:|data:|blob:)/i.test(value || "") ? value : `${import.meta.env.BASE_URL}${String(value || "").replace(/^\/+/, "")}`;

export function NativeNews({ initialId = null }) {
  const { lang } = useContext(LangCtx);
  const [index, setIndex] = useState(0);
  const [article, setArticle] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const fallback = useMemo(() => getActualites(lang), [lang]);
  const { rows, source } = usePublicCollection("news_posts", {
    fallback, filters: [{ type: "eq", column: "locale", value: lang }],
    orderBy: "published_at", ascending: false,
  });
  // Les articles historiques restent visibles même lorsqu'une actualité est
  // publiée depuis l'administration : Supabase complète le fil au lieu de
  // remplacer brutalement le contenu éditorial déjà présent dans l'application.
  const items = useMemo(() => {
    const remoteItems = source === "supabase" ? rows.map(row => ({
      id: row.id, title: row.title, date: row.metadata?.date_label || "",
      tag: row.metadata?.tag || "Actualité", text: row.body || row.excerpt || "",
      photos: Array.isArray(row.gallery) && row.gallery.length ? row.gallery : row.cover_url ? [row.cover_url] : [],
    })) : [];
    return [...remoteItems, ...fallback.filter((item) => !remoteItems.some((remote) => String(remote.id) === String(item.id)))];
  }, [source, rows, fallback]);
  const featured = items.filter(item => item.photos?.length);
  const active = featured[index % featured.length];
  useEffect(() => {
    if (initialId && items.length) {
      const found = items.find(item => String(item.id) === String(initialId));
      if (found) { setArticle(found); setPhotoIndex(0); }
    }
  }, [initialId, items]);
  const openArticle = (item) => { setArticle(item); setPhotoIndex(0); };
  return <div className="gnz-native-news">
    {!items.length && <p className="gnz-native-muted">{lang === "FR" ? "Les actualités seront bientôt disponibles." : lang === "EN" ? "News will be available soon." : lang === "ES" ? "Las noticias estarán disponibles pronto." : "资讯即将上线。"}</p>}
    {items.length > 0 && <div className="gnz-native-journal-intro"><span>{lang === "FR" ? "LE JOURNAL" : "THE JOURNAL"}</span><h2>{lang === "FR" ? "Le style se raconte." : "Stories of style."}</h2><p>{lang === "FR" ? "Inspirations, conseils du styliste et regards sur l’élégance." : "Style inspiration and advice from the stylist."}</p></div>}
    {active && <button type="button" className="gnz-native-news-feature" onClick={() => openArticle(active)}>
      <img src={mediaUrl(active.photos[0])} alt="" loading="eager" />
      <div><span>{lang === "FR" ? "À LA UNE" : "FEATURED"} · {active.tag}</span><h2>{active.title}</h2><small>{[active.date, readingLabel(active.text, lang)].filter(Boolean).join(" · ")}</small></div>
    </button>}
    {featured.length > 1 && <div className="gnz-native-dots" aria-label="Choisir une actualité">
      {featured.map((item, i) => <button key={item.id} type="button" onClick={() => setIndex(i)} aria-label={item.title} aria-current={index % featured.length === i ? "true" : undefined} />)}
    </div>}
    {items.length > 0 && <><h2 className="gnz-native-subheading">{lang === "FR" ? "À découvrir" : lang === "EN" ? "Recent stories" : lang === "ES" ? "Artículos recientes" : "最新文章"}</h2>
      <div className="gnz-native-article-list">{items.map(item => <button type="button" key={item.id} onClick={() => openArticle(item)}>
        <span>{item.tag} · {item.date}</span><h3>{item.title}</h3><p>{String(item.text || "").split("\n\n")[0]}</p>
      </button>)}</div></>}
    {article && <div className="gnz-native-news-reader" role="dialog" aria-modal="true" aria-label={article.title}>
      <div className="gnz-native-news-reader-card">
        <button type="button" className="gnz-native-news-reader-close" onClick={() => setArticle(null)} aria-label="Fermer">×</button>
        {article.photos?.length > 0 && <div className="gnz-native-news-reader-media"><img src={mediaUrl(article.photos[photoIndex])} alt={article.title} />{article.photos.length > 1 && <><button type="button" onClick={() => setPhotoIndex((photoIndex - 1 + article.photos.length) % article.photos.length)} aria-label="Photo précédente">‹</button><button type="button" onClick={() => setPhotoIndex((photoIndex + 1) % article.photos.length)} aria-label="Photo suivante">›</button><div className="gnz-native-news-reader-dots">{article.photos.map((_, i) => <span key={i} className={i === photoIndex ? "active" : ""} />)}</div></>}</div>}
        <div className="gnz-native-news-reader-copy"><span>{[article.tag, article.date, readingLabel(article.text, lang)].filter(Boolean).join(" · ")}</span><h2>{article.title}</h2><p>{article.text}</p></div>
      </div>
    </div>}
  </div>;
}

export function NativeShowroom({ onContact }) {
  const { lang } = useContext(LangCtx);
  const [index, setIndex] = useState(0);
  const { rows } = usePublicCollection("content_albums", {
    fallback: [], filters: [{ type: "eq", column: "section_key", value: "showroom" }], orderBy: "sort_order",
  });
  // Une seule photo officielle est disponible pour l'instant. La structure
  // accepte déjà plusieurs éléments lorsqu'ils seront publiés depuis l'admin.
  const fallback = [{ src: "/images/decontracte/showroom.jpg", label: "Au showroom GaspardNZ" }];
  const photos = Array.isArray(rows[0]?.items) && rows[0].items.length ? rows[0].items : fallback;
  const active = photos[index % photos.length];
  return <div className="gnz-native-showroom">
    {active && <img src={mediaUrl(active.src || active.url || active.public_url)} alt={active.label || "Showroom GaspardNZ"} />}
    {photos.length > 1 && <div className="gnz-native-dots" aria-label="Choisir une photo du showroom">
      {photos.map((photo, i) => <button key={i} type="button" onClick={() => setIndex(i)} aria-label={photo.label || `Photo ${i+1}`} aria-current={index % photos.length === i ? "true" : undefined} />)}
    </div>}
    <button className="gnz-native-primary" type="button" onClick={onContact}>{lang === "FR" ? "Contacter le showroom" : lang === "EN" ? "Contact the showroom" : lang === "ES" ? "Contactar el showroom" : "联系展厅"}</button>
  </div>;
}
