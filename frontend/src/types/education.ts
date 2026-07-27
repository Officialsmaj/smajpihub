export type EducationCourse = {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration: string;
  priceUsdt: number;
  rating: string;
  image: string;
  description?: string;
};

export type EducationPartner = {
  id: string;
  name: string;
  type: string;
  location: string;
  programs: string;
  status: string;
};

export type EducationCategory = string;
