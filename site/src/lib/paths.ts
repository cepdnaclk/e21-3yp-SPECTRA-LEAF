const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function getAssetPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${basePath}${normalized}`;
}

export const productionUrl =
  "https://cepdnaclk.github.io/e21-3yp-SPECTRA-LEAF/";
