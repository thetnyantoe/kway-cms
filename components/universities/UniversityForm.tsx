"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, Check } from "lucide-react";
import { uploadFileToR2 } from "@/lib/r2-upload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface MajorPair {
  title: string;
  description: string;
}

export interface FeePair {
  program: string;
  fee: string;
}

export interface IntakePair {
  term: string;
  detail: string;
}

export interface UniversityFormData {
  name: string;
  locationShort: string;
  bannerKey: string;
  d2ApplicationFee: string;
  scholarship: string;
  intake: string;
  about: string;
  locationDescription: string;
  d4ApplicationPeriod: string;
  d4TuitionFee: string;
  d4ApplyFee: string;
  d4DormitoryRent: string;
  d4ShowMoney: string;

  majors: MajorPair[];
  d2TuitionFees: FeePair[];
  estimatedCost: string;
  intakesList: IntakePair[];

  scholarshipsList: string[];
  dormitoriesList: string[];
  notesList: string[];
}

const initialValues: UniversityFormData = {
  name: "",
  locationShort: "",
  bannerKey: "",
  d2ApplicationFee: "",
  scholarship: "",
  intake: "",
  about: "",
  locationDescription: "",
  d4ApplicationPeriod: "",
  d4TuitionFee: "",
  d4ApplyFee: "",
  d4DormitoryRent: "",
  d4ShowMoney: "",
  majors: [{ title: "", description: "" }],
  d2TuitionFees: [{ program: "", fee: "" }],
  estimatedCost: "",
  intakesList: [{ term: "", detail: "" }],
  scholarshipsList: [""],
  dormitoriesList: [""],
  notesList: [""],
};

const KOREAN_CITIES = [
  "Seoul (Gangnam)",
  "Seoul (Mapo)",
  "Seoul (Jongno)",
  "Seoul (Jung-gu)",
  "Seoul (Songpa)",
  "Seoul (Yongsan)",
  "Seoul (Seodaemun)",
  "Seoul (Dongdaemun)",
  "Seoul (Gwanak)",
  "Seoul (Seongbuk)",
  "Busan (Nam-gu)",
  "Busan (Haeundae)",
  "Busan (Busanjin)",
  "Busan (Geumjeong)",
  "Busan (Saha)",
  "Incheon (Yeonsu)",
  "Incheon (Namdong)",
  "Incheon (Bupyeong)",
  "Incheon (Seo-gu)",
  "Incheon (Michuhol)",
  "Daegu (Suseong)",
  "Daegu (Jung-gu)",
  "Daegu (Dalseo)",
  "Daegu (Buk-gu)",
  "Daegu (Dong-gu)",
  "Daejeon (Yuseong)",
  "Daejeon (Seo-gu)",
  "Daejeon (Jung-gu)",
  "Daejeon (Daedeok)",
  "Daejeon (Dong-gu)",
  "Gwangju (Buk-gu)",
  "Gwangju (Seo-gu)",
  "Gwangju (Nam-gu)",
  "Gwangju (Gwangsan)",
  "Gwangju (Dong-gu)",
  "Ulsan (Nam-gu)",
  "Ulsan (Jung-gu)",
  "Ulsan (Buk-gu)",
  "Ulsan (Ulju)",
  "Ulsan (Dong-gu)",
  "Suwon",
  "Goyang",
  "Yongin",
  "Seongnam",
  "Bucheon",
  "Ansan",
  "Anyang",
  "Namyangju",
  "Hwaseong",
  "Pyeongtaek",
  "Uijeongbu",
  "Siheung",
  "Paju",
  "Gimpo",
  "Gwangmyeong",
  "Gwangju (Gyeonggi)",
  "Gunpo",
  "Osan",
  "Icheon",
  "Yangju",
  "Anseong",
  "Guri",
  "Pocheon",
  "Uiwang",
  "Hanam",
  "Yeoju",
  "Dongducheon",
  "Gwacheon",
  "Cheongju",
  "Chungju",
  "Jecheon",
  "Cheonan",
  "Asan",
  "Seosan",
  "Dangjin",
  "Gongju",
  "Boryeong",
  "Nonsan",
  "Jeonju",
  "Gunsan",
  "Iksan",
  "Jeongeup",
  "Namwon",
  "Gimje",
  "Mokpo",
  "Yeosu",
  "Suncheon",
  "Naju",
  "Gwangyang",
  "Pohang",
  "Gyeongju",
  "Gimcheon",
  "Andong",
  "Gumi",
  "Yeongju",
  "Sangju",
  "Mungyeong",
  "Gyeongsan",
  "Changwon",
  "Jinju",
  "Tongyeong",
  "Sacheon",
  "Gimhae",
  "Miryang",
  "Geoje",
  "Yangsan",
  "Jeju",
  "Seogwipo",
];

