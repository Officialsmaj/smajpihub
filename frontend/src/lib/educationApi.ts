import { axiosClient } from "./axiosClient";
import type { EducationCourse, EducationPartner, EducationCategory } from "../types/education";

const FALLBACK_CATEGORIES: EducationCategory[] = [
  "Universities",
  "Online Courses",
  "Tech Skills",
  "Business",
  "Exam Prep",
  "Tutors",
  "Certificates",
];

const FALLBACK_COURSES: EducationCourse[] = [
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
    description: "Learn HTML, CSS, and JavaScript from scratch with hands-on projects.",
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
    description: "Use digital marketing and analytics to grow a small business.",
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
    description: "Prepare for IELTS, TOEFL, and PTE with guided practice.",
  },
];

const FALLBACK_PARTNERS: EducationPartner[] = [
  {
    id: "partner-university-portal",
    name: "Partner University Portal",
    type: "University Access",
    location: "Global",
    programs: "Admissions, programs, application fees",
    status: "Partner onboarding",
  },
  {
    id: "smaj-digital-academy",
    name: "SMAJ Digital Academy",
    type: "Online School",
    location: "Remote",
    programs: "Technology, business, creator skills",
    status: "Ready for pilot",
  },
  {
    id: "verified-tutor-network",
    name: "Verified Tutor Network",
    type: "Tutoring",
    location: "Remote and local",
    programs: "One-to-one lessons, exam prep",
    status: "Provider review",
  },
];

export const getEducationCategories = async (): Promise<EducationCategory[]> => {
  try {
    const response = await axiosClient.get<{ categories: EducationCategory[] }>("/education/categories");
    const data = response.data.categories;
    return data.length ? data : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
};

export const getEducationCourses = async (params?: { category?: string; query?: string }): Promise<EducationCourse[]> => {
  try {
    const response = await axiosClient.get<{ courses: EducationCourse[] }>("/education/courses", { params });
    const data = response.data.courses;
    return data.length ? data : FALLBACK_COURSES;
  } catch {
    return FALLBACK_COURSES;
  }
};

export const getEducationCourse = async (id: string): Promise<EducationCourse | undefined> => {
  try {
    const response = await axiosClient.get<{ course: EducationCourse }>(`/education/courses/${encodeURIComponent(id)}`);
    return response.data.course;
  } catch {
    return FALLBACK_COURSES.find((course) => course.id === id);
  }
};

export const getEducationPartners = async (): Promise<EducationPartner[]> => {
  try {
    const response = await axiosClient.get<{ partners: EducationPartner[] }>("/education/partners");
    const data = response.data.partners;
    return data.length ? data : FALLBACK_PARTNERS;
  } catch {
    return FALLBACK_PARTNERS;
  }
};
