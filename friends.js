// ===== FRIENDS =====
let _friendInvitations=[];
let _friendDetail=null;
let _friendChatChannel=null;
let _friendDetailView=null;

function friendName(inv){
  const mine=S.user?.id===inv.inviter_id;
  return mine
    ? (inv.invitee_name||inv.invitee_email||'Friend')
    : (inv.inviter_name||inv.inviter_email||'Friend');
}
function friendId(inv){return S.user?.id===inv.inviter_id?inv.invitee_id:inv.inviter_id;}
function friendEmail(inv){return S.user?.id===inv.inviter_id?inv.invitee_email:inv.inviter_email;}
function friendEsc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

async function renderFriends(){
  const el=document.getElementById('friendsContent');
  if(!el)return;
  const bottomBack=`<div class="screen-bottom-back"><button class="btn btn-primary" onclick="showScreen('dashboard')">${t('backBtn')}</button></div>`;
  if(!S.user){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby używać Friends.',en:'Sign in to use Friends.',de:'Melde dich an, um Friends zu nutzen.',es:'Inicia sesión para usar Friends.'})}</div>${bottomBack}`;
    return;
  }
  if(!sb){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Supabase nie jest dostępny.',en:'Supabase is not available.',de:'Supabase ist nicht verfügbar.',es:'Supabase no está disponible.'})}</div>${bottomBack}`;
    return;
  }
  el.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
    <input type="email" id="friendSearchEmail" placeholder="${tt({pl:'Znajdź usera po emailu...',en:'Find user by email...',de:'Nutzer per E-Mail finden...',es:'Buscar usuario por email...'})}" style="font-size:14px;"/>
    <button class="btn btn-primary" onclick="searchFriendByEmail()" style="width:auto;padding:12px 16px;">${tt({pl:'Szukaj',en:'Search',de:'Suchen',es:'Buscar'})}</button>
  </div>
  <div id="friendSearchResult"></div>
  <div id="friendsList"><div style="display:flex;justify-content:center;padding:34px 0;"><div class="spinner"></div></div></div>
  ${bottomBack}`;
  await loadFriends();
}
window.renderFriends=renderFriends;

async function loadFriends(){
  const list=document.getElementById('friendsList');
  if(!list||!sb||!S.user)return;
  try{
    const[asInviter,asInvitee]=await Promise.all([
      sb.from('friend_invitations').select('*').eq('inviter_id',S.user.id).order('created_at',{ascending:false}),
      sb.from('friend_invitations').select('*').eq('invitee_id',S.user.id).order('created_at',{ascending:false}),
    ]);
    if(asInviter.error)throw asInviter.error;
    if(asInvitee.error)throw asInvitee.error;
    const byId=new Map([...(asInviter.data||[]),...(asInvitee.data||[])].map(i=>[i.id,i]));
    _friendInvitations=[...byId.values()];
    renderFriendsList();
  }catch(e){
    list.innerHTML=`<div style="color:var(--red);padding:12px;">${friendEsc(e.message||'Friends unavailable')}</div>`;
  }
}

function renderFriendsList(){
  const list=document.getElementById('friendsList');
  if(!list)return;
  const accepted=_friendInvitations.filter(i=>i.status==='accepted');
  const pendingIn=_friendInvitations.filter(i=>i.status==='pending'&&i.invitee_id===S.user?.id);
  const pendingOut=_friendInvitations.filter(i=>i.status==='pending'&&i.inviter_id===S.user?.id);
  let html=`<div class="section-label">${tt({pl:'Friends',en:'Friends',de:'Friends',es:'Friends'})} (${accepted.length}/3)</div>`;
  html+=accepted.length?accepted.map(friendCardHtml).join(''):`<div class="empty-state" style="padding:24px 16px;">${tt({pl:'Nie masz jeszcze znajomych.',en:'No friends yet.',de:'Noch keine Freunde.',es:'Aún no tienes amigos.'})}</div>`;
  if(pendingIn.length){
    html+=`<div class="section-label" style="margin-top:16px;">${tt({pl:'Zaproszenia',en:'Invitations',de:'Einladungen',es:'Invitaciones'})}</div>`;
    html+=pendingIn.map(inv=>friendCardHtml(inv,true)).join('');
  }
  if(pendingOut.length){
    html+=`<div class="section-label" style="margin-top:16px;">${tt({pl:'Wysłane',en:'Sent',de:'Gesendet',es:'Enviadas'})}</div>`;
    html+=pendingOut.map(friendCardHtml).join('');
  }
  list.innerHTML=html;
}

async function renderChatList(){
  const el=document.getElementById('chatContent');
  if(!el)return;
  const bottomBack=`<div class="screen-bottom-back"><button class="btn btn-primary" onclick="showScreen('dashboard')">${t('backBtn')}</button></div>`;
  if(!S.user){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby używać Chat.',en:'Sign in to use Chat.',de:'Melde dich an, um Chat zu nutzen.',es:'Inicia sesión para usar Chat.'})}</div>${bottomBack}`;
    return;
  }
  if(!sb){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Supabase nie jest dostępny.',en:'Supabase is not available.',de:'Supabase ist nicht verfügbar.',es:'Supabase no está disponible.'})}</div>${bottomBack}`;
    return;
  }
  el.innerHTML=`<div style="display:flex;justify-content:center;padding:34px 0;"><div class="spinner"></div></div>${bottomBack}`;
  try{
    const[asInviter,asInvitee]=await Promise.all([
      sb.from('friend_invitations').select('*').eq('inviter_id',S.user.id).eq('status','accepted').order('created_at',{ascending:false}),
      sb.from('friend_invitations').select('*').eq('invitee_id',S.user.id).eq('status','accepted').order('created_at',{ascending:false}),
    ]);
    if(asInviter.error)throw asInviter.error;
    if(asInvitee.error)throw asInvitee.error;
    const byId=new Map([...(asInviter.data||[]),...(asInvitee.data||[])].map(i=>[i.id,i]));
    const rows=[...byId.values()];
    _friendInvitations=rows;
    if(!rows.length){
      el.innerHTML=`<div class="empty-state">${tt({pl:'Brak aktywnych czatów.',en:'No active chats yet.',de:'Noch keine aktiven Chats.',es:'Sin chats activos todavía.'})}</div>${bottomBack}`;
      return;
    }
    el.innerHTML=`<div class="section-label">Chat</div>${rows.map(inv=>`
      <div class="client-card" onclick="openFriendDirectChat('${friendEsc(inv.id)}')">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--btn-text);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">${friendEsc(friendName(inv))[0]?.toUpperCase()||'C'}</div>
        <div class="client-card-info"><div class="client-card-name">${friendEsc(friendName(inv))}</div><div class="client-card-meta">${friendEsc(friendEmail(inv)||'')}</div></div>
      </div>`).join('')}${bottomBack}`;
  }catch(e){
    el.innerHTML=`<div style="color:var(--red);padding:12px;">${friendEsc(e.message||'Chat unavailable')}</div>${bottomBack}`;
  }
}
window.renderChatList=renderChatList;

