/**
 * Utilities for exporting case records to CSV format.
 * Correctly escapes commas, quotes, and line breaks, and includes UTF-8 BOM.
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) {
    return '""';
  }
  const stringVal = String(value);
  // If contains quotes, commas, or line breaks, escape internal quotes by doubling them
  if (/[",\r\n]/.test(stringVal)) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

export function exportCasesToCsv(cases, filename = 'CallSaarthi_Cases_Export.csv') {
  if (!cases || !cases.length) {
    alert('No cases available to export.');
    return;
  }

  const headers = [
    'Case ID',
    'Incident Summary',
    'Language',
    'Incident Category',
    'Suggested Urgency',
    'Final Urgency',
    'Recommended Service',
    'Confirmed Service',
    'Received Date & Time',
    'Review Status',
    'Location',
    'Previous Complaint Ref',
    'Caller Name',
    'Confidence Score',
    'Operator Notes'
  ];

  const rows = cases.map((c) => [
    escapeCsvCell(c.id),
    escapeCsvCell(c.summary),
    escapeCsvCell(c.language),
    escapeCsvCell(c.category),
    escapeCsvCell(c.suggestedUrgency || c.urgency),
    escapeCsvCell(c.finalUrgency || c.urgency),
    escapeCsvCell(c.recommendedService),
    escapeCsvCell(c.confirmedService || c.recommendedService),
    escapeCsvCell(c.receivedDateTime || `${c.receivedDate || ''} ${c.receivedTime || ''}`),
    escapeCsvCell(c.status),
    escapeCsvCell(c.location),
    escapeCsvCell(c.previousComplaintRef || 'Not mentioned'),
    escapeCsvCell(c.callerName),
    escapeCsvCell(c.confidence),
    escapeCsvCell(c.operatorNotes || '')
  ]);

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
