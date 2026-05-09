// ===== DASHBOARD =====
function renderDashboard(){
  renderInvitationBanners();
  const ws=weekStart(),we=new Date(ws);we.setDate(we.getDate()+6);
  const fmt=d=>`${d.getDate()} ${t('monthsShort')[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('dashWeekLabel').textContent=`${t('week')} ${fmt(ws)} — ${fmt(we)}`;
  const keys=Object.entries(S.workouts).filter(([k,w])=>{const d=new Date((w.date||k.split('_')[0]));return d>=ws&&d<=we;}).map(([k])=>k);
  const tm=keys.reduce((a,k)=>a+(S.workouts[k].duration||0),0);
  const tv=keys.reduce((a,k)=>a+(S.workouts[k].volume||0),0);
  document.getElementById('dashStats').innerHTML=`
    <div class="stat-card" style="cursor:pointer;" onclick="showMonthChart()"><div class="stat-top"><span class="stat-label">${t('treningi')}</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div></div><div class="stat-value">${keys.length}</div><div class="stat-unit">${t('workoutsThisWeek')}</div></div>
    <div class="stat-card" style="cursor:pointer;" onclick="showMonthChart()"><div class="stat-top"><span class="stat-label">${t('czas')}</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></div></div><div class="stat-value">${tm}</div><div class="stat-unit">${t('minutes')}</div></div>
    <div class="stat-card" style="cursor:pointer;" onclick="showMonthChart()"><div class="stat-top"><span class="stat-label">${t('objetosc')}</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div></div><div class="stat-value">${fmtVol(tv)}</div><div class="stat-unit">${unitVol()}</div></div>`;

  // Streak
  const streak=getWorkoutStreak();
  const sb=document.getElementById('streakBanner');
  if(sb){
    if(streak>=2){
      sb.classList.add('visible');
      document.getElementById('streakCount').textContent=streak;
      const days=tt({pl:streak===1?'dzień':'dni',en:streak===1?'day':'days',de:streak===1?'Tag':'Tage',es:streak===1?'día':'días'});
      document.getElementById('streakLabel').textContent=tt({pl:`${days} z rzędu! Tak trzymaj 💪`,en:`${days} in a row! Keep it up 💪`,de:`${days} in Folge! Weiter so 💪`,es:`${days} seguidos! ¡Sigue así 💪`});
    } else {
      sb.classList.remove('visible');
    }
  }

  // Quick Access label
  const qaLbl=document.getElementById('lblQuickAccess');
  if(qaLbl)qaLbl.textContent=t('quickAccess');

  // Quick Access 6 tiles
  const QA_TILES=[
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
      labelKey:{pl:'Szybki trening',en:'Quick Workout',de:'Schnell-Training',es:'Entrenamiento rápido'},
      action:'startQuickWorkout()',
      accent:true,
    },
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
      labelKey:{pl:'Szablony',en:'Templates',de:'Vorlagen',es:'Plantillas'},
      action:"showScreen('templates')",
    },
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      labelKey:{pl:'Progres',en:'Progress',de:'Fortschritt',es:'Progreso'},
      action:"showScreen('progress')",
    },
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      labelKey:{pl:'Kalendarz',en:'Calendar',de:'Kalender',es:'Calendario'},
      action:"showScreen('calendar')",
    },
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
      labelKey:{pl:'Pomiary',en:'Measurements',de:'Messungen',es:'Medidas'},
      action:'openSettingsMeasurements()',
    },
    {
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>',
      labelKey:{pl:'Programy',en:'Programs',de:'Programme',es:'Programas'},
      action:"showScreen('programs')",
    },
  ];
  const qaGrid=document.getElementById('quickAccessGrid');
  if(qaGrid){
    qaGrid.innerHTML=QA_TILES.map(tile=>`
      <div class="qa-tile${tile.accent?' qa-tile-primary':''}" onclick="${tile.action}">
        <div class="qa-tile-icon">${tile.icon}</div>
        <div class="qa-tile-label">${tt(tile.labelKey)}</div>
      </div>`).join('');
  }

  // Recent workouts
  const recent=Object.entries(S.workouts).sort((a,b)=>{const da=a[1].date||a[0].split('_')[0];const db=b[1].date||b[0].split('_')[0];return db>da?1:db<da?-1:b[0]>a[0]?1:-1;}).slice(0,5);
  const el=document.getElementById('recentWorkouts');
  if(!recent.length){el.innerHTML=`<div class="empty-state">${t('noWorkouts')}</div>`;return;}
  el.innerHTML=recent.map(([k,w])=>{const dateStr=w.date||k.split('_')[0];const[y,m,d]=dateStr.split('-');return`<div class="workout-row" onclick="showWorkoutSummary('${k}')"><div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18M3 7h3M18 7h3M3 17h3M18 17h3"/></svg></div><div class="workout-row-info"><div class="workout-row-name">${displayWorkoutName(w)}</div><div class="workout-row-meta">${d}.${m}.${y} · ${w.duration} min · ${fmtVol(w.volume)}${unitVol()}</div></div><div>${typeTagHtml(w.types)}</div></div>`;}).join('');
}

