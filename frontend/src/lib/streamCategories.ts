export type StreamCategory = {
  label: string;
  slug: string;
  tone: string;
};

export const streamCategories: StreamCategory[] = [
  { label: "Action", slug: "action", tone: "cyan" },
  { label: "Animation", slug: "animation", tone: "green" },
  { label: "Comedy", slug: "comedy", tone: "purple" },
  { label: "Crime", slug: "crime", tone: "slate" },
  { label: "Documentary", slug: "documentaries", tone: "orange" },
  { label: "Drama", slug: "drama", tone: "sand" },
  { label: "Family", slug: "family", tone: "lavender" },
  { label: "Fantasy", slug: "fantasy", tone: "indigo" },
  { label: "History", slug: "history", tone: "bronze" },
  { label: "Horror", slug: "horror", tone: "red" },
  { label: "Music", slug: "music", tone: "emerald" },
  { label: "Mystery", slug: "mystery", tone: "midnight" },
  { label: "Romance", slug: "romance", tone: "pink" },
  { label: "Science Fiction", slug: "science-fiction", tone: "blue" },
  { label: "Thriller", slug: "thriller", tone: "charcoal" },
  { label: "Western", slug: "western", tone: "amber" },
];
