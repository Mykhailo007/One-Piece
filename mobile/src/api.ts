import { Catalog } from './types';

export function joinUrl(baseUrl: string, path: string): string {
  // Remove trailing slash from base and leading slash from path
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}/${cleanPath}`;
}

export async function fetchCatalog(serverUrl: string): Promise<Catalog> {
  const url = joinUrl(serverUrl, '/catalog.json');
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.status}`);
  }
  
  return await response.json();
}

export async function testServerConnection(serverUrl: string): Promise<boolean> {
  try {
    const url = joinUrl(serverUrl, '/health');
    const response = await fetch(url, { timeout: 5000 } as any);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
}
