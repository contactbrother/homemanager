import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dar",
    short_name: "Dar",
    description: "Everything about your home, in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#F1F3F0",
    theme_color: "#F1F3F0",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