// ===== CALENDAR =====
function renderCalendar(){
  if(!S.loaded)return;
  document.getElementById('calLabel').textContent=t('months')[S.month]+' '+S.year;

  // Monthly stats: workouts count + total volume
  const monthPrefix=`${S.year}-${String(S.month+1).padStart(2,'0')}-`;
  const monthWorkouts=Object.entries(S.workouts).filter(([wk])=>wk.startsWith(monthPrefix));
  const wCount=monthWorkouts.length;
  const wVol=monthWorkouts.reduce((a,[,w])=>a+(w.volume||0),0);
  const isPL=lang==='pl';
  const statsEl=document.getElementById('calStats');
  if(statsEl){
    statsEl.innerHTML=wCount
      ?`<span><strong>${wCount}</strong> ${tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenamientos'})}</span><span><strong>${fmtVol(wVol)}${unitVol()}</strong> ${tt({pl:'wolumen',en:'volume',de:'Volumen',es:'volumen'})}</span>`
      :`<span style="color:var(--text3);">${tt({pl:'Brak treningów w tym miesiącu',en:'No workouts this month',de:'Keine Trainings in diesem Monat',es:'Sin entrenamientos este mes'})}</span>`;
  }

  const g=document.getElementById('calGrid');
  g.innerHTML=t('days').map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  const first=new Date(S.year,S.month,1).getDay();
  const off=first===0?6:first-1;
  const days=new Date(S.year,S.month+1,0).getDate();
  const td=today();
  for(let i=0;i<off;i++)g.innerHTML+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=days;d++){
    const k=dk(S.year,S.month,d);
    const hasW=Object.keys(S.workouts).some(wk=>wk.startsWith(k));
    const cls=['cal-day',k===td?'today':'',hasW?'has-workout':'',S.selectedDate===k?'selected':''].filter(Boolean).join(' ');
    g.innerHTML+=`<div class="${cls}" onclick="selDay('${k}')">${d}</div>`;
  }
  renderDayDetail();
}
function selDay(k){S.selectedDate=k;renderCalendar();}
function renderDayDetail(){
  const el=document.getElementById('calDetail');if(!S.selectedDate){el.innerHTML='';return;}
  const dateKey=S.selectedDate;
  const[y,m,d]=dateKey.split('-');
  const dayWorkouts=Object.entries(S.workouts).filter(([wk])=>wk.startsWith(dateKey));

  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px;">
    <div style="font-size:13px;color:var(--text2);">${d}.${m}.${y}</div>
    <button class="btn btn-sm btn-ghost" onclick="openManualWorkout('${dateKey}')" style="font-size:12px;">${tt({pl:'+ Dodaj trening',en:'+ Add workout',de:'+ Training hinzufügen',es:'+ Añadir entrenamiento'})}</button>
  </div>`;

  if(!dayWorkouts.length){
    html+=`<div style="font-size:13px;color:var(--text3);margin-bottom:10px;">${t('noRest')}</div>`;
  } else {
    dayWorkouts.sort((a,b)=>a[0]>b[0]?1:-1).forEach(([wk,w])=>{
      html+=`<div class="workout-row" onclick="showWorkoutSummary('${wk}')" style="margin-bottom:8px;">
        <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18M3 7h3M18 7h3M3 17h3M18 17h3"/></svg></div>
        <div class="workout-row-info"><div class="workout-row-name">${displayWorkoutName(w)}</div><div class="workout-row-meta">${w.duration} min · ${fmtVol(w.volume)}${unitVol()}</div></div>
        <div>${typeTagHtml(w.types)}</div>
      </div>`;
    });
  }
  el.innerHTML=html;
}
function changeMonth(dir){S.month+=dir;if(S.month>11){S.month=0;S.year++;}if(S.month<0){S.month=11;S.year--;}renderCalendar();}

// ===== PROGRESS =====
let _progressTpl=window._progressTpl||null;
let _progressTab='lifts';
let _progressGk=null;
let _progressEquip=new Set();
let liftsCharts=[];
function destroyLiftsCharts(){liftsCharts.forEach(c=>{try{c.destroy();}catch(e){}});liftsCharts=[];}

function renderProgress(){
  const el=document.getElementById('progressContent');
  if(!el)return;
  destroyLiftsCharts();
  if(progressChart){try{progressChart.destroy();}catch(e){}progressChart=null;}

  const isPL=lang==='pl';
  const tabsHtml=`<div style="display:flex;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:4px;margin-bottom:16px;">
    <button onclick="setProgressTab('lifts')" style="flex:1;padding:10px 8px;border-radius:9px;border:none;background:${_progressTab==='lifts'?'var(--accent)':'none'};color:${_progressTab==='lifts'?'var(--btn-text)':'var(--text2)'};font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">${tt({pl:'Wyniki',en:'Your Lifts',de:'Leistung',es:'Rendimiento'})}</button>
    <button onclick="setProgressTab('templates')" style="flex:1;padding:10px 8px;border-radius:9px;border:none;background:${_progressTab==='templates'?'var(--accent)':'none'};color:${_progressTab==='templates'?'var(--btn-text)':'var(--text2)'};font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">${t('templates')}</button>
    <button onclick="setProgressTab('records')" style="flex:1;padding:10px 8px;border-radius:9px;border:none;background:${_progressTab==='records'?'var(--accent)':'none'};color:${_progressTab==='records'?'var(--btn-text)':'var(--text2)'};font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;">${tt({pl:'Rekordy',en:'Records',de:'Rekorde',es:'Récords'})}</button>
  </div>`;

  if(_progressTab==='records'){renderRecordsTab(el,tabsHtml);return;}

  if(_progressTab==='templates'){
    if(!S.templates.length){el.innerHTML=tabsHtml+`<div class="empty-state">${t('noData')}</div>`;return;}
    const selId=_progressTpl||S.templates[0].id;_progressTpl=selId;
    const btns=S.templates.map(tp=>`<button class="progress-tpl-btn ${tp.id===selId?'active':''}" onclick="setProgressTpl(${tp.id})">${tp.name}</button>`).join('');
    const data=getProgress(selId,today());
    const tpName=S.templates.find(tp=>tp.id===selId)?.name||'';
    el.innerHTML=tabsHtml+`<div style="display:flex;flex-wrap:wrap;margin-bottom:16px;">${btns}</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:10px;color:var(--text2);">${t('objetosc')} — ${tpName}</div>
      <div style="position:relative;width:100%;height:220px;margin-bottom:10px;"><canvas id="progressChart"></canvas></div>
      ${!data.length?`<div class="empty-state">${t('noData')}</div>`:''}`;
    if(data.length){
      setTimeout(()=>{
        const ctx=document.getElementById('progressChart');if(!ctx)return;
        progressChart=new Chart(ctx,{type:'line',data:{labels:data.map(x=>x.l),datasets:[{data:data.map(x=>x.v),borderColor:'#c9a96e',backgroundColor:'rgba(201,169,110,0.07)',borderWidth:2.5,pointBackgroundColor:'#c9a96e',pointRadius:data.map((_,i)=>i===data.length-1?7:4),fill:true,tension:0.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:10},callback:v=>fmtVolTick(v)}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
      },100);
    }
    return;
  }

  // === YOUR LIFTS TAB ===
  if(!isPro()){
    el.innerHTML=tabsHtml+`
      <div style="text-align:center;padding:36px 20px;">
        <div style="font-size:48px;line-height:1;margin-bottom:12px;">🔒</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${tt({pl:'Funkcja Pro',en:'Pro feature',de:'Pro-Funktion',es:'Función Pro'})}</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:18px;max-width:320px;margin-left:auto;margin-right:auto;">${tt({pl:'Pełna analiza progresu — partie mięśniowe, filtr sprzętu, top ćwiczenia z osobnymi wykresami.',en:'Full progress view — muscle groups, equipment filter, top exercises with their own charts.',de:'Volle Fortschrittsansicht — Muskelgruppen, Gerätefilter, Top-Übungen mit eigenen Charts.',es:'Vista completa de progreso — grupos musculares, filtro de equipo, top ejercicios con sus gráficos.'})}</div>
        <button class="btn btn-primary" onclick="showPaywall('your_lifts')" style="max-width:240px;margin:0 auto;">${tt({pl:'Zobacz Pro',en:'See Pro',de:'Pro ansehen',es:'Ver Pro'})}</button>
      </div>`;
    return;
  }
  const presentGks=getPresentMuscleGroups();
  if(!presentGks.length){
    el.innerHTML=tabsHtml+`<div class="empty-state">${tt({pl:'Brak danych. Zacznij trening, żeby zobaczyć progres.',en:'No data yet. Start a workout to see progress.',de:'Noch keine Daten. Starte ein Training, um Fortschritt zu sehen.',es:'Sin datos. Empieza un entrenamiento para ver el progreso.'})}</div>`;
    return;
  }
  if(!_progressGk||!presentGks.includes(_progressGk))_progressGk=presentGks[0];

  const groupChips=presentGks.map(gk=>{
    const lbl=(MUSCLE_LABELS[gk]||{})[lang]||gk;
    const isAct=_progressGk===gk;
    return`<button onclick="setProgressGk('${gk}')" style="padding:8px 14px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent)':'none'};color:${isAct?'var(--btn-text)':'var(--text2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${lbl}</button>`;
  }).join('');

  const presentEq=getPresentEquipForGroup(_progressGk);
  // Drop equipment filters no longer present for this group
  for(const e of Array.from(_progressEquip))if(!presentEq.includes(e))_progressEquip.delete(e);

  let equipChipsHtml='';
  if(presentEq.length){
    const allLbl=tt({pl:'Cały sprzęt',en:'All equipment',de:'Alle Geräte',es:'Todo el equipo'});
    const equipChips=[
      `<button onclick="toggleProgressEquip('__all__')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${_progressEquip.size===0?'var(--accent-dim)':'none'};color:${_progressEquip.size===0?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${allLbl}</button>`,
      ...presentEq.map(eq=>{
        const lbl=(EQUIPMENT_LABELS[eq]||{en:eq,pl:eq})[lang]||eq;
        const isAct=_progressEquip.has(eq);
        const safeEq=eq.replace(/'/g,"\\'");
        return`<button onclick="toggleProgressEquip('${safeEq}')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent-dim)':'none'};color:${isAct?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${lbl}</button>`;
      })
    ].join('');
    equipChipsHtml=`<div style="display:flex;gap:7px;overflow-x:auto;padding-bottom:12px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">${equipChips}</div>`;
  }

  const gkLabel=(MUSCLE_LABELS[_progressGk]||{})[lang]||_progressGk;
  const mainData=getMuscleProgress(_progressGk,_progressEquip);
  const top=getTopExercisesForGroup(_progressGk,_progressEquip,3);

  let topHtml='';
  if(top.length){
    topHtml=`<div style="margin-top:24px;font-size:13px;color:var(--text2);font-weight:600;margin-bottom:10px;">${tt({pl:'Najczęściej robione',en:'Most frequent',de:'Am häufigsten',es:'Más frecuentes'})}</div>`;
    top.forEach((it,i)=>{
      const eqLbl=it.equipment?(EQUIPMENT_LABELS[it.equipment]||{en:it.equipment,pl:it.equipment})[lang]:'';
      const stats=getExerciseStats(it.key);
      const prHtml=stats.bestSet?`<span style="color:var(--accent);font-weight:600;">${dispW(stats.bestSet.weight)}${unitW()}×${stats.bestSet.reps}</span> <span style="color:var(--text3);">· e1RM ${dispW(stats.est1RM)}${unitW()}</span>`:'';
      const meta=`${it.count}× ${tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenamientos'})}${eqLbl?' · '+eqLbl:''}`;
      topHtml+=`<div style="margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:4px;gap:8px;">
          <div style="font-size:14px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${it.name}</div>
          <div style="font-size:11px;color:var(--text3);flex-shrink:0;">${meta}</div>
        </div>
        ${prHtml?`<div style="font-size:11px;margin-bottom:6px;">${tt({pl:'Najlepsza seria',en:'Best set',de:'Beste Serie',es:'Mejor serie'})}: ${prHtml}</div>`:''}
        <div style="position:relative;width:100%;height:120px;"><canvas id="liftChart_${i}"></canvas></div>
      </div>`;
    });
  }

  el.innerHTML=tabsHtml+
    `<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-bottom:4px;">${groupChips}</div>`+
    equipChipsHtml+
    `<div style="font-size:14px;font-weight:600;margin-bottom:10px;color:var(--text2);">${t('volume')} — ${gkLabel}</div>`+
    `<div style="position:relative;width:100%;height:220px;margin-bottom:10px;"><canvas id="liftMainChart"></canvas></div>`+
    (mainData.length?'':`<div class="empty-state">${tt({pl:'Brak danych dla tego filtra',en:'No data for this filter',de:'Keine Daten für diesen Filter',es:'Sin datos para este filtro'})}</div>`)+
    topHtml;

  setTimeout(()=>{
    if(mainData.length){
      const ctx=document.getElementById('liftMainChart');
      if(ctx)liftsCharts.push(new Chart(ctx,{type:'line',data:{labels:mainData.map(x=>x.l),datasets:[{data:mainData.map(x=>x.v),borderColor:'#c9a96e',backgroundColor:'rgba(201,169,110,0.08)',borderWidth:2.5,pointBackgroundColor:'#c9a96e',pointRadius:mainData.map((_,i)=>i===mainData.length-1?7:4),fill:true,tension:0.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:10},callback:v=>fmtVolTick(v)}},x:{grid:{display:false},ticks:{font:{size:10}}}}}}));
    }
    top.forEach((it,i)=>{
      const data=getExerciseProgress(it.key);
      if(!data.length)return;
      const ctx=document.getElementById('liftChart_'+i);
      if(!ctx)return;
      liftsCharts.push(new Chart(ctx,{type:'line',data:{labels:data.map(x=>x.l),datasets:[{data:data.map(x=>x.v),borderColor:'#c9a96e',backgroundColor:'rgba(201,169,110,0.06)',borderWidth:2,pointBackgroundColor:'#c9a96e',pointRadius:data.map((_,i2)=>i2===data.length-1?5:3),fill:true,tension:0.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:9},callback:v=>v>=1000?(v/1000).toFixed(1)+'t':v+'kg'}},x:{grid:{display:false},ticks:{font:{size:9}}}}}}));
    });
  },100);
}

// ===== RECORDS / PERSONAL BESTS =====
let _recordsFilter='';

