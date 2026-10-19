"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { uploadFileToR2 } from "@/lib/r2-upload";

export interface HousingFormData {
  title: string;
  roomType: string;
  isAvailable: boolean;
  monthlyRent: string;
  deposit: string;
  maintenanceFee: string;
  locationInfo: string;
  floor: string;
  roomSize: string;
  elevator: string;
  rentalType: string;
  mapUrl: string;
  imageKey: string;
  facilities: Record<string, boolean>;
  customFacilities: string[];
  notesList: string[];
}

const initialValues: HousingFormData = {
  title: "",
  roomType: "",
  isAvailable: true,
  monthlyRent: "",
  deposit: "",
  maintenanceFee: "",
  locationInfo: "",
  floor: "",
  roomSize: "",
  elevator: "Yes",
  rentalType: "",
  mapUrl: "",
  imageKey: "",
  facilities: {
    airConditioner: false,
    bed: false,
    desk: false,
    wardrobe: false,
    shoeCabinet: false,
    refrigerator: false,
    washingMachine: false,
    kitchenSink: false,
    inductionCooktop: false,
    microwave: false,
  },
  customFacilities: [],
  notesList: [""],
};

const COMMON_ROOM_TYPES = [
  "One Room",
  "Two Room",
  "Three Room+",
  "Officetel",
  "Goshiwon",
  "Share House",
  "Studio Apartment",
];

const COMMON_RENTAL_TYPES = [
  "Monthly",
  "Yearly",
  "Short-term",
  "Weekly",
  "2 Weeks",
  "3 Weeks",
  "Daily",
];

