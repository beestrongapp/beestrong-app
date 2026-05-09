const TYPE_LIST=['upper','lower','fbw','chest','back','biceps','triceps','legs','glutes','abs','other'];

const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};

// ===== SUPABASE CONFIG =====
// Anon key is public-by-design — RLS policies in DB protect user data.
// (NEVER paste service_role keys here — those bypass RLS and would leak data.)
const SUPABASE_URL='https://gtaskzdyoyscbgsqdvnk.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXNremR5b3lzY2Jnc3Fkdm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTU4MTIsImV4cCI6MjA5MzU3MTgxMn0.EPBUyLflxYSsr7BNdzVSZM4Q-M1oRAsBI9sIXhUDOH8';
let sb=null; // Supabase client, initialized after DOM ready (see initSupabase)

let S={month:new Date().getMonth(),year:new Date().getFullYear(),selectedDate:null,templates:[],workouts:{},measurements:{},activeWorkout:null,timerSecs:0,timerInterval:null,modal:null,loaded:false,isPro:false,coachMode:false,programs:[],clients:[],pendingInvites:[],user:null,defaultRest:90,units:'metric',goal:localStorage.getItem('bs-goal-v1')||'strength',level:localStorage.getItem('bs-level-v1')||'beginner',weekPlan:{}};
let progressChart=null;

