const B = import.meta.env.BASE_URL;
const TERRACOTTA_1 = `${B}images/terracotta-look-1.jpg`;
const TERRACOTTA_2 = `${B}images/terracotta-look-2.jpg`;

const STYLE_MONTH = {
  FR: [
    {
      src: TERRACOTTA_1,
      album: [TERRACOTTA_1, TERRACOTTA_2],
      title: "Costume Terracotta — Style du Mois",
      desc: "Costume terracotta, gilet ivoire, chemise blanche, cravate vert pastel et richelieu marron. Une silhouette mariage chaleureuse, nette et moderne, pensée pour marquer l'événement sans excès.",
      spots: [
        { x: 68, y: 38, label: "Veste terracotta" },
        { x: 53, y: 45, label: "Gilet ivoire" },
        { x: 54, y: 31, label: "Cravate vert pastel" },
      ],
    },
  ],
  EN: [
    {
      src: TERRACOTTA_1,
      album: [TERRACOTTA_1, TERRACOTTA_2],
      title: "Terracotta Suit — Style of the Month",
      desc: "Terracotta suit, ivory waistcoat, white shirt, pastel green tie and brown oxfords. A warm, sharp and modern wedding silhouette designed to stand out with restraint.",
      spots: [
        { x: 68, y: 38, label: "Terracotta jacket" },
        { x: 53, y: 45, label: "Ivory waistcoat" },
        { x: 54, y: 31, label: "Pastel green tie" },
      ],
    },
  ],
  ES: [
    {
      src: TERRACOTTA_1,
      album: [TERRACOTTA_1, TERRACOTTA_2],
      title: "Traje Terracota — Estilo del Mes",
      desc: "Traje terracota, chaleco marfil, camisa blanca, corbata verde pastel y zapatos oxford marrones. Una silueta de boda cálida, precisa y moderna.",
      spots: [
        { x: 68, y: 38, label: "Chaqueta terracota" },
        { x: 53, y: 45, label: "Chaleco marfil" },
        { x: 54, y: 31, label: "Corbata verde pastel" },
      ],
    },
  ],
  ZH: [
    {
      src: TERRACOTTA_1,
      album: [TERRACOTTA_1, TERRACOTTA_2],
      title: "红土色西装 — 本月风格",
      desc: "红土色西装、象牙色马甲、白衬衫、浅绿色领带与棕色牛津鞋。温暖、利落且现代的婚礼造型。",
      spots: [
        { x: 68, y: 38, label: "红土色外套" },
        { x: 53, y: 45, label: "象牙色马甲" },
        { x: 54, y: 31, label: "浅绿色领带" },
      ],
    },
  ],
};

export const getStyleDuMois = (lang = "FR") => STYLE_MONTH[lang] || STYLE_MONTH.FR;
export const STYLE_DU_MOIS = STYLE_MONTH.FR;
export const WA_GNZ = "https://wa.me/33664826920";
export const WA_CHANNEL_URL = WA_GNZ;
