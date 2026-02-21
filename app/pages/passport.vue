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
          <template v-if="passport.hasVisited(branch.BranchCode)">
            <div class="stamp-shape" :style="stampStyle(branch)">
              <div class="stamp-ring" :style="{ borderRadius: getStampShape(branch.BranchCode).borderRadius }" />
              <span class="stamp-code">{{ branch.BranchCode }}</span>
            </div>
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
  const { color, bg, border } = useStampColor(branch.WardNo)
  return {
    borderRadius: shape.borderRadius,
    width: shape.width,
    height: shape.height,
    color,
    background: bg,
    borderColor: border,
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

/* Shared-border grid — cells share lines rather than each having their own box.
   Container owns the top and left edges; each cell owns its right and bottom edge. */
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

/* Shape container — width/height/border-radius all set inline per branch */
.stamp-shape {
  border: 2.5px solid currentColor;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 12px color-mix(in srgb, currentColor 22%, transparent);
}

.stamp-slot--collected .stamp-shape:active {
  transform: scale(0.94) rotate(-2deg);
}

/* Inner ring — mimics the impression line of a real rubber stamp */
.stamp-ring {
  position: absolute;
  inset: 6px;
  border: 1.5px solid currentColor;
  opacity: 0.22;
}

/* Library code — Roboto Condensed for that tight, official-label look */
.stamp-code {
  font-family: var(--font-stamp);
  font-size: 1.2rem;
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
