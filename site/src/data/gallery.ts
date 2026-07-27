export type GalleryItem = {
  title: string;
  category: string;
  alt: string;
  image?: string;
  accent: "green" | "copper" | "cyan";
};

export const gallery: GalleryItem[] = [
  {
    title: "Preparing fresh tea leaves",
    category: "Sample preparation",
    alt: "Fresh tea leaves being selected and prepared on the laboratory workbench",
    image: "/assets/images/photo_gallery/PXL_20260709_060938471.jpg",
    accent: "green",
  },
  {
    title: "Hands-on leaf processing",
    category: "Lab experiment",
    alt: "Researchers manually processing tea leaves during the project experiment",
    image: "/assets/images/photo_gallery/PXL_20260709_061255253.MP.jpg",
    accent: "copper",
  },
  {
    title: "Preparing the test samples",
    category: "Sample preparation",
    alt: "A researcher preparing tea-leaf samples beside the laboratory windows",
    image: "/assets/images/photo_gallery/PXL_20260709_062508254.MP.jpg",
    accent: "green",
  },
  {
    title: "Prototype beside the process",
    category: "Sensor validation",
    alt: "The ESP32 monitoring prototype positioned beside processed tea-leaf samples",
    image: "/assets/images/photo_gallery/PXL_20260709_063952510.MP.jpg",
    accent: "cyan",
  },
  {
    title: "Sorting experimental batches",
    category: "Lab workflow",
    alt: "Researchers sorting tea-leaf batches before the monitoring experiment",
    image: "/assets/images/photo_gallery/PXL_20260709_064853561.jpg",
    accent: "copper",
  },
  {
    title: "Monitoring the leaf bed",
    category: "Device testing",
    alt: "The sensor probe and control prototype monitoring a prepared tea-leaf bed",
    image: "/assets/images/photo_gallery/PXL_20260709_065856875.jpg",
    accent: "cyan",
  },
  {
    title: "Comparing sample conditions",
    category: "Experiment setup",
    alt: "Three prepared tea-leaf batches arranged beside the monitoring prototype for comparison",
    image: "/assets/images/photo_gallery/PXL_20260709_065903975.jpg",
    accent: "green",
  },
  {
    title: "Team at work",
    category: "Project development",
    alt: "Spectra Leaf team members processing tea leaves together in the laboratory",
    image: "/assets/images/photo_gallery/PXL_20260714_041049880.jpg",
    accent: "copper",
  },
];
