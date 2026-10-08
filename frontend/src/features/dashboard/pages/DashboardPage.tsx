import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard, MONTH_OPTIONS } from '../hooks/useDashboard';
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { DailyRecycleChart } from '../components/DailyRecycleChart';
import { ParetoMaterialTable } from '../components/ParetoMaterialTable';
import { TopNgPartsTable } from '../components/TopNgPartsTable';
import { DepartmentParetoTable } from '../components/DepartmentParetoTable';
import { SenderDashboardView } from '../components/SenderDashboardView';
import { DashboardToolbar } from '../components/DashboardToolbar';
import { RotateDeviceOverlay } from '../components/RotateDeviceOverlay';
import '../dashboard.css';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    locations,
    selectedLocation,
    setSelectedLocation,
    summaryStats,
    dailyChart,
    paretoMaterials,
    topParts,
    departmentPareto,
    senderStats,
    isLoading,
    fetchDashboardData,
  } = useDashboard();

  // If logged-in user is 'pengirim', render personalized Sender Dashboard View
  if (user?.role === 'pengirim') {
    return (
      <SenderDashboardView
        user={user}
        stats={senderStats}
        isLoading={isLoading}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthOptions={MONTH_OPTIONS}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
    );
  }

  // Formatted date text for toolbar (e.g. "Jum'at, 31 Juli 2026")
  const formattedTodayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="dash-root">
      {/* HP vertikal: dashboard di-blur & user diminta memutar ke landscape (diatur CSS) */}
      <RotateDeviceOverlay />
      <div className="dash-page">
        {/* Toolbar satu baris: judul, filter, info user */}
        <DashboardToolbar
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          monthOptions={MONTH_OPTIONS}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onRefresh={fetchDashboardData}
          dateText={formattedTodayDate}
          userText={`${user?.full_name || user?.username || 'User'} (${user?.role.toUpperCase()})`}
        />

        {/* KPI: Scrap, Input, Output, Gap */}
        <DashboardMetricCards summary={summaryStats} isLoading={isLoading} />

        {/* Grafik harian (mengisi sisa tinggi layar) */}
        <DailyRecycleChart
          data={dailyChart}
          isLoading={isLoading}
          monthLabel={MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || 'Bulan'}
          year={selectedYear}
        />

        {/* Tiga tabel berdampingan: Pareto Departemen, Part NG Terbanyak, Pareto Material */}
        <div className="dash-tables">
          <DepartmentParetoTable data={departmentPareto} isLoading={isLoading} />
          <TopNgPartsTable data={topParts} isLoading={isLoading} />
          <ParetoMaterialTable data={paretoMaterials} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
