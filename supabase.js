// ===== AUTH (Supabase) =====
// Phase 1: account-only (login/signup/logout). Cloud sync of templates/workouts/programs
// is wired in the next iteration. For now, signing in associates the device with a user
// so future syncs can attach data to their account.

function clearLocalUserData(){
  S.workouts={};S.templates=[];S.measurements={};
  S.isPro=false;S.coachMode=false;S.clients=[];
  S.programs=(S.programs||[]).filter(p=>p.builtin);
  ['bs-wo-v4','bs-tpl-v4','bs-meas-v1','bs-ispro-v1','bs-coach-v1','bs-clients-v1','bs-username'].forEach(k=>localStorage.removeItem(k));
  const unEl=document.getElementById('sidebarUserName');if(unEl)unEl.textContent='';
  updateCoachNav();updateAdminNav();
  if(typeof renderDashboard==='function')renderDashboard();
  if(typeof renderTemplates==='function')renderTemplates();
  if(typeof renderWorkout==='function')renderWorkout();
  if(typeof renderProgress==='function')renderProgress();
  if(typeof renderSettings==='function')renderSettings();
}

function initSupabase(){
  if(!window.supabase){
    console.warn('Supabase SDK not loaded — running offline-only mode');
    return;
  }
  try{
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        storage:window.localStorage,
        storageKey:'bs-auth-v1',
      }
    });
    // Restore session on page load
    sb.auth.getSession().then(({data})=>{
      if(data?.session?.user){
        S.user={id:data.session.user.id,email:data.session.user.email,name:(data.session.user.user_metadata?.display_name||'').trim()};
        if(S.coachMode&&!isCoachAllowed()){S.coachMode=false;saveAll();}
        if(typeof renderSettings==='function')renderSettings();
      }
    }).catch(e=>console.warn('getSession failed',e));
    // Check URL for ?p=<code> shared program — works whether logged in or not
    setTimeout(()=>checkUrlForSharedProgram(),300);
    // React to login/logout events from anywhere
    sb.auth.onAuthStateChange((event,session)=>{
      const wasLoggedIn=!!S.user;
      if(session?.user){
        S.user={id:session.user.id,email:session.user.email,name:(session.user.user_metadata?.display_name||'').trim()};
        if(S.coachMode&&!isCoachAllowed()){S.coachMode=false;saveAll();}
        if(!wasLoggedIn&&(event==='SIGNED_IN'||event==='INITIAL_SESSION')){
          if(event==='SIGNED_IN'){setTimeout(()=>{postLoginSyncFlow();upsertProfile();syncProfileFlags();checkPendingInvitations();setupRealtimeSubscriptions();},400);}
          if(event==='INITIAL_SESSION')setTimeout(()=>{upsertProfile();syncProfileFlags();checkPendingInvitations();setupRealtimeSubscriptions();autoSyncFromCloud();},600);
        }
      } else {
        S.user=null;
        S.pendingInvites=[];
        clearLocalUserData();
      }
      if(typeof renderSettings==='function')renderSettings();
      updateCoachNav();updateAdminNav();
    });
  }catch(e){
    console.error('Supabase init error',e);
  }
}

async function bsSignUp(email,password,name){
  if(!sb)return{error:{message:'Auth unavailable (offline?)'}};
  return await sb.auth.signUp({email,password,options:{data:{display_name:(name||'').trim()||undefined}}});
}
async function bsSignIn(email,password){
  if(!sb)return{error:{message:'Auth unavailable (offline?)'}};
  return await sb.auth.signInWithPassword({email,password});
}
async function bsSignOut(){
  if(!sb)return;
  await sb.auth.signOut();
}

// ===== CLOUD SYNC =====
// Strategy (MVP): wholesale push/pull. Push deletes user's remote rows then re-inserts
// from local. Pull replaces local state with cloud rows. Last-write-wins per device.
// Auto-push on every save is intentionally NOT wired yet — user triggers sync manually
// or via the first-login flow. Adding deltas + queue is the next iteration.

