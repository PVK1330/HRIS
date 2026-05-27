const fs = require('fs');
const path = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/Announcements.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/label: 'TRANSMISSION_SUBJECT'/g, "label: 'Subject'");
content = content.replace(/label: 'AUTHOR_ID'/g, "label: 'Author'");
content = content.replace(/label: 'TIMESTAMP'/g, "label: 'Date'");
content = content.replace(/label: 'AUDIENCE_INDEX'/g, "label: 'Audience'");
content = content.replace(/label: 'PRIORITY_LEVEL'/g, "label: 'Priority'");
content = content.replace(/label: 'LIFECYCLE'/g, "label: 'Status'");
content = content.replace(/label: 'COMMAND'/g, "label: 'Actions'");

content = content.replace(/label: 'TOTAL BROADCASTS'/g, "label: 'Total Announcements'");
content = content.replace(/label: 'PUBLISHED_ACTIVE'/g, "label: 'Published'");
content = content.replace(/label: 'DRAFT_STAGING'/g, "label: 'Drafts'");
content = content.replace(/label: 'SCHEDULED_QUEUE'/g, "label: 'Scheduled'");

content = content.replace(/'TOTAL BROADCASTS'/g, "'Total Announcements'");
content = content.replace(/'PUBLISHED_ACTIVE'/g, "'Published'");
content = content.replace(/'DRAFT_STAGING'/g, "'Drafts'");
content = content.replace(/'SCHEDULED_QUEUE'/g, "'Scheduled'");

content = content.replace(/Announcement Intelligence/g, 'Company Announcements');
content = content.replace(/Corporate Communications & Broadcast Governance/g, 'Manage corporate announcements and broadcasts.');
content = content.replace(/BROADCAST_CONFIGURATION_INTERFACE/g, 'Announcement Editor');
content = content.replace(/Broadcast Structural Log/g, 'Announcement History');

content = content.replace(/EXECUTE_BROADCAST/g, 'Publish');
content = content.replace(/SAVE_STAGING_DRAFT/g, 'Save Draft');
content = content.replace(/ABORT_INTERFACE/g, 'Cancel');
content = content.replace(/TRANSMITTING\.\.\./g, 'Saving...');

// Fix some specific brutalist words
content = content.replace(/SYSTEM_CORE/g, 'System');
content = content.replace(/ALL_EMPLOYEES/g, 'All Employees');
content = content.replace(/SELECTED_TARGETS/g, 'Selected Employees');
content = content.replace(/_TARGETS/g, ' Employees');
content = content.replace(/ASSET_SELECTOR/g, 'Employee Selector');
content = content.replace(/CLEAR_ALL/g, 'Clear All');
content = content.replace(/SEARCH_BY_IDENTITY/g, 'Search by name or email');
content = content.replace(/UNKNOWN_ASSET/g, 'Unknown Employee');
content = content.replace(/IN_APP_FEED/g, 'In-App Notification');
content = content.replace(/EMAIL_NOTICE/g, 'Email Notification');

// Brutalist styles -> Modern
content = content.replace(/font-black/g, 'font-semibold');
content = content.replace(/uppercase tracking-widest/g, '');
content = content.replace(/uppercase tracking-\[0.2em\]/g, '');
content = content.replace(/uppercase/g, '');
content = content.replace(/rounded-none/g, 'rounded-xl');

content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-sm');

// Update border styles to softer shadows
content = content.replace(/shadow-sm/g, 'shadow-md');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacing strings.');
