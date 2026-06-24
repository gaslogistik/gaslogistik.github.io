const SPREADSHEET_ID =
"13ZK4mIeFReFqx6KPR0b53E_SvMtEMkayN78GB0P_1-E";

function doGet(e) {

const action =
String(e.parameter.action || "")
.toLowerCase();

if (action === "login") {
return handleLogin(e);
}

if (action === "getsettings") {
return getSettings();
}

if (action === "getalerts") {
return getAlerts();
}

if (action === "getsystemdata") {
return getSystemData();
}
if (action === "getmatrixdata") {
return getMatrixData();
}
if (action === "getmapdata") {
return getMapData();
}
if (action === "getadmindata") {
return getAdminData();
}
if (action === "getvehiclesdata") {
return getVehiclesData();
}

return json_({
success:false,
message:"Unknown action",
action
});
}

function doPost(e) {

try {

const data =
  JSON.parse(e.postData.contents);

const ss =
  SpreadsheetApp.openById(
    SPREADSHEET_ID
  );

const sh =
  ss.getSheetByName(
    "LOGIN_HISTORY"
  );

const nextId =
  Math.max(sh.getLastRow(), 1);

sh.appendRow([
  nextId,
  Utilities.formatDate(
    new Date(),
    "Europe/Warsaw",
    "yyyy-MM-dd HH:mm:ss"
  ),
  data.user || "",
  data.page || "",
  data.result || ""
]);

return ContentService
  .createTextOutput("OK");

} catch(err) {

return ContentService
  .createTextOutput(
    err.toString()
  );

}
}

function handleLogin(e){

const user =
String(e.parameter.user || "")
.trim()
.toUpperCase();

const pass =
String(e.parameter.pass || "");

const ss =
SpreadsheetApp.openById(
SPREADSHEET_ID
);

const sh =
ss.getSheetByName(
"USERS"
);

const data =
sh.getDataRange()
.getValues();

for (let r = 1; r < data.length; r++) {

const rowUser =
  String(data[r][0] || "")
    .trim()
    .toUpperCase();

const rowPass =
  String(data[r][1] || "");

const rowActive =
  String(data[r][2] || "")
    .trim()
    .toUpperCase();

if (
  rowUser === user &&
  rowPass === pass &&
  rowActive === "YES"
) {

  const loginCount =
    Number(data[r][3] || 0) + 1;

  sh.getRange(
    r + 1,
    4
  ).setValue(loginCount);

  sh.getRange(
    r + 1,
    5
  ).setValue(
    Utilities.formatDate(
      new Date(),
      "Europe/Warsaw",
      "yyyy-MM-dd HH:mm:ss"
    )
  );

  return json_({
    success:true,
    user:user,
    role:String(
      data[r][5] || "USER"
    )
  });
}

}

return json_({
success:false
});
}

function getSettings(){

const ss =
SpreadsheetApp.openById(
SPREADSHEET_ID
);

const sh =
ss.getSheetByName(
"SETTINGS"
);

const rows =
sh.getDataRange()
.getValues();

const result = {};

for(let i=1;i<rows.length;i++){

result[
  String(rows[i][0])
] = rows[i][1];

}

const payload = JSON.stringify(result);

const cache = CacheService.getScriptCache();
cache.put(
  "settingsData",
  payload,
  300
);

return ContentService
.createTextOutput(payload)
.setMimeType(
ContentService.MimeType.JSON
);
}

function getAlerts(){

const ss =
SpreadsheetApp.openById(
SPREADSHEET_ID
);

const sh =
ss.getSheetByName(
"ALERTS_DATA"
);

return json_(
sheetToObjects_(sh)
);
}