async function pushAllToCloud(){
  if(!sb||!S.user)return{error:'not_signed_in'};
  const uid=S.user.id;
  try{
    // Templates
    {
      const{error}=await sb.from('templates').delete().eq('user_id',uid);
      if(error)throw error;
      if(S.templates.length){
        const rows=S.templates.map(tp=>({
          user_id:uid,
          name:tp.name||'',
          types:Array.isArray(tp.types)?tp.types:[],
          rest_default:tp.restDefault||90,
          exercises:tp.exercises||[],
        }));
        const{error:ie}=await sb.from('templates').insert(rows);
        if(ie)throw ie;
      }
    }
    // Workouts
    {
      const{error}=await sb.from('workouts').delete().eq('user_id',uid);
      if(error)throw error;
      const woRows=Object.entries(S.workouts||{}).map(([k,w])=>({
        user_id:uid,
        name:w.name||'',
        name_key:w.nameKey||null,
        types:Array.isArray(w.types)?w.types:[],
        date:w.date||k.split('_')[0],
        duration_min:w.duration||0,
        volume_kg:w.volume||0,
        exercises:w.exercises||[],
      }));
      if(woRows.length){
        const{error:ie}=await sb.from('workouts').insert(woRows);
        if(ie)throw ie;
      }
    }
    // Measurements
    {
      const{error}=await sb.from('measurements').delete().eq('user_id',uid);
      if(error)throw error;
      const mRows=Object.entries(S.measurements||{}).map(([date,rec])=>({
        user_id:uid,
        date,
        weight_kg:rec.weight_k!=null?rec.weight_k:null,
        chest_cm:rec.chest_m!=null?rec.chest_m:null,
        waist_cm:rec.waist!=null?rec.waist:null,
        hips_cm:rec.hips!=null?rec.hips:null,
        arm_cm:rec.arm!=null?rec.arm:null,
        thigh_cm:rec.thigh!=null?rec.thigh:null,
      }));
      if(mRows.length){
        const{error:ie}=await sb.from('measurements').insert(mRows);
        if(ie)throw ie;
      }
    }
    // Programs (only custom — built-ins are in code, not DB)
    {
      const{error}=await sb.from('programs').delete().eq('owner_id',uid);
      if(error)throw error;
      const pRows=(S.programs||[]).filter(p=>!p.builtin).map(p=>({
        owner_id:uid,
        share_code:p.shareCode||null,
        name:typeof p.name==='object'?p.name:{en:p.name||'',pl:p.name||''},
        short:typeof p.short==='object'?p.short:null,
        description:typeof p.description==='object'?p.description:null,
        level:p.level||null,
        duration_weeks:p.duration||8,
        days_per_week:p.daysPerWeek||3,
        types:Array.isArray(p.types)?p.types:[],
        templates:p.templates||[],
      }));
      if(pRows.length){
        const{error:ie}=await sb.from('programs').insert(pRows);
        if(ie)throw ie;
      }
    }
    // Coach clients (only when coach mode; stored in coach_clients table)
    if(S.coachMode&&Array.isArray(S.clients)&&S.clients.length){
      const{error:cDel}=await sb.from('coach_clients').delete().eq('coach_id',uid);
      if(cDel)throw cDel;
      const cRows=S.clients.map(c=>({
        coach_id:uid,
        client_label:c.label||'',
        client_email:c.email||null,
        status:c.status||'active',
        notes:c.notes||null,
      }));
      const{error:cIns}=await sb.from('coach_clients').insert(cRows);
      if(cIns)throw cIns;
    }
    return{success:true};
  }catch(e){
    console.error('pushAllToCloud failed:',e);
    return{error:e.message||'sync_failed'};
  }
}

