export interface ForumAuthor {
  id: string;
  name: string;
  username: string;
  image?: string | null;
}

export interface ForumComment {
  id: string;
  content: string;
  isAccepted?: boolean;
  upvotesCount: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  author: ForumAuthor;
  hasUpvoted?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  tag: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | string | null;
  upvotesCount: number;
  isSolved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: ForumAuthor;
  commentsCount: number;
  hasUpvoted: boolean;
  comments?: ForumComment[];
}
