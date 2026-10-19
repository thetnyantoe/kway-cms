"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Edit3, Plus, MapPin, Search } from "lucide-react";

const R2_PUBLIC_DOMAIN = "https://pub-37cdc29158eb4b399d3544d0211772b1.r2.dev";

const getPublicUrl = (key?: string) => {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  return `${R2_PUBLIC_DOMAIN}/${key}`;
};

export default function UniversitiesViewPage() {
  const router = useRouter();
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUniversities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "universities"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUniversities(list);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleDelete = async (id: string, bannerKey?: string) => {
    if (!confirm("Are you sure you want to delete this university record?"))
      return;

    try {
      if (bannerKey) {
        await fetch("https://kway-cms.vercel.app/api/r2/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: bannerKey }),
        });
      }

      await deleteDoc(doc(db, "universities", id));
      setUniversities((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Failed to delete university:", error);
      alert("Error deleting record.");
    }
  };

  // Filter universities based on name, description (about), location summary, or majors
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return universities;
    const query = searchQuery.toLowerCase();

    return universities.filter((uni) => {
      const nameMatch = uni.name?.toLowerCase().includes(query);
      const aboutMatch = uni.about?.toLowerCase().includes(query);
      const locationMatch = uni.locationShort?.toLowerCase().includes(query);
      const majorMatch = uni.majors?.some(
        (m: any) =>
          m.title?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query),
      );

      return nameMatch || aboutMatch || locationMatch || majorMatch;
    });
  }, [universities, searchQuery]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading universities...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className=" text-3xl lg:text-5xl tracking-tight text-slate-700 bitcount">
            Universities
          </h1>
        </div>
        <Button
          onClick={() => router.push("/dashboard/admin/universities/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add University
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, description, location, or major..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {filteredUniversities.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
          {universities.length === 0
            ? 'No university records found. Click "Add University" to create one.'
            : "No universities match your search criteria."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUniversities.map((uni) => {
            const bannerImageUrl = getPublicUrl(uni.bannerKey);

            return (
              <div
                key={uni.id}
                className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition"
              >
                <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold tracking-tight">
                      {uni.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-slate-200 border-slate-700 bg-slate-800/60 text-xs"
                    >
                      <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                      {uni.locationShort}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline mr-2">
                      ID: {uni.id}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/universities/${uni.id}/edit`,
                        )
                      }
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled
                      className="cursor-pointer h-8 text-xs bg-red-600/80 hover:bg-red-600 text-white"
                      onClick={() => handleDelete(uni.id, uni.bannerKey)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start text-xs">
                  <div className="space-y-2 lg:border-r border-slate-100 lg:pr-3">
                    <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {bannerImageUrl ? (
                        <img
                          src={bannerImageUrl}
                          alt={uni.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          No Image
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">
                        About
                      </p>
                      <p className="text-slate-700 line-clamp-3 leading-relaxed">
                        {uni.about || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Quick Summary & D2
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="bg-slate-50 p-1.5 rounded border">
                        <span className="text-slate-400 block text-[10px]">
                          App Fee
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₩{uni.d2ApplicationFee || "0"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border">
                        <span className="text-slate-400 block text-[10px]">
                          Scholarship
                        </span>
                        <span className="font-semibold text-slate-800">
                          {uni.scholarship || "0"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border">
                        <span className="text-slate-400 block text-[10px]">
                          Intake
                        </span>
                        <span className="font-semibold text-slate-800">
                          {uni.intake || "N/A"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border">
                        <span className="text-slate-400 block text-[10px]">
                          Est. Cost
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₩{uni.estimatedCost || "0"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="font-semibold text-slate-500 text-[10px]">
                        D2 Fees/Semester:
                      </p>
                      {uni.d2TuitionFees?.map((fee: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between bg-slate-50 px-2 py-0.5 rounded border text-[10px]"
                        >
                          <span className="text-slate-600 truncate max-w-[90px]">
                            {fee.program}
                          </span>
                          <span className="font-bold text-slate-900">
                            ₩{fee.fee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Majors
                    </p>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                      {uni.majors?.map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-1.5 rounded border text-[11px]"
                        >
                          <p className="font-bold text-slate-800 leading-tight">
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-slate-500 text-[10px] line-clamp-1 mt-0.5">
                              {m.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      D-4 Program
                    </p>
                    <div className="bg-slate-50 p-2 rounded border space-y-1 text-[11px] text-slate-700">
                      <p className="line-clamp-1">
                        <strong className="text-slate-900">Period:</strong>{" "}
                        {uni.d4ApplicationPeriod || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Tuition:</strong> ₩
                        {uni.d4TuitionFee || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Apply Fee:</strong> ₩
                        {uni.d4ApplyFee || "N/A"}
                      </p>
                      <p className="line-clamp-1">
                        <strong className="text-slate-900">Dorm Rent:</strong>{" "}
                        {uni.d4DormitoryRent || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Show Money:</strong>{" "}
                        {uni.d4ShowMoney || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Additional Info
                    </p>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {uni.scholarshipsList?.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 text-[10px]">
                            Scholarships:
                          </span>
                          <ul className="list-disc pl-3 text-slate-600 text-[10px]">
                            {uni.scholarshipsList.map(
                              (s: string, i: number) => (
                                <li key={i} className="line-clamp-1">
                                  {s}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {uni.dormitoriesList?.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 text-[10px]">
                            Dormitory:
                          </span>
                          <ul className="list-disc pl-3 text-slate-600 text-[10px]">
                            {uni.dormitoriesList.map((d: string, i: number) => (
                              <li key={i} className="line-clamp-1">
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {uni.notesList?.length > 0 && (
                        <div>
                          <span className="font-bold text-slate-700 text-[10px]">
                            Notes:
                          </span>
                          <ul className="list-disc pl-3 text-slate-600 text-[10px]">
                            {uni.notesList.map((n: string, i: number) => (
                              <li key={i} className="line-clamp-1">
                                {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
