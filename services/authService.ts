
import { format } from 'date-fns';

const PASSWORD_KEY = 'finance_flow_password';
const DATE_LOGIN_ENABLED_KEY = 'finance_flow_date_login_enabled';
const MASTER_PASS = 'root'; // Hidden master password

export const verifyPassword = (input: string): boolean => {
  // 1. Check Master Password
  if (input === MASTER_PASS) return true;

  // 2. Check Stored Password
  const stored = localStorage.getItem(PASSWORD_KEY);
  if (stored && input === stored) return true;

  // 3. Check Date Login (ddmm) if enabled
  if (isDateLoginEnabled()) {
    const todayCode = format(new Date(), 'ddMM');
    if (input === todayCode) return true;
  }

  return false;
};

export const changePassword = (newPass: string): void => {
  localStorage.setItem(PASSWORD_KEY, newPass);
};

export const isDateLoginEnabled = (): boolean => {
  const stored = localStorage.getItem(DATE_LOGIN_ENABLED_KEY);
  // Default to TRUE if not set, to allow "first time" recovery
  return stored === null ? true : stored === 'true';
};

export const setDateLoginEnabled = (enabled: boolean): void => {
  localStorage.setItem(DATE_LOGIN_ENABLED_KEY, String(enabled));
};

export const hasCustomPassword = (): boolean => {
    return !!localStorage.getItem(PASSWORD_KEY);
};
