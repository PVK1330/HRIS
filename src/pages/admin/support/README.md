# Support Management Page - Complete Documentation

## Overview
A modern, professional Support Management page for the Admin Panel of the HRIS system. This page allows admins to create, view, and manage support tickets with a comprehensive tracking system.

## File Structure

```
src/pages/admin/support/
├── Support.jsx                    # Main component (Complete feature set)
├── CreateTicketModal.jsx          # Reusable create ticket modal component
├── TicketDetailsModal.jsx         # Reusable ticket details view modal
└── README.md                      # This file
```

## Features Implemented

### 1. **Summary Cards** (4 Cards)
- **Total Tickets**: All tickets count
- **Open Tickets**: Active open tickets
- **In Progress**: Currently being handled tickets
- **Resolved Tickets**: Completed tickets

Each card:
- Shows icon with themed background color
- Displays count and label
- Clickable to filter table by status
- Active state highlighting
- Smooth hover effects

### 2. **Search & Filter Section**
- **Search Bar**: Filter by Ticket ID, Subject, or Category
- **Status Filter**: All, Open, In Progress, Resolved, Closed
- **Priority Filter**: All, Low, Medium, High, Urgent
- **Reset Filters Button**: Clear all active filters

### 3. **Support Tickets Table**
Columns with features:
- **Ticket ID**: Unique identifier (SUP-1001, etc.) with icon
- **Subject**: Issue title with truncation
- **Category**: Issue category
- **Priority**: Color-coded badge
- **Status**: Color-coded badge
- **Created Date**: With calendar icon
- **Actions**: View and Delete buttons

Features:
- Pagination support (10 items per page)
- Smooth animations
- Empty state handling
- Responsive layout

### 4. **Create Ticket Modal**
Form fields:
1. **Admin Name** (disabled, auto-filled) - `John Admin`
2. **Company / Tenant Name** (disabled, auto-filled) - `Acme Corporation`
3. **Subject** (text input, required)
4. **Category** (dropdown, 8 options, required)
5. **Priority** (dropdown, 4 levels, required)
6. **Description** (textarea, required)
7. **Attachment** (file upload, optional)

Features:
- Form validation with toast notifications
- Auto-filled fields for admin and tenant
- Status auto-set to "Open"
- Auto-generated Ticket ID (SUP-XXXX)
- Current date auto-assigned
- File upload UI with drag-and-drop area
- Submit and Cancel buttons
- Loading state during submission

### 5. **View Ticket Modal**
Shows detailed ticket information:
- Ticket ID and Status badge
- Priority badge
- Subject
- Category
- Created Date
- Admin Name
- Tenant/Company Name
- Full Description
- Attachment (if present)

### 6. **Delete Functionality**
- SweetAlert2 confirmation dialog
- Professional warning UI
- One-click deletion from table
- Toast notification on success

## Badge Colors

### Status Badges
| Status | Color |
|--------|-------|
| Open | Blue |
| In Progress | Orange |
| Resolved | Green |
| Closed | Gray |

### Priority Badges
| Priority | Color |
|----------|-------|
| Low | Gray |
| Medium | Yellow |
| High | Orange |
| Urgent | Red |

## Dummy Data

The component includes 10 realistic support tickets with various:
- Categories (Technical Issue, Payroll, Attendance, etc.)
- Priorities (Low to Urgent)
- Statuses (Open, In Progress, Resolved, Closed)
- Different admin names and tenant names
- Realistic descriptions and attachments

## State Management

Uses React hooks:
- `useState`: Form data, modals, filters, tickets list
- `useMemo`: Filtered tickets, stats calculation
- `useRef`: File input reference

Local dummy state (no backend required).

## UI Components Used

### From Project
- `Input`: Text, select, textarea fields
- `Modal`: Create and view ticket modals
- `Table`: Support tickets table
- `Badge`: Status and priority display

### Icons Used (React Icons HI2)
- `HiPlus`: Create button
- `HiMagnifyingGlass`: Search icon
- `HiTrash`: Delete button
- `HiEye`: View button
- `HiCheckCircle`: Resolved status
- `HiExclamationCircle`: Open tickets
- `HiClock`: In Progress
- `HiSparkles`: Ticket ID icon
- `HiCalendarDays`: Date display
- `HiUser`: Admin name
- `HiBuilding`: Tenant/Company
- `HiPaperClip`: Attachment icon
- `HiQuestionMarkCircle`: Sidebar icon