async function openFriendDirectChat(invId){
  await openFriendProfile(invId);
  await renderFriendChat();
}
window.openFriendDirectChat=openFriendDirectChat;

function friendCardHtml(inv,needsAction){
  const name=friendEsc(friendName(inv));
  const email=friendEsc(friendEmail(inv)||'');
  const status=inv.status||'pending';
  const statusText=status==='accepted'?tt({pl:'Friend',en:'Friend',de:'Friend',es:'Friend'}):tt({pl:'Pending',en:'Pending',de:'Ausstehend',es:'Pendiente'});
  return `<div class="client-card" onclick="${status==='accepted'?`openFriendProfile('${inv.id}')`:''}" style="${status==='accepted'?'':'cursor:default;'}">
    <div style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--btn-text);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">${name[0]?.toUpperCase()||'F'}</div>
    <div class="client-card-info"><div class="client-card-name">${name}</div><div class="client-card-meta">${email}</div></div>
    <span class="client-status-badge client-status-${status==='accepted'?'accepted':'pending'}">${statusText}</span>
    ${needsAction?`<div style="display:flex;gap:6px;margin-left:4px;">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();acceptFriendInvitation('${inv.id}')" style="font-size:11px;padding:6px 10px;">OK</button>
      <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();declineFriendInvitation('${inv.id}')" style="font-size:11px;padding:6px 10px;">✕</button>
    </div>`:''}
  </div>`;
}