function getSystemData(){

const cache = CacheService.getScriptCache();
const cached = cache.get("systemData");

if(cached){
  return ContentService
    .createTextOutput(cached)
    .setMimeType(ContentService.MimeType.JSON);
}

const ss =
SpreadsheetApp.openById(
SPREADSHEET_ID
);

const result = {

users:
  sheetToObjects_(
    ss.getSheetByName(
      "USERS"
    )
  ),

cities:
  sheetToObjects_(
    ss.getSheetByName(
      "CITIES"
    )
  ),

addresses:
  sheetToObjects_(
    ss.getSheetByName(
      "ADDRESSES"
    )
  ),

relations:
  sheetToObjects_(
    ss.getSheetByName(
      "RELATIONS"
    )
  ),

admin:
  sheetToObjects_(
    ss.getSheetByName(
      "ADMIN"
    )
  ),

trucks:
  sheetToObjects_(
    ss.getSheetByName(
      "TRUCKS"
    )
  ),

tanktrailers:
  sheetToObjects_(
    ss.getSheetByName(
      "TANKTRAILERS"
    )
  ),

contact:
  sheetToObjects_(
    ss.getSheetByName(
      "CONTACT"
    )
  )

};

const payload = JSON.stringify(result);

cache.put(
  "systemData",
  payload,
  300
);

return ContentService
.createTextOutput(payload)
.setMimeType(
ContentService.MimeType.JSON
);
}

function sheetToObjects_(sheet){

if(!sheet) return [];

const values =
sheet.getDataRange()
.getValues();

if(values.length < 2)
return [];

const headers =
values[0];

return values
.slice(1)
.map(row => {

  const obj = {};

  headers.forEach(
    (h,i) => {

      obj[String(h).trim()] =
        row[i];

    }
  );

  return obj;
});

}

function json_(obj){

return ContentService
.createTextOutput(
JSON.stringify(obj)
)
.setMimeType(
ContentService.MimeType.JSON
);
}
function getMatrixData(){
const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
return json_({
relations: sheetToObjects_(ss.getSheetByName("RELATIONS")),
trucks: sheetToObjects_(ss.getSheetByName("TRUCKS")),
tanktrailers: sheetToObjects_(ss.getSheetByName("TANKTRAILERS"))
});
}

function getMapData(){
const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
return json_({
cities: sheetToObjects_(ss.getSheetByName("CITIES")),
addresses: sheetToObjects_(ss.getSheetByName("ADDRESSES"))
});
}

function getAdminData(){
const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
return json_({
users: sheetToObjects_(ss.getSheetByName("USERS")),
admin: sheetToObjects_(ss.getSheetByName("ADMIN"))
});
}

function getVehiclesData(){
const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
return json_({
trucks: sheetToObjects_(ss.getSheetByName("TRUCKS")),
tanktrailers: sheetToObjects_(ss.getSheetByName("TANKTRAILERS"))
});
}


// ================= ADR TELEGRAM MODULE =================

const TELEGRAM_TOKEN = "8631862416:AAERQC7GpSSkDQHIJgBxwjzTYnGo_VZGPvA";
const TELEGRAM_CHAT_ID = "8281032784";

function sendTelegramMessage_(message){

const url =
"https://api.telegram.org/bot" +
TELEGRAM_TOKEN +
"/sendMessage";

UrlFetchApp.fetch(url,{
method:"post",
payload:{
chat_id:TELEGRAM_CHAT_ID,
text:message
},
muteHttpExceptions:true
});

}

function checkADRNotifications(){

const ss =
SpreadsheetApp.openById(
SPREADSHEET_ID
);

const report = [];

checkADRSheet_(
ss.getSheetByName("TRUCKS"),
"TRUCK",
report
);

checkADRSheet_(
ss.getSheetByName("TANKTRAILERS"),
"TANKTRAILER",
report
);

if(report.length){

const adrMsg = "ADR REMINDERS\n\n" + report.join("\n\n");
sendTelegramMessage_(adrMsg);
sendEmailNotification_("ADR Reminder", adrMsg);

}

}

function checkADRSheet_(sheet,type,report){

if(!sheet) return;

const rows =
sheet.getDataRange()
.getValues();

if(rows.length < 2) return;

const headers = rows[0];

const plateIndex =
headers.indexOf("PLATES");

const adrIndex =
headers.indexOf("ADR VALID");

if(
plateIndex === -1 ||
adrIndex === -1
) return;

const today = new Date();
today.setHours(0,0,0,0);

for(let i=1;i<rows.length;i++){

const plates =
String(rows[i][plateIndex] || "").trim();

const adrValue =
rows[i][adrIndex];

if(!adrValue) continue;

const adrDate =
new Date(adrValue);

adrDate.setHours(0,0,0,0);

const days =
Math.round(
(adrDate - today) / 86400000
);

if(days === 21 || days === 7){

report.push(
type + ": " + plates +
"\nADR VALID: " +
Utilities.formatDate(
adrDate,
Session.getScriptTimeZone(),
"dd.MM.yyyy"
) +
"\nRemaining: " +
days + " days"
);

}

}

}

