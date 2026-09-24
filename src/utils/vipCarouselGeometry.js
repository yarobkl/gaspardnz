// Le carrousel VIP dimensionnait ses cartes en pourcentage du viewport
// (68vw) : correct sur mobile (~265px sur un téléphone de 390px), mais une
// carte de ~980px sur un écran de bureau de 1440px. Plafonner la largeur en
// pixels au-delà d'un certain viewport garde la même expérience mobile tout
// en évitant des cartes démesurées sur grand écran.
export const MAX_CARD_PX = 340;

export const cardWidthPx = (viewportWidth, cardPercent) =>
  Math.min((cardPercent / 100) * viewportWidth, MAX_CARD_PX);

export const cardOffsetX = (viewportWidth, cardPercent, index) => {
  const width = cardWidthPx(viewportWidth, cardPercent);
  return (viewportWidth - width) / 2 - index * width;
};
