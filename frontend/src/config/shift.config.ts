/**
 * Aturan Shift Otomatis:
 * - Shift Malam: Mulai dari jam 20:00 (8 malam) hingga jam 06:59 (7 pagi)
 *   - Pukul 20:00 - 23:59: Shift Malam pada tanggal hari ini.
 *   - Pukul 00:00 - 06:59: Shift Malam (lanjutan operasional tanggal kemarin).
 * - Shift Pagi: Mulai dari jam 07:00 (7 pagi) hingga jam 19:59 (8 malam) pada tanggal hari ini.
 */
export function getAutoShiftAndDate(): { shift: 'Pagi' | 'Malam'; date: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const now = new Date();
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }

  const hour = parseInt(map.hour, 10);
  let shift: 'Pagi' | 'Malam';
  let dateStr = `${map.year}-${map.month}-${map.day}`;

  if (hour >= 20) {
    // 20:00 - 23:59 -> Shift Malam hari ini
    shift = 'Malam';
  } else if (hour < 7) {
    // 00:00 - 06:59 -> Shift Malam (lanjutan operasional shift malam kemarin)
    shift = 'Malam';
    const prevDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prevParts = formatter.formatToParts(prevDate);
    const prevMap: Record<string, string> = {};
    for (const p of prevParts) {
      prevMap[p.type] = p.value;
    }
    dateStr = `${prevMap.year}-${prevMap.month}-${prevMap.day}`;
  } else {
    // 07:00 - 19:59 -> Shift Pagi hari ini
    shift = 'Pagi';
  }

  return { shift, date: dateStr };
}

export function getDefaultShift(): 'Pagi' | 'Malam' {
  return getAutoShiftAndDate().shift;
}

export function getDefaultDateString(): string {
  return getAutoShiftAndDate().date;
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts.map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
