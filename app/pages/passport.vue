<template>
  <main class="page-content">
    <header class="page-header">
      <div>
        <h1>Your Passport</h1>
        <p class="sub">{{ passport.visitCount }} of {{ physicalBranches.length }} stamps collected</p>
      </div>
    </header>

    <div v-for="region in REGION_ORDER" :key="region" class="region-section">
      <p class="section-label">{{ region }}</p>
      <div class="stamp-grid">
        <NuxtLink
          v-for="branch in byRegion[region] ?? []"
          :key="branch.BranchCode"
          :to="`/branch/${branch.BranchCode}`"
          class="stamp-slot"
          :class="{ 'stamp-slot--collected': passport.hasVisited(branch.BranchCode) }"
        >
          <div class="stamp-shape" :style="stampStyle(branch)">
            <div class="stamp-ring" :style="{ borderRadius: getStampShape(branch.BranchCode).borderRadius }" />
            <span class="stamp-code">{{ branch.BranchCode }}</span>
          </div>
          <span class="stamp-name">{{ branch.BranchName }}</span>
          <span v-if="passport.hasVisited(branch.BranchCode)" class="stamp-date">
            {{ visitDate(branch.BranchCode) }}
          </span>
          <span v-else class="stamp-unseen">not yet</span>
        </NuxtLink>
      </div>
    </div>

  </main>
</template>

<script setup>
import { usePassportStore } from '~/stores/passport'
import { useStampColor, getStampShape } from '~/composables/useStampColor'
import { physicalBranches, REGION_ORDER, getRegion } from '~/composables/useRegion'

const passport = usePassportStore()

const byRegion = computed(() => {
  const map = {}
  for (const region of REGION_ORDER) map[region] = []
  for (const b of physicalBranches) {
    const region = getRegion(b.WardNo)
    if (region) map[region].push(b)
  }
  return map
})

function stampStyle(branch) {
  const shape = getStampShape(branch.BranchCode)
  const base = {
    borderRadius: shape.borderRadius,
    width: shape.width,
    height: shape.height,
  }
  if (passport.hasVisited(branch.BranchCode)) {
    const { color, bg, border } = useStampColor(branch.WardNo)
    return { ...base, color, background: bg, borderColor: border }
  }
  return {
    ...base,
    color: 'var(--color-border)',
    background: 'transparent',
    borderColor: 'var(--color-border)',
  }
}

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

/* 2-column grid — stamps big enough to feel substantial */
.stamp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Each slot is a dashed cell, like a pre-printed spot on a passport page */
.stamp-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  color: var(--color-text);
  padding: 18px 10px 14px;
  border: 1.5px dashed var(--color-border);
  border-radius: 14px;
  transition: border-color 0.15s;
}

/* Collected slots switch to solid — the stamp has been placed */
.stamp-slot--collected {
  border-style: solid;
  border-color: var(--color-border-soft);
}

/* Shape container — width/height/border-radius all set inline per branch */
.stamp-shape {
  border: 2.5px solid currentColor;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.stamp-slot--collected .stamp-shape {
  box-shadow: 0 2px 12px color-mix(in srgb, currentColor 22%, transparent);
}

.stamp-slot--collected .stamp-shape:active {
  transform: scale(0.94) rotate(-2deg);
}

/* Inner dashed ring — mimics the impression line of a real rubber stamp */
.stamp-ring {
  position: absolute;
  inset: 6px;
  border: 1.5px dashed currentColor;
  opacity: 0.35;
}

.stamp-slot--collected .stamp-ring {
  border-style: solid;
  opacity: 0.22;
}

/* Library code — Roboto Condensed for that tight, official-label look */
.stamp-code {
  font-family: var(--font-stamp);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.stamp-name {
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  color: var(--color-text-mid);
  line-height: 1.3;
  max-width: 160px;
}

.stamp-slot:not(.stamp-slot--collected) .stamp-name {
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