async function searchFriendByEmail(){
  const out=document.getElementById('friendSearchResult');
  const input=document.getElementById('friendSearchEmail');
  if(!out||!input||!sb||!S.user)return;
  const email=(input.value||'').trim().toLowerCase();
  if(!email||!email.includes('@')){
    out.innerHTML=`<div style="color:var(--red);font-size:13px;margin-bottom:12px;">${tt({pl:'Podaj prawidłowy email.',en:'Enter a valid email.',de:'Gültige E-Mail eingeben.',es:'Introduce un email válido.'})}</div>`;
    return;
  }
  if(email===(S.user.email||'').toLowerCase()){
    out.innerHTML=`<div style="color:var(--red);font-size:13px;margin-bottom:12px;">${tt({pl:'Nie możesz zaprosić siebie.',en:'You cannot invite yourself.',de:'Du kannst dich nicht selbst einladen.',es:'No puedes invitarte a ti mismo.'})}</div>`;
    return;
  }
  const accepted=_friendInvitations.filter(i=>i.status==='accepted').length;
  if(accepted>=3){
    out.innerHTML=`<div style="color:var(--red);font-size:13px;margin-bottom:12px;">${tt({pl:'Limit Friends to 3 osoby.',en:'Friends limit is 3 people.',de:'Friends-Limit ist 3 Personen.',es:'El límite de Friends es 3 personas.'})}</div>`;
    return;
  }
  out.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div class="spinner"></div><span style="font-size:13px;color:var(--text2);">${tt({pl:'Szukam...',en:'Searching...',de:'Suche...',es:'Buscando...'})}</span></div>`;
  try{
    const{data:uid,error:lookupErr}=await sb.rpc('get_user_id_by_email',{lookup_email:email});
    if(lookupErr)throw lookupErr;
    if(!uid){
      out.innerHTML=`<div style="color:var(--red);font-size:13px;margin-bottom:12px;">${tt({pl:'Nie znaleziono usera.',en:'No user found.',de:'Kein Nutzer gefunden.',es:'No se encontró usuario.'})}</div>`;
      return;
    }
    const{data:profile}=await sb.from('profiles').select('id,email,display_name').eq('id',uid).maybeSingle();
    const name=profile?.display_name||email;
    out.innerHTML=`<div class="client-card" style="cursor:default;margin-bottom:12px;">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--btn-text);display:flex;align-items:center;justify-content:center;font-weight:800;">${friendEsc(name)[0]?.toUpperCase()||'F'}</div>
      <div class="client-card-info"><div class="client-card-name">${friendEsc(name)}</div><div class="client-card-meta">${friendEsc(email)}</div></div>
      <button class="btn btn-sm btn-primary" onclick="sendFriendInvitation('${uid}','${friendEsc(email)}','${friendEsc(name).replace(/'/g,"\\'")}')" style="font-size:12px;padding:7px 12px;">${tt({pl:'Zaproś',en:'Invite',de:'Einladen',es:'Invitar'})}</button>
    </div>`;
  }catch(e){
    out.innerHTML=`<div style="color:var(--red);font-size:13px;margin-bottom:12px;">${friendEsc(e.message||'Search failed')}</div>`;
  }
}
window.searchFriendByEmail=searchFriendByEmail;

async function sendFriendInvitation(inviteeId,email,name){
  if(!sb||!S.user)return;
  const accepted=_friendInvitations.filter(i=>i.status==='accepted').length;
  if(accepted>=3)return showSyncToast(tt({pl:'Limit Friends to 3 osoby.',en:'Friends limit is 3 people.',de:'Friends-Limit ist 3 Personen.',es:'El límite de Friends es 3 personas.'}),'error');
  try{
    const existing=_friendInvitations.find(i=>
      (i.inviter_id===S.user.id&&i.invitee_id===inviteeId)||(i.inviter_id===inviteeId&&i.invitee_id===S.user.id)
    );
    if(existing&&['pending','accepted'].includes(existing.status)){
      showSyncToast(tt({pl:'Relacja lub zaproszenie już istnieje.',en:'Friendship or invitation already exists.',de:'Einladung existiert bereits.',es:'Ya existe relación o invitación.'}),'error');
      return;
    }
    const row={
      inviter_id:S.user.id,
      invitee_id:inviteeId,
      inviter_email:S.user.email,
      invitee_email:email,
      inviter_name:localStorage.getItem('bs-username')||S.user.name||S.user.email,
      invitee_name:name,
      status:'pending',
    };
    const{error}=await sb.from('friend_invitations').insert(row);
    if(error)throw error;
    addAppNotification({type:'friend_invite_sent',title:'Friends',body:tt({pl:'Zaproszenie wysłane.',en:'Invitation sent.',de:'Einladung gesendet.',es:'Invitación enviada.'})});
    showSyncToast(tt({pl:'Zaproszenie wysłane ✓',en:'Invitation sent ✓',de:'Einladung gesendet ✓',es:'Invitación enviada ✓'}),'success');
    await renderFriends();
  }catch(e){showSyncToast(e.message||'Invite failed','error');}
}
window.sendFriendInvitation=sendFriendInvitation;

async function acceptFriendInvitation(invId){
  if(!sb||!S.user)return;
  const accepted=_friendInvitations.filter(i=>i.status==='accepted').length;
  if(accepted>=3)return showSyncToast(tt({pl:'Limit Friends to 3 osoby.',en:'Friends limit is 3 people.',de:'Friends-Limit ist 3 Personen.',es:'El límite de Friends es 3 personas.'}),'error');
  const inv=_friendInvitations.find(i=>i.id===invId);
  if(!inv)return;
  try{
    const{error}=await sb.from('friend_invitations').update({status:'accepted',responded_at:new Date().toISOString()}).eq('id',invId).eq('invitee_id',S.user.id);
    if(error)throw error;
    addAppNotification({type:'friend_invite_accepted',title:'Friends',body:`${friendName(inv)} ${tt({pl:'jest teraz Twoim friendem.',en:'is now your friend.',de:'ist jetzt dein Friend.',es:'ahora es tu friend.'})}`});
    showSyncToast(tt({pl:'Zaproszenie zaakceptowane ✓',en:'Invitation accepted ✓',de:'Einladung angenommen ✓',es:'Invitación aceptada ✓'}),'success');
    await renderFriends();
  }catch(e){showSyncToast(e.message||'Accept failed','error');}
}
window.acceptFriendInvitation=acceptFriendInvitation;

async function declineFriendInvitation(invId){
  if(!sb||!S.user)return;
  try{
    const{error}=await sb.from('friend_invitations').update({status:'declined',responded_at:new Date().toISOString()}).eq('id',invId).eq('invitee_id',S.user.id);
    if(error)throw error;
    await renderFriends();
  }catch(e){showSyncToast(e.message||'Decline failed','error');}
}
window.declineFriendInvitation=declineFriendInvitation;

async function openFriendProfile(invId){
  const inv=_friendInvitations.find(i=>i.id===invId);
  if(!inv||!sb||!S.user)return;
  closeModal();
  const ov=document.createElement('div');
  ov.className='modal-overlay client-detail-overlay';
  ov.innerHTML=`<div class="modal client-detail-modal"><div id="friendDetailContent" style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div></div>`;
  ov._cleanup=()=>{stopFriendChatRealtime();_friendDetail=null;_friendDetailView=null;window._friendDetailView=null;};
  ov._backHandler=()=>{
    if(window._friendDetailView&&window._friendDetailView!=='hub'){
      renderFriendHub();
      return true;
    }
    closeModal();
    return true;
  };
  document.body.appendChild(ov);S.modal=ov;
  if(window._bsHistoryReady&&!window._bsHandlingBack&&typeof ensureBackTrap==='function')ensureBackTrap({modal:'friend-detail'});
  try{
    const fid=friendId(inv);
    const[profileRes,woRes]=await Promise.all([
      sb.from('profiles').select('id,email,display_name').eq('id',fid).maybeSingle(),
      sb.from('workouts').select('*').eq('user_id',fid).order('date',{ascending:false}),
    ]);
    if(profileRes.error)throw profileRes.error;
    if(woRes.error)throw woRes.error;
    _friendDetail={inv,friendId:fid,profile:profileRes.data||null,workouts:woRes.data||[]};
    renderFriendHub();
  }catch(e){
    document.getElementById('friendDetailContent').innerHTML=`<div style="padding:20px;text-align:center;color:var(--red);">${friendEsc(e.message||'Could not load friend')}<br><br><button class="btn btn-ghost" onclick="closeModal()">OK</button></div>`;
  }
}
window.openFriendProfile=openFriendProfile;

function friendBackLabel(){
  return String(t('backBtn')||'Back').replace(/^[\s←‹<\-]+/,'').trim()||'Back';
}

function friendHeader(title,sub,backMode){
  const backAction=backMode==='close'?'closeModal()':backMode?'renderFriendHub()':'';
  const backBtn=backAction?`<button class="modal-back client-detail-back-top" onclick="${backAction}" style="margin-bottom:8px;">${friendBackLabel()}</button>`:'';
  const bottomBack=backAction&&backMode!=='hub-chat'?`<div class="client-detail-bottom-back"><button class="btn btn-primary" onclick="${backAction}">${friendBackLabel()}</button></div>`:'';
  return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:16px;">
    <div>${backBtn}
      <div class="modal-title" style="margin-bottom:4px;">${friendEsc(title)}</div>${sub?`<div style="font-size:12px;color:var(--text2);">${friendEsc(sub)}</div>`:''}</div>
    <button class="rm-btn" onclick="closeModal()" style="width:34px;height:34px;font-size:18px;">✕</button>
  </div>${bottomBack}`;
}