function renderRecordsTab(el,tabsHtml){
  // Collect all sets from workout history, grouped by exercise name
  const exMap={};
  for(const [wk,w] of Object.entries(S.workouts)){
    const dateStr=w.date||wk.split('_')[0]||wk;
    for(const ex of (w.exercises||[])){
      const nm=exName(ex).trim();
      if(!nm)continue;
      if(!exMap[nm])exMap[nm]=[];
      for(const s of (ex.sets||[])){
        const wt=+(s.weight||0),r=+(s.reps||0);
        if(wt<=0||r<=0)continue;
        exMap[nm].push({weight:wt,reps:r,e1RM:epleyEst1RM(wt,r),date:dateStr});
      }
    }
  }
  if(!Object.keys(exMap).length){
    el.innerHTML=tabsHtml+`<div class="empty-state">${tt({pl:'Brak danych. Zrób kilka treningów.',en:'No data yet. Complete some workouts.',de:'Noch keine Daten.',es:'Sin datos aún.'})}</div>`;
    return;
  }
  let records=Object.entries(exMap).map(([name,sets])=>{
    const sorted=sets.slice().sort((a,b)=>b.e1RM-a.e1RM);
    const bestE1RM=sorted[0].e1RM;
    const bestSet=sets.reduce((b,s)=>(s.weight>b.weight||(s.weight===b.weight&&s.reps>b.reps))?s:b,sets[0]);
    const rm=reps=>Math.round(bestE1RM/(1+reps/30)*2)/2;
    return{name,sets:sorted,bestE1RM,bestSet,rm3:rm(3),rm5:rm(5),rm8:rm(8)};
  });
  const f=_recordsFilter.toLowerCase();
  if(f)records=records.filter(r=>r.name.toLowerCase().includes(f));
  records.sort((a,b)=>a.name.localeCompare(b.name));

  const safeName=n=>n.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
  const cards=records.map(r=>`
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;transition:border-color 0.12s;" onclick="showRecordDetail('${safeName(r.name)}')" onmouseenter="this.style.borderColor='var(--border2)'" onmouseleave="this.style.borderColor='var(--border)'">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.name}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px;">e1RM <span style="color:var(--accent);font-weight:700;">${dispW(r.bestE1RM)}${unitW()}</span>&nbsp;·&nbsp;${tt({pl:'Najlepsza seria',en:'Best',de:'Bester Satz',es:'Mejor serie'})}: <strong>${dispW(r.bestSet.weight)}${unitW()} × ${r.bestSet.reps}</strong></div>
        </div>
        <span style="color:var(--text3);font-size:20px;margin-left:8px;flex-shrink:0;">›</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${[{l:'3RM',v:r.rm3,rp:3},{l:'5RM',v:r.rm5,rp:5},{l:'8RM',v:r.rm8,rp:8}].map(rm=>`
          <div style="background:var(--bg3);border-radius:10px;padding:10px 8px;text-align:center;">
            <div style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:0.5px;margin-bottom:5px;">${rm.l}</div>
            <div style="font-size:13px;font-weight:700;">${dispW(rm.v)}${unitW()}</div>
            <div style="font-size:11px;color:var(--text3);">× ${rm.rp}</div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  el.innerHTML=tabsHtml+`
    <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:2px;">${tt({pl:'Rekordy',en:'Records',de:'Rekorde',es:'Récords'})}</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:14px;">${tt({pl:'Twoje najlepsze serie i szacowane 1RM',en:'Your best sets and estimated 1RM',de:'Beste Sätze und geschätztes 1RM',es:'Tus mejores series y 1RM estimado'})}</div>
    <input type="text" id="recordsSearch" value="${_recordsFilter.replace(/"/g,'&quot;')}" placeholder="${t('search')}" oninput="window._recordsFilter=this.value;_recordsFilter=this.value;renderProgress();" style="margin-bottom:16px;"/>
    ${records.length?cards:`<div class="empty-state">${tt({pl:'Brak wyników',en:'No results',de:'Keine Ergebnisse',es:'Sin resultados'})}</div>`}`;
}

window.showRecordDetail=function(name){
  const sets={};
  for(const [wk,w] of Object.entries(S.workouts)){
    const dateStr=w.date||wk.split('_')[0]||wk;
    for(const ex of (w.exercises||[])){
      if(exName(ex).trim()!==name)continue;
      for(const s of (ex.sets||[])){
        const wt=+(s.weight||0),r=+(s.reps||0);
        if(wt<=0||r<=0)continue;
        const key=`${dateStr}|${wt}|${r}`;
        if(!sets[key])sets[key]={weight:wt,reps:r,e1RM:epleyEst1RM(wt,r),date:dateStr};
      }
    }
  }
  const sorted=Object.values(sets).sort((a,b)=>b.e1RM-a.e1RM);
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
      <div>
        <div style="font-size:18px;font-weight:700;">${tt({pl:'Rekordy',en:'Records',de:'Rekorde',es:'Récords'})}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:2px;">${name}</div>
      </div>
      <button onclick="closeModal();" style="background:none;border:none;color:var(--text3);font-size:24px;cursor:pointer;padding:0 4px;line-height:1;">×</button>
    </div>
    <div style="max-height:62vh;overflow-y:auto;margin-top:12px;">
      ${sorted.map((s,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);${i===0?'background:var(--accent-dim);margin:0 -4px;padding:12px 4px;border-radius:8px;margin-bottom:4px;':''}">
        <div>
          <div style="font-size:15px;font-weight:700;">${dispW(s.weight)}${unitW()} × ${s.reps}${i===0?` <span style="font-size:10px;background:var(--accent);color:var(--btn-text);padding:2px 6px;border-radius:4px;font-weight:700;vertical-align:middle;">PR</span>`:''}
          </div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px;">${s.date}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--text3);">e1RM</div>
          <div style="font-size:17px;font-weight:700;color:var(--accent);">${dispW(s.e1RM)}${unitW()}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
};

window.setProgressTab=tab=>{_progressTab=tab;renderProgress()};
window.setProgressGk=gk=>{_progressGk=gk;renderProgress();};
window.toggleProgressEquip=eq=>{
  if(eq==='__all__'){_progressEquip.clear();}
  else{if(_progressEquip.has(eq))_progressEquip.delete(eq);else _progressEquip.add(eq);}
  renderProgress();
};
window.setProgressTpl=id=>{_progressTpl=id;window._progressTpl=id;renderProgress();};
window.selProgressTpl=id=>{_progressTpl=id;renderProgress();};

// ===== EXERCISES BROWSE =====
let _browseGks=new Set();
let _browseEquip=new Set();
let _browseSearchQ='';

function renderExercises(){
  const listEl=document.getElementById('brwList');
  if(!listEl)return;
  // Update search placeholder for current language
  const searchEl=document.getElementById('brwSearch');
  if(searchEl)searchEl.placeholder=t('search');
  if(exDbCache===null){
    listEl.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text2);"><div class="spinner" style="margin:0 auto 12px;"></div><div style="font-size:13px;">${lang==='pl'?'Ładowanie ćwiczeń...':'Loading exercises...'}</div></div>`;
    document.getElementById('brwFilterChips').innerHTML='';
    document.getElementById('brwEquipChips').innerHTML='';
    fetchExerciseDb().then(()=>{renderBrowseChips();renderBrowseList();});
    return;
  }
  renderBrowseChips();
  renderBrowseList();
}

function renderBrowseChips(){
  const chipsEl=document.getElementById('brwFilterChips');
  if(chipsEl){
    const exGroups=getExGroups();
    const gks=Object.keys(exGroups);
    const allLabel=lang==='pl'?'Wszystkie':(lang==='de'?'Alle':(lang==='es'?'Todos':'All'));
    const chips=[
      `<button onclick="toggleBrowseGk('__all__')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${_browseGks.size===0?'var(--accent)':'none'};color:${_browseGks.size===0?'var(--btn-text)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${allLabel}</button>`,
      ...gks.map(gk=>{
        const grp=exGroups[gk];const label=grp[lang]||grp.pl||grp.en||gk;const isAct=_browseGks.has(gk);
        return`<button onclick="toggleBrowseGk('${gk}')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent)':'none'};color:${isAct?'var(--btn-text)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${label}</button>`;
      })
    ].join('');
    chipsEl.innerHTML=chips;
  }
  const equipEl=document.getElementById('brwEquipChips');
  if(equipEl){
    if(!isPro()){equipEl.innerHTML='';equipEl.style.display='none';return;}
    const exGroups=getExGroups();
    const present=new Set();
    Object.values(exGroups).forEach(g=>g.items.forEach(it=>{if(it.equipment)present.add(it.equipment);}));
    const order=['barbell','dumbbell','machine','cable','body only','kettlebells','bands','e-z curl bar','medicine ball','exercise ball','foam roll','other'];
    const eqs=order.filter(k=>present.has(k));
    if(!eqs.length){equipEl.innerHTML='';equipEl.style.display='none';return;}
    equipEl.style.display='flex';
    const allLbl=lang==='pl'?'Cały sprzęt':(lang==='de'?'Alle Geräte':(lang==='es'?'Todo el equipo':'All equipment'));
    const chips=[
      `<button onclick="toggleBrowseEquip('__all__')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${_browseEquip.size===0?'var(--accent-dim)':'none'};color:${_browseEquip.size===0?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${allLbl}</button>`,
      ...eqs.map(eq=>{
        const lbl=(EQUIPMENT_LABELS[eq]||{en:eq,pl:eq})[lang]||eq;
        const isAct=_browseEquip.has(eq);
        const safeEq=eq.replace(/'/g,"\\'");
        return`<button onclick="toggleBrowseEquip('${safeEq}')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent-dim)':'none'};color:${isAct?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${lbl}</button>`;
      })
    ].join('');
    equipEl.innerHTML=chips;
  }
}

function renderBrowseList(){
  const listEl=document.getElementById('brwList');
  if(!listEl)return;
  const exGroups=getExGroups();
  const gks=Object.keys(exGroups);
  let totalCount=0;
  const html=gks.map(gk=>{
    if(_browseGks.size>0&&!_browseGks.has(gk))return'';
    const grp=exGroups[gk];
    const label=grp[lang]||grp.pl||grp.en||gk;
    const items=grp.items.filter(e=>{
      if(_browseSearchQ&&!((e[lang]||e.pl||e.en||'').toLowerCase().includes(_browseSearchQ.toLowerCase())))return false;
      if(_browseEquip.size>0&&(!e.equipment||!_browseEquip.has(e.equipment)))return false;
      return true;
    });
    if(!items.length)return'';
    totalCount+=items.length;
    return'<div class="ex-picker-group"><div class="ex-picker-group-title">'+label+' <span style="color:var(--text3);font-weight:400;">('+items.length+')</span></div>'+items.map(e=>{
      const nm=e[lang]||e.pl||e.en||'';
      const safeId=String(e.id||'').replace(/'/g,"\\'");
      const eqLbl=e.equipment?((EQUIPMENT_LABELS[e.equipment]||{en:e.equipment,pl:e.equipment})[lang]||e.equipment):'';
      const subtitle=eqLbl?`${label} · ${eqLbl}`:label;
      return`<div class="ex-picker-item" onclick="showExerciseDetail('${safeId}','${gk}')">
        <div class="ex-thumb">${e.img?`<img src="${e.img}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;" loading="lazy"/>`:`${exSvgByGroup(gk)}`}</div>
        <div class="ex-info"><div class="ex-info-name">${nm}</div><div class="ex-info-group">${subtitle}</div></div>
        <div style="color:var(--accent);font-size:18px;flex-shrink:0;padding:0 4px;">›</div>
      </div>`;
    }).join('')+'</div>';
  }).join('');
  const noResults=lang==='pl'?'Brak wyników':(lang==='de'?'Keine Ergebnisse':(lang==='es'?'Sin resultados':'No results'));
  listEl.innerHTML=html||`<div style="text-align:center;padding:32px;color:var(--text3);font-size:13px;">${noResults}</div>`;
}

window.toggleBrowseGk=gk=>{
  if(gk==='__all__'){_browseGks.clear();}
  else{if(_browseGks.has(gk))_browseGks.delete(gk);else _browseGks.add(gk);}
  renderBrowseChips();renderBrowseList();
};
window.toggleBrowseEquip=eq=>{
  if(eq==='__all__'){_browseEquip.clear();}
  else{if(_browseEquip.has(eq))_browseEquip.delete(eq);else _browseEquip.add(eq);}
  renderBrowseChips();renderBrowseList();
};
window.onBrowseSearch=q=>{_browseSearchQ=q;renderBrowseList();};

// ===== PROGRAMS =====
let _expandedProgramId=null;

function localizedField(p,field){
  const v=p[field];
  if(!v)return'';
  if(typeof v==='string')return v;
  return v[lang]||v.en||v.pl||'';
}

function renderPrograms(){
  const el=document.getElementById('programsContent');
  if(!el)return;

  const levelLabels={
    beginner:tt({pl:'Początkujący',en:'Beginner',de:'Anfänger',es:'Principiante'}),
    intermediate:tt({pl:'Średniozaawansowany',en:'Intermediate',de:'Fortgeschritten',es:'Intermedio'}),
    advanced:tt({pl:'Zaawansowany',en:'Advanced',de:'Fortgeschritten+',es:'Avanzado'}),
  };
  const userPrograms=Array.isArray(S.programs)?S.programs:[];
  const allPrograms=[...BUILTIN_PROGRAMS,...userPrograms];

  const introHtml=`<div style="font-size:13px;color:var(--text2);margin-bottom:18px;line-height:1.5;">${tt({pl:'Wybierz program i ruszaj. Każdy program zawiera kilka treningów do rotacji w cyklu tygodniowym.',en:'Pick a program and start. Each contains multiple workouts you rotate through weekly.',de:'Wähle ein Programm und leg los. Jedes enthält mehrere Workouts, die du wöchentlich rotierst.',es:'Elige un programa y empieza. Cada uno contiene varios entrenamientos que rotas semanalmente.'})}</div>`;

  // Coach Mode: "+ New Program" button at top
  const coachHeader=S.coachMode?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;">
    <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">${tt({pl:'🪪 Tryb trenera',en:'🪪 Coach Mode',de:'🪪 Trainer-Modus',es:'🪪 Modo entrenador'})}</div>
    <button class="btn btn-sm btn-primary" onclick="openProgramEditor(null)" style="font-size:13px;padding:8px 14px;display:inline-flex;align-items:center;gap:6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>${tt({pl:'Nowy program',en:'New program',de:'Neues Programm',es:'Nuevo programa'})}</button>
  </div>`:'';

  const cards=allPrograms.map(p=>{
    const expanded=_expandedProgramId===p.id;
    const lvlLbl=levelLabels[p.level]||p.level||'';
    const lvlColor={beginner:'#7ec77e',intermediate:'#e6c98c',advanced:'#e88a8a'}[p.level]||'var(--text3)';
    const tpls=p.templates||[];
    const safeId=String(p.id).replace(/'/g,"\\'");
    const exercisesHtml=expanded?tpls.map((tp,ti)=>`
      <div style="background:var(--bg3);border-radius:10px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;">
          <div style="font-size:14px;font-weight:700;flex:1;">${tp.name}</div>
          <button class="btn btn-sm btn-primary" onclick='startProgramWorkout("${safeId}",${ti})' style="font-size:12px;padding:7px 14px;flex-shrink:0;">${t('startTemplate')}</button>
        </div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:8px;">${(tp.exercises||[]).length} ${t('exExercises')} · ${t('exRest')} ${tp.restDefault||90}s</div>
        ${(tp.exercises||[]).map(e=>`<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);padding:4px 0;border-top:1px solid var(--border);"><span style="flex:1;padding-right:8px;">${e.sup?'<span style="color:#7ec77e;font-weight:700;font-size:10px;">SS </span>':''}${exName(e)}</span><span style="color:var(--text3);flex-shrink:0;">${e.sets}×${e.reps}${e.weight?' · '+dispW(e.weight)+unitW():''}</span></div>`).join('')}
      </div>`).join(''):'';

    // Coach actions for custom (non-builtin) programs when expanded
    const coachActions=(expanded&&!p.builtin)?`<div style="display:flex;gap:6px;margin-top:14px;flex-wrap:wrap;">
      <button class="btn btn-sm btn-ghost" onclick='shareProgram("${safeId}")' style="flex:1;min-width:0;font-size:12px;padding:8px 12px;">↗ ${tt({pl:'Udostępnij',en:'Share',de:'Teilen',es:'Compartir'})}</button>
      <button class="btn btn-sm btn-ghost" onclick='openProgramEditor("${safeId}")' style="flex:1;min-width:0;font-size:12px;padding:8px 12px;">✎ ${tt({pl:'Edytuj',en:'Edit',de:'Bearbeiten',es:'Editar'})}</button>
      <button class="btn btn-sm btn-danger" onclick='deleteProgram("${safeId}")' style="flex:1;min-width:0;font-size:12px;padding:8px 12px;">🗑 ${tt({pl:'Usuń',en:'Delete',de:'Löschen',es:'Eliminar'})}</button>
    </div>`:'';

    const fromCoachBadge=p.fromCoach?`<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:rgba(100,160,255,0.15);color:#6aa0f8;text-transform:uppercase;letter-spacing:0.5px;">👤 ${p.coachName||tt({pl:'Trener',en:'Coach',de:'Trainer',es:'Entrenador'})}</span>`:null;
    const customBadge=(!p.builtin&&!p.fromCoach)?`<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:rgba(126,199,126,0.15);color:#7ec77e;text-transform:uppercase;letter-spacing:0.5px;">${tt({pl:'Własny',en:'Custom',de:'Eigen',es:'Personalizado'})}</span>`:'';

    return `<div class="tpl-card" style="cursor:pointer;" onclick='toggleProgramExpand("${safeId}")'>
      <div class="tpl-card-header">
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
            <div class="tpl-name">${localizedField(p,'name')}</div>
            ${p.builtin?`<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:var(--accent-dim);color:var(--accent);text-transform:uppercase;letter-spacing:0.5px;">${tt({pl:'Wbudowany',en:'Built-in',de:'Eingebaut',es:'Integrado'})}</span>`:p.fromCoach?fromCoachBadge:customBadge}
            <span style="font-size:11px;color:${lvlColor};font-weight:600;">●&nbsp;${lvlLbl}</span>
          </div>
          <div class="tpl-meta">${p.daysPerWeek}× ${tt({pl:'tyg.',en:'/wk',de:'/Wo.',es:'/sem.'})} · ${p.duration} ${tt({pl:'tyg.',en:'wks',de:'Wo.',es:'sem.'})} · ${tpls.length} ${t('exExercises')}</div>
        </div>
        <div style="font-size:22px;color:var(--text3);flex-shrink:0;transform:rotate(${expanded?'90':'0'}deg);transition:transform 0.2s;">›</div>
      </div>
      ${expanded?`<div onclick="event.stopPropagation();" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
        <div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.55;">${localizedField(p,'description')}</div>
        ${exercisesHtml}
        ${coachActions}
      </div>`:''}
    </div>`;
  }).join('');

  el.innerHTML=introHtml+coachHeader+cards;
}

window.toggleProgramExpand=function(pid){
  _expandedProgramId=(_expandedProgramId===pid)?null:pid;
  renderPrograms();
};
window.startProgramWorkout=function(pid,tidx){
  const userPrograms=Array.isArray(S.programs)?S.programs:[];
  const allPrograms=[...BUILTIN_PROGRAMS,...userPrograms];
  const p=allPrograms.find(x=>String(x.id)===String(pid));
  if(!p||!p.templates||!p.templates[tidx])return;
  const tp=p.templates[tidx];
  // Build a transient template object for startWorkout (it accepts template objects directly)
  startWorkout({
    id:null,
    name:tp.name,
    types:tp.types||[],
    restDefault:tp.restDefault||90,
    exercises:tp.exercises.map(e=>({...e})),
  });
};

// ===== TEMPLATES =====
function renderTemplates(){
  const el=document.getElementById('templateList');
  if(!S.templates.length){el.innerHTML=`<div class="empty-state">${t('noTemplates')}</div>`;return;}
  el.innerHTML=S.templates.map(tp=>`<div class="tpl-card"><div class="tpl-card-header"><div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><div class="tpl-name">${tp.name}</div>${typeTagHtml(tp.types||[])}</div><div class="tpl-meta">${tp.exercises.length} ${t('exExercises')} · ${t('exRest')} ${tp.restDefault}s</div></div><div style="display:flex;gap:6px;flex-shrink:0;"><button class="btn btn-sm btn-primary" onclick="startWorkout(${tp.id})">${t('startTemplate')}</button><button class="btn btn-sm btn-ghost" onclick="editTemplate(${tp.id})">${t('editTemplate')}</button></div></div><div class="tpl-exercises">${tp.exercises.map(e=>`<div class="tpl-ex-row">${e.sup?'<span class="super-tag">SS</span>':'<span style="width:20px;display:inline-block;flex-shrink:0;"></span>'}<span class="name">${exName(e)}</span><span>${e.sets}×${e.reps}${e.weight?' · '+dispW(e.weight)+unitW():''}</span></div>`).join('')}</div></div>`).join('');
}

function openNewTemplate(){
  // Free tier: max 3 templates
  if(!isPro()&&S.templates.length>=3){showPaywall('template_limit');return;}
  showTplModal(null);
}
function editTemplate(id){showTplModal(id);}

function showTplModal(id){
  const orig=id?S.templates.find(x=>x.id===id):null;
  const tData={id:orig?orig.id:Date.now(),name:orig?orig.name:'',types:orig?(orig.types||[]):['upper'],restDefault:orig?orig.restDefault:(S.defaultRest||90),exercises:orig?JSON.parse(JSON.stringify(orig.exercises)):[]};
  let curTypes=[...tData.types];
  let exs=[...tData.exercises];
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';

  function renderTplModal(){
    // Preserve scroll position so adding sets doesn't jump to top
    const _modal=ov.querySelector('.modal');
    const _scrollTop=_modal?_modal.scrollTop:0;
    const chips=TYPE_LIST.map(tp=>`<button class="type-chip ${curTypes.includes(tp)?'active':''}" onclick="toggleType('${tp}')">${t(tp)}</button>`).join('');

    function exRow(e,i){
      // setRows: initialise to 1 row if not yet set
      if(!e.setRows){
        e.setRows=[{reps:e.reps||10,weight:e.weight||0}];
      }
      const setArr=e.setRows;
      let setRows='';
      setArr.forEach((s,si)=>{
        setRows+=`<div style="display:grid;grid-template-columns:20px 1fr 1fr;gap:6px;align-items:center;margin-top:6px;">
          <div style="font-size:11px;color:var(--text3);text-align:center;">${si+1}</div>
          <input class="si" type="number" placeholder="${t('reps')}" value="${s.reps}" oninput="updSetVal(${i},${si},'reps',this.value)" style="font-size:13px;padding:7px 4px;"/>
          <input class="si" type="number" placeholder="${unitW()}" value="${dispW(s.weight)}" oninput="updSetVal(${i},${si},'weight',this.value)" style="font-size:13px;padding:7px 4px;"/>
        </div>`;
      });

      const addLabel=lang==='pl'?'Dodaj serię +':'Add set +';
      const rmLabel=lang==='pl'?'Usuń serię −':'Remove set −';

      return`<div style="border:1px solid ${e.sup?'var(--accent-dim2)':'var(--border)'};border-radius:10px;padding:10px 12px;margin-bottom:8px;background:var(--bg3);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="font-size:13px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${exName(e)}</div>
          <button onclick="toggleSup(${i})" style="padding:3px 8px;border-radius:6px;border:1px solid ${e.sup?'var(--accent)':'var(--border2)'};background:${e.sup?'var(--accent-dim)':'var(--bg4)'};color:${e.sup?'var(--accent)':'var(--text2)'};font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;transition:all 0.15s;">SS</button>
          <button onclick="rmEx(${i})" style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0;font-family:inherit;line-height:1;flex-shrink:0;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:20px 1fr 1fr;gap:6px;margin-top:8px;">
          <div></div>
          <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${t('reps')}</div>
          <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${unitW()}</div>
        </div>
        ${setRows}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button onclick="addSetRow(${i})" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border2);background:var(--accent-dim);color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">${addLabel}</button>
          ${setArr.length>1?`<button onclick="rmSetRow(${i})" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(255,92,92,0.25);background:rgba(255,92,92,0.07);color:var(--red);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">${rmLabel}</button>`:''}
        </div>
      </div>`;
    }

    ov.innerHTML=`<div class="modal"><div class="modal-handle"></div>
      <div class="modal-title">${id?t('editTemplate')+': '+tData.name:t('newTemplate')}</div>
      <label class="form-label">${t('templateName')}</label>
      <div style="margin-bottom:12px;"><input type="text" id="tName" value="${tData.name}" placeholder="np. Upper A"/></div>
      <div id="nameError" style="display:none;color:var(--red);font-size:12px;margin:-8px 0 10px;">${lang==='pl'?'Wpisz nazwę szablonu':'Please enter a template name'}</div>
      <label class="form-label">${t('templateType')}</label>
      <div class="type-chips">${chips}</div>
      <label class="form-label">${t('templateRest')}</label>
      <div style="margin-bottom:16px;"><input type="number" id="tRest" value="${tData.restDefault}" style="width:110px"/></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:14px;font-weight:600;">${t('exercises')} (${exs.length})</span>
        <button class="btn btn-sm btn-ghost" onclick="openExPicker()">${t('addExercise')}</button>
      </div>
      <div id="exList">${exs.map((e,i)=>exRow(e,i)).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;">
        <button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button>
        <button class="btn btn-primary" onclick="saveTpl()">${t('saveTemplate')}</button>
      </div>
      ${id?`<button class="btn btn-danger" style="margin-top:8px;" onclick="delTpl(${id})">${t('deleteTemplate')}</button>`:''}
    </div>`;
    // Restore scroll position after re-render
    requestAnimationFrame(()=>{const m=ov.querySelector('.modal');if(m)m.scrollTop=_scrollTop;});
  }

  window.toggleType=tp=>{const i=curTypes.indexOf(tp);if(i>=0)curTypes.splice(i,1);else curTypes.push(tp);renderTplModal();};
  window.rmEx=i=>{exs.splice(i,1);renderTplModal();};
  window.toggleSup=i=>{exs[i].sup=!exs[i].sup;renderTplModal();};
  window.updSetVal=(ei,si,field,val)=>{
    if(!exs[ei].setRows){
      const sets=exs[ei].sets||3;
      exs[ei].setRows=Array.from({length:sets},()=>({reps:exs[ei].reps||10,weight:exs[ei].weight||0}));
    }
    exs[ei].setRows[si][field]=field==='weight'?inputToKg(val):+val;
  };
  window.addSetRow=ei=>{
    if(!exs[ei].setRows){
      exs[ei].setRows=Array.from({length:exs[ei].sets||3},()=>({reps:exs[ei].reps||10,weight:exs[ei].weight||0}));
    }
    const last=exs[ei].setRows[exs[ei].setRows.length-1];
    exs[ei].setRows.push({reps:last.reps,weight:last.weight});
    exs[ei].sets=exs[ei].setRows.length;
    renderTplModal();
  };
  window.rmSetRow=ei=>{
    if(!exs[ei].setRows||exs[ei].setRows.length<=1)return;
    exs[ei].setRows.pop();
    exs[ei].sets=exs[ei].setRows.length;
    renderTplModal();
  };
  window.openExPicker=()=>{
    const nameEl=document.getElementById('tName');
    const restEl=document.getElementById('tRest');
    if(nameEl)tData.name=nameEl.value;
    if(restEl)tData.restDefault=+restEl.value;
    showExPicker(exs,picked=>{
      // initialise setRows to 1 row for newly picked exercises
      picked.forEach(e=>{
        if(!e.setRows) e.setRows=[{reps:e.reps||10,weight:e.weight||0}];
      });
      exs=picked;
      closeModal();
      document.body.appendChild(ov);
      S.modal=ov;
      renderTplModal();
    });
  };
  window.saveTpl=()=>{
    const name=document.getElementById('tName').value.trim();
    if(!name){
      const errEl=document.getElementById('nameError');
      if(errEl){errEl.style.display='block';document.getElementById('tName').focus();}
      return;
    }
    const rest=+document.getElementById('tRest').value;
    // Persist setRows back into sets/reps/weight
    const finalExs=exs.map(e=>{
      if(e.setRows&&e.setRows.length){
        return{...e,sets:e.setRows.length,reps:e.setRows[0].reps,weight:e.setRows[0].weight};
      }
      return e;
    });
    const newT={id:tData.id,name,types:curTypes,restDefault:rest,exercises:finalExs};
    if(id){const i=S.templates.findIndex(x=>x.id===id);S.templates[i]=newT;}else S.templates.push(newT);
    closeModal();renderTemplates();saveAll();
  };
  window.delTpl=tid=>{S.templates=S.templates.filter(x=>x.id!==tid);closeModal();renderTemplates();saveAll();};
  renderTplModal();
  document.body.appendChild(ov);S.modal=ov;
  S._tplRender=renderTplModal;
}

// ===== PLAN YOUR WEEK =====

let _calTab='calendar';
function switchCalTab(tab){
  _calTab=tab;
  document.getElementById('calTabCalContent').style.display=tab==='calendar'?'':'none';
  document.getElementById('calTabPlanContent').style.display=tab==='plan'?'':'none';
  const btnCal=document.getElementById('calTabCal');
  const btnPlan=document.getElementById('calTabPlan');
  if(btnCal){btnCal.style.color=tab==='calendar'?'var(--accent)':'var(--text3)';btnCal.style.borderBottom=tab==='calendar'?'2px solid var(--accent)':'2px solid transparent';}
  if(btnPlan){btnPlan.style.color=tab==='plan'?'var(--accent)':'var(--text3)';btnPlan.style.borderBottom=tab==='plan'?'2px solid var(--accent)':'2px solid transparent';}
  if(tab==='plan')renderWeekPlan();
}

let _planningProgram=null;
let _selectedPlanDate=null;
let _planEditMode=false; // true = show add panel even if day has plan

function getWeekDates(offsetWeeks=0){
  const now=new Date();
  const day=now.getDay();
  const diffToMon=day===0?-6:1-day;
  const mon=new Date(now);
  mon.setDate(now.getDate()+diffToMon+offsetWeeks*7);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(mon);d.setDate(mon.getDate()+i);
    return d.toISOString().slice(0,10);
  });
}

let _planWeekOffset=0;

function renderWeekPlan(){
  const el=document.getElementById('weekPlanContent');
  if(!el)return;
  const dates=getWeekDates(_planWeekOffset);
  const dayNames=T[lang]?.days||T.en.days;
  const today_=today();
  const weekLabel=`${dates[0].slice(8)} — ${dates[6].slice(8)}.${dates[6].slice(5,7)}.${dates[6].slice(0,4)}`;

  // ── Banner: program assignment mode ──
  let html='';
  if(_planningProgram){
    const dn=_planningProgram.days[_planningProgram.currentDayIdx];
    const nm=dn?(typeof dn.name==='object'?(dn.name[lang]||dn.name.en||dn.name.pl||''):dn.name||''):'';
    html+=`<div style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
      <div style="font-size:20px;">📅</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;color:var(--accent);">${tt({pl:'Kliknij dzień dla treningu',en:'Click a day for workout',de:'Tag für Training klicken',es:'Haz clic en un día'})} ${_planningProgram.currentDayIdx+1}/${_planningProgram.days.length}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px;">${nm}</div>
      </div>
      <button data-wp="cancel-prog" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0;">✕</button>
    </div>`;
  }

  // ── Week navigation ──
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
    <button data-wp="prev" style="background:none;border:none;cursor:pointer;color:var(--text2);padding:6px;font-size:20px;">◀</button>
    <div style="font-size:13px;font-weight:600;">${weekLabel}</div>
    <button data-wp="next" style="background:none;border:none;cursor:pointer;color:var(--text2);padding:6px;font-size:20px;">▶</button>
  </div>`;

  // ── Day cards ──
  const dayCardsHtml=dates.map((date,i)=>{
    const plan=S.weekPlan?.[date];
    const isToday=date===today_;
    const isPast=date<today_;
    const isSelected=date===_selectedPlanDate;
    let content='';
    if(plan?.type==='custom'){
      content=`<div style="background:rgba(100,200,255,0.12);border-radius:8px;padding:4px 6px;font-size:11px;font-weight:600;color:#64c8ff;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${plan.name}</div>`;
    }else if(plan?.type==='template'){
      content=`<div style="background:var(--accent-dim);border-radius:8px;padding:4px 6px;font-size:11px;font-weight:600;color:var(--accent);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${plan.name}</div>`;
    }else{
      content=`<div style="font-size:11px;color:var(--text3);margin-top:4px;">Rest</div>`;
    }
    const border=isSelected?'border:2px solid var(--accent);':_planningProgram?'border:2px dashed var(--accent);':'border:1px solid var(--border);';
    const bg=isSelected?'var(--accent-dim2)':isToday?'var(--accent-dim)':'var(--bg2)';
    return`<div data-wp="day" data-date="${date}" style="${border}border-radius:12px;padding:10px 8px;background:${bg};${isPast?'opacity:0.65;':''}text-align:center;min-height:80px;cursor:pointer;transition:all 0.12s;user-select:none;">
      <div style="font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase;">${dayNames[i]}</div>
      <div style="font-size:18px;font-weight:700;${isToday||isSelected?'color:var(--accent)':''}">${date.slice(8)}</div>
      ${content}
    </div>`;
  }).join('');
  html+=`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:14px;">${dayCardsHtml}</div>`;

  // ── Action / info panel ──
  if(_selectedPlanDate&&!_planningProgram){
    const [y,m,d]=_selectedPlanDate.split('-');
    const plan=S.weekPlan?.[_selectedPlanDate];
    const sd=_selectedPlanDate;
    html+=`<div style="background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:14px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:700;color:var(--accent);">📅 ${d}.${m}.${y}</span>
        <button data-wp="deselect" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:2px 6px;line-height:1;">✕</button>
      </div>`;

    if(plan&&!_planEditMode){
      // ── Info view: day already has a workout ──
      const icon=plan.type==='template'?'📋':'✏️';
      const typeLbl=plan.type==='template'
        ?tt({pl:'Szablon',en:'Template',de:'Vorlage',es:'Plantilla'})
        :tt({pl:'Własny',en:'Custom',de:'Eigenes',es:'Personalizado'});
      const exRows=plan.exercises?.length
        ?plan.exercises.map(e=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text2);">• ${e.name||'?'}</span>
            <span style="color:var(--text3);flex-shrink:0;">${e.sets||3}×${e.reps||10}</span>
          </div>`).join(''):'';
      html+=`<div data-wp="view-detail" data-date="${sd}" style="cursor:pointer;margin-bottom:12px;" title="${tt({pl:'Kliknij by zobaczyć szczegóły',en:'Click to see details',de:'Klicken für Details',es:'Toca para ver detalles'})}">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">${icon}</span>
            <div>
              <div style="font-size:15px;font-weight:700;">${plan.name}</div>
              <div style="font-size:11px;color:var(--text3);">${typeLbl}${plan.exercises?.length?' · '+plan.exercises.length+' '+tt({pl:'ćwiczeń',en:'exercises',de:'Übungen',es:'ejercicios'}):''}</div>
            </div>
            <span style="margin-left:auto;color:var(--text3);font-size:16px;">›</span>
          </div>
          ${exRows?`<div style="margin-top:8px;max-height:120px;overflow-y:auto;">${exRows}</div>`:''}
        </div>
        <div style="display:flex;gap:8px;">
          <button data-wp="change-plan" class="btn btn-ghost" style="flex:1;font-size:13px;">🔄 ${tt({pl:'Zmień',en:'Change',de:'Ändern',es:'Cambiar'})}</button>
          <button data-wp="remove" data-date="${sd}" class="btn btn-danger" style="flex:1;font-size:13px;">🗑 ${tt({pl:'Usuń',en:'Remove',de:'Entfernen',es:'Eliminar'})}</button>
        </div>`;
    }else{
      // ── Add / edit view ──
      const tplBtns=S.templates.length
        ?S.templates.map(tp=>`<button data-wp="assign-tpl" data-date="${sd}" data-tpl-id="${tp.id}" class="btn btn-ghost" style="text-align:left;font-size:13px;">💪 ${tp.name||'?'}</button>`).join('')
        :`<div style="font-size:13px;color:var(--text3);text-align:center;padding:8px;">${tt({pl:'Brak szablonów',en:'No templates',de:'Keine Vorlagen',es:'Sin plantillas'})}</div>`;
      const progBtn=S.programs?.length?`<button data-wp="program" class="btn btn-ghost" style="text-align:left;font-size:13px;">📅 ${tt({pl:'Z programu',en:'From program',de:'Aus Programm',es:'De programa'})}</button>`:'';
      const backBtn=plan?`<button data-wp="cancel-edit" class="btn btn-ghost" style="font-size:13px;color:var(--text3);">← ${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>`:'';
      html+=`<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${tt({pl:'Dodaj / Zmień trening',en:'Add / Change workout',de:'Training hinzufügen',es:'Añadir / cambiar'})}</div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <button data-wp="custom" data-date="${sd}" class="btn btn-ghost" style="text-align:left;font-size:13px;">✏️ ${tt({pl:'Własny (z ćwiczeniami)',en:'Custom workout',de:'Eigenes Training',es:'Entrenamiento personalizado'})}</button>
          ${tplBtns}
          ${progBtn}
          ${backBtn}
        </div>`;
    }
    html+=`</div>`;
  }

  // ── Clear week — bottom ──
  html+=`<div style="margin-top:12px;"><button data-wp="clear" class="btn btn-ghost" style="font-size:13px;width:100%;">🗑 ${tt({pl:'Wyczyść tydzień',en:'Clear week',de:'Woche leeren',es:'Limpiar semana'})}</button></div>`;

  el.innerHTML=html;

  // ── Attach event listeners (no inline onclick → closures work correctly) ──
  el.querySelectorAll('[data-wp]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const wp=btn.dataset.wp;
      const date=btn.dataset.date||_selectedPlanDate;
      const tplId=btn.dataset.tplId?+btn.dataset.tplId:null;
      switch(wp){
        case 'prev':_planWeekOffset--;renderWeekPlan();break;
        case 'next':_planWeekOffset++;renderWeekPlan();break;
        case 'cancel-prog':_planningProgram=null;renderWeekPlan();break;
        case 'day':planDayClick(btn.dataset.date);break;
        case 'deselect':_selectedPlanDate=null;_planEditMode=false;renderWeekPlan();break;
        case 'cancel-edit':_planEditMode=false;renderWeekPlan();break;
        case 'change-plan':_planEditMode=true;renderWeekPlan();break;
        case 'assign-tpl':{
          const tp=S.templates.find(t=>+t.id===tplId);
          if(!tp)return;
          if(!S.weekPlan)S.weekPlan={};
          S.weekPlan[date]={type:'template',templateId:tp.id,name:tp.name};
          saveAll();_selectedPlanDate=null;_planEditMode=false;renderWeekPlan();break;
        }
        case 'custom':planAddCustom(btn.dataset.date||_selectedPlanDate);break;
        case 'program':planPickProgram();break;
        case 'remove':{
          if(S.weekPlan)delete S.weekPlan[date];
          saveAll();_selectedPlanDate=null;_planEditMode=false;renderWeekPlan();break;
        }
        case 'view-detail':showPlanDetailModal(btn.dataset.date);break;
        case 'clear':clearWeekPlan();break;
      }
    });
  });
}

function showPlanDetailModal(date){
  const plan=S.weekPlan?.[date];
  if(!plan)return;
  closeModal();
  const [y,m,d]=date.split('-');
  let bodyHtml='';
  if(plan.type==='template'){
    const tp=S.templates.find(t=>+t.id===plan.templateId);
    bodyHtml=tp
      ?tp.exercises.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:14px;">${exName(e)}</span>
          <span style="font-size:12px;color:var(--text3);">${e.sets||3} × ${e.reps||10}</span>
        </div>`).join('')
      :`<div style="color:var(--text3);font-size:13px;">${tt({pl:'Szablon usunięty',en:'Template deleted',de:'Vorlage gelöscht',es:'Plantilla eliminada'})}</div>`;
  }else if(plan.type==='custom'&&plan.exercises?.length){
    bodyHtml=plan.exercises.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:14px;">${e.name||'?'}</span>
        <span style="font-size:12px;color:var(--text3);">${e.sets||3} × ${e.reps||10}</span>
      </div>`).join('');
  }
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
      <div>
        <div style="font-size:19px;font-weight:700;">${plan.type==='template'?'📋':'✏️'} ${plan.name}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px;">📅 ${d}.${m}.${y}</div>
      </div>
      <button onclick="closeModal()" style="background:none;border:none;color:var(--text3);font-size:24px;cursor:pointer;padding:0 4px;line-height:1;">×</button>
    </div>
    <div style="max-height:62vh;overflow-y:auto;margin-top:10px;">${bodyHtml||`<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px;">${tt({pl:'Brak ćwiczeń',en:'No exercises',de:'Keine Übungen',es:'Sin ejercicios'})}</div>`}</div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.showPlanDetailModal=showPlanDetailModal;

function planDayClick(date){
  if(_planningProgram){
    const day=_planningProgram.days[_planningProgram.currentDayIdx];
    if(!S.weekPlan)S.weekPlan={};
    const name=typeof day.name==='object'?(day.name[lang]||day.name.en||day.name.pl||''):day.name||'';
    S.weekPlan[date]={type:'template',templateId:day.id,name};
    saveAll();
    _planningProgram.currentDayIdx++;
    if(_planningProgram.currentDayIdx>=_planningProgram.days.length){
      _planningProgram=null;
      showSyncToast(tt({pl:'Program przypisany ✓',en:'Program assigned ✓',de:'Programm zugewiesen ✓',es:'Programa asignado ✓'}),'success');
    }
    renderWeekPlan();
    return;
  }
  if(_selectedPlanDate===date){_selectedPlanDate=null;_planEditMode=false;}
  else{_selectedPlanDate=date;_planEditMode=false;}
  renderWeekPlan();
}

function planAddCustom(date){
  let _cExs=[];
  // Sync sets/reps inputs → _cExs before any re-render
  function syncInputs(){
    _cExs.forEach((e,i)=>{
      const s=document.getElementById(`planCS_${i}`);
      const r=document.getElementById(`planCR_${i}`);
      if(s)e.sets=Math.max(1,+s.value||1);
      if(r)e.reps=Math.max(1,+r.value||1);
    });
  }
  function openCustomModal(savedName){
    if(S.modal){S.modal.remove();S.modal=null;}
    const ov=document.createElement('div');ov.className='modal-overlay';
    const hasExs=_cExs.length>0;
    const exsHtml=hasExs
      ?`<div style="display:grid;grid-template-columns:1fr 44px 8px 44px 28px;gap:4px;align-items:center;padding:4px 0 6px;border-bottom:1px solid var(--border2);">
          <div style="font-size:11px;color:var(--text3);font-weight:700;">${tt({pl:'Ćwiczenie',en:'Exercise',de:'Übung',es:'Ejercicio'})}</div>
          <div style="font-size:11px;color:var(--text3);font-weight:700;text-align:center;">${tt({pl:'Serie',en:'Sets',de:'Sätze',es:'Series'})}</div>
          <div></div>
          <div style="font-size:11px;color:var(--text3);font-weight:700;text-align:center;">${tt({pl:'Powt.',en:'Reps',de:'Wdh.',es:'Reps'})}</div>
          <div></div>
        </div>`+
        _cExs.map((e,i)=>`<div style="display:grid;grid-template-columns:1fr 44px 8px 44px 28px;gap:4px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);">
          <div style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.name||'?'}</div>
          <input id="planCS_${i}" type="number" min="1" max="20" value="${e.sets||3}" style="padding:5px 4px;text-align:center;border-radius:7px;font-size:13px;"/>
          <div style="text-align:center;color:var(--text3);font-size:13px;">×</div>
          <input id="planCR_${i}" type="number" min="1" max="100" value="${e.reps||10}" style="padding:5px 4px;text-align:center;border-radius:7px;font-size:13px;"/>
          <button onclick="window._planCRemoveEx(${i})" style="background:none;border:none;color:var(--red);font-size:18px;cursor:pointer;line-height:1;padding:0;">×</button>
        </div>`).join('')
      :`<div style="font-size:12px;color:var(--text3);padding:10px 0;text-align:center;">${tt({pl:'Brak ćwiczeń (opcjonalnie)',en:'No exercises yet (optional)',de:'Keine Übungen (optional)',es:'Sin ejercicios (opcional)'})}</div>`;
    ov.innerHTML=`<div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title" style="margin-bottom:14px;">✏️ ${tt({pl:'Własny trening',en:'Custom workout',de:'Eigenes Training',es:'Entrenamiento personalizado'})}</div>
      <input type="text" id="planCName" value="${(savedName||'').replace(/"/g,'&quot;')}" placeholder="${tt({pl:'Np. Cardio, Bieganie...',en:'E.g. Cardio, Running...',de:'Z.B. Cardio, Laufen...',es:'Ej. Cardio, Carrera...'})}" style="margin-bottom:12px;"/>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="font-size:13px;font-weight:600;">${tt({pl:'Ćwiczenia',en:'Exercises',de:'Übungen',es:'Ejercicios'})} <span style="color:var(--text3);">(${_cExs.length})</span></div>
        <button class="btn-new" style="font-size:12px;padding:6px 11px;" onclick="window._planCPickEx()">+ ${tt({pl:'Dodaj',en:'Add',de:'Hinzufügen',es:'Añadir'})}</button>
      </div>
      <div style="max-height:38vh;overflow-y:auto;margin-bottom:14px;">${exsHtml}</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:1;" onclick="window._planCSave('${date}')">${tt({pl:'Zapisz',en:'Save',de:'Speichern',es:'Guardar'})}</button>
        <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
      </div>
    </div>`;
    document.body.appendChild(ov);S.modal=ov;
    setTimeout(()=>{if(!savedName)document.getElementById('planCName')?.focus();},60);
  }
  window._planCPickEx=()=>{
    syncInputs();
    const nm=document.getElementById('planCName')?.value||'';
    if(S.modal){S.modal.remove();S.modal=null;}
    showExPicker(_cExs,picked=>{
      // Merge: keep sets/reps for existing, add defaults for new
      const existing=new Map(_cExs.map(e=>[e.id,e]));
      _cExs=picked.map(e=>({id:e.id,name:exName(e),pl:e.pl,en:e.en,gk:e.gk,sets:existing.get(e.id)?.sets||3,reps:existing.get(e.id)?.reps||10}));
      openCustomModal(nm);
    });
  };
  window._planCRemoveEx=idx=>{
    syncInputs();
    const nm=document.getElementById('planCName')?.value||'';
    _cExs.splice(idx,1);
    openCustomModal(nm);
  };
  window._planCSave=d=>{
    syncInputs();
    const n=(document.getElementById('planCName')?.value||'').trim();
    if(!n){document.getElementById('planCName')?.focus();return;}
    if(!S.weekPlan)S.weekPlan={};
    S.weekPlan[d]={type:'custom',name:n,exercises:_cExs.map(e=>({id:e.id,name:e.name,pl:e.pl,en:e.en,gk:e.gk,sets:e.sets||3,reps:e.reps||10}))};
    saveAll();_selectedPlanDate=null;closeModal();renderWeekPlan();
  };
  openCustomModal('');
}
window.planAddCustom=planAddCustom;

function planPickProgram(){
  closeModal();
  if(!S.programs||!S.programs.length)return;
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title" style="margin-bottom:16px;">📅 ${tt({pl:'Wybierz program',en:'Select Program',de:'Programm wählen',es:'Seleccionar programa'})}</div>
    <div style="display:flex;flex-direction:column;gap:8px;max-height:55vh;overflow-y:auto;margin-bottom:12px;">
      ${S.programs.map(p=>`<button class="btn btn-ghost" style="text-align:left;" onclick="selectPlanProgram(${p.id});closeModal();">📋 ${localizedField(p,'name')||p.name?.en||p.name?.pl||p.name||'?'}</button>`).join('')}
    </div>
    <button class="btn btn-ghost" onclick="closeModal();">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.planPickProgram=planPickProgram;

function assignPlanDay(date,type,templateId,name){
  if(!S.weekPlan)S.weekPlan={};
  S.weekPlan[date]={type,templateId,name};
  saveAll();
  renderWeekPlan();
}

function removePlanDay(date){
  if(S.weekPlan)delete S.weekPlan[date];
  saveAll();
  renderWeekPlan();
}

function clearWeekPlan(){
  const dates=getWeekDates(_planWeekOffset);
  if(!S.weekPlan)return;
  dates.forEach(d=>delete S.weekPlan[d]);
  saveAll();
  renderWeekPlan();
}

window.selectPlanProgram=function(programId){
  const prog=S.programs.find(p=>p.id===programId);
  if(!prog||!prog.templates||!prog.templates.length){
    showSyncToast(tt({pl:'Program nie ma treningów',en:'Program has no workouts',de:'Programm hat keine Trainings',es:'El programa no tiene entrenamientos'}),'error');
    return;
  }
  _planningProgram={
    days:prog.templates.map(t=>({id:t.id,name:t.name||tt({pl:'Trening',en:'Workout',de:'Training',es:'Entrenamiento'})})),
    currentDayIdx:0
  };
  _selectedPlanDate=null;
  renderWeekPlan();
};
window.assignPlanDay=assignPlanDay;
window.removePlanDay=removePlanDay;
window.clearWeekPlan=clearWeekPlan;
window.planDayClick=planDayClick;
window.renderWeekPlan=renderWeekPlan;
// Window helpers for inline onclick (let variables not accessible from inline handlers)
window.planDeselect=()=>{_selectedPlanDate=null;renderWeekPlan();};
window.planCancelProgram=()=>{_planningProgram=null;renderWeekPlan();};
window.planAssignTpl=(date,id)=>{
  const tp=S.templates.find(t=>+t.id===+id);
  if(!tp)return;
  _selectedPlanDate=null;
  if(!S.weekPlan)S.weekPlan={};
  S.weekPlan[date]={type:'template',templateId:tp.id,name:tp.name};
  saveAll();renderWeekPlan();
};
window.planRemoveDay=date=>{if(S.weekPlan)delete S.weekPlan[date];saveAll();_selectedPlanDate=null;renderWeekPlan();};
window.switchCalTab=switchCalTab;

// ===== SETTINGS =====
function renderSettings(){
  const el=document.getElementById('settingsContent');
  if(!el)return;

  const measCount=Object.keys(S.measurements).length;
  const measLastDate=measCount>0?Object.keys(S.measurements).sort().reverse()[0]:null;
  const measValue=measCount>0
    ?`${measCount} ${tt({pl:'pomiarów',en:'entries',de:'Einträge',es:'entradas'})}${measLastDate?' · '+measLastDate:''}`
    :tt({pl:'Brak pomiarów',en:'No measurements',de:'Keine Messungen',es:'Sin medidas'});

  const settingsRows=[
    {
      key:'account',
      label:tt({pl:'Konto',en:'Account',de:'Konto',es:'Cuenta'}),
      value:S.user
        ?S.user.email
        :tt({pl:'Niezalogowany — kliknij',en:'Signed out — tap to sign in',de:'Abgemeldet — zum Anmelden tippen',es:'Sin sesión — toca para iniciar'}),
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      action:S.user?'showAccountModal':'showAuthModal'
    },
    {
      key:'name',
      label:lang==='pl'?'Imię':'Name',
      value:localStorage.getItem('bs-username')||'—',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
      action:'openSettingsName'
    },
    {
      key:'measurements',
      label:tt({pl:'Pomiary ciała',en:'Body measurements',de:'Körpermaße',es:'Medidas corporales'}),
      value:measValue,
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M7 8v2M10 8v3M13 8v2M17 8v3"/></svg>',
      action:'openSettingsMeasurements'
    },
    {
      key:'restTimer',
      label:tt({pl:'Czas przerwy',en:'Rest timer',de:'Pausenzeit',es:'Tiempo de descanso'}),
      value:`${S.defaultRest||90} s — ${tt({pl:'Quick / nowe szablony',en:'Quick / new templates',de:'Quick / neue Vorlagen',es:'Rápido / nuevas plantillas'})}`,
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      action:'openSettingsRestTimer'
    },
    {
      key:'units',
      label:tt({pl:'Jednostki',en:'Units',de:'Einheiten',es:'Unidades'}),
      value:S.units==='imperial'?'Imperial (lbs / in)':'Metric (kg / cm)',
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 3h18M3 9h18M3 15h18M3 21h18M9 3v18M15 3v18"/></svg>',
      action:'openSettingsUnits'
    },
    {
      key:'language',
      label:t('language'),
      value:({en:'🇬🇧 '+t('langEnglish'),pl:'🇵🇱 '+t('langPolish'),de:'🇩🇪 '+t('langGerman'),es:'🇪🇸 '+t('langSpanish')}[lang]||('🇬🇧 '+t('langEnglish'))),
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M3 12h18"/><path d="M3.6 8h16.8M3.6 16h16.8"/></svg>',
      action:'openSettingsLanguage'
    },
    {
      key:'theme',
      label:t('themeColor'),
      value:isDark?'🌑 '+t('darkTheme'):'☀️ '+t('lightTheme'),
      icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
      action:'openSettingsTheme'
    },
  ];

  const proCard=proCardHtml();
  const rowsHtml=`<div style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);margin-bottom:8px;">
    ${settingsRows.map((row,i)=>{
      const isUnits=row.key==='units';
      const isTheme=row.key==='theme';
      if(isUnits){
        const isOn=S.units==='imperial';
        return`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg2);transition:background 0.12s;${i>0?'border-top:1px solid var(--border);':''}">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">${row.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${row.label}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px;">${isOn?'Imperial':'Metric'}</div>
          </div>
          <div class="toggle-switch ${isOn?'on':''}" onclick="event.stopPropagation();toggleUnitsInline()"><div class="toggle-knob"></div></div>
        </div>`;
      }
      if(isTheme){
        const isOn=!isDark;
        return`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg2);transition:background 0.12s;${i>0?'border-top:1px solid var(--border);':''}">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">${row.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${row.label}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px;">${isDark?t('darkTheme'):t('lightTheme')}</div>
          </div>
          <div class="toggle-switch ${isOn?'on':''}" onclick="event.stopPropagation();toggleThemeInline()"><div class="toggle-knob"></div></div>
        </div>`;
      }
      return`<div onclick="${row.action}()" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg2);cursor:pointer;transition:background 0.12s;${i>0?'border-top:1px solid var(--border);':''}"
        onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='var(--bg2)'"
        ontouchstart="this.style.background='var(--bg3)'" ontouchend="this.style.background='var(--bg2)'">
        <div style="width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">${row.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;">${row.label}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${row.value}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--text3);flex-shrink:0;"><polyline points="9 18 15 12 9 6"/></svg>
      </div>`;
    }).join('')}
  </div>`;

  const adminChangelog=isAdmin()?adminChangelogHtml():'';
  const versionLbl=`<div style="margin:24px 0 40px;padding:12px;text-align:center;font-size:11px;color:var(--text3);">BeeStrong Gym Tracker · v1.0</div>`;

  el.innerHTML=proCard+rowsHtml+adminChangelog+versionLbl;
}

function renderNotifications(){
  const el=document.getElementById('notificationsContent');
  if(!el)return;
  const items=[];
  const chatItems=ld('bs-notifications-v1',[]);
  chatItems.forEach(n=>items.push({
    id:n.id||'',
    type:n.type||'',
    title:n.title||tt({pl:'Nowa wiadomość',en:'New message',de:'Neue Nachricht',es:'Nuevo mensaje'}),
    body:n.body||'',
    at:n.at,
    action:n.action||'',
  }));
  if(S.pendingInvites&&S.pendingInvites.length){
    S.pendingInvites.forEach(inv=>items.push({
      title:tt({pl:'Zaproszenie od trenera',en:'Coach invitation',de:'Trainer-Einladung',es:'Invitación del entrenador'}),
      body:`${inv.coach_name||inv.coach_email||'Coach'} ${tt({pl:'chce mieć wgląd w Twoje treningi.',en:'wants to follow your progress.',de:'möchte deinen Fortschritt verfolgen.',es:'quiere seguir tu progreso.'})}`,
      at:inv.created_at,
      action:"showScreen('dashboard')",
    }));
  }
  const updates=ld('bs-admin-changelog-v1',[]).slice(0,5);
  if(isAdmin()){
    updates.forEach(u=>items.push({
      title:u.message||'Auto update',
      body:tt({pl:'Wpis z changeloga admina.',en:'Admin changelog entry.',de:'Admin-Changelog-Eintrag.',es:'Entrada del changelog admin.'}),
      at:u.at,
      action:"showScreen('settings')",
    }));
  }
  if(!items.length){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Brak powiadomień.',en:'No notifications.',de:'Keine Benachrichtigungen.',es:'Sin notificaciones.'})}</div>`;
    markLocalNotificationsRead(chatItems);
    return;
  }
  const fmt=iso=>{try{return iso?new Date(iso).toLocaleString():'';}catch(e){return '';}};
  el.innerHTML=items.map(item=>`<div class="client-card" onclick="${item.action||''}">
    <div style="width:38px;height:38px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" width="18" height="18"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    </div>
    <div class="client-card-info">
      <div class="client-card-name">${chatEsc(item.title)}</div>
      <div class="client-card-meta">${chatEsc(item.body)}</div>
      ${item.at?`<div class="client-card-meta" style="margin-top:3px;color:var(--text3);">${fmt(item.at)}</div>`:''}
    </div>
  </div>`).join('');
  markLocalNotificationsRead(chatItems);
}

function addAdminChangelogEntry(type,message){
  const entries=ld('bs-admin-changelog-v1',[]);
  entries.unshift({type,message,at:new Date().toISOString()});
  sv('bs-admin-changelog-v1',entries.slice(0,30));
  updateNotificationBadge();
}

function addAppNotification(entry){
  const entries=ld('bs-notifications-v1',[]);
  const id=entry.id||`n_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  entries.unshift({...entry,id,read:entry.read===true,at:entry.at||new Date().toISOString()});
  sv('bs-notifications-v1',entries.slice(0,50));
  if(document.getElementById('screen-notifications')?.classList.contains('active'))renderNotifications();
  updateNotificationBadge();
}

function markLocalNotificationsRead(items){
  if(!items?.length){
    updateNotificationBadge();
    return;
  }
  if(items.some(n=>!n.read)){
    sv('bs-notifications-v1',items.map(n=>({...n,read:true})));
  }
  updateNotificationBadge();
}

function getUnreadNotificationCount(){
  const local=ld('bs-notifications-v1',[]).filter(n=>!n.read).length;
  const pending=(S.pendingInvites||[]).length;
  return local+pending;
}

function updateNotificationBadge(){
  const btn=document.getElementById('mobileNotificationsBtn');
  if(!btn)return;
  btn.classList.toggle('has-notifications',getUnreadNotificationCount()>0);
}

function adminChangelogHtml(){
  const entries=ld('bs-admin-changelog-v1',[]);
  const fmt=iso=>{
    try{return iso?new Date(iso).toLocaleString():'';}catch(e){return iso||'';}
  };
  const last=entries[0]?.at?fmt(entries[0].at):tt({pl:'Brak',en:'None',de:'Keine',es:'Ninguna'});
  const rows=entries.length?entries.map(e=>`
    <div style="padding:12px 14px;border-top:1px solid var(--border);background:var(--bg2);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="font-size:13px;font-weight:700;">${e.message||e.type||'Update'}</div>
        <div style="font-size:11px;color:var(--text3);white-space:nowrap;">${fmt(e.at)}</div>
      </div>
    </div>`).join(''):`<div style="padding:14px;background:var(--bg2);border-top:1px solid var(--border);font-size:12px;color:var(--text3);">${tt({pl:'Brak zapisanych updateów.',en:'No updates recorded yet.',de:'Noch keine Updates gespeichert.',es:'Aún no hay actualizaciones registradas.'})}</div>`;
  return `<div style="margin-top:16px;margin-bottom:8px;">
    <div style="font-size:13px;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin:0 0 8px 2px;">Admin changelog</div>
    <div style="border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;">
      <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg2);">
        <div style="width:34px;height:34px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 3v5h5"/><path d="M21 21v-5h-5"/><path d="M21 8a9 9 0 0 0-15-4.7L3 8"/><path d="M3 16a9 9 0 0 0 15 4.7L21 16"/></svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:700;">Auto updates</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;">${tt({pl:'Ostatni update',en:'Last update',de:'Letztes Update',es:'Última actualización'})}: ${last}</div>
        </div>
      </div>
      ${rows}
    </div>
  </div>`;
}

function toggleUnitsInline(){
  S.units=S.units==='imperial'?'metric':'imperial';
  localStorage.setItem('bs-units-v1',S.units);
  renderSettings();
  renderWorkout();
}
function toggleThemeInline(){
  isDark=!isDark;
  localStorage.setItem('bs-theme',isDark?'dark':'light');
  document.body.classList.toggle('light',!isDark);
  renderSettings();
}

function openSettingsName(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const cur=localStorage.getItem('bs-username')||'';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${lang==='pl'?'Twoje imię':'Your Name'}</div>
    <div style="margin-bottom:16px;">
      <input type="text" id="nameEditInput" value="${cur}" placeholder="${lang==='pl'?'Twoje imię':'Your name'}" style="font-size:16px;"/>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button>
      <button class="btn btn-primary" onclick="window.saveNameEdit()">${t('saveTemplate')}</button>
    </div>
  </div>`;
  window.saveNameEdit=()=>{
    const name=(document.getElementById('nameEditInput')?.value||'').trim();
    if(!name)return;
    localStorage.setItem('bs-username',name);
    const unEl=document.getElementById('sidebarUserName');
    if(unEl)unEl.textContent=name;
    if(S.user)upsertProfile();
    closeModal();renderSettings();
  };
  document.body.appendChild(ov);S.modal=ov;
  setTimeout(()=>document.getElementById('nameEditInput')?.focus(),100);
}

function openSettingsLanguage(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const options=[
    {code:'en',abbr:'ENG',label:'English'},
    {code:'pl',abbr:'PL',label:'Polski'},
    {code:'de',abbr:'DE',label:'Deutsch'},
    {code:'es',abbr:'ES',label:'Español'},
  ];
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${t('language')}</div>
    ${options.map(o=>`
      <div onclick="setLang('${o.code}');closeModal();renderSettings();" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;background:${lang===o.code?'var(--accent-dim)':'none'};border:1px solid ${lang===o.code?'var(--accent)':'var(--border)'};margin-bottom:8px;transition:all 0.12s;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:28px;border-radius:6px;background:var(--bg3);border:1px solid var(--border2);font-size:11px;font-weight:700;letter-spacing:0.5px;color:var(--text);flex-shrink:0;">${o.abbr}</span>
        <span style="font-size:15px;font-weight:${lang===o.code?'700':'500'};color:${lang===o.code?'var(--accent)':'var(--text)'};">${o.label}</span>
        ${lang===o.code?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" width="18" height="18" style="margin-left:auto;"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>`).join('')}
    <button class="btn btn-ghost" style="margin-top:8px;" onclick="closeModal()">${lang==='pl'?'Anuluj':'Cancel'}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}

function openSettingsTheme(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const options=[
    {val:true,emoji:'🌑',labelKey:'darkTheme'},
    {val:false,emoji:'☀️',labelKey:'lightTheme'},
  ];
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${t('themeColor')}</div>
    ${options.map(o=>`
      <div onclick="setTheme(${o.val});closeModal();renderSettings();" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;background:${isDark===o.val?'var(--accent-dim)':'none'};border:1px solid ${isDark===o.val?'var(--accent)':'var(--border)'};margin-bottom:8px;transition:all 0.12s;">
        <span style="font-size:24px;line-height:1;">${o.emoji}</span>
        <span style="font-size:15px;font-weight:${isDark===o.val?'700':'500'};color:${isDark===o.val?'var(--accent)':'var(--text)'};">${t(o.labelKey)}</span>
        ${isDark===o.val?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" width="18" height="18" style="margin-left:auto;"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>`).join('')}
    <button class="btn btn-ghost" style="margin-top:8px;" onclick="closeModal()">${t('cancelTemplate')}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}

function setTheme(dark){
  isDark=dark;
  localStorage.setItem('bs-theme',dark?'dark':'light');
  applyTheme();
}

function openSettingsRestTimer(){
  closeModal();
  const title=tt({pl:'Domyślny czas przerwy',en:'Default rest timer',de:'Standard-Pausenzeit',es:'Tiempo de descanso predeterminado'});
  const desc=tt({
    pl:'Wartość, której appka użyje jako default dla nowych szablonów oraz Szybkich i Custom treningów. Istniejące szablony zostają nieruszone. Możesz zmieniać czas dla pojedynczej serii w trakcie treningu.',
    en:"Value the app uses as default for new templates and Quick / Custom workouts. Existing templates stay untouched. You can still change the time per set during a workout.",
    de:'Standardwert für neue Vorlagen sowie Quick- und Custom-Trainings. Bestehende Vorlagen bleiben unverändert. Pro Satz lässt sich die Zeit weiterhin manuell anpassen.',
    es:'Valor predeterminado para nuevas plantillas y entrenamientos Rápido / Personalizado. Las plantillas existentes no se tocan. Puedes cambiar el tiempo por serie durante el entrenamiento.'
  });
  const ov=document.createElement('div');ov.className='modal-overlay';
  const presets=[60,75,90,105,120,150,180];
  const buildButtons=cur=>presets.map(s=>`<button class="btn btn-sm ${cur===s?'btn-primary':'btn-ghost'}" onclick="window.rtPick(${s})" style="padding:10px 12px;flex:1;min-width:0;">${s}s</button>`).join('');
  function render(){
    ov.innerHTML=`<div class="modal">
      <div class="modal-handle"></div>
      <div class="modal-title">${title}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.55;margin-bottom:16px;">${desc}</div>
      <label class="form-label">${tt({pl:'Wybierz preset',en:'Pick a preset',de:'Voreinstellung wählen',es:'Elige un preset'})}</label>
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">${buildButtons(S.defaultRest)}</div>
      <label class="form-label">${tt({pl:'Lub wpisz ręcznie (sekundy)',en:'Or enter manually (seconds)',de:'Oder manuell eingeben (Sekunden)',es:'O introducir manualmente (segundos)'})}</label>
      <input type="number" id="rtInput" min="10" max="600" step="5" value="${S.defaultRest}" style="margin-bottom:18px;"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button>
        <button class="btn btn-primary" onclick="window.rtSave()">${t('saveTemplate')}</button>
      </div>
    </div>`;
  }
  document.body.appendChild(ov);S.modal=ov;
  window.rtPick=v=>{S.defaultRest=v;render();const inp=document.getElementById('rtInput');if(inp)inp.value=v;};
  window.rtSave=()=>{
    const inp=document.getElementById('rtInput');
    let v=+(inp?.value||S.defaultRest);
    if(!isFinite(v)||v<10)v=10;
    if(v>600)v=600;
    S.defaultRest=v;
    saveAll();
    closeModal();
    renderSettings();
  };
  render();
}
window.openSettingsRestTimer=openSettingsRestTimer;

function openSettingsMeasurements(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const title=tt({pl:'Pomiary ciała',en:'Body measurements',de:'Körpermaße',es:'Medidas corporales'});
  const addLbl=t('addMeasure');
  const content=bodyMeasurementsHtml(true);
  ov.innerHTML=`<div class="modal" style="max-height:85vh;display:flex;flex-direction:column;">
    <div class="modal-handle"></div>
    <div class="modal-title">${title}</div>
    <div style="overflow-y:auto;flex:1;padding-bottom:8px;">${content}</div>
    <div style="padding-top:12px;border-top:1px solid var(--border);margin-top:4px;">
      <button class="btn btn-primary" onclick="openAddMeasure()" style="width:100%;font-size:15px;padding:14px;">+ ${addLbl}</button>
    </div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
  document.body.appendChild(ov);S.modal=ov;
  renderBodyCharts();
}
window.openSettingsMeasurements=openSettingsMeasurements;

function openSettingsUnits(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const title=tt({pl:'Jednostki',en:'Units',de:'Einheiten',es:'Unidades'});
  const opts=[
    {val:'metric', label:'Metric', sub:'kg, cm'},
    {val:'imperial', label:'Imperial', sub:'lbs, in'},
  ];
  ov.innerHTML=`<div class="modal"><div class="modal-handle"></div><div class="modal-title">${title}</div>
    ${opts.map(o=>`<div onclick="setUnits('${o.val}')" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;background:${S.units===o.val?'var(--accent-dim)':'none'};border:1px solid ${S.units===o.val?'var(--accent)':'var(--border)'};margin-bottom:8px;transition:all 0.12s;">
      <div style="flex:1;"><div style="font-size:15px;font-weight:600;">${o.label}</div><div style="font-size:12px;color:var(--text2);">${o.sub}</div></div>
      ${S.units===o.val?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>':''}
    </div>`).join('')}
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
  document.body.appendChild(ov);S.modal=ov;
}
window.setUnits=function(val){
  S.units=val;saveAll();closeModal();renderSettings();
};
window.openSettingsUnits=openSettingsUnits;

function openSettingsCoachMode(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const title=tt({pl:'Tryb trenera',en:'Coach Mode',de:'Trainer-Modus',es:'Modo entrenador'});

  if(!isCoachAllowed()){
    const notSignedIn=!S.user;
    const body=notSignedIn
      ?tt({pl:'Zaloguj się na konto z dostępem do Trybu Trenera.',en:'Sign in with an account that has Coach Mode access.',de:'Melde dich mit einem Konto an, das Trainer-Modus-Zugang hat.',es:'Inicia sesión con una cuenta que tenga acceso al modo entrenador.'})
      :tt({pl:'Twoje konto nie ma dostępu do Trybu Trenera. Skontaktuj się z administratorem.',en:'Your account does not have Coach Mode access. Contact the administrator.',de:'Dein Konto hat keinen Trainer-Modus-Zugang. Kontaktiere den Administrator.',es:'Tu cuenta no tiene acceso al modo entrenador. Contacta al administrador.'});
    ov.innerHTML=`<div class="modal" style="text-align:center;padding:28px 22px;">
      <div class="modal-handle"></div>
      <div style="font-size:36px;margin-bottom:10px;">🔒</div>
      <div style="font-size:17px;font-weight:700;margin-bottom:10px;">${title}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.55;margin-bottom:20px;">${body}</div>
      <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'OK',en:'OK',de:'OK',es:'OK'})}</button>
    </div>`;
    document.body.appendChild(ov);S.modal=ov;
    return;
  }

  const desc=tt({
    pl:'Włącz, jeśli jesteś trenerem osobistym. Odblokuje panel klientów, eksport programów do udostępniania klientom oraz dashboard adherencji.',
    en:'Enable if you are a personal trainer. Unlocks the client roster, program sharing, and adherence dashboard.',
    de:'Aktivieren Sie, wenn Sie Personal Trainer sind. Schaltet die Kundenliste, das Teilen von Programmen und das Adherenz-Dashboard frei.',
    es:'Actívalo si eres entrenador personal. Desbloquea la lista de clientes, compartir programas y panel de adherencia.'
  });
  const options=[
    {val:true,emoji:'🟢',label:tt({pl:'Włączony',en:'Enabled',de:'Aktiviert',es:'Activado'})},
    {val:false,emoji:'⚪',label:tt({pl:'Wyłączony',en:'Disabled',de:'Deaktiviert',es:'Desactivado'})},
  ];
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${title}</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.55;margin-bottom:16px;">${desc}</div>
    ${options.map(o=>`
      <div onclick="setCoachMode(${o.val});closeModal();renderSettings();" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;background:${S.coachMode===o.val?'var(--accent-dim)':'none'};border:1px solid ${S.coachMode===o.val?'var(--accent)':'var(--border)'};margin-bottom:8px;transition:all 0.12s;">
        <span style="font-size:22px;line-height:1;">${o.emoji}</span>
        <span style="font-size:15px;font-weight:${S.coachMode===o.val?'700':'500'};color:${S.coachMode===o.val?'var(--accent)':'var(--text)'};">${o.label}</span>
        ${S.coachMode===o.val?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" width="18" height="18" style="margin-left:auto;"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>`).join('')}
    <button class="btn btn-ghost" style="margin-top:8px;" onclick="closeModal()">${t('cancelTemplate')}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.openSettingsCoachMode=openSettingsCoachMode;
window.setCoachMode=function(on){
  S.coachMode=!!on;
  saveAll();
  renderSettings();renderPrograms();renderAccountBadge();updateCoachNav();updateProCoachNav();updateAdminNav();
};

loadData();
initSupabase();

// ===== HARDWARE BACK BUTTON (Android / TWA) =====
// Behavior:
//   - Open detail modal → first back closes it
//   - Open regular modal → first back closes it
//   - On any non-Dashboard screen → first back returns to Dashboard
//   - On Dashboard → first back shows toast "Press Back again to exit"; second within 2.5s exits
let _lastBackOnDash=0;
let _backToastEl=null;
function showBackToast(msg){
  if(!_backToastEl){
    _backToastEl=document.createElement('div');
    _backToastEl.style.cssText='position:fixed;bottom:calc(96px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:10px 20px;border-radius:24px;font-size:13px;font-weight:500;z-index:400;opacity:0;transition:opacity 0.25s;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,0.45);white-space:nowrap;max-width:90vw;text-align:center;';
    document.body.appendChild(_backToastEl);
  }
  _backToastEl.textContent=msg;
  _backToastEl.style.opacity='1';
  clearTimeout(_backToastEl._fadeT);
  _backToastEl._fadeT=setTimeout(()=>{if(_backToastEl)_backToastEl.style.opacity='0';},2300);
}
let _lastBackOnWorkouts=0;
function setupBackButton(){
  history.replaceState({bs:true,sentinel:true},'','');
  history.pushState({bs:true},'','');
  window._bsHistoryReady=true;
  window.addEventListener('popstate',()=>{
    // 1) Close detail modal
    if(S.detailModal){closeDetailModal();history.pushState({bs:true},'','');return;}
    // 2) Client detail subview -> return to client hub before closing the full-screen client card
    if(S.modal&&window._clientDetailData&&window._clientDetailView&&window._clientDetailView!=='hub'){
      renderClientHub();
      history.pushState({bs:true},'','');
      return;
    }
    // 3) Close any modal/popup
    if(S.modal){closeModal();history.pushState({bs:true},'','');return;}

    const active=document.querySelector('.screen.active')?.id?.replace('screen-','');

    // 4) Active workout — double-back asks for confirmation
    if(active==='workouts'&&S.activeWorkout){
      const now=Date.now();
      if(now-_lastBackOnWorkouts<2500){
        showWorkoutBackConfirm();
        history.pushState({bs:true},'','');
        return;
      }
      _lastBackOnWorkouts=now;
      showBackToast(tt({pl:'Wciśnij Wstecz ponownie, aby anulować trening',en:'Press Back again to cancel workout',de:'Erneut Zurück zum Abbrechen',es:'Presiona Atrás de nuevo para cancelar'}));
      history.pushState({bs:true},'','');
      return;
    }

    // 5) Any screen other than dashboard → go home
    if(active!=='dashboard'){
      window._bsHandlingBack=true;
      showScreen('dashboard');
      window._bsHandlingBack=false;
      history.pushState({bs:true},'','');
      return;
    }

    // 6) On dashboard — double-press to exit app
    const now=Date.now();
    if(now-_lastBackOnDash<2500){
      return;
    }
    _lastBackOnDash=now;
    showBackToast(tt({pl:'Wciśnij Wstecz ponownie, aby wyjść',en:'Press Back again to exit',de:'Erneut Zurück drücken zum Beenden',es:'Presiona Atrás otra vez para salir'}));
    history.pushState({bs:true},'','');
  });
}
setupBackButton();
setTimeout(updateNotificationBadge,0);

if(sessionStorage.getItem('bs-updated')==='1'){
  sessionStorage.removeItem('bs-updated');
  addAdminChangelogEntry('auto_update',tt({pl:'Auto update wykonany',en:'Auto update completed',de:'Auto update abgeschlossen',es:'Auto update completado'}));
  if(document.getElementById('screen-settings')?.classList.contains('active'))renderSettings();
  setTimeout(()=>showSyncToast(tt({pl:'Aplikacja została zaktualizowana.',en:'App has been updated.',de:'App wurde aktualisiert.',es:'La app se ha actualizado.'}),'success'),700);
}
