'use server';

import { revalidatePath } from 'next/cache';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { Submission } from '@/lib/types';

// Helper to initialize Firebase Admin SDK
function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  // This is a server-side context, so we initialize with the config.
  return initializeApp(firebaseConfig);
}


export async function submitConfirmations(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const db = getFirestore(app);

  const companyName = formData.get('companyName') as string;
  
  // We need to process all entries from the form.
  // The structure is based on how react-hook-form names fields in a field array.
  const submissionsData: { contractorName: string; screenshot: File }[] = [];
  
  // A more robust way to gather submissions from FormData
  const contractorNames = formData.getAll('submissions.0.contractorName');
  const screenshots = formData.getAll('submissions.0.screenshot');

  // This is a simplified example. A real app would handle multiple dynamic entries.
  // For this implementation, we will look for all fields matching the pattern.
  const keys = Array.from(formData.keys());
  const submissionIndices = [
    ...new Set(
      keys
        .map((key) => {
          const match = key.match(/^submissions\.(\d+)\.contractorName$/);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((index) => index !== null)
    ),
  ];

  if (!companyName) {
    return { success: false, message: 'Company name is required.' };
  }
  
  if (submissionIndices.length === 0) {
     return { success: false, message: 'At least one submission is required.' };
  }

  let submissionCount = 0;

  try {
    for (const index of submissionIndices) {
      const contractorName = formData.get(`submissions.${index}.contractorName`) as string;
      const screenshotFile = formData.get(`submissions.${index}.screenshot`) as File;

      if (!contractorName || !screenshotFile || screenshotFile.size === 0) {
        // Skip incomplete entries silently or add specific error handling
        continue;
      }

      // 1. Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `screenshots/${Date.now()}-${screenshotFile.name}`
      );
      const uploadResult = await uploadBytes(storageRef, screenshotFile);
      const screenshotUrl = await getDownloadURL(uploadResult.ref);

      // 2. Create submission document in Firestore
      await addDoc(collection(db, 'submissions'), {
        contractorName,
        companyName,
        screenshotUrl,
        submittedAt: serverTimestamp(),
        imageHint: 'form complete',
      });
      submissionCount++;
    }


    if (submissionCount === 0) {
      return { success: false, message: 'No valid submissions were provided.' };
    }

    // Trigger a revalidation of the submissions page to show the new entries
    revalidatePath('/submissions');

    const message =
      submissionCount > 1
        ? `${submissionCount} confirmations submitted successfully.`
        : 'Confirmation submitted successfully.';

    return { success: true, message };
  } catch (error: any) {
    console.error('Error submitting confirmations:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
}
