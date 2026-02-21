// Each Toronto ward maps to a distinct ink colour for its stamps.
// We rotate through a palette of 10 hues across 25 wards.
const HUES = [350, 22, 43, 165, 215, 275, 130, 190, 310, 55]

export function useStampColor(wardNo) {
  const idx = ((parseInt(wardNo) || 1) - 1) % HUES.length
  const h = HUES[idx]
  return {
    color:  `hsl(${h}, 62%, 36%)`,
    bg:     `hsl(${h}, 62%, 94%)`,
    border: `hsl(${h}, 62%, 70%)`,
  }
}

// Deterministic stamp shape per branch — hashed from BranchCode.
// Used on passport page, branch detail header, and check-in page.
const STAMP_SHAPES = [
  '50%',                 // circle
  '20%',                 // rounded square
  '10px',                // tight rounded rect
  '50% 50% 44% 44%',    // arch / shield
  '32%',                 // superellipse
]

export function getStampShape(branchCode) {
  let h = 0
  for (const c of String(branchCode)) h = (h * 31 + c.charCodeAt(0)) % STAMP_SHAPES.length
  return STAMP_SHAPES[h]
}
