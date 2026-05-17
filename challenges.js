// ===== FRIEND CHALLENGES =====

let _challenges=[];
let _challengeProgresses={}; // {challengeId:[{user_id,progress}]}
let _challengesLoading=false;

// ── Helpers ──────────────────────────────────────────────────────

function _calcMyProgress(ch){
  if(!S.workouts||!S.user)return 0;
  if(ch.type==='weekly_volume'){
    let total=0;
    for(const[k,w] of Object.entries(S.workouts)){
      const d=w.date||k.split('_')[0];
      if(d>=ch.starts_at&&d<=ch.ends_at)total+=(w.volume||0);
    }
    return Math.round(total);
  }
  if(ch.type==='goal'){
    const nm=(ch.exercise_name||'').trim().toLowerCase();
    let best=0;
    for(const[k,w] of Object.entries(S.workouts)){
      const d=w.date||k.split('_')[0];
      if(d>ch.ends_at)continue;
      for(const ex of (w.exercises||[])){
        if((exName(ex)||'').trim().toLowerCase()!==nm)continue;
        for(const s of (ex.sets||[])){
          const wt=+(s.weight||0);
          if(wt>best)best=wt;
        }
      }
    }
    return best;
  }
  return 0;
}

function _chOpponentName(ch){
  return ch.creator_id===S.user?.id
    ?(ch.opponent_name||'Opponent')
    :(ch.creator_name||'Challenger');
}
function _chMyName(){
  return localStorage.getItem('bs-username')||S.user?.email||'Me';
}
function _fmtProg(ch,val){
  if(ch.type==='weekly_volume')return+(val||0)>=1000?((val/1000).toFixed(1)+'t'):(val+'kg');
  if(ch.type==='goal')return dispW(val||0)+unitW();
  return String(val||0);
}
function _chStatusBadge(status){
  const map={
    pending:{l:{pl:'Oczekuje',en:'Pending'},c:'#e6a817'},
    active:{l:{pl:'Aktywne',en:'Active'},c:'#4caf50'},
    completed:{l:{pl:'Zakończone',en:'Completed'},c:'#888'},
    declined:{l:{pl:'Odrzucone',en:'Declined'},c:'var(--red)'},
  };
  const s=map[status]||map.pending;
  return`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${s.c}22;color:${s.c};border:1px solid ${s.c}44;white-space:nowrap;">${tt({pl:s.l.pl,en:s.l.en,de:s.l.pl,es:s.l.pl})}</span>`;
}
function _bar(val,maxVal,color){
  const pct=maxVal>0?Math.min(100,Math.round(val/maxVal*100)):0;
  return`<div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;margin-top:3px;"><div style="height:6px;background:${color};border-radius:3px;width:${pct}%;transition:width 0.5s;"></div></div>`;
}

// ── Load & Render ─────────────────────────────────────────────────

function renderChallenges(){
  const list=document.getElementById('challengesList');
  if(!list)return;
  if(!S.user||!sb){
    list.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby używać Wyzwań.',en:'Sign in to use Challenges.',de:'Anmelden für Challenges.',es:'Inicia sesión para desafíos.'})}</div>`;
    return;
  }
  list.innerHTML=`<div style="display:flex;justify-content:center;padding:32px 0;"><div class="spinner"></div></div>`;
  loadChallenges();
}
window.renderChallenges=renderChallenges;

async function loadChallenges(){
  if(_challengesLoading)return;
  _challengesLoading=true;
  try{
    const{data:chData,error:chErr}=await sb
      .from('challenges')
      .select('*')
      .or(`creator_id.eq.${S.user.id},opponent_id.eq.${S.user.id}`)
      .order('created_at',{ascending:false});
    if(chErr)throw chErr;
    _challenges=chData||[];

    if(_challenges.length){
      const ids=_challenges.map(c=>c.id);
      const{data:pData}=await sb.from('challenge_progress').select('*').in('challenge_id',ids);
      _challengeProgresses={};
      for(const p of (pData||[])){
        if(!_challengeProgresses[p.challenge_id])_challengeProgresses[p.challenge_id]=[];
        _challengeProgresses[p.challenge_id].push(p);
      }
    }
    _renderChallengeList();
    // Sync my progress for all active challenges
    await _syncAllChallengesProgress(true);
  }catch(e){
    const list=document.getElementById('challengesList');
    if(list)list.innerHTML=`<div style="color:var(--red);padding:12px;">${escHtml(e.message||'Failed to load challenges')}</div>`;
  }finally{
    _challengesLoading=false;
  }
}