## Styling

### Design System
- **Theme Color**: `#0F766E` (Teal)
- **Borders**: Rounded corners (rounded-lg)
- **Shadows**: Subtle shadow-sm
- **Spacing**: Consistent gap and padding
- **Animations**: Fade-in and scale effects

### Responsive Design
- Mobile-first approach
- Tailwind CSS responsive classes
- Flexible grid layouts
- Collapsible filters on mobile

## How to Use

### Access the Page
1. Login as Admin
2. Click "Support" in the sidebar (under HR OPERATIONS)
3. Page loads at `/admin/support`

### Create a Ticket
1. Click "Create Ticket" button
2. Fill in the form (Subject, Category, Priority, Description required)
3. Optionally attach a file
4. Click "Create Ticket" button
5. Modal closes, new ticket appears at top of table
6. Success toast notification shown

### View Ticket Details
1. Click the eye icon in the Actions column
2. Modal opens showing all ticket information
3. Close button or Escape key to close

### Delete a Ticket
1. Click the trash icon in the Actions column
2. Confirmation dialog appears
3. Click "Yes, delete it!" to confirm
4. Ticket removed from table
5. Success notification shown

### Filter & Search
1. Use search bar to find by ID, subject, or category
2. Use Status filter dropdown
3. Use Priority filter dropdown
4. Click "Reset Filters" to clear all

## Integration with Routes

### Router Configuration
Added to `src/routes/AppRouter.jsx`:
```javascript
const SupportManagement = lazy(() => import("../pages/admin/support/Support.jsx"));

// In admin routes:
{
  path: "support",
  element: (
    <AdminModuleGate moduleKey="support">
      <SupportManagement />
    </AdminModuleGate>
  ),
}
```

### Sidebar Configuration
Added to `src/layouts/AdminLayout.jsx`:
```javascript
{
  label: "Support",
  icon: HiQuestionMarkCircle,
  path: "/admin/support",
  key: "support",
  permission: "view_support",
}
```

## Future Enhancements

### Backend Integration
- Replace dummy data with API calls
- Create ticket API endpoint
- Update ticket status API
- Delete ticket API
- Search and filter API

### Features to Add
- Status update modal
- Ticket priority update
- Assigned to agent field
- Response/reply system
- Ticket history timeline
- Export tickets functionality
- Advanced filters (date range, admin name, etc.)
- Ticket categories management
- Custom status workflow
- Notification system for new tickets
- Bulk operations (delete multiple, status update)

### Performance
- Pagination backend implementation
- Virtualization for large lists
- Lazy loading images/attachments
- Caching strategies

## Code Quality

### Best Practices Followed
✅ Component modularity
✅ Reusable components
✅ Proper error handling
✅ Form validation
✅ Accessibility (ARIA labels)
✅ TypeScript-ready structure
✅ DRY principles
✅ Consistent naming conventions
✅ Clean code formatting
✅ Responsive design

### Performance Considerations
- useMemo for filtered data
- Lazy component loading
- Efficient state updates
- Icon library optimization

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Dependencies
- React 18+
- React Router v6+
- Tailwind CSS
- React Icons (HI2)
- react-hot-toast
- SweetAlert2

## Notes

### Dummy Ticket ID Generation
- Format: `SUP-XXXX`
- Auto-incremented based on existing tickets
- Example: If last ticket is SUP-1010, next is SUP-1011

### Date Handling
- Uses ISO format (YYYY-MM-DD)
- Auto-filled with current date on creation
- Can be customized for backend timestamp format

### File Upload
- Currently accepts: PDF, DOCX, XLS, XLSX, TXT, ZIP, JPG, PNG, JPEG
- Size limit: 10MB (UI indicator only, enforce on backend)
- File name stored in ticket data

### Form Validation
- All required fields validated before submission
- Toast notifications for validation errors
- Prevents empty ticket creation

---

**Created**: May 27, 2026
**Version**: 1.0.0 (Frontend-only, ready for backend integration)
**Status**: Production-ready
