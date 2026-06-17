import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

// Theme Colors (from Tailwind config)
const THEME = {
  primary: {
    DEFAULT: '#0F766E',
    light: '#14B8A6',
    dark: '#0D5F57',
    bg: '#F0FDFA',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
}

// Helper: RGB conversion for theme colors
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

function formatDate(v) {
  if (!v) return 'N/A'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function captureChart(ref) {
  if (!ref?.current) return null
  try {
    const canvas = await html2canvas(ref.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    })
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

function addPageNumber(doc, loggedInUser = 'Super Admin') {
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer divider line (theme color)
    doc.setDrawColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.setLineWidth(0.3)
    doc.line(14, doc.internal.pageSize.getHeight() - 15, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 15)
    
    // Footer text
    doc.setFontSize(7)
    doc.setTextColor(...hexToRgb(THEME.text.tertiary))
    doc.setFont('helvetica', 'normal')
    
    doc.text(
      'Organisation Management Report',
      14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'left' }
    )
    
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
    
    doc.text(
      'Confidential – Super Admin Access Only',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }
}

export async function generateOrganisationManagementPDF({
  stats = {},
  organizations = [],
  subscriptionData = [],
  chartRefs = [],
  filters = {}
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const now = new Date()
  const dateStr = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  let y = margin

  // ── 1. HEADER SECTION ──────────────────────────────────────────────────────
  // Professional header with theme color bar
  doc.setFillColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.rect(0, 0, pageW, 35, 'F')

  // Header content - white text on teal background
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Organisation Management Report', margin, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Super Admin Dashboard Report', margin, 18)

  // Right side: Generated info
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const rightX = pageW - margin
  doc.text(`Generated: ${dateStr}`, rightX, 12, { align: 'right' })
  doc.text(`Total Records: ${organizations.length}`, rightX, 18, { align: 'right' })

  // Divider line under header
  doc.setDrawColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.setLineWidth(0.5)
  doc.line(0, 35, pageW, 35)

  y = 45

  // ── 2. EXECUTIVE SUMMARY SECTION ───────────────────────────────────────────
  doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Executive Summary', margin, y)

  // Subtle divider
  doc.setDrawColor(...hexToRgb(THEME.border.primary))
  doc.setLineWidth(0.3)
  doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
  y += 10

  // Summary Cards: 4 cards in a row
  const cardData = [
    {
      label: 'Total Organizations',
      value: String(stats.totalOrganizations || organizations.length),
    },
    {
      label: 'Active Organizations',
      value: String(stats.activeOrganizations || organizations.filter(o => o.status === 'Active').length),
    },
    {
      label: 'Trial Organizations',
      value: String(stats.trialOrganizations || organizations.filter(o => o.status === 'Trial').length),
    },
    {
      label: 'Suspended Organizations',
      value: String(stats.suspendedOrganizations || organizations.filter(o => o.status === 'Suspended').length),
    },
  ]

  const cardW = (pageW - margin * 2 - 9) / 4
  cardData.forEach((card, i) => {
    const x = margin + i * (cardW + 3)
    
    // White background card with light border
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...hexToRgb(THEME.border.primary))
    doc.setLineWidth(0.2)
    doc.roundedRect(x, y, cardW, 22, 1.5, 1.5, 'FD')

    // Theme-colored left accent bar
    doc.setFillColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.rect(x, y, 2, 22, 'F')

    // Label
    doc.setTextColor(...hexToRgb(THEME.text.secondary))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(card.label.toUpperCase(), x + 5, y + 7)

    // Value - large and bold
    doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(card.value, x + 5, y + 16)
  })
  y += 30

  // ── 3. ORGANIZATION ANALYTICS CHARTS ───────────────────────────────────────
  if (chartRefs && chartRefs.length > 0 && y + 40 < pageH - 20) {
    doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Organization Analytics', margin, y)

    doc.setDrawColor(...hexToRgb(THEME.border.primary))
    doc.setLineWidth(0.3)
    doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
    y += 8

    const chartLabels = [
      'Organization Status Overview',
      'Tier Distribution',
      'Organization Growth Trend'
    ]
    const chartImgW = pageW - margin * 2
    const chartImgH = 50

    for (let ci = 0; ci < Math.min(chartRefs.length, 3); ci++) {
      if (y + chartImgH + 5 > pageH - 20) {
        doc.addPage()
        y = 16
      }

      const imgData = await captureChart(chartRefs[ci])
      if (imgData) {
        // Chart label
        doc.setTextColor(...hexToRgb(THEME.text.primary))
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text(chartLabels[ci], margin, y)
        y += 5

        // Chart container with theme border
        doc.setDrawColor(...hexToRgb(THEME.border.secondary))
        doc.setLineWidth(0.2)
        doc.roundedRect(margin, y, chartImgW, chartImgH, 1.5, 1.5)
        doc.addImage(imgData, 'PNG', margin + 0.5, y + 0.5, chartImgW - 1, chartImgH - 1)
        y += chartImgH + 6
      }
    }
  }

  // ── 4. ORGANIZATION DETAILS TABLE ──────────────────────────────────────────
  if (y + 30 > pageH - 20) {
    doc.addPage()
    y = 16
  }

  doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Organization Details', margin, y)

  doc.setDrawColor(...hexToRgb(THEME.border.primary))
  doc.setLineWidth(0.3)
  doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['Organization Name', 'Domain', 'Tier', 'Status', 'Employee Count', 'Registration Date', 'Root Admin']],
    body: organizations.length
      ? organizations.map((org) => [
        org.name || 'N/A',
        org.domain || 'N/A',
        org.plan || 'N/A',
        org.status || 'N/A',
        String(org.users || 0),
        formatDate(org.created || org.createdAt),
        org.adminEmail || 'N/A',
      ])
      : [['—', 'No organizations available', '', '', '', '', '']],
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: hexToRgb(THEME.text.primary),
    },
    headStyles: {
      fillColor: hexToRgb(THEME.primary.DEFAULT),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: hexToRgb(THEME.background.secondary),
    },
    margin: { left: margin, right: margin },
    tableLineColor: hexToRgb(THEME.border.primary),
    tableLineWidth: 0.1,
  })
  y = doc.lastAutoTable.finalY + 8

  // ── 5. RECENTLY REGISTERED ORGANIZATIONS ───────────────────────────────────
  const recentOrgs = organizations
    .sort((a, b) => new Date(b.created || b.createdAt) - new Date(a.created || a.createdAt))
    .slice(0, 10)

  if (y + 30 > pageH - 20) {
    doc.addPage()
    y = 16
  }

  doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Recently Registered Organizations', margin, y)

  doc.setDrawColor(...hexToRgb(THEME.border.primary))
  doc.setLineWidth(0.3)
  doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
  y += 6

  autoTable(doc, {
    startY: y,
    head: [['Organization Name', 'Tier', 'Registration Date', 'Status']],
    body: recentOrgs.length
      ? recentOrgs.map((org) => [
        org.name || 'N/A',
        org.plan || 'N/A',
        formatDate(org.created || org.createdAt),
        org.status || 'N/A',
      ])
      : [['—', 'No organizations available', '', '']],
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: hexToRgb(THEME.text.primary),
    },
    headStyles: {
      fillColor: hexToRgb(THEME.primary.DEFAULT),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: hexToRgb(THEME.background.secondary),
    },
    margin: { left: margin, right: margin },
    tableLineColor: hexToRgb(THEME.border.primary),
    tableLineWidth: 0.1,
  })
  y = doc.lastAutoTable.finalY + 8

  // ── 6. REPORT INSIGHTS SECTION ─────────────────────────────────────────────
  if (y + 30 > pageH - 20) {
    doc.addPage()
    y = 16
  }

  doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Report Insights', margin, y)

  doc.setDrawColor(...hexToRgb(THEME.border.primary))
  doc.setLineWidth(0.3)
  doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
  y += 10

  // Calculate insights
  const totalEmployees = organizations.reduce((sum, org) => sum + (org.users || 0), 0)
  const planCounts = {}
  organizations.forEach(org => {
    const plan = org.plan || 'Unknown'
    planCounts[plan] = (planCounts[plan] || 0) + 1
  })
  const mostPopularPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  const activeCount = organizations.filter(o => o.status === 'Active').length
  const trialCount = organizations.filter(o => o.status === 'Trial').length
  const suspendedCount = organizations.filter(o => o.status === 'Suspended').length

  const insightCards = [
    { label: 'Total Active Organizations', value: String(activeCount) },
    { label: 'Total Trial Organizations', value: String(trialCount) },
    { label: 'Total Suspended Organizations', value: String(suspendedCount) },
    { label: 'Most Popular Tier', value: mostPopularPlan },
    { label: 'Total Employees', value: String(totalEmployees) },
  ]

  // Display insight cards in rows (2 cards per row)
  const cardW2 = (pageW - margin * 2 - 3) / 2
  insightCards.forEach((card, i) => {
    if (i > 0 && i % 2 === 0) {
      y += 25
      if (y + 25 > pageH - 20) {
        doc.addPage()
        y = 16
      }
    }

    const x = margin + (i % 2) * (cardW2 + 3)
    const rowY = y + Math.floor(i / 2) * 25

    // White card with border
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...hexToRgb(THEME.border.primary))
    doc.setLineWidth(0.2)
    doc.roundedRect(x, rowY, cardW2, 22, 1.5, 1.5, 'FD')

    // Theme-colored left accent
    doc.setFillColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.rect(x, rowY, 2, 22, 'F')

    // Label
    doc.setTextColor(...hexToRgb(THEME.text.secondary))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(card.label.toUpperCase(), x + 5, rowY + 7)

    // Value
    doc.setTextColor(...hexToRgb(THEME.primary.DEFAULT))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(card.value, x + 5, rowY + 16)
  })

  // ── 7. FOOTER ──────────────────────────────────────────────────────────────
  addPageNumber(doc)

  const timestamp = now.toISOString().slice(0, 10)
  doc.save(`organisation-management-report-${timestamp}.pdf`)
}

