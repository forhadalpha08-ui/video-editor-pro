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
    path.startsWith('data:')
  ) {
    return path;
  }
  
  let cleanPath = path;
  while (cleanPath.startsWith('./') || cleanPath.startsWith('/')) {
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.slice(2);
    } else if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }
  }
  
  const baseUrl = import.meta.env.BASE_URL || '/';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${cleanPath}`;
}

