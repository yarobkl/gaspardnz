import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";

const OWNER = "NZAOU KIMPOLO GASPARD";
const SIRET = "803 422 294 00022";
const ADRESSE = "19, Rue des Myrtes, 91540 Ormoy, France";
const EMAIL = "gaspardnz.contact@gmail.com";
const TEL = "06 64 82 69 20";
const SITE = "https://gaspardnz.vercel.app";

const s = {
  overlay: { position: "fixed", inset: 0, zIndex: 9000, background: "rgba(4,2,0,0.92)", overflowY: "auto", display: "flex", justifyContent: "center", padding: "2rem 1rem 4rem" },
  box: { background: "#0f0a04", border: "1px solid rgba(184,151,62,0.18)", borderRadius: "12px", maxWidth: "680px", width: "100%", padding: "2.4rem 1.8rem", position: "relative" },
  close: { position: "absolute", top: "1rem", right: "1.2rem", background: "none", border: "none", color: "rgba(245,240,232,0.4)", fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.2em", color: "#faf7f2", marginBottom: "0.4rem" },
  sub: { fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "2rem" },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: GOLD, fontWeight: 600, marginTop: "1.8rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.12em" },
  p: { fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.65)", lineHeight: 1.85, margin: "0 0 0.6rem" },
  divider: { height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.2), transparent)", margin: "2rem 0" },
};

const Block = ({ title, children }) => (
  <>
    <h2 style={s.h2}>{title}</h2>
    {children}
  </>
);

const P = ({ children }) => <p style={s.p}>{children}</p>;

function MentionsLegales() {
  return (
    <>
      <Block title="Éditeur du site">
        <P>Le site {SITE} est édité par :</P>
        <P><strong style={{ color: "#faf7f2" }}>{OWNER}</strong><br />
          Entrepreneur Individuel (auto-entrepreneur)<br />
          SIRET : {SIRET}<br />
          Activité : Vente à distance sur catalogue général (code APE 4791A)<br />
          Adresse : {ADRESSE}<br />
          Téléphone : {TEL}<br />
          Email : {EMAIL}<br />
          TVA non applicable — article 293 B du CGI (franchise en base)
        </P>
      </Block>

      <div style={s.divider} />

      <Block title="Hébergement">
        <P>Le site est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Propriété intellectuelle">
        <P>L'ensemble des contenus (textes, images, visuels, logos, vidéos) présents sur ce site sont la propriété exclusive de {OWNER} ou de leurs auteurs respectifs. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Responsabilité">
        <P>Les informations publiées sur ce site sont fournies à titre indicatif. {OWNER} ne saurait être tenu responsable de tout dommage direct ou indirect lié à l'utilisation du site.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Contact">
        <P>Pour toute question : {EMAIL} — {TEL}</P>
      </Block>
    </>
  );
}

function Confidentialite() {
  return (
    <>
      <Block title="Responsable du traitement">
        <P>{OWNER} — {ADRESSE} — {EMAIL}</P>
      </Block>

      <div style={s.divider} />

      <Block title="Données collectées">
        <P>Lors de votre utilisation du site, nous pouvons collecter :</P>
        <P>• Données de navigation (pages visitées, durée) via Google Analytics 4 (avec votre consentement)<br />
          • Nom, prénom, email, téléphone lors d'une prise de contact ou réservation<br />
          • Préférences de notifications push (OneSignal)</P>
      </Block>

      <div style={s.divider} />

      <Block title="Finalités">
        <P>Ces données sont utilisées pour : améliorer l'expérience utilisateur, répondre aux demandes de contact, envoyer des notifications push (uniquement si vous avez accepté), mesurer l'audience du site.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Durée de conservation">
        <P>Les données de navigation sont conservées 26 mois maximum. Les données de contact sont conservées 3 ans à compter du dernier échange.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Cookies">
        <P>Le site utilise des cookies analytiques (Google Analytics) uniquement avec votre consentement explicite. Vous pouvez retirer votre consentement à tout moment via la bannière cookies.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Vos droits">
        <P>Conformément au RGPD, vous disposez des droits d'accès, rectification, effacement, opposition et portabilité. Pour exercer ces droits : {EMAIL}</P>
      </Block>

      <div style={s.divider} />

      <Block title="Réclamation">
        <P>Vous pouvez adresser une réclamation à la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés.</P>
      </Block>
    </>
  );
}

function CGV() {
  return (
    <>
      <Block title="Vendeur">
        <P>{OWNER} — SIRET {SIRET} — {ADRESSE}<br />
          Email : {EMAIL} — Tél : {TEL}</P>
      </Block>

      <div style={s.divider} />

      <Block title="Services proposés">
        <P>Gaspardnz propose des prestations de conseil en style, d'habillage sur-mesure, de personal shopping et d'accompagnement vestimentaire pour mariages, galas et événements. Les offres détaillées sont présentées dans la section Formules du site.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Commande et réservation">
        <P>Toute réservation est confirmée par échange écrit (email ou WhatsApp). La prestation est considérée comme confirmée après réception d'un acompte de 30 % du montant total.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Tarifs">
        <P>Les tarifs sont indiqués en euros TTC. TVA non applicable selon l'article 293 B du CGI. {OWNER} se réserve le droit de modifier ses tarifs à tout moment, sans que cela affecte les prestations déjà confirmées.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Paiement">
        <P>Le paiement s'effectue par virement bancaire, PayPal ou en espèces selon accord préalable. Le solde restant est dû au plus tard le jour de la prestation.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Annulation et remboursement">
        <P>• Annulation plus de 7 jours avant : remboursement intégral de l'acompte<br />
          • Annulation entre 3 et 7 jours : remboursement à 50 %<br />
          • Annulation moins de 48h : acompte non remboursable</P>
      </Block>

      <div style={s.divider} />

      <Block title="Responsabilité">
        <P>{OWNER} s'engage à fournir ses prestations avec soin et professionnalisme. Sa responsabilité ne saurait être engagée en cas de force majeure ou de circonstances indépendantes de sa volonté.</P>
      </Block>

      <div style={s.divider} />

      <Block title="Droit applicable">
        <P>Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront saisis.</P>
      </Block>
    </>
  );
}

const PAGES = {
  mentions: { label: "Mentions Légales", Component: MentionsLegales },
  confidentialite: { label: "Politique de Confidentialité", Component: Confidentialite },
  cgv: { label: "Conditions Générales de Vente", Component: CGV },
};

export default function LegalModal({ page, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { label, Component } = PAGES[page] || {};
  if (!Component) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="legal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={s.overlay}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={s.box}
        >
          <button style={s.close} onClick={onClose}>×</button>
          <p style={s.title}>Gaspardnz</p>
          <p style={s.sub}>{label}</p>
          <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)`, marginBottom: "1.6rem" }} />
          <Component />
          <div style={{ ...s.divider, marginTop: "2.4rem" }} />
          <p style={{ ...s.p, textAlign: "center", fontSize: "9px", opacity: 0.4 }}>
            Dernière mise à jour : mai 2026 — {OWNER}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
