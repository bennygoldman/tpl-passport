// District groupings come directly from the branch data — no ward mapping needed.

import branchData from '#data/updated-branch-info.json'
export const physicalBranches = branchData.filter(b => b.PhysicalBranch === 1)

export const DISTRICT_ORDER = [
  'Etobicoke-York',
  'North York',
  'Toronto-East York',
  'Scarborough',
]

export const DISTRICT_COLORS = {
  'Etobicoke-York':    '#c06b30',
  'North York':        '#7b50c8',
  'Toronto-East York': '#1a80a0',
  'Scarborough':       '#b84040',
}

export function getDistrictColor(district) {
  return DISTRICT_COLORS[district] ?? '#8c849e'
}
