/**
 * Utility to resolve asset URLs correctly across local development,
 * custom domains, and GitHub Pages sub-path deployments (e.g. /video-editor-pro/).
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:') ||
    path.startsWith('./')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL || './';
  
  if (baseUrl === './') {
    return `./${cleanPath}`;
  }
  
  return `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${cleanPath}`;
}
