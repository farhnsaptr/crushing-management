/**
 * Aturan Shift Otomatis:
 * - Shift Malam: Mulai dari jam 20:00 (8 malam) hingga jam 06:59 (7 pagi)
 *   - Pukul 20:00 - 23:59: Shift Malam pada tanggal hari ini.
 *   - Pukul 00:00 - 06:59: Shift Malam (lanjutan operasional tanggal kemarin).
 * - Shift Pagi: Mulai dari jam 07:00 (7 pagi) hingga jam 19:59 (8 malam) pada tanggal hari ini.
 */
export function getAutoShiftAndDate(): { shift: 'Pagi' | 'Malam'; date: string } {
  const now = new Date();
  const hour = now.getHours();

  let shift: 'Pagi' | 'Malam';
  const targetDate = new Date(now);

  if (hour >= 20) {
    // 20:00 - 23:59 -> Shift Malam hari ini
    shift = 'Malam';
  } else if (hour < 7) {
    // 00:00 - 06:59 -> Shift Malam (lanjutan shift malam kemarin)
    shift = 'Malam';
    targetDate.setDate(targetDate.getDate() - 1);
  } else {
    // 07:00 - 19:59 -> Shift Pagi hari ini
    shift = 'Pagi';
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  return { shift, date };
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