async function pullAllFromCloud(){
  if(!sb||!S.user)return{error:'not_signed_in'};
  const uid=S.user.id;
  try{
    const[tplsRes,woRes,mRes,pRes,ccRes,assignRes]=await Promise.all([
      sb.from('templates').select('*').eq('user_id',uid),
      sb.from('workouts').select('*').eq('user_id',uid).order('date',{ascending:true}),
      sb.from('measurements').select('*').eq('user_id',uid),
      sb.from('programs').select('*').eq('owner_id',uid),
      sb.from('coach_clients').select('*').eq('coach_id',uid),
      sb.from('coach_program_assignments').select('*').eq('client_user_id',uid).eq('status','active'),
    ]);
    if(tplsRes.error)throw tplsRes.error;
    if(woRes.error)throw woRes.error;
    if(mRes.error)throw mRes.error;
    if(pRes.error)throw pRes.error;
    // coach_clients may fail if not a coach — ignore that error gracefully
    if(ccRes.error&&ccRes.error.code!=='PGRST116')console.warn('coach_clients pull:',ccRes.error);
    // coach_program_assignments may fail if table doesn't exist yet — ignore gracefully
    if(assignRes.error)console.warn('coach_program_assignments pull:',assignRes.error);

    // Templates — keep cloud UUID as local id for stable references
    S.templates=(tplsRes.data||[]).map(t=>({
      id:t.id,
      name:t.name,
      types:t.types||[],
      restDefault:t.rest_default||90,
      exercises:t.exercises||[],
    }));
    // Workouts — rebuild keyed map; key uses date + created_at timestamp
    S.workouts={};
    (woRes.data||[]).forEach(w=>{
      const ts=w.created_at?new Date(w.created_at).getTime():Date.now();
      const key=`${w.date}_${ts}`;
      S.workouts[key]={
        templateId:w.template_id||null,
        name:w.name||'',
        nameKey:w.name_key||null,
        types:w.types||[],
        date:w.date,
        duration:w.duration_min||0,
        volume:+(w.volume_kg||0),
        exercises:w.exercises||[],
      };
    });
    // Measurements
    S.measurements={};
    (mRes.data||[]).forEach(m=>{
      const rec={};
      if(m.weight_kg!=null)rec.weight_k=+m.weight_kg;
      if(m.chest_cm!=null)rec.chest_m=+m.chest_cm;
      if(m.waist_cm!=null)rec.waist=+m.waist_cm;
      if(m.hips_cm!=null)rec.hips=+m.hips_cm;
      if(m.arm_cm!=null)rec.arm=+m.arm_cm;
      if(m.thigh_cm!=null)rec.thigh=+m.thigh_cm;
      if(Object.keys(rec).length)S.measurements[m.date]=rec;
    });
    // Programs (custom only — built-ins stay in code)
    S.programs=(pRes.data||[]).map(p=>({
      id:p.id,
      builtin:false,
      shareCode:p.share_code||null,
      name:p.name,
      short:p.short,
      description:p.description,
      level:p.level,
      duration:p.duration_weeks||8,
      daysPerWeek:p.days_per_week||3,
      types:p.types||[],
      templates:p.templates||[],
    }));
    // Coach-assigned programs (client receives from coach)
    if(!assignRes.error&&assignRes.data&&assignRes.data.length){
      const coachPrograms=assignRes.data.map(a=>({
        id:'coach_'+a.id,
        assignmentId:a.id,
        builtin:false,
        fromCoach:true,
        coachName:(a.program_data&&a.program_data.coachName)||'',
        ...(a.program_data||{}),
        name:a.program_data?.name||{en:a.program_name,pl:a.program_name},
      }));
      // Keep user's own programs, replace any existing fromCoach entries
      S.programs=[...S.programs.filter(p=>!p.fromCoach),...coachPrograms];
    }
    // Coach clients (only for coaches; non-coaches get an empty array)
    if(!ccRes.error){
      S.clients=(ccRes.data||[]).map(c=>({
        id:c.id,
        label:c.client_label||'',
        email:c.client_email||'',
        status:c.status||'active',
        programId:null, // assignment stored separately; local assignment preserved
        notes:c.notes||'',
        createdAt:c.invited_at||new Date().toISOString(),
      }));
    }
    saveAll();
    // Re-render every screen
    if(typeof renderDashboard==='function')renderDashboard();
    if(typeof renderCalendar==='function')renderCalendar();
    if(typeof renderTemplates==='function')renderTemplates();
    if(typeof renderWorkout==='function')renderWorkout();
    if(typeof renderProgress==='function')renderProgress();
    if(typeof renderPrograms==='function')renderPrograms();
    if(typeof renderSettings==='function')renderSettings();
    return{success:true,counts:{
      templates:S.templates.length,
      workouts:Object.keys(S.workouts).length,
      measurements:Object.keys(S.measurements).length,
      programs:S.programs.length,
    }};
  }catch(e){
    console.error('pullAllFromCloud failed:',e);
    return{error:e.message||'sync_failed'};
  }
}

