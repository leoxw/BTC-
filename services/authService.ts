
const KEY_USER = 'admin_user';
const KEY_PASS = 'admin_pass';
const DEFAULT_USER = 'leo';
const DEFAULT_PASS = '123456';

export const initAuth = () => {
  if (!localStorage.getItem(KEY_USER)) localStorage.setItem(KEY_USER, DEFAULT_USER);
  if (!localStorage.getItem(KEY_PASS)) localStorage.setItem(KEY_PASS, DEFAULT_PASS);
};

export const login = (u: string, p: string): boolean => {
  initAuth();
  const storedUser = localStorage.getItem(KEY_USER) || DEFAULT_USER;
  const storedPass = localStorage.getItem(KEY_PASS) || DEFAULT_PASS;
  return u === storedUser && p === storedPass;
};

export const changePassword = (newPass: string): void => {
  localStorage.setItem(KEY_PASS, newPass);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('admin_session');
};

export const setSession = (active: boolean) => {
    if(active) localStorage.setItem('admin_session', 'true');
    else localStorage.removeItem('admin_session');
}
