const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mosque-match-platform.s3.eu-west-2.amazonaws.com",
        pathname: "/profilepictures/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
    ],
  },
};

export default nextConfig;
