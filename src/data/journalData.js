const B = import.meta.env.BASE_URL;

const img = (file) => `${B}images/stylejournal/${file}`;

const JOURNAL = {
  FR: [
    {
      src: img("paris-cafe-1.jpg"),
      caption: "Paris · Terrasse Dior",
      look: "Veste cargo noir · Pantalon tailleur · Mocassins à glands",
      dots: [
        { top: "36%", left: "16%", label: "Veste cargo noir GNZ" },
        { top: "52%", left: "52%", label: "Montre & chevalière" },
        { top: "83%", left: "36%", label: "Mocassins à glands noirs" },
      ],
    },
    {
      src: img("paris-cafe-2.jpg"),
      caption: "Paris · Bar Cocktails",
      look: "Total look noir · Lunettes fumées · Cuir verni",
      dots: [
        { top: "35%", left: "36%", label: "Veste cargo noir GNZ" },
        { top: "53%", left: "63%", label: "Pochette cuir noire" },
        { top: "75%", left: "39%", label: "Mocassins à glands noirs" },
      ],
    },
    {
      src: img("detail-chaussures.jpg"),
      caption: "Le détail fait la différence",
      look: "Mocassins · Chaussettes monogrammées · Montre · Chevalière dorée",
      dots: [
        { top: "23%", left: "37%", label: "Montre dorée" },
        { top: "17%", left: "70%", label: "Chevalière dorée" },
        { top: "56%", left: "34%", label: "Chaussettes GNZ monogrammées" },
        { top: "80%", left: "28%", label: "Mocassins à glands noirs" },
      ],
    },
    {
      src: img("costume-navy.jpg"),
      caption: "Paris · Studio",
      look: "Costume double boutonnage navy · Cravate bordeaux · Chapeau fedora · Richelieu noirs",
      dots: [
        { top: "5%", left: "63%", label: "Chapeau fedora navy" },
        { top: "26%", left: "57%", label: "Cravate bordeaux & pochette blanche" },
        { top: "40%", left: "25%", label: "Costume double boutonnage navy" },
        { top: "91%", left: "55%", label: "Richelieu noirs" },
      ],
    },
  ],
  EN: [
    {
      src: img("paris-cafe-1.jpg"),
      caption: "Paris · Dior Terrace",
      look: "Black cargo jacket · Tailored trousers · Tassel loafers",
      dots: [
        { top: "36%", left: "16%", label: "GNZ black cargo jacket" },
        { top: "52%", left: "52%", label: "Watch & signet ring" },
        { top: "83%", left: "36%", label: "Black tassel loafers" },
      ],
    },
    {
      src: img("paris-cafe-2.jpg"),
      caption: "Paris · Cocktail Bar",
      look: "Full black look · Smoked glasses · Patent leather",
      dots: [
        { top: "35%", left: "36%", label: "GNZ black cargo jacket" },
        { top: "53%", left: "63%", label: "Black leather pouch" },
        { top: "75%", left: "39%", label: "Black tassel loafers" },
      ],
    },
    {
      src: img("detail-chaussures.jpg"),
      caption: "The detail makes the difference",
      look: "Loafers · Monogram socks · Watch · Gold signet ring",
      dots: [
        { top: "23%", left: "37%", label: "Gold watch" },
        { top: "17%", left: "70%", label: "Gold signet ring" },
        { top: "56%", left: "34%", label: "GNZ monogram socks" },
        { top: "80%", left: "28%", label: "Black tassel loafers" },
      ],
    },
    {
      src: img("costume-navy.jpg"),
      caption: "Paris · Studio",
      look: "Navy double-breasted suit · Burgundy tie · Fedora hat · Black oxfords",
      dots: [
        { top: "5%", left: "63%", label: "Navy fedora hat" },
        { top: "26%", left: "57%", label: "Burgundy tie & white pocket square" },
        { top: "40%", left: "25%", label: "Navy double-breasted suit" },
        { top: "91%", left: "55%", label: "Black oxfords" },
      ],
    },
  ],
  ES: [
    {
      src: img("paris-cafe-1.jpg"),
      caption: "París · Terraza Dior",
      look: "Chaqueta cargo negra · Pantalón sastre · Mocasines con borlas",
      dots: [
        { top: "36%", left: "16%", label: "Chaqueta cargo negra GNZ" },
        { top: "52%", left: "52%", label: "Reloj y sello" },
        { top: "83%", left: "36%", label: "Mocasines negros con borlas" },
      ],
    },
    {
      src: img("paris-cafe-2.jpg"),
      caption: "París · Bar de cócteles",
      look: "Total look negro · Gafas ahumadas · Charol",
      dots: [
        { top: "35%", left: "36%", label: "Chaqueta cargo negra GNZ" },
        { top: "53%", left: "63%", label: "Bolso de cuero negro" },
        { top: "75%", left: "39%", label: "Mocasines negros con borlas" },
      ],
    },
    {
      src: img("detail-chaussures.jpg"),
      caption: "El detalle marca la diferencia",
      look: "Mocasines · Calcetines monograma · Reloj · Sello dorado",
      dots: [
        { top: "23%", left: "37%", label: "Reloj dorado" },
        { top: "17%", left: "70%", label: "Sello dorado" },
        { top: "56%", left: "34%", label: "Calcetines GNZ con monograma" },
        { top: "80%", left: "28%", label: "Mocasines negros con borlas" },
      ],
    },
    {
      src: img("costume-navy.jpg"),
      caption: "París · Estudio",
      look: "Traje navy cruzado · Corbata burdeos · Sombrero fedora · Oxford negros",
      dots: [
        { top: "5%", left: "63%", label: "Sombrero fedora navy" },
        { top: "26%", left: "57%", label: "Corbata burdeos y pañuelo blanco" },
        { top: "40%", left: "25%", label: "Traje navy cruzado" },
        { top: "91%", left: "55%", label: "Oxford negros" },
      ],
    },
  ],
  ZH: [
    {
      src: img("paris-cafe-1.jpg"),
      caption: "巴黎 · Dior 露台",
      look: "黑色工装外套 · 西装长裤 · 流苏乐福鞋",
      dots: [
        { top: "36%", left: "16%", label: "GNZ 黑色工装外套" },
        { top: "52%", left: "52%", label: "腕表与印章戒指" },
        { top: "83%", left: "36%", label: "黑色流苏乐福鞋" },
      ],
    },
    {
      src: img("paris-cafe-2.jpg"),
      caption: "巴黎 · 鸡尾酒吧",
      look: "全黑造型 · 烟色眼镜 · 漆皮质感",
      dots: [
        { top: "35%", left: "36%", label: "GNZ 黑色工装外套" },
        { top: "53%", left: "63%", label: "黑色皮革手包" },
        { top: "75%", left: "39%", label: "黑色流苏乐福鞋" },
      ],
    },
    {
      src: img("detail-chaussures.jpg"),
      caption: "细节成就差异",
      look: "乐福鞋 · 字母袜 · 腕表 · 金色印章戒指",
      dots: [
        { top: "23%", left: "37%", label: "金色腕表" },
        { top: "17%", left: "70%", label: "金色印章戒指" },
        { top: "56%", left: "34%", label: "GNZ 字母袜" },
        { top: "80%", left: "28%", label: "黑色流苏乐福鞋" },
      ],
    },
    {
      src: img("costume-navy.jpg"),
      caption: "巴黎 · 工作室",
      look: "海军蓝双排扣西装 · 酒红领带 · Fedora 礼帽 · 黑色牛津鞋",
      dots: [
        { top: "5%", left: "63%", label: "海军蓝 Fedora 礼帽" },
        { top: "26%", left: "57%", label: "酒红领带与白色口袋巾" },
        { top: "40%", left: "25%", label: "海军蓝双排扣西装" },
        { top: "91%", left: "55%", label: "黑色牛津鞋" },
      ],
    },
  ],
};

export const getStyleJournalPhotos = (lang = "FR") => JOURNAL[lang] || JOURNAL.FR;
export const styleJournalPhotos = JOURNAL.FR;
