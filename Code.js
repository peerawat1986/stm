const SHEET_ID = '18GiG6lD4YmZWyheCByXA9Sqs1wpbJKuU5NPMwgDCAgQ';

// GET request handler for web app
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('ระบบแจ้งผลการแข่งขันวันวิทยาศาสตร์')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Function to include other HTML files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// API: Verify Teacher Login
function verifyLogin(username, password) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('รายชื่อครู');
    if (!sheet) return { success: false, message: 'ไม่พบแผ่นงานรายชื่อครู' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indexes
    const nameColIdx = headers.indexOf('ชื่อ_สกุล');
    const pwdColIdx = headers.indexOf('ข้อมูลApp');

    if (nameColIdx === -1 || pwdColIdx === -1) {
      return { success: false, message: 'โครงสร้างคอลัมน์ไม่ถูกต้อง' };
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][nameColIdx] === username && data[i][pwdColIdx] === password) {
        return {
          success: true,
          user: {
            name: username
          }
        };
      }
    }

    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Search Student by Code, Name, or Room
function searchStudent(query) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('รายชื่อนักเรียน');
    if (!sheet) return { success: false, message: 'ไม่พบแผ่นงานรายชื่อนักเรียน' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const codeColIdx = headers.indexOf('รหัสนักเรียนจริง');
    const nameColIdx = headers.indexOf('ชื่อ นามสกุล');
    const roomColIdx = headers.indexOf('ห้อง');
    const numberColIdx = headers.indexOf('เลขที่');
    const picColIdx = headers.indexOf('รูป');

    if (codeColIdx === -1) {
      return { success: false, message: 'ไม่พบคอลัมน์รหัสนักเรียนจริง' };
    }

    const results = [];
    const lowerQuery = query.toString().toLowerCase();

    for (let i = 1; i < data.length; i++) {
      const codeStr = data[i][codeColIdx] ? data[i][codeColIdx].toString().toLowerCase() : '';
      const nameStr = (nameColIdx !== -1 && data[i][nameColIdx]) ? data[i][nameColIdx].toString().toLowerCase() : '';
      const roomStr = (roomColIdx !== -1 && data[i][roomColIdx]) ? data[i][roomColIdx].toString().toLowerCase() : '';

      if (codeStr.includes(lowerQuery) || nameStr.includes(lowerQuery) || roomStr.includes(lowerQuery)) {
        results.push({
          id: data[i][codeColIdx],
          name: nameColIdx !== -1 ? data[i][nameColIdx] : '',
          room: roomColIdx !== -1 ? data[i][roomColIdx] : '',
          number: numberColIdx !== -1 ? data[i][numberColIdx] : '',
          image: picColIdx !== -1 ? data[i][picColIdx] : ''
        });
      }
    }

    if (results.length > 0) {
      return { success: true, data: results };
    }

    return { success: false, message: 'ไม่พบข้อมูลนักเรียน' };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Save Multiple Registrations
function saveMultipleRegistrations(dataArray) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');

    // Create sheet if not exists
    let existingData = sheet.getDataRange().getValues();
    let headers = existingData[0];

    if (!headers || headers.length === 0) {
      headers = ['วันที่บันทึก', 'รหัสนักเรียน', 'ชื่อ นามสกุล', 'ห้อง', 'รายการแข่งขัน', 'ผู้บันทึก', 'ผลรางวัล', 'เลขที่เกียรติบัตร', 'ลิงก์เกียรติบัตร'];
      sheet.appendRow(headers);
      existingData = [headers];
    } else {
      const requiredHeaders = ['ห้อง', 'ผลรางวัล', 'เลขที่เกียรติบัตร', 'ลิงก์เกียรติบัตร'];
      requiredHeaders.forEach(col => {
        if (headers.indexOf(col) === -1) {
          headers.push(col);
          sheet.getRange(1, headers.length).setValue(col);
        }
      });
      existingData[0] = headers;
    }

    const timestamp = new Date();
    const rows = [];

    const idCol = headers.indexOf('รหัสนักเรียน');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const certNumCol = headers.indexOf('เลขที่เกียรติบัตร');
    const awardCol = headers.indexOf('ผลรางวัล');

    let maxCertNum = 255;
    if (certNumCol !== -1) {
      for (let i = 1; i < existingData.length; i++) {
        const num = parseInt(existingData[i][certNumCol], 10);
        if (!isNaN(num) && num > maxCertNum) {
          maxCertNum = num;
        }
      }
    }

    let addedCount = 0;

    for (const data of dataArray) {
      const incomingAward = data.award || 'เข้าร่วม';
      let isDuplicate = false;
      if (idCol !== -1 && compCol !== -1) {
        for (let i = 1; i < existingData.length; i++) {
          if (existingData[i][idCol].toString() === data.studentId.toString() &&
            existingData[i][compCol].toString() === data.competitionName.toString()) {

            const existingAward = awardCol !== -1 ? existingData[i][awardCol].toString() : '';
            if (incomingAward === 'เป็นคณะดำเนินงาน') {
              if (existingAward === 'เป็นคณะดำเนินงาน') {
                isDuplicate = true;
                break;
              }
            } else {
              if (existingAward !== 'เป็นคณะดำเนินงาน') {
                isDuplicate = true;
                break;
              }
            }
          }
        }
      }

      if (!isDuplicate) {
        maxCertNum++; // Auto-increment certificate number
        const row = new Array(headers.length).fill('');
        const setVal = (colName, val) => {
          const idx = headers.indexOf(colName);
          if (idx !== -1) row[idx] = val;
        };

        setVal('วันที่บันทึก', timestamp);
        setVal('รหัสนักเรียน', data.studentId);
        setVal('ชื่อ นามสกุล', data.studentName);
        setVal('ห้อง', data.studentRoom || '');
        setVal('รายการแข่งขัน', data.competitionName);
        setVal('ผู้บันทึก', data.teacherName);
        setVal('ผลรางวัล', data.award || 'เข้าร่วม');
        setVal('เลขที่เกียรติบัตร', maxCertNum);
        setVal('ลิงก์เกียรติบัตร', '');

        rows.push(row);
        addedCount++;
      }
    }

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      return { success: true, message: `บันทึกลงทะเบียนสำเร็จ` };
    } else {
      return { success: false, message: 'นักเรียนที่เลือก ได้ลงทะเบียนในรายการนี้ไปแล้ว' };
    }

  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Get Teacher's Registrations