function renderFriendHub(){
  const el=document.getElementById('friendDetailContent');
  const ctx=_friendDetail;if(!el||!ctx)return;
  _friendDetailView='hub';window._friendDetailView='hub';
  const name=ctx.profile?.display_name||friendName(ctx.inv);
  const monthStart=new Date();monthStart.setDate(1);monthStart.setHours(0,0,0,0);
  const monthWorkouts=ctx.workouts.filter(w=>new Date(w.date)>=monthStart);
  const monthVolume=monthWorkouts.reduce((a,w)=>a+(+(w.volume_kg||0)),0);
  el.style.display='block';el.style.padding='0';
  el.innerHTML=friendHeader(name,ctx.profile?.email||friendEmail(ctx.inv),'close')+`
    <div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:18px;">
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Miesiąc',en:'Month',de:'Monat',es:'Mes'})}</span></div><div class="stat-value">${monthWorkouts.length}</div><div class="stat-unit">${tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenos'})}</div></div>
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${t('volume')}</span></div><div class="stat-value">${fmtVol(monthVolume)}</div><div class="stat-unit">${unitVol()}</div></div>
      <div class="stat-card"><div class="stat-top"><span class="stat-label">Records</span></div><div class="stat-value">${friendRecords(ctx.workouts).length}</div><div class="stat-unit">PR</div></div>
    </div>
    <div class="quick-access-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
      ${friendTile('renderFriendRecords()','Records','<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M5 4H3v3a4 4 0 0 0 4 4"/><path d="M19 4h2v3a4 4 0 0 1-4 4"/>')}
      ${friendTile('renderFriendChat()','Chat','<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>')}
    </div>`;
}

