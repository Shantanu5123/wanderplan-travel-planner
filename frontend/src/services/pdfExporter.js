/**
 * Comprehensive Multi-Page PDF Generator & Direct Downloader.
 * Generates all days and activities across multiple pages as needed.
 * Downloads the .pdf file directly in zero time without opening any new tabs or windows!
 */

export function exportItineraryToPDF({ trip, itinerary, formatCost }) {
  const destination = trip?.destination || itinerary?.destination || 'Travel Itinerary';
  const summary = itinerary?.summary || trip?.summary || '';
  const startDate = trip?.start_date || '';
  const endDate = trip?.end_date || '';
  const dates = startDate && endDate ? `${startDate} to ${endDate}` : (startDate || 'Upcoming');
  const budget = trip?.budget || 'Moderate';
  const travelStyle = trip?.travel_style || 'Balanced';
  const estimatedCost = itinerary?.estimated_total_cost
    ? (formatCost ? formatCost(itinerary.estimated_total_cost) : itinerary.estimated_total_cost)
    : '';
  const days = itinerary?.days || [];

  const sanitize = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  };

  const pages = [];
  let currentPageLines = [];
  let currentY = 770;

  const startNewPage = () => {
    if (currentPageLines.length > 0) {
      // Add page footer to current page
      currentPageLines.push("BT");
      currentPageLines.push("/F1 8 Tf");
      currentPageLines.push("0.55 0.6 0.68 rg");
      currentPageLines.push("190 32 Td");
      currentPageLines.push(`(WanderPlan AI Travel Itinerary   -   Page ${pages.length + 1}) Tj`);
      currentPageLines.push("ET");
      pages.push(currentPageLines);
    }
    currentPageLines = [];
    currentY = 770;
  };

  // --- Page 1 Header ---
  currentPageLines.push("BT");
  currentPageLines.push("/F1 20 Tf");
  currentPageLines.push("0.15 0.39 0.92 rg");
  currentPageLines.push("50 760 Td");
  currentPageLines.push(`(${sanitize(destination)}) Tj`);
  currentPageLines.push("ET");

  currentPageLines.push("BT");
  currentPageLines.push("/F1 10 Tf");
  currentPageLines.push("0.4 0.45 0.55 rg");
  currentPageLines.push("50 740 Td");
  currentPageLines.push(`(Dates: ${sanitize(dates)}   |   Budget: ${sanitize(budget)}   |   Pace: ${sanitize(travelStyle)}) Tj`);
  currentPageLines.push("ET");

  if (estimatedCost) {
    currentPageLines.push("BT");
    currentPageLines.push("/F2 10 Tf");
    currentPageLines.push("0.06 0.5 0.35 rg");
    currentPageLines.push("50 724 Td");
    currentPageLines.push(`(Estimated Total Cost: ${sanitize(estimatedCost)}) Tj`);
    currentPageLines.push("ET");
    currentY = 708;
  } else {
    currentY = 724;
  }

  // Header separator line
  currentPageLines.push("0.8 0.85 0.92 RG");
  currentPageLines.push("1.5 w");
  currentPageLines.push(`50 ${currentY} m 545 ${currentY} l S`);
  currentY -= 20;

  // Render Summary if available
  if (summary) {
    currentPageLines.push("BT");
    currentPageLines.push("/F1 9 Tf");
    currentPageLines.push("0.3 0.35 0.45 rg");
    currentPageLines.push(`50 ${currentY} Td`);
    const shortSum = summary.length > 95 ? summary.substring(0, 92) + '...' : summary;
    currentPageLines.push(`(${sanitize(shortSum)}) Tj`);
    currentPageLines.push("ET");
    currentY -= 24;
  }

  // Render all Days and Activities with automatic multi-page overflow
  days.forEach((day) => {
    // Check if space needed for Day header + at least 1 activity (approx 100pt)
    if (currentY < 120) {
      startNewPage();
    }

    // Day Header
    currentPageLines.push("0.93 0.95 0.99 rg"); // Light blue box fill
    currentPageLines.push(`50 ${currentY - 18} 495 22 re f`);
    currentPageLines.push("0.2 0.45 0.9 RG"); // Border
    currentPageLines.push("1 w");
    currentPageLines.push(`50 ${currentY - 18} 495 22 re S`);

    currentPageLines.push("BT");
    currentPageLines.push("/F2 11 Tf");
    currentPageLines.push("0.1 0.25 0.7 rg");
    currentPageLines.push(`60 ${currentY - 13} Td`);
    const dayHeader = `Day ${day.day_number || ''}: ${day.theme || 'Activities'}`;
    currentPageLines.push(`(${sanitize(dayHeader)}) Tj`);
    currentPageLines.push("ET");

    currentY -= 36;

    // Activities
    (day.activities || []).forEach((act) => {
      // Calculate estimated activity height (between 50 and 75pt)
      let actHeight = 35;
      if (act.description) actHeight += 14;
      if (act.location || act.cost_estimate) actHeight += 14;
      if (act.travel_tips) actHeight += 14;

      if (currentY - actHeight < 55) {
        startNewPage();
      }

      // Time slot
      currentPageLines.push("BT");
      currentPageLines.push("/F2 9.5 Tf");
      currentPageLines.push("0.15 0.39 0.92 rg");
      currentPageLines.push(`58 ${currentY} Td`);
      currentPageLines.push(`([${sanitize(act.time_slot || 'Activity')}]) Tj`);
      currentPageLines.push("ET");

      // Title
      currentPageLines.push("BT");
      currentPageLines.push("/F2 10 Tf");
      currentPageLines.push("0.1 0.15 0.25 rg");
      currentPageLines.push(`140 ${currentY} Td`);
      const actTitle = act.title ? (act.title.length > 60 ? act.title.substring(0, 58) + '...' : act.title) : '';
      currentPageLines.push(`(${sanitize(actTitle)}) Tj`);
      currentPageLines.push("ET");
      currentY -= 14;

      // Description
      if (act.description) {
        currentPageLines.push("BT");
        currentPageLines.push("/F1 8.5 Tf");
        currentPageLines.push("0.35 0.4 0.5 rg");
        currentPageLines.push(`140 ${currentY} Td`);
        const actDesc = act.description.length > 80 ? act.description.substring(0, 77) + '...' : act.description;
        currentPageLines.push(`(${sanitize(actDesc)}) Tj`);
        currentPageLines.push("ET");
        currentY -= 13;
      }

      // Location & Cost
      if (act.location || act.cost_estimate) {
        currentPageLines.push("BT");
        currentPageLines.push("/F1 8 Tf");
        currentPageLines.push("0.5 0.55 0.65 rg");
        currentPageLines.push(`140 ${currentY} Td`);
        const metaStr = `${act.location ? 'Location: ' + act.location : ''} ${act.cost_estimate ? '  |  Cost: ' + (formatCost ? formatCost(act.cost_estimate) : act.cost_estimate) : ''}`;
        currentPageLines.push(`(${sanitize(metaStr)}) Tj`);
        currentPageLines.push("ET");
        currentY -= 13;
      }

      // Local Tip
      if (act.travel_tips) {
        currentPageLines.push("BT");
        currentPageLines.push("/F1 8 Tf");
        currentPageLines.push("0.7 0.4 0.1 rg");
        currentPageLines.push(`140 ${currentY} Td`);
        const tipStr = `Tip: ${act.travel_tips.length > 75 ? act.travel_tips.substring(0, 72) + '...' : act.travel_tips}`;
        currentPageLines.push(`(${sanitize(tipStr)}) Tj`);
        currentPageLines.push("ET");
        currentY -= 14;
      }

      currentY -= 6;
    });

    currentY -= 12;
  });

  // Final page push
  if (currentPageLines.length > 0) {
    currentPageLines.push("BT");
    currentPageLines.push("/F1 8 Tf");
    currentPageLines.push("0.55 0.6 0.68 rg");
    currentPageLines.push("190 32 Td");
    currentPageLines.push(`(WanderPlan AI Travel Itinerary   -   Page ${pages.length + 1}) Tj`);
    currentPageLines.push("ET");
    pages.push(currentPageLines);
  }

  // Assemble full valid Multi-Page PDF binary
  const numPages = pages.length;
  const pageObjectIds = [];
  const contentObjectIds = [];

  // PDF Structure Map:
  // 1: Catalog
  // 2: Pages
  // 3 .. 2 + numPages: Page objects
  // 3 + numPages .. 2 + 2*numPages: Content stream objects
  // Font 1 (F1)
  // Font 2 (F2)

  for (let i = 0; i < numPages; i++) {
    pageObjectIds.push(3 + i);
    contentObjectIds.push(3 + numPages + i);
  }

  const f1Id = 3 + 2 * numPages;
  const f2Id = f1Id + 1;

  let pdf = `%PDF-1.4\n`;
  const offsets = {};

  const recordObj = (id, str) => {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${str}\nendobj\n`;
  };

  // 1. Catalog
  recordObj(1, `<< /Type /Catalog /Pages 2 0 R >>`);

  // 2. Pages Root
  const kidsStr = pageObjectIds.map(id => `${id} 0 R`).join(' ');
  recordObj(2, `<< /Type /Pages /Kids [${kidsStr}] /Count ${numPages} >>`);

  // Page Objects
  for (let i = 0; i < numPages; i++) {
    const pageId = pageObjectIds[i];
    const contentId = contentObjectIds[i];
    recordObj(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >> >> >>`
    );
  }

  // Content Stream Objects
  for (let i = 0; i < numPages; i++) {
    const contentId = contentObjectIds[i];
    const stream = pages[i].join('\n');
    recordObj(
      contentId,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    );
  }

  // Fonts
  recordObj(f1Id, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  recordObj(f2Id, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  // Cross-reference table
  const startXref = pdf.length;
  const totalObjects = f2Id + 1;
  pdf += `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;

  for (let i = 1; i < totalObjects; i++) {
    const offset = offsets[i] || 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  // Direct Browser Download
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${destination.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_full_itinerary.pdf`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
