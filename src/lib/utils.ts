import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeCompanyName(input?: string | null) {
  if (!input) return '';
  let s = String(input).trim();
  if (!s) return '';
  // normalize whitespace and punctuation
  s = s.replace(/[\u2019`‘’]+/g, "'"); // normalize apostrophes
  s = s.replace(/[_.]+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  // remove trailing words like "pos", "pos's", "company", "company's"
  // also handle cases where pos is attached without a space (e.g., "aviatrixpos's")
  s = s.replace(/(?:pos(?:'s|’s)?|(?:\bpos\b))\s*$/i, '').trim();
  s = s.replace(/\bcompany\b\s*$/i, '').trim();
  // remove trailing possessive if exists
  s = s.replace(/('s|’s)\s*$/i, '').trim();
  // remove trailing 'pos' if still present (e.g., 'aviatrixpos')
  s = s.replace(/pos\s*$/i, '').trim();
  // collapse multiple spaces again
  s = s.replace(/\s+/g, ' ');
  // Title-case each word
  s = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return s || '';
}
