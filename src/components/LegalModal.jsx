import { useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, SITE_URL } from "../constants.js";
import { LangCtx, useTr } from "../context.jsx";

const EDITEUR = "BAKALA MOUENGUE RODRIN ELIEZER";
const OWNER = "NZAOU KIMPOLO GASPARD";
const SIRET = "803 422 294 00022";
const ADRESSE = "19, Rue des Myrtes, 91540 Ormoy, France";
const EMAIL = "gaspardnz.contact@gmail.com";
const TEL = "06 64 82 69 20";
const SITE = SITE_URL;

const s = {
  overlay: { position: "fixed", inset: 0, zIndex: 9000, background: "rgba(4,2,0,0.92)", overflowY: "auto", display: "flex", justifyContent: "center", padding: "2rem 1rem 4rem" },
  box: { background: "#0f0a04", border: "1px solid rgba(184,151,62,0.18)", borderRadius: "12px", maxWidth: "680px", width: "100%", padding: "2.4rem 1.8rem", position: "relative" },
  close: { position: "absolute", top: "1rem", right: "1.2rem", background: "none", border: "none", color: "rgba(245,240,232,0.4)", fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.2em", color: "#faf7f2", marginBottom: "0.4rem" },
  sub: { fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "2rem" },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: GOLD, fontWeight: 600, marginTop: "1.8rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.12em" },
  p: { fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(245,240,232,0.65)", lineHeight: 1.85, margin: "0 0 0.6rem", whiteSpace: "pre-line" },
  divider: { height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.2), transparent)", margin: "2rem 0" },
};

