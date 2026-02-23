<template>
  <main class="page-content">
    <header class="page-header">
      <div>
        <h1>Your Passport</h1>
        <p class="sub">{{ passport.visitCount }} of {{ physicalBranches.length }} stamps collected</p>
      </div>
    </header>

    <div v-for="region in DISTRICT_ORDER" :key="region" class="region-section">
      <p class="section-label">{{ region }}</p>
      <div class="stamp-grid">
        <NuxtLink
          v-for="branch in byRegion[region] ?? []"
          :key="branch.BranchCode"
          :to="`/branch/${branch.BranchCode}`"
          class="stamp-slot"
          :class="{ 'stamp-slot--collected': passport.hasVisited(branch.BranchCode) }"
        >
          <template v-if="passport.hasVisited(branch.BranchCode)">
            <StampShape :branchCode="branch.BranchCode" :wardNo="branch.WardNo" />
            <span class="stamp-name">{{ branch.BranchName }}</span>
            <span class="stamp-date">{{ visitDate(branch.BranchCode) }}</span>
          </template>
          <template v-else>
            <span class="stamp-name stamp-name--unseen">{{ branch.BranchName }}</span>
            <span class="stamp-unseen">not yet</span>
          </template>
        </NuxtLink>
      </div>
    </div>

  </main>
</template>

<script setup>
import { usePassportStore } from '~/stores/passport'
import { physicalBranches, DISTRICT_ORDER } from '~/composables/useRegion'

const passport = usePassportStore()

const byRegion = computed(() => {
  const map = {}
  for (const d of DISTRICT_ORDER) map[d] = []
  for (const b of physicalBranches) {
    if (b.District) map[b.District]?.push(b)
  }
  return map
})

function visitDate(branchCode) {
  const c = passport.checkIns.find(x => x.branchCode === branchCode)
  if (!c) return ''
  return new Date(c.timestamp).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.page-header {
  padding: 20px 0 18px;
}

.page-header h1 { margin-bottom: 4px; }

.sub {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Dashed separators between regions — passport page feel */
.region-section {
  padding-bottom: 24px;
  border-bottom: 1.5px dashed var(--color-border);
}

.region-section + .region-section {
  padding-top: 20px;
}

.region-section:last-child {
  border-bottom: none;
}

/* Shared-border grid — cells share lines rather than each having their own box. */
.stamp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border-top: 1.5px dashed var(--color-border);
  border-left: 1.5px dashed var(--color-border);
}

.stamp-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-text);
  padding: 20px 12px;
  border-right: 1.5px dashed var(--color-border);
  border-bottom: 1.5px dashed var(--color-border);
  min-height: 150px;
}

/* Press animation — uses --stamp-rotate from StampShape to preserve its tilt */
.stamp-slot--collected :deep(.stamp-shape):active {
  transform: scale(0.94) rotate(calc(var(--stamp-rotate, 0deg) - 2deg));
}

.stamp-name {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  color: var(--color-text-mid);
  line-height: 1.3;
  max-width: 160px;
}

.stamp-name--unseen {
  color: var(--color-text-muted);
}

.stamp-date {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stamp-unseen {
  font-size: 0.58rem;
  color: var(--color-border);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
