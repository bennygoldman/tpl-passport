<template>
  <main class="page-content">
    <header class="page-header">
      <h1>Explore</h1>
      <p class="sub">{{ filteredBranches.length }} {{ onlyUnvisited ? 'unvisited' : '' }} branches{{ onlyUnvisited ? ' left to go' : ' across Toronto' }}</p>
    </header>

    <div class="controls">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="query"
          type="search"
          placeholder="Search by name or neighbourhood…"
          class="search-input"
        />
      </div>

      <div class="sort-tabs">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="sort-tab"
          :class="{ 'sort-tab--active': sort === opt.value }"
          @click="sort = opt.value"
        >{{ opt.label }}</button>
        <button
          class="sort-tab sort-tab--pill"
          :class="{ 'sort-tab--active': onlyUnvisited }"
          @click="onlyUnvisited = !onlyUnvisited"
        >Not yet</button>
      </div>
    </div>

    <!-- Flat alphabetical list -->
    <ul v-if="sort === 'alpha'" class="branch-list">
      <li v-for="branch in filteredBranches" :key="branch.BranchCode">
        <BranchRow :branch="branch" />
      </li>
    </ul>

    <!-- Grouped by region -->
    <template v-else>
      <div v-for="region in visibleRegions" :key="region" class="region-group">
        <p class="section-label">{{ region }}</p>
        <ul class="branch-list">
          <li v-for="branch in byRegion[region]" :key="branch.BranchCode">
            <BranchRow :branch="branch" />
          </li>
        </ul>
      </div>
    </template>

  </main>
</template>

<script setup>
import { usePassportStore } from '~/stores/passport'
import { physicalBranches, REGION_ORDER, getRegion } from '~/composables/useRegion'

const passport      = usePassportStore()
const query         = ref('')
const sort          = ref('alpha')
const onlyUnvisited = ref(false)

const sortOptions = [
  { value: 'alpha',  label: 'A–Z' },
  { value: 'region', label: 'By area' },
]

const filteredBranches = computed(() => {
  let list = physicalBranches
  if (query.value) {
    const q = query.value.toLowerCase()
    list = list.filter(b =>
      b.BranchName.toLowerCase().includes(q) ||
      b.NBHDName?.toLowerCase().includes(q) ||
      b.Address?.toLowerCase().includes(q)
    )
  }
  if (onlyUnvisited.value) {
    list = list.filter(b => !passport.hasVisited(b.BranchCode))
  }
  if (sort.value === 'alpha') {
    return [...list].sort((a, b) => a.BranchName.localeCompare(b.BranchName))
  }
  return list
})

const byRegion = computed(() => {
  const map = {}
  for (const region of REGION_ORDER) map[region] = []
  for (const b of filteredBranches.value) {
    const r = getRegion(b.WardNo)
    if (r) map[r].push(b)
  }
  for (const r of REGION_ORDER) map[r].sort((a, b) => a.BranchName.localeCompare(b.BranchName))
  return map
})

const visibleRegions = computed(() =>
  REGION_ORDER.filter(r => byRegion.value[r]?.length > 0)
)
</script>

<style scoped>
.page-header {
  padding: 20px 0 14px;
}

.page-header h1 { margin-bottom: 3px; }

.sub {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.controls {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 1rem; /* 16px minimum prevents iOS Safari auto-zoom on focus */
  font-family: var(--font-body);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s;
}

.search-input:focus { border-color: var(--tpl-blue); }

.sort-tabs {
  display: flex;
  gap: 8px;
}

.sort-tab {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.sort-tab--active {
  background: var(--tpl-navy);
  border-color: var(--tpl-navy);
  color: #fff;
}

.region-group { margin-bottom: 24px; }

.branch-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
