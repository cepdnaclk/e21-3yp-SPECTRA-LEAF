export const project = {
  title: "SPECTRA LEAF",
  subtitle: "Digitizing the Fermentation Sweet Spot",
  eyebrow: "INDUSTRIAL IoT · TEA PROCESS INTELLIGENCE",
  description:
    "Spectra Leaf aims to make black-tea oxidation measurable and repeatable by capturing temperature, gas and colour telemetry for live factory guidance and future quality-control models.",
  githubUrl: "https://github.com/cepdnaclk/e21-3yp-SPECTRA-LEAF",
  university: "University of Peradeniya",
  faculty: "Faculty of Engineering",
  department: "Department of Computer Engineering",
  projectYear: "3rd Year Engineering Project",
  contactEmail: "",
  technologies: [
    "ESP32",
    "AWS IoT Core",
    "DynamoDB",
    "Lambda",
    "API Gateway",
    "Cognito",
    "Next.js",
    "AWS Amplify",
  ],
  metrics: [
    { value: "3", label: "Sensor Domains", detail: "Temperature · Gas · Colour" },
    { value: "Real-Time", label: "Batch Telemetry", detail: "Synchronized sensing" },
    { value: "Serverless", label: "AWS Architecture", detail: "Elastic cloud services" },
    { value: "24/7", label: "Remote Monitoring", detail: "Connected visibility" },
    { value: "AI-Ready", label: "Structured Dataset", detail: "Batch-linked profiles" },
  ],
  objectives: [
    { title: "Digitization", text: "Replace subjective manual monitoring with measurable sensor data." },
    { title: "Real-Time Guidance", text: "Give factory officers a responsive dashboard for monitoring active fermentation batches." },
    { title: "Data Harvesting", text: "Build structured fermentation profiles mapped to final Good Leaf Percentage values." },
    { title: "Future Automation", text: "Prepare for machine-learning-based detection of the optimum fermentation endpoint." },
  ],
  roadmap: [
    "Larger factory pilot",
    "Sensor calibration refinement",
    "Multi-trough deployment",
    "Advanced analytics",
    "Machine-learning model training",
    "Automated sweet-spot alerts",
    "Predictive batch comparison",
    "Commercial deployment",
  ],
} as const;

export const testingGroups = [
  {
    name: "CI/CD",
    status: "Implemented",
    items: ["GitHub Actions", "Automatic checks on push", "AWS Amplify hosting path", "Main branch deployment"],
  },
  {
    name: "Local + Cloud",
    status: "In Progress",
    items: ["Local Next.js testing", "Cloud-connected API testing", "IoT command validation", "Environment separation"],
  },
  {
    name: "Security",
    status: "Planned",
    items: ["SRP authentication", "JWT validation", "Authorization checks", "Token refresh and rotation"],
  },
  {
    name: "Hardware resilience",
    status: "In Progress",
    items: ["MQTT reconnection", "Wi-Fi recovery", "Sensor failure handling", "Device Shadow resynchronization"],
  },
] as const;
