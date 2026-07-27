import { ScrollScrubVideo } from "./ScrollScrubVideo";

const scenes = [
  { label: "EDGE", title: "Physical sensing begins at the fermentation trough.", description: "Temperature, volatile compounds and colour development are observed together." },
  { label: "ESP32", title: "ESP32 converts behaviour into structured telemetry.", description: "Device, batch and timestamp context travel with every reading." },
  { label: "AWS IoT CORE", title: "The cloud securely synchronizes every active device.", description: "MQTT and Device Shadow keep control and reported state aligned." },
  { label: "SERVERLESS", title: "Cloud services turn telemetry into factory intelligence.", description: "Lambda, DynamoDB and API Gateway serve a responsive operational view." },
  { label: "DATASET", title: "Every completed batch strengthens the future dataset.", description: "Good Leaf Percentage closes the loop between process and final quality." },
];

export function VideoStoryTwo() {
  return <ScrollScrubVideo source="/assets/video2-scrub.mp4" eyebrow="02 · EDGE TO CLOUD" scenes={scenes} />;
}