function friendTile(action,label,svg){
  return `<div class="qa-tile" onclick="${action}"><div class="qa-tile-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">${svg}</svg></div><div class="qa-tile-label">${label}</div></div>`;
}

function e1rm(w,r){return w>0&&r>0?Math.round((w*(1+r/30))*10)/10:0;}
function friendRecords(workouts){
  const map={};
  workouts.forEach(w=>(w.exercises||[]).forEach(ex=>{
    const name=exName(ex)||ex.name||'Exercise';
    (ex.sets||[]).forEach(s=>{
      const wt=+(s.weight||0),r=+(s.reps||0),score=e1rm(wt,r);
      if(score&&(!map[name]||score>map[name].score))map[name]={name,score,weight:wt,reps:r,date:w.date};
    });
  }));
  return Object.values(map).sort((a,b)=>b.score-a.score);
}

function renderFriendRecords(){
  const el=document.getElementById('friendDetailContent'),ctx=_friendDetail;if(!el||!ctx)return;
  const records=friendRecords(ctx.workouts);
  _friendDetailView='records';window._friendDetailView='records';
  el.style.display='block';el.style.padding='0';
  el.innerHTML=friendHeader('Records',ctx.profile?.display_name||friendName(ctx.inv),'hub')+
    (records.length?records.map(r=>`<div class="workout-row" style="cursor:default;">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${friendEsc(r.name)}</div><div class="workout-row-meta">${dispW(r.weight)}${unitW()} × ${r.reps} · e1RM ${dispW(r.score)}${unitW()} · ${r.date||''}</div></div>
    </div>`).join(''):`<div class="empty-state">${t('noData')}</div>`);
}
window.renderFriendRecords=renderFriendRecords;

