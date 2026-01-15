/**
 * データ取得用 (LIFF起動時に実行)
 */
function doGet(e) {
  const lineId = e.parameter.line_id;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('名簿');
  let data = null;

  if (sheet && lineId) {
    const rows = sheet.getDataRange().getValues();
    // LINE IDで検索 (B列)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === lineId) {
        data = {
          name: rows[i][3],       // D列
          kana: rows[i][4],       // E列
          group: rows[i][5],      // F列
          address: rows[i][6],    // G列
          is_digital: rows[i][7]  // H列
        };
        break;
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * データ保存用 (登録ボタン押下時に実行)
 */
function doPost(e) {
  // 以前作成したdoPostと同じ内容でOKです
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('名簿') || ss.insertSheet('名簿');
    
    // ヘッダーがない場合は作成
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['created_at', 'line_id', 'line_name', 'name', 'kana', 'group', 'address', 'is_digital', 'updated_at']);
    }

    const rows = sheet.getDataRange().getValues();
    const now = new Date();
    let targetRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === params.line_id) { targetRowIndex = i + 1; break; }
    }

    if (targetRowIndex !== -1) {
      sheet.getRange(targetRowIndex, 4, 1, 6).setValues([[params.name, params.kana, params.group, params.address, params.is_digital, now]]);
    } else {
      sheet.appendRow([now, params.line_id, params.line_name, params.name, params.kana, params.group, params.address, params.is_digital, now]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}