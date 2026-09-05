import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The CLI renders by building and starting this app. It sets this variable
   * so its build lands in a directory of its own — sharing `.next` with a
   * running `next dev` corrupts that server's cache.
   */
  distDir: process.env.FRAMECRAFT_DIST_DIR || ".next",
};

export default nextConfig;
