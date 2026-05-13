/**
 * API configuration and constants
 */

// Centralized API base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Standard external API target (fallback)
export const DEFAULT_API_TARGET = "https://api-dbosca.drchiocms.com";

/**
 * Normalizes a URL to ensure it uses the configured base.
 * Automatically handles whether to use the proxy or direct external URL.
 */
export function getApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  
  // Clean path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // If we have a VITE_API_URL, use it.
  // Otherwise, use relative /api path which will be handled by the proxy in server.ts
  if (API_BASE_URL) {
    const apiPart = cleanPath.startsWith("/api") ? "" : "/api";
    return `${API_BASE_URL}${apiPart}${cleanPath}`;
  }
  
  const apiPart = cleanPath.startsWith("/api") ? "" : "/api";
  return `${apiPart}${cleanPath}`;
}

/**
 * Helper for storage assets
 */
export function getStorageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  // Always use the primary API target for storage if no VITE_API_URL is set
  const base = API_BASE_URL || DEFAULT_API_TARGET;
  return `${base}/storage/${cleanPath}`;
}

/**
 * Standard fetch with error handling and logging
 */
export async function secureFetch(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Accept": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.warn(`[API] Error ${response.status} at ${url}:`, errorData);
      throw {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      };
    }

    return response;
  } catch (error: any) {
    console.error(`[API] Fetch failed for ${url}:`, error);
    throw error;
  }
}
