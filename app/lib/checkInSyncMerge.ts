import { localDayKey } from '@tpl-passport/shared'
import type { PassportCheckIn } from '~/types/passport'

function timestampMs(value: string): number {
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? 0 : ms
}

function branchDayKey(checkIn: PassportCheckIn): string {
  return `${checkIn.branchCode}|${localDayKey(checkIn.timestamp)}`
}

// Merges server and local check-ins.
// - Server wins when both have the same timestamp.
// - A local-only check-in for a branch + day the server already has (e.g. the
//   same visit recorded on two devices) is dropped rather than pushed, matching
//   the one-stamp-per-branch-per-day rule in the store. Its note/photo are kept
//   on the server record if the server copy has none.
// - Remaining local-only records are returned so the caller can push them up.
export function reconcileCheckIns(
  serverCheckIns: PassportCheckIn[],
  localCheckIns: PassportCheckIn[],
) {
  const serverTimestamps = new Set(serverCheckIns.map(c => c.timestamp))
  const serverByDay = new Map<string, PassportCheckIn>()
  const mergedServer = serverCheckIns.map((c) => {
    const copy = { ...c }
    if (!serverByDay.has(branchDayKey(copy))) serverByDay.set(branchDayKey(copy), copy)
    return copy
  })

  const localOnly: PassportCheckIn[] = []
  for (const local of localCheckIns) {
    if (serverTimestamps.has(local.timestamp)) continue
    const sameDay = serverByDay.get(branchDayKey(local))
    if (sameDay) {
      if (!sameDay.note?.trim() && local.note?.trim()) sameDay.note = local.note
      if (!sameDay.hasPhoto && local.hasPhoto) {
        sameDay.hasPhoto = true
        if (local.photoUri) sameDay.photoUri = local.photoUri
      }
      continue
    }
    localOnly.push(local)
  }

  const merged = [...mergedServer, ...localOnly]
    .sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp))

  return { merged, localOnly }
}
