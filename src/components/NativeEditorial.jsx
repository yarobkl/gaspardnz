import { useContext, useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { nativeFeedback } from "../utils/nativeHaptics.js";
import { LangCtx } from "../context.jsx";
import { getActualites } from "../data/actualitesData.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";

const readingMinutes = text => Math.max(1, Math.ceil(String(text || "").trim().split(/\s+/).filter(Boolean).length / 200));
const readingLabel = (text, lang) => `${readingMinutes(text)} ${lang === "FR" ? "min de lecture" : lang === "EN" ? "min read" : lang === "ES" ? "min de lectura" : "分钟阅读"}`;
const mediaUrl = value => /^(https?:|data:|blob:)/i.test(value || "") ? value : `${import.meta.env.BASE_URL}${String(value || "").replace(/^\/+/, "")}`;

export function NativeNews({ initialId = null }) {
  const { lang } = useContext(LangCtx);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const swipeStart = useRef(null);
  const suppressArticleOpen = useRef(false);
  const warmedPhotos = useRef(new Set());
  const reduceMotion = useReducedMotion();
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
  const active = featured.length ? featured[((index % featured.length) + featured.length) % featured.length] : null;
  const visibleRecent = showAll ? items : items.slice(0, 4);
  const chooseFeatured = (nextIndex) => {
    if (featured.length < 2) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(((nextIndex % featured.length) + featured.length) % featured.length);
  };
  const slideFeatured = (step) => {
    if (featured.length < 2) return;
    setDirection(step);
    setIndex(i => ((i + step) % featured.length + featured.length) % featured.length);
    nativeFeedback("selection");
  };
  useEffect(() => {
    if (!featured.length || typeof window.Image !== "function") return;
    const selected = ((index % featured.length) + featured.length) % featured.length;
    for (const offset of [-1, 1]) {
      const nearby = featured[((selected + offset + featured.length) % featured.length)];
      const url = nearby?.photos?.[0] ? mediaUrl(nearby.photos[0]) : "";
      if (!url || warmedPhotos.current.has(url)) continue;
      warmedPhotos.current.add(url);
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    }
  }, [index, items, lang]);
  useEffect(() => {
    if (initialId && items.length) {
      const found = items.find(item => String(item.id) === String(initialId));
      if (found) { setArticle(found); setPhotoIndex(0); }
    }
  }, [initialId, items]);
  useEffect(() => {
    if (!article) return undefined;
    const onKeyDown = event => {
      if (event.key === "Escape") setArticle(null);
      if (event.key === "ArrowRight") setPhotoIndex(i => (i + 1) % Math.max(1, article.photos?.length || 1));
      if (event.key === "ArrowLeft") setPhotoIndex(i => (i - 1 + Math.max(1, article.photos?.length || 1)) % Math.max(1, article.photos?.length || 1));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [article]);
  const openArticle = (item) => { setArticle(item); setPhotoIndex(0); };
  return <div className="gnz-native-news gnz-native-news-magazine">
    {!items.length && <p className="gnz-native-muted">{lang === "FR" ? "Les actualités seront bientôt disponibles." : lang === "EN" ? "News will be available soon." : lang === "ES" ? "Las noticias estarán disponibles pronto." : "资讯即将上线。"}</p>}
    {active && <section className="gnz-native-news-carousel" data-no-tab-swipe aria-label={lang === "FR" ? "Actualités à la une" : "Featured stories"}
      onTouchStart={event => {
        suppressArticleOpen.current = false;
        const touch = event.touches?.[0];
        if (touch) swipeStart.current = {x: touch.clientX, y: touch.clientY};
      }}
      onTouchEnd={event => {
        const start = swipeStart.current;
        swipeStart.current = null;
        const touch = event.changedTouches?.[0];
        if (!start || !touch) return;
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          suppressArticleOpen.current = true;
          if (event.cancelable) event.preventDefault();
          slideFeatured(dx < 0 ? 1 : -1);
        }
      }}
      onTouchCancel={() => { swipeStart.current = null; suppressArticleOpen.current = false; }}
    >
      <div className="gnz-native-news-carousel-stage">
        <AnimatePresence mode="sync" initial={false} custom={direction}>
          <motion.button type="button" className="gnz-native-news-feature"
            key={String(active.id) + "-" + index}
            custom={direction}
            initial={reduceMotion ? false : { opacity: 0, x: direction * 28, scale: 1.014 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={step => reduceMotion ? {opacity: 0} : {opacity: 0, x: -step * 28, scale: .988}}
            transition={reduceMotion ? {duration: 0} : {duration: .30, ease: [.2, .75, .2, 1]}}
            onClick={() => {
              if (suppressArticleOpen.current) { suppressArticleOpen.current = false; return; }
              openArticle(active);
            }}
            aria-label={active.title}
          >
            <img src={mediaUrl(active.photos[0])} alt="" loading="eager" decoding="async" />
            <div className="gnz-native-news-feature-copy">
              <span className="gnz-native-news-feature-tag">{active.tag || (lang === "FR" ? "Actualité" : "News")}</span>
              <h2>{active.title}</h2>
              <small>{[active.date, readingLabel(active.text, lang)].filter(Boolean).join(" · ")}</small>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>
      {featured.length > 1 && <div className="gnz-native-news-pagination" role="group" aria-label={lang === "FR" ? "Choisir une actualité" : "Choose a story"}>
        {featured.map((item, i) => <button key={String(item.id) + "-" + i} type="button" onClick={() => chooseFeatured(i)}
          aria-label={item.title} aria-current={index % featured.length === i ? "true" : undefined}
          className={index % featured.length === i ? "active" : ""}>
          <span />
        </button>)}
      </div>}
    </section>}
    {items.length > 0 && <section className="gnz-native-news-recent" aria-label={lang === "FR" ? "Articles récents" : "Recent articles"}>
      <div className="gnz-native-news-recent-heading">
        <h2>{lang === "FR" ? "Articles récents" : lang === "EN" ? "Recent articles" : lang === "ES" ? "Artículos recientes" : "最新文章"}</h2>
        {items.length > 4 && <button type="button" className="gnz-native-news-see-all" onClick={() => setShowAll(value => !value)}
          aria-expanded={showAll}>
          {showAll ? (lang === "FR" ? "Réduire" : lang === "EN" ? "Show less" : lang === "ES" ? "Ver menos" : "收起")
            : (lang === "FR" ? "Voir tout" : lang === "EN" ? "See all" : lang === "ES" ? "Ver todo" : "查看全部")}
          <span aria-hidden="true">{showAll ? "↑" : "→"}</span>
        </button>}
      </div>
      <div className="gnz-native-article-list gnz-native-news-card-grid">
        {visibleRecent.map((item, i) => <button type="button" key={String(item.id) + "-" + i}
          className="gnz-native-news-card" onClick={() => openArticle(item)}
          aria-label={item.title}>
          {item.photos?.[0] ?
            <div className="gnz-native-news-card-media"><img src={mediaUrl(item.photos[0])} loading="lazy" decoding="async" alt="" /></div> :
            <div className="gnz-native-news-card-media gnz-native-news-card-without-photo" aria-hidden="true"><span>{item.tag || "GASPARDNZ"}</span></div>}
          <div className="gnz-native-news-card-body">
            <span className="gnz-native-news-card-tag">{item.tag}</span>
            <h3>{item.title}</h3>
            <small>{[item.date, readingLabel(item.text, lang)].filter(Boolean).join(" · ")}</small>
          </div>
        </button>)}
      </div>
    </section>}
    {article && <div className="gnz-native-news-reader" role="dialog" aria-modal="true" aria-label={article.title}>
      <div className="gnz-native-news-reader-card" data-no-tab-swipe>
        <button type="button" className="gnz-native-news-reader-close" onClick={() => setArticle(null)} aria-label="Fermer">×</button>
        {article.photos?.length > 0 && <div className="gnz-native-news-reader-media"><img src={mediaUrl(article.photos[photoIndex])} alt={article.title} />{article.photos.length > 1 && <><button type="button" onClick={() => setPhotoIndex((photoIndex - 1 + article.photos.length) % article.photos.length)} aria-label="Photo précédente">‹</button><button type="button" onClick={() => setPhotoIndex((photoIndex + 1) % article.photos.length)} aria-label="Photo suivante">›</button><div className="gnz-native-news-reader-dots">{article.photos.map((_, i) => <span key={i} className={i === photoIndex ? "active" : ""} />)}</div></>}</div>}
        <div className="gnz-native-news-reader-copy"><span>{[article.tag, article.date, readingLabel(article.text, lang)].filter(Boolean).join(" · ")}</span><h2>{article.title}</h2>{String(article.text || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
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
