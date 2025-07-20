import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ABCSteps Vivek - AI Educational Companion",
    short_name: "ABCSteps Vivek",
    description: "An AI-powered educational companion that guides students through Socratic questioning, personalized memory tracking, and multilingual support for Indian languages",
    start_url: "/",
    display: "standalone",
    categories: ["education", "ai", "learning"],
    background_color: "#171717",
    icons: [
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ],
    screenshots: [
      {
        src: "/opengraph-image.png",
        type: "image/png",
        sizes: "1200x630",
      }
    ]
  }
}