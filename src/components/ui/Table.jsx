import { useMemo, useState } from 'react'
import { HiInbox } from 'react-icons/hi2'
import { Button } from './Button.jsx'

export function Table({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = 'No data to display',
  pageSize = 5,
  /** Max height for scrollable table body (vertical + horizontal scroll inside). */
  maxHeightClass = 'max-h-[min(70vh,42rem)]',
  // Server-side pagination props
  totalCount,
  currentPage,
  onPageChange,
}) {
  const [internalPage, setInternalPage] = useState(0)

  const isServerSide = totalCount !== undefined
  const total = isServerSide ? totalCount : (data?.length ?? 0)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const activePage = isServerSide ? currentPage : internalPage
  const safePage = Math.min(activePage, pageCount - 1)
  
  const start = safePage * pageSize
  const end = Math.min(start + pageSize, total)

  const slice = useMemo(() => {
    if (isServerSide) return data || []
    return Array.isArray(data) ? data.slice(start, end) : []
  }, [data, isServerSide, start, end])

  const showingFrom = total === 0 ? 0 : start + 1
  const showingTo = isServerSide ? (start + slice.length) : end

  const handlePrev = () => {
    const newPage = Math.max(0, safePage - 1)
    if (onPageChange) onPageChange(newPage)
    else setInternalPage(newPage)
  }

  const handleNext = () => {
    const newPage = Math.min(pageCount - 1, safePage + 1)
    if (onPageChange) onPageChange(newPage)
    else setInternalPage(newPage)
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className={`min-w-0 overflow-auto overscroll-contain ${maxHeightClass}`}
      >
        <table className="min-w-max w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_rgb(229_231_235)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-gray-200 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600 sm:px-4 ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key} className={`px-3 py-3 sm:px-4 ${col.className || ''}`}>
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-gray-500">
                    <HiInbox className="h-10 w-10 text-gray-300" aria-hidden />
                    <div className="text-sm">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              slice.map((row, ri) => (
                <tr
                  key={row.id ?? ri}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                  {columns.map((col) => {
                    const raw = row[col.key]
                    const content = col.render ? col.render(raw, row) : raw
                    return (
                      <td key={col.key} className={`whitespace-nowrap px-3 py-3 text-sm text-gray-800 sm:px-4 ${col.className || ''}`}>
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-xs text-gray-600">
          Showing {showingFrom}–{showingTo} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            label="Prev"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={safePage <= 0 || loading}
          />
          <Button
            label="Next"
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={safePage >= pageCount - 1 || loading || total === 0}
          />
        </div>
      </div>
    </div>
  )
}
