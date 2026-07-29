/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/e21-3yp-SPECTRA-LEAF' : '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
