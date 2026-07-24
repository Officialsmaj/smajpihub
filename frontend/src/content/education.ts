export type EducationCourse = {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration: string;
  pricePi: number;
  rating: string;
  image: string;
};

export type EducationPartner = {
  name: string;
  type: string;
  location: string;
  programs: string;
  status: string;
};

export const educationCategories = [
  "Universities",
  "Online Courses",
  "Tech Skills",
  "Business",
  "Exam Prep",
  "Tutors",
  "Certificates",
] as const;

export const featuredEducationCourses: EducationCourse[] = [
  {
    id: "web-foundations",
    title: "Web Development Foundations",
    provider: "SMAJ Digital Academy",
    category: "Tech Skills",
    level: "Beginner",
    duration: "6 weeks",
    pricePi: 12,
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "business-growth",
    title: "Small Business Growth with Digital Tools",
    provider: "SMAJ Business School",
    category: "Business",
    level: "Intermediate",
    duration: "4 weeks",
    pricePi: 9,
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "english-exam-prep",
    title: "English Exam Preparation",
    provider: "Verified Tutor Network",
    category: "Exam Prep",
    level: "All levels",
    duration: "8 weeks",
    pricePi: 15,
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=85",
  },
];

export const educationPartners: EducationPartner[] = [
  {
    name: "Partner University Portal",
    type: "University Access",
    location: "Global",
    programs: "Admissions, programs, application fees",
    status: "Partner onboarding",
  },
  {
    name: "SMAJ Digital Academy",
    type: "Online School",
    location: "Remote",
    programs: "Technology, business, creator skills",
    status: "Ready for pilot",
  },
  {
    name: "Verified Tutor Network",
    type: "Tutoring",
    location: "Remote and local",
    programs: "One-to-one lessons, exam prep",
    status: "Provider review",
  },
];
