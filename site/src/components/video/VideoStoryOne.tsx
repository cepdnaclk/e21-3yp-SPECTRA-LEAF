import { ScrollScrubVideo } from "./ScrollScrubVideo";

const scenes = [
  { label: "01 / OBSERVATION", title: "Tea fermentation is still judged by human observation.", description: "A skilled eye remains essential, but isolated judgement leaves no synchronized record." },
  { label: "02 / VARIATION", title: "Small timing differences change colour, aroma and final quality.", description: "The process moves continuously, while manual checks only capture moments." },
  { label: "03 / MEASUREMENT", title: "Spectra Leaf transforms fermentation into measurable data.", description: "Edge sensing converts physical change into a time-aligned digital profile." },
  { label: "04 / FUSION", title: "Temperature. Gas. Colour. One synchronized profile.", description: "Three sensor domains reveal the batch as a connected system." },
  { label: "05 / INTELLIGENCE", title: "From real-time guidance to future AI automation.", description: "Every labelled batch builds the evidence needed for the next generation." },
];

export function VideoStoryOne() {
  return <ScrollScrubVideo source="/assets/video1-scrub.mp4" eyebrow="01 · PHYSICAL PROCESS" scenes={scenes} tone="copper" />;
}
