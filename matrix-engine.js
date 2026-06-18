
window.MatrixEngine={
 async init(){
   const data=await SharedData.buildMatrix();
   console.log('Matrix Engine loaded', data.length,'rows');
   return data;
 }
};
