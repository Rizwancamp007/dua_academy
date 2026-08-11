import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duaa Academy Mirpur Mathelo",
    short_name: "Duaa Academy",
    description:
      "Your Future. Our Commitment. Your Success. 20 Years of Educational Excellence in Mirpur Mathelo.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF8F3",
    theme_color: "#8B0000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
