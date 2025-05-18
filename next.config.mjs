// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mosque-match-platform.s3.eu-west-2.amazonaws.com",
        pathname: "/profilepictures/**",
      },
    ],
  },
};

export default nextConfig;
