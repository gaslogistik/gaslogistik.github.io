window.SharedData={
cache,

async loadData(){
if(this.cache) return this.cache;

const r=await fetch(
"https://script.google.com/macros/s/AKfycbz9eVUGDpTGPx5-7sr3YQY-ZV71Y74FGk5qwDb_uhmyn0Q9xkEf3zig_mDVJ-xYv1iK/exec?action=getSystemData"
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
return d.addresses||[];
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