function stopFriendChatRealtime(){
  if(_friendChatChannel&&sb){try{sb.removeChannel(_friendChatChannel);}catch(e){}}
  _friendChatChannel=null;
}

async function renderFriendChat(){
  const el=document.getElementById('friendDetailContent'),ctx=_friendDetail;if(!el||!ctx||!sb)return;
  stopFriendChatRealtime();
  _friendDetailView='chat';window._friendDetailView='chat';
  el.style.display='block';el.style.padding='0';
  el.innerHTML=friendHeader('Chat',ctx.profile?.display_name||friendName(ctx.inv),'hub-chat')+`
    <div id="friendChatMessages" class="chat-messages friend-chat-messages"></div>
    <div class="chat-input-bar friend-chat-input-bar">
      <textarea id="friendChatInput" rows="1" maxlength="2000" placeholder="${tt({pl:'Napisz wiadomość...',en:'Write a message...',de:'Nachricht schreiben...',es:'Escribe un mensaje...'})}" style="min-height:44px;max-height:110px;resize:none;"></textarea>
      <button class="btn btn-primary" onclick="sendFriendMessage()" style="width:auto;min-width:86px;height:44px;padding:0 16px;">${tt({pl:'Wyślij',en:'Send',de:'Senden',es:'Enviar'})}</button>
    </div>
    <div class="chat-bottom-actions">
      <button class="btn btn-ghost" onclick="clearFriendChat()">${tt({pl:'Clear chat',en:'Clear chat',de:'Chat löschen',es:'Limpiar chat'})}</button>
      <button class="btn btn-primary" onclick="renderFriendHub()">${friendBackLabel()}</button>
    </div>`;
  await loadFriendMessages();
  _friendChatChannel=sb.channel('bs-friend-chat-'+ctx.inv.id)
    .on('postgres_changes',{event:'*',schema:'public',table:'friend_messages',filter:`invitation_id=eq.${ctx.inv.id}`},()=>loadFriendMessages())
    .subscribe();
}
window.renderFriendChat=renderFriendChat;

