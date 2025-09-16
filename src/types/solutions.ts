export interface SolutionContent {
  id?: string;
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  features: string[];
  gradient: string;
  githubUrl?: string | null;
}
