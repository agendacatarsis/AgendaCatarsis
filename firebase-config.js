// =====================================================================
//  Configuración de Firebase para Agenda Catarsis
//  (lo usan index.html, panelcatarsis.html y balance.html)
// =====================================================================
//
//  Si algún día cambias de proyecto de Firebase:
//  1. En la consola de Firebase, entra a ⚙ Configuración del proyecto
//     → General → Tus apps → tu app web (</>).
//  2. Copia el bloque que empieza con  const firebaseConfig = {
//     y termina con  };
//  3. Pégalo aquí abajo, reemplazando el bloque completo.
//
//  Estos datos no son secretos: identifican tu proyecto, pero no dan
//  acceso a tu agenda. Lo que protege tu información son las reglas
//  de seguridad de Firestore (solo tus cuentas autorizadas pueden leerla).
// =====================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAwPaavXM-FWkLfVyXBCPmAnryNjumnwHQ",
  authDomain: "agenda-catarsis.firebaseapp.com",
  projectId: "agenda-catarsis",
  storageBucket: "agenda-catarsis.firebasestorage.app",
  messagingSenderId: "759977913283",
  appId: "1:759977913283:web:c6e7a79cc371a73b87ab76"
};

// Clave de reCAPTCHA v3 para App Check (opcional, contra bots).
// Déjala vacía ('') si no la usas.
const appCheckKey = '';

// Aviso por correo de nuevas reservas (opcional).
// Pega aquí la URL de tu Google Apps Script (termina en /exec).
// Si la dejas vacía (''), no se envían avisos.
const avisoCorreoUrl = 'https://script.google.com/macros/s/AKfycbznyHT9X85MVyRpG8dHGl9rsHR6f5OlOjhQfgLDn4t-4HZwGPLv1RfFg6Gyu2pSTJ1pXA/exec';

// No cambies estas líneas:
window.FIREBASE_CONFIG = firebaseConfig;
window.APPCHECK_KEY = appCheckKey;
window.AVISO_URL = avisoCorreoUrl;
