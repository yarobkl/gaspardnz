export const WEDDING_INSPIRATIONS = {
  FR: [
    {
      id: 1,
      title: "Costume Terracotta Élégant",
      desc: "Un costume terracotta intemporel associé à un gilet blanc et une cravate en vert pastel. Idéal pour les mariages chics et les événements formels.",
      color: "Terracotta & Blanc",
      style: "Élégant & Soigné",
      occasion: "Mariage, Gala",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-1.jpg`,
      spots: [
        { x: 68, y: 38, label: "Veste terracotta" },
        { x: 53, y: 45, label: "Gilet ivoire" },
        { x: 54, y: 31, label: "Cravate vert pastel" },
        { x: 62, y: 88, label: "Richelieu marron" }
      ]
    },
    {
      id: 2,
      title: "Costume Terracotta Soirée",
      desc: "Le même costume terracotta présenté sous un autre angle. Une harmonie parfaite de couleurs pour une présence remarquée lors de votre événement spécial.",
      color: "Terracotta & Blanc",
      style: "Raffiné",
      occasion: "Mariage, Événement",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-2.jpg`,
      spots: [
        { x: 70, y: 38, label: "Veste terracotta" },
        { x: 54, y: 45, label: "Gilet ivoire" },
        { x: 54, y: 31, label: "Cravate vert pastel" },
        { x: 63, y: 88, label: "Richelieu marron" }
      ]
    }
  ],
  EN: [
    {
      id: 1,
      title: "Elegant Terracotta Suit",
      desc: "A timeless terracotta suit paired with a white waistcoat and soft green tie. Perfect for chic weddings and formal events.",
      color: "Terracotta & White",
      style: "Elegant & Refined",
      occasion: "Wedding, Gala",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-1.jpg`,
      spots: [
        { x: 68, y: 38, label: "Terracotta jacket" },
        { x: 53, y: 45, label: "Ivory waistcoat" },
        { x: 54, y: 31, label: "Pastel green tie" },
        { x: 62, y: 88, label: "Brown oxfords" }
      ]
    },
    {
      id: 2,
      title: "Terracotta Evening Suit",
      desc: "The same terracotta suit shown from another angle. A perfect harmony of colors for a remarkable presence at your special event.",
      color: "Terracotta & White",
      style: "Refined",
      occasion: "Wedding, Event",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-2.jpg`,
      spots: [
        { x: 70, y: 38, label: "Terracotta jacket" },
        { x: 54, y: 45, label: "Ivory waistcoat" },
        { x: 54, y: 31, label: "Pastel green tie" },
        { x: 63, y: 88, label: "Brown oxfords" }
      ]
    }
  ],
  ES: [
    {
      id: 1,
      title: "Traje Terracota Elegante",
      desc: "Un traje terracota atemporal combinado con un chaleco blanco y una corbata verde pastel. Ideal para bodas elegantes y eventos formales.",
      color: "Terracota & Blanco",
      style: "Elegante & Refinado",
      occasion: "Boda, Gala",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-1.jpg`,
      spots: [
        { x: 68, y: 38, label: "Chaqueta terracota" },
        { x: 53, y: 45, label: "Chaleco marfil" },
        { x: 54, y: 31, label: "Corbata verde pastel" },
        { x: 62, y: 88, label: "Oxford marrones" }
      ]
    },
    {
      id: 2,
      title: "Traje Terracota Noche",
      desc: "El mismo traje terracota presentado desde otro ángulo. Una armonía perfecta de colores para una presencia notable en tu evento especial.",
      color: "Terracota & Blanco",
      style: "Refinado",
      occasion: "Boda, Evento",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-2.jpg`,
      spots: [
        { x: 70, y: 38, label: "Chaqueta terracota" },
        { x: 54, y: 45, label: "Chaleco marfil" },
        { x: 54, y: 31, label: "Corbata verde pastel" },
        { x: 63, y: 88, label: "Oxford marrones" }
      ]
    }
  ],
  ZH: [
    {
      id: 1,
      title: "优雅红土色西装",
      desc: "一套经典的红土色西装搭配白色马甲和柔和的绿色领带。完美适合高档婚礼和正式活动。",
      color: "红土色 & 白色",
      style: "优雅 & 精致",
      occasion: "婚礼, 晚会",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-1.jpg`,
      spots: [
        { x: 68, y: 38, label: "红土色外套" },
        { x: 53, y: 45, label: "象牙色马甲" },
        { x: 54, y: 31, label: "浅绿色领带" },
        { x: 62, y: 88, label: "棕色牛津鞋" }
      ]
    },
    {
      id: 2,
      title: "红土色晚宴西装",
      desc: "同一套红土色西装从另一个角度展示。完美的色彩搭配，让你在特殊活动中脱颖而出。",
      color: "红土色 & 白色",
      style: "精致",
      occasion: "婚礼, 活动",
      src: `${import.meta.env.BASE_URL}images/terracotta-look-2.jpg`,
      spots: [
        { x: 70, y: 38, label: "红土色外套" },
        { x: 54, y: 45, label: "象牙色马甲" },
        { x: 54, y: 31, label: "浅绿色领带" },
        { x: 63, y: 88, label: "棕色牛津鞋" }
      ]
    }
  ]
};

export function getWeddingInspirations(lang) {
  return WEDDING_INSPIRATIONS[lang] || WEDDING_INSPIRATIONS.FR;
}

export const WA_GNZ = "https://wa.me/33664826920";
