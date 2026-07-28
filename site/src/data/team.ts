export type TeamMember = {
  name: string;
  registrationNumber: string;
  role: string;
  email: string;
  biography: string;
  profileImage: string;
  linkedInUrl: string;
  githubUrl: string;
};

export type Supervisor = {
  name: string;
  role: string;
  email: string;
  biography: string;
};

export const team: TeamMember[] = [
  {
    name: "Nadeera Kothalawala",
    registrationNumber: "E/21/226",
    role: "Hardware and Embedded Systems Lead",
    email: "e21226@eng.pdn.ac.lk",
    biography: "Responsible for sensor integration, ESP32 firmware and edge-device reliability.",
    profileImage: "/assets/images/members/e21226.jpg",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Lahiru Dinushan",
    registrationNumber: "E/21/049",
    role: "Cloud Architecture Lead",
    email: "e21049@eng.pdn.ac.lk",
    biography: "Responsible for AWS IoT Core, serverless APIs, DynamoDB and cloud security.",
    profileImage: "/assets/images/members/e21049.jpg",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Rangana Madhushanka",
    registrationNumber: "E/21/200",
    role: "Frontend and Dashboard Lead",
    email: "e21200@eng.pdn.ac.lk",
    biography: "Responsible for the Next.js dashboard, user experience and cloud integration.",
    profileImage: "/assets/images/members/e21200.jpg",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Deshan Dinidu",
    registrationNumber: "E/21/054",
    role: "Data and Machine Learning Lead",
    email: "e21054@eng.pdn.ac.lk",
    biography: "Responsible for telemetry structure, GLP labelling and future model development.",
    profileImage: "/assets/images/members/e21054.jpg",
    linkedInUrl: "",
    githubUrl: "",
  },
];

export const supervisors: Supervisor[] = [
  {
    name: "Ms. Yasodha Vimukthi",
    role: "Project Supervisor",
    email: "yasodhav@eng.pdn.ac.lk",
    biography: "Provides academic guidance and engineering direction for the Spectra Leaf project.",
  },
  {
    name: "Dr. Isuru Nawinne",
    role: "Project Supervisor",
    email: "isurunawinne@eng.pdn.ac.lk",
    biography: "Supports the team with technical review, research guidance and project supervision.",
  },
];
