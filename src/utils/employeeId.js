export const EMP_ID_PREFIX = 'EMP-'

/**
 * Parse numeric sequence from stored emp_id ("1", "EMP-12" → 12).
 */
export function parseEmpIdSequence(empId) {
  if (empId == null || empId === '') return 0
  const s = String(empId).trim()
  if (/^\d+$/.test(s)) return parseInt(s, 10)
  const m = s.match(/(\d+)\s*$/)
  return m ? parseInt(m[1], 10) : 0
}

/** Canonical display/storage format: EMP-1, EMP-2, … */
export function formatEmpId(sequence) {
  const n = parseInt(String(sequence), 10)
  if (!Number.isFinite(n) || n < 1) return `${EMP_ID_PREFIX}1`
  return `${EMP_ID_PREFIX}${n}`
}

export function formatEmpIdDisplay(raw) {
  if (raw == null || raw === '') return '—'
  const n = parseEmpIdSequence(raw)
  if (n > 0) return formatEmpId(n)
  return String(raw).trim()
}

/** Next ID from in-memory rows (fallback when API unavailable). */
export function computeNextEmpIdFromRecords(records = []) {
  let max = 0
  for (const row of records) {
    const raw = row?.emp_id ?? row?.empId ?? row?.employeeId
    const n = parseEmpIdSequence(raw)
    if (n > max) max = n
  }
  return formatEmpId(max + 1)
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}
