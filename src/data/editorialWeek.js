// Conseils intemporels : propositions éditoriales, jamais des événements inventés.
export const WEEKLY_EDITORIAL_TEMPLATES = [
  {
    "title": "Le costume bleu marine, l’allié des grandes occasions",
    "excerpt": "Pourquoi cette couleur reste un choix sûr pour un mariage, un rendez-vous ou une soirée élégante.",
    "body": "Le bleu marine possède un avantage rare : il sait être habillé sans paraître rigide. Pour un mariage, il accompagne une chemise blanche et une cravate discrète. Pour une journée professionnelle, il devient plus naturel avec une chemise bleu clair.\n\nLa réussite tient surtout à la coupe. Une épaule nette, une manche à la bonne longueur et un pantalon bien ajusté font souvent davantage que le prix du costume. Avant de choisir les accessoires, prenez le temps de vérifier ces trois points.\n\nLe conseil GaspardNZ : commencez par une belle base, puis personnalisez-la avec un détail qui vous ressemble.",
    "tag": "Conseil style"
  },
  {
    "title": "Trois détails qui changent toute une silhouette",
    "excerpt": "Des ajustements simples pour gagner en élégance sans multiplier les accessoires.",
    "body": "On reconnaît une tenue soignée à quelques détails. D’abord, la longueur du pantalon : il doit tomber naturellement sur la chaussure, sans accumuler trop de tissu. Ensuite, les manches de veste : laisser apparaître un peu de manchette apporte de la précision.\n\nEnfin, pensez à la cohérence des matières. Une veste très structurée et des accessoires trop décontractés ne racontent pas toujours la même histoire.\n\nInutile d’en faire trop. Une silhouette forte se construit souvent avec moins de pièces, mais des choix plus justes. C’est cette attention aux finitions qui donne à l’élégance son caractère.",
    "tag": "Conseil style"
  },
  {
    "title": "Mariage : choisir sa tenue avec méthode",
    "excerpt": "La bonne tenue de cérémonie se prépare en partant du lieu, du moment et de votre personnalité.",
    "body": "Avant de parler couleur ou coupe, posez-vous trois questions : où se déroule la cérémonie, à quel moment de la journée et quelle place souhaitez-vous donner à votre style personnel ? Un mariage en journée dans un jardin n’appelle pas forcément la même tenue qu’une réception formelle en soirée.\n\nPrévoyez aussi du temps pour les essayages et les ajustements. Une pièce choisie tôt laisse de la place aux retouches, aux accessoires et, surtout, à la tranquillité d’esprit.\n\nLe conseil GaspardNZ : apportez quelques inspirations à votre rendez-vous, mais gardez l’esprit ouvert. La bonne silhouette est celle dans laquelle vous vous sentez réellement à votre place.",
    "tag": "Mariage"
  },
  {
    "title": "Les chaussures, signature discrète de l’élégance",
    "excerpt": "Comment accorder ses chaussures à sa tenue sans commettre de faux pas.",
    "body": "Les chaussures terminent une silhouette et peuvent en changer toute la perception. Avec un costume bleu marine, le brun foncé crée une harmonie chaleureuse ; le noir apporte une note plus formelle. Avec un costume gris anthracite, une chaussure noire reste un choix classique.\n\nAu-delà de la couleur, observez l’état du cuir, la propreté des semelles et la finesse de la forme. Une paire bien entretenue fait souvent plus d’effet qu’un modèle spectaculaire mais mal accordé.\n\nLe conseil GaspardNZ : préparez vos chaussures la veille de l’événement. Le confort compte autant que l’apparence, surtout quand la journée s’annonce longue.",
    "tag": "Conseil style"
  },
  {
    "title": "L’élégance sans costume trois-pièces",
    "excerpt": "Une allure soignée peut rester naturelle, même sans costume trois-pièces.",
    "body": "Être élégant ne signifie pas forcément porter une cravate. Un pantalon bien coupé, une chemise impeccable et une veste souple peuvent composer une tenue très convaincante. L’essentiel est de choisir des pièces qui se répondent et de conserver des proportions harmonieuses.\n\nPour une allure plus décontractée, travaillez les textures : coton, laine légère ou maille fine apportent du relief sans surcharger l’ensemble. Gardez les couleurs sous contrôle et laissez une pièce guider le reste.\n\nLe conseil GaspardNZ : demandez-vous d’abord comment vous allez vivre votre journée. Une tenue réussie doit vous accompagner, pas vous contraindre.",
    "tag": "Conseil style"
  },
  {
    "title": "Associer les couleurs sans surcharger sa tenue",
    "excerpt": "Une méthode simple pour construire une palette cohérente et personnelle.",
    "body": "Pour commencer, choisissez une couleur dominante, une couleur d’accompagnement et, si vous le souhaitez, une petite touche de contraste. Le bleu marine, le beige, le gris et le blanc offrent des bases faciles à associer.\n\nAttention à ne pas confondre contraste et accumulation. Une pochette, une cravate ou une paire de chaussures peut apporter du caractère sans chercher à attirer toute l’attention. La lumière et la matière changent également la perception d’une couleur : essayez toujours les pièces ensemble.\n\nLe conseil GaspardNZ : quand vous hésitez, simplifiez. Une palette maîtrisée laisse davantage de place à la coupe et à votre personnalité.",
    "tag": "Conseil style"
  },
  {
    "title": "Prendre soin de son costume, prolonger son élégance",
    "excerpt": "Les gestes essentiels pour garder une belle tenue bien après le grand jour.",
    "body": "Une belle pièce mérite un entretien adapté. Après l’avoir portée, laissez-la respirer avant de la ranger. Utilisez un cintre suffisamment large pour préserver la forme des épaules et évitez de surcharger la housse.\n\nUn brossage doux permet de retirer la poussière légère. Pour les taches ou les matières délicates, suivez l’étiquette d’entretien et adressez-vous à un professionnel plutôt que de multiplier les nettoyages agressifs.\n\nLe conseil GaspardNZ : entretenez votre costume avec régularité plutôt qu’en urgence. L’élégance ne se limite pas au jour où l’on porte une pièce ; elle se prolonge dans le soin qu’on lui apporte.",
    "tag": "Entretien"
  }
];

export function localDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function prepareEditorialWeek(start = new Date()) {
  const first = new Date(start);
  first.setHours(10, 0, 0, 0);
  first.setDate(first.getDate() + 1);
  return WEEKLY_EDITORIAL_TEMPLATES.map((template, i) => {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    return { ...template, scheduled_at: localDateTime(date), auto_notify: true };
  });
}

export function editorialSlug(title) {
  return String(title).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65);
}
