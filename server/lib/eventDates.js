// TPL events are listed by Toronto-local date (StartDateLocal). Computing
// "today" with toISOString() gives the UTC date, which is already tomorrow
// during Toronto evenings, so derive the day key in America/Toronto instead.
export const EVENTS_TIME_ZONE = 'America/Toronto'

export function torontoDayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENTS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = type => parts.find(p => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Calendar arithmetic on a YYYY-MM-DD key (no time zone involved).
export function addDays(dayKey, daysToAdd) {
  const base = new Date(`${dayKey}T00:00:00Z`)
  base.setUTCDate(base.getUTCDate() + daysToAdd)
  return base.toISOString().slice(0, 10)
}

export function eventDates(offsetDays, count, now = new Date()) {
  const start = addDays(torontoDayKey(now), offsetDays)
  return Array.from({ length: count }, (_, i) => addDays(start, i))
}
