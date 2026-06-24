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
