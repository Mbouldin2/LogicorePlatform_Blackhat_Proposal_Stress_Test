/**
 * Excel Export Utility for SAM.gov Opportunities
 * 
 * Exports search results to Excel spreadsheets using ExcelJS
 */

import ExcelJS from "exceljs";
import { SamOpportunity } from "./samApiClient";

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeDescription?: boolean;
  includeContacts?: boolean;
}

/**
 * Export opportunities to Excel buffer
 */
export async function exportToExcel(
  opportunities: SamOpportunity[],
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    sheetName = "SAM Opportunities",
    includeDescription = true,
    includeContacts = false,
  } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Define columns
  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Notice ID", key: "noticeId", width: 20 },
    { header: "Title", key: "title", width: 50 },
    { header: "Solicitation Number", key: "solicitationNumber", width: 25 },
    { header: "Type", key: "type", width: 15 },
    { header: "Agency", key: "agency", width: 30 },
    { header: "NAICS Code", key: "naicsCode", width: 12 },
    { header: "PSC Code", key: "classificationCode", width: 12 },
    { header: "Set-Aside", key: "typeOfSetAside", width: 20 },
    { header: "Posted Date", key: "postedDate", width: 15 },
    { header: "Response Deadline", key: "responseDeadLine", width: 18 },
    { header: "Status", key: "active", width: 10 },
    { header: "UI Link", key: "uiLink", width: 50 },
  ];

  if (includeDescription) {
    columns.push({ header: "Description", key: "description", width: 80 });
  }

  if (includeContacts) {
    columns.push({ header: "Primary Contact", key: "primaryContact", width: 40 });
    columns.push({ header: "Contact Email", key: "contactEmail", width: 30 });
    columns.push({ header: "Contact Phone", key: "contactPhone", width: 20 });
  }

  worksheet.columns = columns;

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" }, // Dark blue matching SAM.gov theme
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  opportunities.forEach((opp) => {
    const row: Record<string, string | number | undefined> = {
      noticeId: opp.noticeId,
      title: opp.title,
      solicitationNumber: opp.solicitationNumber,
      type: opp.type,
      agency: opp.organizationHierarchy?.split(".")[0],
      naicsCode: opp.naicsCode,
      classificationCode: opp.classificationCode,
      typeOfSetAside: opp.typeOfSetAside,
      postedDate: formatDateForExcel(opp.postedDate),
      responseDeadLine: formatDateForExcel(opp.responseDeadLine),
      active: opp.active === "true" ? "Active" : "Inactive",
      uiLink: opp.uiLink,
    };

    if (includeDescription) {
      // Clean up description - remove HTML tags if present
      row.description = cleanDescription(opp.description);
    }

    if (includeContacts && opp.pointOfContact && opp.pointOfContact.length > 0) {
      const primaryContact = opp.pointOfContact[0];
      row.primaryContact = primaryContact.name;
      row.contactEmail = primaryContact.email;
      row.contactPhone = primaryContact.phone;
    }

    worksheet.addRow(row);
  });

  // Auto-filter for all columns
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  // Freeze header row
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // Style date columns
  const dateColumns = ["postedDate", "responseDeadLine"];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      dateColumns.forEach((colKey) => {
        const cell = row.getCell(colKey);
        if (cell.value && cell.value !== "N/A") {
          cell.numFmt = "MM/DD/YYYY";
        }
      });
    }
  });

  // Add conditional formatting for deadline column (highlight past due)
  const deadlineCol = worksheet.getColumn("responseDeadLine");
  const today = new Date();
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(query?: string): string {
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toISOString().split("T")[1].split(":")[0] + new Date().toISOString().split("T")[1].split(":")[1];
  
  if (query) {
    // Clean up query for filename
    const cleanQuery = query
      .replace(/[^a-z0-9\s-]/gi, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
    return `sam-opportunities_${cleanQuery}_${date}.xlsx`;
  }
  
  return `sam-opportunities_${date}_${time}.xlsx`;
}

/**
 * Format date for Excel
 */
function formatDateForExcel(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  } catch {
    return "N/A";
  }
}

/**
 * Clean up description text
 */
function cleanDescription(description?: string): string {
  if (!description) return "";
  
  // Remove HTML tags
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Export opportunities summary (compact version)
 */
export async function exportSummaryToExcel(
  opportunities: SamOpportunity[]
): Promise<Buffer> {
  return exportToExcel(opportunities, {
    sheetName: "Summary",
    includeDescription: false,
    includeContacts: false,
  });
}

/**
 * Export opportunities with full details
 */
export async function exportFullToExcel(
  opportunities: SamOpportunity[]
): Promise<Buffer> {
  return exportToExcel(opportunities, {
    sheetName: "Detailed",
    includeDescription: true,
    includeContacts: true,
  });
}
