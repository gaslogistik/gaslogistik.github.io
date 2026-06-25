window.SharedData={

cache:null,

async loadData(){
if(this.cache) return this.cache;

const r=await fetch(
"https://script.google.com/macros/s/AKfycbwbZ_KSjyTTDM2iONJC87-jgVZysubMfKChDxDs8l1RKJgjUJ6Q2_7oA_RhuDna39Ra/exec?action=getSystemData"
);

if(!r.ok){
throw new Error("Brak danych systemowych");
}

this.cache=await r.json();

return this.cache;
},

async buildMatrix(){
const d=await this.loadData();
return d.cities||[];
},

async buildRelations(){
const d=await this.loadData();
return d.relations||[];
},

async buildAddresses(){
const d=await this.loadData();
return d.cities||[];
},

async getAdminUsers(){
const d=await this.loadData();
return d.admin||[];
}
};

window.buildMatrix=()=>window.SharedData.buildMatrix();
window.buildRelations=()=>window.SharedData.buildRelations();
window.buildAddresses=()=>window.SharedData.buildAddresses();
window.getAdminUsers=()=>window.SharedData.getAdminUsers();
/* Stage 3 prepared */

/* PRODUCTION_STAGE3: shared-data.js */

// Stage3 Shared Helpers
window.fileIcon=function(name){const e=name.split('.').pop().toLowerCase();return ({pdf:'📕',docx:'📘',xlsx:'📗',jpg:'🖼️',png:'🖼️',mp4:'🎬'})[e]||'📄';};

/* Stage 3 Final Clean baseline */
