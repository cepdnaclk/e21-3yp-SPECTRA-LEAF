/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProduction ? '/e21-3yp-SPECTRA-LEAF' : '',
  images: { unoptimized: true },
};

export default nextConfig;