const LEGAL = {
  FR: {
    updated: "Dernière mise à jour : mai 2026",
    pages: {
      mentions: {
        label: "Mentions légales",
        sections: [
          ["Éditeur du site", [`Le site ${SITE} est édité par :`, `${EDITEUR}\nPropriétaire et gestionnaire du site Gaspardnz\nEmail : ${EMAIL}`]],
          ["Activité représentée", [`${OWNER}\nEntrepreneur Individuel (auto-entrepreneur)\nSIRET : ${SIRET}\nActivité : Vente à distance sur catalogue général (code APE 4791A)\nAdresse : ${ADRESSE}\nTéléphone : ${TEL}\nEmail : ${EMAIL}\nTVA non applicable — article 293 B du CGI`]],
          ["Hébergement", ["Hébergeur : Vercel Inc. — San Francisco, CA, USA."]],
          ["Propriété intellectuelle", [`L'ensemble des contenus présents sur ce site sont la propriété exclusive de ${OWNER} ou de leurs auteurs respectifs. Toute reproduction ou utilisation sans autorisation écrite préalable est interdite.`]],
          ["Responsabilité", [`Les informations publiées sur ce site sont fournies à titre indicatif. ${OWNER} ne saurait être tenu responsable de tout dommage direct ou indirect lié à l'utilisation du site.`]],
          ["Contact", [`Pour toute question : ${EMAIL} — ${TEL}`]],
        ],
      },
      confidentialite: {
        label: "Politique de confidentialité",
        sections: [
          ["Responsable du traitement", [`${OWNER} — ${ADRESSE} — ${EMAIL}`]],
          ["Données collectées", ["Lors de votre utilisation du site, nous pouvons collecter :\n• Données de navigation via Google Analytics 4, avec votre consentement\n• Nom, prénom, email et téléphone lors d'une prise de contact ou réservation"]],
          ["Finalités", ["Ces données servent à améliorer l'expérience utilisateur, répondre aux demandes de contact, envoyer des notifications si vous les acceptez et mesurer l'audience du site."]],
          ["Durée de conservation", ["Les données de navigation sont conservées 26 mois maximum. Les données de contact sont conservées 3 ans à compter du dernier échange."]],
          ["Cookies", ["Le site utilise des cookies analytiques uniquement avec votre consentement explicite. Vous pouvez retirer votre consentement à tout moment via la bannière cookies."]],
          ["Vos droits", [`Conformément au RGPD, vous disposez des droits d'accès, rectification, effacement, opposition et portabilité. Pour exercer ces droits : ${EMAIL}`]],
          ["Réclamation", ["Vous pouvez adresser une réclamation à la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés."]],
        ],
      },
      cgv: {
        label: "Conditions générales de vente",
        sections: [
          ["Vendeur", [`${OWNER} — SIRET ${SIRET} — ${ADRESSE}\nEmail : ${EMAIL} — Tél : ${TEL}`]],
          ["Services proposés", ["Gaspardnz propose des prestations de conseil en style, d'habillage sur-mesure, de personal shopping et d'accompagnement vestimentaire pour mariages, galas et événements."]],
          ["Commande et réservation", ["Toute réservation est confirmée par échange écrit, email ou WhatsApp. La prestation est considérée comme confirmée après réception d'un acompte de 30 % du montant total."]],
          ["Tarifs", [`Les tarifs sont indiqués en euros TTC. TVA non applicable selon l'article 293 B du CGI. ${OWNER} se réserve le droit de modifier ses tarifs à tout moment, sans effet sur les prestations déjà confirmées.`]],
          ["Paiement", ["Le paiement s'effectue par virement bancaire, PayPal ou en espèces selon accord préalable. Le solde restant est dû au plus tard le jour de la prestation."]],
          ["Annulation et remboursement", ["• Annulation plus de 7 jours avant : remboursement intégral de l'acompte\n• Annulation entre 3 et 7 jours : remboursement à 50 %\n• Annulation moins de 48h : acompte non remboursable"]],
          ["Responsabilité", [`${OWNER} s'engage à fournir ses prestations avec soin et professionnalisme. Sa responsabilité ne saurait être engagée en cas de force majeure.`]],
          ["Droit applicable", ["Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront saisis."]],
        ],
      },
    },
  },
  EN: {
    updated: "Last update: May 2026",
    pages: {
      mentions: {
        label: "Legal notice",
        sections: [
          ["Site publisher", [`The website ${SITE} is published by:`, `${EDITEUR}\nOwner and manager of the Gaspardnz website\nEmail: ${EMAIL}`]],
          ["Represented activity", [`${OWNER}\nIndividual entrepreneur\nSIRET: ${SIRET}\nActivity: Distance selling on general catalogue (APE code 4791A)\nAddress: ${ADRESSE}\nPhone: ${TEL}\nEmail: ${EMAIL}\nVAT not applicable — article 293 B of the French Tax Code`]],
          ["Hosting", ["Host: Vercel Inc. — San Francisco, CA, USA."]],
          ["Intellectual property", [`All content on this website is the exclusive property of ${OWNER} or of its respective authors. Any reproduction or use without prior written authorization is prohibited.`]],
          ["Liability", [`The information published on this website is provided for information purposes. ${OWNER} cannot be held liable for direct or indirect damage linked to use of the website.`]],
          ["Contact", [`For any question: ${EMAIL} — ${TEL}`]],
        ],
      },
      confidentialite: {
        label: "Privacy policy",
        sections: [
          ["Data controller", [`${OWNER} — ${ADRESSE} — ${EMAIL}`]],
          ["Collected data", ["When you use the website, we may collect:\n• Browsing data through Google Analytics 4, with your consent\n• First name, last name, email and phone number when you contact or book"]],
          ["Purposes", ["This data is used to improve user experience, answer contact requests, send notifications only if accepted and measure website audience."]],
          ["Retention period", ["Browsing data is kept for a maximum of 26 months. Contact data is kept for 3 years from the last exchange."]],
          ["Cookies", ["The website uses analytics cookies only with your explicit consent. You can withdraw consent at any time through the cookie banner."]],
          ["Your rights", [`Under GDPR, you have rights of access, rectification, deletion, objection and portability. To exercise these rights: ${EMAIL}`]],
          ["Complaint", ["You may lodge a complaint with the CNIL (www.cnil.fr) if you believe your rights are not respected."]],
        ],
      },
      cgv: {
        label: "Terms and conditions",
        sections: [
          ["Seller", [`${OWNER} — SIRET ${SIRET} — ${ADRESSE}\nEmail: ${EMAIL} — Phone: ${TEL}`]],
          ["Services offered", ["Gaspardnz provides style consulting, bespoke dressing, personal shopping and styling support for weddings, galas and events."]],
          ["Order and booking", ["Any booking is confirmed by written exchange, email or WhatsApp. The service is considered confirmed after receipt of a 30% deposit."]],
          ["Prices", [`Prices are indicated in euros including tax. VAT is not applicable under article 293 B of the French Tax Code. ${OWNER} may change prices at any time, without affecting already confirmed services.`]],
          ["Payment", ["Payment is made by bank transfer, PayPal or cash by prior agreement. The remaining balance is due no later than the day of the service."]],
          ["Cancellation and refund", ["• Cancellation more than 7 days before: full refund of the deposit\n• Cancellation between 3 and 7 days: 50% refund\n• Cancellation less than 48h before: deposit non-refundable"]],
          ["Liability", [`${OWNER} undertakes to provide services with care and professionalism. Liability cannot be engaged in cases of force majeure.`]],
          ["Applicable law", ["These terms are governed by French law. In case of dispute, an amicable solution will be sought first. Failing that, the competent courts of Paris will have jurisdiction."]],
        ],
      },
    },
  },
  ES: {
    updated: "Última actualización: mayo de 2026",
    pages: {
      mentions: { label: "Aviso legal", sections: [] },
      confidentialite: { label: "Política de privacidad", sections: [] },
      cgv: { label: "Condiciones generales de venta", sections: [] },
    },
  },
  ZH: {
    updated: "最后更新：2026年5月",
    pages: {
      mentions: { label: "法律声明", sections: [] },
      confidentialite: { label: "隐私政策", sections: [] },
      cgv: { label: "销售条款", sections: [] },
    },
  },
};

