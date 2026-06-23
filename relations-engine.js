
window.RelationsEngine={
 async init(){
   const data=await SharedData.buildRelations();
   console.log('Relations Engine loaded', data.length,'rows');
   return data;
 }
};
