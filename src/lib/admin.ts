export const ADMIN_EMAILS = [
  'admin.bitvend@gmail.com',
];

export const isAllowedAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === lower);
};