function getTeacherRegistrations(teacherName) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: true, data: [] };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };

    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const nameCol = headers.indexOf('ชื่อ นามสกุล');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const teacherCol = headers.indexOf('ผู้บันทึก');
    const roomCol = headers.indexOf('ห้อง');
    const awardCol = headers.indexOf('ผลรางวัล');

    if (teacherCol === -1 || idCol === -1 || nameCol === -1 || compCol === -1) {
      return { success: true, data: [] };
    }

    const results = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][teacherCol].toString() === teacherName) {
        results.push({
          id: data[i][idCol],
          name: data[i][nameCol],
          comp: data[i][compCol],
          room: roomCol !== -1 ? data[i][roomCol] : '',
          award: awardCol !== -1 ? data[i][awardCol] : 'เข้าร่วม'
        });
      }
    }

    return { success: true, data: results };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Delete Registration
function deleteRegistration(studentId, compName, teacherName, targetAward) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Check if teacher is responsible for this competition
    let isResponsible = false;
    const compSheet = ss.getSheetByName('รายการแข่งขัน');
    if (compSheet) {
      const compData = compSheet.getDataRange().getValues();
      const headers = compData[0];
      const nameColIdx = headers.indexOf('รายการ');
      const t1ColIdx = headers.indexOf('ครูที่รับผิดชอบ1');
      const t2ColIdx = headers.indexOf('ครูที่รับผิดชอบ2');
      if (nameColIdx !== -1) {
        for (let i = 1; i < compData.length; i++) {
          if (compData[i][nameColIdx] === compName) {
            const t1 = t1ColIdx !== -1 ? compData[i][t1ColIdx] : '';
            const t2 = t2ColIdx !== -1 ? compData[i][t2ColIdx] : '';
            if (teacherName === t1 || teacherName === t2) isResponsible = true;
            break;
          }
        }
      }
    }

    const sheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: false, message: 'ไม่พบฐานข้อมูล' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const teacherCol = headers.indexOf('ผู้บันทึก');

    const awardCol = headers.indexOf('ผลรางวัล');
    const certLinkCol = headers.indexOf('ลิงก์เกียรติบัตร');

    if (idCol === -1 || compCol === -1 || teacherCol === -1) {
      return { success: false, message: 'โครงสร้างข้อมูลไม่ถูกต้อง' };
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString() === studentId.toString() &&
        data[i][compCol].toString() === compName.toString() &&
        (isResponsible || data[i][teacherCol].toString() === teacherName.toString())) {

        const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
        if (targetAward && currentAward !== targetAward) {
          continue; // Skip if it's not the correct row
        }

        if (certLinkCol !== -1) {
          const oldUrl = data[i][certLinkCol];
          if (oldUrl) deletePdfFile(oldUrl);
        }

        sheet.deleteRow(i + 1);
        return { success: true, message: 'ลบข้อมูลสำเร็จ' };
      }
    }

    return { success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ หรือคุณไม่มีสิทธิ์' };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Delete Multiple Registrations
function deleteMultipleRecentRegistrations(records, teacherName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: false, message: 'ไม่พบฐานข้อมูล' };

    const compSheet = ss.getSheetByName('รายการแข่งขัน');
    let compData = [];
    let nameColIdx = -1, t1ColIdx = -1, t2ColIdx = -1;
    if (compSheet) {
      compData = compSheet.getDataRange().getValues();
      const cHeaders = compData[0];
      nameColIdx = cHeaders.indexOf('รายการ');
      t1ColIdx = cHeaders.indexOf('ครูที่รับผิดชอบ1');
      t2ColIdx = cHeaders.indexOf('ครูที่รับผิดชอบ2');
    }

    // Helper to check responsibility
    function isResponsibleFunc(cName) {
      if (nameColIdx !== -1) {
        for (let i = 1; i < compData.length; i++) {
          if (compData[i][nameColIdx] === cName) {
            const t1 = t1ColIdx !== -1 ? compData[i][t1ColIdx] : '';
            const t2 = t2ColIdx !== -1 ? compData[i][t2ColIdx] : '';
            if (teacherName === t1 || teacherName === t2) return true;
          }
        }
      }
      return false;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const teacherCol = headers.indexOf('ผู้บันทึก');
    const awardCol = headers.indexOf('ผลรางวัล');
    const certLinkCol = headers.indexOf('ลิงก์เกียรติบัตร');

    if (idCol === -1 || compCol === -1 || teacherCol === -1) {
      return { success: false, message: 'โครงสร้างข้อมูลไม่ถูกต้อง' };
    }

    let rowsToDelete = [];

    // Find rows to delete
    for (let r = 0; r < records.length; r++) {
      const rec = records[r];
      const isResp = isResponsibleFunc(rec.compName);

      for (let i = 1; i < data.length; i++) {
        // Skip if this row is already marked for deletion
        if (rowsToDelete.includes(i + 1)) continue;

        if (data[i][idCol].toString() === rec.studentId.toString() &&
          data[i][compCol].toString() === rec.compName.toString() &&
          (isResp || data[i][teacherCol].toString() === teacherName.toString())) {

          const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
          if (rec.targetAward && currentAward !== rec.targetAward) {
            continue;
          }

          if (certLinkCol !== -1) {
            const oldUrl = data[i][certLinkCol];
            if (oldUrl) deletePdfFile(oldUrl);
          }

          rowsToDelete.push(i + 1);
          break; // Found the row for this record
        }
      }
    }

    if (rowsToDelete.length === 0) {
      return { success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ หรือคุณไม่มีสิทธิ์' };
    }

    // Sort descending to delete from bottom up (preserves row indices)
    rowsToDelete.sort((a, b) => b - a);

    // Delete rows
    for (const rIndex of rowsToDelete) {
      sheet.deleteRow(rIndex);
    }

    return { success: true, message: `ลบข้อมูลสำเร็จ ${rowsToDelete.length} รายการ` };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Update Registration (Change Competition)
function updateRegistration(studentId, oldCompName, newCompName, teacherName, targetAward) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Check if teacher is responsible for this competition
    let isResponsible = false;
    const compSheet = ss.getSheetByName('รายการแข่งขัน');
    if (compSheet) {
      const compData = compSheet.getDataRange().getValues();
      const headers = compData[0];
      const nameColIdx = headers.indexOf('รายการ');
      const t1ColIdx = headers.indexOf('ครูที่รับผิดชอบ1');
      const t2ColIdx = headers.indexOf('ครูที่รับผิดชอบ2');
      if (nameColIdx !== -1) {
        for (let i = 1; i < compData.length; i++) {
          if (compData[i][nameColIdx] === oldCompName) {
            const t1 = t1ColIdx !== -1 ? compData[i][t1ColIdx] : '';
            const t2 = t2ColIdx !== -1 ? compData[i][t2ColIdx] : '';
            if (teacherName === t1 || teacherName === t2) isResponsible = true;
            break;
          }
        }
      }
    }

    const sheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: false, message: 'ไม่พบฐานข้อมูล' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const teacherCol = headers.indexOf('ผู้บันทึก');

    if (idCol === -1 || compCol === -1 || teacherCol === -1) {
      return { success: false, message: 'โครงสร้างข้อมูลไม่ถูกต้อง' };
    }

    const awardCol = headers.indexOf('ผลรางวัล');

    // Prevent updating to a competition the student is already registered for
    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString() === studentId.toString() &&
        data[i][compCol].toString() === newCompName.toString()) {
        const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
        if (targetAward && currentAward === targetAward) {
          return { success: false, message: 'นักเรียนได้ลงทะเบียนในรายการที่จะเปลี่ยนไปแล้ว' };
        }
      }
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString() === studentId.toString() &&
        data[i][compCol].toString() === oldCompName.toString() &&
        (isResponsible || data[i][teacherCol].toString() === teacherName.toString())) {

        const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
        if (targetAward && currentAward !== targetAward) {
          continue; // Skip if it's not the correct row
        }

        const certLinkCol = headers.indexOf('ลิงก์เกียรติบัตร');
        if (certLinkCol !== -1) {
          const oldUrl = data[i][certLinkCol];
          if (oldUrl) deletePdfFile(oldUrl);
          sheet.getRange(i + 1, certLinkCol + 1).setValue('');
        }

        // Update the competition name cell
        sheet.getRange(i + 1, compCol + 1).setValue(newCompName);
        return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
      }
    }

    return { success: false, message: 'ไม่พบข้อมูลที่ต้องการแก้ไข หรือคุณไม่มีสิทธิ์' };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Save Competition Result
