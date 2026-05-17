// ===== ADMIN PANEL =====

let _adminTab='all';
let _adminUsers=[];
let _adminTabList=[];

function updateAdminNav(){
  const show=isAdmin();
  document.querySelectorAll('.admin-nav-item').forEach(el=>el.style.display=show?'flex':'none');
}

async function renderAdmin(){
  const el=document.getElementById('adminContent');
  if(!el)return;
  if(!isAdmin()){el.innerHTML='<div style="color:var(--red);padding:20px;">Access denied.</div>';return;}
  el.innerHTML=`<div class="progress-tabs" style="margin-bottom:14px;">
    ${_adminTabBtn('all',tt({pl:'Wszyscy',en:'All',de:'Alle',es:'Todos'}))}
    ${_adminTabBtn('pro','Pro')}
    ${_adminTabBtn('coach','Coach')}
  </div>
  <div id="adminTabContent"><div class="spinner" style="margin:32px auto;"></div></div>`;
  if(!sb){document.getElementById('adminTabContent').innerHTML='<div style="color:var(--text3);text-align:center;padding:20px;">Supabase not available</div>';return;}
  const {data,error}=await sb.from('profiles').select('id,email,display_name,is_pro,is_coach').order('created_at',{ascending:false});
  if(error){document.getElementById('adminTabContent').innerHTML=`<div style="color:var(--red);padding:12px;">${error.message}</div>`;return;}
  _adminUsers=data||[];
  _renderAdminTab();
}

function _adminTabBtn(tab,label){
  return `<button type="button" class="progress-tab-btn ${_adminTab===tab?'active':''}" onclick="setAdminTab('${tab}')">${label}</button>`;
}

function _adminStatsBar(count,total,color){
  const pct=total?Math.round(count/total*100):0;
  const barColor=color||'var(--accent)';
  return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:14px;">
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
      <span style="font-size:28px;font-weight:800;letter-spacing:-1px;color:${barColor};">${count}</span>
      ${total!=null?`<span style="font-size:14px;color:var(--text2);">/ ${total}</span><span style="font-size:13px;font-weight:700;color:${barColor};margin-left:auto;">${pct}%</span>`:''}
    </div>
    <div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;">
      <div style="height:6px;background:${barColor};border-radius:3px;width:${total!=null?pct:100}%;transition:width 0.4s;"></div>
    </div>
  </div>`;
}

function _renderAdminTab(){
  const el=document.getElementById('adminTabContent');
  if(!el)return;
  const all=_adminUsers||[];
  const total=all.length;
  const pro=all.filter(u=>u.is_pro);
  const coach=all.filter(u=>u.is_coach);

  let statsHtml='';
  let list=[];

  if(_adminTab==='all'){
    statsHtml=_adminStatsBar(total,null,'var(--accent)');
    list=all;
  } else if(_adminTab==='pro'){
    statsHtml=_adminStatsBar(pro.length,total,'#f5a623');
    list=pro;
  } else {
    statsHtml=_adminStatsBar(coach.length,total,'#7c3aed');
    list=coach;
  }

  el.innerHTML=`${statsHtml}
    <div style="margin-bottom:12px;"><input type="text" id="adminSearch" placeholder="${tt({pl:'Szukaj po imieniu lub mailu...',en:'Search by name or email...',de:'Nach Name oder E-Mail suchen...',es:'Buscar por nombre o email...'})}" oninput="filterAdminUsers()" style="font-size:14px;"/></div>
    <div id="adminUserList"></div>`;
  _adminTabList=list;
  renderAdminUserList(list);
}

window.setAdminTab=function(tab){
  if(!['all','pro','coach'].includes(tab))return;
  _adminTab=tab;
  // re-render tabs header to update active state
  document.querySelectorAll('#adminContent .progress-tab-btn').forEach((btn,i)=>{
    const t=['all','pro','coach'][i];
    btn.classList.toggle('active',t===tab);
  });
  _renderAdminTab();
};

function filterAdminUsers(){
  const q=(document.getElementById('adminSearch')?.value||'').toLowerCase();
  const base=_adminTabList||[];
  const filtered=base.filter(u=>(u.email||'').toLowerCase().includes(q)||(u.display_name||'').toLowerCase().includes(q));
  renderAdminUserList(filtered);
}

function renderAdminUserList(users){
  const el=document.getElementById('adminUserList');
  if(!el)return;
  if(!users.length){el.innerHTML=`<div style="text-align:center;color:var(--text3);padding:32px;">${tt({pl:'Brak użytkowników',en:'No users found',de:'Keine Benutzer',es:'Sin usuarios'})}</div>`;return;}
  el.innerHTML=users.map(u=>`
    <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg2);border-radius:12px;margin-bottom:8px;">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--accent);flex-shrink:0;">${escHtml((u.display_name||u.email||'?')[0].toUpperCase())}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(u.display_name||u.email||'—')}</div>
        <div style="font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.display_name?escHtml(u.email||''):''}</div>
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
  const u=_adminUsers?.find(x=>x.id===userId);
  if(u)u[field]=value;
  _renderAdminTab();
  showSyncToast(tt({pl:'Zaktualizowano',en:'Updated',de:'Aktualisiert',es:'Actualizado'}),'success');
  if(S.user&&S.user.id===userId){
    if(field==='is_pro'){
      S.isPro=!!value;
      saveAll();
      renderAccountBadge();updateProCoachNav();renderSettings();renderTemplates();renderProgress();
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
