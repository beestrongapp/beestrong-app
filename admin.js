// ===== ADMIN PANEL =====

function updateAdminNav(){
  const show=isAdmin();
  document.querySelectorAll('.admin-nav-item').forEach(el=>el.style.display=show?'flex':'none');
}

async function renderAdmin(){
  const el=document.getElementById('adminContent');
  if(!el)return;
  if(!isAdmin()){el.innerHTML='<div style="color:var(--red);padding:20px;">Access denied.</div>';return;}
  el.innerHTML=`<div style="margin-bottom:14px;"><input type="text" id="adminSearch" placeholder="${tt({pl:'Szukaj po imieniu lub mailu...',en:'Search by name or email...',de:'Nach Name oder E-Mail suchen...',es:'Buscar por nombre o email...'})}" oninput="filterAdminUsers()" style="font-size:14px;"/></div><div id="adminUserList"><div class="spinner" style="margin:32px auto;"></div></div>`;
  if(!sb){el.querySelector('#adminUserList').innerHTML='<div style="color:var(--text3);text-align:center;padding:20px;">Supabase not available</div>';return;}
  const {data,error}=await sb.from('profiles').select('id,email,display_name,is_pro,is_coach').order('created_at',{ascending:false});
  if(error){el.querySelector('#adminUserList').innerHTML=`<div style="color:var(--red);padding:12px;">${error.message}</div>`;return;}
  window._adminUsers=data||[];
  renderAdminUserList(window._adminUsers);
}

function filterAdminUsers(){
  const q=(document.getElementById('adminSearch')?.value||'').toLowerCase();
  const filtered=(window._adminUsers||[]).filter(u=>(u.email||'').toLowerCase().includes(q)||(u.display_name||'').toLowerCase().includes(q));
  renderAdminUserList(filtered);
}

function renderAdminUserList(users){
  const el=document.getElementById('adminUserList');
  if(!el)return;
  if(!users.length){el.innerHTML=`<div style="text-align:center;color:var(--text3);padding:32px;">${tt({pl:'Brak użytkowników',en:'No users found',de:'Keine Benutzer',es:'Sin usuarios'})}</div>`;return;}
  el.innerHTML=users.map(u=>`
    <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg2);border-radius:12px;margin-bottom:8px;">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--accent);flex-shrink:0;">${(u.display_name||u.email||'?')[0].toUpperCase()}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.display_name||u.email||'—'}</div>
        <div style="font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.display_name?u.email:''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--text2);">
          Pro <div class="toggle-switch ${u.is_pro?'on':''}" onclick="adminToggle('${u.id}','is_pro',${!u.is_pro})"><div class="toggle-knob"></div></div>
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:var(--text2);">
          Coach <div class="toggle-switch ${u.is_coach?'on':''}" onclick="adminToggle('${u.id}','is_coach',${!u.is_coach})"><div class="toggle-knob"></div></div>
        </label>
      </div>
    </div>`).join('');
}

async function adminToggle(userId,field,value){
  if(!sb||!isAdmin())return;
  const {error}=await sb.from('profiles').update({[field]:value}).eq('id',userId);
  if(error){showSyncToast(error.message,'error');return;}
  // Update local list
  const u=window._adminUsers?.find(x=>x.id===userId);
  if(u)u[field]=value;
  renderAdminUserList(window._adminUsers||[]);
  showSyncToast(tt({pl:'Zaktualizowano',en:'Updated',de:'Aktualisiert',es:'Actualizado'}),'success');
  // If toggling current user — apply immediately without requiring re-login
  if(S.user&&S.user.id===userId){
    if(field==='is_pro'){
      S.isPro=!!value;
      saveAll();
      renderAccountBadge();renderSettings();renderTemplates();renderProgress();
    }
    if(field==='is_coach'){
      S.coachMode=!!value;
      if(value){
        const email=(S.user.email||'').toLowerCase().trim();
        if(!COACH_WHITELIST.map(e=>e.toLowerCase()).includes(email))COACH_WHITELIST.push(S.user.email);
      }
      saveAll();
      renderAccountBadge();updateCoachNav();renderSettings();renderClients();
    }
  }
}
window.adminToggle=adminToggle;
window.filterAdminUsers=filterAdminUsers;

