import { useEffect, useState } from "react";
import { listPackagesWithBreakdown, subscribePackagePricing, sumPackageTotal } from "../services/packagePricing.js";
import { GROOM_CONCIERGE_OPTIONS, GROOM_CONCIERGE_PACKAGES } from "../data/groomConcierge.js";

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

// Parcours éditorial iOS uniquement. Les demandes passent par le CRM existant,
// sans paiement ni promesse de disponibilité avant validation par GaspardNZ.
const CONCIERGE = {
  FR: { title: "Groom Conciergerie", detail: "L'élégance à vos côtés, jusqu'au dernier détail", heading: "L'élégance à vos côtés, jusqu'au dernier détail.", intro: "Un accompagnement vestimentaire du marié, de la préparation de la tenue aux derniers ajustements du jour J.", ask: "Demander cette formule", prefill: "Demande Groom Conciergerie GaspardNZ", back: "Toutes les formules Groom Concierge", included: "Accompagnement prévu", options: "Options complémentaires", disclaimer: "Tarifs communiqués à titre indicatif. Disponibilités, lieu, déplacement et conditions à confirmer directement avec GaspardNZ. Aucun paiement dans l'application.", select: "Découvrir la formule", from: "Dès", inquire: "Parler de mon mariage", timing: "Durée de présence" },
  EN: { title: "Groom Concierge", detail: "Elegance by your side, down to the last detail", heading: "Elegance by your side, down to the last detail.", intro: "Personal dressing support for the groom, from preparing the outfit to final adjustments on the wedding day.", ask: "Enquire about this offer", prefill: "GaspardNZ Groom Concierge enquiry", back: "All Groom Concierge offers", included: "What's included", options: "Additional services", disclaimer: "Prices are indicative. Availability, location, travel and terms must be confirmed with GaspardNZ. No in-app payment.", select: "View offer", from: "From", inquire: "Discuss my wedding", timing: "Service duration" },
  ES: { title: "Groom Concierge", detail: "Elegancia a su lado, hasta el último detalle", heading: "Elegancia a su lado, hasta el último detalle.", intro: "Acompañamiento del novio desde la preparación del traje hasta los ajustes finales el día de la boda.", ask: "Consultar esta fórmula", prefill: "Consulta Groom Concierge GaspardNZ", back: "Todas las fórmulas Groom Concierge", included: "Servicio incluido", options: "Servicios adicionales", disclaimer: "Precios orientativos. Disponibilidad, ubicación, desplazamientos y condiciones sujetos a confirmación. Sin pago en la aplicación.", select: "Ver fórmula", from: "Desde", inquire: "Hablar de mi boda", timing: "Duración" },
  ZH: { title: "新郎礼宾服务", detail: "从准备到婚礼当天的贴心着装服务", heading: "优雅相伴，关注每个细节。", intro: "为新郎提供从礼服准备到婚礼当天最后调整的专属着装服务。", ask: "咨询此方案", prefill: "GaspardNZ 新郎礼宾服务咨询", back: "全部新郎礼宾方案", included: "服务内容", options: "附加服务", disclaimer: "价格仅供参考；档期、地点、交通与服务条款须由 GaspardNZ 确认。应用内不收款。", select: "查看方案", from: "起", inquire: "咨询我的婚礼", timing: "服务时长" },
};

export default function NativeServices({ lang, onContact }) {
  const [selected, setSelected] = useState(null);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [selectedGroomPackage, setSelectedGroomPackage] = useState(null);
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
    {selected && <button className="gnz-native-inline-back" type="button" onClick={() => {
      if (selectedGroomPackage) setSelectedGroomPackage(null);
      else if (selectedFormula) setSelectedFormula(null);
      else setSelected(null);
    }}>‹ {selectedGroomPackage ? concierge.back : selectedFormula ? labels.formulas : labels.back}</button>}
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
    </> : selected === "concierge" && selectedGroomPackage ? <>
      <article className="gnz-native-groom-detail">
        <span className="gnz-native-groom-kicker">GASPARD NZ PARIS · GROOM CONCIERGE</span>
        <h2>{selectedGroomPackage.name}</h2>
        <div className="gnz-native-groom-detail-meta">
          <strong>{selectedGroomPackage.fromPrice ? `${concierge.from} ` : ""}{formatPrice(selectedGroomPackage.price, "EUR")}</strong>
          <span>{concierge.timing} · {selectedGroomPackage.duration}</span>
        </div>
        <h3>{concierge.included}</h3>
        <ul>{selectedGroomPackage.inclusions.map(item => <li key={item}>{item}</li>)}</ul>
        {selectedGroomPackage.note && <p className="gnz-native-groom-note">{selectedGroomPackage.note}</p>}
        <p className="gnz-native-groom-disclaimer">{concierge.disclaimer}</p>
        <button className="gnz-native-primary" type="button" onClick={() => onContact("other", `${concierge.prefill} : ${selectedGroomPackage.name} (${selectedGroomPackage.duration}, ${selectedGroomPackage.fromPrice ? "dès " : ""}${selectedGroomPackage.price} €). Date et lieu souhaités : `)}>{concierge.ask} →</button>
      </article>
    </> : selected === "concierge" ? <>
      <div className="gnz-native-service-feature"><img src="/images/veste-bleue.jpg" alt="" /><h2>{concierge.title}</h2></div>
      <article className="gnz-native-concierge-intro">
        <h3>{concierge.heading}</h3>
        <p>{concierge.intro}</p>
      </article>
      <div className="gnz-native-groom-packages">
        {GROOM_CONCIERGE_PACKAGES.map(pkg => <button className="gnz-native-groom-card" key={pkg.id} type="button" onClick={() => setSelectedGroomPackage(pkg)} aria-label={`${concierge.select} ${pkg.name}, ${pkg.duration}, ${pkg.fromPrice ? `${concierge.from} ` : ""}${formatPrice(pkg.price, "EUR")}`}>
          <span><strong>{pkg.name}</strong><small>{pkg.duration}</small></span>
          <span><b>{pkg.fromPrice ? `${concierge.from} ` : ""}{formatPrice(pkg.price, "EUR")}</b><i aria-hidden="true">›</i></span>
        </button>)}
      </div>
      <div className="gnz-native-groom-options">
        <h3>{concierge.options}</h3>
        {GROOM_CONCIERGE_OPTIONS.map(option => <div key={option.name}><span>{option.name}{option.duration ? <small> · {option.duration}</small> : null}</span><strong>{option.price}</strong></div>)}
      </div>
      <p className="gnz-native-groom-disclaimer">{concierge.disclaimer}</p>
      <button className="gnz-native-primary" type="button" onClick={() => onContact("other", concierge.prefill)}>{concierge.inquire} →</button>
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

