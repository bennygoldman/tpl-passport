// Shared signed-in state plus the sign-in / sign-out sync flows.
// Used by app.vue (app load and Google OAuth return), login.vue and settings.vue
// so all three paths reconcile local and server data the same way.

import * as Sentry from '@sentry/nuxt'
import { usePassportStore } from '~/stores/passport'
import { fetchCheckIns, pushCheckIn } from '~/composables/useCheckInSync'
import { fetchProfile, pushProfile } from '~/composables/useProfileSync'
import { clearPhotos } from '~/composables/usePhotoStore'
import { authClient } from '~/lib/auth-client'
import { reportError } from '~/lib/reportError'
import { reconcileCheckIns } from '~/lib/checkInSyncMerge'
import { reconcileProfile } from '~/lib/profileSyncMerge'

export function useSignedIn() {
  return useState<boolean>('auth:signedIn', () => false)
}

// Pull the server profile and check-ins into the local store and push up
// anything that only exists locally. Best-effort: failures are reported, not thrown.
export async function syncAccount(fallbackName = '') {
  const passport = usePassportStore()

  // user_profile is the source of truth for name + homeBranch.
  const serverProfile = await fetchProfile()
  const { nextName, nextHomeBranch, shouldPushHomeBranch } = reconcileProfile(
    passport.profile,
    serverProfile,
    fallbackName,
  )
  passport.profile.name = nextName
  passport.profile.homeBranch = nextHomeBranch
  if (shouldPushHomeBranch) {
    await pushProfile({ name: passport.profile.name, homeBranch: passport.profile.homeBranch })
  }

  try {
    const serverCheckIns = await fetchCheckIns()
    const { merged, localOnly } = reconcileCheckIns(serverCheckIns, passport.checkIns)
    passport.setCheckIns(merged)
    for (const ci of localOnly) void pushCheckIn(ci)
  } catch (error) {
    reportError(error, { area: 'sync', operation: 'checkin_merge' })
  }
}

// Sign out and wipe this device's copy of the account's data so it can't be
// merged into the next account that signs in here. The data stays on the server.
export async function signOutAndClear() {
  const signedIn = useSignedIn()
  const passport = usePassportStore()
  // The PostHog plugin is plain JS (provides null in dev), so type it here.
  const { $posthog } = useNuxtApp() as unknown as {
    $posthog: { capture: (event: string) => void, reset: () => void } | null
  }

  await authClient.signOut()
  // Flip the flag before clearing so sync watchers don't push the cleared profile.
  signedIn.value = false
  passport.clearLocalData()
  try {
    await clearPhotos()
  } catch (error) {
    reportError(error, { area: 'persistence', operation: 'clear_photos' })
  }

  $posthog?.capture('signed_out')
  $posthog?.reset()
  Sentry.setUser(null)
}