function saveResult(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Validate permission
    const compSheet = ss.getSheetByName('รายการแข่งขัน');
    if (compSheet) {
      const compData = compSheet.getDataRange().getValues();
      const headers = compData[0];
      const nameColIdx = headers.indexOf('รายการ');
      const t1ColIdx = headers.indexOf('ครูที่รับผิดชอบ1');
      const t2ColIdx = headers.indexOf('ครูที่รับผิดชอบ2');

      let isAllowed = false;
      if (nameColIdx !== -1) {
        for (let i = 1; i < compData.length; i++) {
          if (compData[i][nameColIdx] === data.competitionName) {
            const t1 = t1ColIdx !== -1 ? compData[i][t1ColIdx] : '';
            const t2 = t2ColIdx !== -1 ? compData[i][t2ColIdx] : '';
            if (data.teacherName === t1 || data.teacherName === t2) {
              isAllowed = true;
              break;
            }
          }
        }
      }
      if (!isAllowed) {
        return { success: false, message: 'คุณไม่มีสิทธิ์บันทึกผลรายการนี้' };
      }
    }

    let sheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: false, message: 'ไม่พบฐานข้อมูลลงทะเบียน' };

    const resultData = sheet.getDataRange().getValues();
    const headers = resultData[0];
    const stdIdIdx = headers.indexOf('รหัสนักเรียน');
    const compNameIdx = headers.indexOf('รายการแข่งขัน');
    const awardIdx = headers.indexOf('ผลรางวัล');
    const certIdx = headers.indexOf('ลิงก์เกียรติบัตร');

    let rowIndex = -1;
    for (let i = 1; i < resultData.length; i++) {
      if (resultData[i][stdIdIdx].toString() === data.studentId.toString() &&
        resultData[i][compNameIdx] === data.competitionName) {
        const currentAward = awardIdx !== -1 && resultData[i][awardIdx] ? resultData[i][awardIdx].toString() : 'เข้าร่วม';
        if (data.originalAward && currentAward !== data.originalAward) {
          continue; // Skip to find the exact row
        }
        rowIndex = i + 1; // +1 because array is 0-indexed and sheet is 1-indexed
        break;
      }
    }

    if (rowIndex > -1) {
      // Clear certificate if award changed
      if (certIdx > -1) {
        const oldUrl = resultData[rowIndex - 1][certIdx];
        if (oldUrl) deletePdfFile(oldUrl);
        sheet.getRange(rowIndex, certIdx + 1).setValue('');
      }

      // Update existing row
      if (awardIdx > -1) sheet.getRange(rowIndex, awardIdx + 1).setValue(data.award);
      return { success: true, message: 'อัปเดตผลการแข่งขันเรียบร้อยแล้ว' };
    } else {
      return { success: false, message: 'ไม่พบข้อมูลการลงทะเบียนของนักเรียนในรายการนี้' };
    }
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Get Results for Public
function getPublicResults() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('ลงทะเบียนแข่งขัน');
    if (!sheet) return { success: true, data: [] }; // No results yet

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };

    const headers = data[0];
    const results = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const resultObj = {};
      headers.forEach((header, index) => {
        let val = row[index];
        if (val && Object.prototype.toString.call(val) === '[object Date]') {
          val = val.toString();
        }
        resultObj[header] = val;
      });
      results.push(resultObj);
    }

    return { success: true, data: results };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Get Teacher List