function _renderChallengeList(){
  const list=document.getElementById('challengesList');
  if(!list)return;
  const active=_challenges.filter(c=>c.status==='active');
  const pending=_challenges.filter(c=>c.status==='pending');
  const past=_challenges.filter(c=>['completed','declined'].includes(c.status));
  const friends=typeof getAcceptedFriends==='function'?getAcceptedFriends():[];

  let html=`<button class="btn btn-primary" style="margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;" onclick="showCreateChallengeModal()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    ${tt({pl:'Nowe Wyzwanie',en:'New Challenge',de:'Neue Herausforderung',es:'Nuevo Desafío'})}
  </button>`;

  if(!_challenges.length){
    html+=`<div class="empty-state" style="padding:28px 16px;">
      <div style="font-size:44px;margin-bottom:10px;">⚔️</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:6px;">${tt({pl:'Brak wyzwań',en:'No challenges yet',de:'Keine Herausforderungen',es:'Sin desafíos'})}</div>
      <div style="font-size:13px;color:var(--text2);">${tt({pl:'Wyzwij znajomego i zobaczcie kto jest lepszy!',en:'Challenge a friend and see who\'s better!',de:'Fordere einen Freund heraus!',es:'¡Desafía a un amigo!'})}</div>
    </div>`;
    list.innerHTML=html;return;
  }

  if(pending.length){
    html+=`<div class="section-label">${tt({pl:'Oczekujące',en:'Pending',de:'Ausstehend',es:'Pendientes'})} (${pending.length})</div>`;
    html+=pending.map(c=>_challengeCardHtml(c)).join('');
  }
  if(active.length){
    html+=`<div class="section-label" style="${pending.length?'margin-top:16px;':''}">${tt({pl:'Aktywne 🔥',en:'Active 🔥',de:'Aktiv 🔥',es:'Activos 🔥'})} (${active.length})</div>`;
    html+=active.map(c=>_challengeCardHtml(c)).join('');
  }
  if(past.length){
    html+=`<div class="section-label" style="margin-top:16px;">${tt({pl:'Zakończone',en:'Past',de:'Vergangen',es:'Pasados'})}</div>`;
    html+=past.map(c=>_challengeCardHtml(c)).join('');
  }
  list.innerHTML=html;
}

