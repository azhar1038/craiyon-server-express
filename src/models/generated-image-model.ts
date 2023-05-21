export type GeneratedImageModel = {
  id: number;
  prompt: string;
  url: string;
  isPrivate: boolean;
  likes: number;
  model: string;
  resolution: string;
  likedByUser?: boolean;
};
