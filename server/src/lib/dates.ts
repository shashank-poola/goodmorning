/**
 * Returns RFC3339 bounds for "today" in the given IANA timezone.
 * Used as timeMin/timeMax when querying Google Calendar.
 */
export function todayWindow(timezone: string, now = new Date()): { timeMin: string; timeMax: string } {
  const ymd = formatYmd(now, timezone)
  return {
    timeMin: localToUtcIso(ymd, '00:00:00', timezone),
    timeMax: localToUtcIso(ymd, '23:59:59', timezone),
  }
}

function formatYmd(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date)
}

/** Map a wall-clock time in `timezone` on `ymd` to a UTC ISO string. */
function localToUtcIso(ymd: string, time: string, timezone: string): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const [hour, minute, second] = time.split(':').map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second)
  const offsetMs = timezoneOffsetMs(new Date(utcGuess), timezone)
  return new Date(utcGuess - offsetMs).toISOString()
}

function timezoneOffsetMs(date: Date, timezone: string): number {
  const inTz = partsInTimezone(date, timezone)
  const asUtc = Date.UTC(
    inTz.year,
    inTz.month - 1,
    inTz.day,
    inTz.hour,
    inTz.minute,
    inTz.second,
  )
  return asUtc - date.getTime()
}

function partsInTimezone(date: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0')

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  }
}