async function checkRemoteHasData(){
  if(!sb||!S.user)return false;
  const uid=S.user.id;
  try{
    const{count}=await sb.from('workouts').select('*',{count:'exact',head:true}).eq('user_id',uid);
    if((count||0)>0)return true;
    const{count:tc}=await sb.from('templates').select('*',{count:'exact',head:true}).eq('user_id',uid);
    if((tc||0)>0)return true;
    const{count:mc}=await sb.from('measurements').select('*',{count:'exact',head:true}).eq('user_id',uid);
    return (mc||0)>0;
  }catch(e){
    console.warn('checkRemoteHasData failed',e);
    return false;
  }
}

function localHasData(){
  return (S.templates||[]).length>0
    ||Object.keys(S.workouts||{}).length>0
    ||Object.keys(S.measurements||{}).length>0
    ||(S.programs||[]).filter(p=>!p.builtin).length>0;
}

// Toast for sync feedback
function showSyncToast(msg,kind){
  let el=document.getElementById('syncToast');
  if(!el){
    el=document.createElement('div');
    el.id='syncToast';
    el.style.cssText='position:fixed;bottom:calc(96px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:10px 18px;border-radius:24px;font-size:13px;font-weight:500;z-index:400;opacity:0;transition:opacity 0.25s;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,0.45);max-width:90vw;text-align:center;';
    document.body.appendChild(el);
  }
  if(kind==='error')el.style.borderColor='var(--red)';
  else if(kind==='success')el.style.borderColor='var(--accent)';
  else el.style.borderColor='var(--border2)';
  el.textContent=msg;
  el.style.opacity='1';
  clearTimeout(el._fadeT);
  el._fadeT=setTimeout(()=>{el.style.opacity='0';},2800);
}

// Called once after sign-in — silently syncs without asking the user.
// Cloud data always wins when both sides have data (auto-sync keeps them in sync going forward).
async function postLoginSyncFlow(){
  if(!sb||!S.user)return;
  const remoteHas=await checkRemoteHasData();
  const localHas=localHasData();
  // Case 1: nothing on either side → nothing to do
  if(!remoteHas&&!localHas)return;
  // Case 2: remote empty, local has data → silently push to cloud
  if(!remoteHas&&localHas){
    const r=await pushAllToCloud();
    if(r.success){
      showSyncToast(tt({pl:'Dane wysłane do chmury ✓',en:'Data uploaded to cloud ✓',de:'Daten in Cloud hochgeladen ✓',es:'Datos subidos a la nube ✓'}),'success');
    }
    return;
  }
  // Case 3: remote has data, local empty → auto-pull
  // Case 4: both sides have data → cloud wins (auto-sync will keep in sync going forward)
  const r=await pullAllFromCloud();
  if(r.success){
    showSyncToast(tt({pl:'Pobrano dane z chmury ✓',en:'Cloud data restored ✓',de:'Cloud-Daten geladen ✓',es:'Datos restaurados desde la nube ✓'}),'success');
  } else {
    showSyncToast(tt({pl:'Błąd synchronizacji',en:'Sync failed',de:'Sync fehlgeschlagen',es:'Error de sincronización'}),'error');
  }
}

window.pushAllToCloud=pushAllToCloud;
window.pullAllFromCloud=pullAllFromCloud;

