export interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatarUrl: string | null;
  createdAt?: Date;
}
