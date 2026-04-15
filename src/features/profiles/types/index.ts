import type { ProfessionType } from '@prisma/client';

export interface ProfileUser {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tagline: string | null;
  profession: ProfessionType | null;
  company: string | null;
  phone: string | null;
  region: string | null;
  commune: string | null;
  website: string | null;
  linkedin: string | null;
  isPublicProfile: boolean;
  location: string | null;
  identityTags: string[];
}

export interface ProfileFormData {
  username: string;
  fullName: string;
  bio: string;
  tagline: string;
  profession: string;
  company: string;
  phone: string;
  region: string;
  commune: string;
  website: string;
  linkedin: string;
  location: string;
  isPublicProfile: boolean;
}
