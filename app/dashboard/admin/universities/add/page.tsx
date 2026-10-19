"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  UniversityForm,
  UniversityFormData,
} from "@/components/universities/UniversityForm";

export default function AddUniversityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (data: UniversityFormData) => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, "universities"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard/admin/universities");
    } catch (error) {
      console.error("Error creating university:", error);
      alert("Failed to add university.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add New University
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in university details, metrics, and D4 program info.
        </p>
      </div>

      <UniversityForm
        onSubmit={handleCreate}
        submitting={submitting}
        onCancel={() => router.back()}
        submitLabel="Create University"
      />
    </div>
  );
}
