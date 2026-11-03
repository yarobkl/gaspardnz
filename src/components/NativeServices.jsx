import { useEffect, useState } from "react";
import { listPackagesWithBreakdown, subscribePackagePricing, sumPackageTotal } from "../services/packagePricing.js";

const CATEGORIES = {
  FR: [
    { title: "Conseil en image", detail: "Style, allure et posture", image: "/images/style-parisien.jpg", project: "image_consulting" },
    { title: "Tenues d’événements", detail: "Mariage, cérémonie, gala…", image: "/images/smoking-dore.jpg", project: "wedding" },
    { title: "Accompagnement sur mesure", detail: "Une silhouette pensée pour vous", image: "/images/costume-creme.jpg", project: "other" },
  ],
  EN: [
    { title: "Image consulting", detail: "Style, presence and posture", image: "/images/style-parisien.jpg", project: "image_consulting" },
    { title: "Event dressing", detail: "Weddings, ceremonies, galas…", image: "/images/smoking-dore.jpg", project: "wedding" },
    { title: "Tailored guidance", detail: "A look made for you", image: "/images/costume-creme.jpg", project: "other" },
  ],
  ES: [
    { title: "Asesoría de imagen", detail: "Estilo, presencia y postura", image: "/images/style-parisien.jpg", project: "image_consulting" },
    { title: "Vestuario de eventos", detail: "Bodas, ceremonias, galas…", image: "/images/smoking-dore.jpg", project: "wedding" },
    { title: "Acompañamiento a medida", detail: "Un estilo pensado para usted", image: "/images/costume-creme.jpg", project: "other" },
  ],
  ZH: [
    { title: "形象咨询", detail: "风格、气质与仪态", image: "/images/style-parisien.jpg", project: "image_consulting" },
    { title: "活动着装", detail: "婚礼、典礼与晚宴", image: "/images/smoking-dore.jpg", project: "wedding" },
    { title: "专属定制服务", detail: "为您打造个人形象", image: "/images/costume-creme.jpg", project: "other" },
  ],
};

const LABELS = {
  FR: { formulas: "Formules", formulasDetail: "Nos offres publiées", ask: "Parler de ce projet", unavailable: "Les formules seront bientôt disponibles.", back: "Tous les services" },
  EN: { formulas: "Packages", formulasDetail: "Our published offers", ask: "Discuss this project", unavailable: "Packages will be available soon.", back: "All services" },
  ES: { formulas: "Fórmulas", formulasDetail: "Nuestras ofertas publicadas", ask: "Hablar de este proyecto", unavailable: "Las ofertas estarán disponibles pronto.", back: "Todos los servicios" },
  ZH: { formulas: "服务方案", formulasDetail: "已发布的方案", ask: "咨询此项目", unavailable: "服务方案即将上线。", back: "所有服务" },
};

export default function NativeServices({ lang, onContact }) {
  const [selected, setSelected] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const labels = LABELS[lang] || LABELS.FR;
  const categories = CATEGORIES[lang] || CATEGORIES.FR;

  useEffect(() => {
    let active = true;
    const load = () => listPackagesWithBreakdown()
      .then(rows => { if (active) { setPackages(rows.filter(row => row.published && !row.deleted_at)); setLoaded(true); } })
      .catch(() => { if (active) setLoaded(true); });
    load();
    const unsubscribe = subscribePackagePricing(load);
    return () => { active = false; unsubscribe(); };
  }, []);

  const formatPrice = (price, currency) => {
    if (price == null || !Number.isFinite(Number(price))) return "";
    return new Intl.NumberFormat(lang === "FR" ? "fr-FR" : "en-US", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(Number(price));
  };
  return <div className="gnz-native-service-list">
    {selected && <button className="gnz-native-inline-back" type="button" onClick={() => setSelected(null)}>‹ {labels.back}</button>}
    {selected === null ? <>
      {categories.map((item, index) => <button key={item.title} type="button" className="gnz-native-service-card" onClick={() => setSelected(index)}>
        <img src={item.image} alt="" loading="lazy" />
        <span><strong>{item.title}</strong><small>{item.detail}</small></span><span aria-hidden="true">›</span>
      </button>)}
      <button type="button" className="gnz-native-service-card" onClick={() => setSelected("formulas")}>
        <img src="/images/veste-navy-soiree.jpg" alt="" loading="lazy" />
        <span><strong>{labels.formulas}</strong><small>{labels.formulasDetail}</small></span><span aria-hidden="true">›</span>
      </button>
    </> : selected === "formulas" ? <>
      <h2>{labels.formulas}</h2>
      {loaded && !packages.length && <p className="gnz-native-muted">{labels.unavailable}</p>}
      {packages.map(pkg => <button key={pkg.id} className="gnz-native-package-card" type="button" onClick={() => onContact("other")}>
        <span><strong>{pkg.name}</strong><small>{pkg.subtitle || pkg.description}</small></span>
        <span>{formatPrice(pkg.package_groups?.length ? sumPackageTotal(pkg) : pkg.price, pkg.currency) || "›"}</span>
      </button>)}
      <button className="gnz-native-primary" type="button" onClick={() => onContact("other")}>{labels.ask}</button>
    </> : <>
      <div className="gnz-native-service-feature"><img src={categories[selected].image} alt="" /><h2>{categories[selected].title}</h2></div>
      <p className="gnz-native-muted">{categories[selected].detail}</p>
      <button className="gnz-native-primary" type="button" onClick={() => onContact(categories[selected].project)}>{labels.ask}</button>
    </>}
  </div>;
}
