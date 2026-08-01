export type TeamMember = {
  name: string;
  registrationNumber: string;
  role: string;
  email: string;
  biography: string;
  profileImage: string;
  profileUrl: string;
  linkedInUrl: string;
  githubUrl: string;
};

export type Supervisor = {
  name: string;
  role: string;
  email: string;
  biography: string;
  profileImage: string;
  profileUrl: string;
};

export type DomainAdvisor = {
  name: string;
  title: string;
  organization: string;
  contribution: string;
  profileImage: string;
  profileUrl: string;
  linkedInUrl: string;
};

export const team: TeamMember[] = [
  {
    name: "Nadeera Kothalawala",
    registrationNumber: "E/21/226",
    role: "Role pending team confirmation",
    email: "e21226@eng.pdn.ac.lk",
    biography: "Member of the multidisciplinary student team developing the Spectra Leaf fermentation system.",
    profileImage: "/assets/images/members/e21226.jpg",
    profileUrl: "https://people.ce.pdn.ac.lk/students/e21/226/",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Lahiru Dinushan",
    registrationNumber: "E/21/049",
    role: "Role pending team confirmation",
    email: "e21049@eng.pdn.ac.lk",
    biography: "Member of the multidisciplinary student team developing the Spectra Leaf fermentation system.",
    profileImage: "/assets/images/members/e21049.jpg",
    profileUrl: "https://people.ce.pdn.ac.lk/students/e21/049/",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Rangana Madhushanka",
    registrationNumber: "E/21/200",
    role: "Role pending team confirmation",
    email: "e21200@eng.pdn.ac.lk",
    biography: "Member of the multidisciplinary student team developing the Spectra Leaf fermentation system.",
    profileImage: "/assets/images/members/e21200.jpg",
    profileUrl: "https://people.ce.pdn.ac.lk/students/e21/200/",
    linkedInUrl: "",
    githubUrl: "",
  },
  {
    name: "Deshan Dinidu",
    registrationNumber: "E/21/054",
    role: "Role pending team confirmation",
    email: "e21054@eng.pdn.ac.lk",
    biography: "Member of the multidisciplinary student team developing the Spectra Leaf fermentation system.",
    profileImage: "/assets/images/members/e21054.jpg",
    profileUrl: "https://people.ce.pdn.ac.lk/students/e21/054/",
    linkedInUrl: "",
    githubUrl: "",
  },
];

export const supervisors: Supervisor[] = [
  {
    name: "Ms. Yasodha Vimukthi",
    role: "Project Supervisor · Lecturer (Probationary)",
    email: "yasodhav@eng.pdn.ac.lk",
    biography: "Provides project supervision across software architecture, machine learning, data validation and platform delivery.",
    profileImage: "/assets/images/members/Ms. Yasodha Vimukthi.jpg",
    profileUrl: "https://people.ce.pdn.ac.lk/staff/academic/yasodha-vimukthi/",
  },
  {
    name: "Dr. Isuru Nawinne",
    role: "Project Supervisor · Senior Lecturer",
    email: "isurunawinne@eng.pdn.ac.lk",
    biography: "Provides systems-engineering guidance across embedded systems, industrial automation, technical validation and project delivery.",
    profileImage: "/assets/images/members/Dr. Isuru Nawinne.png",
    profileUrl: "https://people.ce.pdn.ac.lk/staff/academic/isuru-nawinne/",
  },
];

export const domainAdvisors: DomainAdvisor[] = [
  {
    name: "Prof. H.M.G.S.B. Hitinayake",
    title: "Professor · Crop Science Advisor",
    organization: "Department of Crop Science · Faculty of Agriculture",
    contribution: "Advises the project on tea-plantation context, crop-science considerations and the interpretation of process observations alongside factory quality evaluation.",
    profileImage: "/assets/images/members/Prof. H.M.G.S.B. Hitinayake.jpg",
    profileUrl: "https://agri.pdn.ac.lk/crsc/staff/academic_staff_detail/11",
    linkedInUrl: "",
  },
];
