'use client';

import { currentUser as mockUser } from './data';

// Define a type for the user profile
export type UserProfile = typeof mockUser;

const USER_PROFILE_STORAGE_KEY = 'userProfile';

export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') return mockUser;
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    // Merge with mockUser to ensure all fields are present if the stored object is outdated
    const parsed = storedProfile ? JSON.parse(storedProfile) : {};
    return { ...mockUser, ...parsed };
  } catch (error) {
    console.error("Failed to parse user profile from localStorage", error);
    return mockUser;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save user profile to localStorage", error);
  }
};
