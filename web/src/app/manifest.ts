import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infobackground",
    short_name: "Infobackground",
    description: "Сайты и лендинги, которые продают",
    start_url: "/",
    display: "standalone",
    background_color: "#071518",
    theme_color: "#071518",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