function createADRTrigger(){

const triggers =
ScriptApp.getProjectTriggers();

for(let i=0;i<triggers.length;i++){

if(
triggers[i].getHandlerFunction() ===
"checkADRNotifications"
){
return;
}

}

ScriptApp.newTrigger(
"checkADRNotifications"
)
.timeBased()
.everyDays(1)
.atHour(8)
.create();

}

function testTelegramADR(){

sendTelegramMessage_(
"KP GASLOGISTIK\nTelegram ADR notifications are working."
);

}


// ================= UNIVERSAL REMINDERS =================

function checkReminders(){

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sh = ss.getSheetByName("REMINDERS");

if(!sh) return;

const rows = sh.getDataRange().getValues();
if(rows.length < 2) return;

const headers = rows[0];

const titleIdx = headers.indexOf("TITLE");
const dateIdx = headers.indexOf("EVENT_DATE");
const days1Idx = headers.indexOf("DAYS_1");
const days2Idx = headers.indexOf("DAYS_2");
const priorityIdx = headers.indexOf("PRIORITY");
const activeIdx = headers.indexOf("ACTIVE");

const today = new Date();
today.setHours(0,0,0,0);

for(let i=1;i<rows.length;i++){

const active = String(rows[i][activeIdx] || "").toUpperCase();
if(active !== "YES") continue;

const title = String(rows[i][titleIdx] || "").trim();
const eventDate = new Date(rows[i][dateIdx]);

if(!title || !eventDate) continue;

eventDate.setHours(0,0,0,0);

const days = Math.round((eventDate - today)/86400000);

const d1 = Number(rows[i][days1Idx] || 0);
const d2 = Number(rows[i][days2Idx] || 0);

if(days === d1 || days === d2){

const msg =
"🔔 REMINDER\n\n" +
title +
"\n\nDate: " +
Utilities.formatDate(
eventDate,
Session.getScriptTimeZone(),
"dd.MM.yyyy"
) +
"\nRemaining: " +
days + " days";

sendTelegramMessage_(msg);
sendEmailNotification_("Reminder", msg);

try{

const alertSheet =
ss.getSheetByName("ALERTS_DATA");

if(alertSheet){

alertSheet.appendRow([
"REM-" + new Date().getTime(),
"Reminder",
msg,
"YES",
String(rows[i][priorityIdx] || "MEDIUM")
]);

}

}catch(err){}

}

}

}

function dailyNotifications(){

checkADRNotifications();
checkReminders();

}

function createDailyNotificationsTrigger(){

const triggers =
ScriptApp.getProjectTriggers();

for(let i=0;i<triggers.length;i++){

if(
triggers[i].getHandlerFunction() ===
"dailyNotifications"
){
return;
}

}

ScriptApp.newTrigger("dailyNotifications")
.timeBased()
.everyDays(1)
.atHour(8)
.create();

}


function getNotificationSettings_(){

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
const sh = ss.getSheetByName("SETTINGS");

const rows = sh.getDataRange().getValues();
const cfg = {};

for(let i=1;i<rows.length;i++){
cfg[String(rows[i][0]).trim()] = String(rows[i][1]).trim();
}

return cfg;

}

function sendEmailNotification_(subject,message){

try{

const cfg = getNotificationSettings_();

if(
String(cfg.EMAIL_NOTIFICATIONS).toUpperCase() !== "YES"
) return;

const email = cfg.NOTIFICATION_EMAIL;
if(!email) return;

MailApp.sendEmail({
to: email,
subject: subject,
body: message
});

}catch(err){}

}


function testEmailNotification(){

sendEmailNotification_(
"KP GASLOGISTIK - Email Test",
"Email notifications are working correctly."
);

}
