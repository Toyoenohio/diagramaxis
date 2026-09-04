import { useSyncExternalStore } from 'react';

/**
 * DIAGRAMAXIS · Gestor de tema (día por defecto / noche).
 * El estado vive fuera del store de proyecto (no es lógica de negocio):
 * clase `.dark` en <html>, persistencia en localStorage 'diagramaxis-theme'
 * y suscripción con useSyncExternalStore para componentes (Header, 3D...).
 * El <script> inline de index.html aplica la clase antes del primer paint
 * para evitar el flash.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'diagramaxis-theme';

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

let currentTheme: Theme = readStoredTheme();
applyTheme(currentTheme);

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
  applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible: el tema sigue en memoria */
  }
  listeners.forEach((l) => l());
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Hook reactivo: re-renderiza al cambiar el tema. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => currentTheme);
}
