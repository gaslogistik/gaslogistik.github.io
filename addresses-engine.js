
window.AddressesEngine={
 async init(){
   const rows=await SharedData.buildAddresses();

   let countryFilter='';
   let sortField='LOCATION';
   let sortDir=1;

   const countries=[...new Set(rows.map(r=>r.COUNTRY).filter(Boolean))].sort();

   const countryBar=document.createElement('div');
   countryBar.className='country-bar';
   countryBar.innerHTML='<button data-country="">ALL</button>'+countries.map(c=>`<button data-country="${c}">${c}</button>`).join('');
   document.querySelector('.addresses-module').insertBefore(countryBar,document.getElementById('addressesTable'));

   countryBar.addEventListener('click',e=>{
      if(e.target.dataset.country!==undefined){
        countryFilter=e.target.dataset.country;
        render();
      }
   });

   function render(){
     const q=(document.getElementById('searchBox').value||'').toLowerCase();
     const f=(document.getElementById('typeFilter').value||'').toLowerCase();

     let filtered=rows.filter(r=>{
       const txt=Object.values(r).join(' ').toLowerCase();
       return (!q||txt.includes(q))
        &&(!f||String(r.TYPE||'').toLowerCase()===f)
        &&(!countryFilter||String(r.COUNTRY||'')===countryFilter);
     });

     filtered.sort((a,b)=>{
       const av=String(a[sortField]||'');
       const bv=String(b[sortField]||'');
       return av.localeCompare(bv)*sortDir;
     });

     const countriesAll=[...new Set(rows.map(r=>r.COUNTRY).filter(Boolean))];
     const vigo=rows.filter(r=>String(r.TYPE).toUpperCase().includes('VIGO'));
     const hubs=rows.filter(r=>String(r.TYPE).toUpperCase().includes('HUB'));

     document.getElementById('kpiLocations').innerHTML=`${rows.length}<small>Locations (${countriesAll.join(', ')})</small><small>Total Locations</small>`;
     document.getElementById('kpiCountries').innerHTML=`${countriesAll.length}<small>Countries (${countriesAll.join(', ')})</small><small>Countries</small>`;
     document.getElementById('kpiVigo').innerHTML=`${vigo.length}<small>VIGO (${[...new Set(vigo.map(x=>x.COUNTRY))].join(', ')})</small><small>VIGO Stations</small>`;
     document.getElementById('kpiHubs').innerHTML=`${hubs.length}<small>HUBS (${[...new Set(hubs.map(x=>x.COUNTRY))].join(', ')})</small><small>Hubs</small>`;

     const dl=document.getElementById('citySuggestions');
     dl.innerHTML=[...new Set(rows.map(r=>r.LOCATION))].map(x=>`<option value="${x}">`).join('');

     document.getElementById('addressesTable').innerHTML=
     `<div class="result-count">Showing ${filtered.length} of ${rows.length} locations</div>
     <table class="addr-table">
     <thead><tr>
     <th data-s="LOCATION">Location</th>
     <th data-s="TYPE">Type</th>
     <th data-s="COUNTRY">Country</th>
     <th>Address</th>
     <th>Coordinates</th>
     </tr></thead><tbody>`+
     filtered.map(r=>`<tr>
     <td>${r.LOCATION||''}</td>
     <td>${r.TYPE||''}</td>
     <td>${r.COUNTRY||''}</td>
     <td>${r.ADDRESS||''}</td>
     <td>
     <a target="_blank" href="https://www.google.com/maps?q=${r.LATITUDE},${r.LONGITUDE}">📍 Open</a>
     <button class="copy-btn" data-c="${r.LATITUDE},${r.LONGITUDE}">📋 Copy</button>
     </td>
     </tr>`).join('')+'</tbody></table>';

     document.querySelectorAll('th[data-s]').forEach(th=>{
       th.onclick=()=>{sortField=th.dataset.s;sortDir*=-1;render();}
     });

     document.querySelectorAll('.copy-btn').forEach(b=>{
       b.onclick=()=>{
 navigator.clipboard.writeText(b.dataset.c);
 const old=b.textContent;
 b.textContent='✓ Copied';
 b.style.transform='scale(1.08)';
 setTimeout(()=>{b.textContent=old;b.style.transform='';},1200);
};
     });
   }

   document.getElementById('searchBox').setAttribute('list','citySuggestions');
   document.getElementById('searchBox').addEventListener('input',render);
   document.getElementById('typeFilter').addEventListener('change',render);
   render();
 }
};
document.addEventListener('DOMContentLoaded',()=>AddressesEngine.init());
