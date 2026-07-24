import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repoName = "libraryailab";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {
        // สำหรับ Docker / Development / Production Server
        images: {
          unoptimized: false,
        },
      }),
};

export default nextConfig;