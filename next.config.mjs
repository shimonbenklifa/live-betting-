/**
 * The app supports two build targets:
 *  - Default (server): `next build` / `next start` — full SSR + server actions.
 *  - GitHub Pages (static): set GITHUB_PAGES=true to produce a static export in
 *    `out/`, served from the repo subpath. The app runs fully in the browser in
 *    demo mode, so no server is required for the Pages preview.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "live-betting-";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: "export",
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        images: { unoptimized: true },
        trailingSlash: true
      }
    : {})
};

export default nextConfig;
