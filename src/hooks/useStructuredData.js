import { useEffect } from "react";
import { SITE_URL, SOCIAL_LINKS } from "../constants.js";

// Style de base du <body> et schémas JSON-LD (LocalBusiness, Service, FAQ,
// événement mariage) injectés une seule fois, quelle que soit la route.
export default function useStructuredData() {
  useEffect(() => {
    document.body.style.background = "#0a0602";
    document.body.style.margin = "0";
    document.body.style.overflowX = "hidden";

    // Add Schemas for SEO (LocalBusiness, Services, FAQ)
    if (!document.querySelector('script[data-gnz-schema]')) {
      const localBusiness = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "GaspardNZ",
        "alternateName": ["Gaspard NZ", "Gaspardnz", "gaspardnz_"],
        "description": "Styliste parisien spécialisé dans l'habillage sur mesure pour mariages, galas et événements.",
        "url": SITE_URL,
        "logo": `${SITE_URL}/icon-512.png`,
        "image": `${SITE_URL}/avatar.jpg`,
        "areaServed": {
          "@type": "City",
          "name": "Paris"
        },
        "sameAs": [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok, SOCIAL_LINKS.facebook, SOCIAL_LINKS.youtube],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "url": "https://wa.me/33664826920"
        }
      };

      const services = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Services de Style et d'Habillage",
        "provider": { "@type": "LocalBusiness", "name": "Gaspardnz" },
        "offers": [
          { "@type": "Offer", "name": "Styliste Mariage à Paris" },
          { "@type": "Offer", "name": "Habilleur Mariages Africains" },
          { "@type": "Offer", "name": "Maître de Cérémonie Paris" }
        ]
      };

      const faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Quel est le rôle d'un styliste mariage à Paris?",
            "acceptedAnswer": { "@type": "Answer", "text": "Sélection et coordination des tenues pour mariages, mariages africains et cérémonies." }
          },
          {
            "@type": "Question",
            "name": "Proposez-vous des services pour mariages africains?",
            "acceptedAnswer": { "@type": "Answer", "text": "Oui, spécialiste en sélection de tenues pour mariages africains à Paris." }
          },
          {
            "@type": "Question",
            "name": "Qu'est-ce qu'un habilleur professionnel?",
            "acceptedAnswer": { "@type": "Answer", "text": "Un habilleur assure la mise en place impeccable des tenues pour galas, mariages et événements." }
          }
        ]
      };

      // Event schema for wedding services
      const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": "https://gaspardnz.style/#wedding-service",
        "name": "Service de styliste pour mariage",
        "description": "Costume sur-mesure, habillage et direction de cérémonie pour votre mariage à Paris",
        "provider": {
          "@type": "Person",
          "@id": "https://gaspardnz.style/#gaspardnz",
          "name": "Gaspard NZ",
          "image": "https://gaspardnz.style/avatar.jpg"
        },
        "areaServed": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Paris",
            "addressCountry": "FR"
          }
        },
        "priceRange": "€€€",
        "serviceType": "Personal Styling"
      };

      [localBusiness, services, faq, eventSchema].forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-gnz-schema', '1');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, []);
}
