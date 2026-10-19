"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  UniversityForm,
  UniversityFormData,
} from "@/components/universities/UniversityForm";

export default function EditUniversityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [initialData, setInitialData] =
    useState<Partial<UniversityFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const docRef = doc(db, "universities", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInitialData(docSnap.data() as UniversityFormData);
        } else {
          alert("University record not found.");
          router.push("/dashboard/admin/universities");
        }
      } catch (error) {
        console.error("Error loading university:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id, router]);

  const handleUpdate = async (data: UniversityFormData) => {
    setSubmitting(true);
    try {
      const docRef = doc(db, "universities", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      router.push("/dashboard/admin/universities");
    } catch (error) {
      console.error("Error updating university:", error);
      alert("Failed to update university record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading university data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white border border-slate-200 rounded-xl shadow-sm my-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit University Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the details, program metrics, and bullet lists for this
          university.
        </p>
      </div>

      <UniversityForm
        initialData={initialData ?? undefined}
        onSubmit={handleUpdate}
        submitting={submitting}
        onCancel={() => router.back()}
        submitLabel="Update Changes"
      />
    </div>
  );
}
