const BUTTONS = {
  FR: {
    packages: "Les formules",
    showroom: "Le showroom",
    booking: "Prendre rendez-vous",
    gallery: "La galerie",
    details: "Voir les détails",
    prices: "Les prix",
    whatsapp: "Ouvrir WhatsApp",
    contact: "Contacter Gaspard",
    more: "En savoir plus",
  },
  EN: {
    packages: "Packages",
    showroom: "Showroom",
    booking: "Book an appointment",
    gallery: "Gallery",
    details: "See details",
    prices: "Prices",
    whatsapp: "Open WhatsApp",
    contact: "Contact Gaspard",
    more: "Learn more",
  },
  ES: {
    packages: "Paquetes",
    showroom: "Showroom",
    booking: "Reservar una cita",
    gallery: "Galería",
    details: "Ver detalles",
    prices: "Precios",
    whatsapp: "Abrir WhatsApp",
    contact: "Contactar a Gaspard",
    more: "Saber más",
  },
  ZH: {
    packages: "套餐",
    showroom: "展厅",
    booking: "预约",
    gallery: "画廊",
    details: "查看详情",
    prices: "价格",
    whatsapp: "打开 WhatsApp",
    contact: "联系 Gaspard",
    more: "了解更多",
  },
};

const copy = (lang, key) => (BUTTONS[lang] || BUTTONS.FR)[key];
const btns = (lang, keys) => keys.map((key) => copy(lang, key));

