import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, animate } from "framer-motion";

const GOLD = "#b8973e";
const GOLD_LIGHT = "#d4ae5a";
const CREAM = "#f5f0e8"
const TEXT = "#1c1208";

const T = {
  FR: {
    nav_reveler:"Rendez-vous", nav_bio:"Biographie", nav_showroom:"Showroom",
    nav_formules:"Formules", nav_galerie:"Galerie", nav_contact:"Contact",
    nav_boutique:"Boutique", nav_mode_jour:"Mode jour", nav_mode_normal:"Mode normal",
    hero_maison:"Maison Gaspardnz — Paris",
    hero_desc:"Gaspardnz tisse un lien invisible entre l'élégance rigoureuse de Paris et une vision créative sans frontières.",
    hero_cta:"Découvrir",
    showroom_cta:"Explorer le Catalogue",
    formules_surtitle:"Mariage & Événements", formules_title:"NOS FORMULES",
    formules_sub:"Deux packages complets pour sublimer chaque moment de votre grand jour.",
    btn_reveler:"Rendez-vous",
    bk_step1:"Étape 1 / 2", bk_step2:"Étape 2 / 2",
    bk_title1:"Votre Projet", bk_title2:"Choisissez",
    bk_lbl_nom:"Votre nom", bk_ph_nom:"Comment vous appelez-vous ?",
    bk_lbl_projet:"Type de projet", bk_ph_projet:"Mariage, soirée, événement...",
    bk_lbl_besoin:"Votre besoin", bk_ph_besoin:"Décrivez brièvement votre projet...",
    bk_continue:"Continuer",
    bk_q:(n)=>`Comment souhaitez-vous continuer, ${n} ?`,
    bk_cal_title:"Prendre rendez-vous", bk_cal_sub:"Via calendrier · Créneau officiel",
    bk_wa_title:"Discuter via WhatsApp", bk_wa_sub:"Message pré-rédigé · Réponse rapide",
    bk_guarantee:"✦ Réponse sous 24h garantie ✦",
    bk_back:"Modifier mes informations",
    bk_wa:(n,p,b)=>`Salut Gaspard ! Je suis ${n}. Je viens de voir ton site et je souhaite discuter de mon projet de ${p}. Mon besoin est le suivant : ${b}.`,
    contact_title:"Prendre Contact",
    contact_desc:"Disponible sur WhatsApp pour toute commande sur-mesure ou demande de renseignement.",
    footer_mentions:"Mentions légales", footer_conf:"Confidentialité", footer_cgv:"CGV",
    heritage_desc:"Chaque silhouette est un dialogue entre la coupe classique et l'audace moderne — une signature portée par ceux qui osent se distinguer.",
    showroom_desc:"Chaque vêtement est une œuvre. Chaque coupe, une signature indélébile portée par ceux qui osent se distinguer.",
    showroom_stat1:"Ans", showroom_stat2:"Élégance", showroom_stat3:"Vision",
    formule1_tagline:"Une allure complète, élégante et inoubliable pour le jour J.",
    formule2_tagline:"L'élégance accessible pour un mariage parfaitement maîtrisé.",
    look_mairie:"Look Mairie", look_soiree:"Look Soirée",
    hero_subtitle:"L'Inspirateur de la Haute Allure",
    footer_subtitle:"L'Inspirateur — Paris",
    cat_item1:"Collections Vestes", cat_item2:"Costumes Sur-Mesure", cat_item3:"Chemises Brodées", cat_item4:"Accessoires Premium",
    flammes_title:"Gaspardnz aux Flammes 2026",
    flammes_desc:"Nos créations sur le tapis rouge de la cérémonie Les Flammes 2026 — Seine Musicale, 23 avril.",
    voir_galerie:"VOIR LA GALERIE", gnz_presente:"GASPARDNZ PRÉSENTE",
    flammes_presente:"Gaspardnz présente", flammes_lieu:"Seine Musicale · 23 Avril", voir_galerie_btn:"Voir la galerie →",
    formule_prestige_titre:"Formule Prestige", formule_gnz_titre:"Formule Gaspard NZ",
    hors_chaussures:"hors chaussures", sous_total_lbl:"Sous-total", total_lbl:"Total", prix_sur_demande:"Prix sur demande",
    item_costume:"Costume coupe droite, croisé ou trois pièces", item_chemise:"Chemise",
    item_cravate:"Cravate", item_boutons:"Boutons de manchettes", item_chaussettes:"Chaussettes fil d'Écosse",
    item_chaussures_opt:"Chaussures (option)", item_chaussures_prix:"à partir de 315€",
    item_smoking:"Ensemble smoking", item_noeud:"Nœud papillon", item_plastron:"Chemise plastron col cassé",
    gal_1:"Costume Crème", gal_2:"Élégance Blanche", gal_3:"Veste Rayée", gal_4:"Veste Orange", gal_5:"Costume Carreaux",
    gal_6:"Veste Bleue", gal_7:"Style Parisien", gal_8:"Chemise Lavande", gal_9:"Costume Bleu & Rouge", gal_10:"Veste Bleue Rayée",
    gal_11:"Costume Bordeaux", gal_12:"Promenade Blanche", gal_13:"Smoking Doré", gal_14:"Veste Navy Soirée", gal_15:"Costume Carreaux Rose",
    bio_quote:"\"S'habiller, c'est choisir qui l'on est avant même d'avoir parlé.\"",
    bio_s1_title:"Origines", bio_s1:"Né et forgé entre deux cultures, Gaspardnz grandit avec une sensibilité aiguë pour l'élégance, la matière et le détail. C'est à Paris qu'il pose ses valises et décide de faire de la mode son langage.",
    bio_s2_title:"Vision", bio_s2:"Depuis plus de 7 ans, il façonne des pièces sur-mesure pour des hommes qui refusent l'ordinaire. Costumes sculptés, chemises brodées, accessoires pensés jusqu'au dernier fil — chaque création est une déclaration.",
    bio_s3_title:"Engagement", bio_s3:"Gaspardnz ne vend pas des vêtements. Il construit des identités. Chaque client devient une silhouette unique, pensée, portée avec intention. De la salle de mariage aux tapis rouges, l'excellence est la seule constante.",
    bio_s4_title:"Paris", bio_s4:"Basé à Paris, disponible sur WhatsApp pour un premier échange. Chaque aventure commence par une conversation.",
    boutique_soon_badge:"Bientôt disponible",
    boutique_soon_title:"Notre boutique en ligne est en cours de création.",
    boutique_soon_desc:"Toutes nos pièces sur-mesure — costumes, vestes, chemises et accessoires — seront bientôt disponibles en ligne. En attendant, contactez-nous directement sur WhatsApp.",
    boutique_wa_cta:"Discuter sur WhatsApp",
  },
  EN: {
    nav_reveler:"Reveal Myself", nav_bio:"Biography", nav_showroom:"Showroom",
    nav_formules:"Packages", nav_galerie:"Gallery", nav_contact:"Contact",
    nav_boutique:"Boutique", nav_mode_jour:"Day mode", nav_mode_normal:"Normal mode",
    hero_maison:"Maison Gaspardnz — Paris",
    hero_desc:"Gaspardnz weaves an invisible bond between the rigorous elegance of Paris and a creative vision without borders.",
    hero_cta:"Discover",
    showroom_cta:"Explore the Catalogue",
    formules_surtitle:"Weddings & Events", formules_title:"OUR PACKAGES",
    formules_sub:"Two complete packages to elevate every moment of your big day.",
    btn_reveler:"Book this package",
    bk_step1:"Step 1 / 2", bk_step2:"Step 2 / 2",
    bk_title1:"Your Project", bk_title2:"Choose",
    bk_lbl_nom:"Your name", bk_ph_nom:"What is your name?",
    bk_lbl_projet:"Project type", bk_ph_projet:"Wedding, evening, event...",
    bk_lbl_besoin:"Your needs", bk_ph_besoin:"Briefly describe your project...",
    bk_continue:"Continue",
    bk_q:(n)=>`How would you like to proceed, ${n}?`,
    bk_cal_title:"Schedule an appointment", bk_cal_sub:"Via calendar · Official slot",
    bk_wa_title:"Chat via WhatsApp", bk_wa_sub:"Pre-written message · Fast reply",
    bk_guarantee:"✦ Response within 24h guaranteed ✦",
    bk_back:"Edit my information",
    bk_wa:(n,p,b)=>`Hi Gaspard! I'm ${n}. I just saw your website and I'd like to discuss my project: ${p}. Here's what I need: ${b}.`,
    contact_title:"Get in Touch",
    contact_desc:"Available on WhatsApp for any bespoke order or enquiry.",
    footer_mentions:"Legal Notice", footer_conf:"Privacy", footer_cgv:"T&C",
    heritage_desc:"Each silhouette is a dialogue between classic tailoring and modern boldness — a signature worn by those who dare to stand out.",
    showroom_desc:"Every garment is a work of art. Every cut, an indelible signature worn by those who dare to stand apart.",
    showroom_stat1:"Years", showroom_stat2:"Elegance", showroom_stat3:"Vision",
    formule1_tagline:"A complete, elegant and unforgettable look for the big day.",
    formule2_tagline:"Refined elegance for a perfectly curated wedding.",
    look_mairie:"City Hall Look", look_soiree:"Evening Look",
    hero_subtitle:"The Style Inspiration",
    footer_subtitle:"The Inspiration — Paris",
    cat_item1:"Jacket Collections", cat_item2:"Bespoke Suits", cat_item3:"Embroidered Shirts", cat_item4:"Premium Accessories",
    flammes_title:"Gaspardnz at Les Flammes 2026",
    flammes_desc:"Our creations on the red carpet of the Les Flammes 2026 ceremony — Seine Musicale, April 23.",
    voir_galerie:"VIEW GALLERY", gnz_presente:"GASPARDNZ PRESENTS",
    flammes_presente:"Gaspardnz presents", flammes_lieu:"Seine Musicale · April 23", voir_galerie_btn:"View gallery →",
    formule_prestige_titre:"Prestige Package", formule_gnz_titre:"Gaspard NZ Package",
    hors_chaussures:"excl. shoes", sous_total_lbl:"Subtotal", total_lbl:"Total", prix_sur_demande:"Price on request",
    item_costume:"Straight, double-breasted or 3-piece suit", item_chemise:"Shirt",
    item_cravate:"Tie", item_boutons:"Cufflinks", item_chaussettes:"Fine cotton socks",
    item_chaussures_opt:"Shoes (option)", item_chaussures_prix:"from €315",
    item_smoking:"Tuxedo set", item_noeud:"Bow tie", item_plastron:"Wing collar dress shirt",
    gal_1:"Cream Suit", gal_2:"White Elegance", gal_3:"Striped Jacket", gal_4:"Orange Jacket", gal_5:"Checked Suit",
    gal_6:"Blue Jacket", gal_7:"Parisian Style", gal_8:"Lavender Shirt", gal_9:"Blue & Red Suit", gal_10:"Striped Blue Jacket",
    gal_11:"Bordeaux Suit", gal_12:"White Stroll", gal_13:"Gold Tuxedo", gal_14:"Navy Evening Jacket", gal_15:"Pink Checked Suit",
    bio_quote:"\"Getting dressed is choosing who you are before you've even spoken.\"",
    bio_s1_title:"Origins", bio_s1:"Born and forged between two cultures, Gaspardnz grew up with a sharp sensitivity for elegance, fabric and detail. It was in Paris that he set down roots and chose fashion as his language.",
    bio_s2_title:"Vision", bio_s2:"For over 7 years, he has crafted bespoke pieces for men who refuse the ordinary. Sculpted suits, embroidered shirts, accessories considered to the last thread — each creation is a statement.",
    bio_s3_title:"Commitment", bio_s3:"Gaspardnz does not sell clothes. He builds identities. Each client becomes a unique silhouette, considered and worn with intention. From wedding halls to red carpets, excellence is the only constant.",
    bio_s4_title:"Paris", bio_s4:"Based in Paris, available on WhatsApp for a first exchange. Every adventure begins with a conversation.",
    boutique_soon_badge:"Coming Soon",
    boutique_soon_title:"Our online boutique is currently being created.",
    boutique_soon_desc:"All our bespoke pieces — suits, jackets, shirts and accessories — will soon be available online. In the meantime, contact us directly on WhatsApp.",
    boutique_wa_cta:"Chat on WhatsApp",
  },
  ES: {
    nav_reveler:"Revelarme", nav_bio:"Biografía", nav_showroom:"Showroom",
    nav_formules:"Paquetes", nav_galerie:"Galería", nav_contact:"Contacto",
    nav_boutique:"Boutique", nav_mode_jour:"Modo día", nav_mode_normal:"Modo normal",
    hero_maison:"Maison Gaspardnz — París",
    hero_desc:"Gaspardnz teje un vínculo invisible entre la elegancia rigurosa de París y una visión creativa sin fronteras.",
    hero_cta:"Descubrir",
    showroom_cta:"Explorar el Catálogo",
    formules_surtitle:"Bodas & Eventos", formules_title:"NUESTROS PAQUETES",
    formules_sub:"Dos paquetes completos para realzar cada momento de tu gran día.",
    btn_reveler:"Reservar este paquete",
    bk_step1:"Paso 1 / 2", bk_step2:"Paso 2 / 2",
    bk_title1:"Tu Proyecto", bk_title2:"Elige",
    bk_lbl_nom:"Tu nombre", bk_ph_nom:"¿Cómo te llamas?",
    bk_lbl_projet:"Tipo de proyecto", bk_ph_projet:"Boda, fiesta, evento...",
    bk_lbl_besoin:"Tu necesidad", bk_ph_besoin:"Describe brevemente tu proyecto...",
    bk_continue:"Continuar",
    bk_q:(n)=>`¿Cómo deseas continuar, ${n}?`,
    bk_cal_title:"Reservar una cita", bk_cal_sub:"Vía calendario · Horario oficial",
    bk_wa_title:"Hablar por WhatsApp", bk_wa_sub:"Mensaje redactado · Respuesta rápida",
    bk_guarantee:"✦ Respuesta en 24h garantizada ✦",
    bk_back:"Modificar mi información",
    bk_wa:(n,p,b)=>`¡Hola Gaspard! Soy ${n}. Acabo de ver tu sitio y me gustaría hablar sobre mi proyecto: ${p}. Mis necesidades: ${b}.`,
    contact_title:"Contactar",
    contact_desc:"Disponible en WhatsApp para cualquier solicitud de pedido personalizado.",
    footer_mentions:"Aviso Legal", footer_conf:"Privacidad", footer_cgv:"T&C",
    heritage_desc:"Cada silueta es un diálogo entre el corte clásico y la audacia moderna — una firma llevada por quienes se atreven a destacar.",
    showroom_desc:"Cada prenda es una obra de arte. Cada corte, una firma indeleble llevada por quienes se atreven a distinguirse.",
    showroom_stat1:"Años", showroom_stat2:"Elegancia", showroom_stat3:"Visión",
    formule1_tagline:"Un look completo, elegante e inolvidable para el gran día.",
    formule2_tagline:"La elegancia accesible para una boda perfectamente lograda.",
    look_mairie:"Look Ceremonia", look_soiree:"Look Noche",
    hero_subtitle:"El Inspirador de la Alta Elegancia",
    footer_subtitle:"El Inspirador — París",
    cat_item1:"Colecciones de Chaquetas", cat_item2:"Trajes a Medida", cat_item3:"Camisas Bordadas", cat_item4:"Accesorios Premium",
    flammes_title:"Gaspardnz en Las Llamas 2026",
    flammes_desc:"Nuestras creaciones en la alfombra roja de la ceremonia Las Llamas 2026 — Seine Musicale, 23 de abril.",
    voir_galerie:"VER GALERÍA", gnz_presente:"GASPARDNZ PRESENTA",
    flammes_presente:"Gaspardnz presenta", flammes_lieu:"Seine Musicale · 23 de Abril", voir_galerie_btn:"Ver galería →",
    formule_prestige_titre:"Paquete Prestige", formule_gnz_titre:"Paquete Gaspard NZ",
    hors_chaussures:"sin zapatos", sous_total_lbl:"Subtotal", total_lbl:"Total", prix_sur_demande:"Precio bajo solicitud",
    item_costume:"Traje corte recto, cruzado o tres piezas", item_chemise:"Camisa",
    item_cravate:"Corbata", item_boutons:"Gemelos", item_chaussettes:"Calcetines de hilo fino",
    item_chaussures_opt:"Zapatos (opción)", item_chaussures_prix:"desde 315€",
    item_smoking:"Conjunto smoking", item_noeud:"Pajarita", item_plastron:"Camisa plastón cuello italiano",
    gal_1:"Traje Crema", gal_2:"Elegancia Blanca", gal_3:"Chaqueta Rayada", gal_4:"Chaqueta Naranja", gal_5:"Traje de Cuadros",
    gal_6:"Chaqueta Azul", gal_7:"Estilo Parisino", gal_8:"Camisa Lavanda", gal_9:"Traje Azul & Rojo", gal_10:"Chaqueta Azul Rayada",
    gal_11:"Traje Burdeos", gal_12:"Paseo Blanco", gal_13:"Smoking Dorado", gal_14:"Chaqueta Navy de Noche", gal_15:"Traje Cuadros Rosa",
    bio_quote:"\"Vestirse es elegir quién eres antes de haber hablado.\"",
    bio_s1_title:"Orígenes", bio_s1:"Nacido y forjado entre dos culturas, Gaspardnz creció con una sensibilidad aguda por la elegancia, la tela y el detalle. Fue en París donde echó raíces y eligió la moda como su lenguaje.",
    bio_s2_title:"Visión", bio_s2:"Durante más de 7 años, ha creado piezas a medida para hombres que rechazan lo ordinario. Trajes esculpidos, camisas bordadas, accesorios pensados hasta el último hilo — cada creación es una declaración.",
    bio_s3_title:"Compromiso", bio_s3:"Gaspardnz no vende ropa. Construye identidades. Cada cliente se convierte en una silueta única, pensada y llevada con intención. Desde salones de bodas hasta alfombras rojas, la excelencia es la única constante.",
    bio_s4_title:"París", bio_s4:"Ubicado en París, disponible en WhatsApp para un primer intercambio. Cada aventura comienza con una conversación.",
    boutique_soon_badge:"Próximamente",
    boutique_soon_title:"Nuestra tienda en línea está en proceso de creación.",
    boutique_soon_desc:"Todas nuestras piezas a medida — trajes, chaquetas, camisas y accesorios — estarán disponibles en línea muy pronto. Mientras tanto, contáctanos directamente por WhatsApp.",
    boutique_wa_cta:"Chatear por WhatsApp",
  },
  ZH: {
    nav_reveler:"展现自我", nav_bio:"简介", nav_showroom:"展厅",
    nav_formules:"套餐", nav_galerie:"画廊", nav_contact:"联系",
    nav_boutique:"精品店", nav_mode_jour:"日间模式", nav_mode_normal:"普通模式",
    hero_maison:"Maison Gaspardnz — 巴黎",
    hero_desc:"Gaspardnz 编织了一条无形的纽带，连接巴黎严谨的优雅与无界的创意视野。",
    hero_cta:"探索",
    showroom_cta:"探索目录",
    formules_surtitle:"婚礼 & 活动", formules_title:"我们的套餐",
    formules_sub:"两套完整方案，让您的大日子每个瞬间都光彩夺目。",
    btn_reveler:"预约此套餐",
    bk_step1:"第 1 步 / 2", bk_step2:"第 2 步 / 2",
    bk_title1:"您的项目", bk_title2:"选择方式",
    bk_lbl_nom:"您的姓名", bk_ph_nom:"请问您叫什么名字？",
    bk_lbl_projet:"项目类型", bk_ph_projet:"婚礼、晚宴、活动...",
    bk_lbl_besoin:"您的需求", bk_ph_besoin:"请简要描述您的项目...",
    bk_continue:"继续",
    bk_q:(n)=>`${n}，您希望如何继续？`,
    bk_cal_title:"预约时间", bk_cal_sub:"通过日历 · 官方预约",
    bk_wa_title:"WhatsApp 咨询", bk_wa_sub:"预填信息 · 快速回复",
    bk_guarantee:"✦ 24小时内保证回复 ✦",
    bk_back:"修改我的信息",
    bk_wa:(n,p,b)=>`你好 Gaspard！我是${n}。我刚看了您的网站，想咨询我的项目：${p}。我的需求是：${b}。`,
    contact_title:"联系我们",
    contact_desc:"可通过 WhatsApp 联系，处理任何个性化订单或咨询。",
    footer_mentions:"法律声明", footer_conf:"隐私政策", footer_cgv:"销售条款",
    heritage_desc:"每一个轮廓都是经典剪裁与现代大胆之间的对话 — 由勇于脱颖而出者所承载的独特印记。",
    showroom_desc:"每件服装都是一件艺术品。每一剪，都是那些敢于与众不同者所承载的不朽印记。",
    showroom_stat1:"年", showroom_stat2:"优雅", showroom_stat3:"愿景",
    formule1_tagline:"为您的大日子打造完整、优雅且难忘的造型。",
    formule2_tagline:"精致优雅，成就完美婚礼。",
    look_mairie:"市政厅造型", look_soiree:"晚宴造型",
    hero_subtitle:"高端风格灵感缔造者",
    footer_subtitle:"灵感缔造者 — 巴黎",
    cat_item1:"西装外套系列", cat_item2:"定制西装", cat_item3:"刺绣衬衫", cat_item4:"高级配饰",
    flammes_title:"Gaspardnz 亮相 Les Flammes 2026",
    flammes_desc:"我们的作品亮相 Les Flammes 2026 颁奖典礼红毯 — 塞纳音乐厅，4月23日。",
    voir_galerie:"查看画廊", gnz_presente:"GASPARDNZ 呈献",
    flammes_presente:"Gaspardnz 呈献", flammes_lieu:"塞纳音乐厅 · 4月23日", voir_galerie_btn:"查看画廊 →",
    formule_prestige_titre:"尊贵套餐", formule_gnz_titre:"Gaspard NZ 套餐",
    hors_chaussures:"不含鞋", sous_total_lbl:"小计", total_lbl:"总计", prix_sur_demande:"价格面议",
    item_costume:"直裁/双排扣/三件式西装", item_chemise:"衬衫",
    item_cravate:"领带", item_boutons:"袖扣", item_chaussettes:"精棉袜",
    item_chaussures_opt:"鞋子（可选）", item_chaussures_prix:"起 315€",
    item_smoking:"燕尾服套装", item_noeud:"领结", item_plastron:"翼领礼服衬衫",
    gal_1:"奶油色西装", gal_2:"白色优雅", gal_3:"条纹外套", gal_4:"橙色外套", gal_5:"格纹西装",
    gal_6:"蓝色外套", gal_7:"巴黎风格", gal_8:"薰衣草衬衫", gal_9:"蓝红西装", gal_10:"蓝色条纹外套",
    gal_11:"酒红西装", gal_12:"白色漫步", gal_13:"金色礼服", gal_14:"海军晚宴外套", gal_15:"粉色格纹西装",
    bio_quote:"\"穿衣是在开口之前选择你是谁。\"",
    bio_s1_title:"起源", bio_s1:"Gaspardnz 在两种文化之间诞生与成长，对优雅、面料和细节有着敏锐的感知。他在巴黎扎根，选择以时装为语言。",
    bio_s2_title:"愿景", bio_s2:"超过7年来，他为拒绝平庸的男士打造定制作品。雕琢的西装、刺绣的衬衫、精心设计至最后一根线的配饰——每件作品都是一份宣言。",
    bio_s3_title:"承诺", bio_s3:"Gaspardnz 不卖衣服，他构建身份。每位客户都成为独一无二的轮廓，经过深思熟虑，带着意图穿着。从婚礼大厅到红毯，卓越是唯一的常量。",
    bio_s4_title:"巴黎", bio_s4:"常驻巴黎，可通过 WhatsApp 进行首次沟通。每段旅程都从一次对话开始。",
    boutique_soon_badge:"即将上线",
    boutique_soon_title:"我们的网上精品店正在筹建中。",
    boutique_soon_desc:"所有定制作品——西装、外套、衬衫及配饰——即将在线上推出。与此同时，欢迎直接通过 WhatsApp 联系我们。",
    boutique_wa_cta:"通过 WhatsApp 联系",
  },
};
const LangCtx = createContext({ lang: "FR", setLang: () => {} });
const useTr = () => {
  const { lang } = useContext(LangCtx);
  return (k, ...a) => { const v = T[lang]?.[k] ?? T.FR[k] ?? k; return typeof v === "function" ? v(...a) : v; };
};


