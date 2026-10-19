"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HousingForm, HousingFormData } from "@/components/housing/HousingForm";

export default function AddHousingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (data: HousingFormData) => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "housing"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard/admin/housing");
    } catch (error) {
      console.error("Error creating housing record:", error);
      alert("Failed to add housing record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white border border-slate-200 rounded-xl shadow-sm my-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add New Housing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in housing details, pricing, facilities, and map location.
        </p>
      </div>

      <HousingForm
        onSubmit={handleCreate}
        submitting={submitting}
        onCancel={() => router.back()}
        submitLabel="Create Housing"
      />
    </div>
  );
}
