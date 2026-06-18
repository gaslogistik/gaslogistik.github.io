
window.SharedData={
 workbook:null,

 async loadWorkbook(){
   if(this.workbook) return this.workbook;
   const r=await fetch('./databank.xlsx');
   if(!r.ok) throw new Error('Brak databank.xlsx');
   const b=await r.arrayBuffer();
   this.workbook=XLSX.read(b,{type:'array'});
   return this.workbook;
 },

 async getSheet(name){
   const wb=await this.loadWorkbook();
   return XLSX.utils.sheet_to_json(wb.Sheets[name]||{}, {header:1,defval:''});
 },

 async buildMatrix(){
   return await this.getSheet('Miasta');
 },

 async buildRelations(){
   return await this.getSheet('Relacje');
 },

 async buildAddresses(){
   return await this.getSheet('Addresses');
 }
};

window.loadWorkbook=()=>window.SharedData.loadWorkbook();
window.buildMatrix=()=>window.SharedData.buildMatrix();
window.buildRelations=()=>window.SharedData.buildRelations();
window.buildAddresses=()=>window.SharedData.buildAddresses();