interface HousingFormProps {
  initialData?: Partial<HousingFormData>;
  onSubmit: (data: HousingFormData) => Promise<void>;
  submitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export function HousingForm({
  initialData,
  onSubmit,
  submitting = false,
  onCancel,
  submitLabel = "Save Housing",
}: HousingFormProps) {
  const [formData, setFormData] = useState<HousingFormData>(initialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        title: initialData.title ?? "",
        roomType: initialData.roomType ?? "One Room",
        isAvailable: initialData.isAvailable ?? true,
        monthlyRent: initialData.monthlyRent ?? "",
        deposit: initialData.deposit ?? "",
        maintenanceFee: initialData.maintenanceFee ?? "",
        locationInfo: initialData.locationInfo ?? "",
        floor: initialData.floor ?? "",
        roomSize: initialData.roomSize ?? "",
        elevator: initialData.elevator ?? "Yes",
        rentalType: initialData.rentalType ?? "Monthly",
        mapUrl: initialData.mapUrl ?? "",
        imageKey: initialData.imageKey ?? "",
        facilities: { ...prev.facilities, ...(initialData.facilities || {}) },
        customFacilities: initialData.customFacilities ?? [],
        notesList:
          initialData.notesList && initialData.notesList.length > 0
            ? initialData.notesList
            : [""],
      }));
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (facilityKey: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facilityKey]: !prev.facilities[facilityKey],
      },
    }));
  };

  const handleAddCustomFacility = () => {
    if (!newFacilityName.trim()) return;
    const formattedKey = newFacilityName.trim();
    if (
      formData.facilities[formattedKey] !== undefined ||
      formData.customFacilities.includes(formattedKey)
    ) {
      alert("Facility already exists.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customFacilities: [...prev.customFacilities, formattedKey],
      facilities: {
        ...prev.facilities,
        [formattedKey]: true,
      },
    }));
    setNewFacilityName("");
  };

  const handleRemoveCustomFacility = (facilityKey: string) => {
    setFormData((prev) => {
      const updatedFacilities = { ...prev.facilities };
      delete updatedFacilities[facilityKey];
      return {
        ...prev,
        facilities: updatedFacilities,
        customFacilities: prev.customFacilities.filter(
          (f) => f !== facilityKey,
        ),
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAddNote = () => {
    setFormData((prev) => ({ ...prev, notesList: [...prev.notesList, ""] }));
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notesList: prev.notesList.filter((_, i) => i !== index),
    }));
  };

  const handleNoteChange = (index: number, value: string) => {
    const updated = [...formData.notesList];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, notesList: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      let currentImageKey = formData.imageKey;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const newKey = `housing/images_${Date.now()}.${fileExt}`;
        await uploadFileToR2(imageFile, newKey);

        if (formData.imageKey) {
          try {
            await fetch("/api/r2/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: formData.imageKey }),
            });
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
        currentImageKey = newKey;
      }

      await onSubmit({
        ...formData,
        imageKey: currentImageKey,
      });
    } catch (error) {
      console.error("Housing submission error:", error);
      alert("Failed to save housing record.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Housing Overview & Image</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Housing Title / Address Summary *
            </label>
            <Input
              name="title"
              required
              placeholder="e.g. Jongam-dong, Seongbuk-gu, Seoul"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Room Type *
            </label>
            <Input
              list="room-types-list"
              name="roomType"
              required
              placeholder="Select or type room type"
              value={formData.roomType}
              onChange={handleChange}
            />
            <datalist id="room-types-list">
              {COMMON_ROOM_TYPES.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-xs font-semibold text-slate-600 mb-2">
              Availability Status
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isAvailable: !prev.isAvailable,
                }))
              }
              className={`px-4 py-2 text-xs font-bold rounded-md transition cursor-pointer ${
                formData.isAvailable
                  ? "bg-green-800 text-white hover:bg-green-900"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {formData.isAvailable ? "Available Now" : "Currently Unavailable"}
            </button>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Housing Photo (JPG, PNG)
            </label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="cursor-pointer bg-white"
            />
            {formData.imageKey && !imageFile && (
              <p className="text-xs text-slate-400 mt-1">
                Current stored key: {formData.imageKey}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing & Fees (KRW)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Monthly Rent (₩) *
            </label>
            <Input
              type="number"
              name="monthlyRent"
              required
              placeholder="e.g. 450000"
              value={formData.monthlyRent}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Deposit (₩) *
            </label>
            <Input
              type="number"
              name="deposit"
              required
              placeholder="e.g. 3000000"
              value={formData.deposit}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Maintenance Fee (₩)
            </label>
            <Input
              type="number"
              name="maintenanceFee"
              placeholder="e.g. 150000"
              value={formData.maintenanceFee}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Specifications & Location Link
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Floor Level
            </label>
            <Input
              name="floor"
              placeholder="e.g. 3F / 5F"
              value={formData.floor}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Room Size
            </label>
            <Input
              name="roomSize"
              placeholder="e.g. 17 m²"
              value={formData.roomSize}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Elevator Available?
            </label>
            <select
              name="elevator"
              value={formData.elevator}
              onChange={handleChange}
              className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Rental Type
            </label>
            <Input
              list="rental-types-list"
              name="rentalType"
              placeholder="Select or type rental type"
              value={formData.rentalType}
              onChange={handleChange}
            />
            <datalist id="rental-types-list">
              {COMMON_RENTAL_TYPES.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Google Maps Share URL (For "View on Map" button)
            </label>
            <Input
              name="mapUrl"
              placeholder="https://maps.app.goo.gl/..."
              value={formData.mapUrl}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Proximity Description
            </label>
            <Input
              name="locationInfo"
              placeholder=""
              value={formData.locationInfo}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facilities Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {Object.keys(formData.facilities).map((key) => {
              const labelText = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              const isCustom = formData.customFacilities.includes(key);

              return (
                <div
                  key={key}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
                >
                  <label className="flex items-center space-x-2 cursor-pointer truncate flex-1">
                    <input
                      type="checkbox"
                      checked={formData.facilities[key]}
                      onChange={() => handleCheckboxChange(key)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700 truncate">
                      {labelText}
                    </span>
                  </label>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomFacility(key)}
                      className="text-red-500 hover:text-red-700 ml-1.5 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 max-w-md">
            <Input
              placeholder="Add other facility..."
              value={newFacilityName}
              onChange={(e) => setNewFacilityName(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomFacility}
              className="shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Important Notes (Bullet Points)
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNote}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Note
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.notesList.map((note, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">•</span>
              <Input
                placeholder="Enter note detail"
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => handleRemoveNote(index)}
                disabled={formData.notesList.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submission Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting || uploadingImage}
          className="cursor-pointer"
        >
          {uploadingImage
            ? "Uploading Image..."
            : submitting
              ? "Saving..."
              : submitLabel}
        </Button>
      </div>
    </form>
  );
}
