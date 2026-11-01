/*
LEX ACADEMY ENQUIRY INTAKE
1. Create a private Google Sheet.
2. Extensions > Apps Script; paste this file into Code.gs.
3. Replace SHEET_ID below with the long ID from the Sheet URL.
4. Run setupSheet() once from the Apps Script editor and approve permissions.
5. Deploy > New deployment > Web app:
   Execute as: Me
   Who has access: Anyone
6. Copy the /exec URL into config.js.
Keep the spreadsheet private; never publish it to the web.
This endpoint accepts enquiry details only, not payment card data or passwords.
*/
const SHEET_ID = "REPLACE_WITH_GOOGLE_SHEET_ID";
const TAB_NAME = "Enquiries";

function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) sheet = ss.insertSheet(TAB_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Submitted At", "Full Name", "Email", "Phone", "Target Exam",
      "Programme", "Message", "Consent", "Page URL", "Status"
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
    sheet.autoResizeColumns(1, 10);
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const d = JSON.parse(raw);
    // Basic validation and length caps; public endpoints can still receive spam.
    const name = clean_(d.full_name, 100);
    const email = clean_(d.email, 200);
    const phone = clean_(d.phone, 25);
    const exam = clean_(d.target_exam, 100);
    const program = clean_(d.program, 100);
    const message = clean_(d.message, 1500);
    const consent = d.consent === "on" || d.consent === true || d.consent === "true";
    if (!name || !email || !phone || !program || !consent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return output_({ ok: false, message: "Please check the required fields." });
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      let sheet = ss.getSheetByName(TAB_NAME);
      if (!sheet) { setupSheet(); sheet = ss.getSheetByName(TAB_NAME); }
      sheet.appendRow([
        new Date(), name, email, phone, exam, program, message,
        "Yes", clean_(d.page_url, 500), "New"
      ]);
    } finally {
      lock.releaseLock();
    }
    return output_({ ok: true });
  } catch (err) {
    console.error(err);
    return output_({ ok: false, message: "Submission could not be processed." });
  }
}

function doGet() {
  return output_({ service: "Lex Academy enquiry endpoint", status: "available" });
}

function clean_(value, maxLen) {
  let s = String(value == null ? "" : value).trim().slice(0, maxLen);
  // Prevent spreadsheet formula injection.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}