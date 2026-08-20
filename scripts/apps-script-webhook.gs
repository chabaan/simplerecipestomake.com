// ============================================
// Receives published URL from GitHub automation and writes it
// into the "Live Site URL" column, matched by article title.
// Add this function to your existing Apps Script — do not remove
// anything else already in the file.
// ============================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var title = payload.title;
    var liveUrl = payload.url;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Article');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var titleCol = headers.indexOf('Article Title');
    var urlCol = headers.indexOf('Live Site URL');

    if (titleCol === -1 || urlCol === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Missing "Article Title" or "Live Site URL" column'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    for (var i = 1; i < data.length; i++) {
      if (data[i][titleCol] === title) {
        sheet.getRange(i + 1, urlCol + 1).setValue(liveUrl);
        return ContentService.createTextOutput(JSON.stringify({
          success: true, row: i + 1
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      error: 'Title not found: ' + title
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
