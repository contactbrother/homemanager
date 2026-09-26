/**
 * Screens that take over the whole phone screen, like a chat or a file viewer in a
 * native app: no tab bar, no brand bar, their own back arrow. Tablets and desktops keep
 * the sidebar on every screen.
 */
const IMMERSIVE = [/^\/tasks\/[^/]+$/, /^\/admin\/tasks\/[^/]+$/, /^\/properties\/[^/]+\/documents\/[^/]+$/];

export function isImmersive(pathname: string): boolean {
  return IMMERSIVE.some((pattern) => pattern.test(pathname));
}
