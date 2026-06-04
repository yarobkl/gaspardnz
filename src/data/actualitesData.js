const B = import.meta.env.BASE_URL;

const VIDEOS = {
  jtSape: `${B}videos/jt-de-la-sape.mp4`,
};

const PHOTOS = {
  akwaba: [`${B}images/actualites/akwaba-1.jpg`, `${B}images/actualites/akwaba-2.jpg`],
  patheo: [`${B}images/actualites/patheo-abidjan.jpg`],
};

const NEWS = {
  FR: [
    {
      id: 3,
      video: VIDEOS.jtSape,
      location: "Paris",
      date: "Bientôt",
      tag: "Vidéo",
      title: "JT de la sape arrive bientôt",
      text: "Une nouvelle séquence arrive très bientôt dans l'univers GaspardNZ.\n\nLe JT de la sape mettra en lumière l'élégance, les silhouettes et l'esprit de la maison.",
    },
    {
      id: 2,
      photos: PHOTOS.akwaba,
      location: "Abidjan, Côte d'Ivoire",
      date: "Mai 2025",
      tag: "Voyage",
      title: "Akwaba Gaspard NZ !",
      text: "Il y a des destinations qui vous attendent, et d'autres qui vous appellent.\n\nAbidjan vient de me réserver le plus beau des accueils — Akwaba, comme ils savent si bien le dire ici.\n\nLa Côte d'Ivoire, terre de couleurs, d'élégance naturelle et de fierté culturelle. Un pays où le style ne se commande pas, il se vit.\n\nRencontres humaines, énergies créatives, échanges sincères... ce voyage est bien plus qu'un déplacement. C'est une inspiration nouvelle qui commence.\n\nGaspard NZ à Abidjan — la suite ne fait que commencer.",
    },
    {
      id: 1,
      photos: PHOTOS.patheo,
      location: "Abidjan",
      date: "Mai 2025",
      tag: "Rencontre",
      title: "Rencontre avec une légende",
      text: "À Abidjan, j'ai eu l'honneur d'être reçu par le grand maître Pathé'O, une référence incontournable du style africain, celui qui a habillé tant de figures majeures du continent.\n\nDans ses ateliers, entre héritage, savoir-faire et créativité, j'ai découvert bien plus que des vêtements : une vision, une histoire, une identité.\n\nPorter une chemise signée Pathé'O, c'est porter une part de cette excellence. Respect au sage.\n\nDe Gaspard NZ à @maison.patheo — quand deux univers se croisent, c'est toute une culture qui s'exprime.\n\nAbidjan, source d'inspiration infinie.",
    },
  ],
  EN: [
    {
      id: 3,
      video: VIDEOS.jtSape,
      location: "Paris",
      date: "Soon",
      tag: "Video",
      title: "JT de la sape arrive bientôt",
      text: "A new sequence is coming very soon inside the GaspardNZ universe.\n\nJT de la sape will spotlight elegance, silhouettes and the spirit of the house.",
    },
    {
      id: 2,
      photos: PHOTOS.akwaba,
      location: "Abidjan, Côte d'Ivoire",
      date: "May 2025",
      tag: "Travel",
      title: "Akwaba Gaspard NZ!",
      text: "Some destinations wait for you, and others call you.\n\nAbidjan gave me the warmest welcome — Akwaba, as people say so beautifully here.\n\nCôte d'Ivoire is a land of colour, natural elegance and cultural pride. A country where style is not ordered, it is lived.\n\nHuman encounters, creative energy, sincere exchanges... this trip is much more than a journey. It is the beginning of a new inspiration.\n\nGaspard NZ in Abidjan — the story is only just beginning.",
    },
    {
      id: 1,
      photos: PHOTOS.patheo,
      location: "Abidjan",
      date: "May 2025",
      tag: "Meeting",
      title: "Meeting a Legend",
      text: "In Abidjan, I had the honour of being welcomed by the great master Pathé'O, an essential reference in African style and the man who has dressed many of the continent's major figures.\n\nInside his ateliers, between heritage, craftsmanship and creativity, I discovered much more than garments: a vision, a story, an identity.\n\nWearing a Pathé'O shirt means wearing a part of that excellence. Respect to the elder.\n\nFrom Gaspard NZ to @maison.patheo — when two worlds meet, an entire culture speaks.\n\nAbidjan, an endless source of inspiration.",
    },
  ],
  ES: [
    {
      id: 3,
      video: VIDEOS.jtSape,
      location: "París",
      date: "Pronto",
      tag: "Vídeo",
      title: "JT de la sape arrive bientôt",
      text: "Una nueva secuencia llegará muy pronto al universo GaspardNZ.\n\nJT de la sape pondrá en primer plano la elegancia, las siluetas y el espíritu de la casa.",
    },
    {
      id: 2,
      photos: PHOTOS.akwaba,
      location: "Abiyán, Costa de Marfil",
      date: "Mayo 2025",
      tag: "Viaje",
      title: "¡Akwaba Gaspard NZ!",
      text: "Hay destinos que te esperan, y otros que te llaman.\n\nAbiyán me reservó la bienvenida más hermosa — Akwaba, como tan bien saben decir aquí.\n\nCosta de Marfil es tierra de colores, elegancia natural y orgullo cultural. Un país donde el estilo no se ordena: se vive.\n\nEncuentros humanos, energías creativas, intercambios sinceros... este viaje es mucho más que un desplazamiento. Es el comienzo de una nueva inspiración.\n\nGaspard NZ en Abiyán — la historia apenas comienza.",
    },
    {
      id: 1,
      photos: PHOTOS.patheo,
      location: "Abiyán",
      date: "Mayo 2025",
      tag: "Encuentro",
      title: "Encuentro con una leyenda",
      text: "En Abiyán, tuve el honor de ser recibido por el gran maestro Pathé'O, una referencia imprescindible del estilo africano, quien ha vestido a tantas figuras importantes del continente.\n\nEn sus talleres, entre herencia, saber hacer y creatividad, descubrí mucho más que ropa: una visión, una historia, una identidad.\n\nLlevar una camisa firmada por Pathé'O es llevar una parte de esa excelencia. Respeto al sabio.\n\nDe Gaspard NZ a @maison.patheo — cuando dos universos se cruzan, toda una cultura se expresa.\n\nAbiyán, fuente infinita de inspiración.",
    },
  ],
  ZH: [
    {
      id: 3,
      video: VIDEOS.jtSape,
      location: "巴黎",
      date: "即将推出",
      tag: "视频",
      title: "JT de la sape arrive bientôt",
      text: "GaspardNZ 的世界里，即将推出一段全新影像。\n\nJT de la sape 将呈现优雅、造型与品牌精神。",
    },
    {
      id: 2,
      photos: PHOTOS.akwaba,
      location: "阿比让，科特迪瓦",
      date: "2025年5月",
      tag: "旅程",
      title: "Akwaba，Gaspard NZ！",
      text: "有些目的地在等待你，有些目的地在召唤你。\n\n阿比让给了我最美好的欢迎 — Akwaba，这里的人总能把这句话说得很温暖。\n\n科特迪瓦是色彩、自然优雅与文化自豪感的土地。在这里，风格不是被规定的，而是被生活出来的。\n\n真诚的相遇、创意的能量、坦率的交流... 这次旅程远不只是一次出行，而是一段新灵感的开始。\n\nGaspard NZ 来到阿比让 — 后续故事才刚刚开始。",
    },
    {
      id: 1,
      photos: PHOTOS.patheo,
      location: "阿比让",
      date: "2025年5月",
      tag: "会面",
      title: "与传奇相遇",
      text: "在阿比让，我很荣幸受到大师 Pathé'O 的接待。他是非洲风格不可绕开的代表，也曾为非洲大陆众多重要人物打造形象。\n\n在他的工坊里，在传承、工艺与创造力之间，我看到的不只是服装，而是一种愿景、一段故事、一种身份。\n\n穿上 Pathé'O 的衬衫，就是穿上一部分卓越。向这位前辈致敬。\n\n从 Gaspard NZ 到 @maison.patheo — 当两个世界相遇，整个文化都在表达自己。\n\n阿比让，无尽的灵感之源。",
    },
  ],
};

export const getActualites = (lang = "FR") => NEWS[lang] || NEWS.FR;
export const actualites = NEWS.FR;
