const USERS_KEY = "gnz_admin_users";
const SESSION_KEY = "gnz_admin_session";
const PERMISSIONS = {
  ADMIN_FULL: "admin_full",
  ADMIN_READ: "admin_read",
};

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

const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const initAdminUsers = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultAdmin = {
      id: "admin_" + Date.now(),
      email: "admin@gaspardnz.style",
      passwordHash: hashPassword("12345"),
      permission: PERMISSIONS.ADMIN_FULL,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    saveUsers([defaultAdmin]);
  }
};

export const login = (email, password) => {
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return { success: false, error: "Email ou mot de passe incorrect" };
  }

  const session = {
    userId: user.id,
    email: user.email,
    permission: user.permission,
    token: Math.random().toString(36).slice(2) + Date.now().toString(36),
    loginTime: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}

  user.lastLogin = new Date().toISOString();
  saveUsers(users);

  return { success: true, user: { email: user.email, permission: user.permission } };
};

export const logout = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
};

export const getSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return getSession() !== null;
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

  if (!user || user.passwordHash !== hashPassword(oldPassword)) {
    return { success: false, error: "Ancien mot de passe incorrect" };
  }

  user.passwordHash = hashPassword(newPassword);
  saveUsers(users);
  return { success: true };
};
