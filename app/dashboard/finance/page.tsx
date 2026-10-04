"use client";

import { useState } from "react";

export default function FinanceDashboardPage() {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");

  return <div>finance dashboard</div>;
}