function exName(e){return e[lang]||e.pl||e.name||'';}
function dk(y,m,d){return`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}
function today(){const n=new Date();return dk(n.getFullYear(),n.getMonth(),n.getDate());}
function weekStart(){const n=new Date(),day=n.getDay(),diff=day===0?6:day-1;n.setDate(n.getDate()-diff);n.setHours(0,0,0,0);return n;}

// ===== UNIT HELPERS (data always stored in kg/cm) =====
function unitW(){return S.units==='imperial'?'lbs':'kg';}
function unitL(){return S.units==='imperial'?'in':'cm';}
function unitVol(){return S.units==='imperial'?'klbs':'t';}
function dispW(kg){return S.units==='imperial'?+(kg*2.20462).toFixed(1):kg;}
function dispL(cm){return S.units==='imperial'?+(cm*0.3937).toFixed(1):cm;}
function dispMeas(key,v){return key==='weight_k'?dispW(v):dispL(v);}
function unitMeas(key){return key==='weight_k'?unitW():unitL();}
function fmtVol(kg){const v=S.units==='imperial'?kg*2.20462:kg;return v>0?(v/1000).toFixed(1):'0';}
function fmtVolTick(kg){if(S.units==='imperial'){const l=kg*2.20462;return l>=1000?(l/1000).toFixed(1)+'klbs':Math.round(l)+'lbs';}return kg>=1000?(kg/1000).toFixed(1)+'t':kg+'kg';}
function inputToKg(v){return S.units==='imperial'?+(+v/2.20462).toFixed(3):+v;}
function inputToCm(v){return S.units==='imperial'?+(+v/0.3937).toFixed(1):+v;}

function loadData(){
  S.templates=ld('bs-tpl-v4',DEFAULT_TEMPLATES);
  S.workouts=ld('bs-wo-v4',{});
  S.measurements=ld('bs-meas-v1',{});
  S.isPro=ld('bs-ispro-v1',false);
  S.coachMode=ld('bs-coach-v1',false);
  S.programs=ld('bs-programs-v1',[]);
  S.clients=ld('bs-clients-v1',[]);
  S.defaultRest=+ld('bs-default-rest-v1',90)||90;
  S.units=ld('bs-units-v1','metric');
  S.weekPlan=ld('bs-week-plan-v1',{});
  S.loaded=true;
  applyLang();applyTheme();updateCoachNav();updateProCoachNav();updateAdminNav();
  renderCalendar();renderDashboard();renderTemplates();renderWorkout();renderProgress();renderSettings();

  // Set username in sidebar
  const uname=localStorage.getItem('bs-username')||'';
  const unEl=document.getElementById('sidebarUserName');
  if(unEl)unEl.textContent=uname;

  if(!localStorage.getItem('bs-onboarded-v1')){
    setTimeout(showOnboarding,400);
  }
}

function showNamePrompt(){
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  ov.style.alignItems='center';
  ov.innerHTML=`<div class="modal" style="border-radius:var(--radius-lg);max-width:340px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">💪</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px;">Welcome to BeeStrong!</div>
      <div style="font-size:13px;color:var(--text2);">${lang==='pl'?'Jak masz na imię?':'What\'s your name?'}</div>
    </div>
    <input type="text" id="nameInput" placeholder="${lang==='pl'?'Twoje imię':'Your name'}"
      style="text-align:center;font-size:17px;margin-bottom:16px;"
      onkeydown="if(event.key==='Enter')window.saveName()"/>
    <button class="btn btn-primary" onclick="window.saveName()">
      ${lang==='pl'?'Zaczynamy! 🚀':'Let\'s go! 🚀'}
    </button>
  </div>`;
  document.body.appendChild(ov);
  S.modal=ov;
  setTimeout(()=>document.getElementById('nameInput')?.focus(),300);

  window.saveName=()=>{
    const name=(document.getElementById('nameInput')?.value||'').trim();
    if(!name)return;
    localStorage.setItem('bs-username',name);
    const unEl=document.getElementById('sidebarUserName');
    if(unEl)unEl.textContent=name;
    if(S.user)upsertProfile();
    ov.remove();S.modal=null;
    applyLang();
    if(!localStorage.getItem('bs-onboarded-v1'))setTimeout(showOnboarding,300);
  };
}

function saveAll(){
  sv('bs-tpl-v4',S.templates);sv('bs-wo-v4',S.workouts);sv('bs-meas-v1',S.measurements);sv('bs-ispro-v1',S.isPro);sv('bs-coach-v1',S.coachMode);sv('bs-programs-v1',S.programs);sv('bs-clients-v1',S.clients);sv('bs-default-rest-v1',S.defaultRest);sv('bs-units-v1',S.units);sv('bs-week-plan-v1',S.weekPlan||{});if(S.goal)localStorage.setItem('bs-goal-v1',S.goal);if(S.level)localStorage.setItem('bs-level-v1',S.level);
  const p=document.getElementById('savePill');p.classList.add('show');setTimeout(()=>p.classList.remove('show'),1800);
  if(S.user&&sb)pushAllToCloud().catch(e=>console.warn('auto-push failed',e));
}

function showScreen(name){
  if(window._bsHistoryReady&&!window._bsHandlingBack&&name!=='dashboard'){
    if(typeof ensureBackTrap==='function')ensureBackTrap({screen:name});
    else history.pushState({bs:true,screen:name},'','');
  }
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item[data-screen]').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.mobile-header-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  const screens=['dashboard','workouts','calendar','exercises','programs','progress','templates','settings'];
  const idx=screens.indexOf(name);
  if(idx>=0){
    document.querySelectorAll('.nav-item')[idx]?.classList.add('active');
  } else {
    document.querySelector(`.nav-item[data-screen="${name}"]`)?.classList.add('active');
  }
  const mBtn=document.querySelector(`.mobile-nav-item[data-screen="${name}"]`);
  if(mBtn)mBtn.classList.add('active');
  if(name==='settings')document.getElementById('mobileSettingsBtn')?.classList.add('active');
  if(name==='notifications')document.getElementById('mobileNotificationsBtn')?.classList.add('active');
  if(name==='clients')document.getElementById('mobileClientsBtn')?.classList.add('active');
  if(name==='coaches')document.getElementById('mobileCoachesBtn')?.classList.add('active');
  if(name==='admin')document.getElementById('mobileAdminBtn')?.classList.add('active');
  if(name==='dashboard')renderDashboard();
  if(name==='calendar')renderCalendar();
  if(name==='exercises')renderExercises();
  if(name==='programs')renderPrograms();
  if(name==='progress')renderProgress();
  if(name==='templates')renderTemplates();
  if(name==='workouts')renderWorkout();
  // Profile screen removed — its content lives in Settings now (renderSettings handles measurements + Pro card)
  if(name==='settings')renderSettings();
  if(name==='notifications')renderNotifications();
  if(name==='clients')renderClients();
  if(name==='coaches')renderUserCoaches();
  if(name==='admin')renderAdmin();
}

function typeTagHtml(types){
  if(!types||!types.length)return'';
  return types.map(tp=>`<span class="tag tag-${tp}">${t(tp)}</span>`).join('');
}