function getTeacherList() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('รายชื่อครู');
    if (!sheet) return { success: false, message: 'ไม่พบแผ่นงานรายชื่อครู' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };

    const headers = data[0];
    const nameColIdx = headers.indexOf('ชื่อ_สกุล');

    if (nameColIdx === -1) return { success: false, message: 'ไม่พบคอลัมน์ ชื่อ_สกุล' };

    const teachers = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][nameColIdx]) {
        teachers.push(data[i][nameColIdx].toString());
      }
    }

    return { success: true, data: teachers };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Get Competitions
function getCompetitions() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('รายการแข่งขัน');
    if (!sheet) return { success: false, message: 'ไม่พบแผ่นงานรายการแข่งขัน' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };

    const headers = data[0];
    const nameColIdx = headers.indexOf('รายการ');
    const t1ColIdx = headers.indexOf('ครูที่รับผิดชอบ1');
    const t2ColIdx = headers.indexOf('ครูที่รับผิดชอบ2');

    if (nameColIdx === -1) return { success: false, message: 'ไม่พบคอลัมน์ รายการ' };

    const competitions = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][nameColIdx]) {
        competitions.push({
          name: data[i][nameColIdx].toString(),
          t1: t1ColIdx !== -1 ? data[i][t1ColIdx].toString() : '',
          t2: t2ColIdx !== -1 ? data[i][t2ColIdx].toString() : ''
        });
      }
    }

    return { success: true, data: competitions };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Get Registrations with existing results by Competition
