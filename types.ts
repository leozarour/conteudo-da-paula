export interface VideoItem {
  id: string;
  title: string;
  url: string;
  coverUrl?: string; // New field for the thumbnail image
  description: string;
  tags: string[];
  createdAt: number;
  // Interaction stats
  likes: number;
  comments: number;
  shares: number;
}

export interface AIParsedData {
  summary: string;
  tags: string[];
}