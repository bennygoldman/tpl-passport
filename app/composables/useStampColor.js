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
// Returns { borderRadius, width, height } so oval/pill shapes are authentically proportioned.
// Used on passport page, branch detail header, and check-in page.
const STAMP_SHAPES = [
  { borderRadius: '12px',  width: '100px', height: '100px' },  // square
  { borderRadius: '24px',  width: '100px', height: '100px' },  // soft square
  { borderRadius: '50%',   width: '90px',  height: '90px'  },  // circle
  { borderRadius: '50%',   width: '118px', height: '76px'  },  // landscape oval
  { borderRadius: '100px', width: '128px', height: '70px'  },  // landscape pill
]

export function getStampShape(branchCode) {
  let h = 0
  for (const c of String(branchCode)) h = (h * 31 + c.charCodeAt(0)) % STAMP_SHAPES.length
  return STAMP_SHAPES[h]
}