function getRegistrationsByCompetition(competitionName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // 1. Get Registrations
    let regSheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!regSheet) return { success: true, data: [] };

    const regData = regSheet.getDataRange().getValues();
    if (regData.length <= 1) return { success: true, data: [] };

    const regHeaders = regData[0];
    const rStdIdIdx = regHeaders.indexOf('รหัสนักเรียน');
    const rStdNameIdx = regHeaders.indexOf('ชื่อ นามสกุล');
    const rRoomIdx = regHeaders.indexOf('ห้อง');
    const rCompIdx = regHeaders.indexOf('รายการแข่งขัน');

    const rAwardIdx = regHeaders.indexOf('ผลรางวัล');
    const rCertIdx = regHeaders.indexOf('ลิงก์เกียรติบัตร');
    const rCertNumIdx = regHeaders.indexOf('เลขที่เกียรติบัตร');

    if (rStdIdIdx === -1 || rCompIdx === -1) return { success: false, message: 'โครงสร้างคอลัมน์ในแผ่นงานลงทะเบียนไม่ถูกต้อง' };

    // Filter registrations for this competition
    const registeredStudents = [];
    for (let i = 1; i < regData.length; i++) {
      if (regData[i][rCompIdx] === competitionName) {
        const award = rAwardIdx !== -1 ? regData[i][rAwardIdx] : '';
        if (award === 'เป็นคณะดำเนินงาน') {
          continue; // Do not show committee in results tab
        }

        registeredStudents.push({
          studentId: regData[i][rStdIdIdx],
          studentName: regData[i][rStdNameIdx],
          studentRoom: rRoomIdx !== -1 ? regData[i][rRoomIdx] : '',
          award: award,
          certificateUrl: rCertIdx !== -1 ? regData[i][rCertIdx] : '',
          certificateNum: rCertNumIdx !== -1 ? regData[i][rCertNumIdx] : ''
        });
      }
    }

    return { success: true, data: registeredStudents };
  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