function _challengeCardHtml(ch){
  const myId=S.user.id;
  const isCreator=ch.creator_id===myId;
  const myName=_chMyName();
  const theirName=_chOpponentName(ch);
  const progArr=_challengeProgresses[ch.id]||[];
  const myProgEntry=progArr.find(p=>p.user_id===myId);
  const theirProgEntry=progArr.find(p=>p.user_id!==myId);
  const myProg=myProgEntry?myProgEntry.progress:_calcMyProgress(ch);
  const theirProg=theirProgEntry?(theirProgEntry.progress||0):0;

  const typeIcon=ch.type==='weekly_volume'?'🏋️':'🎯';
  const typeLabel=ch.type==='weekly_volume'
    ?tt({pl:'Weekly Volume Race',en:'Weekly Volume Race',de:'Volumen-Wettbewerb',es:'Carrera de Volumen'})
    :tt({pl:'Wyzwanie: Cel',en:'Goal Challenge',de:'Ziel-Challenge',es:'Desafío de Meta'});

  const[ey,em,ed]=(ch.ends_at||'').split('-');
  const[,sm,sd]=(ch.starts_at||'').split('-');
  const dateStr=ch.type==='weekly_volume'
    ?`${sd}.${sm} → ${ed}.${em}`
    :`${tt({pl:'Do',en:'Until',de:'Bis',es:'Hasta'})} ${ed}.${em}.${ey}`;

  // Progress section (active or completed)
  let progressHtml='';
  if(ch.status==='active'||ch.status==='completed'){
    const maxP=ch.type==='goal'?(ch.target_value||100):Math.max(myProg,theirProg,1);
    const targetLine=ch.type==='goal'
      ?`<div style="font-size:11px;color:var(--text3);margin-bottom:8px;">${tt({pl:'Cel',en:'Target',de:'Ziel',es:'Meta'})}: <strong style="color:var(--text);">${dispW(ch.target_value)}${unitW()}</strong>${ch.exercise_name?` — ${escHtml(ch.exercise_name)}`:''}</div>`
      :'';

    let resultMsg='';
    if(ch.status==='active'){
      if(myProg>theirProg)resultMsg=`<div class="ch-result-msg ch-winning">🔥 ${tt({pl:'Prowadzisz!',en:'You\'re ahead!',de:'Du führst!',es:'¡Vas ganando!'})}</div>`;
      else if(theirProg>myProg)resultMsg=`<div class="ch-result-msg ch-losing">⚡ ${tt({pl:'Gonisz!',en:'Catch up!',de:'Aufholen!',es:'¡Alcanza!'})}</div>`;
      else if(myProg>0)resultMsg=`<div class="ch-result-msg ch-tied">🤝 ${tt({pl:'Remis!',en:'Tied!',de:'Gleichstand!',es:'¡Empate!'})}</div>`;
    } else {
      if(myProg>=theirProg)resultMsg=`<div class="ch-result-msg ch-winning">🏆 ${tt({pl:'Wygrałeś!',en:'You won!',de:'Gewonnen!',es:'¡Ganaste!'})}</div>`;
      else resultMsg=`<div class="ch-result-msg ch-losing">💪 ${tt({pl:'Dobra próba!',en:'Good effort!',de:'Guter Versuch!',es:'¡Buen esfuerzo!'})}</div>`;
    }

    const goalSuffix=ch.type==='goal'?` / ${dispW(ch.target_value)}${unitW()}`:'';
    progressHtml=`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
      ${targetLine}
      <div style="display:grid;gap:8px;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:2px;">
            <span style="color:var(--accent);font-weight:700;">${escHtml(myName)} <span style="font-size:10px;opacity:.7;">${tt({pl:'(Ty)',en:'(You)',de:'(Du)',es:'(Tú)'})}</span></span>
            <span style="font-weight:700;font-size:13px;">${_fmtProg(ch,myProg)}${goalSuffix}</span>
          </div>
          ${_bar(myProg,maxP,'var(--accent)')}
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:2px;">
            <span style="color:var(--text2);font-weight:600;">${escHtml(theirName)}</span>
            <span style="font-weight:700;font-size:13px;">${_fmtProg(ch,theirProg)}${goalSuffix}</span>
          </div>
          ${_bar(theirProg,maxP,'#6aa0f8')}
        </div>
      </div>
      ${resultMsg}
    </div>`;
  }

  // Action buttons
  let actionHtml='';
  if(ch.status==='pending'){
    if(!isCreator){
      actionHtml=`<div style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
        <button class="btn btn-sm btn-primary" style="flex:1;" onclick="acceptChallenge('${ch.id}')">${tt({pl:'Akceptuj ✓',en:'Accept ✓',de:'Annehmen ✓',es:'Aceptar ✓'})}</button>
        <button class="btn btn-sm btn-ghost" style="flex:1;" onclick="declineChallenge('${ch.id}')">${tt({pl:'Odrzuć',en:'Decline',de:'Ablehnen',es:'Rechazar'})}</button>
      </div>`;
    } else {
      actionHtml=`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span style="font-size:12px;color:var(--text3);">${tt({pl:'Czekam na odpowiedź…',en:'Waiting for response…',de:'Warte auf Antwort…',es:'Esperando respuesta…'})}</span>
        <button class="btn btn-sm btn-ghost" style="font-size:11px;padding:5px 10px;color:var(--red);" onclick="deleteChallenge('${ch.id}')">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
      </div>`;
    }
  }

  return`<div class="challenge-card">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:var(--text3);margin-bottom:3px;">${typeIcon} ${typeLabel}</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(ch.title||'Challenge')}</div>
        <div style="font-size:12px;color:var(--text2);">${escHtml(isCreator?theirName:ch.creator_name||'Challenger')} · ${dateStr}</div>
      </div>
      <div style="flex-shrink:0;">${_chStatusBadge(ch.status)}</div>
    </div>
    ${progressHtml}
    ${actionHtml}
  </div>`;
}

