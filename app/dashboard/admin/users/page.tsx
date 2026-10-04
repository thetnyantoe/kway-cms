"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Ban, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: "finance" | "user" | string;
  createdAt?:
    | Timestamp
    | { seconds: number; nanoseconds: number }
    | string
    | Date;
}

export default function UserstablePage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortName, setSortName] = useState<string>("Default Name");
  const [sortDate, setSortDate] = useState<string>("Default Date");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList: UserData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateVal: any): string => {
    if (!dateVal) return "N/A";
    try {
      if (typeof dateVal?.toDate === "function") {
        return dateVal.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      if (dateVal?.seconds) {
        return new Date(dateVal.seconds * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return new Date(dateVal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getMillis = (dateVal: any): number => {
    if (!dateVal) return 0;
    if (typeof dateVal?.toDate === "function")
      return dateVal.toDate().getTime();
    if (dateVal?.seconds) return dateVal.seconds * 1000;
    return new Date(dateVal).getTime() || 0;
  };

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const userRole = u.role?.toLowerCase() || "";
        if (userRole === "admin" || userRole === "hr") {
          return false;
        }

        // Search Matching
        const nameMatch = u.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const emailMatch = u.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const phoneMatch = u.phone?.includes(searchTerm);
        const matchesSearch = nameMatch || emailMatch || phoneMatch;

        // Role Filter Matching
        const matchesRole = roleFilter === "all" || u.role === roleFilter;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        // Date Sort Priority
        if (sortDate === "Newest First") {
          return getMillis(b.createdAt) - getMillis(a.createdAt);
        }
        if (sortDate === "Oldest First") {
          return getMillis(a.createdAt) - getMillis(b.createdAt);
        }

        // Name Sort
        if (sortName === "Name (A-Z)") {
          return (a.name || "Unnamed").localeCompare(b.name || "Unnamed");
        }
        if (sortName === "Name (Z-A)") {
          return (b.name || "Unnamed").localeCompare(a.name || "Unnamed");
        }

        return 0;
      });
  }, [users, searchTerm, roleFilter, sortName, sortDate]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setSortName("Default Name");
    setSortDate("Default Date");
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "finance":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Finance
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            User
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 bg-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl tracking-tight text-gray-900 font-bolder">
            Users Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and manage account across this portal.
          </p>
        </div>
      </div>

      {/* Top Filtering Bar */}
      <div className="p-4 bg-[#f8fafc] border border-slate-200/80 rounded-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 w-full">
          {/* Search Input */}
          <div className="flex-1 space-y-1.5 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500">
              Search
            </label>
            <Input
              placeholder="Search by name, email or phone..."
              className="bg-white border-slate-300 h-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-[150px] space-y-1 shrink-0">
            <label className="text-xs font-semibold text-slate-500">Role</label>
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val ?? "all")}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9 w-full">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Name */}
          <div className="w-full md:w-[160px] space-y-1 shrink-0">
            <label className="text-xs font-semibold text-slate-500">
              Sort Name
            </label>
            <Select
              value={sortName}
              onValueChange={(val) => setSortName(val ?? "Default Name")}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9 w-full">
                <SelectValue placeholder="Default Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Default Name">Default Name</SelectItem>
                <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
                <SelectItem value="Name (Z-A)">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Date */}
          <div className="w-full md:w-[160px] space-y-1 shrink-0">
            <label className="text-xs font-semibold text-slate-500">
              Sort Date
            </label>
            <Select
              value={sortDate}
              onValueChange={(val) => setSortDate(val ?? "Default Date")}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9 w-full">
                <SelectValue placeholder="Default Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Default Date">Default Date</SelectItem>
                <SelectItem value="Newest First">Newest First</SelectItem>
                <SelectItem value="Oldest First">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters Button */}
          <div className="shrink-0 pt-1 md:pt-0">
            <Button
              variant="outline"
              className="cursor-pointer bg-white border-slate-300 hover:bg-slate-50 h-9 text-slate-800 font-medium whitespace-nowrap shadow-sm w-auto px-4"
              onClick={handleResetFilters}
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => {
                const displayName = user.name || "Unnamed User";
                const initials = displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50/60 transition"
                  >
                    {/* User Profile Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-gray-100 border">
                          <AvatarFallback className="text-xs font-semibold text-gray-700">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Cell */}
                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    {/* Phone Cell */}
                    <TableCell className="text-sm text-gray-600">
                      {user.phone || (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </TableCell>

                    {/* Member Since Cell */}
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Temporary Ban Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Temporary Ban"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>

                        {/* Complete Removal Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remove User Permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
