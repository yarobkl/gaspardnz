import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";

const GOLD = "#b8973e";
const GOLD_LIGHT = "#d4ae5a";
const CREAM = "#f5f0e8"
const TEXT = "#1c1208";

const T = {
  FR: {
    nav_reveler:"Me Révéler", nav_bio:"Biographie", nav_showroom:"Showroom",
    nav_formules:"Formules", nav_galerie:"Galerie", nav_contact:"Contact",
    nav_boutique:"Boutique", nav_mode_jour:"Mode jour", nav_mode_normal:"Mode normal",
    hero_maison:"Maison Gaspardnz — Paris",
    hero_desc:"Gaspardnz tisse un lien invisible entre l'élégance rigoureuse de Paris et une vision créative sans frontières.",
    hero_cta:"Découvrir",
    showroom_cta:"Explorer le Catalogue",
    formules_surtitle:"Mariage & Événements", formules_title:"NOS FORMULES",
    formules_sub:"Deux packages complets pour sublimer chaque moment de votre grand jour.",
    btn_reveler:"Me Révéler",
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

/* ─── MOBILE-FIRST VERSION ─────────────────────────────────────── */

/* ── NAV MOBILE ─────────────────────────────────────────────────── */

/* ── CHATBOT ─────────────────────────────────────────────────────── */
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
      {/* Bouton flottant */}
      <motion.button
        onClick={() => { setOpen(o => !o); setShowBubble(false); }}
        whileTap={{ scale: 0.93 }}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.2rem", zIndex: 600, width: "56px", height: "56px", borderRadius: "50%", background: open ? GOLD : "transparent", border: open ? "none" : `2px solid ${GOLD}`, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(184,151,62,0.45)", overflow: "hidden" }}>
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

