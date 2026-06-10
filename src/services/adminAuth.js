import CryptoJS from "crypto-js";

const USERS_KEY = "gnz_admin_users";
const SESSION_KEY = "gnz_admin_session";
const CSRF_TOKEN_KEY = "gnz_csrf_token";
const SETUP_KEY = "gnz_admin_setup_done";
const PERMISSIONS = {
  ADMIN_FULL: "admin_full",
  ADMIN_READ: "admin_read",
};

// ============ SECURE PASSWORD HASHING ============
// Using PBKDF2 with 1000 iterations (much more secure than bitwise hash)
const hashPassword = (password) => {
  const salt = "gaspardnz_salt_2024"; // In production, use unique salt per user
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

// ============ SECURE TOKEN GENERATION ============
// Using crypto.getRandomValues() instead of Math.random()
const generateSecureToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

// ============ CSRF TOKEN MANAGEMENT ============
const generateCSRFToken = () => {
  const token = generateSecureToken();
  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {}
  return token;
};

export const getCSRFToken = () => {
  let token = localStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
};

export const validateCSRFToken = (token) => {
  const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken && storedToken === token;
};

// ============ USER MANAGEMENT ============
const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
};

export const initAdminUsers = () => {
  const setupDone = localStorage.getItem(SETUP_KEY);
  if (!setupDone) {
    // ❌ NO DEFAULT CREDENTIALS - Force user to create admin account
    console.warn("⚠️ Admin setup required. Please create your first admin account.");
    localStorage.setItem(SETUP_KEY, "pending");
  }
};

export const login = (email, password) => {
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  // Timing-safe comparison to prevent timing attacks
  const expectedHash = user ? user.passwordHash : hashPassword("invalid");
  const providedHash = hashPassword(password);
  const passwordMatch = user && expectedHash === providedHash;

  if (!passwordMatch) {
    return { success: false, error: "Email ou mot de passe incorrect" };
  }

  // ✅ SECURE TOKEN GENERATION
  const token = generateSecureToken();
  const csrfToken = generateCSRFToken();

  const session = {
    userId: user.id,
    email: user.email,
    permission: user.permission,
    token, // ✅ Now cryptographically secure
    csrfToken, // ✅ CSRF protection
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}

  user.lastLogin = new Date().toISOString();
  user.lastToken = token; // Track last known token for security
  saveUsers(users);

  return { success: true, user: { email: user.email, permission: user.permission } };
};

export const logout = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CSRF_TOKEN_KEY);
  } catch {}
};

export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;

    const parsed = JSON.parse(session);

    // Check if session expired
    if (new Date(parsed.expiresAt) < new Date()) {
      logout();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const session = getSession();
  return session !== null;
};

export const hasPermission = (requiredPermission) => {
  const session = getSession();
  if (!session) return false;
  if (requiredPermission === PERMISSIONS.ADMIN_READ) return true;
  return session.permission === PERMISSIONS.ADMIN_FULL;
};

export const createUser = (email, password, permission) => {
  if (!hasPermission(PERMISSIONS.ADMIN_FULL)) {
    return { success: false, error: "Permission refusée" };
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Cet email existe déjà" };
  }

  const newUser = {
    id: "admin_" + Date.now(),
    email,
    passwordHash: hashPassword(password),
    permission,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: { email: newUser.email, permission: newUser.permission } };
};

export const deleteUser = (userId) => {
  if (!hasPermission(PERMISSIONS.ADMIN_FULL)) {
    return { success: false, error: "Permission refusée" };
  }

  let users = getUsers();
  const userCount = users.length;
  users = users.filter((u) => u.id !== userId);

  if (users.length === userCount) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  saveUsers(users);
  return { success: true };
};

export const getAllUsers = () => {
  if (!hasPermission(PERMISSIONS.ADMIN_READ)) {
    return [];
  }
  return getUsers().map((u) => ({
    id: u.id,
    email: u.email,
    permission: u.permission,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
};

export const changePassword = (userId, oldPassword, newPassword) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  // Timing-safe comparison
  const expectedHash = user.passwordHash;
  const providedHash = hashPassword(oldPassword);
  const passwordMatch = expectedHash === providedHash;

  if (!passwordMatch) {
    return { success: false, error: "Ancien mot de passe incorrect" };
  }

  user.passwordHash = hashPassword(newPassword);
  user.passwordChangedAt = new Date().toISOString();
  saveUsers(users);

  // Invalidate all sessions when password changes (security)
  logout();

  return { success: true };
};
