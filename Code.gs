var spreadsheetId = 'ABC123';
var rangeName = 'A2:D2';

var seperator = '`';

function validate(e) {
  if (!e || !e.postData) return [false, 'No Data'];
  var contents = e.postData.contents;
  if (!contents) return [false, 'No Data Contents'];
  if (contents.length === 0) return [false, 'Empty Content'];
  if (contents.indexOf(seperator) == -1) return [false, 'No separator found in content.'];
  if (e.contentLength > 10000) return [false, 'Your feedback is too Long!'];
  if (e.postData.type != "neosfeedback/csv") return [false, 'Wrong MIME: ' + e.postData.type];

  var data = e.postData.contents.split(seperator);
  if (data[1].length === 0) return [false, 'Empty Content'];

  return [true, ""];
}

function doPost(e) {
  var validation = validate(e);
  if (!validation[0]) {
    return ContentService.createTextOutput('Invalid input: '+ validation[1]);
  }

  var data = e.postData.contents.split(seperator);
  if (logFeedback(data[0], data[1])) {
    var responseText = 'Thank you for your feedback!';

    if (data[0].toLowerCase() !== 'anonymous') {
      responseText = responseText + ' Prime may get in touch with you later.';
    }
    
    return ContentService.createTextOutput('Thank you for your feedback!');
  }

  return ContentService.createTextOutput('Something went wrong, please try again!');
}

function logFeedback(username, feedback) {
  var newRow = Sheets.newRowData();
  newRow.values = [
    [
      new Date().toISOString(),
      username,
      feedback
    ]
  ];

  var result = Sheets.Spreadsheets.Values.append(newRow, spreadsheetId, rangeName, {
    valueInputOption: 'RAW'
  });
  return result.updates.updatedRows > 0;
}
