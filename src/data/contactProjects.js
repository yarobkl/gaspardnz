// The nine choices approved for the contact form. Stable IDs are stored in
// the CRM; labels and WhatsApp wording follow the visitor's language.
export const CONTACT_PROJECTS = [
  { id: "wedding", FR: "Mariage — stylisme et habillage", EN: "Wedding — styling and dressing", ES: "Boda — estilismo y vestuario", ZH: "婚礼造型与着装", phrase: { FR: "pour mon mariage", EN: "for my wedding", ES: "para mi boda", ZH: "婚礼造型与着装" } },
  { id: "gala", FR: "Gala de prestige", EN: "Prestige gala", ES: "Gala de prestigio", ZH: "高级晚会", phrase: { FR: "pour un gala de prestige", EN: "for a prestige gala", ES: "para una gala de prestigio", ZH: "高级晚会造型" } },
  { id: "vip_evening", FR: "Soirée VIP", EN: "VIP evening", ES: "Noche VIP", ZH: "VIP 晚宴", phrase: { FR: "pour une soirée VIP", EN: "for a VIP evening", ES: "para una noche VIP", ZH: "VIP 晚宴造型" } },
  { id: "business", FR: "Événement professionnel", EN: "Professional event", ES: "Evento profesional", ZH: "商务活动", phrase: { FR: "pour un événement professionnel", EN: "for a professional event", ES: "para un evento profesional", ZH: "商务活动造型" } },
  { id: "ceremony", FR: "Cérémonie", EN: "Ceremony", ES: "Ceremonia", ZH: "典礼", phrase: { FR: "pour une cérémonie", EN: "for a ceremony", ES: "para una ceremonia", ZH: "典礼造型" } },
  { id: "shooting", FR: "Shooting photo professionnel", EN: "Professional photo shoot", ES: "Sesión de fotos profesional", ZH: "专业摄影", phrase: { FR: "pour un shooting photo professionnel", EN: "for a professional photo shoot", ES: "para una sesión de fotos profesional", ZH: "专业摄影造型" } },
  { id: "image_consulting", FR: "Conseil en image", EN: "Image consulting", ES: "Asesoría de imagen", ZH: "形象顾问", phrase: { FR: "pour un conseil en image", EN: "for image consulting", ES: "para una asesoría de imagen", ZH: "形象顾问服务" } },
  { id: "master_of_ceremonies", FR: "Maître de cérémonie / animation", EN: "Master of ceremonies / hosting", ES: "Maestro de ceremonias / animación", ZH: "司仪与活动主持", phrase: { FR: "en tant que maître de cérémonie pour mon événement", EN: "as master of ceremonies for my event", ES: "como maestro de ceremonias para mi evento", ZH: "司仪与活动主持服务" } },
  { id: "other", FR: "Autre", EN: "Other", ES: "Otro", ZH: "其他" },
];

export function getContactProject(id) {
  return CONTACT_PROJECTS.find(project => project.id === id);
}

export function contactProjectLabel(id, lang = "FR") {
  const project = getContactProject(id);
  return project?.[lang] || project?.FR || "";
}

export function buildContactMessage({ firstName, projectType, projectDetails = "", lang = "FR" }) {
  const project = getContactProject(projectType);
  if (!project) throw new Error("invalid_project");
  const detail = projectDetails.trim();
  if (projectType === "other" && !detail) throw new Error("invalid_project");
  const phrase = project.phrase?.[lang] || project.phrase?.FR;
  if (lang === "EN") return `Hello Gaspard, my name is ${firstName}. I have just visited your website and I am interested in your support ${projectType === "other" ? `for the following project: ${detail}` : phrase}. Could you contact me so we can discuss my project? Thank you!`;
  if (lang === "ES") return `Hola Gaspard, me llamo ${firstName}. Acabo de visitar su sitio web y estoy interesado en su acompañamiento ${projectType === "other" ? `para el siguiente proyecto: ${detail}` : phrase}. ¿Podría ponerse en contacto conmigo para hablar de mi proyecto? ¡Gracias!`;
  if (lang === "ZH") return `您好 Gaspard，我叫${firstName}。我刚刚浏览了您的网站，希望咨询${projectType === "other" ? detail : phrase}。请与我联系，以便进一步讨论我的项目。谢谢！`;
  return `Bonjour Mr GaspardNZ, je m’appelle ${firstName}. Je viens de consulter votre site et je suis intéressé par votre accompagnement ${projectType === "other" ? `pour le projet suivant : ${detail}` : phrase}. Pourriez-vous me recontacter afin que nous échangions sur mon projet ? Merci et à bientôt !`;
}
