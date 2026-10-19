"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HousingForm, HousingFormData } from "@/components/housing/HousingForm";

export default function EditHousingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [initialData, setInitialData] =
    useState<Partial<HousingFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHousing = async () => {
      try {
        const docRef = doc(db, "housing", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInitialData(docSnap.data() as HousingFormData);
        } else {
          alert("Housing record not found.");
          router.push("/dashboard/admin/housing");
        }
      } catch (error) {
        console.error("Error loading housing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousing();
  }, [id, router]);

  const handleUpdate = async (data: HousingFormData) => {
    setSubmitting(true);
    try {
      const docRef = doc(db, "housing", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      router.push("/dashboard/admin/housing");
    } catch (error) {
      console.error("Error updating housing record:", error);
      alert("Failed to update housing record.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading housing data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white border border-slate-200 rounded-xl shadow-sm my-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit Housing Record
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update pricing, availability status, facilities, specs, or map
          location links.
        </p>
      </div>

      <HousingForm
        initialData={initialData ?? undefined}
        onSubmit={handleUpdate}
        submitting={submitting}
        onCancel={() => router.back()}
        submitLabel="Update Changes"
      />
    </div>
  );
}
