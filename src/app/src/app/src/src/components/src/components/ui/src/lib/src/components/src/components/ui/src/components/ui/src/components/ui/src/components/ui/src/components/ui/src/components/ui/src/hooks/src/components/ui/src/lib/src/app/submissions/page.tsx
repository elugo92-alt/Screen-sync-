'use client';

import { useCollection, useFirebase, useUser } from '@/firebase';
import { SubmissionCard } from '@/components/SubmissionCard';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Submission } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubmissionsPage() {
  const { firestore, isUserLoading } = useFirebase();
  const { user } = useUser();

  const submissionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'submissions'),
      orderBy('submittedAt', 'desc')
    );
  }, [firestore]);

  const {
    data: submissions,
    isLoading,
    error,
  } = useCollection<Submission>(submissionsQuery as any);

  const renderContent = () => {
    if (isUserLoading || isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-destructive/10 text-destructive">
          <h2 className="text-xl font-semibold">Error loading submissions</h2>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      );
    }

    if (submissions && submissions.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {submissions.map((submission) => {
            const submissionWithDate = {
              ...submission,
              // Convert Firestore Timestamp to Date
              submittedAt: (submission.submittedAt as any)?.toDate
                ? (submission.submittedAt as any).toDate()
                : new Date(),
            };
            return (
              <SubmissionCard
                key={submission.id}
                submission={submissionWithDate}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-semibold">No submissions yet</h2>
        <p className="text-muted-foreground mt-2">
          When a contractor submits a confirmation, it will appear here.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Recent Submissions
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here are the latest completion confirmations from your contractors.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