async function clearFriendChat(){
  const ctx=_friendDetail;if(!ctx||!sb)return;
  if(!confirm(tt({pl:'Wyczyścić cały chat?',en:'Clear the whole chat?',de:'Gesamten Chat löschen?',es:'¿Limpiar todo el chat?'})))return;
  const{error}=await sb.from('friend_messages').delete().eq('invitation_id',ctx.inv.id);
  if(error){showSyncToast(error.message,'error');return;}
  await loadFriendMessages();
  showSyncToast(tt({pl:'Chat wyczyszczony',en:'Chat cleared',de:'Chat gelöscht',es:'Chat limpiado'}),'success');
}
window.clearFriendChat=clearFriendChat;

async function openFriendChatFromNotification(invId){
  if(!invId||!sb||!S.user)return showScreen('friends');
  closeModal();
  showScreen('friends');
  const{data:inv,error}=await sb.from('friend_invitations').select('*').eq('id',invId).single();
  if(error||!inv){showSyncToast(error?.message||'Chat unavailable','error');return;}
  const exists=_friendInvitations.find(i=>i.id===inv.id);
  if(!exists)_friendInvitations.unshift(inv);
  else Object.assign(exists,inv);
  await openFriendProfile(inv.id);
  await renderFriendChat();
}
window.openFriendChatFromNotification=openFriendChatFromNotification;

async function loadFriendMessages(){
  const ctx=_friendDetail,list=document.getElementById('friendChatMessages');if(!ctx||!list||!sb)return;
  list.innerHTML=`<div style="display:flex;justify-content:center;padding:26px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('friend_messages').select('*').eq('invitation_id',ctx.inv.id).order('created_at',{ascending:true});
  if(error){list.innerHTML=`<div style="color:var(--red);padding:14px;">${friendEsc(error.message)}</div>`;return;}
  const rows=data||[];
  list.innerHTML=rows.length?rows.map(m=>{
    const mine=m.sender_id===S.user?.id;
    return `<div style="display:flex;justify-content:${mine?'flex-end':'flex-start'};margin:8px 0;"><div style="max-width:78%;background:${mine?'var(--accent)':'var(--bg2)'};color:${mine?'var(--btn-text)':'var(--text)'};border:1px solid ${mine?'var(--accent)':'var(--border)'};border-radius:14px;padding:9px 11px;"><div style="font-size:14px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;">${friendEsc(m.message)}</div><div style="font-size:10px;opacity:0.65;text-align:right;margin-top:5px;">${chatTime(m.created_at)}</div></div></div>`;
  }).join(''):`<div class="empty-state" style="padding:36px 16px;">${tt({pl:'Brak wiadomości.',en:'No messages yet.',de:'Noch keine Nachrichten.',es:'Sin mensajes todavía.'})}</div>`;
  list.scrollTop=list.scrollHeight;
}

async function sendFriendMessage(){
  const ctx=_friendDetail,input=document.getElementById('friendChatInput');if(!ctx||!input||!sb||!S.user)return;
  const msg=(input.value||'').trim();if(!msg)return;
  input.disabled=true;
  const{error}=await sb.from('friend_messages').insert({invitation_id:ctx.inv.id,sender_id:S.user.id,receiver_id:friendId(ctx.inv),message:msg});
  input.disabled=false;
  if(error){showSyncToast(error.message,'error');return;}
  input.value='';
  await loadFriendMessages();
}
window.sendFriendMessage=sendFriendMessage;

function rememberFriendNotification(payload){
  const m=payload?.new;
  if(!m||m.sender_id===S.user?.id)return;
  if(typeof addAppNotification==='function'){
    addAppNotification({type:'friend_message',title:'Friends',body:(m.message||'').slice(0,120),at:m.created_at,invitationId:m.invitation_id,action:`openFriendChatFromNotification('${friendEsc(m.invitation_id)}')`});
  }
  if(typeof showSyncToast==='function')showSyncToast(tt({pl:'Nowa wiadomość od frienda',en:'New friend message',de:'Neue Friend-Nachricht',es:'Nuevo mensaje de friend'}),'info');
}
window.rememberFriendNotification=rememberFriendNotification;
