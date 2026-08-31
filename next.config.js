/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // As fotos/vídeos enviados pelo /admin ficam armazenados no Vercel Blob,
    // num domínio do tipo <id-da-conta>.public.blob.vercel-storage.com.
    // Autorizando esse domínio aqui, o Next.js pode otimizar (redimensionar
    // e comprimir) essas imagens automaticamente via next/image — é isso que
    // faz as miniaturas do álbum carregarem muito mais leves.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    // Permite usar quality={60} nas miniaturas (o padrão do Next.js só libera
    // qualidade 75 se a gente não declarar outros valores aqui).
    qualities: [60, 75],
  },
};
 
module.exports = nextConfig;