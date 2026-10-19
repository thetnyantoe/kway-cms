"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Edit3,
  Plus,
  MapPin,
  Search,
  ExternalLink,
  Check,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

const R2_PUBLIC_DOMAIN = "https://pub-37cdc29158eb4b399d3544d0211772b1.r2.dev";

const getPublicUrl = (key?: string) => {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  return `${R2_PUBLIC_DOMAIN}/${key}`;
};

export default function HousingViewPage() {
  const router = useRouter();
  const [housingList, setHousingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("ALL");
  const [selectedRentalType, setSelectedRentalType] = useState("ALL");
  const [depositSort, setDepositSort] = useState<"NONE" | "ASC" | "DESC">(
    "NONE",
  );

  const fetchHousing = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "housing"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setHousingList(list);
    } catch (error) {
      console.error("Error fetching housing records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousing();
  }, []);

  const handleDelete = async (id: string, imageKey?: string) => {
    if (!confirm("Are you sure you want to delete this housing record?"))
      return;

    try {
      if (imageKey) {
        await fetch("/api/r2/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: imageKey }),
        });
      }

      await deleteDoc(doc(db, "housing", id));
      setHousingList((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Failed to delete housing record:", error);
      alert("Error deleting record.");
    }
  };

  const handleResetFilters = () => {
    setSearchTitle("");
    setSelectedRoomType("ALL");
    setSelectedRentalType("ALL");
    setDepositSort("NONE");
  };

  const roomTypesList = useMemo(() => {
    const types = new Set(
      housingList.map((item) => item.roomType).filter(Boolean),
    );
    return Array.from(types);
  }, [housingList]);

  const rentalTypesList = useMemo(() => {
    const types = new Set(
      housingList.map((item) => item.rentalType).filter(Boolean),
    );
    return Array.from(types);
  }, [housingList]);

  const filteredHousing = useMemo(() => {
    let result = [...housingList];

    if (searchTitle.trim()) {
      const query = searchTitle.toLowerCase();
      result = result.filter((item) =>
        item.title?.toLowerCase().includes(query),
      );
    }

    if (selectedRoomType !== "ALL") {
      result = result.filter((item) => item.roomType === selectedRoomType);
    }

    if (selectedRentalType !== "ALL") {
      result = result.filter((item) => item.rentalType === selectedRentalType);
    }

    if (depositSort !== "NONE") {
      result.sort((a, b) => {
        const depA = Number(a.deposit) || 0;
        const depB = Number(b.deposit) || 0;
        return depositSort === "ASC" ? depA - depB : depB - depA;
      });
    }

    return result;
  }, [
    housingList,
    searchTitle,
    selectedRoomType,
    selectedRentalType,
    depositSort,
  ]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading housing records...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Housing Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student accommodations, pricing, availability, and map links.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/admin/housing/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Housing
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <select
          value={selectedRoomType}
          onChange={(e) => setSelectedRoomType(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="ALL">All Room Types</option>
          {roomTypesList.map((type: any) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={selectedRentalType}
          onChange={(e) => setSelectedRentalType(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="ALL">All Rental Types</option>
          {rentalTypesList.map((type: any) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          onClick={() =>
            setDepositSort((prev) =>
              prev === "NONE" ? "ASC" : prev === "ASC" ? "DESC" : "NONE",
            )
          }
          className="flex items-center gap-1.5 bg-white border-slate-200"
        >
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          Deposit:{" "}
          {depositSort === "NONE"
            ? "Default"
            : depositSort === "ASC"
              ? "Low to High"
              : "High to Low"}
        </Button>

        {(searchTitle ||
          selectedRoomType !== "ALL" ||
          selectedRentalType !== "ALL" ||
          depositSort !== "NONE") && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Reset Filters
          </Button>
        )}
      </div>

      {filteredHousing.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500">
          {housingList.length === 0
            ? 'No housing records found. Click "Add Housing" to create one.'
            : "No housing records match your filter criteria."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHousing.map((item) => {
            const imageUrl = getPublicUrl(item.imageKey);

            const activeFacilities = Object.entries(item.facilities || {})
              .filter(([_, active]) => active)
              .map(([key]) =>
                key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase()),
              );

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition"
              >
                <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold tracking-tight">
                      {item.title}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-slate-200 border-slate-700 bg-slate-800/60 text-xs"
                    >
                      {item.roomType || "Room"}
                    </Badge>

                    <Badge
                      className={`text-xs ${
                        item.isAvailable
                          ? "bg-green-700 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {item.isAvailable ? "Available Now" : "Unavailable"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline mr-2">
                      ID: {item.id}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() =>
                        router.push(`/dashboard/admin/housing/${item.id}/edit`)
                      }
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="cursor-pointer h-8 text-xs bg-red-600/80 hover:bg-red-600 text-white"
                      disabled
                      onClick={() => handleDelete(item.id, item.imageKey)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start text-xs">
                  <div className="space-y-2 lg:border-r border-slate-100 lg:pr-3">
                    <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          No Photo
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">
                        Proximity
                      </p>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">
                        {item.locationInfo || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Pricing & Fees
                    </p>
                    <div className="space-y-1 text-[11px]">
                      <div className="bg-slate-50 p-1.5 rounded border flex justify-between items-center">
                        <span className="text-slate-500 text-[10px]">Rent</span>
                        <span className="font-bold text-slate-900">
                          ₩
                          {item.monthlyRent
                            ? Number(item.monthlyRent).toLocaleString()
                            : "0"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border flex justify-between items-center">
                        <span className="text-slate-500 text-[10px]">
                          Deposit
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₩
                          {item.deposit
                            ? Number(item.deposit).toLocaleString()
                            : "0"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border flex justify-between items-center">
                        <span className="text-slate-500 text-[10px]">
                          Maint. Fee
                        </span>
                        <span className="font-semibold text-slate-800">
                          ₩
                          {item.maintenanceFee
                            ? Number(item.maintenanceFee).toLocaleString()
                            : "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Specs & Location
                    </p>
                    <div className="bg-slate-50 p-2 rounded border space-y-1 text-[11px] text-slate-700">
                      <p>
                        <strong className="text-slate-900">Floor:</strong>{" "}
                        {item.floor || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Room Size:</strong>{" "}
                        {item.roomSize || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Elevator:</strong>{" "}
                        {item.elevator || "N/A"}
                      </p>
                      <p>
                        <strong className="text-slate-900">Type:</strong>{" "}
                        {item.rentalType || "N/A"}
                      </p>
                    </div>

                    {item.mapUrl && (
                      <a
                        href={item.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        <MapPin className="h-3 w-3" /> View on Map{" "}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-1.5 lg:border-r border-slate-100 lg:pr-3">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Facilities
                    </p>
                    <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto">
                      {activeFacilities.length > 0 ? (
                        activeFacilities.map((facility, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] bg-slate-100 text-slate-700 font-normal px-1.5 py-0.5"
                          >
                            <Check className="h-2.5 w-2.5 mr-0.5 text-green-600" />
                            {facility}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          None listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Important Notes
                    </p>
                    <div className="max-h-[140px] overflow-y-auto pr-1">
                      {item.notesList?.length > 0 ? (
                        <ul className="list-disc pl-3 text-slate-600 text-[10px] space-y-0.5">
                          {item.notesList.map((n: string, i: number) => (
                            <li key={i} className="line-clamp-2">
                              {n}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          No notes
                        </span>
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
