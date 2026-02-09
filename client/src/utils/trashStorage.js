const TRASH_KEY = 'trashed_cards_v1';
const TRASH_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const loadTrash = () => {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveTrash = (items) => {
  localStorage.setItem(TRASH_KEY, JSON.stringify(items));
};

export const getActiveTrash = () => {
  const now = Date.now();
  const items = loadTrash();
  const active = items.filter((item) => item && item.expiresAt > now);
  if (active.length !== items.length) {
    saveTrash(active);
  }
  return active;
};

export const getTrashIds = () => new Set(getActiveTrash().map((item) => String(item.id)));

export const addToTrash = (student) => {
  const now = Date.now();
  const entry = {
    id: String(student.id),
    deletedAt: now,
    expiresAt: now + TRASH_DAYS_MS,
    data: student
  };
  const items = getActiveTrash().filter((item) => String(item.id) !== String(student.id));
  const next = [entry, ...items];
  saveTrash(next);
  return next;
};

export const removeFromTrash = (id) => {
  const next = getActiveTrash().filter((item) => String(item.id) !== String(id));
  saveTrash(next);
  return next;
};
