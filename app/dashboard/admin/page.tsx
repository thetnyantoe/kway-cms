import {
  Users,
  DollarSign,
  GraduationCap,
  Building2,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Revenue",
      value: "0 MMK",
      icon: DollarSign,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Users",
      value: "0",
      icon: Users,
      iconBg: "bg-teal-100 text-teal-600",
    },
    {
      title: "Universities",
      value: "0",
      icon: GraduationCap,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      title: "Houses",
      value: "0",
      icon: Building2,
      iconBg: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl tracking-tight text-[#0C3960] bitcount">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Overview of system performance and matrices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden transition-all hover:shadow-md"
            >
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 tracking-wide">
                  {stat.title}
                </p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </p>
              </div>

              {/* Icon Badge */}
              <div
                className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Revenue Trend
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Chart Placeholder
            </span>
          </div>
          <div className="flex-1 my-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">
              [ Revenue Trend Chart Area ]
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm min-h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Distribution</h2>
            <span className="text-xs text-slate-400 font-medium">
              Chart Placeholder
            </span>
          </div>
          <div className="flex-1 my-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">
              [ Distribution Chart Area ]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
