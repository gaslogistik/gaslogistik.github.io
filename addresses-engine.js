
window.AddressesEngine={
 async init(){
   const data=await SharedData.buildAddresses();
   console.log('Addresses Engine loaded', data.length,'rows');
   return data;
 }
};
