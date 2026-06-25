
window.DataLayer={
 async getFilesTree(){
   const r=await fetch(window.DRIVE_API_URL);
   return await r.json();
 }
};
