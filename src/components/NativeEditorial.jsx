import { useContext, useMemo, useState } from "react";
import { LangCtx } from "../context.jsx";
import { getActualites } from "../data/actualitesData.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";

const mediaUrl = value => /^(https?:|data:|blob:)/i.test(value || "") ? value : `${import.meta.env.BASE_URL}${String(value || "").replace(/^\/+/, "")}`;

export function NativeNews() {
  const { lang } = useContext(LangCtx);
  const [index, setIndex] = useState(0);
  const fallback = useMemo(() => getActualites(lang), [lang]);
  const { rows, source } = usePublicCollection("news_posts", {
    fallback, filters: [{ type: "eq", column: "locale", value: lang }],
    orderBy: "published_at", ascending: false,
  });
  const items = source === "supabase" ? rows.map(row => ({
    id: row.id, title: row.title, date: row.metadata?.date_label || "",
    tag: row.metadata?.tag || "Actualité", text: row.body || row.excerpt || "",
    photos: Array.isArray(row.gallery) && row.gallery.length ? row.gallery : row.cover_url ? [row.cover_url] : [],
  })) : rows;
  const featured = items.filter(item => item.photos?.length);
  const active = featured[index % featured.length];
  return <div className="gnz-native-news">
    {!items.length && <p className="gnz-native-muted">{lang === "FR" ? "Les actualités seront bientôt disponibles." : lang === "EN" ? "News will be available soon." : lang === "ES" ? "Las noticias estarán disponibles pronto." : "资讯即将上线。"}</p>}
    {active && <article className="gnz-native-news-feature">
      <img src={mediaUrl(active.photos[0])} alt="" loading="eager" />
      <div><span>{active.tag}</span><h2>{active.title}</h2><small>{active.date}</small></div>
    </article>}
    {featured.length > 1 && <div className="gnz-native-dots" aria-label="Choisir une actualité">
      {featured.map((item, i) => <button key={item.id} type="button" onClick={() => setIndex(i)} aria-label={item.title} aria-current={index % featured.length === i ? "true" : undefined} />)}
    </div>}
    {items.length > 0 && <><h2 className="gnz-native-subheading">{lang === "FR" ? "Articles récents" : lang === "EN" ? "Recent stories" : lang === "ES" ? "Artículos recientes" : "最新文章"}</h2>
      <div className="gnz-native-article-list">{items.map(item => <article key={item.id}>
        <span>{item.tag} · {item.date}</span><h3>{item.title}</h3><p>{String(item.text || "").split("\n\n")[0]}</p>
      </article>)}</div></>}
  </div>;
}

export function NativeShowroom({ onContact }) {
  const { lang } = useContext(LangCtx);
  const [index, setIndex] = useState(0);
  const { rows } = usePublicCollection("content_albums", {
    fallback: [], filters: [{ type: "eq", column: "section_key", value: "showroom" }], orderBy: "sort_order",
  });
  const fallback = [
    { src: "/images/decontracte/showroom.jpg", label: "Au showroom GaspardNZ" },
    { src: "/images/decontracte/look-navy.jpg", label: "Style casual chic" },
    { src: "/images/decontracte/look-jaune.jpg", label: "Style estival" },
  ];
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
