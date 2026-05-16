export type Review = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  createdAt: string;
  sessionId?: string;
};

export type ReviewInput = {
  name: string;
  role?: string;
  content: string;
  rating: number;
};