// API: Generate PDF Certificate
function generateCertificatePDF(studentId, compName, teacherName, targetAward) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Check if teacher is responsible for this competition
    let isResponsible = false;
    const compSheet = ss.getSheetByName('รายการแข่งขัน');
    if (compSheet) {
      const compData = compSheet.getDataRange().getValues();
      const headers = compData[0];
      const nameColIdx = headers.indexOf('รายการ');
      const t1ColIdx = headers.indexOf('ครูที่รับผิดชอบ1');
      const t2ColIdx = headers.indexOf('ครูที่รับผิดชอบ2');
      if (nameColIdx !== -1) {
        for (let i = 1; i < compData.length; i++) {
          if (compData[i][nameColIdx] === compName) {
            const t1 = t1ColIdx !== -1 ? compData[i][t1ColIdx] : '';
            const t2 = t2ColIdx !== -1 ? compData[i][t2ColIdx] : '';
            if (teacherName === t1 || teacherName === t2) isResponsible = true;
            break;
          }
        }
      }
    }

    const regSheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!regSheet) return { success: false, message: 'ไม่พบฐานข้อมูลลงทะเบียน' };

    const data = regSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const nameCol = headers.indexOf('ชื่อ นามสกุล');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const awardCol = headers.indexOf('ผลรางวัล');
    const certNumCol = headers.indexOf('เลขที่เกียรติบัตร');
    const certLinkCol = headers.indexOf('ลิงก์เกียรติบัตร');
    const roomCol = headers.indexOf('ห้อง');
    const teacherCol = headers.indexOf('ผู้บันทึก');

    let studentData = null;
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString() === studentId.toString() && data[i][compCol] === compName) {

        const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
        if (targetAward && currentAward !== targetAward) {
          continue; // Skip if this is not the exact row we want
        }

        let recordedBy = teacherCol !== -1 ? data[i][teacherCol].toString() : '';
        if (!isResponsible && recordedBy !== teacherName) {
          return { success: false, message: 'คุณไม่มีสิทธิ์สร้างเกียรติบัตรรายการนี้' };
        }

        studentData = {
          name: data[i][nameCol],
          award: data[i][awardCol],
          certNum: data[i][certNumCol],
          room: data[i][roomCol]
        };
        rowIndex = i + 1;
        break;
      }
    }

    if (!studentData) {
      return { success: false, message: 'ไม่พบข้อมูลนักเรียนคนนี้ในรายการแข่งขัน' };
    }

    // Google Slides and Drive processing
    const templateId = '1AVzT_tS3PNdiU87x5jdmDsYBGrEuQpKxzc0T6O2xNMk';
    const folderId = '1w0PUHTSR-1dysu8lqxEOaWheRP4hdyY9';
    const folder = DriveApp.getFolderById(folderId);

    // Create copy of template
    const newFileName = `เกียรติบัตร_${studentData.name}_${compName}`;
    const copyFile = DriveApp.getFileById(templateId).makeCopy(newFileName, folder);
    const copyId = copyFile.getId();

    // Replace text in Slides
    const presentation = SlidesApp.openById(copyId);
    const slides = presentation.getSlides();
    if (slides.length > 0) {
      const slide = slides[0];
      let rawAward = String(studentData.award || 'เข้าร่วม');
      let finalAwardText = rawAward;
      const awardPrefixes = ['ชนะเลิศ', 'รองชนะเลิศอันดับที่ 1', 'รองชนะเลิศอันดับที่ 2', 'รองชนะเลิศอันดับที่ 3', 'ชมเชย', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3'];
      if (awardPrefixes.includes(rawAward.trim())) {
        finalAwardText = 'รับรางวัล' + rawAward.trim();
      }

      slide.replaceAllText('<<ชื่อ นามสกุล>>', studentData.name || '');
      slide.replaceAllText('<<รายการแข่งขัน>>', compName || '');
      slide.replaceAllText('<<ผลรางวัล>>', finalAwardText);
      slide.replaceAllText('<<เลขที่เกียรติบัตร>>', studentData.certNum ? studentData.certNum.toString() : '');
      slide.replaceAllText('<<ห้อง>>', studentData.room || '');
    }
    presentation.saveAndClose();

    // Generate PDF
    const pdfBlob = copyFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Delete the temporary presentation
    copyFile.setTrashed(true);

    // Update sheet with PDF link
    if (certLinkCol > -1) {
      regSheet.getRange(rowIndex, certLinkCol + 1).setValue(pdfUrl);
    }

    return { success: true, message: 'สร้างเกียรติบัตรสำเร็จ', url: pdfUrl };

  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง PDF: ' + error.toString() };
  }
}