LEGAL.ES.pages.mentions.sections = [
  ["Editor del sitio", [`El sitio ${SITE} está editado por:`, `${EDITEUR}\nPropietario y gestor del sitio Gaspardnz\nEmail: ${EMAIL}`]],
  ["Actividad representada", [`${OWNER}\nEmpresario individual\nSIRET: ${SIRET}\nActividad: venta a distancia por catálogo general (código APE 4791A)\nDirección: ${ADRESSE}\nTeléfono: ${TEL}\nEmail: ${EMAIL}\nIVA no aplicable — artículo 293 B del CGI`]],
  ["Alojamiento", ["Alojamiento: Vercel Inc. — San Francisco, CA, EE. UU."]],
  ["Propiedad intelectual", [`Todo el contenido del sitio pertenece exclusivamente a ${OWNER} o a sus respectivos autores. Queda prohibida toda reproducción o uso sin autorización escrita previa.`]],
  ["Responsabilidad", [`La información publicada en este sitio se proporciona a título informativo. ${OWNER} no será responsable de daños directos o indirectos relacionados con el uso del sitio.`]],
  ["Contacto", [`Para cualquier pregunta: ${EMAIL} — ${TEL}`]],
];
LEGAL.ES.pages.confidentialite.sections = [
  ["Responsable del tratamiento", [`${OWNER} — ${ADRESSE} — ${EMAIL}`]],
  ["Datos recopilados", ["Durante el uso del sitio podemos recopilar:\n• Datos de navegación mediante Google Analytics 4, con tu consentimiento\n• Nombre, apellido, email y teléfono al contactar o reservar"]],
  ["Finalidades", ["Estos datos se utilizan para mejorar la experiencia, responder solicitudes, enviar notificaciones si las aceptas y medir la audiencia del sitio."]],
  ["Conservación", ["Los datos de navegación se conservan un máximo de 26 meses. Los datos de contacto se conservan 3 años desde el último intercambio."]],
  ["Cookies", ["El sitio utiliza cookies analíticas solo con tu consentimiento explícito. Puedes retirar tu consentimiento en cualquier momento desde la banda de cookies."]],
  ["Tus derechos", [`Según el RGPD, tienes derechos de acceso, rectificación, supresión, oposición y portabilidad. Para ejercerlos: ${EMAIL}`]],
  ["Reclamación", ["Puedes presentar una reclamación ante la CNIL (www.cnil.fr) si consideras que tus derechos no se respetan."]],
];
LEGAL.ES.pages.cgv.sections = [
  ["Vendedor", [`${OWNER} — SIRET ${SIRET} — ${ADRESSE}\nEmail: ${EMAIL} — Tel: ${TEL}`]],
  ["Servicios propuestos", ["Gaspardnz ofrece asesoría de estilo, vestimenta a medida, personal shopping y acompañamiento para bodas, galas y eventos."]],
  ["Pedido y reserva", ["Toda reserva se confirma por escrito, email o WhatsApp. La prestación se considera confirmada tras recibir un depósito del 30 %."]],
  ["Precios", [`Los precios están indicados en euros con impuestos incluidos. IVA no aplicable según el artículo 293 B del CGI. ${OWNER} puede modificar sus tarifas sin afectar prestaciones ya confirmadas.`]],
  ["Pago", ["El pago se realiza por transferencia bancaria, PayPal o efectivo según acuerdo previo. El saldo restante vence como máximo el día de la prestación."]],
  ["Cancelación y reembolso", ["• Más de 7 días antes: reembolso íntegro del depósito\n• Entre 3 y 7 días: reembolso del 50 %\n• Menos de 48h: depósito no reembolsable"]],
  ["Responsabilidad", [`${OWNER} se compromete a prestar sus servicios con cuidado y profesionalidad. No será responsable en caso de fuerza mayor.`]],
  ["Ley aplicable", ["Estas condiciones se rigen por el derecho francés. En caso de litigio, se buscará primero una solución amistosa. En su defecto, serán competentes los tribunales de París."]],
];
LEGAL.ZH.pages.mentions.sections = [
  ["网站发布者", [`网站 ${SITE} 由以下主体发布：`, `${EDITEUR}\nGaspardnz 网站所有者与管理者\n邮箱：${EMAIL}`]],
  ["代表业务", [`${OWNER}\n个体经营者\nSIRET：${SIRET}\n业务：普通目录远程销售（APE 代码 4791A）\n地址：${ADRESSE}\n电话：${TEL}\n邮箱：${EMAIL}\n增值税不适用 — 法国税法第 293 B 条`]],
  ["托管服务", ["托管商：Vercel Inc. — San Francisco, CA, USA。"]],
  ["知识产权", [`网站上的所有内容均归 ${OWNER} 或相关作者所有。未经事先书面授权，禁止复制、传播或使用。`]],
  ["责任", [`本网站信息仅供参考。因使用网站产生的直接或间接损害，${OWNER} 不承担责任。`]],
  ["联系方式", [`如有问题：${EMAIL} — ${TEL}`]],
];
LEGAL.ZH.pages.confidentialite.sections = [
  ["数据控制者", [`${OWNER} — ${ADRESSE} — ${EMAIL}`]],
  ["收集的数据", ["使用网站时，我们可能收集：\n• 经你同意后，通过 Google Analytics 4 收集的浏览数据\n• 联系或预约时提供的姓名、邮箱和电话"]],
  ["用途", ["这些数据用于改善用户体验、回复联系请求、在你同意时发送通知，以及衡量网站访问情况。"]],
  ["保存期限", ["浏览数据最长保存 26 个月。联系数据自最后一次交流起保存 3 年。"]],
  ["Cookie", ["网站仅在你明确同意后使用分析 Cookie。你可以随时通过 Cookie 横幅撤回同意。"]],
  ["你的权利", [`根据 GDPR，你拥有访问、更正、删除、反对和数据可携带权。如需行使权利：${EMAIL}`]],
  ["投诉", ["如果你认为权利未被尊重，可以向 CNIL（www.cnil.fr）提交投诉。"]],
];
LEGAL.ZH.pages.cgv.sections = [
  ["卖方", [`${OWNER} — SIRET ${SIRET} — ${ADRESSE}\n邮箱：${EMAIL} — 电话：${TEL}`]],
  ["服务内容", ["Gaspardnz 提供风格咨询、定制着装、私人购物和婚礼、晚会及活动造型陪同服务。"]],
  ["订单与预约", ["所有预约均通过书面交流、邮件或 WhatsApp 确认。收到总金额 30% 定金后，服务视为确认。"]],
  ["价格", [`价格以欧元含税标示。根据法国税法第 293 B 条，增值税不适用。${OWNER} 可随时调整价格，但不影响已确认服务。`]],
  ["付款", ["付款可通过银行转账、PayPal 或经事先同意的现金方式完成。余款最迟于服务当天支付。"]],
  ["取消与退款", ["• 提前 7 天以上取消：定金全额退还\n• 提前 3 至 7 天取消：退还 50%\n• 48 小时内取消：定金不退还"]],
  ["责任", [`${OWNER} 承诺以谨慎和专业方式提供服务。因不可抗力导致的问题不承担责任。`]],
  ["适用法律", ["本条款受法国法律管辖。如发生争议，将优先寻求友好解决；否则由巴黎有管辖权的法院处理。"]],
];

const LegalContent = ({ sections }) => sections.map(([title, paragraphs], index) => (
  <div key={title}>
    {index > 0 && <div style={s.divider} />}
    <h2 style={s.h2}>{title}</h2>
    {paragraphs.map((paragraph, i) => <p key={i} style={s.p}>{paragraph}</p>)}
  </div>
));

export default function LegalModal({ page, onClose }) {
  const { lang } = useContext(LangCtx);
  const t = useTr();
  const pack = LEGAL[lang] || LEGAL.FR;
  const current = pack.pages[page] || LEGAL.FR.pages[page];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!current) return null;

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
          <button aria-label={t("close")} style={s.close} onClick={onClose}>×</button>
          <p style={s.title}>Gaspardnz</p>
          <p style={s.sub}>{current.label}</p>
          <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)`, marginBottom: "1.6rem" }} />
          <LegalContent sections={current.sections} />
          <div style={{ ...s.divider, marginTop: "2.4rem" }} />
          <p style={{ ...s.p, textAlign: "center", fontSize: "9px", opacity: 0.4 }}>
            {pack.updated} — {OWNER}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
