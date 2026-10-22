import React, { useMemo, useState } from 'react';
import type { SenderDailyActivity } from '../types/crushingRequests.types';

interface ActivityHeatmapProps {
  activities?: SenderDailyActivity[];
  totalSubmissions?: number;
  totalWeightKg?: number;
  activeDays?: number;
  isLoading?: boolean;
  months?: number;
  onMonthsChange?: (months: number) => void;
  title?: string;
}

interface CalendarDay {
  dateString: string;
  dateObj: Date;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  weekIndex: number;
  activity?: SenderDailyActivity;
  level: 0 | 1 | 2 | 3 | 4;
}

const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities = [],
  totalSubmissions,
  totalWeightKg,
  activeDays,
  isLoading = false,
  months = 6,
  onMonthsChange,
  title = 'Aktivitas Pengiriman Tiket',
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    day: CalendarDay;
    x: number;
    y: number;
  } | null>(null);

  // Map activities by date string YYYY-MM-DD
  const activityMap = useMemo(() => {
    const map = new Map<string, SenderDailyActivity>();
    for (const act of activities) {
      // Normalize to YYYY-MM-DD
      const dateKey = act.date.slice(0, 10);
      map.set(dateKey, act);
    }
    return map;
  }, [activities]);

  // Compute date grid: past N months until today
  const { weeks, monthHeaders } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - months);
    startDate.setDate(1); // Start from 1st of that month
    startDate.setHours(0, 0, 0, 0);

    // Adjust start date to previous Sunday so the first column starts with Sunday
    const startDayOfWeek = startDate.getDay();
    const alignedStartDate = new Date(startDate);
    alignedStartDate.setDate(alignedStartDate.getDate() - startDayOfWeek);

    const weeksList: CalendarDay[][] = [];
    const monthHeaderList: { monthLabel: string; weekIndex: number }[] = [];

    let currentWeek: CalendarDay[] = [];
    const iter = new Date(alignedStartDate);
    let weekIdx = 0;
    let lastMonth = -1;

    while (iter <= today || iter.getDay() !== 0) {
      const dayOfWeek = iter.getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksList.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      // Check if month changes in this week
      const currentMonth = iter.getMonth();
      if (currentMonth !== lastMonth && iter >= startDate && iter <= today) {
        monthHeaderList.push({
          monthLabel: MONTH_NAMES_ID[currentMonth],
          weekIndex: weekIdx,
        });
        lastMonth = currentMonth;
      }

      const dateStr = iter.toISOString().slice(0, 10);
      const act = activityMap.get(dateStr);
      const count = act?.count || 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      currentWeek.push({
        dateString: dateStr,
        dateObj: new Date(iter),
        dayOfWeek,
        weekIndex: weekIdx,
        activity: act,
        level,
      });

      iter.setDate(iter.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeksList.push(currentWeek);
    }

    return { weeks: weeksList, monthHeaders: monthHeaderList };
  }, [months, activityMap]);

  // Color mapping matching GitHub Light Mode
  const getCellColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return '#9be9a8';
      case 2:
        return '#40c463';
      case 3:
        return '#30a14e';
      case 4:
        return '#216e39';
      case 0:
      default:
        return '#ebedf0';
    }
  };

  const computedTotalSubs = totalSubmissions !== undefined
    ? totalSubmissions
    : activities.reduce((sum, a) => sum + (a.count || 0), 0);

  const computedTotalWeight = totalWeightKg !== undefined
    ? totalWeightKg
    : activities.reduce((sum, a) => sum + Number(a.total_weight_kg || 0), 0);

  const computedActiveDays = activeDays !== undefined
    ? activeDays
    : activities.filter((a) => (a.count || 0) > 0).length;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        padding: '1.15rem 1.25rem',
        color: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{title}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                }}
              >
                {months} Bulan Terakhir
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>{computedTotalSubs}</span> tiket diajukan •{' '}
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{computedTotalWeight.toFixed(1)} kg</span> total berat •{' '}
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{computedActiveDays}</span> hari aktif
            </div>
          </div>
        </div>

        {/* Range Selector Toggle (6 Bulan / 12 Bulan) */}
        {onMonthsChange && (
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}
          >
            <button
              type="button"
              onClick={() => onMonthsChange(6)}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: months === 6 ? 800 : 600,
                color: months === 6 ? '#0f172a' : '#64748b',
                backgroundColor: months === 6 ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: months === 6 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              6 Bulan
            </button>
            <button
              type="button"
              onClick={() => onMonthsChange(12)}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: months === 12 ? 800 : 600,
                color: months === 12 ? '#0f172a' : '#64748b',
                backgroundColor: months === 12 ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: months === 12 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              1 Tahun
            </button>
          </div>
        )}
      </div>

      {/* Heatmap Matrix View */}
      {isLoading ? (
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          Memuat riwayat heatmap pengiriman...
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '0.4rem', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 'max-content' }}>
            {/* Month labels row */}
            <div style={{ display: 'flex', height: '18px', marginBottom: '4px', marginLeft: '32px', position: 'relative' }}>
              {monthHeaders.map((header, idx) => {
                // Width per week is 10px cell + 3px gap = 13px
                const leftPos = header.weekIndex * 13;
                return (
                  <span
                    key={`${header.monthLabel}-${idx}`}
                    style={{
                      position: 'absolute',
                      left: `${leftPos}px`,
                      fontSize: '10px',
                      color: '#64748b',
                      fontWeight: 600,
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header.monthLabel}
                  </span>
                );
              })}
            </div>

            {/* Main grid with day labels on left */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {/* Day of week labels: Mon, Wed, Fri */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '32px',
                  marginRight: '4px',
                  fontSize: '10px',
                  color: '#64748b',
                  userSelect: 'none',
                  lineHeight: '10px',
                }}
              >
                {/* 7 rows: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat */}
                <div style={{ height: '10px', marginBottom: '3px' }} />
                <div style={{ height: '10px', marginBottom: '3px', fontWeight: 600 }}>Mon</div>
                <div style={{ height: '10px', marginBottom: '3px' }} />
                <div style={{ height: '10px', marginBottom: '3px', fontWeight: 600 }}>Wed</div>
                <div style={{ height: '10px', marginBottom: '3px' }} />
                <div style={{ height: '10px', marginBottom: '3px', fontWeight: 600 }}>Fri</div>
                <div style={{ height: '10px', marginBottom: '3px' }} />
              </div>

              {/* Weeks columns */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {weeks.map((week, wIdx) => (
                  <div
                    key={`week-${wIdx}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
                  >
                    {/* Render each day of the week (0 to 6) */}
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                      const day = week.find((d) => d.dayOfWeek === dayIdx);
                      if (!day) {
                        return (
                          <div
                            key={`empty-${dayIdx}`}
                            style={{ width: '10px', height: '10px' }}
                          />
                        );
                      }

                      const isHovered = hoveredDay?.day.dateString === day.dateString;

                      return (
                        <div
                          key={day.dateString}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              day,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: getCellColor(day.level),
                            borderRadius: '2px',
                            outline: isHovered
                              ? '1.5px solid #0f172a'
                              : day.level === 0
                              ? '1px solid rgba(27, 31, 35, 0.08)'
                              : 'none',
                            outlineOffset: isHovered ? '-0.5px' : '0px',
                            cursor: 'pointer',
                            transition: 'outline 0.1s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row / Legend matching user screenshot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '11px',
          color: '#64748b',
          paddingTop: '0.25rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <span style={{ cursor: 'default', fontWeight: 500 }}>
          Frekuensi pengiriman per hari
        </span>

        {/* Legend: Less [0][1][2][3][4] More */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Less</span>
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#ebedf0',
              borderRadius: '2px',
              border: '1px solid rgba(27, 31, 35, 0.1)',
            }}
            title="0 pengajuan"
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#9be9a8',
              borderRadius: '2px',
            }}
            title="1 pengajuan"
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#40c463',
              borderRadius: '2px',
            }}
            title="2 pengajuan"
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#30a14e',
              borderRadius: '2px',
            }}
            title="3-4 pengajuan"
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#216e39',
              borderRadius: '2px',
            }}
            title="5+ pengajuan"
          />
          <span>More</span>
        </div>
      </div>

      {/* Floating Tooltip with high contrast */}
      {hoveredDay && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '0.45rem 0.65rem',
            color: '#f8fafc',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.15rem' }}>
            {hoveredDay.day.dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          {hoveredDay.day.activity && hoveredDay.day.activity.count > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', color: '#cbd5e1' }}>
              <div>
                <strong style={{ color: '#4ade80' }}>{hoveredDay.day.activity.count}</strong> tiket diajukan
              </div>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                {Number(hoveredDay.day.activity.total_weight_kg || 0).toFixed(1)} kg • {hoveredDay.day.activity.total_pcs || 0} pcs
              </div>
            </div>
          ) : (
            <div style={{ color: '#94a3b8' }}>Tidak ada pengiriman</div>
          )}
        </div>
      )}
    </div>
  );
};
