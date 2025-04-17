function doPost(e) {
  var sheet = SpreadsheetApp.openById("{SPREADSHEET ID HERE}").getSheets()[0]; 
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.coder, data.videoId, data.timestamp, data.type, data.duration, data.code, data.notes]);
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.JSON);
}