const fonts = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Bebas+Neue&family=Montserrat:wght@200;300;400;500&family=Parisienne&display=swap');`;

const SvgInstagram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>;
const SvgFacebook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const SvgTiktok = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
const SvgYoutube = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="4"/><polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/></svg>;
const SvgCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const SvgWA = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

const SvgBag = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const SvgX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SvgArrow = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const SvgMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SvgWhatsapp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>;
const SvgLinkedin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const SvgSun = ({ active }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>;

const useParallax = (inputRange, outputRange) => {
  const { scrollY } = useScroll();
  return useTransform(scrollY, inputRange, outputRange);
};

const RevealWord = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <span ref={ref} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.28em" }}>
      <motion.span
        style={{ display: "inline-block" }}
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
};

const RevealLine = ({ text, delay = 0, style = {} }) => (
  <span style={{ display: "inline-block", overflow: "hidden" }}>
    <motion.span
      style={{ display: "inline-block", ...style }}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.span>
  </span>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }}
          onClick={e => e.stopPropagation()}
          style={{ width: "100%", maxWidth: "560px", background: "#faf7f2", border: `1px solid rgba(184,151,62,0.2)`, position: "relative", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        >
          {/* Header fixe avec titre + bouton fermer */}
          <div style={{ padding: "1.6rem 2.5rem 1.2rem", borderBottom: `1px solid rgba(184,151,62,0.15)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase" }}>{title}</p>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(28,18,8,0.5)", cursor: "pointer", padding: "4px 8px", fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
          {/* Contenu scrollable */}
          <div style={{ overflowY: "auto", padding: "2rem 2.5rem 2.5rem", flex: 1 }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── MOBILE-FIRST VERSION ───────────────────────────────── */

/* ── NAV MOBILE ─────────────────────────────────────── */

/* ── CHATBOT ────────────────────────────────────────── */
const KB = [
  {
    keys: ["bonjour","salut","hello","bonsoir","hi","hey","salam"],
    rep: "Bonjour ! Je suis l'assistant de Gaspard NZ. Comment puis-je vous aider aujourd'hui ?",
    btns: ["Les formules","Le showroom","Prendre rendez-vous","La galerie"]
  },
  {
    keys: ["formule","formules","pack","offre","package","mariage","service","prestation"],
    rep: "Gaspard NZ propose 3 formules pour votre mariage :\n\n• **Formule GNZ Showroom** — Costumes disponibles sur place, essayage immédiat.\n• **Formule Prestige** — Habillage sur-mesure selon vos goûts, commande personnalisée.\n• **Pack Complet Prestige** — Costume sur-mesure + Maître de cérémonie + Habillage à l'hôtel le matin du mariage.\n\nLes prix sont disponibles sur demande.",
    btns: ["Voir les détails","Prendre rendez-vous","En savoir plus sur le Prestige"]
  },
  {
    keys: ["prestige","sur mesure","sur-mesure","personnalisé","personnalisé"],
    rep: "La **Formule Prestige** c'est l'expérience complète :\n\nGaspard vous habille en fonction de vos goûts personnels. Chaque pièce est sélectionnée et commandée spécialement pour vous — costume, chemise, cravate, boutons de manchettes, chaussettes.\n\nC'est le choix des mariés qui veulent être uniques le jour J.",
    btns: ["Inclus dans le Pack Complet ?","Prendre rendez-vous","Les prix"]
  },
  {
    keys: ["pack complet","pack prestige","tout en un","tout-en-un","cérémonie","ceremonie","maitre","maître"],
    rep: "Le **Pack Complet Prestige** regroupe 3 services en 1 :\n\n✦ Costume sur-mesure (Formule Prestige)\n✦ Gaspard anime votre cérémonie en tant que Maître de cérémonie\n✦ Il vous accompagne à l'hôtel le matin du mariage pour l'habillage\n\nC'est l'offre la plus complète — un seul prestataire pour tout gérer.",
    btns: ["Prendre rendez-vous","Disponible où ?","Les prix"]
  },
  {
    keys: ["prix","tarif","coût","cout","combien","budget"],
    rep: "Les prix sont disponibles sur demande — chaque projet est unique.\n\nGaspard établit un devis personnalisé après échange avec vous sur WhatsApp ou par rendez-vous.\n\nSi vous réservez **6 mois à l'avance**, vous bénéficiez d'une remise de -10% sur le Pack Complet.",
    btns: ["Réserver maintenant","Contactez sur WhatsApp","Remise early booking"]
  },
  {
    keys: ["remise","reduction","réduction","promo","promotion","early","tôt","tot","avance"],
    rep: "✦ **Offre Early Booking — -10%**\n\nRéservez votre Pack Complet 6 mois avant votre mariage et bénéficiez de 10% de réduction.\n\nAvantages :\n• Vous économisez sur le prix\n• Gaspard réserve votre hôtel à l'avance (prix plus bas)\n• Votre date est garantie et bloquée",
    btns: ["Prendre rendez-vous","En savoir plus"]
  },
  {
    keys: ["showroom","boutique","magasin","essayage","essayer","sur place","venir"],
    rep: "Le Showroom Gaspard NZ est un espace privé et exclusif aménagé comme une vraie boutique de luxe.\n\nVous venez, vous essayez directement les pièces disponibles, et si ça vous va — vous repartez habillé.\n\nSitué en **Île-de-France**. Sur rendez-vous uniquement.",
    btns: ["Prendre rendez-vous","Voir la galerie","Les formules disponibles"]
  },
  {
    keys: ["où","localisation","location","idf","île-de-france","ile de france","paris","déplacement","deplacement","province","étranger","etranger"],
    rep: "Gaspard NZ est basé en **Île-de-France**.\n\n• Showroom & prestations IDF : inclus dans le prix\n• Hors IDF (province, étranger) : les frais de déplacement et d'hôtel (2 nuits) sont pris en charge par le client\n\nIl se déplace partout en France et à l'étranger.",
    btns: ["Prendre rendez-vous","Les formules","Contactez sur WhatsApp"]
  },
  {
    keys: ["hôtel","hotel","nuit","hébergement","hebergement","déplace","deplace"],
    rep: "Pour les prestations **hors Île-de-France** :\n\nGaspard arrive la veille du mariage et repart le lendemain — soit **2 nuits d'hôtel**.\n\nCes frais sont pris en charge par le client, en supplément du pack choisi. Gaspard se charge lui-même de la réservation pour garantir un hôtel de qualité.",
    btns: ["Prendre rendez-vous","Les formules","En savoir plus"]
  },
  {
    keys: ["annulation","annuler","rembours","remboursement","cancel"],
    rep: "Conditions d'annulation :\n\n• **+6 mois avant** → 50% de l'acompte remboursé\n• **1 à 6 mois avant** → acompte non remboursé\n• **-1 mois avant** → 100% du montant dû\n\nReport de date : accepté une fois, avec 3 mois de préavis minimum.",
    btns: ["Prendre rendez-vous","L'acompte","Les formules"]
  },
  {
    keys: ["acompte","paiement","payer","régler","regler","virement"],
    rep: "Le paiement se fait en 2 fois :\n\n• **50% à la réservation** — pour bloquer votre date\n• **50% restants 30 jours avant** le mariage\n\nPaiement par virement bancaire uniquement.",
    btns: ["Prendre rendez-vous","Les conditions d'annulation"]
  },
  {
    keys: ["contrat","signer","signature","document"],
    rep: "Une fois votre formule choisie et votre devis validé avec Gaspard, un contrat est établi.\n\nGaspard vous envoie un code unique — vous signez directement depuis ce site web. Les deux parties reçoivent le contrat signé par email.",
    btns: ["Prendre rendez-vous","Contactez sur WhatsApp"]
  },
  {
    keys: ["flammes","flamme","2026","événement","evenement","feu"],
    rep: "**Les Flammes 2026** — l'événement exclusif de Gaspard NZ.\n\nUn défilé et une soirée mode organisés par Gaspard NZ. Les détails seront bientôt dévoilés.\n\nRestez connecté pour ne rien manquer !",
    btns: ["Voir la galerie","Prendre rendez-vous","Contacter Gaspard"]
  },
  {
    keys: ["galerie","photo","photos","look","tenue","style","création","creation"],
    rep: "La galerie Gaspard NZ présente ses créations : costumes, vestes structurées, chemises brodées, smoking...\n\nChaque pièce raconte une histoire. Découvrez l'univers Gaspardnz.",
    btns: ["Voir la galerie","Prendre rendez-vous"]
  },
  {
    keys: ["qui est","gaspard","biographie","bio","parcours","histoire","créateur","createur"],
    rep: "**Gaspard NZ** — Styliste & Maître de cérémonie basé à Paris.\n\nDepuis plus de 7 ans, il crée des pièces sur-mesure pour des hommes qui refusent l'ordinaire. Sa devise : *\"S'habiller, c'est choisir qui l'on est avant même d'avoir parlé.\"*\n\nIl cumule aujourd'hui 450K followers sur TikTok et des millions de vues.",
    btns: ["Les formules","Prendre rendez-vous","Voir la galerie"]
  },
  {
    keys: ["contact","whatsapp","appel","appeler","joindre","parler","message"],
    rep: "Vous pouvez contacter Gaspard directement sur **WhatsApp** — il répond sous 24h.\n\nPour un premier échange sur votre projet mariage, c'est la meilleure façon de commencer.",
    btns: ["Ouvrir WhatsApp","Prendre rendez-vous"]
  },
  {
    keys: ["rdv","rendez-vous","rendez vous","réservation","reservation","réserver","reserver","bookez","booker"],
    rep: "Pour prendre rendez-vous avec Gaspard :\n\n1. Cliquez sur le bouton ci-dessous\n2. Renseignez votre nom et votre projet\n3. Choisissez WhatsApp ou Calendrier\n\nGaspard vous répond sous 24h.",
    btns: ["Prendre rendez-vous","Ouvrir WhatsApp"]
  },
  {
    keys: ["disponible","disponibilité","libre","date","quand"],
    rep: "Les disponibilités dépendent de la période de l'année.\n\nLes week-ends de printemps et d'été (mai-septembre) sont les plus demandés pour les mariages.\n\nContactez Gaspard directement pour vérifier votre date.",
    btns: ["Ouvrir WhatsApp","Prendre rendez-vous"]
  },
  {
    keys: ["merci","super","parfait","excellent","top","génial","genial","bravo"],
    rep: "Merci à vous ! Gaspard NZ est là pour rendre votre jour J inoubliable. N'hésitez pas si vous avez d'autres questions. ✦",
    btns: ["Prendre rendez-vous","Ouvrir WhatsApp"]
  },
  {
    keys: ["instagram","tiktok","facebook","youtube","réseaux","reseaux","réseau","reseau","social","suivre","suivi","communauté","communaute","abonner"],
    rep: "Retrouvez Gaspard NZ sur toutes les plateformes pour suivre ses créations, ses looks et ses coulisses :\n\n**Instagram** — @gaspardnz\n**TikTok** — @gaspardnz\n**Facebook** — Delgadimasaprod\n**YouTube** — @Gaspardnz\n\nChaque réseau a sa propre ambiance — à vous de choisir celui qui vous correspond.",
    btns: ["Instagram","TikTok","Facebook","YouTube"]
  },
];

const DEFAULT_REPLY = {
  rep: "Je n'ai pas bien compris votre question. Voici comment je peux vous aider :",
  btns: ["Les formules","Le showroom","Prendre rendez-vous","Contacter Gaspard"]
};

const GREET = {
  rep: "Bienvenue chez **Gaspard NZ** ✦\n\nJe suis votre assistant virtuel. Je peux vous renseigner sur les formules, le showroom, les tarifs ou la prise de rendez-vous.",
  btns: ["Les formules","Le showroom","Prendre rendez-vous","La galerie"]
};

function normalise(s) {
  return (s || "").toLowerCase().replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i").replace(/[ôö]/g,"o").replace(/[ùûü]/g,"u").replace(/[ç]/g,"c");
}

function findReply(msg) {
  const low = normalise(msg);
  for (const entry of KB) {
    if (entry.keys.some(k => low.includes(normalise(k)))) return entry;
  }
  return DEFAULT_REPLY;
}

const AVATAR_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "avatar.jpg";

const AvatarImg = ({ size, ring = true }) => {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: ring ? `2px solid ${GOLD}` : "none", overflow: "hidden", flexShrink: 0, background: "#1c1208", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!err
        ? <img src={AVATAR_SRC} onError={() => setErr(true)} alt="Gaspard NZ" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: `${Math.round(size * 0.3)}px`, color: GOLD, letterSpacing: "0.05em" }}>GNZ</span>
      }
    </div>
  );
};

const ChatBot = ({ onReserver, onGalerie, onShowroom, onFormules }) => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const fabDragging = useRef(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      setTimeout(() => {
        setMsgs([{ from: "bot", text: GREET.rep, btns: GREET.btns, id: Date.now() }]);
      }, 400);
    }
  }, [open, greeted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) { setShowBubble(true); setTimeout(() => setShowBubble(false), 8000); } }, 3500);
    return () => clearTimeout(t);
  }, []);

  const handleAction = (btn) => {
    addUserMsg(btn);
    triggerReply(btn);
  };

  const addUserMsg = (text) => {
    setMsgs(m => [...m, { from: "user", text, id: Date.now() }]);
  };

  const triggerReply = (text) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const entry = findReply(text);
      if (text === "Prendre rendez-vous" || text.toLowerCase().includes("rendez-vous") || text.toLowerCase().includes("réserver")) {
        setMsgs(m => [...m, { from: "bot", text: entry.rep, btns: entry.btns, action: "booking", id: Date.now() }]);
      } else if (text === "La galerie" || text.toLowerCase().includes("galerie")) {
        setMsgs(m => [...m, { from: "bot", text: "Je vous emmène dans la galerie ✦", btns: [], id: Date.now() }]);
        setTimeout(() => { setOpen(false); onGalerie?.(); }, 600);
      } else if (text === "Le showroom" || text.toLowerCase().includes("showroom")) {
        setMsgs(m => [...m, { from: "bot", text: "Je vous emmène au showroom ✦", btns: [], id: Date.now() }]);
        setTimeout(() => { setOpen(false); onShowroom?.(); }, 600);
      } else if (text === "Les formules" || text.toLowerCase().includes("formule")) {
        setMsgs(m => [...m, { from: "bot", text: "Je vous emmène vers les formules ✦", btns: [], id: Date.now() }]);
        setTimeout(() => { setOpen(false); onFormules?.(); }, 600);
      } else if (text === "Ouvrir WhatsApp") {
        window.open("https://wa.me/33664826920", "_blank");
        setMsgs(m => [...m, { from: "bot", text: "Je vous redirige vers WhatsApp. Gaspard vous répondra sous 24h ✦", btns: [], id: Date.now() }]);
      } else {
        setMsgs(m => [...m, { from: "bot", text: entry.rep, btns: entry.btns, id: Date.now() }]);
      }
    }, 900 + Math.random() * 400);
  };

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    addUserMsg(txt);
    triggerReply(txt);
  };

  const formatText = (txt) => {
    return (txt || "").split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: "0.15rem 0" }}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Bouton flottant — amovible */}
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ top: -700, bottom: 0, left: -350, right: 0 }}
        onDragStart={() => { fabDragging.current = true; }}
        onDragEnd={() => { setTimeout(() => { fabDragging.current = false; }, 80); }}
        onClick={() => { if (fabDragging.current) return; setOpen(o => !o); setShowBubble(false); }}
        whileTap={{ scale: 0.93 }}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.2rem", zIndex: 600, width: "56px", height: "56px", borderRadius: "50%", background: open ? GOLD : "transparent", border: open ? "none" : `2px solid ${GOLD}`, padding: 0, cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(184,151,62,0.45)", overflow: "hidden", touchAction: "none" }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ color: "#1c1208", fontSize: "22px", fontWeight: 300, lineHeight: 1 }}>×</motion.span>
            : <motion.div key="av" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ width: "100%", height: "100%" }}><AvatarImg size={52} ring={false} /></motion.div>
          }
        </AnimatePresence>
        {!open && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 3 }} style={{ position: "absolute", top: "3px", right: "3px", width: "11px", height: "11px", borderRadius: "50%", background: "#25D366", border: "2px solid #fff", zIndex: 1 }} />}
      </motion.button>

      {/* Bulle d'accueil */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => { setShowBubble(false); setOpen(true); }}
            style={{ position: "fixed", bottom: "5.2rem", right: "1.2rem", background: "transparent", padding: "0.5rem 1rem 0.5rem 0", maxWidth: "200px", cursor: "pointer", zIndex: 598, textAlign: "right" }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.92rem", color: GOLD, lineHeight: 1.45, margin: 0, textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)" }}>Je suis là si vous avez des questions 💬</p>
            <button onClick={e => { e.stopPropagation(); setShowBubble(false); }} style={{ position: "absolute", top: "4px", right: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.35)", fontSize: "0.75rem", lineHeight: 1 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fenêtre chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            drag dragMomentum={false} dragElastic={0.05} dragConstraints={{ top: -500, bottom: 50, left: -300, right: 50 }}
            style={{ position: "fixed", bottom: "5.5rem", right: "1.2rem", left: "1.2rem", maxWidth: "380px", cursor: "grab", overflow: "hidden", marginLeft: "auto", zIndex: 599, background: "#faf7f2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", height: "70vh", maxHeight: "520px" }}>

            {/* Header */}
            <div style={{ background: "#1c1208", padding: "0.85rem 1.2rem", display: "flex", alignItems: "center", gap: "0.85rem", flexShrink: 0 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <AvatarImg size={44} ring={true} />
                <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: "#25D366", border: "2px solid #1c1208", display: "block" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: CREAM, letterSpacing: "0.12em", margin: 0, lineHeight: 1.2 }}>GASPARD NZ</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7.5px", color: "rgba(245,240,232,0.55)", letterSpacing: "0.2em", textTransform: "uppercase", margin: "3px 0 0" }}>Habilleur · En ligne</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#25D366" }} />
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.55)", fontSize: "1.1rem", padding: "0.2rem 0 0.2rem 0.6rem", lineHeight: 1 }}>✕</button>
            </div>


            {/* Avatar d'accueil animé */}
            <AnimatePresence>
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: "absolute", top: "73px", left: 0, right: 0, bottom: 0, background: "#0d0b08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}
                >
                  <style>{`
                    @keyframes gnzWalk {
                      0%   { transform: translateY(0px)  translateX(0px)  rotate(0deg)   scale(1);    }
                      20%  { transform: translateY(-7px) translateX(-4px) rotate(-1.5deg) scale(1.02); }
                      40%  { transform: translateY(1px)  translateX(-2px) rotate(-0.5deg) scale(0.99); }
                      60%  { transform: translateY(-7px) translateX(4px)  rotate(1.5deg)  scale(1.02); }
                      80%  { transform: translateY(1px)  translateX(2px)  rotate(0.5deg)  scale(0.99); }
                      100% { transform: translateY(0px)  translateX(0px)  rotate(0deg)   scale(1);    }
                    }
                    @keyframes gnzGlow { 0%,100%{box-shadow:0 0 0 0 rgba(184,151,62,0.0),0 0 25px rgba(184,151,62,0.12)} 50%{box-shadow:0 0 0 8px rgba(184,151,62,0.08),0 0 50px rgba(184,151,62,0.3)} }
                    @keyframes gnzShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
                  `}</style>
                  <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${GOLD}`, animation: "gnzWalk 0.85s ease-in-out infinite, gnzGlow 2.5s ease-in-out infinite", marginBottom: "1.4rem" }}>
                    <img src={AVATAR_SRC} alt="Gaspard NZ" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                  </div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.2em", margin: 0, background: "linear-gradient(90deg, #9a7a2e 0%, #d4ae5a 25%, #f5e070 50%, #d4ae5a 75%, #9a7a2e 100%)", backgroundSize: "250% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gnzShimmer 2.5s linear infinite" }}>GASPARD NZ</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(184,151,62,0.55)", textTransform: "uppercase", marginTop: "8px" }}>Habilleur · Paris</p>
                  <button onClick={() => setShowAvatar(false)} style={{ position: "absolute", bottom: "1.2rem", background: "none", border: "1px solid rgba(184,151,62,0.25)", color: "rgba(245,240,232,0.35)", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.35em", textTransform: "uppercase", padding: "0.45rem 1.1rem", cursor: "pointer", borderRadius: "2px" }}>Passer</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {msgs.map(m => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start", gap: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
                    {m.from === "bot" && <AvatarImg size={24} ring={true} />}
                    <div style={{ maxWidth: "80%", background: m.from === "user" ? GOLD : "#fff", color: m.from === "user" ? "#1c1208" : TEXT, padding: "0.7rem 0.9rem", borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.7, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      {formatText(m.text)}
                    </div>
                  </div>
                  {m.btns && m.btns.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", maxWidth: "100%" }}>
                      {m.btns.map((btn, bi) => (
                        <button key={bi} onClick={() => {
                          if (btn === "Prendre rendez-vous") { setOpen(false); onReserver?.(); }
                          else if (btn === "Voir la galerie") { setOpen(false); onGalerie?.(); }
                          else if (btn === "Le showroom") { setOpen(false); onShowroom?.(); }
                          else if (btn === "Ouvrir WhatsApp") { window.open("https://wa.me/33664826920", "_blank"); }
                          else if (btn === "Instagram") { window.open("https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq", "_blank"); }
                          else if (btn === "TikTok") { window.open("https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB", "_blank"); }
                          else if (btn === "Facebook") { window.open("https://www.facebook.com/share/1JXsWJwpTW/?mibextid=wwXIfr", "_blank"); }
                          else if (btn === "YouTube") { window.open("https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT", "_blank"); }
                          else handleAction(btn);
                        }}
                          style={{ background: "none", border: `1px solid rgba(184,151,62,0.5)`, color: GOLD, padding: "0.35rem 0.7rem", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", cursor: "pointer", borderRadius: "20px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                  <AvatarImg size={24} ring={true} />
                  <div style={{ background: "#fff", padding: "0.7rem 1rem", borderRadius: "12px 12px 12px 2px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                        style={{ width: "5px", height: "5px", borderRadius: "50%", background: GOLD }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "0.8rem", borderTop: "1px solid rgba(184,151,62,0.1)", display: "flex", gap: "0.5rem", flexShrink: 0, background: "#faf7f2" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                style={{ flex: 1, background: "#fff", border: "1px solid rgba(184,151,62,0.2)", padding: "0.6rem 0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: TEXT, outline: "none", borderRadius: "20px" }}
              />
              <button onClick={handleSend}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: GOLD, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1208"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── BOOKING MODAL ──────────────────────────────────── */
const BookingModal = ({ isOpen, onClose, boutiqueMode = false }) => {
  const t = useTr();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom: "", projet: "", besoin: "" });

  const ok = form.nom.trim() && form.projet.trim() && form.besoin.trim();

  const nom = form.nom.trim();
  const projet = form.projet.trim();
  const besoin = form.besoin.trim();
  const waMsg = t("bk_wa", nom, projet, besoin);
  const waUrl = `https://wa.me/33664826920?text=${encodeURIComponent(waMsg).replace(/%3A/g, ':')}`;