function showAuthModal(){
  closeModal();
  let mode='signin'; // 'signin' or 'signup'
  let email='';
  let password='';
  let name='';
  let error='';
  let busy=false;
  const ov=document.createElement('div');ov.className='modal-overlay';
  function render(){
    const isSignUp=mode==='signup';
    const title=isSignUp
      ?tt({pl:'Utwórz konto',en:'Create account',de:'Konto erstellen',es:'Crear cuenta'})
      :tt({pl:'Zaloguj się',en:'Sign in',de:'Anmelden',es:'Iniciar sesión'});
    const switchLbl=isSignUp
      ?tt({pl:'Masz już konto? Zaloguj się',en:'Already have an account? Sign in',de:'Bereits Konto? Anmelden',es:'¿Ya tienes cuenta? Inicia sesión'})
      :tt({pl:'Nie masz konta? Utwórz nowe',en:"Don't have an account? Sign up",de:'Noch kein Konto? Registrieren',es:'¿Sin cuenta? Regístrate'});
    const cta=busy
      ?tt({pl:'Czekaj...',en:'Please wait...',de:'Bitte warten...',es:'Espera...'})
      :(isSignUp
        ?tt({pl:'Załóż konto',en:'Create account',de:'Konto erstellen',es:'Crear cuenta'})
        :tt({pl:'Zaloguj',en:'Sign in',de:'Anmelden',es:'Entrar'}));
    const lblEmail=tt({pl:'Email',en:'Email',de:'E-Mail',es:'Email'});
    const lblPass=tt({pl:'Hasło',en:'Password',de:'Passwort',es:'Contraseña'});
    const passHint=isSignUp?tt({pl:'(min. 6 znaków)',en:'(min. 6 characters)',de:'(min. 6 Zeichen)',es:'(mín. 6 caracteres)'}):'';
    const note=isSignUp
      ?tt({pl:'Po rejestracji możesz potrzebować potwierdzić email (sprawdź skrzynkę).',en:"After signup you may need to confirm your email (check your inbox).",de:'Nach der Registrierung musst du evtl. deine E-Mail bestätigen.',es:'Tras registrarte puede que tengas que confirmar tu email.'})
      :'';
    ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
      <div class="modal-handle"></div>
      <div style="text-align:center;margin-bottom:18px;">
        <img src="${isDark?'./logo.jpg':'./light_logo.png'}" alt="BeeStrong" style="width:48px;height:48px;object-fit:contain;border-radius:10px;display:block;margin:0 auto 10px;"/>
        <div style="font-size:20px;font-weight:800;letter-spacing:-0.4px;">${title}</div>
      </div>
      ${isSignUp?`<label class="form-label">${tt({pl:'Imię',en:'Name',de:'Name',es:'Nombre'})}</label><input type="text" id="authName" autocomplete="given-name" value="${name}" placeholder="${tt({pl:'np. Dariusz',en:'e.g. John',de:'z.B. Max',es:'p.ej. Juan'})}" style="margin-bottom:12px;"/>`:''}
      <label class="form-label">${lblEmail}</label>
      <input type="email" id="authEmail" autocomplete="email" value="${email}" style="margin-bottom:12px;"/>
      <label class="form-label">${lblPass} <span style="color:var(--text3);font-weight:400;">${passHint}</span></label>
      <input type="password" id="authPass" autocomplete="${isSignUp?'new-password':'current-password'}" value="${password}" style="margin-bottom:6px;"/>
      ${error?`<div style="font-size:12px;color:var(--red);margin-bottom:10px;">${error}</div>`:'<div style="margin-bottom:10px;"></div>'}
      ${note?`<div style="font-size:11px;color:var(--text3);background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:14px;line-height:1.5;">${note}</div>`:''}
      <button class="btn btn-primary" ${busy?'disabled':''} id="authSubmit">${cta}</button>
      <button class="btn btn-ghost" style="margin-top:8px;font-size:13px;" id="authSwitch">${switchLbl}</button>
      <button class="btn btn-ghost" style="margin-top:4px;font-size:12px;color:var(--text3);" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
    </div>`;
    // Wire up event handlers (re-bound on each render)
    const emailEl=document.getElementById('authEmail');
    const passEl=document.getElementById('authPass');
    const submitEl=document.getElementById('authSubmit');
    const switchEl=document.getElementById('authSwitch');
    if(emailEl){emailEl.oninput=e=>{email=e.target.value;};}
    if(passEl){passEl.oninput=e=>{password=e.target.value;};}
    const nameEl=document.getElementById('authName');
    if(nameEl){nameEl.oninput=e=>{name=e.target.value;};}
    if(switchEl){switchEl.onclick=()=>{mode=isSignUp?'signin':'signup';error='';render();};}
    if(submitEl){submitEl.onclick=async()=>{
      if(busy)return;
      // Read latest values directly from inputs (in case user typed quickly)
      email=(document.getElementById('authEmail')?.value||'').trim();
      password=document.getElementById('authPass')?.value||'';
      if(isSignUp)name=(document.getElementById('authName')?.value||'').trim();
      if(!email||!password){
        error=tt({pl:'Wypełnij oba pola.',en:'Fill in both fields.',de:'Bitte beide Felder ausfüllen.',es:'Rellena ambos campos.'});
        render();return;
      }
      if(isSignUp&&password.length<6){
        error=tt({pl:'Hasło musi mieć min. 6 znaków.',en:'Password must be at least 6 characters.',de:'Passwort muss mindestens 6 Zeichen haben.',es:'La contraseña debe tener al menos 6 caracteres.'});
        render();return;
      }
      busy=true;error='';render();
      try{
        if(isSignUp&&name)localStorage.setItem('bs-pending-name',name);
        const fn=isSignUp?bsSignUp:bsSignIn;
        const{data,error:err}=await fn(email,password,isSignUp?name:undefined);
        if(err){
          error=err.message||tt({pl:'Coś poszło nie tak.',en:'Something went wrong.',de:'Etwas ist schiefgelaufen.',es:'Algo salió mal.'});
          busy=false;render();return;
        }
        // Push name to Supabase immediately on signup (most reliable approach)
        if(isSignUp&&name&&sb&&data?.session?.user){
          const uid=data.session.user.id;
          const{error:profileErr}=await sb.from('profiles').upsert({id:uid,email:data.session.user.email,display_name:name},{onConflict:'id'});
          if(profileErr)console.warn('profile name upsert failed',profileErr);
          localStorage.setItem('bs-username',name);
        }
        // Success
        if(isSignUp&&!data?.session){
          ov.innerHTML=`<div class="modal" style="text-align:center;padding:32px 24px;">
            <div style="font-size:48px;margin-bottom:14px;">📬</div>
            <div style="font-size:17px;font-weight:700;margin-bottom:10px;">${tt({pl:'Sprawdź email',en:'Check your email',de:'E-Mail prüfen',es:'Revisa tu email'})}</div>
            <div style="font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.5;">${tt({pl:'Wysłaliśmy link aktywacyjny na',en:'We sent a confirmation link to',de:'Wir haben einen Bestätigungslink gesendet an',es:'Enviamos un enlace de confirmación a'})} <strong>${email}</strong>. ${tt({pl:'Kliknij w niego, żeby aktywować konto.',en:'Click it to activate your account.',de:'Klicke darauf, um dein Konto zu aktivieren.',es:'Haz clic para activar tu cuenta.'})}</div>
            <button class="btn btn-primary" onclick="closeModal()">OK</button>
          </div>`;
          return;
        }
        closeModal();
      }catch(e){
        error=e.message||'Network error';
        busy=false;render();
      }
    };}
  }
  document.body.appendChild(ov);S.modal=ov;
  render();
  setTimeout(()=>document.getElementById('authEmail')?.focus(),200);
}
window.showAuthModal=showAuthModal;

function showAccountModal(){
  // Shown when user is already logged in — gives sync + sign-out options
  closeModal();
  if(!S.user){showAuthModal();return;}
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="text-align:center;padding:24px 22px;">
    <div class="modal-handle"></div>
    <img src="${isDark?'./logo.jpg':'./light_logo.png'}" alt="BeeStrong" style="width:54px;height:54px;object-fit:contain;border-radius:12px;display:block;margin:0 auto 12px;"/>
    <div style="font-size:17px;font-weight:700;margin-bottom:4px;">${tt({pl:'Zalogowany jako',en:'Signed in as',de:'Angemeldet als',es:'Sesión iniciada como'})}</div>
    <div style="font-size:14px;color:var(--text2);margin-bottom:22px;word-break:break-all;">${S.user.email}</div>
    <div style="display:flex;flex-direction:column;gap:8px;text-align:left;">
      <button class="btn btn-ghost" id="acctPush" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;text-align:left;">
        <span><strong>${tt({pl:'Wyślij do chmury',en:'Upload to cloud',de:'In Cloud hochladen',es:'Subir a la nube'})}</strong><br><span style="font-size:11px;color:var(--text3);font-weight:400;">${tt({pl:'Nadpisuje dane w chmurze lokalnymi',en:'Overwrites cloud with local data',de:'Überschreibt Cloud mit lokalen Daten',es:'Sobrescribe la nube con datos locales'})}</span></span>
        <span style="font-size:18px;color:var(--accent);">↑</span>
      </button>
      <button class="btn btn-ghost" id="acctPull" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;text-align:left;">
        <span><strong>${tt({pl:'Pobierz z chmury',en:'Download from cloud',de:'Aus Cloud herunterladen',es:'Descargar de la nube'})}</strong><br><span style="font-size:11px;color:var(--text3);font-weight:400;">${tt({pl:'Nadpisuje lokalne dane chmurą',en:'Overwrites local with cloud data',de:'Überschreibt lokal mit Cloud-Daten',es:'Sobrescribe local con datos de nube'})}</span></span>
        <span style="font-size:18px;color:var(--accent);">↓</span>
      </button>
    </div>
    <button class="btn btn-danger" id="acctSignOut" style="margin-top:18px;margin-bottom:8px;">${tt({pl:'Wyloguj się',en:'Sign out',de:'Abmelden',es:'Cerrar sesión'})}</button>
    <button class="btn btn-ghost" style="font-size:13px;" onclick="closeModal()">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
  document.getElementById('acctPush').onclick=async()=>{
    if(!confirm(tt({pl:'Wysłać lokalne dane do chmury? Nadpisze dane w chmurze.',en:'Upload local data to cloud? This overwrites cloud data.',de:'Lokale Daten in die Cloud hochladen? Cloud-Daten werden überschrieben.',es:'¿Subir datos locales a la nube? Sobrescribe los datos en la nube.'})))return;
    closeModal();
    showSyncToast(tt({pl:'Wysyłanie...',en:'Uploading...',de:'Hochladen...',es:'Subiendo...'}));
    const r=await pushAllToCloud();
    if(r.success)showSyncToast(tt({pl:'Wysłano ✓',en:'Uploaded ✓',de:'Hochgeladen ✓',es:'Subido ✓'}),'success');
    else showSyncToast((tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '}))+(r.error||''),'error');
  };
  document.getElementById('acctPull').onclick=async()=>{
    if(!confirm(tt({pl:'Pobrać dane z chmury? Nadpisze lokalne.',en:'Download cloud data? This overwrites local data.',de:'Cloud-Daten herunterladen? Lokale Daten werden überschrieben.',es:'¿Descargar datos de la nube? Sobrescribe los locales.'})))return;
    closeModal();
    showSyncToast(tt({pl:'Pobieranie...',en:'Downloading...',de:'Herunterladen...',es:'Descargando...'}));
    const r=await pullAllFromCloud();
    if(r.success){
      const c=r.counts||{};
      showSyncToast(`${tt({pl:'Pobrano',en:'Downloaded',de:'Heruntergeladen',es:'Descargado'})}: ${c.templates||0} tpl · ${c.workouts||0} wo · ${c.measurements||0} m`,'success');
    } else {
      showSyncToast((tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '}))+(r.error||''),'error');
    }
  };
  document.getElementById('acctSignOut').onclick=async()=>{
    await bsSignOut();
    closeModal();
  };
}
window.showAccountModal=showAccountModal;

// ===== AUTO-SYNC (Pro / Coach Mode) =====

let _lastAutoSync=0;
let _realtimeChannels=[];

async function autoSyncFromCloud(){
  if(!sb||!S.user)return;
  if(!S.isPro&&!S.coachMode)return;
  const now=Date.now();
  if(now-_lastAutoSync<120000)return; // 2 min cooldown
  _lastAutoSync=now;
  // Show subtle indicator
  const ind=document.getElementById('autoSyncDot');
  if(ind)ind.classList.add('syncing');
  const r=await pullAllFromCloud();
  if(ind)ind.classList.remove('syncing');
  if(r.error)console.warn('autoSync error:',r.error);
}

function setupRealtimeSubscriptions(){
  if(!sb||!S.user)return;
  // Clean up existing channels
  _realtimeChannels.forEach(ch=>{try{sb.removeChannel(ch);}catch(e){}});
  _realtimeChannels=[];

  // 1. Invitations channel (client receives coach invites in real-time)
  const invCh=sb.channel('bs-invitations-'+S.user.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'coach_invitations',filter:`client_user_id=eq.${S.user.id}`},
      ()=>{ checkPendingInvitations(); })
    .subscribe();
  _realtimeChannels.push(invCh);

  // 2. Coach program assignments (client gets program immediately when coach assigns)
  const assignCh=sb.channel('bs-assignments-'+S.user.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'coach_program_assignments',filter:`client_user_id=eq.${S.user.id}`},
      ()=>{ _lastAutoSync=0; autoSyncFromCloud(); })
    .subscribe();
  _realtimeChannels.push(assignCh);
}

// Auto-sync when tab becomes visible
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible')autoSyncFromCloud();
});

