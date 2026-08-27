/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/svt-survey.html", permanent: false },
    ];
  },
};

export default nextConfig;