/* ── BOOKING MODAL ───────────────────────────────────────────────── */
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

  const reset = () => { setStep(1); setForm({ nom: "", projet: "", besoin: "" }); onClose(); };

  const inputStyle = {
    width: "100%", background: "none", border: "1px solid rgba(184,151,62,0.2)",
    padding: "0.85rem 1rem", fontFamily: "'Montserrat', sans-serif",
    fontSize: "16px", color: TEXT, outline: "none", borderRadius: 0,
    transition: "border-color 0.3s",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={reset}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)", overflowY: "auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "480px", background: "#faf7f2", position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

            {/* Barre de progression */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "rgba(184,151,62,0.12)", zIndex: 2 }}>
              <motion.div
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: GOLD }} />
            </div>

            {/* Header — toujours visible */}
            <div style={{ padding: "2rem 1.8rem 1.2rem", borderBottom: "1px solid rgba(184,151,62,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  {step === 1 ? t("bk_step1") : t("bk_step2")}
                </p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", color: TEXT, lineHeight: 1 }}>
                  {step === 1 ? t("bk_title1") : t("bk_title2")}
                </p>
              </div>
              <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: "rgba(28,18,8,0.62)", fontSize: "22px", lineHeight: 1, marginTop: "-4px" }}>×</button>
            </div>

            {/* Contenu scrollable */}
            <div style={{ padding: "1.8rem", overflowY: "auto", flex: 1 }}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1"
                    initial={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                      {[
                        { k: "nom",    lbl: t("bk_lbl_nom"), ph: t("bk_ph_nom") },
                        { k: "projet", lbl: t("bk_lbl_projet"), ph: t("bk_ph_projet") },
                        { k: "besoin", lbl: t("bk_lbl_besoin"), ph: t("bk_ph_besoin") },
                      ].map(({ k, lbl, ph }) => (
                        <div key={k}>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.35em", color: "rgba(28,18,8,0.72)", textTransform: "uppercase", marginBottom: "0.5rem" }}>{lbl}</p>
                          {k === "besoin" ? (
                            <textarea value={form[k]} rows={3} placeholder={ph}
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={{ ...inputStyle, resize: "none", display: "block" }} />
                          ) : (
                            <input type="text" value={form[k]} placeholder={ph}
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={inputStyle} />
                          )}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      onClick={() => ok && setStep(2)}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        marginTop: "1.8rem", width: "100%", border: "none",
                        background: ok ? GOLD : "rgba(184,151,62,0.15)",
                        color: ok ? "#1c1208" : "rgba(28,18,8,0.25)",
                        padding: "1rem", fontFamily: "'Montserrat', sans-serif",
                        fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
                        cursor: ok ? "pointer" : "not-allowed", transition: "all 0.4s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}>
                      {t("bk_continue")} <SvgArrow size={12} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="step2"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(28,18,8,0.78)", fontStyle: "italic", textAlign: "center", marginBottom: "1.6rem", lineHeight: 1.65 }}>
                      {t("bk_q", form.nom)}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                      {/* Calendrier — masqué en mode boutique */}
                      {!boutiqueMode && (
                        <a href="https://calendly.com/gaspardnz" target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: "1.1rem", border: "1px solid rgba(184,151,62,0.22)", padding: "1.3rem 1.4rem", textDecoration: "none", transition: "border-color 0.3s, background 0.3s" }}
                          onTouchStart={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "rgba(184,151,62,0.04)"; }}
                          onTouchEnd={e => { e.currentTarget.style.borderColor = "rgba(184,151,62,0.22)"; e.currentTarget.style.background = "none"; }}>
                          <div style={{ width: "38px", height: "38px", border: `1px solid rgba(184,151,62,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <SvgCalendar />
                          </div>
                          <div>
                            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.07em", color: TEXT, marginBottom: "0.15rem" }}>{t("bk_cal_title")}</p>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.68)", textTransform: "uppercase" }}>{t("bk_cal_sub")}</p>
                          </div>
                        </a>
                      )}

                      {/* WhatsApp */}
                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: "1.1rem", border: `1px solid ${GOLD}`, background: "rgba(184,151,62,0.04)", padding: "1.3rem 1.4rem", textDecoration: "none", transition: "background 0.3s" }}
                        onTouchStart={e => e.currentTarget.style.background = "rgba(184,151,62,0.12)"}
                        onTouchEnd={e => e.currentTarget.style.background = "rgba(184,151,62,0.04)"}>
                        <div style={{ width: "38px", height: "38px", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <SvgWA />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.07em", color: TEXT, marginBottom: "0.15rem" }}>{t("bk_wa_title")}</p>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.68)", textTransform: "uppercase" }}>{t("bk_wa_sub")}</p>
                        </div>
                      </a>
                    </div>

                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.28em", color: "rgba(28,18,8,0.6)", textTransform: "uppercase", textAlign: "center", marginTop: "1.5rem" }}>
                      {t("bk_guarantee")}
                    </p>

                    <button onClick={() => setStep(1)}
                      style={{ display: "block", background: "none", border: "none", margin: "1.1rem auto 0", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.22em", color: "rgba(28,18,8,0.58)", textTransform: "uppercase" }}>
                      {t("bk_back")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NavMobile = ({ onShowroom, onGalerie, onContact, onCatalogue, onFormules, highContrast, onToggleContrast, onBiographie, onReserver }) => {
  const { lang, setLang } = useContext(LangCtx);
  const t = useTr();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    } else {
      const y = Math.abs(parseInt(document.body.style.top || "0"));
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open]);

  const close = (fn) => { setOpen(false); fn && fn(); };

  // Sur fond transparent (photo sombre) → texte blanc / Sur fond crème → texte sombre
  const navLight = !scrolled && !open;
  const navTextColor = navLight ? "#f5f0e8" : TEXT;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 700,
        paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
        paddingBottom: "1rem", paddingLeft: "1.4rem", paddingRight: "1.4rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: scrolled || open ? "rgba(245,240,232,0.97)" : "transparent",
        borderBottom: scrolled || open ? "1px solid rgba(184,151,62,0.25)" : "1px solid transparent",
        transition: "background 0.4s, border 0.4s, color 0.4s",
      }}>
        {/* Logo */}
        <button onClick={() => close(() => window.scrollTo({ top: 0, behavior: "smooth" }))}
          style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "0.3em", color: navTextColor, lineHeight: 1, transition: "color 0.4s" }}>Gaspardnz</div>
          <div style={{ fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginTop: "3px" }}>Paris</div>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {/* Mode soleil */}
        {/* Mode soleil */}
        <motion.button onClick={onToggleContrast} whileTap={{ scale: 0.88 }}
          title={highContrast ? t("nav_mode_normal") : t("nav_mode_jour")}
          style={{ background: "none", border: "none", cursor: "pointer", color: highContrast ? GOLD : navTextColor, transition: "color 0.4s", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: "4px", minWidth: "32px", minHeight: "36px" }}>
          <motion.div
            animate={{ rotate: highContrast ? 180 : 0, scale: highContrast ? 1.15 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {highContrast && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.8, opacity: 1 }} transition={{ duration: 0.4 }} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, rgba(184,151,62,0.35) 0%, transparent 70%)` }} />}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
            </svg>
          </motion.div>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "5px", letterSpacing: "0.3em", color: highContrast ? GOLD : "transparent", textTransform: "uppercase", userSelect: "none" }}>MODE</span>
        </motion.button>
        {/* Sélecteur de langue — globe */}
        {(() => {
          const LANGS = ["FR","EN","ES","ZH"];
          const next = () => { const i = (LANGS.indexOf(lang) + 1) % LANGS.length; const l = LANGS[i]; setLang(l); try { localStorage.setItem("gnz-lang", l); } catch {} };
          return (
            <motion.button onClick={next} whileTap={{ scale: 0.88 }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: "4px", color: navTextColor, transition: "color 0.4s", minWidth: "32px", minHeight: "36px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "5px", letterSpacing: "0.3em", color: GOLD }}>{lang}</span>
            </motion.button>
          );
        })()}
        {/* Boutique — sac avec point de notification */}
        <motion.button onClick={onCatalogue} whileTap={{ scale: 0.88 }}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: "4px", color: navTextColor, transition: "color 0.4s", minWidth: "32px", minHeight: "36px", position: "relative" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", top: "-3px", right: "-4px", width: "7px", height: "7px", background: GOLD, borderRadius: "50%", border: "1.5px solid rgba(245,240,232,0.9)" }} />
          </div>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "5px", letterSpacing: "0.3em", color: GOLD, userSelect: "none" }}>SHOP</span>
        </motion.button>
        {/* Burger */}
        <button onClick={() => setOpen(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
          <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }} transition={{ duration: 0.3 }}
            style={{ display: "block", width: "24px", height: "1.5px", background: open ? GOLD : navTextColor, transition: "background 0.4s" }} />
          <motion.span animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }} transition={{ duration: 0.2 }}
            style={{ display: "block", width: "16px", height: "1.5px", background: navTextColor, transition: "background 0.4s" }} />
          <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }} transition={{ duration: 0.3 }}
            style={{ display: "block", width: "24px", height: "1.5px", background: open ? GOLD : navTextColor, transition: "background 0.4s" }} />
        </button>
        </div>
      </nav>

      {/* Menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", top: "calc(env(safe-area-inset-top) + 64px)", left: 0, right: 0, bottom: 0, zIndex: 699,
              background: "rgba(245,240,232,0.98)", borderBottom: `1px solid rgba(184,151,62,0.12)`,
              padding: "2rem 1.4rem 2.5rem",
              backdropFilter: "blur(20px)",
              overflowY: "auto",
            }}
          >
            {/* Links */}
            {[
              [t("nav_reveler"), onReserver],
          [t("nav_bio"), onBiographie],
              [t("nav_showroom"), onShowroom],
              [t("nav_formules"), onFormules],
              [t("nav_galerie"), onGalerie],
              [t("nav_contact"), onContact],
            ].map(([label, fn], i) => (
              <motion.button key={label}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => close(fn)}
                style={{ display: "block", width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "1.1rem 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", letterSpacing: "0.08em", color: TEXT, borderBottom: "1px solid rgba(28,18,8,0.07)" }}
              >
                {label}
              </motion.button>
            ))}

            {/* CTA Boutique */}
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              onClick={() => close(onCatalogue)}
              style={{ marginTop: "1.8rem", width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, padding: "1rem", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              <SvgBag /><span>{t("nav_boutique")}</span>
            </motion.button>

            {/* Réseaux */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ display: "flex", gap: "1.2rem", marginTop: "1.8rem", justifyContent: "center" }}>
              {[[SvgInstagram, "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq"], [SvgTiktok, "https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB"], [SvgYoutube, "https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT"]].map(([Icon, href], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(28,18,8,0.72)", transition: "color 0.3s" }}
                  onTouchStart={e => e.currentTarget.style.color = GOLD}
                  onTouchEnd={e => e.currentTarget.style.color = "rgba(28,18,8,0.4)"}
                ><Icon /></a>
              ))}
            </motion.div>

            {/* Sélecteur de langue */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.4rem" }}>
              {["FR", "EN", "ES", "ZH"].map(l => (
                <button key={l} onClick={() => { setLang(l); try { localStorage.setItem("gnz-lang", l); } catch {} }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", padding: "4px 6px",
                    color: lang === l ? GOLD : "rgba(28,18,8,0.3)", borderBottom: lang === l ? `1px solid ${GOLD}` : "1px solid transparent", transition: "all 0.3s" }}>
                  {l}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── HERO MOBILE ─────────────────────────────────────────────────── */
const _HERO_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "hero.mp4";
const _VIDEO_STYLE = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.82) contrast(1.05) saturate(1.0)" };

const HeroVideoLoop = ({ onPlaying }) => {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const play = () => v.play().then(() => onPlaying && onPlaying()).catch(() => {});
    play();
    v.addEventListener("canplay",    play, { once: true });
    v.addEventListener("loadeddata", play, { once: true });
    document.addEventListener("touchstart", play, { once: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
    return () => {
      v.removeEventListener("canplay",    play);
      v.removeEventListener("loadeddata", play);
      document.removeEventListener("touchstart", play);
    };
  }, []);
  return (
    <video
      ref={ref}
      src={_HERO_SRC}
      autoPlay muted playsInline loop
      disablePictureInPicture disableRemotePlayback
      preload="auto"
      controls={false}
      x-webkit-airplay="deny"
      controlsList="nodownload nofullscreen noremoteplayback"
      onEnded={e => { e.target.currentTime = 0; e.target.play().catch(() => {}); }}
      style={{ ..._VIDEO_STYLE }}
    />
  );
};

const HeroMobile = ({ onScrollDown }) => {
  const t = useTr();
  const opacity = useParallax([0, 400], [1, 0]);
  const heroTextRef = useRef(null);
  const heroInView = useInView(heroTextRef, { once: false, margin: "-10% 0px" });

  return (
    <section style={{ height: "100dvh", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#1c1208" }}>
      {/* Photo plein écran */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, willChange: "transform" }}
      >
        <HeroVideoLoop />
        {/* Gradient bas fort pour lire le texte */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.65) 100%)" }} />
      </motion.div>


      {/* Fondu bas vers crème — transition douce vers la section suivante */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, transparent 0%, #f5f0e8 100%)", zIndex: 8, pointerEvents: "none" }} />

      {/* Grain overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      {/* Contenu texte — bottom */}
      <motion.div style={{ position: "relative", zIndex: 10, width: "100%", padding: "0 1.4rem 5.5rem", opacity }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.6em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem" }}
        >
          {t("hero_maison")}
        </motion.p>

        <div style={{ lineHeight: 0.88, marginBottom: "1.8rem" }}>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "105%" }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: CREAM, display: "block", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
            >GASPARD</motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "105%" }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: "transparent", WebkitTextStroke: `2.5px ${GOLD}`, display: "block", margin: 0, filter: "drop-shadow(0 0 12px rgba(184,151,62,0.5))" }}
            >NZ</motion.h1>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginBottom: "1.4rem", width: "180px", transformOrigin: "left" }}
        />

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.9rem" }}
        >
          <motion.p ref={heroTextRef}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={heroInView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(18px, 5vw, 24px)", color: "rgba(245,240,232,0.97)", lineHeight: 1.3, letterSpacing: "0.06em" }}>
            {t("hero_subtitle")}
          </motion.p>
          <motion.button onClick={onScrollDown}
            animate={{ boxShadow: ["0 0 0px rgba(184,151,62,0)", "0 0 14px rgba(184,151,62,0.55)", "0 0 0px rgba(184,151,62,0)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "relative", overflow: "hidden", background: "none", border: "1px solid rgba(245,240,232,0.65)", color: "rgba(245,240,232,0.95)", cursor: "pointer", padding: "0.7rem 1.4rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            <motion.span
              animate={{ x: ["-130%", "230%"] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.5), transparent)", pointerEvents: "none" }} />
            {t("hero_cta")}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ── HERITAGE MOBILE ─────────────────────────────────────────────── */
const HeritageMobile = ({ refEl }) => {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", overflow: "hidden" }}>
      {/* Photo pleine largeur */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", height: "80vw", minHeight: "340px", maxHeight: "520px", overflow: "hidden" }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/heritage.jpg`}
          alt="Gaspardnz — L'Inspirateur"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
        {/* Gradient haut : transition depuis le hero sombre */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #f5f0e8 0%, transparent 25%, transparent 45%, rgba(245,240,232,0.7) 80%, #f5f0e8 100%)" }} />
        {/* Tag flottant */}
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ position: "absolute", top: "1.4rem", left: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div style={{ width: "20px", height: "1px", background: GOLD }} />
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase" }}>L'Inspirateur</p>
        </motion.div>
      </motion.div>

      {/* Bloc texte */}
      <div style={{ padding: "0 1.6rem 5rem", marginTop: "-1.5rem", position: "relative", textAlign: "center" }}>
        <motion.div
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 2.2rem", width: "60px", transformOrigin: "center" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.9 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.35rem, 5.5vw, 1.9rem)", fontWeight: 300, lineHeight: 1.65, color: "rgba(28,18,8,0.82)", fontStyle: "italic", marginBottom: "2rem" }}
        >
          {t("hero_desc")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.75, duration: 0.8 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(0.72rem, 2.8vw, 0.82rem)", fontWeight: 300, lineHeight: 1.9, color: "rgba(28,18,8,0.78)", letterSpacing: "0.03em" }}
        >
          {t("heritage_desc")}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "2.2rem auto 0", width: "60px", transformOrigin: "center" }}
        />
      </div>
    </section>
  );
};

/* ── SHOWROOM MOBILE ─────────────────────────────────────────────── */

/* ── FLAMMES CAROUSEL ─────────────────────────────────────────── */
const FlammesCarousel = ({ onClick }) => {
  const t = useTr();
  const [cur, setCur] = useState(0);
  const N = 5;
  useEffect(() => {
    const id = setInterval(() => setCur(c => (c + 1) % N), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div onClick={onClick} style={{ position: "relative", height: "85vw", minHeight: "340px", maxHeight: "520px", overflow: "hidden", cursor: "pointer" }}>
      <div style={{ display: "flex", height: "100%", transform: `translateX(${-cur * 100}%)`, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}>
        {Array.from({ length: N }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: "100%", height: "100%", background: `hsl(30,${12+i*3}%,${7+i*3}%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {/* Ligne déco gauche */}
            <div style={{ position: "absolute", left: "1.8rem", top: 0, bottom: 0, width: "1px", background: `linear-gradient(to bottom, transparent, rgba(184,151,62,0.4), transparent)` }} />
            {/* Ligne déco droite */}
            <div style={{ position: "absolute", right: "1.8rem", top: 0, bottom: 0, width: "1px", background: `linear-gradient(to bottom, transparent, rgba(184,151,62,0.4), transparent)` }} />
            <div style={{ textAlign: "center", padding: "2rem 3rem" }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: `rgba(184,151,62,0.6)`, textTransform: "uppercase", marginBottom: "1.4rem" }}>{t("flammes_presente")}</div>
              <div style={{ width: "40px", height: "1px", background: GOLD, margin: "0 auto 1.4rem", opacity: 0.5 }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.8rem,13vw,4.5rem)", color: "rgba(245,240,232,0.92)", letterSpacing: "0.08em", lineHeight: 0.95 }}>LES<br/>FLAMMES</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.1rem,5vw,1.5rem)", color: GOLD, fontStyle: "italic", fontWeight: 300, marginTop: "0.6rem", letterSpacing: "0.05em" }}>2026</div>
              <div style={{ width: "40px", height: "1px", background: GOLD, margin: "1.4rem auto", opacity: 0.5 }} />
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(245,240,232,0.75)", textTransform: "uppercase" }}>{t("flammes_lieu")}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(245,240,232,0.95) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "1.2rem", left: "1.2rem", border: "1px solid rgba(184,151,62,0.3)", padding: "0.8rem 1.2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", margin: 0 }}>Gaspardnz · Les Flammes 2026</p>
      </div>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(28,18,8,0.55)", padding: "0.5rem 0.9rem", backdropFilter: "blur(4px)" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", margin: 0 }}>{t("voir_galerie_btn")}</p>
      </div>
      <div style={{ position: "absolute", bottom: "1.15rem", right: "1.2rem", display: "flex", gap: "5px", alignItems: "center" }}>
        {Array.from({ length: N }).map((_, i) => (
          <div key={i} style={{ width: i === cur ? 18 : 5, height: 2, background: i === cur ? GOLD : "rgba(184,151,62,0.3)", transition: "width 0.4s", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
};

const ShowroomMobile = ({ refEl, onCatalogue, onFlammes }) => {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", overflow: "hidden" }}>
      <FlammesCarousel onClick={onFlammes} />

      {/* Texte */}
      <div ref={ref} style={{ padding: "3rem 1.4rem 4rem" }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem" }}
        >{t("nav_showroom")}</motion.p>

        <div style={{ overflow: "hidden", marginBottom: "1.8rem" }}>
          <motion.h2
            initial={{ y: "105%" }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px, 14vw, 76px)", lineHeight: 0.9, letterSpacing: "0.04em", color: TEXT, margin: 0 }}
          >L'ART<br />DU SUR-MESURE</motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.15rem)", fontWeight: 300, color: "rgba(28,18,8,0.78)", lineHeight: 1.8, fontStyle: "italic", marginBottom: "2.5rem" }}
        >
          {t("showroom_desc")}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: "2rem", borderTop: "1px solid rgba(28,18,8,0.09)", paddingTop: "2rem", marginBottom: "2.5rem" }}
        >
          {[["07", t("showroom_stat1")], ["∞", t("showroom_stat2")], ["01", t("showroom_stat3")]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: GOLD, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.6)", textTransform: "uppercase", marginTop: "0.4rem" }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          onClick={onCatalogue}
          style={{ width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, padding: "1.1rem", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
          onTouchStart={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = "#1c1208"; }}
          onTouchEnd={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = GOLD; }}
        >
          {t("showroom_cta")} <SvgArrow size={14} />
        </motion.button>
      </div>
    </section>
  );
};

/* ── SHOP THE LOOK — hotspots data ──────────────────────────────── */
/* Positions vérifiées photo par photo. Chapeau y:14, Haut y:38,              */
/* Cravate y:44, Bas y:65, Chaussures y:88 — x adapté à chaque cadrage.      */
const _WA_STL = "33664826920";
const _STL_SPOTS = [
  [ // 0 — Costume Crème — ASSIS · chapeau ✓ · bas ✓ · chaussures ✓
    { x:50, y:14, label:"Chapeau — Fedora large bord crème", detail:"Fedora crème large bord sur-mesure, feutre premium — pièce signature Gaspardnz" },
    { x:40, y:38, label:"Haut — Ensemble crème col mao", detail:"Veste col mao & pantalon crème sur-mesure, coupe africaine ajustée, boutons crème assortis" },
    { x:50, y:65, label:"Bas — Pantalon crème coordonné", detail:"Pantalon crème sur-mesure, coupe droite, coordonné à la veste — tombé parfait" },
    { x:35, y:82, label:"Chaussures — Mocassins bicolores", detail:"Mocassins marron & caramel bicolores, semelle cuir, finition artisanale" },
  ],
  [ // 1 — Élégance Blanche — DEBOUT · chapeau ✓ · bas ✗ (coupé) · chaussures ✗
    { x:50, y:15, label:"Chapeau — Fedora crème", detail:"Fedora crème large bord sur-mesure, feutre premium — pièce signature Gaspardnz" },
    { x:40, y:40, label:"Haut — Veste blanche col mao", detail:"Veste blanche col mao 4 poches plaquées, style sénatorial sur-mesure, boutons dorés" },
    { x:65, y:45, label:"Pochette — Soie orange contrastée", detail:"Pochette soie orange vif, pliage signature Gaspardnz — contraste audacieux sur le blanc" },
  ],
  [ // 2 — Veste Rayée — ASSIS tabouret · chapeau ✓ · bas ✓ · chaussures ✓
    { x:50, y:15, label:"Chapeau — Fedora crème", detail:"Fedora crème large bord sur-mesure, feutre premium — pièce signature Gaspardnz" },
    { x:40, y:38, label:"Haut — Veste rayée navy double boutonnage", detail:"Pinstripe navy, double boutonnage sur-mesure, doublure soie — coupe structurée" },
    { x:50, y:68, label:"Bas — Pantalon blanc", detail:"Pantalon blanc sur-mesure, coupe droite, revers discret — contraste élégant avec le navy" },
    { x:55, y:88, label:"Chaussures — Mocassins noirs", detail:"Loafers cuir noir, semelle Goodyear, chaussettes noires — sobriété de soirée" },
  ],
  [ // 3 — Veste Orange — ASSIS · chapeau ✓ · bas ✓ · chaussures ✓
    { x:52, y:15, label:"Chapeau — Fedora noir", detail:"Fedora noir, bord médium sur-mesure — contraste saisissant avec l'orange vif" },
    { x:40, y:38, label:"Haut — Veste orange col mao", detail:"Veste orange vif col mao sur-mesure, épaules structurées, doublure noire — pièce signature" },
    { x:50, y:65, label:"Bas — Pantalon anthracite slim", detail:"Pantalon gris anthracite, coupe slim sur-mesure — ancrage sombre pour l'orange vif" },
    { x:35, y:82, label:"Chaussures — Loafers noirs à pompons", detail:"Loafers cuir noir, pompons caractéristiques, semelle cuir — finition élégante" },
  ],
  [ // 4 — Costume Carreaux — DEBOUT full body · chapeau ✓ · bas ✓ · chaussures ✓
    { x:50, y:12, label:"Chapeau — Fedora taupe", detail:"Fedora taupe, bord court structuré sur-mesure — harmonie parfaite avec le costume kaki" },
    { x:40, y:35, label:"Haut — Costume carreaux kaki double boutonnage", detail:"Veste carreaux kaki & vert, double boutonnage sur-mesure, col cranté, doublure soie" },
    { x:50, y:63, label:"Bas — Pantalon carreaux assorti", detail:"Pantalon carreaux coordonné sur-mesure, coupe droite ajustée, pli marqué — ensemble complet" },
    { x:48, y:88, label:"Chaussures — Oxford noirs full brogue", detail:"Oxford cuir noir, perforations full brogue, semelle Goodyear — chaussette noire fine" },
  ],
  [ // 5 — Veste Bleue — DEBOUT full body · chapeau ✓ · bas ✓ · chaussures ✓
    { x:50, y:12, label:"Chapeau — Fedora orange vif", detail:"Fedora orange, large bord sur-mesure — accord chromatique audacieux avec le bleu électrique" },
    { x:40, y:38, label:"Haut — Veste bleue style safari", detail:"Veste bleue électrique multi-poches sur-mesure, style safari contemporain, chemise blanche dessous" },
    { x:50, y:65, label:"Bas — Pantalon bleu électrique", detail:"Pantalon bleu électrique coordonné sur-mesure, coupe droite — ensemble total look bleu" },
    { x:48, y:88, label:"Chaussures — Sneakers bleus & blancs", detail:"Sneakers cuir bleu & blanc, semelle blanche — touche sportive chic au total look" },
  ],
  [ // 6 — Style Parisien — ASSIS canapé · pas chapeau · bas ✓ · chaussures ✗ (coupé)
    { x:44, y:48, label:"Tenue complète — Ensemble marron col mao", detail:"Veste & pantalon marron sur-mesure, col mao boutonné, coupe africaine ajustée — total look marron, style africain parisien" },
  ],
  [ // 7 — Chemise Lavande — DEBOUT (gauche) · pas chapeau · bas ✓ · chaussures ✓
    { x:30, y:35, label:"Haut — Chemise rayée lavande", detail:"Chemise rayures lavande & blanc sur-mesure, col contrasté blanc, double manchette — coupe ajustée" },
    { x:26, y:65, label:"Bas — Pantalon gris anthracite", detail:"Pantalon gris anthracite sur-mesure, coupe droite à pinces, taille ajustée — tombé impeccable" },
    { x:26, y:87, label:"Chaussures — Loafers marron patinés", detail:"Mocassins cuir marron patiné, semelle cuir, chaussettes assorties — artisanat premium" },
  ],
  [ // 8 — Costume Bleu & Rouge — ASSIS · pas chapeau · cravate ✓ · bas ✓ · chaussures ✓
    { x:40, y:35, label:"Haut — Veste bleue + gilet bordeaux", detail:"Veste bleue électrique + gilet bordeaux sur-mesure, ensemble 3 pièces bicolore — pièce unique" },
    { x:51, y:44, label:"Cravate — Soie rayée bleu & rouge", detail:"Cravate soie rayures bleu & rouge sur-mesure, nœud four-in-hand — accord chromatique parfait" },
    { x:52, y:65, label:"Bas — Pantalon rouge sur-mesure", detail:"Pantalon rouge vif sur-mesure, coupe slim — troisième couleur du 3 pièces bicolore" },
    { x:40, y:82, label:"Chaussures — Loafers marron à pompons", detail:"Loafers cuir marron foncé, pompons caractéristiques, semelle cuir — finesse de soirée" },
  ],
  [ // 9 — Veste Bleue Rayée — DEBOUT full body · chapeau ✓ · bas ✓ · chaussures ✓
    { x:48, y:12, label:"Chapeau — Fedora blanc", detail:"Fedora blanc, bord large sur-mesure — luminosité totale sur le look bleu & blanc" },
    { x:40, y:38, label:"Haut — Veste bleue rayée double boutonnage", detail:"Pinstripe bleu & blanc, double boutonnage sur-mesure, boutons blancs nacre — légèreté estivale" },
    { x:48, y:65, label:"Bas — Pantalon blanc", detail:"Pantalon blanc sur-mesure, coupe droite — contraste lumineux avec la veste rayée bleue" },
    { x:45, y:88, label:"Chaussures — Loafers marron à pompons", detail:"Mocassins cuir marron, pompons tressés, semelle cuir — touche décontractée chic" },
  ],
  [ // 10 — Costume Bordeaux — DEBOUT full body · chapeau ✓ · bas ✓ · chaussures ✓
    { x:50, y:12, label:"Chapeau — Chapeau wax ethnique", detail:"Chapeau tissu wax africain marron & bordeaux sur-mesure — pièce artisanale unique et signature" },
    { x:40, y:38, label:"Haut — Veste bordeaux col mao", detail:"Veste bordeaux col mao style africain sur-mesure, coupe ajustée, boutons assortis" },
    { x:50, y:65, label:"Bas — Pantalon bordeaux coordonné", detail:"Pantalon bordeaux sur-mesure, coupe droite — ensemble 2 pièces total look bordeaux" },
    { x:48, y:88, label:"Chaussures — Loafers marine à pompons", detail:"Loafers cuir bleu marine, pompons caractéristiques, semelle cuir — contrepoint élégant" },
  ],
  [ // 11 — Promenade Blanche — DEBOUT marchant profil · chapeau ✓ · bas ✓ · chaussures ✓
    { x:38, y:15, label:"Chapeau — Fedora blanc plat bord", detail:"Fedora blanc style panama, bord court sur-mesure — perfection du total look blanc" },
    { x:52, y:40, label:"Haut — Veste blanche sur-mesure", detail:"Veste blanche 2 boutons sur-mesure, coupe classique ajustée, doublure légère — allure côte d'azur" },
    { x:55, y:68, label:"Bas — Pantalon blanc coordonné", detail:"Pantalon blanc sur-mesure, coupe droite, tombé parfait — total look blanc immaculé" },
    { x:42, y:88, label:"Chaussures — Loafers marron", detail:"Mocassins cuir marron, semelle cuir, chaussettes blanches — seul accent chaud du look" },
  ],
  [ // 12 — Smoking Doré — DEBOUT · Gaspard à DROITE · pas chapeau · bas ✓ · chaussures ✓
    { x:68, y:38, label:"Haut — Smoking velours doré", detail:"Veste smoking velours doré double boutonnage sur-mesure, revers satin noir — soirée de prestige" },
    { x:68, y:68, label:"Bas — Pantalon noir de soirée", detail:"Pantalon noir sur-mesure, coupe slim, coordonné aux revers satin — galon satin sur couture" },
    { x:68, y:88, label:"Chaussures — Souliers vernis noirs", detail:"Oxford vernis noir, finition miroir absolue, chaussettes soie noire — excellence de soirée" },
  ],
  [ // 13 — Veste Navy Soirée — DEBOUT 3/4 · chapeau ✓ · bas ✓ (coupé genoux) · chaussures ✗
    { x:50, y:14, label:"Chapeau — Fedora blanc", detail:"Fedora blanc large bord sur-mesure — élégance nocturne face au navy" },
    { x:40, y:38, label:"Haut — Veste navy rayée double boutonnage", detail:"Pinstripe navy & blanc, double boutonnage sur-mesure — soirée décontractée haut de gamme" },
    { x:50, y:68, label:"Bas — Pantalon blanc", detail:"Pantalon blanc sur-mesure, coupe droite — lumineux contraste avec la veste navy" },
  ],
  [ // 14 — Costume Carreaux Rose — DEBOUT full body · pas chapeau · cravate ✓ · bas ✓ · chaussures ✓
    { x:40, y:38, label:"Haut — Veste carreaux bordeaux & gris", detail:"Veste carreaux bordeaux & gris, double boutonnage sur-mesure — lainage italien doux, audace chromatique" },
    { x:51, y:45, label:"Cravate — Soie fuchsia", detail:"Cravate fuchsia/rose vif soie sur-mesure, nœud four-in-hand — accord osé & assumé" },
    { x:50, y:68, label:"Bas — Pantalon gris anthracite", detail:"Pantalon gris anthracite sur-mesure, coupe slim — contrepoint sobre au carreaux de la veste" },
    { x:48, y:88, label:"Chaussures — Oxford marron foncé", detail:"Oxford cuir marron foncé full brogue, semelle Goodyear, chaussettes grises fines" },
  ],
];

/* ── GALLERY MOBILE — scroll horizontal ─────────────────────────── */
const GalleryMobile = ({ refEl }) => {
  const t = useTr();
  const baseItems = [
    { src: `${import.meta.env.BASE_URL}images/costume-creme.jpg`, label: t("gal_1") },
    { src: `${import.meta.env.BASE_URL}images/elegance-blanche.jpg`, label: t("gal_2") },
    { src: `${import.meta.env.BASE_URL}images/veste-rayee.jpg`, label: t("gal_3") },
    { src: `${import.meta.env.BASE_URL}images/veste-orange.jpg`, label: t("gal_4") },
    { src: `${import.meta.env.BASE_URL}images/costume-carreaux.jpg`, label: t("gal_5") },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue.jpg`, label: t("gal_6") },
    { src: `${import.meta.env.BASE_URL}images/style-parisien.jpg`, label: t("gal_7") },
    { src: `${import.meta.env.BASE_URL}images/chemise-lavande.jpg`, label: t("gal_8") },
    { src: `${import.meta.env.BASE_URL}images/costume-bleu-rouge.jpg`, label: t("gal_9") },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue-rayee.jpg`, label: t("gal_10") },
    { src: `${import.meta.env.BASE_URL}images/costume-bordeaux.jpg`, label: t("gal_11") },
    { src: `${import.meta.env.BASE_URL}images/promenade-blanche.jpg`, label: t("gal_12") },
    { src: `${import.meta.env.BASE_URL}images/smoking-dore.jpg`, label: t("gal_13") },
    { src: `${import.meta.env.BASE_URL}images/veste-navy-soiree.jpg`, label: t("gal_14") },
    { src: `${import.meta.env.BASE_URL}images/costume-carreaux-rose.jpg`, label: t("gal_15") },
  ];
  const items = baseItems.map((it, i) => ({ ...it, hotspots: _STL_SPOTS[i] || [] }));

  const n = items.length;
  const [cur, setCur] = useState(0);
  const [activeSpot, setActiveSpot] = useState(null); // { iIdx, sIdx }
  const [shareToast, setShareToast] = useState(null);
  const timerRef = useRef(null);

  const go = (dir) => { setCur(c => (c + dir + n) % n); };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
  };

  useEffect(() => {
    if (!n) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
    return () => clearInterval(timerRef.current);
  }, [n]);

  useEffect(() => {
    if (activeSpot) clearInterval(timerRef.current);
    else resetTimer();
  }, [activeSpot]);

  const curSpot = activeSpot ? items[activeSpot.iIdx]?.hotspots?.[activeSpot.sIdx] : null;
  const curItem = activeSpot ? items[activeSpot.iIdx] : null;

  const handleWA = () => {
    if (!curSpot || !curItem) return;
    const msg = encodeURIComponent(
      `Bonjour Gaspard ! J'ai découvert votre look "${curItem.label}" sur gaspardnz.com et je suis très intéressé(e) par "${curSpot.label}" — ${curSpot.detail}. Pourriez-vous me donner plus d'informations et le tarif pour une création sur-mesure ? Merci 🙏`
    );
    window.open(`https://wa.me/${_WA_STL}?text=${msg}`, "_blank");
  };

  const handleShare = async (network) => {
    const siteUrl = "https://gaspardnz.vercel.app";
    const lookName = curItem?.label ?? "Gaspardnz";
    const shareText = `✨ Look "${lookName}" — Gaspardnz, styliste parisien`;
    if (network === "native") {
      try { await navigator.share({ title: lookName, text: shareText, url: siteUrl }); } catch {}
      return;
    }
    const enc = encodeURIComponent;
    if (network === "facebook") { window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(siteUrl)}`, "_blank"); return; }
    if (network === "twitter")  { window.open(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(siteUrl)}`, "_blank"); return; }
    if (network === "pinterest"){ window.open(`https://pinterest.com/pin/create/button/?url=${enc(siteUrl)}&description=${enc(shareText)}`, "_blank"); return; }
    if (network === "whatsapp") { window.open(`https://wa.me/?text=${enc(shareText + "\n" + siteUrl)}`, "_blank"); return; }
    try {
      await navigator.clipboard.writeText(siteUrl);
      setShareToast(network === "instagram" ? "Lien copié — collez dans votre story Instagram !" : "Lien copié — collez dans votre bio TikTok !");
      setTimeout(() => setShareToast(null), 3000);
    } catch { window.open(network === "instagram" ? "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq" : "https://tiktok.com/@gaspardnz", "_blank"); }
  };

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", paddingBottom: "4rem" }}>
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", padding: "3rem 1.4rem 1.5rem" }}
      >{t("nav_galerie")}</motion.p>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          transform: `translateX(${-cur * 100}%)`,
          transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}>
          {items.map(({ src, label, hotspots }, i) => (
            <div key={i} style={{ flex: "0 0 100%", width: "100%", position: "relative" }}>
              <img src={src} alt={label} loading="lazy"
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", filter: "brightness(0.94) contrast(1.02) saturate(0.9)", display: "block" }} />
              {label && (
                <div style={{ position: "absolute", bottom: "1rem", left: "1rem" }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{label}</p>
                </div>
              )}
              {/* Shop the Look indicator */}
              {i === cur && hotspots.length > 0 && (
                <div style={{ position: "absolute", bottom: "1rem", right: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD }} />
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6px", letterSpacing: "0.35em", color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>Shop the Look</p>
                </div>
              )}
              {/* Hotspot dots */}
              {i === cur && hotspots.map((spot, si) => (
                <motion.button
                  key={si}
                  onClick={() => setActiveSpot({ iIdx: i, sIdx: si })}
                  animate={{ boxShadow: ["0 0 0 0px rgba(184,151,62,0.5)", "0 0 0 6px rgba(184,151,62,0)", "0 0 0 0px rgba(184,151,62,0.5)"] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: si * 0.45, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "1.5px solid rgba(184,151,62,0.85)",
                    cursor: "pointer",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(184,151,62,0.9)", boxShadow: "0 0 4px rgba(184,151,62,0.6)" }} />
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        <button onClick={() => { go(-1); resetTimer(); }}
          style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={() => { go(1); resetTimer(); }}
          style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "1.2rem" }}>
        {items.map((_, i) => (
          <div key={i} style={{ width: i === cur ? "20px" : "6px", height: "2px", background: i === cur ? GOLD : "rgba(28,18,8,0.2)", borderRadius: "1px", transition: "all 0.3s", cursor: "pointer" }} onClick={() => { setCur(i); resetTimer(); }} />
        ))}
      </div>

      {/* Shop the Look panel */}
      <AnimatePresence>
        {activeSpot && curSpot && curItem && (
          <>
            <motion.div
              key="stl-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveSpot(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(28,18,8,0.55)", zIndex: 200, backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            />
            <motion.div
              key="stl-panel"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "#faf7f2",
                zIndex: 201,
                borderRadius: "18px 18px 0 0",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.4rem)",
                maxHeight: "82vh",
                overflow: "auto",
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "6px" }}>
                <div style={{ width: "36px", height: "3px", background: "rgba(28,18,8,0.18)", borderRadius: "2px" }} />
              </div>
              {shareToast && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ position: "absolute", top: "52px", left: "50%", transform: "translateX(-50%)", background: "#1c1208", color: "#faf7f2", padding: "7px 16px", borderRadius: "20px", fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", whiteSpace: "nowrap", zIndex: 5, pointerEvents: "none" }}>
                  ✓ {shareToast}
                </motion.div>
              )}

              {/* Header */}
              <div style={{ padding: "0.6rem 1.4rem 1rem", borderBottom: `1px solid rgba(184,151,62,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6.5px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "5px" }}>SHOP THE LOOK</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 300, color: TEXT, letterSpacing: "0.02em" }}>{curItem.label}</p>
                </div>
                <button onClick={() => setActiveSpot(null)} style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "rgba(28,18,8,0.45)", fontSize: "18px", lineHeight: 1, marginTop: "2px" }}>×</button>
              </div>

              {/* Article sélectionné */}
              <div style={{ padding: "1.2rem 1.4rem" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 400, color: TEXT, marginBottom: "10px" }}>{curSpot.label}</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10.5px", color: "rgba(28,18,8,0.58)", lineHeight: 1.7 }}>{curSpot.detail}</p>
              </div>

              {/* WhatsApp CTA */}
              <div style={{ padding: "1.2rem 1.4rem 0" }}>
                <motion.button
                  onClick={handleWA}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", background: "#1c1208", border: "none",
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    cursor: "pointer", borderRadius: "2px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: "#faf7f2", textTransform: "uppercase", fontWeight: 500 }}>Demander ce look sur WhatsApp</span>
                </motion.button>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(28,18,8,0.38)", textAlign: "center", marginTop: "10px", letterSpacing: "0.05em" }}>Styliste parisien · Création unique · Réponse sous 24h</p>
              </div>

              {/* Partager ce look */}
              <div style={{ padding: "1rem 1.4rem 0.6rem", borderTop: "1px solid rgba(184,151,62,0.15)" }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: "rgba(28,18,8,0.35)", textTransform: "uppercase", textAlign: "center", marginBottom: "14px" }}>PARTAGER CE LOOK</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
                  {[
                    { id:"instagram", label:"Instagram", bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                      icon:<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                    { id:"tiktok", label:"TikTok", bg:"#010101",
                      icon:<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/> },
                    { id:"facebook", label:"Facebook", bg:"#1877F2",
                      icon:<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
                    { id:"twitter", label:"X", bg:"#000000",
                      icon:<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
                    { id:"pinterest", label:"Pinterest", bg:"#E60023",
                      icon:<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/> },
                  ].map(n => (
                    <motion.button key={n.id} whileTap={{ scale: 0.88 }} onClick={() => handleShare(n.id)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">{n.icon}</svg>
                      </div>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(28,18,8,0.45)" }}>{n.label}</span>
                    </motion.button>
                  ))}
                </div>
                {typeof navigator !== "undefined" && navigator.share && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleShare("native")}
                    style={{ width: "100%", background: "transparent", border: `1px solid rgba(184,151,62,0.4)`, borderRadius: "2px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", marginTop: "14px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                    </svg>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" }}>Partager via…</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};



/* ── INSTAGRAM SECTION ───────────────────────────────────────────── */
/* ── TIKTOK VIRAL SECTION ────────────────────────────────────────── */
const TikTokViralSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const [cur, setCur] = useState(0);
  const videos = [
    { id: "7387058056833551648", label: "37,2M vues" },
    { id: "7197495722046983429", label: "Aussi viral 🔥" },
  ];
  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>TIKTOK · @GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: "14px" }}>La vidéo qui a tout<br/>changé</p>
        <div style={{ display: "inline-flex", gap: "20px", justifyContent: "center" }}>
          {[["37,2M", "Vues"], ["449,5K", "Followers"], ["3,7M", "J'aime"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 400, color: GOLD, lineHeight: 1 }}>{n}</p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", color: "rgba(250,247,242,0.4)", letterSpacing: "0.1em", marginTop: "3px" }}>{l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Label vidéo active */}
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", textAlign: "center", marginBottom: "14px" }}>{videos[cur].label}</p>

      {/* Carousel — une seule vidéo visible */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
        style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", transform: `translateX(${-cur * 100}%)`, transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          {videos.map((v, i) => (
            <div key={v.id} style={{ minWidth: "100%", padding: "0 1.4rem", boxSizing: "border-box" }}>
              <div style={{ position: "relative", width: "100%", maxWidth: "340px", margin: "0 auto", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.2)", boxShadow: "0 12px 48px rgba(0,0,0,0.6)", aspectRatio: "9/16", maxHeight: "68vh" }}>
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${v.id}?autoplay=0`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "118%", border: "none" }}
                  allowFullScreen allow="encrypted-media"
                  loading={i === cur ? "eager" : "lazy"}
                  title={`Gaspardnz TikTok ${v.label}`}
                />
                {/* Masque bas pour cacher suggestions TikTok */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56px", background: "linear-gradient(transparent, #0a0602)", pointerEvents: "none" }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dots navigation */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "1.2rem" }}>
        {videos.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            style={{ width: i === cur ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === cur ? GOLD : "rgba(184,151,62,0.3)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>

      {/* Commentaire Fally Ipupa */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{ padding: "1.8rem 1.4rem 0" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: "rgba(250,247,242,0.3)", textTransform: "uppercase", textAlign: "center", marginBottom: "14px" }}>2 797 commentaires · commentaire épinglé</p>
        <div style={{ background: "#161210", borderRadius: "14px", padding: "1rem 1.1rem", border: "1px solid rgba(184,151,62,0.2)", maxWidth: "340px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#1a237e,#283593)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(184,151,62,0.3)" }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: "#faf7f2" }}>FI</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: "#faf7f2" }}>fallyipupa</p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#20d5ec"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.38)" }}>Artiste certifié · 2023-02-22</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/></svg>
          </div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#faf7f2", lineHeight: 1.5, marginBottom: "10px" }}>😂😂😂chic 👌</p>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(254,44,85,0.8)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(250,247,242,0.5)" }}>607</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
        style={{ textAlign: "center", marginTop: "2rem" }}>
        <motion.a href="https://www.tiktok.com/@gaspardnz" target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#010101", padding: "12px 22px", borderRadius: "24px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/></svg>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: "white", textTransform: "uppercase" }}>Suivre @gaspardnz</span>
        </motion.a>
      </motion.div>
    </section>
  );
};

const InstagramSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const posts = [
    { src: `${import.meta.env.BASE_URL}images/costume-creme.jpg`,      likes: 1204 },
    { src: `${import.meta.env.BASE_URL}images/smoking-dore.jpg`,       likes: 2318 },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue.jpg`,        likes: 987  },
    { src: `${import.meta.env.BASE_URL}images/costume-bordeaux.jpg`,   likes: 1542 },
    { src: `${import.meta.env.BASE_URL}images/elegance-blanche.jpg`,   likes: 1876 },
    { src: `${import.meta.env.BASE_URL}images/promenade-blanche.jpg`,  likes: 723  },
  ];
  return (
    <section ref={ref} style={{ background: "#faf7f2", padding: "4rem 0 4.5rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.4rem", marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: TEXT }}>@gaspardnz</p>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(28,18,8,0.45)" }}>Styliste parisien</p>
          </div>
        </div>
        <motion.a href="https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq" target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "#faf7f2", background: "linear-gradient(90deg,#dc2743,#bc1888)", padding: "8px 14px", borderRadius: "20px", textDecoration: "none", fontWeight: 600 }}>
          + Suivre
        </motion.a>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {posts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", cursor: "pointer" }}
            onClick={() => window.open("https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq", "_blank")}>
            <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} loading="lazy" />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }} className="ig-overlay">
              <div style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "white", fontWeight: 600 }}>{p.likes.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.5 }}
        style={{ textAlign: "center", marginTop: "1.6rem", padding: "0 1.4rem" }}>
        <motion.a href="https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq" target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", letterSpacing: "0.2em", color: TEXT, textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${GOLD}`, paddingBottom: "2px" }}>
          Voir tous les looks sur Instagram
        </motion.a>
      </motion.div>
    </section>
  );
};

/* ── VIP CLIENTS GALLERY ─────────────────────────────────────────── */
const VIPClientsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const clients = [
    { initials: "R.B", name: "Rodrin B. Moengue", city: "Paris", event: "Mariage", gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)" },
    { initials: "C.M", name: "Cédric M.", city: "Monaco", event: "Gala de prestige", gradient: "linear-gradient(135deg,#4a1942,#8b2fc9)" },
    { initials: "Y.B", name: "Yannick B.", city: "Lyon", event: "Soirée VIP", gradient: "linear-gradient(135deg,#1a3a1a,#2d6b2d)" },
    { initials: "A.N", name: "Alexis N.", city: "Dubaï", event: "Business meeting", gradient: "linear-gradient(135deg,#3d1a00,#8b3d00)" },
    { initials: "D.K", name: "Diarietou K.", city: "Abidjan", event: "Cérémonie", gradient: "linear-gradient(135deg,#1a1a3d,#3d3d8b)" },
    { initials: "T.R", name: "Théo R.", city: "Paris", event: "Shooting pro", gradient: "linear-gradient(135deg,#3d001a,#8b0030)" },
  ];
  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GALERIE EXCLUSIVE</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2 }}>Ils ont fait confiance<br/>à Gaspardnz</p>
      </motion.div>

      <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingLeft: "1.4rem", paddingRight: "1.4rem", scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
        {clients.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.09 }}
            style={{ flexShrink: 0, width: "160px", scrollSnapAlign: "start" }}>
            <div style={{ width: "160px", height: "210px", borderRadius: "10px", background: c.gradient, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "10px", border: "1px solid rgba(184,151,62,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(184,151,62,0.12), transparent 70%)" }} />
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: `1.5px solid rgba(184,151,62,0.5)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", background: "rgba(0,0,0,0.3)" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 500, color: GOLD }}>{c.initials}</span>
              </div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.12em", color: "rgba(250,247,242,0.5)", textTransform: "uppercase" }}>{c.event}</p>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 400, color: "#faf7f2", marginBottom: "2px" }}>{c.name}</p>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.4)", letterSpacing: "0.05em" }}>{c.city}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
        style={{ textAlign: "center", marginTop: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.3)", letterSpacing: "0.08em" }}>Vous souhaitez apparaître dans cette galerie ?</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(`https://wa.me/33664826920?text=${encodeURIComponent("Bonjour Gaspard, je souhaite être habillé(e) par vous et apparaître dans votre galerie VIP.")}`, "_blank")}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", borderBottom: `1px solid rgba(184,151,62,0.4)`, paddingBottom: "2px", marginTop: "8px" }}>
          Contactez Gaspardnz
        </motion.button>
      </motion.div>
    </section>
  );
};

/* ── TESTIMONIALS SECTION ────────────────────────────────────────── */
const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const reviews = [
    { type: "tiktok", username: "Emmanuel", likes: 894,
      text: "Son élégance m'inspire", avatar: "E", avatarBg: "#1565c0",
      reply: "🥰 Je suis honoré ! Merci 🙏", replyLikes: 106 },
    { type: "tiktok", username: "Yaro_BAKALO'S 🌴🦍🥂", likes: 64,
      text: "Le daron a encore frappé 🔥", avatar: "Y", avatarBg: "#1b5e20" },
    { type: "tiktok", username: "SAVEURS DU TERROIR &D'AILLEURS", likes: 125,
      text: "J'aime le style raffiné et le boss cartonne", avatar: "S", avatarBg: "#4a148c" },
    { type: "tiktok", username: "Immaculée conception", likes: 38,
      text: "Le tonton es trop classe 😍", avatar: "I", avatarBg: "#880e4f" },
    { type: "tiktok", username: "TONTON D TV 🇨🇩", likes: 91,
      text: "Je ferai la même chose avec ma fille 🥰🥰🥰🥰 source d'inspiration", avatar: "T", avatarBg: "#b71c1c" },
  ];
  return (
    <section ref={ref} style={{ background: "#0f0a04", padding: "4rem 0 4.5rem", overflow: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2.2rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>AVIS CLIENTS</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2 }}>Ils ont choisi<br/>Gaspardnz</p>
      </motion.div>

      <div style={{ display: "flex", gap: "14px", overflowX: "auto", paddingLeft: "1.4rem", paddingRight: "1.4rem", scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
        {reviews.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            style={{ flexShrink: 0, width: "76vw", maxWidth: "300px", scrollSnapAlign: "start", background: "#1c1208", borderRadius: "14px", padding: "1.2rem", border: "1px solid rgba(254,44,85,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "11px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: r.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 700, color: "#fff" }}>{r.avatar}</span>
                </div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600, color: "#faf7f2", flex: 1 }}>{r.username}</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/></svg>
              </div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#faf7f2", lineHeight: 1.55 }}>{r.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "9px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(254,44,85,0.85)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.45)" }}>{r.likes.toLocaleString()}</span>
              </div>
              {r.reply && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0a0602", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6px", fontWeight: 700, color: GOLD }}>GNZ</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", fontWeight: 700, color: GOLD, marginBottom: "3px" }}>Gaspardnz</p>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(250,247,242,0.75)", lineHeight: 1.45 }}>{r.reply}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(254,44,85,0.7)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", color: "rgba(250,247,242,0.3)" }}>{r.replyLikes}</span>
                    </div>
                  </div>
                </div>
              )}
          </motion.div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "1.6rem" }}>
        {reviews.map((_, i) => (
          <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(184,151,62,0.35)" }} />
        ))}
      </div>
    </section>
  );
};