const COMMON_MAJORS = [
  "Business Administration",
  "Computer Science",
  "Economics & Finance",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Medicine",
  "Nursing",
  "International Relations",
  "Hotel & Tourism Management",
  "Law",
  "Architecture",
  "Fine Arts",
  "Mass Communication",
  "Design",
];

interface UniversityFormProps {
  initialData?: Partial<UniversityFormData>;
  onSubmit: (data: UniversityFormData) => Promise<void>;
  submitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export function UniversityForm({
  initialData,
  onSubmit,
  submitting = false,
  onCancel,
  submitLabel = "Save University",
}: UniversityFormProps) {
  const [formData, setFormData] = useState<UniversityFormData>(initialValues);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        name: initialData.name ?? "",
        locationShort: initialData.locationShort ?? "",
        bannerKey: initialData.bannerKey ?? "",
        d2ApplicationFee: initialData.d2ApplicationFee ?? "",
        scholarship: initialData.scholarship ?? "",
        intake: initialData.intake ?? "",
        about: initialData.about ?? "",
        locationDescription: initialData.locationDescription ?? "",
        d4ApplicationPeriod: initialData.d4ApplicationPeriod ?? "",
        d4TuitionFee: initialData.d4TuitionFee ?? "",
        d4ApplyFee: initialData.d4ApplyFee ?? "",
        d4DormitoryRent: initialData.d4DormitoryRent ?? "",
        d4ShowMoney: initialData.d4ShowMoney ?? "",
        estimatedCost: initialData.estimatedCost ?? "",
        majors:
          initialData.majors && initialData.majors.length > 0
            ? initialData.majors
            : [{ title: "", description: "" }],
        d2TuitionFees:
          initialData.d2TuitionFees && initialData.d2TuitionFees.length > 0
            ? initialData.d2TuitionFees
            : [{ program: "", fee: "" }],
        intakesList:
          initialData.intakesList && initialData.intakesList.length > 0
            ? initialData.intakesList
            : [{ term: "", detail: "" }],
        scholarshipsList:
          initialData.scholarshipsList &&
          initialData.scholarshipsList.length > 0
            ? initialData.scholarshipsList
            : [""],
        dormitoriesList:
          initialData.dormitoriesList && initialData.dormitoriesList.length > 0
            ? initialData.dormitoriesList
            : [""],
        notesList:
          initialData.notesList && initialData.notesList.length > 0
            ? initialData.notesList
            : [""],
      }));
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleAddMajor = () =>
    setFormData((prev) => ({
      ...prev,
      majors: [...prev.majors, { title: "", description: "" }],
    }));
  const handleRemoveMajor = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      majors: prev.majors.filter((_, i) => i !== index),
    }));
  const handleMajorChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const updated = [...formData.majors];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, majors: updated }));
  };

  const handleAddFee = () =>
    setFormData((prev) => ({
      ...prev,
      d2TuitionFees: [...prev.d2TuitionFees, { program: "", fee: "" }],
    }));
  const handleRemoveFee = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      d2TuitionFees: prev.d2TuitionFees.filter((_, i) => i !== index),
    }));
  const handleFeeChange = (
    index: number,
    field: "program" | "fee",
    value: string,
  ) => {
    const updated = [...formData.d2TuitionFees];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, d2TuitionFees: updated }));
  };

  const handleAddIntake = () =>
    setFormData((prev) => ({
      ...prev,
      intakesList: [...prev.intakesList, { term: "", detail: "" }],
    }));
  const handleRemoveIntake = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      intakesList: prev.intakesList.filter((_, i) => i !== index),
    }));
  const handleIntakeChange = (
    index: number,
    field: "term" | "detail",
    value: string,
  ) => {
    const updated = [...formData.intakesList];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, intakesList: updated }));
  };

  const handleAddStringItem = (
    listKey: "scholarshipsList" | "dormitoriesList" | "notesList",
  ) =>
    setFormData((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), ""],
    }));
  const handleRemoveStringItem = (
    listKey: "scholarshipsList" | "dormitoriesList" | "notesList",
    index: number,
  ) =>
    setFormData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((_, i) => i !== index),
    }));
  const handleStringItemChange = (
    listKey: "scholarshipsList" | "dormitoriesList" | "notesList",
    index: number,
    value: string,
  ) => {
    const updated = [...(formData[listKey] || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [listKey]: updated }));
  };

  const filteredCities = useMemo(() => {
    return KOREAN_CITIES.filter((city) =>
      city.toLowerCase().includes(citySearch.toLowerCase()),
    );
  }, [citySearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      let currentBannerKey = formData.bannerKey;

      if (bannerFile) {
        const fileExt = bannerFile.name.split(".").pop() || "jpg";
        const newBannerKey = `universities/banners_${Date.now()}.${fileExt}`;

        await uploadFileToR2(bannerFile, newBannerKey);

        if (formData.bannerKey) {
          try {
            await fetch("/api/r2/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: formData.bannerKey }),
            });
          } catch (deleteErr) {
            console.error("Failed to clean up old banner from R2:", deleteErr);
          }
        }

        currentBannerKey = newBannerKey;
      }

      await onSubmit({
        ...formData,
        bannerKey: currentBannerKey,
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to upload image or save record.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Header Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Basic Details & Banner Image
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              University Name *
            </label>
            <Input
              name="name"
              required
              placeholder="Enter university name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-xs font-semibold text-slate-600">
              Location Summary (City) *
            </label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger className="w-full flex items-center justify-between px-3 py-2 text-sm font-normal bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400">
                <span>{formData.locationShort || "Select city..."}</span>
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search city..."
                    value={citySearch}
                    onValueChange={setCitySearch}
                  />
                  <CommandList className="max-h-[200px] overflow-y-auto">
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              locationShort: city,
                            }));
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.locationShort === city
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Upload Banner Image (JPG, PNG)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="cursor-pointer bg-white"
              />
            </div>
            {formData.bannerKey && !bannerFile && (
              <p className="text-xs text-slate-400 mt-1">
                Current stored key: {formData.bannerKey}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Metric Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Metric Summaries</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              D2 Application Fee
            </label>
            <Input
              type="number"
              name="d2ApplicationFee"
              placeholder="Enter fee amount"
              value={formData.d2ApplicationFee}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Scholarship
            </label>
            <Input
              name="scholarship"
              placeholder="Enter scholarship summary"
              value={formData.scholarship}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Intake
            </label>
            <Input
              name="intake"
              placeholder="Enter intake terms"
              value={formData.intake}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              About University
            </label>
            <Textarea
              name="about"
              rows={3}
              placeholder="Enter overview details"
              value={formData.about}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Location Details
            </label>
            <Textarea
              name="locationDescription"
              rows={3}
              placeholder="Enter address and transit info"
              value={formData.locationDescription}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* D4 Language Program Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">D4 Language Program Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Application Period
            </label>
            <Input
              name="d4ApplicationPeriod"
              placeholder="Enter application dates"
              value={formData.d4ApplicationPeriod}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Tuition Fee
              </label>
              <Input
                type="number"
                name="d4TuitionFee"
                placeholder="Enter tuition amount"
                value={formData.d4TuitionFee}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Apply Fee
              </label>
              <Input
                type="number"
                name="d4ApplyFee"
                placeholder="Enter application fee"
                value={formData.d4ApplyFee}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Dormitory Rent (3-months)
              </label>
              <Input
                name="d4DormitoryRent"
                placeholder="Enter room rent details"
                value={formData.d4DormitoryRent}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Show Money Requirement
              </label>
              <Input
                type="number"
                name="d4ShowMoney"
                placeholder="Enter show money amount"
                value={formData.d4ShowMoney}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Majors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Available Majors (D-2)</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMajor}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Major
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.majors.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 items-start">
                <div className="space-y-1">
                  <Input
                    list={`majors-list-${index}`}
                    placeholder="Select or type major title"
                    value={item.title}
                    onChange={(e) =>
                      handleMajorChange(index, "title", e.target.value)
                    }
                  />
                  <datalist id={`majors-list-${index}`}>
                    {COMMON_MAJORS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <Textarea
                  rows={2}
                  placeholder="Major description"
                  value={item.description}
                  onChange={(e) =>
                    handleMajorChange(index, "description", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRemoveMajor(index)}
                disabled={formData.majors.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* D2 Tuition Fee Per Semester */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            D-2 Tuition Fee Per Semester
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFee}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Fee Row
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.d2TuitionFees.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <Input
                  placeholder="Program name"
                  value={item.program}
                  onChange={(e) =>
                    handleFeeChange(index, "program", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Fee amount"
                  value={item.fee}
                  onChange={(e) =>
                    handleFeeChange(index, "fee", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRemoveFee(index)}
                disabled={formData.d2TuitionFees.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estimated Cost */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Estimated Total Cost (1 Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            name="estimatedCost"
            placeholder="Enter total estimated cost amount"
            value={formData.estimatedCost}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      {/* Admission Schedule / Intakes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Admission Schedule / Intakes
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddIntake}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Intake
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.intakesList.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                <Input
                  placeholder="Term name"
                  value={item.term}
                  onChange={(e) =>
                    handleIntakeChange(index, "term", e.target.value)
                  }
                />
                <Input
                  placeholder="Term details"
                  value={item.detail}
                  onChange={(e) =>
                    handleIntakeChange(index, "detail", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRemoveIntake(index)}
                disabled={formData.intakesList.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scholarships */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Scholarships</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddStringItem("scholarshipsList")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Scholarship
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.scholarshipsList.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">•</span>
              <Input
                placeholder="Enter scholarship info"
                value={item}
                onChange={(e) =>
                  handleStringItemChange(
                    "scholarshipsList",
                    index,
                    e.target.value,
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() =>
                  handleRemoveStringItem("scholarshipsList", index)
                }
                disabled={formData.scholarshipsList.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dormitory Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Dormitory</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddStringItem("dormitoriesList")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Dormitory Info
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.dormitoriesList.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">•</span>
              <Input
                placeholder="Enter dormitory info"
                value={item}
                onChange={(e) =>
                  handleStringItemChange(
                    "dormitoriesList",
                    index,
                    e.target.value,
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRemoveStringItem("dormitoriesList", index)}
                disabled={formData.dormitoriesList.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Note</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddStringItem("notesList")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Note
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(formData.notesList || [""]).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-slate-400 font-bold">•</span>
              <Input
                placeholder="Enter note detail"
                value={item}
                onChange={(e) =>
                  handleStringItemChange("notesList", index, e.target.value)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRemoveStringItem("notesList", index)}
                disabled={(formData.notesList || []).length <= 1}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting || uploadingImage}>
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