// API: Get Student PDF Generation Status
function getStudentPdfStatus() {
  const props = PropertiesService.getScriptProperties();
  const status = props.getProperty('STUDENT_PDF_ENABLED');
  return status === 'true';
}

// API: Toggle Student PDF Generation Status
function toggleStudentPdfStatus(isEnabled, teacherName) {
  if (teacherName.replace(/\s+/g, '') !== 'นายพีระวัฒน์ศรีธรรมมา') {
    return { success: false, message: 'คุณไม่มีสิทธิ์เปลี่ยนการตั้งค่านี้' };
  }
  const props = PropertiesService.getScriptProperties();
  props.setProperty('STUDENT_PDF_ENABLED', isEnabled ? 'true' : 'false');
  return { success: true, message: isEnabled ? 'เปิดระบบสร้างเกียรติบัตรให้นักเรียนแล้ว' : 'ปิดระบบสร้างเกียรติบัตรสำหรับนักเรียนแล้ว' };
}

// API: Student Generate PDF
function studentGenerateCertificatePDF(studentId, compName, targetAward) {
  try {
    if (!getStudentPdfStatus()) {
      return { success: false, message: 'ระบบสร้างเกียรติบัตรสำหรับนักเรียนถูกปิดใช้งานอยู่' };
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const regSheet = ss.getSheetByName('ลงทะเบียนแข่งขัน');
    if (!regSheet) return { success: false, message: 'ไม่พบฐานข้อมูลลงทะเบียน' };

    const data = regSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('รหัสนักเรียน');
    const nameCol = headers.indexOf('ชื่อ นามสกุล');
    const compCol = headers.indexOf('รายการแข่งขัน');
    const awardCol = headers.indexOf('ผลรางวัล');
    const certNumCol = headers.indexOf('เลขที่เกียรติบัตร');
    const certLinkCol = headers.indexOf('ลิงก์เกียรติบัตร');
    const roomCol = headers.indexOf('ห้อง');

    let studentData = null;
    let rowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idCol].toString() === studentId.toString() && data[i][compCol] === compName) {
        const currentAward = awardCol !== -1 && data[i][awardCol] ? data[i][awardCol].toString() : 'เข้าร่วม';
        if (targetAward && currentAward !== targetAward) {
          continue; // Skip if this is not the exact row we want
        }

        studentData = {
          name: data[i][nameCol],
          award: data[i][awardCol],
          certNum: data[i][certNumCol],
          room: data[i][roomCol]
        };
        rowIndex = i + 1;
        break;
      }
    }

    if (!studentData) {
      return { success: false, message: 'ไม่พบข้อมูลการลงทะเบียนของคุณในรายการนี้' };
    }

    const templateId = '1AVzT_tS3PNdiU87x5jdmDsYBGrEuQpKxzc0T6O2xNMk';
    const folderId = '1w0PUHTSR-1dysu8lqxEOaWheRP4hdyY9';
    const folder = DriveApp.getFolderById(folderId);

    const newFileName = `เกียรติบัตร_${studentData.name}_${compName}`;
    const copyFile = DriveApp.getFileById(templateId).makeCopy(newFileName, folder);
    const copyId = copyFile.getId();

    const presentation = SlidesApp.openById(copyId);
    const slides = presentation.getSlides();
    if (slides.length > 0) {
      const slide = slides[0];
      let rawAward = String(studentData.award || 'เข้าร่วม');
      let finalAwardText = rawAward;
      const awardPrefixes = ['ชนะเลิศ', 'รองชนะเลิศอันดับที่ 1', 'รองชนะเลิศอันดับที่ 2', 'รองชนะเลิศอันดับที่ 3', 'ชมเชย', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3'];
      if (awardPrefixes.includes(rawAward.trim())) {
        finalAwardText = 'รับรางวัล' + rawAward.trim();
      }

      slide.replaceAllText('<<ชื่อ นามสกุล>>', studentData.name || '');
      slide.replaceAllText('<<รายการแข่งขัน>>', compName || '');
      slide.replaceAllText('<<ผลรางวัล>>', finalAwardText);
      slide.replaceAllText('<<เลขที่เกียรติบัตร>>', studentData.certNum ? studentData.certNum.toString() : '');
      slide.replaceAllText('<<ห้อง>>', studentData.room || '');
    }
    presentation.saveAndClose();

    const pdfBlob = copyFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    copyFile.setTrashed(true);

    if (certLinkCol > -1) {
      regSheet.getRange(rowIndex, certLinkCol + 1).setValue(pdfUrl);
    }

    return { success: true, message: 'สร้างเกียรติบัตรสำเร็จ', url: pdfUrl };

  } catch (error) {
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง PDF: ' + error.toString() };
  }
}

