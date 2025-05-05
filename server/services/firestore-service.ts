import { Firestore } from '@google-cloud/firestore';
import { User, InsertUser } from '@shared/schema';

// Initialize Firestore
let firestore: Firestore;

// Initialize Firestore with credentials
export const initializeFirestore = () => {
  try {
    // Initialize using service account credentials (From environment variables)
    // In production, these would be securely stored environment variables
    firestore = new Firestore();
    console.log('Firestore initialized successfully');
    return firestore;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

// Get Firestore instance, initializing if necessary
export const getFirestore = (): Firestore => {
  if (!firestore) {
    return initializeFirestore();
  }
  return firestore;
};

// User Collection Methods

/**
 * Get user profile by ID
 * @param userId The user ID to fetch
 * @returns User object or undefined if not found
 */
export const getUserProfile = async (userId: string): Promise<User | undefined> => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return undefined;
    }
    
    const userData = userDoc.data() as User;
    return {
      ...userData,
      id: userDoc.id,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get user by username
 * @param username The username to search for
 * @returns User object or undefined if not found
 */
export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  try {
    const db = getFirestore();
    const usersSnapshot = await db
      .collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return undefined;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data() as User;
    
    return {
      ...userData,
      id: userDoc.id,
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param userData User data to save
 * @returns The created user with ID
 */
export const createUser = async (userData: InsertUser): Promise<User> => {
  try {
    const db = getFirestore();
    
    // If the ID is provided, use it as the document ID, otherwise generate one
    const userRef = userData.id 
      ? db.collection('users').doc(userData.id)
      : db.collection('users').doc();
      
    const timestamp = new Date();
    const userToSave = {
      ...userData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await userRef.set(userToSave);
    
    return {
      ...userToSave,
      id: userRef.id,
    } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user's profile
 * @param userId User ID to update
 * @param profileData Updated profile data
 * @returns The updated user
 */
export const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<User> => {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    
    // Update only the provided fields
    const updateData = {
      ...profileData,
      updatedAt: new Date(),
    };
    
    await userRef.update(updateData);
    
    // Fetch and return the updated user
    const updatedUser = await getUserProfile(userId);
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found after update`);
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param userId User ID to update
 * @param preferences Preferences object 
 * @returns The updated user
 */
export const updateUserPreferences = async (userId: string, preferences: any): Promise<User> => {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      preferences,
      updatedAt: new Date(),
    });
    
    // Fetch and return the updated user
    const updatedUser = await getUserProfile(userId);
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found after update`);
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};
