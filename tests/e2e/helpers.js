// Le bandeau de consentement cookies bloque les clics sur le reste de la
// page tant qu'il n'a pas été traité (position fixe, z-index élevé) : tous
// les scénarios E2E qui interagissent avec la page doivent d'abord le fermer.
export async function acceptCookies(page) {
  const accept = page.getByText("TOUT ACCEPTER", { exact: true }).first();
  if (await accept.isVisible({ timeout: 3000 }).catch(() => false)) {
    await accept.click();
  }
}