/* ── FORMULES MOBILE ─────────────────────────────────────────────── */
const FormulesSection = ({ refEl, onContact, onReserver }) => {
  const t = useTr();
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const formules = [
    {
      id: "prestige",
      titre: t("formule_prestige_titre"),
      prix: "1447€",
      tag: "Premium",
      tagline: t("formule1_tagline"),
      looks: [
        {
          nom: t("look_mairie"),
          items: [
            { label: t("item_costume"), prix: "449€" },
            { label: t("item_chemise"), prix: "69€" },
            { label: t("item_cravate"), prix: "35€" },
            { label: t("item_boutons"), prix: "29€" },
            { label: t("item_chaussettes"), prix: "19€" },
            { label: t("item_chaussures_opt"), prix: t("item_chaussures_prix") },
          ],
          sous_total: "601€",
        },
        {
          nom: t("look_soiree"),
          tag: "Smoking",
          items: [
            { label: t("item_smoking"), prix: "600€" },
            { label: t("item_noeud"), prix: "49€" },
            { label: t("item_plastron"), prix: "149€" },
            { label: t("item_boutons"), prix: "29€" },
            { label: t("item_chaussettes"), prix: "19€" },
          ],
          sous_total: "846€",
        },
      ],
    },
    {
      id: "gnz",
      titre: t("formule_gnz_titre"),
      prix: "1086€",
      tag: "Signature",
      tagline: t("formule2_tagline"),
      looks: [
        {
          nom: t("look_mairie"),
          items: [
            { label: t("item_costume"), prix: "349€" },
            { label: t("item_chemise"), prix: "60€" },
            { label: t("item_cravate"), prix: "30€" },
            { label: t("item_boutons"), prix: "20€" },
            { label: t("item_chaussettes"), prix: "19€" },
            { label: t("item_chaussures_opt"), prix: t("item_chaussures_prix") },
          ],
          sous_total: "474€",
        },
        {
          nom: t("look_soiree"),
          tag: "Smoking",
          items: [
            { label: t("item_smoking"), prix: "449€" },
            { label: t("item_noeud"), prix: "29€" },
            { label: t("item_plastron"), prix: "99€" },
            { label: t("item_boutons"), prix: "20€" },
            { label: t("item_chaussettes"), prix: "15€" },
          ],
          sous_total: "612€",
        },
      ],
    },
  ];

  return (
    <section ref={refEl} style={{ background: "#0d1b3e", padding: "5rem 0 6rem", overflow: "hidden", position: "relative" }}>
      {/* Fondu haut — transition depuis le showroom crème */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, #f5f0e8, transparent)", pointerEvents: "none", zIndex: 2 }} />
      {/* Fondu bas — transition vers le footer crème */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, transparent, #ede8de)", pointerEvents: "none", zIndex: 2 }} />
      {/* Watermark */}
      <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 35vw, 220px)", color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: "0.05em", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none" }}>FORMULES</div>

      {/* Logo GNZ — haut à droite, discret */}
      <motion.img
        src={(typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "logo-gnz.png"}
        alt="Gaspard NZ"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.4 }}
        style={{ position: "absolute", top: "2rem", right: "1rem", width: "clamp(72px, 19vw, 105px)", opacity: 0.72, userSelect: "none", pointerEvents: "none", borderRadius: "4px" }}
      />

      <div ref={ref} style={{ padding: "0 1.4rem", position: "relative" }}>
        {/* Header */}
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}
        >{t("formules_surtitle")}</motion.p>

        <div style={{ overflow: "hidden", marginBottom: "0.6rem" }}>
          <motion.h2 initial={{ y: "105%" }} animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 13vw, 72px)", lineHeight: 0.9, letterSpacing: "0.04em", color: "#f5f0e8", margin: 0 }}
          >{t("formules_title")}</motion.h2>
        </div>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.1rem)", fontWeight: 300, color: "rgba(245,240,232,0.82)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "3rem" }}
        >
          {t("formules_sub")}
        </motion.p>

        {/* Cards formules */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {formules.map((f, fi) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + fi * 0.15, duration: 0.8 }}
              style={{ border: `1px solid rgba(184,151,62,${selected === f.id ? "0.5" : "0.18"})`, background: selected === f.id ? "rgba(184,151,62,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.3s" }}
            >
              {/* En-tête carte */}
              <button onClick={() => setSelected(selected === f.id ? null : f.id)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "1.6rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", textAlign: "left" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", border: `1px solid rgba(184,151,62,0.3)`, padding: "3px 8px" }}>{f.tag}</span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5.5vw, 1.7rem)", color: "#f5f0e8", fontWeight: 400, letterSpacing: "0.02em", margin: 0 }}>{f.titre}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", color: "rgba(184,151,62,0.6)", textTransform: "uppercase", marginTop: "0.5rem" }}>{t("prix_sur_demande")}</p>
                </div>
                <motion.div animate={{ rotate: selected === f.id ? 45 : 0 }} transition={{ duration: 0.3 }}
                  style={{ color: GOLD, marginTop: "0.5rem", flexShrink: 0 }}
                ><SvgArrow size={16} /></motion.div>
              </button>

              {/* Détail dépliable */}
              <AnimatePresence>
                {selected === f.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 1.4rem 1.8rem", borderTop: "1px solid rgba(184,151,62,0.1)" }}>
                      {f.looks.map((look, li) => (
                        <div key={li} style={{ marginTop: "1.4rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
                            <div style={{ height: "1px", width: "20px", background: GOLD }} />
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase" }}>
                              {look.nom}{look.tag ? ` — ${look.tag}` : ""}
                            </p>
                          </div>
                          {look.items.map((item, ii) => (
                            <div key={ii} style={{ display: "flex", alignItems: "baseline", padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.88)", fontWeight: 300, flex: 1 }}>{item.label}</p>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* CTA */}
                      <div style={{ marginTop: "1.4rem", padding: "1.2rem", background: "rgba(184,151,62,0.08)", border: `1px solid rgba(184,151,62,0.25)`, textAlign: "center" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.82)", fontStyle: "italic", marginBottom: "1.2rem" }}>{f.tagline}</p>
                        <button onClick={onReserver || onContact}
                          style={{ width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.5)`, color: GOLD, padding: "0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >{t("btn_reveler")} <SvgArrow size={13} /></button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── FOOTER MOBILE ───────────────────────────────────────────────── */
const FooterMobile = ({ onShowroom, onContact, onCatalogue, onMentions, onConfidentialite, onCGV, onFormules, onReserver }) => {
  const t = useTr();
  return (
  <footer style={{ background: "#ede8de", borderTop: "1px solid rgba(184,151,62,0.2)", padding: "4rem 1.4rem 3rem" }}>
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 10vw, 3.2rem)", letterSpacing: "0.25em", color: TEXT }}>GASPARDNZ</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: "rgba(28,18,8,0.62)", fontStyle: "italic", marginTop: "0.5rem", letterSpacing: "0.1em" }}>{t("footer_subtitle")}</div>
    </div>

    {/* Nav links */}
    <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
      {[[t("nav_showroom"), onShowroom], [t("nav_formules"), onFormules], [t("nav_contact"), onContact], [t("nav_boutique"), onCatalogue]].map(([l, fn]) => (
        <button key={l} onClick={fn}
          style={{ background: "none", border: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(28,18,8,0.72)", cursor: "pointer" }}
        >{l}</button>
      ))}
    </div>

    {/* Réseaux */}
    <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
      {[[SvgInstagram, "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq"], [SvgFacebook, "https://www.facebook.com/share/1JXsWJwpTW/?mibextid=wwXIfr"], [SvgTiktok, "https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB"], [SvgYoutube, "https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT"]].map(([Icon, href], i) => (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(28,18,8,0.65)" }}><Icon /></a>
      ))}
      <button onClick={onReserver} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(28,18,8,0.65)", display: "flex", padding: 0 }}><SvgWhatsapp /></button>
    </div>

    {/* Liens légaux */}
    <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "2.5rem", flexWrap: "wrap", borderTop: "1px solid rgba(28,18,8,0.07)", paddingTop: "1.8rem" }}>
      {[[t("footer_mentions"), onMentions], [t("footer_conf"), onConfidentialite], [t("footer_cgv"), onCGV]].map(([l, fn]) => (
        <button key={l} onClick={fn}
          style={{ background: "none", border: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(28,18,8,0.35)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
        >{l}</button>
      ))}
    </div>

    <div style={{ borderTop: "1px solid rgba(28,18,8,0.07)", paddingTop: "1.5rem", textAlign: "center" }}>
      <p style={{ fontSize: "8px", letterSpacing: "0.3em", color: "rgba(28,18,8,0.82)", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>© 2025 Gaspardnz — Tous droits réservés</p>
      <p style={{ fontSize: "8px", letterSpacing: "0.25em", color: "rgba(28,18,8,0.85)", marginTop: "0.8rem", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
        Développé par{" "}
        <a href="https://www.tiktok.com/@yaro_bkl?_r=1&_t=ZS-95ftAfp3nDo" target="_blank" rel="noopener noreferrer"
          style={{ color: "#b8973e", textDecoration: "none", letterSpacing: "0.25em", fontWeight: 500 }}>
          Yaro_Bkl
        </a>
      </p>
    </div>
  </footer>
  );
};

/* ── SPLASH SCREEN ───────────────────────────────────────────────── */
const SplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    let raf;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      // Quasi-linéaire — très légère décélération à la fin seulement
      const eased = p < 1 ? 1 - Math.pow(1 - p, 1.25) : 1;
      setProgress(eased * 100);
      if (p < 1) { raf = requestAnimationFrame(tick); }
      else setTimeout(() => { setExiting(true); setTimeout(onDone, 1100); }, 300);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#0d0b08", overflow: "hidden" }}
    >
      <style>{`
        @keyframes shimmerTitle {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes shimmerBar {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(500%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.82; transform: scale(1.014); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }
      `}</style>

      {/* Logo — centré verticalement dans la moitié haute */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: "38%", left: 0, right: 0,
          transform: "translateY(-50%)",
          textAlign: "center",
          userSelect: "none",
          padding: "0 1.5rem"
        }}
      >
        <p style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(30px, 8vw, 56px)",
          letterSpacing: "0.15em",
          lineHeight: 1,
          margin: "0 auto",
          display: "inline-block",
          background: "linear-gradient(90deg, #9a7a2e 0%, #d4ae5a 18%, #f5e070 35%, #fff8e0 50%, #f5e070 65%, #d4ae5a 82%, #9a7a2e 100%)",
          backgroundSize: "250% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmerTitle 2.4s linear infinite, pulse 3s ease-in-out infinite"
        }}>GASPARDNZ</p>

        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "9px",
          color: "rgba(184,151,62,0.6)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          marginTop: "10px",
          animation: "pulse 3s ease-in-out infinite"
        }}>PARIS</p>
      </motion.div>

      {/* Tagline — centrée verticalement dans la moitié basse */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
        style={{
          position: "absolute",
          top: "62%", left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(14px, 3.5vw, 17px)",
          color: "rgba(245,240,232,0.38)",
          letterSpacing: "0.12em",
          whiteSpace: "nowrap",
          animation: "breathe 3s ease-in-out infinite"
        }}
      >S'habiller autrement</motion.p>

      {/* Barre PLEINE LARGEUR — bord à bord, au centre de l'écran */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }}
      >
        {/* Track — fond très subtil */}
        <div style={{ width: "100%", height: "1px", background: "rgba(184,151,62,0.1)", position: "relative", overflow: "hidden" }}>
          {/* Fill doré */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #6a5218, #b8973e, #d4ae5a, #f0d880, #d4ae5a, #b8973e)",
            backgroundSize: "300% 100%",
            animation: "shimmerTitle 2s linear infinite",
            overflow: "hidden"
          }}>
            {/* Éclat blanc lent qui glisse */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, width: "18%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
              animation: "shimmerBar 2.2s ease-in-out infinite"
            }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── APP PRINCIPALE ──────────────────────────────────────────────── */
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [modal, setModal] = useState(null);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("gnz-lang");
      if (saved) return saved;
      const bl = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      if (bl.startsWith("fr")) return "FR";
      if (bl.startsWith("es")) return "ES";
      if (bl.startsWith("zh") || bl.startsWith("cn")) return "ZH";
      return "EN";
    } catch { return "FR"; }
  });
  const tr = k => T[lang]?.[k] ?? T.FR[k] ?? k;;
  const [sensorHC, setSensorHC] = useState(false);
  const [manualHC, setManualHC] = useState(() => {
    try { return localStorage.getItem("gnz-hc") === "1"; } catch { return false; }
  });
  const highContrast = sensorHC || manualHC;

  const [flashing, setFlashing] = useState(false);
  const toggleContrast = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
    setManualHC(v => {
      const next = !v;
      try { localStorage.setItem("gnz-hc", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  // Mode jour : injection CSS !important pour tout rendre crème/lisible
  useEffect(() => {
    const ID = "gnz-jour";
    let el = document.getElementById(ID);
    if (highContrast) {
      if (!el) { el = document.createElement("style"); el.id = ID; document.head.appendChild(el); }
      el.textContent = `
        #gnz-root {
          filter: brightness(1.35) contrast(1.05) !important;
        }
        #gnz-root section[style*="0d1b3e"],
        #gnz-root section[style*="1c1208"] {
          filter: brightness(1.8) !important;
        }
      `;
    } else {
      if (el) el.remove();
    }
    return () => { const e = document.getElementById(ID); if (e) e.remove(); };
  }, [highContrast]);

  useEffect(() => {
    const cleanup = [];
    // 1. AmbientLightSensor (Chrome Android)
    if (typeof window !== "undefined" && "AmbientLightSensor" in window) {
      try {
        const sensor = new window.AmbientLightSensor({ frequency: 0.5 });
        sensor.addEventListener("reading", () => setSensorHC(sensor.illuminance > 3000));
        sensor.addEventListener("error", () => {});
        sensor.start();
        cleanup.push(() => sensor.stop());
      } catch (e) {}
    }
    // 2. prefers-contrast: more (réglages accessibilité)
    const mqContrast = window.matchMedia("(prefers-contrast: more)");
    const handleContrast = e => setSensorHC(v => v || e.matches);
    if (mqContrast.matches) setSensorHC(true);
    mqContrast.addEventListener("change", handleContrast);
    cleanup.push(() => mqContrast.removeEventListener("change", handleContrast));
    // 3. prefers-color-scheme: dark (mode auto du téléphone)
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const handleDark = e => setSensorHC(v => v || e.matches);
    mqDark.addEventListener("change", handleDark);
    cleanup.push(() => mqDark.removeEventListener("change", handleDark));
    return () => cleanup.forEach(fn => fn());
  }, []);
  const showroomRef = useRef(null);
  const heritageRef = useRef(null);
  const galleryRef = useRef(null);
  const formulesRef = useRef(null);

  const scrollTo = r => r.current?.scrollIntoView({ behavior: "smooth" });

  // ── SEO : injection dynamique des meta tags ──────────────────────
  useEffect(() => {
    // Titre & description
    document.title = "Gaspardnz — Créateur de Mode Sur-Mesure à Paris | S'Habiller Autrement";
    
    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    // Meta essentiels
    setMeta("description", "Gaspardnz — Créateur de mode sur-mesure basé à Paris. Costumes, vestes, chemises brodées et accessoires premium pour hommes qui osent se distinguer. Conseil en image, formules mariage & événements.");
    setMeta("keywords", "Gaspardnz, costume sur-mesure Paris, créateur mode homme Paris, vêtement sur-mesure, conseil image homme, costume mariage Paris, smoking sur-mesure, haute couture homme, s'habiller autrement, mode africaine Paris");
    setMeta("author", "Gaspardnz");
    setMeta("robots", "index, follow");
    setMeta("language", "French");
    setMeta("revisit-after", "7 days");
    setMeta("theme-color", "#b8973e");

    // Open Graph (Facebook, Instagram, WhatsApp, LinkedIn)
    setMeta("og:type", "website", "property");
    setMeta("og:title", "Gaspardnz — Créateur de Mode Sur-Mesure à Paris", "property");
    setMeta("og:description", "Costumes, vestes et pièces sur-mesure pour hommes qui osent se distinguer. Basé à Paris. Disponible sur WhatsApp.", "property");
    setMeta("og:url", "https://gaspardnz.fr", "property");
    setMeta("og:site_name", "Gaspardnz", "property");
    setMeta("og:locale", "fr_FR", "property");

    // Twitter / X Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "Gaspardnz — Sur-Mesure Paris");
    setMeta("twitter:description", "Créateur de mode sur-mesure à Paris. Costumes, vestes, formules mariage. S'habiller autrement.");
    setMeta("twitter:site", "@gaspardnz");

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://gaspardnz.fr";

    // JSON-LD Structured Data (Google, IA, ChatGPT, Claude…)
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://gaspardnz.fr/#business",
          "name": "Gaspardnz",
          "alternateName": "Gaspard NZ",
          "description": "Créateur de mode sur-mesure basé à Paris. Costumes, vestes, chemises brodées, accessoires premium et conseil en image pour hommes.",
          "slogan": "S'Habiller Autrement",
          "url": "https://gaspardnz.fr",
          "telephone": "+33664826920",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Paris",
            "addressCountry": "FR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 48.8566,
            "longitude": 2.3522
          },
          "openingHours": "Mo-Sa 09:00-19:00",
          "priceRange": "€€€",
          "sameAs": [
            "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq",
            "https://www.facebook.com/share/1JXsWJwpTW/?mibextid=wwXIfr",
            "https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB",
            "https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Collections & Formules",
            "itemListElement": [
              { "@type": "Offer", "name": "Formule Prestige", "price": "1447", "priceCurrency": "EUR", "description": "Look Mairie + Look Soirée Smoking complet" },
              { "@type": "Offer", "name": "Formule Gaspard NZ", "price": "1086", "priceCurrency": "EUR", "description": "Élégance accessible pour mariage parfaitement maîtrisé" },
              { "@type": "Offer", "name": "Costume Sur-Mesure", "description": "Costumes coupe droite, croisé ou trois pièces" },
              { "@type": "Offer", "name": "Vestes Structurées", "description": "Vestes de créateur aux coupes signature" },
              { "@type": "Offer", "name": "Conseil en Image", "description": "Accompagnement personnalisé pour votre style" }
            ]
          }
        },
        {
          "@type": "Person",
          "@id": "https://gaspardnz.fr/#person",
          "name": "Gaspardnz",
          "jobTitle": "Créateur de Mode & Consultant en Image",
          "worksFor": { "@id": "https://gaspardnz.fr/#business" },
          "knowsAbout": ["Mode masculine", "Costume sur-mesure", "Conseil en image", "Haute couture", "Mariage"],
          "sameAs": ["https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq"]
        },
        {
          "@type": "WebSite",
          "@id": "https://gaspardnz.fr/#website",
          "url": "https://gaspardnz.fr",
          "name": "Gaspardnz",
          "inLanguage": "fr-FR",
          "description": "Site officiel de Gaspardnz — Créateur de mode sur-mesure à Paris"
        }
      ]
    };

    let scriptEl = document.getElementById("jsonld-schema");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "jsonld-schema";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

  }, []);

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
    {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
    <div id="gnz-root" style={{ background: "#f5f0e8", color: TEXT, minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", overflowX: "hidden" }}>
      <style>{`
        ${fonts}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${GOLD}; color: #f5f0e8; }
        html { scroll-behavior: smooth; }
        @media (prefers-contrast: more) { html { filter: contrast(1.6) saturate(1.2); } }
        button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        a { -webkit-tap-highlight-color: transparent; }
        /* Masquer scrollbar galerie */
        ::-webkit-scrollbar { display: none; }
        .cat-row { display: flex; justify-content: space-between; align-items: center; padding: 1.4rem 0; border-bottom: 1px solid rgba(184,151,62,0.1); cursor: pointer; transition: all 0.3s; }
        .cat-lbl { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.2rem, 5vw, 1.6rem); font-weight: 400; letter-spacing: 0.05em; transition: color 0.3s; }
      `}</style>

      {/* Flash écran */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ position: "fixed", inset: 0, background: "white", zIndex: 9999, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      <NavMobile
        highContrast={highContrast}
        onToggleContrast={toggleContrast}
        onReserver={() => setModal("booking")}
        onBiographie={() => setModal("biographie")}
        onShowroom={() => scrollTo(showroomRef)}
        onGalerie={() => scrollTo(galleryRef)}
        onFormules={() => scrollTo(formulesRef)}
        onContact={() => setModal("contact")}
        onCatalogue={() => setModal("catalogue")}
      />

      <HeroMobile onScrollDown={() => scrollTo(heritageRef)} />
      <HeritageMobile refEl={heritageRef} />
      <GalleryMobile refEl={galleryRef} />
      <TikTokViralSection />
      <InstagramSection />
      <VIPClientsSection />
      <TestimonialsSection />
      <ShowroomMobile refEl={showroomRef} onCatalogue={() => setModal("catalogue")} onFlammes={() => setModal("flammes")} />
      <FormulesSection refEl={formulesRef} onContact={() => setModal("contact")} onReserver={() => setModal("booking")} />
      <FooterMobile
        onShowroom={() => scrollTo(showroomRef)}
        onFormules={() => scrollTo(formulesRef)}
        onContact={() => setModal("contact")}
        onCatalogue={() => setModal("catalogue")}
        onMentions={() => setModal("mentions")}
        onConfidentialite={() => setModal("confidentialite")}
        onCGV={() => setModal("cgv")}
        onReserver={() => setModal("booking")}
      />

      {/* Modal catalogue */}
      <Modal isOpen={modal === "catalogue"} onClose={() => setModal(null)} title={tr("nav_boutique")}>
        <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
          {/* Icône */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "64px", height: "64px", margin: "0 auto 1.8rem", border: `1px solid rgba(184,151,62,0.3)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(184,151,62,0.05)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </motion.div>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
            style={{ display: "inline-block", border: `1px solid rgba(184,151,62,0.4)`, padding: "0.3rem 1rem", marginBottom: "1.4rem" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase" }}>
              {tr("boutique_soon_badge")}
            </span>
          </motion.div>
          {/* Titre */}
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.2rem, 5vw, 1.6rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(28,18,8,0.75)", lineHeight: 1.6, marginBottom: "1.2rem", padding: "0 0.5rem" }}>
            {tr("boutique_soon_title")}
          </motion.p>
          {/* Description */}
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 300, color: "rgba(28,18,8,0.78)", lineHeight: 1.9, letterSpacing: "0.02em", padding: "0 0.5rem", marginBottom: "2rem" }}>
            {tr("boutique_soon_desc")}
          </motion.p>
          {/* Bouton WhatsApp boutique */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
            onClick={() => { setModal("booking-boutique"); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem", width: "calc(100% - 1rem)", margin: "0 auto 1.6rem", background: GOLD, border: "none", padding: "1rem", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#1c1208", fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
            {tr("boutique_wa_cta")}
          </motion.button>
          <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto" }} />
        </div>
      </Modal>

      {/* Modal contact */}
      <Modal isOpen={modal === "contact"} onClose={() => setModal(null)} title={lang === "FR" ? "Prendre Contact" : lang === "EN" ? "Get in Touch" : lang === "ES" ? "Contactar" : "联系我们"}>
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1rem, 4.5vw, 1.4rem)", fontStyle: "italic", color: "rgba(28,18,8,0.82)", lineHeight: 1.6, marginBottom: "2rem" }}>
            {T[lang]?.contact_desc ?? T.FR.contact_desc}
          </p>
          <div style={{ width: "60px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 2rem" }} />
          <a href="https://wa.me/33664826920" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", color: "#25D366", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.35em", textTransform: "uppercase" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
            <span>+33 6 64 82 69 20</span>
          </a>
        </div>
      </Modal>
      {/* Modal Mentions Légales */}
      <Modal isOpen={modal === "mentions"} onClose={() => setModal(null)} title="Mentions Légales">
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.9, color: "rgba(28,18,8,0.78)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Éditeur du site</p>
            <p>Raison sociale : Gaspardnz</p>
            <p>Activité : Conseil en image & création de vêtements sur-mesure</p>
            <p>Siège social : Paris, France</p>
            <p>Contact : +33 6 64 82 69 20</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Directeur de publication</p>
            <p>Gaspardnz — Responsable éditorial du site</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Hébergement</p>
            <p>Le site est hébergé par un prestataire technique tiers. Pour toute question relative à l'hébergement, contactez-nous via WhatsApp.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Propriété intellectuelle</p>
            <p>L'ensemble des contenus présents sur ce site (photos, textes, logos, visuels) sont la propriété exclusive de Gaspardnz. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable écrite.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Responsabilité</p>
            <p>Gaspardnz s'efforce d'assurer l'exactitude des informations publiées sur ce site, mais ne saurait être tenu responsable des erreurs, omissions ou indisponibilités.</p>
          </div>
        </div>
      </Modal>

      {/* Modal Politique de Confidentialité */}
      <Modal isOpen={modal === "confidentialite"} onClose={() => setModal(null)} title="Politique de Confidentialité">
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.9, color: "rgba(28,18,8,0.78)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Données collectées</p>
            <p>Ce site ne collecte aucune donnée personnelle automatiquement. Les seules informations échangées sont celles que vous nous communiquez volontairement via WhatsApp ou les réseaux sociaux.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Conformité RGPD</p>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD) en vigueur depuis le 25 mai 2018, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Cookies</p>
            <p>Ce site n'utilise pas de cookies de tracking ou publicitaires. Aucune donnée de navigation n'est collectée ni revendue à des tiers.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Vos droits</p>
            <p>Pour exercer vos droits ou pour toute question relative à vos données personnelles, contactez-nous directement via WhatsApp au +33 6 64 82 69 20.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Réseaux sociaux</p>
            <p>Les liens vers nos réseaux sociaux (Instagram, TikTok, YouTube, Facebook) redirigent vers des plateformes tierces disposant de leurs propres politiques de confidentialité.</p>
          </div>
        </div>
      </Modal>

      {/* Modal CGV */}
      <Modal isOpen={modal === "cgv"} onClose={() => setModal(null)} title="Conditions Générales de Vente">
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.9, color: "rgba(28,18,8,0.78)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Objet</p>
            <p>Les présentes CGV régissent les relations commerciales entre Gaspardnz et ses clients pour toute commande de vêtements sur-mesure, accessoires ou prestations de conseil en image.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Commandes & devis</p>
            <p>Toute commande fait l'objet d'un devis personnalisé établi après échange via WhatsApp. La commande est confirmée à réception d'un acompte de 50% du montant total.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Délais de réalisation</p>
            <p>Les délais de création varient selon la complexité de la pièce et sont communiqués lors de la prise de commande. Gaspardnz s'engage à respecter les délais convenus.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Paiement</p>
            <p>Le solde est dû à la livraison ou au retrait de la commande. Les modes de paiement acceptés sont communiqués lors de la prise de commande.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Retours & réclamations</p>
            <p>En raison du caractère sur-mesure des créations, les retours ne sont pas acceptés sauf en cas de défaut de fabrication avéré. Toute réclamation doit être formulée dans les 48h suivant la réception.</p>
          </div>
          <div>
            <p style={{ color: GOLD, fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Droit applicable</p>
            <p>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité avant tout recours judiciaire.</p>
          </div>
        </div>
      </Modal>

      {/* Modal Biographie */}
      <Modal isOpen={modal === "biographie"} onClose={() => setModal(null)} title={tr("nav_bio")}>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 2, color: "rgba(28,18,8,0.65)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(184,151,62,0.1)", border: `1px solid rgba(184,151,62,0.3)`, margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: GOLD, letterSpacing: "0.05em" }}>G</span>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontStyle: "italic", fontWeight: 300, color: "rgba(28,18,8,0.82)", textAlign: "center", lineHeight: 1.7, marginBottom: "2rem" }}>
            {tr("bio_quote")}
          </p>
          <div style={{ width: "30px", height: "1px", background: GOLD, margin: "0 auto 2rem", opacity: 0.5 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            {[["bio_s1_title","bio_s1"],["bio_s2_title","bio_s2"],["bio_s3_title","bio_s3"],["bio_s4_title","bio_s4"]].map(([tk,pk]) => (
              <div key={tk}>
                <p style={{ color: GOLD, fontSize: "7px", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{tr(tk)}</p>
                <p>{tr(pk)}</p>
              </div>
            ))}
          </div>
          <div style={{ width: "30px", height: "1px", background: GOLD, margin: "2rem auto", opacity: 0.5 }} />
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.3em", color: "rgba(28,18,8,0.85)", textAlign: "center" }}>GASPARDNZ · PARIS</p>
        </div>
      </Modal>

      {/* Modal Flammes */}
      <Modal isOpen={modal === "flammes"} onClose={() => setModal(null)} title={T[lang]?.flammes_title??T.FR.flammes_title}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(28,18,8,0.82)", textAlign: "center", lineHeight: 1.7 }}>
            {T[lang]?.flammes_desc??T.FR.flammes_desc}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "3/4", border: "1px dashed rgba(184,151,62,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "rgba(28,18,8,0.03)" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "rgba(184,151,62,0.3)", letterSpacing: "0.1em" }}>FLAMMES 2026</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.3em", color: "rgba(184,151,62,0.4)", textTransform: "uppercase" }}>{i+1} / 6</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <BookingModal isOpen={modal === "booking" || modal === "booking-boutique"} boutiqueMode={modal === "booking-boutique"} onClose={() => setModal(null)} />

      <ChatBot
        onReserver={() => setModal("booking")}
        onGalerie={() => scrollTo(galleryRef)}
        onShowroom={() => scrollTo(showroomRef)}
        onFormules={() => scrollTo(formulesRef)}
      />

    </div>
    </LangCtx.Provider>
  );
}