// ── Create Challenge Modal ────────────────────────────────────────

function showCreateChallengeModal(){
  if(!S.user||!sb){showSyncToast(tt({pl:'Zaloguj się.',en:'Sign in.',de:'Anmelden.',es:'Inicia sesión.'}),'error');return;}
  const friends=typeof getAcceptedFriends==='function'?getAcceptedFriends():[];
  if(!friends.length){
    showSyncToast(tt({pl:'Najpierw dodaj znajomych.',en:'Add friends first.',de:'Füge zuerst Freunde hinzu.',es:'Primero añade amigos.'}),'error');
    return;
  }
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const todayStr=today();
  const weekLater=new Date(Date.now()+7*86400000).toISOString().split('T')[0];
  const monthLater=new Date(Date.now()+30*86400000).toISOString().split('T')[0];
  const friendOpts=friends.map(inv=>{
    const fId=friendId(inv);
    const fN=escHtml(friendName(inv));
    return`<option value="${fId}" data-name="${fN}">${fN}</option>`;
  }).join('');

  ov.innerHTML=`<div class="modal" style="padding:22px 20px;">
    <div class="modal-handle"></div>
    <div class="modal-title" style="margin-bottom:16px;">⚔️ ${tt({pl:'Nowe Wyzwanie',en:'New Challenge',de:'Neue Herausforderung',es:'Nuevo Desafío'})}</div>

    <label class="form-label">${tt({pl:'Wybierz frienda',en:'Choose friend',de:'Freund wählen',es:'Elige amigo'})}</label>
    <select id="chFriendSel" style="margin-bottom:14px;font-size:14px;">${friendOpts}</select>

    <label class="form-label">${tt({pl:'Typ wyzwania',en:'Challenge type',de:'Art',es:'Tipo'})}</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
      <button type="button" id="chBtnVol" class="btn btn-primary" onclick="_setChType('weekly_volume')" style="font-size:12px;padding:11px 8px;">🏋️ Weekly Volume</button>
      <button type="button" id="chBtnGoal" class="btn btn-ghost" onclick="_setChType('goal')" style="font-size:12px;padding:11px 8px;">🎯 Goal Challenge</button>
    </div>

    <div id="chGoalFields" style="display:none;">
      <label class="form-label">${tt({pl:'Ćwiczenie',en:'Exercise',de:'Übung',es:'Ejercicio'})}</label>
      <input type="text" id="chExName" placeholder="Bench Press, Squat, Deadlift…" style="margin-bottom:10px;font-size:14px;"/>
      <label class="form-label">${tt({pl:'Cel wagowy (kg)',en:'Target weight (kg)',de:'Zielgewicht (kg)',es:'Peso meta (kg)'})}</label>
      <input type="number" id="chTarget" placeholder="100" min="1" style="margin-bottom:14px;width:130px;font-size:14px;"/>
    </div>

    <label class="form-label">${tt({pl:'Nazwa wyzwania',en:'Challenge title',de:'Titel',es:'Título'})}</label>
    <input type="text" id="chTitle" placeholder="${tt({pl:'np. Kto nabije więcej w tym tygodniu?',en:'e.g. Who lifts more this week?',de:'z. B. Wer hebt mehr?',es:'p. ej. ¿Quién levanta más?'})}" style="margin-bottom:14px;font-size:14px;"/>

    <label class="form-label">${tt({pl:'Data końca',en:'End date',de:'Enddatum',es:'Fecha fin'})}</label>
    <input type="date" id="chEndsAt" value="${weekLater}" min="${todayStr}" style="margin-bottom:20px;font-size:14px;"/>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
      <button class="btn btn-primary" id="chCreateBtn" onclick="submitCreateChallenge()">${tt({pl:'Wyślij ⚔️',en:'Send ⚔️',de:'Senden ⚔️',es:'Enviar ⚔️'})}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;

  window._chCurrentType='weekly_volume';
  window._chWeekLater=weekLater;
  window._chMonthLater=monthLater;
}
window.showCreateChallengeModal=showCreateChallengeModal;

window._setChType=function(t){
  window._chCurrentType=t;
  const btnV=document.getElementById('chBtnVol');
  const btnG=document.getElementById('chBtnGoal');
  const gf=document.getElementById('chGoalFields');
  const ed=document.getElementById('chEndsAt');
  if(btnV)btnV.className='btn '+(t==='weekly_volume'?'btn-primary':'btn-ghost');
  if(btnG)btnG.className='btn '+(t==='goal'?'btn-primary':'btn-ghost');
  if(gf)gf.style.display=t==='goal'?'block':'none';
  if(ed)ed.value=t==='weekly_volume'?(window._chWeekLater||''):(window._chMonthLater||'');
};

async function submitCreateChallenge(){
  const sel=document.getElementById('chFriendSel');
  const titleEl=document.getElementById('chTitle');
  const endsEl=document.getElementById('chEndsAt');
  const exEl=document.getElementById('chExName');
  const tgtEl=document.getElementById('chTarget');
  const type=window._chCurrentType||'weekly_volume';

  const opponentId=sel?.value||'';
  const opponentName=sel?.selectedOptions?.[0]?.dataset?.name||'Friend';
  const title=(titleEl?.value||'').trim();
  const endsAt=endsEl?.value||'';
  const exerciseName=(exEl?.value||'').trim();
  const targetValue=tgtEl?+tgtEl.value:0;

  if(!opponentId)return showSyncToast(tt({pl:'Wybierz frienda.',en:'Select a friend.',de:'Freund wählen.',es:'Selecciona amigo.'}),'error');
  if(!title){document.getElementById('chTitle')?.focus();return showSyncToast(tt({pl:'Wpisz nazwę wyzwania.',en:'Enter a challenge title.',de:'Titel eingeben.',es:'Introduce el título.'}),'error');}
  if(!endsAt)return showSyncToast(tt({pl:'Podaj datę końca.',en:'Set end date.',de:'Enddatum angeben.',es:'Define fecha fin.'}),'error');
  if(type==='goal'&&(!exerciseName||targetValue<=0))return showSyncToast(tt({pl:'Podaj ćwiczenie i cel.',en:'Enter exercise and target.',de:'Übung und Ziel eingeben.',es:'Introduce ejercicio y meta.'}),'error');

  const btn=document.getElementById('chCreateBtn');
  if(btn){btn.disabled=true;btn.textContent='...';}
  try{
    const{error}=await sb.from('challenges').insert({
      creator_id:S.user.id,
      creator_name:_chMyName(),
      opponent_id:opponentId,
      opponent_name:decodeURIComponent(opponentName),
      type,
      title,
      target_value:type==='goal'?targetValue:null,
      exercise_name:type==='goal'?exerciseName:null,
      starts_at:today(),
      ends_at:endsAt,
      status:'pending',
    });
    if(error)throw error;
    closeModal();
    showSyncToast(tt({pl:'Wyzwanie wysłane! ⚔️',en:'Challenge sent! ⚔️',de:'Herausforderung gesendet! ⚔️',es:'¡Desafío enviado! ⚔️'}),'success');
    addAppNotification({type:'challenge_sent',title:tt({pl:'Wyzwanie',en:'Challenge',de:'Herausforderung',es:'Desafío'}),body:title});
    await loadChallenges();
  }catch(e){
    showSyncToast(e.message||'Failed','error');
    if(btn){btn.disabled=false;btn.textContent=tt({pl:'Wyślij ⚔️',en:'Send ⚔️',de:'Senden ⚔️',es:'Enviar ⚔️'});}
  }
}
window.submitCreateChallenge=submitCreateChallenge;

// ── Accept / Decline / Delete ──────────────────────────────────────

async function acceptChallenge(id){
  if(!sb||!S.user)return;
  try{
    const{error}=await sb.from('challenges').update({status:'active'}).eq('id',id).eq('opponent_id',S.user.id);
    if(error)throw error;
    const ch=_challenges.find(c=>c.id===id);
    if(ch)ch.status='active';
    showSyncToast(tt({pl:'Wyzwanie zaakceptowane! 💪',en:'Challenge accepted! 💪',de:'Angenommen! 💪',es:'¡Aceptado! 💪'}),'success');
    _renderChallengeList();
    await _syncAllChallengesProgress(false);
  }catch(e){showSyncToast(e.message||'Failed','error');}
}
window.acceptChallenge=acceptChallenge;

async function declineChallenge(id){
  if(!sb||!S.user)return;
  try{
    const{error}=await sb.from('challenges').update({status:'declined'}).eq('id',id).eq('opponent_id',S.user.id);
    if(error)throw error;
    const ch=_challenges.find(c=>c.id===id);
    if(ch)ch.status='declined';
    showSyncToast(tt({pl:'Odrzucono.',en:'Declined.',de:'Abgelehnt.',es:'Rechazado.'}),'info');
    _renderChallengeList();
  }catch(e){showSyncToast(e.message||'Failed','error');}
}
window.declineChallenge=declineChallenge;

async function deleteChallenge(id){
  if(!sb||!S.user)return;
  try{
    const{error}=await sb.from('challenges').delete().eq('id',id).eq('creator_id',S.user.id);
    if(error)throw error;
    _challenges=_challenges.filter(c=>c.id!==id);
    showSyncToast(tt({pl:'Wyzwanie anulowane.',en:'Challenge cancelled.',de:'Abgebrochen.',es:'Cancelado.'}),'info');
    _renderChallengeList();
  }catch(e){showSyncToast(e.message||'Failed','error');}
}
window.deleteChallenge=deleteChallenge;

// ── Progress Sync ──────────────────────────────────────────────────

async function _syncChallengeProgress(ch){
  if(!sb||!S.user||ch.status!=='active')return;
  const progress=_calcMyProgress(ch);
  const{error}=await sb.from('challenge_progress').upsert(
    {challenge_id:ch.id,user_id:S.user.id,progress,updated_at:new Date().toISOString()},
    {onConflict:'challenge_id,user_id'}
  );
  if(!error){
    if(!_challengeProgresses[ch.id])_challengeProgresses[ch.id]=[];
    const idx=_challengeProgresses[ch.id].findIndex(p=>p.user_id===S.user.id);
    if(idx>=0)_challengeProgresses[ch.id][idx].progress=progress;
    else _challengeProgresses[ch.id].push({challenge_id:ch.id,user_id:S.user.id,progress});
    // Auto-complete goal challenge when target reached
    if(ch.type==='goal'&&ch.target_value&&progress>=ch.target_value){
      await sb.from('challenges').update({status:'completed'}).eq('id',ch.id);
      const local=_challenges.find(c=>c.id===ch.id);
      if(local)local.status='completed';
    }
  }
}

async function _syncAllChallengesProgress(rerender){
  if(!S.user||!sb)return;
  const active=_challenges.filter(c=>c.status==='active');
  if(!active.length)return;
  await Promise.all(active.map(ch=>_syncChallengeProgress(ch)));
  if(rerender)_renderChallengeList();
}

// Called from finishWorkout() — syncs progress and refreshes if tab is visible
window.syncAllChallengesProgress=async function(){
  if(!_challenges.length)return;
  await _syncAllChallengesProgress(false);
  if(document.getElementById('challengesList')){
    // Re-fetch opponent progress and re-render
    if(_challenges.length&&sb&&S.user){
      const ids=_challenges.map(c=>c.id);
      const{data:pData}=await sb.from('challenge_progress').select('*').in('challenge_id',ids);
      _challengeProgresses={};
      for(const p of (pData||[])){
        if(!_challengeProgresses[p.challenge_id])_challengeProgresses[p.challenge_id]=[];
        _challengeProgresses[p.challenge_id].push(p);
      }
      _renderChallengeList();
    }
  }
};