export function generateOrganisationManagementCSV({
  stats = {},
  organizations = [],
  subscriptionData = [],
  filters = {}
}) {
  const rows = []

  // ── Section: Report Header ───────────────────────────────────────────────────
  rows.push(['ORGANISATION MANAGEMENT REPORT'])
  rows.push(['Organization Overview & Subscription Analytics'])
  rows.push([`Report Generated On:`, new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })])
  rows.push([`Total Records Exported:`, organizations.length])
  rows.push([])

  // ── Section: Organization Summary ───────────────────────────────────────────
  rows.push(['=== ORGANIZATION SUMMARY ==='])
  rows.push(['Metric', 'Value'])
  rows.push(['Total Organizations', stats.totalOrganizations || organizations.length])
  rows.push(['Active Organizations', stats.activeOrganizations || organizations.filter(o => o.status === 'Active').length])
  rows.push(['Trial Organizations', stats.trialOrganizations || organizations.filter(o => o.status === 'Trial').length])
  rows.push(['Suspended Organizations', stats.suspendedOrganizations || organizations.filter(o => o.status === 'Suspended').length])
  rows.push([])

  // ── Section: Organization List ───────────────────────────────────────────────
  rows.push(['=== ORGANIZATION LIST ==='])
  rows.push(['Organization Name', 'Domain', 'Tier', 'Status', 'Employee Count', 'Registration Date', 'Root Admin'])
  if (organizations.length) {
    organizations.forEach((org) =>
      rows.push([
        org.name || 'N/A',
        org.domain || 'N/A',
        org.plan || 'N/A',
        org.status || 'N/A',
        org.users || 0,
        formatDate(org.created || org.createdAt),
        org.adminEmail || 'N/A',
      ])
    )
  } else {
    rows.push(['No organizations available', '', '', '', '', '', ''])
  }
  rows.push([])

  // ── Section: Recently Registered Organizations ───────────────────────────────
  const recentOrgs = organizations
    .sort((a, b) => new Date(b.created || b.createdAt) - new Date(a.created || a.createdAt))
    .slice(0, 10)

  rows.push(['=== RECENTLY REGISTERED ORGANIZATIONS ==='])
  rows.push(['Organization Name', 'Tier', 'Total Users', 'Registration Date', 'Status'])
  if (recentOrgs.length) {
    recentOrgs.forEach((org) =>
      rows.push([
        org.name || 'N/A',
        org.plan || 'N/A',
        org.users || 0,
        formatDate(org.created || org.createdAt),
        org.status || 'N/A',
      ])
    )
  } else {
    rows.push(['No organizations available', '', '', '', ''])
  }
  rows.push([])

  // ── Section: Subscription Overview ───────────────────────────────────────────
  if (subscriptionData && subscriptionData.length > 0) {
    rows.push(['=== SUBSCRIPTION OVERVIEW ==='])
    rows.push(['Organization Name', 'Current Plan', 'Plan Start Date', 'Plan Expiry Date', 'Billing Cycle', 'Status'])
    subscriptionData.forEach((sub) =>
      rows.push([
        sub.organizationName || 'N/A',
        sub.planName || 'N/A',
        formatDate(sub.startDate),
        formatDate(sub.expiryDate),
        sub.billingCycle || 'N/A',
        sub.status || 'N/A',
      ])
    )
    rows.push([])
  }

  // ── Section: Organization Insights ───────────────────────────────────────────
  rows.push(['=== ORGANIZATION INSIGHTS ==='])
  const totalEmployees = organizations.reduce((sum, org) => sum + (org.users || 0), 0)
  const planCounts = {}
  organizations.forEach(org => {
    const plan = org.plan || 'Unknown'
    planCounts[plan] = (planCounts[plan] || 0) + 1
  })
  const mostPopularPlan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  const newOrgsThisMonth = organizations.filter(org => {
    const date = new Date(org.created || org.createdAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const activeSubscriptionPercent = organizations.filter(o => o.status === 'Active').length / organizations.length * 100 || 0

  rows.push(['Metric', 'Value'])
  rows.push(['Total Employees Across Organizations', totalEmployees])
  rows.push(['Most Popular Plan', mostPopularPlan])
  rows.push(['New Organizations This Month', newOrgsThisMonth])
  rows.push(['Active Subscription Percentage', `${activeSubscriptionPercent.toFixed(1)}%`])

  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `organisation-management-report-${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
