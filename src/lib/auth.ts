export { auth };


import { betterAuth } from "better-auth";
import { username, admin, organization } from "better-auth/plugins";
import { sendEmail } from "@lib/smtp";
import { db } from "@lib/db";

// Fonction métier stricte pour l’inscription
export async function registerUser({ name, email, password }: { name: string, email: string, password: string }) {
  // Validation email
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { success: false, error: 'Email invalide.' };
  }
  // Validation mot de passe
  if (!password || password.length < 8) {
    return { success: false, error: 'Mot de passe trop faible.' };
  }
  // Validation nom
  if (!name || name.length < 2) {
    return { success: false, error: 'Nom invalide.' };
  }
  // Vérification unicité email (DB réelle)
  const client = await db.connect();
  const existing = await client.query('SELECT id FROM user WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    client.release();
    return { success: false, error: 'Email déjà utilisé.' };
  }
  // Création utilisateur
  await client.query('INSERT INTO user (name, email, password) VALUES ($1, $2, $3)', [name, email, password]);
  client.release();
  return { success: true };
}


const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Cliquez sur le lien pour réinitialiser votre mot de passe : ${url}`,
        html: `<p>Cliquez sur le lien pour réinitialiser votre mot de passe :</p><p><a href='${url}'>Réinitialiser le mot de passe</a></p>`,
        from: undefined // optionnel, géré par smtp.ts
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Mot de passe réinitialisé pour l'utilisateur ${user.email}.`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Vérification de votre adresse email",
        text: `Cliquez sur le lien pour vérifier votre adresse email : ${url}`,
        html: `<p>Cliquez sur le lien pour vérifier votre adresse email :</p><p><a href='${url}'>Vérifier mon email</a></p>`,
        from: undefined // optionnel, géré par smtp.ts
      });
    },
  },
  plugins: [
    username(),
    admin(),
    organization(),
  ],
});