// Helper: Delete PDF file
function deletePdfFile(url) {
  if (!url || typeof url !== 'string' || !url.includes('/d/')) return;
  try {
    const parts = url.split('/d/');
    if (parts.length > 1) {
      const idPart = parts[1].split('/')[0];
      if (idPart) {
        DriveApp.getFileById(idPart).setTrashed(true);
      }
    }
  } catch (e) {
    // Ignore error if file doesn't exist or no permission
  }
}
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const args = payload.args || [];
    let result = { success: false, message: 'Invalid action' };
    
    switch (action) {
      case 'verifyLogin': result = verifyLogin(args[0], args[1]); break;
      case 'searchStudent': result = searchStudent(args[0]); break;
      case 'saveMultipleRegistrations': result = saveMultipleRegistrations(args[0]); break;
      case 'getTeacherRegistrations': result = getTeacherRegistrations(args[0]); break;
      case 'deleteRegistration': result = deleteRegistration(args[0], args[1], args[2], args[3]); break;
      case 'deleteMultipleRecentRegistrations': result = deleteMultipleRecentRegistrations(args[0], args[1]); break;
      case 'updateRegistration': result = updateRegistration(args[0], args[1], args[2], args[3], args[4]); break;
      case 'saveResult': result = saveResult(args[0]); break;
      case 'getPublicResults': result = getPublicResults(); break;
      case 'getTeacherList': result = getTeacherList(); break;
      case 'getCompetitions': result = getCompetitions(); break;
      case 'getRegistrationsByCompetition': result = getRegistrationsByCompetition(args[0]); break;
      case 'generateCertificatePDF': result = generateCertificatePDF(args[0], args[1], args[2], args[3]); break;
      case 'getStudentPdfStatus': result = getStudentPdfStatus(); break;
      case 'toggleStudentPdfStatus': result = toggleStudentPdfStatus(args[0], args[1]); break;
      case 'studentGenerateCertificatePDF': result = studentGenerateCertificatePDF(args[0], args[1], args[2]); break;
      case 'deletePdfFile': result = deletePdfFile(args[0]); break;
      default: result = { success: false, message: 'Action not found: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'API Error: ' + error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
