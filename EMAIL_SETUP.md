# 📧 Configuration Email - Gaspardnz

## Vue d'ensemble

Le système d'email pour les demandes de contact partenaires est maintenant configuré!

### Comment ça marche:

1. **Client remplie le formulaire** de contact (ex: Palais Groupe)
2. **Email est envoyé à:**
   - **Gaspard** (gaspardnz.contact@gmail.com) - reçoit l'email principal
   - **eliebakala@gmail.com** (CC) - reçoit une copie pour suivi

3. **Gaspard** contacte le partenaire
4. **Tu suis le process** via la copie que tu reçois

---

## Configuration sur Vercel

Vercel exécute la fonction API `/api/send-email.js` qui envoie les emails.

### Étape 1: Choisir un service d'email

**Option 1: Gmail (Recommandé pour commencer)**
- Gratuit
- Facile à configurer
- Limite: 500 emails/jour

**Option 2: Mailgun**
- Gratuit (100 emails/jour)
- Plus fiable pour production

**Option 3: SendGrid**
- Gratuit (100 emails/jour)
- Professionnel

---

## Configuration Gmail (Étape par Étape)

### A. Créer un mot de passe d'application

1. Va sur: https://myaccount.google.com/apppasswords
2. Sélectionne "Mail" et "Windows Computer" (ou ton OS)
3. Génère le mot de passe → copie-le

### B. Ajouter les variables à Vercel

1. Va sur: **Vercel Dashboard** → ton projet
2. Clique **Settings** → **Environment Variables**
3. Ajoute ces variables:

```
EMAIL_FROM = ton-email@gmail.com
EMAIL_PASSWORD = (mot-de-passe-généré)
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
```

4. Clique **Save**
5. **Redéploie** ton projet (Vercel refera un build automatiquement)

---

## Tester

Après configuration:

1. Va sur ton site
2. Scroll jusqu'à "Nos Partenaires" → clique **Palais Groupe**
3. Remplis le formulaire et clique **Envoyer**
4. Vérifie que tu reçois un email à:
   - gaspardnz.contact@gmail.com
   - eliebakala@gmail.com

---

## Variables d'environnement

Voir `.env.example` pour les autres services (Mailgun, SendGrid).

---

## Troubleshooting

### "Email service not configured"
→ Vérifie que les 5 variables sont ajoutées sur Vercel

### "SMTP authentication failed"
→ Vérifie le mot de passe, surtout les espaces

### "Email sent but didn't receive"
→ Vérifie les dossiers Spam/Junk

---

## Questions?

Contacte-moi pour toute aide! 🚀
