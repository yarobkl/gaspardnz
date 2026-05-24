const B = import.meta.env.BASE_URL;
const SRC = `${B}images/style-du-mois-bleu-royal.jpg`;

const STYLE_MONTH = {
  FR: [
    {
      src: SRC,
      title: "Veste Safari Bleu Royal — Mai 2026",
      desc: "Veste safari bleu royal sur-mesure, boutons dorés, 4 poches plaquées et ceinture assortie. Cravate soie turquoise à pois, pantalon gris perle, souliers monk noirs. L'audace colorée au service de l'élégance africaine contemporaine — look habillé par Gaspardnz Paris.",
      spots: [
        { x: 72, y: 38, label: "Chemise blanche sur-mesure" },
        { x: 30, y: 48, label: "Cravate soie turquoise à pois" },
        { x: 72, y: 62, label: "Veste safari bleu royal" },
      ],
    },
  ],
  EN: [
    {
      src: SRC,
      title: "Royal Blue Safari Jacket — May 2026",
      desc: "Bespoke royal blue safari jacket with gold buttons, four patch pockets and a matching belt. Turquoise polka-dot silk tie, pearl-grey trousers and black monk shoes. Bold colour serving contemporary African elegance — a look dressed by Gaspardnz Paris.",
      spots: [
        { x: 72, y: 38, label: "Bespoke white shirt" },
        { x: 30, y: 48, label: "Turquoise polka-dot silk tie" },
        { x: 72, y: 62, label: "Royal blue safari jacket" },
      ],
    },
  ],
  ES: [
    {
      src: SRC,
      title: "Chaqueta Safari Azul Royal — Mayo 2026",
      desc: "Chaqueta safari azul royal a medida, botones dorados, cuatro bolsillos de parche y cinturón a juego. Corbata de seda turquesa con lunares, pantalón gris perla y zapatos monk negros. La audacia del color al servicio de la elegancia africana contemporánea — look vestido por Gaspardnz Paris.",
      spots: [
        { x: 72, y: 38, label: "Camisa blanca a medida" },
        { x: 30, y: 48, label: "Corbata de seda turquesa con lunares" },
        { x: 72, y: 62, label: "Chaqueta safari azul royal" },
      ],
    },
  ],
  ZH: [
    {
      src: SRC,
      title: "皇家蓝 Safari 外套 — 2026年5月",
      desc: "皇家蓝定制 Safari 外套，金色纽扣、四个贴袋与同色腰带。绿松石色圆点真丝领带、珍珠灰长裤与黑色 monk 鞋。大胆色彩服务于当代非洲优雅 — 由 Gaspardnz Paris 打造的造型。",
      spots: [
        { x: 72, y: 38, label: "定制白衬衫" },
        { x: 30, y: 48, label: "绿松石色圆点真丝领带" },
        { x: 72, y: 62, label: "皇家蓝 Safari 外套" },
      ],
    },
  ],
};

export const getStyleDuMois = (lang = "FR") => STYLE_MONTH[lang] || STYLE_MONTH.FR;
export const STYLE_DU_MOIS = STYLE_MONTH.FR;
export const WA_GNZ = "https://wa.me/33664826920";
export const WA_CHANNEL_URL = WA_GNZ;
