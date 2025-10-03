import React from "react";

export default function AnalyticsMetricCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow bg-white ${color || ''}`}>
      <div className="mr-4 text-3xl">{icon}</div>
      <div>
        <div className="text-gray-500 text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
