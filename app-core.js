
window.AppCore = {
  version:'0.4 Enterprise Core',
  modules:['matrix','relations','addresses','map'],
  workbook:null
};

/* Stage 3 prepared */

/* PRODUCTION_STAGE3: app-core.js */

// Stage3 Repository Engine
window.REPO_CONFIG={owner:'gaslogistik',repo:'gaslogistik.github.io',folders:['kp','vigo','mhp','ym','word','excel','pdf','txt','pictures','video']};
async function repoFetch(folder){const r=await fetch(`https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/contents/Files/${folder}`);return r.json();}

/* Stage 3 Final Clean baseline */

window.REPOSITORY_MODE='JSON_INDEX';


window.DRIVE_API_URL='https://script.google.com/macros/s/AKfycbxySJRg7CvMDTcLN_epiVNUsaiH959hYV-v2rdUHNFCxuGPB86KxMqwR3i9NUGboVutAw/exec';
window.REPOSITORY_PROVIDER='google-drive';