const DATA = {
  FR: {
    greet: {
      rep: "Bienvenue chez **Gaspard NZ**.\n\nJe suis votre assistant virtuel. Je peux vous renseigner sur les formules, le showroom, les tarifs, les créations ou la prise de rendez-vous.",
      btns: btns("FR", ["packages", "showroom", "booking", "gallery"]),
    },
    fallback: {
      rep: "Je n'ai pas bien compris votre question. Voici comment je peux vous aider :",
      btns: btns("FR", ["packages", "showroom", "booking", "contact"]),
    },
    entries: [
      ["hello", ["bonjour","salut","hello","bonsoir","hi","hey","salam"], "Bonjour ! Comment puis-je vous aider aujourd'hui ?", ["packages","showroom","booking","gallery"]],
      ["packages", ["formule","formules","pack","offre","package","mariage","service","prestation"], "Gaspard NZ propose des formules pour votre mariage :\n\n**Formule GNZ Showroom** — costumes disponibles sur place, essayage immédiat.\n**Formule Prestige** — habillage sur-mesure selon vos goûts.\n**Pack Complet Prestige** — costume sur-mesure, accompagnement et maîtrise de cérémonie.\n\nLes prix sont disponibles sur demande.", ["details","booking","prices"]],
      ["prestige", ["prestige","sur mesure","sur-mesure","personnalisé"], "La **Formule Prestige** est une expérience complète : Gaspard sélectionne chaque pièce selon vos goûts personnels — costume, chemise, cravate, boutons de manchettes et accessoires.", ["booking","prices"]],
      ["price", ["prix","tarif","coût","cout","combien","budget"], "Les prix sont disponibles sur demande, car chaque projet est unique. Gaspard établit un devis personnalisé après un échange sur WhatsApp ou en rendez-vous.", ["booking","whatsapp"]],
      ["showroom", ["showroom","boutique","magasin","essayage","essayer","sur place","venir"], "Le showroom Gaspard NZ est un espace privé aménagé comme une boutique de luxe. Vous essayez les pièces disponibles sur rendez-vous, en Île-de-France.", ["booking","gallery","packages"]],
      ["location", ["où","localisation","idf","île-de-france","ile de france","paris","déplacement","province","étranger"], "Gaspard NZ est basé en Île-de-France. Il se déplace en France et à l'étranger ; les frais de déplacement et d'hôtel hors IDF sont à prévoir selon le projet.", ["booking","whatsapp"]],
      ["payment", ["acompte","paiement","payer","régler","contrat","signature","annulation"], "Après validation du devis, un contrat est établi. Le paiement se fait en deux temps : acompte à la réservation puis solde avant la prestation.", ["booking","whatsapp"]],
      ["gallery", ["galerie","photo","photos","look","tenue","style","création","creation"], "La galerie présente les créations Gaspard NZ : costumes, vestes structurées, chemises, smoking et silhouettes signature.", ["gallery","booking"]],
      ["bio", ["qui est","gaspard","biographie","bio","parcours","histoire","créateur"], "**Gaspard NZ** est styliste, habilleur et maître de cérémonie basé à Paris. Depuis plus de 7 ans, il crée des silhouettes pensées pour les grands moments.", ["packages","booking","gallery"]],
      ["contact", ["contact","whatsapp","appel","appeler","joindre","parler","message","rdv","rendez-vous","réservation","reserver"], "Vous pouvez contacter Gaspard directement sur WhatsApp. Pour un premier échange sur votre projet, c'est le plus simple.", ["whatsapp","booking"]],
      ["social", ["instagram","tiktok","facebook","youtube","réseaux","reseaux","suivre","communauté"], "Suivez Gaspard NZ sur Instagram, TikTok, Facebook et YouTube pour voir les looks, les coulisses et les nouvelles créations.", []],
    ],
  },
  EN: {
    greet: {
      rep: "Welcome to **Gaspard NZ**.\n\nI am your virtual assistant. I can help with packages, the showroom, prices, creations and appointments.",
      btns: btns("EN", ["packages", "showroom", "booking", "gallery"]),
    },
    fallback: {
      rep: "I did not fully understand your question. Here is how I can help:",
      btns: btns("EN", ["packages", "showroom", "booking", "contact"]),
    },
    entries: [
      ["hello", ["hello","hi","hey","bonjour","good evening"], "Hello! How can I help you today?", ["packages","showroom","booking","gallery"]],
      ["packages", ["package","packages","offer","wedding","service","suit"], "Gaspard NZ offers wedding packages:\n\n**GNZ Showroom Package** — suits available on site with immediate fitting.\n**Prestige Package** — bespoke styling based on your taste.\n**Complete Prestige Pack** — bespoke suit, styling support and master of ceremony service.\n\nPrices are available on request.", ["details","booking","prices"]],
      ["prestige", ["prestige","bespoke","custom","tailored"], "The **Prestige Package** is a full experience: Gaspard selects every piece according to your personal taste — suit, shirt, tie, cufflinks and accessories.", ["booking","prices"]],
      ["price", ["price","cost","budget","how much"], "Prices are available on request because every project is unique. Gaspard prepares a personalized quote after a WhatsApp exchange or appointment.", ["booking","whatsapp"]],
      ["showroom", ["showroom","boutique","store","fitting","try","visit"], "The Gaspard NZ showroom is a private space designed like a luxury boutique. You try available pieces by appointment in the Paris region.", ["booking","gallery","packages"]],
      ["location", ["where","location","paris","travel","france","abroad"], "Gaspard NZ is based in the Paris region. He travels in France and abroad; travel and hotel costs outside the region depend on the project.", ["booking","whatsapp"]],
      ["payment", ["deposit","payment","contract","signature","cancel"], "After the quote is approved, a contract is prepared. Payment is made in two stages: deposit at booking, then balance before the service.", ["booking","whatsapp"]],
      ["gallery", ["gallery","photo","photos","look","style","creation"], "The gallery presents Gaspard NZ creations: suits, structured jackets, shirts, tuxedos and signature silhouettes.", ["gallery","booking"]],
      ["bio", ["who is","gaspard","biography","bio","story","designer"], "**Gaspard NZ** is a stylist, dresser and master of ceremonies based in Paris. For over 7 years, he has created silhouettes for major life moments.", ["packages","booking","gallery"]],
      ["contact", ["contact","whatsapp","call","message","appointment","book"], "You can contact Gaspard directly on WhatsApp. For a first conversation about your project, it is the easiest way.", ["whatsapp","booking"]],
      ["social", ["instagram","tiktok","facebook","youtube","social","follow","community"], "Follow Gaspard NZ on Instagram, TikTok, Facebook and YouTube for looks, behind the scenes and new creations.", []],
    ],
  },
  ES: {
    greet: {
      rep: "Bienvenido a **Gaspard NZ**.\n\nSoy tu asistente virtual. Puedo ayudarte con los paquetes, el showroom, los precios, las creaciones y las citas.",
      btns: btns("ES", ["packages", "showroom", "booking", "gallery"]),
    },
    fallback: {
      rep: "No entendí completamente tu pregunta. Así puedo ayudarte:",
      btns: btns("ES", ["packages", "showroom", "booking", "contact"]),
    },
    entries: [
      ["hello", ["hola","buenas","hello","hi","bonjour"], "¡Hola! ¿Cómo puedo ayudarte hoy?", ["packages","showroom","booking","gallery"]],
      ["packages", ["paquete","paquetes","oferta","boda","servicio","traje"], "Gaspard NZ propone paquetes para bodas:\n\n**Paquete GNZ Showroom** — trajes disponibles en el showroom con prueba inmediata.\n**Paquete Prestige** — estilismo a medida según tus gustos.\n**Pack Completo Prestige** — traje a medida, acompañamiento y maestro de ceremonia.\n\nLos precios están disponibles bajo solicitud.", ["details","booking","prices"]],
      ["prestige", ["prestige","a medida","personalizado"], "El **Paquete Prestige** es una experiencia completa: Gaspard selecciona cada pieza según tus gustos — traje, camisa, corbata, gemelos y accesorios.", ["booking","prices"]],
      ["price", ["precio","tarifa","coste","costo","presupuesto","cuánto"], "Los precios están disponibles bajo solicitud porque cada proyecto es único. Gaspard prepara un presupuesto personalizado después de hablar por WhatsApp o en una cita.", ["booking","whatsapp"]],
      ["showroom", ["showroom","boutique","tienda","prueba","probar","visitar"], "El showroom Gaspard NZ es un espacio privado pensado como una boutique de lujo. Puedes probar piezas disponibles con cita previa en la región de París.", ["booking","gallery","packages"]],
      ["location", ["dónde","ubicación","parís","viaje","francia","extranjero"], "Gaspard NZ está basado en la región de París. Se desplaza en Francia y al extranjero; los gastos de viaje y hotel fuera de la región dependen del proyecto.", ["booking","whatsapp"]],
      ["payment", ["depósito","pago","contrato","firma","cancelación"], "Después de validar el presupuesto, se prepara un contrato. El pago se realiza en dos etapas: depósito al reservar y saldo antes de la prestación.", ["booking","whatsapp"]],
      ["gallery", ["galería","foto","fotos","look","estilo","creación"], "La galería presenta creaciones Gaspard NZ: trajes, chaquetas estructuradas, camisas, smoking y siluetas signature.", ["gallery","booking"]],
      ["bio", ["quién es","gaspard","biografía","bio","historia","diseñador"], "**Gaspard NZ** es estilista, habilleur y maestro de ceremonias basado en París. Desde hace más de 7 años crea siluetas para grandes momentos.", ["packages","booking","gallery"]],
      ["contact", ["contacto","whatsapp","llamar","mensaje","cita","reservar"], "Puedes contactar con Gaspard directamente por WhatsApp. Para un primer intercambio sobre tu proyecto, es la forma más sencilla.", ["whatsapp","booking"]],
      ["social", ["instagram","tiktok","facebook","youtube","redes","seguir","comunidad"], "Sigue a Gaspard NZ en Instagram, TikTok, Facebook y YouTube para ver looks, bastidores y nuevas creaciones.", []],
    ],
  },
  ZH: {
    greet: {
      rep: "欢迎来到 **Gaspard NZ**。\n\n我是你的虚拟助手，可以为你介绍套餐、展厅、价格、作品和预约方式。",
      btns: btns("ZH", ["packages", "showroom", "booking", "gallery"]),
    },
    fallback: {
      rep: "我没有完全理解你的问题。你可以从这里开始：",
      btns: btns("ZH", ["packages", "showroom", "booking", "contact"]),
    },
    entries: [
      ["hello", ["你好","您好","hello","hi","bonjour"], "你好！今天我可以怎样帮助你？", ["packages","showroom","booking","gallery"]],
      ["packages", ["套餐","婚礼","服务","西装","造型"], "Gaspard NZ 提供婚礼造型套餐：\n\n**GNZ 展厅套餐** — 现场可试穿的西装。\n**Prestige 套餐** — 根据个人品味打造定制造型。\n**Complete Prestige 套餐** — 定制西装、造型陪同与婚礼主持服务。\n\n价格可按需求咨询。", ["details","booking","prices"]],
      ["prestige", ["prestige","定制","量身","高级"], "**Prestige 套餐** 是完整体验：Gaspard 会根据你的个人品味选择每一件单品 — 西装、衬衫、领带、袖扣与配饰。", ["booking","prices"]],
      ["price", ["价格","多少钱","预算","费用"], "价格按需求咨询，因为每个项目都不同。Gaspard 会在 WhatsApp 沟通或预约之后给出个性化报价。", ["booking","whatsapp"]],
      ["showroom", ["展厅","精品店","试穿","到店","参观"], "Gaspard NZ 展厅是一个私密空间，像高级精品店一样布置。你可以预约在巴黎地区试穿现有单品。", ["booking","gallery","packages"]],
      ["location", ["哪里","位置","巴黎","法国","出行","海外"], "Gaspard NZ 常驻巴黎地区，也可以前往法国各地及海外。巴黎地区以外的交通和酒店费用根据项目计算。", ["booking","whatsapp"]],
      ["payment", ["定金","付款","合同","签名","取消"], "报价确认后会准备合同。付款分两步：预约时支付定金，服务前支付尾款。", ["booking","whatsapp"]],
      ["gallery", ["画廊","照片","造型","风格","作品"], "画廊展示 Gaspard NZ 的作品：西装、结构感外套、衬衫、礼服和标志性轮廓。", ["gallery","booking"]],
      ["bio", ["谁是","gaspard","简介","故事","设计师"], "**Gaspard NZ** 是常驻巴黎的造型师、着装顾问和婚礼主持人。7 年多来，他为重要人生时刻打造造型。", ["packages","booking","gallery"]],
      ["contact", ["联系","whatsapp","电话","消息","预约"], "你可以直接通过 WhatsApp 联系 Gaspard。第一次沟通项目时，这是最简单的方式。", ["whatsapp","booking"]],
      ["social", ["instagram","tiktok","facebook","youtube","社交","关注","社区"], "在 Instagram、TikTok、Facebook 和 YouTube 关注 Gaspard NZ，查看造型、幕后内容和新作品。", []],
    ],
  },
};

export const getChatLabels = (lang = "FR") => BUTTONS[lang] || BUTTONS.FR;

export const getGreeting = (lang = "FR") => (DATA[lang] || DATA.FR).greet;

export const getFallbackReply = (lang = "FR") => (DATA[lang] || DATA.FR).fallback;

export function normalise(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[àâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/[ç]/g, "c")
    .trim();
}

export function findReply(msg, lang = "FR") {
  const pack = DATA[lang] || DATA.FR;
  const low = normalise(msg);
  for (const [intent, keys, rep, buttonKeys] of pack.entries) {
    if (keys.some((key) => low.includes(normalise(key)))) {
      return { intent, rep, btns: btns(lang, buttonKeys) };
    }
  }
  return pack.fallback;
}
