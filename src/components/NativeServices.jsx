import { useEffect, useState } from "react";
import { listPackagesWithBreakdown, subscribePackagePricing, sumPackageTotal } from "../services/packagePricing.js";

const CATEGORIES = {
  FR: [
    { title: "Conseil en image", detail: "Style, allure et posture", image: "/images/style-parisien.jpg", project: "image_consulting" },
    { title: "Tenues d’événements", detail: "Mariage, cérémonie, gala…", image: "/images/smoking-dore.jpg", project: "wedding" },
    { title: "Accompagnement sur mesure", detail: "Un devis personnalisé, adapté à votre besoin", image: "/images/costume-creme.jpg", project: "other" },
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
  FR: { formulas: "Formules", formulasDetail: "Nos offres publiées", ask: "Contacter GaspardNZ pour cette formule", unavailable: "Les formules seront bientôt disponibles.", back: "Tous les services", details: "Détails de la formule", request: "Cette formule vous intéresse ?", assistance: "Un projet ou une occasion particulière ?", discuss: "Parler de mon projet" },
  EN: { formulas: "Packages", formulasDetail: "Our published offers", ask: "Discuss this project", unavailable: "Packages will be available soon.", back: "All services", details: "Package details", request: "Interested in this package?", assistance: "A project or a special occasion?", discuss: "Discuss my project" },
  ES: { formulas: "Fórmulas", formulasDetail: "Nuestras ofertas publicadas", ask: "Hablar de este proyecto", unavailable: "Las ofertas estarán disponibles pronto.", back: "Todos los servicios", details: "Detalles de la fórmula", request: "¿Le interesa esta fórmula?", assistance: "¿Un proyecto o una ocasión especial?", discuss: "Hablar de mi proyecto" },
  ZH: { formulas: "服务方案", formulasDetail: "已发布的方案", ask: "咨询此项目", unavailable: "服务方案即将上线。", back: "所有服务", details: "方案详情", request: "对这个方案感兴趣？", assistance: "有特别的活动或穿搭计划吗？", discuss: "咨询我的项目" },
};

// Parcours de conciergerie réservé à l'application iOS. Aucune offre ni aucun
// tarif n'est annoncé tant que ses modalités ne sont pas publiées.
const CONCIERGE = {
  FR: { title: "Conciergerie", detail: "Votre demande, un accompagnement personnalisé", heading: "Une attention particulière pour votre projet", intro: "Mariage, événement ou besoin spécifique : décrivez votre demande à GaspardNZ pour échanger sur un accompagnement adapté.", ask: "Présenter ma demande", prefill: "Demande de conciergerie GaspardNZ" },
  EN: { title: "Concierge", detail: "Personal guidance for your request", heading: "A personal touch for your project", intro: "A wedding, an event or a specific need? Tell GaspardNZ what you have in mind to discuss suitable support.", ask: "Send my request", prefill: "GaspardNZ concierge enquiry" },
  ES: { title: "Conserjería", detail: "Acompañamiento personalizado", heading: "Una atención especial para su proyecto", intro: "¿Una boda, un evento o una necesidad especial? Cuéntenos su proyecto para hablar de un acompañamiento a medida.", ask: "Enviar mi solicitud", prefill: "Solicitud de conserjería GaspardNZ" },
  ZH: { title: "专属礼宾服务", detail: "为您的需求提供专属协助", heading: "为您的计划提供贴心关注", intro: "婚礼、活动或特别需求？请向 GaspardNZ 描述您的计划，了解适合的协助方式。", ask: "提交我的需求", prefill: "GaspardNZ 礼宾服务咨询" },
};

export default function NativeServices({ lang, onContact }) {
  const [selected, setSelected] = useState(null);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const labels = LABELS[lang] || LABELS.FR;
  const categories = CATEGORIES[lang] || CATEGORIES.FR;
  const concierge = CONCIERGE[lang] || CONCIERGE.FR;

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
    {selected && <button className="gnz-native-inline-back" type="button" onClick={() => selectedFormula ? setSelectedFormula(null) : setSelected(null)}>‹ {selectedFormula ? labels.formulas : labels.back}</button>}
    {selected === null && selectedFormula === null ? <>
      <button type="button" className="gnz-native-service-card" onClick={() => setSelected("formulas")}>
        <img src="/images/veste-navy-soiree.jpg" alt="" loading="lazy" />
        <span><strong>{labels.formulas}</strong><small>{labels.formulasDetail}</small></span><span aria-hidden="true">›</span>
      </button>
      <button type="button" className="gnz-native-service-card" onClick={() => setSelected("concierge")}>
        <img src="/images/veste-bleue.jpg" alt="" loading="lazy" />
        <span><strong>{concierge.title}</strong><small>{concierge.detail}</small></span><span aria-hidden="true">›</span>
      </button>
      {categories.map((item) => <button key={item.title} type="button" className="gnz-native-service-card" onClick={() => setSelected(item)}>
        <img src={item.image} alt="" loading="lazy" />
        <span><strong>{item.title}</strong><small>{item.detail}</small></span><span aria-hidden="true">›</span>
      </button>)}
      <div className="gnz-native-service-assistance">
        <p>{labels.assistance}</p>
        <button type="button" onClick={() => onContact("other")}>{labels.discuss}<span aria-hidden="true">→</span></button>
      </div>
    </> : selectedFormula ? <>
      <article className="gnz-native-formula-detail">
        <h2>{selectedFormula.name}</h2>
        {selectedFormula.subtitle && <p className="gnz-native-formula-subtitle">{selectedFormula.subtitle}</p>}
        {selectedFormula.description && <p className="gnz-native-muted">{selectedFormula.description}</p>}
        {selectedFormula.package_groups?.length > 0 && <div className="gnz-native-formula-breakdown"><h3>{labels.details}</h3>{selectedFormula.package_groups.map(group => <div key={group.id || group.label}><strong>{group.label}</strong>{group.tag && <small>{group.tag}</small>}{group.package_items?.map(item => <span key={item.id || item.label}>✓ {item.label}</span>)}</div>)}</div>}
        <p className="gnz-native-formula-request">{labels.request}</p>
        <button className="gnz-native-primary" type="button" onClick={() => onContact("other", `${labels.formulas} : ${selectedFormula.name}`)}>{labels.ask} →</button>
      </article>
    </> : selected === "concierge" ? <>
      <div className="gnz-native-service-feature"><img src="/images/veste-bleue.jpg" alt="" /><h2>{concierge.title}</h2></div>
      <article className="gnz-native-concierge-intro">
        <h3>{concierge.heading}</h3>
        <p>{concierge.intro}</p>
      </article>
      <button className="gnz-native-primary" type="button" onClick={() => onContact("other", concierge.prefill)}>{concierge.ask} →</button>
    </> : selected === "formulas" ? <>
      <h2>{labels.formulas}</h2>
      {loaded && !packages.length && <p className="gnz-native-muted">{labels.unavailable}</p>}
      {packages.map(pkg => <button key={pkg.id} className="gnz-native-package-card" type="button" onClick={() => setSelectedFormula(pkg)}>
        <span><strong>{pkg.name}</strong><small>{pkg.subtitle || pkg.description}</small></span>
        <span>{formatPrice(pkg.package_groups?.length ? sumPackageTotal(pkg) : pkg.price, pkg.currency) || "›"}</span>
      </button>)}
      <button className="gnz-native-primary" type="button" onClick={() => onContact("other")}>{labels.ask}</button>
    </> : <>
      <div className="gnz-native-service-feature"><img src={selected.image} alt="" /><h2>{selected.title}</h2></div>
      <p className="gnz-native-muted">{selected.detail}</p>
      <button className="gnz-native-primary" type="button" onClick={() => onContact(selected.project)}>{labels.ask}</button>
    </>}
  </div>;
}

