
window.AddressesEngine={
 async init(){
   const data=await SharedData.buildAddresses();
   const render=(rows)=>{
     const q=(document.getElementById('searchBox')?.value||'').toLowerCase();
     const f=(document.getElementById('typeFilter')?.value||'').toLowerCase();
     const filtered=rows.filter(r=>{
       const txt=Object.values(r).join(' ').toLowerCase();
       const okQ=!q || txt.includes(q);
       const okF=!f || String(r.TYPE||'').toLowerCase()===f;
       return okQ&&okF;
     });

     document.getElementById('kpiLocations').textContent=rows.length;
     document.getElementById('kpiCountries').textContent=new Set(rows.map(r=>r.COUNTRY)).size;
     document.getElementById('kpiVigo').textContent=rows.filter(r=>String(r.TYPE).toUpperCase().includes('VIGO')).length;
     document.getElementById('kpiHubs').textContent=rows.filter(r=>String(r.TYPE).toUpperCase().includes('HUB')).length;

     const dl=document.getElementById('citySuggestions');
     if(dl){ dl.innerHTML=[...new Set(rows.map(r=>r.LOCATION))].map(x=>`<option value="${x}">`).join(''); }

     document.getElementById('addressesTable').innerHTML=
     `<table class="addr-table"><thead><tr><th>Location</th><th>Type</th><th>Country</th><th>Address</th><th>Coordinates</th></tr></thead><tbody>`+
     filtered.map(r=>`<tr><td>${r.LOCATION||''}</td><td>${r.TYPE||''}</td><td>${r.COUNTRY||''}</td><td>${r.ADDRESS||''}</td><td><a class="map-link" target="_blank" href="https://www.google.com/maps?q=${r.LATITUDE},${r.LONGITUDE}">${r.LATITUDE}, ${r.LONGITUDE}</a></td></tr>`).join('')
     +`</tbody></table>`;
   };

   setTimeout(()=>{
    document.getElementById('searchBox')?.addEventListener('input',()=>render(data));
    document.getElementById('typeFilter')?.addEventListener('change',()=>render(data));
    render(data);
   },100);
   return data;
 }
};
document.addEventListener('DOMContentLoaded',()=>window.AddressesEngine.init());
