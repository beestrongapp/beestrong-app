// ===== DASHBOARD =====
function renderDashboard(){
  document.getElementById('logoImg')?.setAttribute('src',isDark?'./logo.jpg':'./light_logo.png');
  document.getElementById('mobileBrandLogo')?.setAttribute('src',isDark?'./logo.jpg':'./light_logo.png');
  renderInvitationBanners();
  const ws=weekStart(),we=new Date(ws);we.setDate(we.getDate()+6);
  const fmt=d=>`${d.getDate()} ${t('monthsShort')[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('dashWeekLabel').textContent=`${t('week')} ${fmt(ws)} — ${fmt(we)}`;
  const keys=Object.entries(S.workouts).filter(([k,w])=>{const d=new Date((w.date||k.split('_')[0]));return d>=ws&&d<=we;}).map(([k])=>k);
  const tm=keys.reduce((a,k)=>a+(S.workouts[k].duration||0),0);
  const tv=keys.reduce((a,k)=>a+(S.workouts[k].volume||0),0);
  const dashStats=document.getElementById('dashStats');
  if(dashStats)dashStats.innerHTML='';

  // Quick Access label
  const qaLbl=document.getElementById('lblQuickAccess');
  if(qaLbl)qaLbl.textContent=t('quickAccess');

  const standardTiles=[
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
  const minimalTiles=[
    standardTiles[0], // Quick workout
    standardTiles[3], // Calendar
    standardTiles[1], // Templates
    standardTiles[4], // Measurements
  ];
  const isMinimalLayout=S.layoutMode==='minimal';
  const QA_TILES=isMinimalLayout?minimalTiles:standardTiles;
  const qaGrid=document.getElementById('quickAccessGrid');
  if(qaGrid){
    qaGrid.classList.toggle('quick-access-grid-minimal',isMinimalLayout);
    qaGrid.innerHTML=QA_TILES.map(tile=>`
      <div class="qa-tile${tile.accent?' qa-tile-primary':''}" onclick="${tile.action}">
        <div class="qa-tile-icon">${tile.icon}</div>
        <div class="qa-tile-label">${tt(tile.labelKey)}</div>
      </div>`).join('');
  }

  // Recent workouts
  const recent=Object.entries(S.workouts).sort((a,b)=>{const da=a[1].date||a[0].split('_')[0];const db=b[1].date||b[0].split('_')[0];return db>da?1:db<da?-1:b[0]>a[0]?1:-1;}).slice(0,5);
  const el=document.getElementById('recentWorkouts');
  if(!el)return;
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
    const wTime=monthWorkouts.reduce((a,[,w])=>a+(w.duration||0),0);
    statsEl.innerHTML=`
      <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div><div><strong>${wCount}</strong><span>${tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenamientos'})}</span></div></div>
      <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></div><div><strong>${wTime}</strong><span>${t('minutes')}</span></div></div>
      <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div><div><strong>${fmtVol(wVol)}</strong><span>${unitVol()}</span></div></div>`;
  }
  const streak=getWorkoutStreak();
  const streakEl=document.getElementById('calendarStreakBanner');
  if(streakEl){
    if(streak>=2){
      streakEl.classList.add('visible');
      document.getElementById('calendarStreakCount').textContent=streak;
      const days=tt({pl:streak===1?'dzień':'dni',en:streak===1?'day':'days',de:streak===1?'Tag':'Tage',es:streak===1?'día':'días'});
      document.getElementById('calendarStreakLabel').textContent=tt({pl:`${days} z rzędu! Tak trzymaj 💪`,en:`${days} in a row! Keep it up 💪`,de:`${days} in Folge! Weiter so 💪`,es:`${days} seguidos! ¡Sigue así 💪`});
    } else {
      streakEl.classList.remove('visible');
    }
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
    const hasPlan=!!S.weekPlan?.[k];
    const cls=['cal-day',k===td?'today':'',hasW?'has-workout':'',hasPlan?'has-plan':'',S.selectedDate===k?'selected':''].filter(Boolean).join(' ');
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
  const planned=S.weekPlan?.[dateKey]||null;

  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 8px;">
    <div style="font-size:13px;color:var(--text2);">${d}.${m}.${y}</div>
    <button class="btn btn-sm btn-ghost" onclick="openManualWorkout('${dateKey}')" style="font-size:12px;">${tt({pl:'+ Dodaj trening',en:'+ Add workout',de:'+ Training hinzufügen',es:'+ Añadir entrenamiento'})}</button>
  </div>`;

  if(planned){
    html+=`<div class="workout-row" onclick="showPlanDetailModal('${dateKey}')" style="margin-bottom:8px;border-color:var(--accent-dim2);">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${planned.name||t('workout')}</div><div class="workout-row-meta">${planned.fromCoach?tt({pl:'Przypisane przez coacha',en:'Assigned by coach',de:'Vom Coach zugewiesen',es:'Asignado por coach'}):tt({pl:'Zaplanowany trening',en:'Planned workout',de:'Geplantes Training',es:'Entrenamiento planificado'})}</div></div>
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();startPlannedWorkout('${dateKey}')" style="font-size:12px;padding:7px 12px;">${t('startWorkout')}</button>
    </div>`;
  }
  if(!dayWorkouts.length&&!planned){
    html+=`<div style="font-size:13px;color:var(--text3);margin-bottom:10px;">${t('noRest')}</div>`;
  }
  if(dayWorkouts.length){
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
  const progressTabBtn=(tab,label)=>`<button type="button" class="progress-tab-btn ${_progressTab===tab?'active':''}" data-progress-tab="${tab}" onclick="setProgressTab('${tab}')" ontouchstart="setProgressTab('${tab}')" onpointerup="setProgressTab('${tab}')">${label}</button>`;
  const tabsHtml=`<div class="progress-tabs">
    ${progressTabBtn('lifts',tt({pl:'Wyniki',en:'Your Lifts',de:'Leistung',es:'Rendimiento'}))}
    ${progressTabBtn('templates',t('templates'))}
    ${progressTabBtn('records',tt({pl:'Rekordy',en:'Records',de:'Rekorde',es:'Récords'}))}
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

window.setProgressTab=function(tab){
  if(!['lifts','templates','records'].includes(tab))return;
  _progressTab=tab;
  renderProgress();
};
function handleProgressTabEvent(e){
  const btn=e.target.closest?.('[data-progress-tab]');
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  window.setProgressTab(btn.dataset.progressTab);
}
document.addEventListener('click',handleProgressTabEvent,true);
document.addEventListener('touchstart',handleProgressTabEvent,{capture:true,passive:false});
document.addEventListener('pointerup',handleProgressTabEvent,true);
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
    closeModal();renderTemplates();saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
  };
  window.delTpl=tid=>{S.templates=S.templates.filter(x=>x.id!==tid);closeModal();renderTemplates();saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();};
  renderTplModal();
  document.body.appendChild(ov);S.modal=ov;
  ov._backHandler=()=>{closeModal();return true;};
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

  const weekWorkouts=Object.entries(S.workouts).filter(([wk,w])=>{
    const date=(w.date||wk.split('_')[0]);
    return dates.includes(date);
  });
  const weekCount=weekWorkouts.length;
  const weekTime=weekWorkouts.reduce((a,[,w])=>a+(w.duration||0),0);
  const weekVol=weekWorkouts.reduce((a,[,w])=>a+(w.volume||0),0);
  html+=`<div class="cal-stats">
    <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div><div><strong>${weekCount}</strong><span>${tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenamientos'})}</span></div></div>
    <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></div><div><strong>${weekTime}</strong><span>${t('minutes')}</span></div></div>
    <div class="cal-stat-card"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div><div><strong>${fmtVol(weekVol)}</strong><span>${unitVol()}</span></div></div>
  </div>`;

  // ── Day cards ──
  const dayCardsHtml=dates.map((date,i)=>{
    const plan=S.weekPlan?.[date];
    const isToday=date===today_;
    const isPast=date<today_;
    const isSelected=date===_selectedPlanDate;
    let content='';
    const coachMark=plan?.fromCoach?' 👤':'';
    if(plan?.type==='custom'){
      content=`<div class="week-plan-pill custom">${plan.name}</div>`;
    }else if(plan?.type==='template'){
      content=`<div class="week-plan-pill template">${plan.name}${coachMark}</div>`;
    }else{
      content=`<div class="week-plan-rest">Rest</div>`;
    }
    const cls=['week-plan-day',isSelected?'is-selected':'',_planningProgram?'is-planning':'',isPast?'is-past':'',isToday?'is-today':''].filter(Boolean).join(' ');
    return`<div data-wp="day" data-date="${date}" class="${cls}">
      <div class="week-plan-day-label">${dayNames[i]}</div>
      <div class="week-plan-day-num">${date.slice(8)}</div>
      ${content}
    </div>`;
  }).join('');
  html+=`<div class="week-plan-days">${dayCardsHtml}</div>`;

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
      const planExercises=plan.exercises?.length?plan.exercises:(plan.template?.exercises||[]);
      const exRows=planExercises?.length
        ?planExercises.map(e=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border);">
            <span style="color:var(--text2);">• ${exName(e)||e.name||'?'}</span>
            <span style="color:var(--text3);flex-shrink:0;">${e.sets||3}×${e.reps||10}</span>
          </div>`).join(''):'';
      const source=plan.fromCoach?` · ${tt({pl:'od coacha',en:'from coach',de:'vom Coach',es:'del coach'})}`:'';
      html+=`<div data-wp="view-detail" data-date="${sd}" style="cursor:pointer;margin-bottom:12px;" title="${tt({pl:'Kliknij by zobaczyć szczegóły',en:'Click to see details',de:'Klicken für Details',es:'Toca para ver detalles'})}">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">${icon}</span>
            <div>
              <div style="font-size:15px;font-weight:700;">${plan.name}</div>
              <div style="font-size:11px;color:var(--text3);">${typeLbl}${source}${planExercises?.length?' · '+planExercises.length+' '+tt({pl:'ćwiczeń',en:'exercises',de:'Übungen',es:'ejercicios'}):''}</div>
            </div>
            <span style="margin-left:auto;color:var(--text3);font-size:16px;">›</span>
          </div>
          ${exRows?`<div style="margin-top:8px;max-height:120px;overflow-y:auto;">${exRows}</div>`:''}
        </div>
        <div style="display:flex;gap:8px;">
          <button data-wp="start-plan" data-date="${sd}" class="btn btn-primary" style="flex:1;font-size:13px;">▶ ${t('startWorkout')}</button>
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
        case 'start-plan':startPlannedWorkout(date);break;
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
    const exercises=(plan.exercises?.length?plan.exercises:null)||(plan.template?.exercises?.length?plan.template.exercises:null)||(tp?.exercises||[]);
    bodyHtml=exercises.length
      ?exercises.map(e=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
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
    ov._backHandler=()=>{closeModal();return true;};
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

function plannedWorkoutTemplate(plan){
  if(!plan)return null;
  if(plan.type==='template'){
    const tp=plan.template||S.templates.find(t=>String(t.id)===String(plan.templateId));
    if(!tp&&!plan.exercises?.length)return null;
    return{
      id:null,
      name:plan.name||tp?.name||t('workout'),
      types:tp?.types||[],
      restDefault:tp?.restDefault||S.defaultRest||90,
      exercises:(plan.exercises?.length?plan.exercises:tp.exercises).map(e=>({...e,sets:e.sets||3,reps:e.reps||10,weight:e.weight||0})),
    };
  }
  if(plan.type==='custom'){
    return{
      id:null,
      name:plan.name||t('customWorkout'),
      types:[],
      restDefault:S.defaultRest||90,
      exercises:(plan.exercises||[]).map(e=>({...e,sets:e.sets||3,reps:e.reps||10,weight:e.weight||0})),
    };
  }
  return null;
}

function startPlannedWorkout(date){
  const plan=S.weekPlan?.[date];
  const tpl=plannedWorkoutTemplate(plan);
  if(!tpl)return showSyncToast(tt({pl:'Brak danych treningu.',en:'No workout data.',de:'Keine Trainingsdaten.',es:'Sin datos del entrenamiento.'}),'error');
  closeModal();
  startWorkout(tpl);
}
window.startPlannedWorkout=startPlannedWorkout;
window.switchCalTab=switchCalTab;

// ===== PROFILE =====
let _profileSectionView=null;
function renderSettings(){
  const el=document.getElementById('settingsContent');
  if(!el)return;

  const measCount=Object.keys(S.measurements).length;
  const measLastDate=measCount>0?Object.keys(S.measurements).sort().reverse()[0]:null;
  const measValue=measCount>0
    ?`${measCount} ${tt({pl:'pomiarów',en:'entries',de:'Einträge',es:'entradas'})}${measLastDate?' · '+measLastDate:''}`
    :tt({pl:'Brak pomiarów',en:'No measurements',de:'Keine Messungen',es:'Sin medidas'});

  const icon={
    account:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    cloud:'<path d="M17.5 19H7a5 5 0 0 1-.7-10 6 6 0 0 1 11.2-2A4.5 4.5 0 0 1 17.5 19z"/>',
    card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    layout:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/>',
    theme:'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    language:'<circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M3 12h18"/><path d="M3.6 8h16.8M3.6 16h16.8"/>',
    units:'<path d="M3 3h18M3 9h18M3 15h18M3 21h18M9 3v18M15 3v18"/>',
    timer:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    measure:'<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M7 8v2M10 8v3M13 8v2M17 8v3"/>',
    contact:'<path d="M4 4h16v12H5.2L4 19.5V4z"/><path d="M8 9h8M8 13h5"/>',
    news:'<path d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M8 8h6M8 12h8M8 16h5"/>',
    privacy:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9.5 12l1.7 1.7 3.6-4.2"/>',
    name:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
  };
  const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">${path}</svg>`;
  const profileRow=(row,i)=>{
      const isUnits=row.key==='units';
      const isTheme=row.key==='theme';
      const isLayout=row.key==='layout';
      if(isLayout){
        const isOn=S.layoutMode==='minimal';
        return`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg2);transition:background 0.12s;${i>0?'border-top:1px solid var(--border);':''}">
          <div style="width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">${row.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${row.label}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px;">${row.value}</div>
          </div>
          <div class="toggle-switch ${isOn?'on':''}" onclick="event.stopPropagation();setLayoutMode('${isOn?'standard':'minimal'}')"><div class="toggle-knob"></div></div>
        </div>`;
      }
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
  };
  const subscriptionTitle=tt({pl:'Subskrypcja',en:'Subscription',de:'Abo',es:'Suscripción'});
  const preferencesTitle=tt({pl:'Preferencje',en:'Preferences',de:'Einstellungen',es:'Preferencias'});
  const contactTitle=tt({pl:'Kontakt',en:'Contact',de:'Kontakt',es:'Contacto'});
  const whatsNewTitle=tt({pl:'Co nowego',en:"What's new",de:'Was ist neu',es:'Novedades'});
  const privacyTitle=tt({pl:'Polityka prywatności',en:'Privacy Policy',de:'Datenschutz',es:'Política de privacidad'});
  window._profileSections={
    login:{title:tt({pl:'Login and data',en:'Login and data',de:'Login und Daten',es:'Login y datos'}),rows:null},
    subscription:{title:subscriptionTitle,rows:null},
    preferences:{title:preferencesTitle,rows:null},
    measurements:{title:tt({pl:'Twoje pomiary',en:'Body measurements',de:'Körpermaße',es:'Medidas corporales'}),rows:null},
    contact:{title:contactTitle,rows:null},
    whatsnew:{title:whatsNewTitle,rows:null},
    privacy:{title:privacyTitle,rows:null},
  };
  const hubRow=(id,label,path)=>`<div onclick="openProfileSection('${id}')" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);cursor:pointer;margin-bottom:10px;">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">${svg(path)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:800;">${label}</div>
        </div>
      </div>`;

  const accountState=S.user
    ?tt({pl:'Zalogowany',en:'Signed in',de:'Angemeldet',es:'Sesión iniciada'})
    :tt({pl:'Niezalogowany',en:'Signed out',de:'Abgemeldet',es:'Sin sesión'});
  const dataState=cloudSyncAllowed()
    ?tt({pl:'Cloud backup aktywny',en:'Cloud backup active',de:'Cloud-Backup aktiv',es:'Backup en nube activo'})
    :tt({pl:'Dane tylko na tym urządzeniu',en:'Stored on this device only',de:'Nur auf diesem Gerät gespeichert',es:'Solo en este dispositivo'});
  const subscriptionLabel=S.coachMode&&S.user
    ?'COACH'
    :(S.isPro&&S.user?'PRO':'FREE');
  const loginTitle=tt({pl:'Login i dane',en:'Login and data',de:'Login und Daten',es:'Login y datos'});
  const loginRows=[
    {key:'account',label:loginTitle,value:S.user?`${S.user.email} · ${dataState}`:`${accountState} · ${dataState}`,icon:svg(icon.account),action:S.user?'showAccountModal':'showAuthModal'},
    {key:'name',label:lang==='pl'?'Imię':'Name',value:localStorage.getItem('bs-username')||'—',icon:svg(icon.name),action:'openSettingsName'},
  ];
  const subscriptionRows=[
    {key:'subscription',label:subscriptionTitle,value:`${subscriptionLabel} · ${tt({pl:'zobacz porównanie planów',en:'view plan comparison',de:'Pläne vergleichen',es:'ver comparación'})}`,icon:svg(icon.card),action:'openSubscriptionModal'},
  ];
  const preferenceRows=[
    {key:'layout',label:tt({pl:'Wygląd appki',en:'App layout',de:'App-Layout',es:'Layout de app'}),value:S.layoutMode==='minimal'?tt({pl:'Uproszczony',en:'Minimal',de:'Minimal',es:'Minimal'}):tt({pl:'Standardowy',en:'Standard',de:'Standard',es:'Estándar'}),icon:svg(icon.layout),action:'openSettingsLayout'},
    {key:'theme',label:tt({pl:'Kolor motywu',en:'Theme colour',de:'Farbschema',es:'Tema'}),value:isDark?t('darkTheme'):t('lightTheme'),icon:svg(icon.theme),action:'openSettingsTheme'},
    {key:'language',label:t('language'),value:({en:t('langEnglish'),pl:t('langPolish'),de:t('langGerman'),es:t('langSpanish')}[lang]||t('langEnglish')),icon:svg(icon.language),action:'openSettingsLanguage'},
    {key:'units',label:tt({pl:'Jednostki',en:'Units',de:'Einheiten',es:'Unidades'}),value:S.units==='imperial'?'Imperial (lbs / in)':'Metric (kg / cm)',icon:svg(icon.units),action:'openSettingsUnits'},
    {key:'restTimer',label:tt({pl:'Czas odpoczynku',en:'Rest timer',de:'Pausenzeit',es:'Tiempo de descanso'}),value:`${S.defaultRest||90} s`,icon:svg(icon.timer),action:'openSettingsRestTimer'},
  ];
  const measurementsTitle=tt({pl:'Twoje pomiary',en:'Body measurements',de:'Körpermaße',es:'Medidas corporales'});
  const measurementRows=[
    {key:'measurements',label:measurementsTitle,value:measValue,icon:svg(icon.measure),action:'openSettingsMeasurements'},
  ];
  const contactRows=[
    {key:'contact',label:'Contact',value:tt({pl:'Wkrótce',en:'Coming soon',de:'Bald verfügbar',es:'Próximamente'}),icon:svg(icon.contact),action:'openProfilePlaceholderContact'},
  ];
  const whatsNewRows=[
    {key:'whatsnew',label:"What's new",value:tt({pl:'Zmiany z ostatniego update',en:'Latest update notes',de:'Letzte Update-Notizen',es:'Notas del último update'}),icon:svg(icon.news),action:'openProfilePlaceholderWhatsNew'},
  ];
  const privacyRows=[
    {key:'privacy',label:'Privacy Policy',value:tt({pl:'Wkrótce',en:'Coming soon',de:'Bald verfügbar',es:'Próximamente'}),icon:svg(icon.privacy),action:'openProfilePlaceholderPrivacy'},
  ];
  window._profileSections.login={title:loginTitle,rows:loginRows};
  window._profileSections.subscription={title:subscriptionTitle,rows:subscriptionRows};
  window._profileSections.preferences={title:preferencesTitle,rows:preferenceRows};
  window._profileSections.measurements={title:measurementsTitle,rows:measurementRows};
  window._profileSections.contact={title:contactTitle,rows:contactRows};
  window._profileSections.whatsnew={title:whatsNewTitle,rows:whatsNewRows};
  window._profileSections.privacy={title:privacyTitle,rows:privacyRows};

  const adminChangelog=isAdmin()?adminChangelogHtml():'';
  const versionLbl=`<div style="margin:24px 0 40px;padding:12px;text-align:center;font-size:11px;color:var(--text3);">BeeStrong Gym Tracker · v1.0</div>`;

  if(_profileSectionView){
    const section=window._profileSections?.[_profileSectionView];
    if(section){
      const backBar=`<div class="settings-bottom-bar"><button class="btn btn-primary" onclick="backToProfileHub()" style="width:100%;font-size:15px;padding:14px;">${tt({pl:'Wróć',en:'Back',de:'Zurück',es:'Volver'})}</button></div>`;
      let sectionBody='';
      if(_profileSectionView==='login')sectionBody=profileLoginDataHtml(dataState);
      else if(_profileSectionView==='subscription')sectionBody=profileSubscriptionHtml();
      else if(_profileSectionView==='measurements')sectionBody=profileMeasurementsHtml();
      else if(['contact','whatsnew','privacy'].includes(_profileSectionView))sectionBody=profileInfoSectionHtml(_profileSectionView);
      else sectionBody=`<div style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);background:var(--bg2);">${(section.rows||[]).map((row,i)=>profileRow(row,i)).join('')}</div>`;
      el.innerHTML=`<div style="font-size:20px;font-weight:900;margin-bottom:18px;">${section.title}</div>${sectionBody}<div style="height:96px;"></div>${versionLbl}${backBar}`;
      if(_profileSectionView==='measurements')renderBodyCharts();
      return;
    }
    _profileSectionView=null;
  }

  el.innerHTML=proCardHtml()
    +`<div style="margin-bottom:38px;">`
    +hubRow('login',loginTitle,icon.account)
    +hubRow('subscription',subscriptionTitle,icon.card)
    +`</div><div style="margin-bottom:38px;">`
    +hubRow('preferences',preferencesTitle,icon.layout)
    +hubRow('measurements',measurementsTitle,icon.measure)
    +`</div><div style="margin-bottom:8px;">`
    +hubRow('contact',contactTitle,icon.contact)
    +hubRow('whatsnew',whatsNewTitle,icon.news)
    +hubRow('privacy',privacyTitle,icon.privacy)
    +`</div>`
    +adminChangelog
    +versionLbl;
}

function openProfileSection(id){
  if(!window._profileSections?.[id])return;
  _profileSectionView=id;
  renderSettings();
  document.querySelector('.main')?.scrollTo?.({top:0,behavior:'smooth'});
}
function backToProfileHub(){
  _profileSectionView=null;
  renderSettings();
  document.querySelector('.main')?.scrollTo?.({top:0,behavior:'smooth'});
}
window.openProfileSection=openProfileSection;
window.backToProfileHub=backToProfileHub;

function profileActionCard(title,subtitle,action,extraStyle=''){
  return `<div onclick="${action}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;cursor:pointer;margin-bottom:10px;${extraStyle}">
    <div style="min-width:0;">
      <div style="font-size:14px;font-weight:800;">${title}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${subtitle}</div>
    </div>
  </div>`;
}

function profileLoginDataHtml(dataState){
  if(!S.user){
    return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;margin-bottom:14px;">
      <div style="font-size:14px;font-weight:800;margin-bottom:6px;">${tt({pl:'Nie jesteś zalogowany',en:'You are signed out',de:'Du bist abgemeldet',es:'No has iniciado sesión'})}</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.45;margin-bottom:14px;">${dataState}</div>
      <button class="btn btn-primary" onclick="showAuthModal()" style="width:100%;">${tt({pl:'Zaloguj się',en:'Log in',de:'Einloggen',es:'Login'})}</button>
    </div>`;
  }
  const cloudHint=cloudSyncAllowed()
    ?tt({pl:'Backup dostępny dla tego konta',en:'Backup available for this account',de:'Backup für dieses Konto verfügbar',es:'Backup disponible para esta cuenta'})
    :tt({pl:'Cloud backup wymaga PRO / COACH',en:'Cloud backup requires PRO / COACH',de:'Cloud-Backup benötigt PRO / COACH',es:'Cloud backup requiere PRO / COACH'});
  return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;margin-bottom:18px;">
    <div style="font-size:13px;color:var(--text3);font-weight:800;text-transform:uppercase;margin-bottom:8px;">${tt({pl:'Zalogowany jako',en:'Signed in as',de:'Angemeldet als',es:'Sesión iniciada como'})}</div>
    <div style="font-size:15px;font-weight:800;word-break:break-all;">${S.user.email||''}</div>
    <div style="font-size:12px;color:var(--text2);margin-top:6px;">${dataState}</div>
  </div>
  ${profileActionCard(tt({pl:'Imię',en:'Name',de:'Name',es:'Nombre'}),localStorage.getItem('bs-username')||'—','openSettingsName()')}
  ${profileActionCard(tt({pl:'Wyślij do chmury',en:'Upload to cloud',de:'In Cloud hochladen',es:'Subir a la nube'}),cloudHint,'profileUploadToCloud()')}
  ${profileActionCard(tt({pl:'Pobierz z chmury',en:'Download from cloud',de:'Aus Cloud herunterladen',es:'Descargar de la nube'}),tt({pl:'Nadpisuje lokalne dane chmurą',en:'Overwrites local with cloud data',de:'Überschreibt lokal mit Cloud-Daten',es:'Sobrescribe local con datos de nube'}),'profileDownloadFromCloud()')}
  <button class="btn btn-danger" onclick="profileSignOut()" style="width:100%;margin-top:8px;">${tt({pl:'Wyloguj się',en:'Sign out',de:'Abmelden',es:'Cerrar sesión'})}</button>`;
}

function profileSubscriptionHtml(){
  const plans=[
    {name:'FREE',sub:tt({pl:'Dane lokalne',en:'Local data',de:'Lokale Daten',es:'Datos locales'}),items:[
      tt({pl:'Dane zapisane tylko na urządzeniu',en:'Data stored on this device only',de:'Daten nur auf diesem Gerät',es:'Datos solo en este dispositivo'}),
      tt({pl:'Podstawowe treningi i pomiary',en:'Basic workouts and measurements',de:'Basis-Trainings und Messungen',es:'Entrenos y medidas básicos'}),
      tt({pl:'Brak cloud backup',en:'No cloud backup',de:'Kein Cloud-Backup',es:'Sin backup en nube'}),
    ]},
    {name:'PRO',sub:tt({pl:'Jednorazowy zakup',en:'One-time purchase',de:'Einmalkauf',es:'Compra única'}),items:[
      tt({pl:'Płacisz raz i zachowujesz dostęp PRO',en:'Pay once and keep PRO access',de:'Einmal zahlen und PRO-Zugang behalten',es:'Pagas una vez y mantienes PRO'}),
      tt({pl:'Cloud backup dla treningów, szablonów i pomiarów',en:'Cloud backup for workouts, templates and measurements',de:'Cloud-Backup für Trainings, Vorlagen und Messungen',es:'Backup de entrenos, plantillas y medidas'}),
      tt({pl:'Pełny dostęp do funkcji PRO',en:'Full PRO feature access',de:'Voller PRO-Zugriff',es:'Acceso completo PRO'}),
      tt({pl:'Synchronizacja po ważnych akcjach',en:'Sync after important actions',de:'Sync nach wichtigen Aktionen',es:'Sync tras acciones importantes'}),
    ]},
    {name:'COACH',sub:tt({pl:'Miesięczna subskrypcja',en:'Monthly subscription',de:'Monatliches Abo',es:'Suscripción mensual'}),items:[
      tt({pl:'Subskrypcja odnawiana miesięcznie',en:'Monthly recurring subscription',de:'Monatlich wiederkehrendes Abo',es:'Suscripción mensual recurrente'}),
      tt({pl:'Wszystko z PRO',en:'Everything in PRO',de:'Alles aus PRO',es:'Todo lo de PRO'}),
      tt({pl:'Klienci, przypisywanie planów i programów',en:'Clients, assignments and programs',de:'Klienten, Zuweisungen und Programme',es:'Clientes, asignaciones y programas'}),
      tt({pl:'Chat coach-klient i podgląd postępów',en:'Coach-client chat and progress view',de:'Coach-Klient-Chat und Fortschrittsansicht',es:'Chat coach-cliente y vista de progreso'}),
    ]},
  ];
  return `<div style="display:grid;gap:12px;">${plans.map(p=>`<div style="border:1px solid var(--border);background:var(--bg2);border-radius:12px;padding:15px;">
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px;">
      <div style="font-size:16px;font-weight:900;color:var(--accent);">${p.name}</div>
      <div style="font-size:11px;color:var(--text3);font-weight:800;text-transform:uppercase;">${p.sub}</div>
    </div>
    ${p.items.map(it=>`<div style="font-size:13px;color:var(--text2);line-height:1.45;padding:6px 0;border-top:1px solid var(--border);">${it}</div>`).join('')}
  </div>`).join('')}</div>`;
}

function profileMeasurementsHtml(){
  return `${bodyMeasurementsHtml(true)}<button class="btn btn-primary" onclick="openAddMeasure()" style="width:100%;font-size:15px;padding:14px;margin-top:14px;">+ ${t('addMeasure')}</button>`;
}

function profileInfoSectionHtml(id){
  const body={
    contact:tt({pl:'Sekcja Contact zostanie dodana później.',en:'Contact will be added later.',de:'Kontakt wird später hinzugefügt.',es:'Contact se añadirá más tarde.'}),
    whatsnew:tt({pl:'Tutaj będzie opis zmian z ostatniego update.',en:'Latest update notes will live here.',de:'Hier erscheinen die letzten Update-Notizen.',es:'Aquí estarán las notas del último update.'}),
    privacy:tt({pl:'Privacy Policy zostanie dodana później.',en:'Privacy Policy will be added later.',de:'Privacy Policy wird später hinzugefügt.',es:'Privacy Policy se añadirá más tarde.'}),
  }[id]||'';
  return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;font-size:13px;color:var(--text2);line-height:1.5;">${body}</div>`;
}

async function profileUploadToCloud(){
  if(!cloudSyncAllowed())return showSyncToast(tt({pl:'Cloud sync jest tylko dla PRO / COACH.',en:'Cloud sync is only for PRO / COACH.',de:'Cloud Sync ist nur für PRO / COACH.',es:'Cloud sync es solo para PRO / COACH.'}),'error');
  showSyncToast(tt({pl:'Wysyłanie...',en:'Uploading...',de:'Hochladen...',es:'Subiendo...'}));
  if(typeof queueAllCloudData==='function')queueAllCloudData();
  const r=await syncQueuedCloudChanges();
  if(r.success)showSyncToast(tt({pl:'Wysłano ✓',en:'Uploaded ✓',de:'Hochgeladen ✓',es:'Subido ✓'}),'success');
  else showSyncToast((tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '}))+(r.error||''),'error');
}
async function profileDownloadFromCloud(){
  if(!cloudSyncAllowed())return showSyncToast(tt({pl:'Cloud sync jest tylko dla PRO / COACH.',en:'Cloud sync is only for PRO / COACH.',de:'Cloud Sync ist nur für PRO / COACH.',es:'Cloud sync es solo para PRO / COACH.'}),'error');
  if(!confirm(tt({pl:'Pobrać dane z chmury? Nadpisze lokalne.',en:'Download cloud data? This overwrites local data.',de:'Cloud-Daten herunterladen? Lokale Daten werden überschrieben.',es:'¿Descargar datos de la nube? Sobrescribe los locales.'})))return;
  showSyncToast(tt({pl:'Pobieranie...',en:'Downloading...',de:'Herunterladen...',es:'Descargando...'}));
  const r=await pullAllFromCloud();
  if(r.success)showSyncToast(tt({pl:'Pobrano ✓',en:'Downloaded ✓',de:'Heruntergeladen ✓',es:'Descargado ✓'}),'success');
  else showSyncToast((tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '}))+(r.error||''),'error');
}
async function profileSignOut(){
  await bsSignOut();
  _profileSectionView=null;
  renderSettings();
}
window.profileUploadToCloud=profileUploadToCloud;
window.profileDownloadFromCloud=profileDownloadFromCloud;
window.profileSignOut=profileSignOut;
function isProfileMeasurementsSection(){return _profileSectionView==='measurements';}
window.isProfileMeasurementsSection=isProfileMeasurementsSection;

function openSubscriptionModal(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const plans=[
    {name:'FREE',sub:tt({pl:'Dane lokalne',en:'Local data',de:'Lokale Daten',es:'Datos locales'}),items:[
      tt({pl:'Dane zapisane tylko na urządzeniu',en:'Data stored on this device only',de:'Daten nur auf diesem Gerät',es:'Datos solo en este dispositivo'}),
      tt({pl:'Podstawowe treningi i pomiary',en:'Basic workouts and measurements',de:'Basis-Trainings und Messungen',es:'Entrenos y medidas básicos'}),
      tt({pl:'Brak cloud backup',en:'No cloud backup',de:'Kein Cloud-Backup',es:'Sin backup en nube'}),
    ]},
    {name:'PRO',sub:tt({pl:'Backup i funkcje premium',en:'Backup and premium tools',de:'Backup und Premium-Funktionen',es:'Backup y funciones premium'}),items:[
      tt({pl:'Cloud backup dla treningów, szablonów i pomiarów',en:'Cloud backup for workouts, templates and measurements',de:'Cloud-Backup für Trainings, Vorlagen und Messungen',es:'Backup de entrenos, plantillas y medidas'}),
      tt({pl:'Pełny dostęp do funkcji PRO',en:'Full PRO feature access',de:'Voller PRO-Zugriff',es:'Acceso completo PRO'}),
      tt({pl:'Synchronizacja po ważnych akcjach',en:'Sync after important actions',de:'Sync nach wichtigen Aktionen',es:'Sync tras acciones importantes'}),
    ]},
    {name:'COACH',sub:tt({pl:'PRO + praca z klientami',en:'PRO + client tools',de:'PRO + Klienten-Tools',es:'PRO + herramientas de clientes'}),items:[
      tt({pl:'Wszystko z PRO',en:'Everything in PRO',de:'Alles aus PRO',es:'Todo lo de PRO'}),
      tt({pl:'Klienci, przypisywanie planów i programów',en:'Clients, assignments and programs',de:'Klienten, Zuweisungen und Programme',es:'Clientes, asignaciones y programas'}),
      tt({pl:'Chat coach-klient i podgląd postępów',en:'Coach-client chat and progress view',de:'Coach-Klient-Chat und Fortschrittsansicht',es:'Chat coach-cliente y vista de progreso'}),
    ]},
  ];
  ov.innerHTML=`<div class="modal" style="max-height:88vh;display:flex;flex-direction:column;">
    <div class="modal-handle"></div>
    <div class="modal-title">Subscription</div>
    <div style="overflow-y:auto;display:grid;gap:10px;padding-bottom:8px;">
      ${plans.map(p=>`<div style="border:1px solid var(--border);background:var(--bg2);border-radius:12px;padding:14px;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px;">
          <div style="font-size:16px;font-weight:900;color:var(--accent);">${p.name}</div>
          <div style="font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;">${p.sub}</div>
        </div>
        ${p.items.map(it=>`<div style="font-size:13px;color:var(--text2);line-height:1.4;padding:5px 0;border-top:1px solid var(--border);">${it}</div>`).join('')}
      </div>`).join('')}
    </div>
    <div style="padding-top:12px;border-top:1px solid var(--border);">
      <button class="btn btn-primary" onclick="closeModal()" style="width:100%;">OK</button>
    </div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
  document.body.appendChild(ov);S.modal=ov;
}
window.openSubscriptionModal=openSubscriptionModal;

function openProfilePlaceholder(title,body){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${title}</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:18px;">${body}</div>
    <button class="btn btn-primary" onclick="closeModal()" style="width:100%;">OK</button>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
  document.body.appendChild(ov);S.modal=ov;
}
window.openProfilePlaceholderContact=()=>openProfilePlaceholder('Contact',tt({pl:'Sekcja Contact zostanie dodana później.',en:'Contact will be added later.',de:'Kontakt wird später hinzugefügt.',es:'Contact se añadirá más tarde.'}));
window.openProfilePlaceholderWhatsNew=()=>openProfilePlaceholder("What's new",tt({pl:'Tutaj będzie opis zmian z ostatniego update.',en:'Latest update notes will live here.',de:'Hier erscheinen die letzten Update-Notizen.',es:'Aquí estarán las notas del último update.'}));
window.openProfilePlaceholderPrivacy=()=>openProfilePlaceholder('Privacy Policy',tt({pl:'Privacy Policy zostanie dodana później.',en:'Privacy Policy will be added later.',de:'Privacy Policy wird später hinzugefügt.',es:'Privacy Policy se añadirá más tarde.'}));

function renderNotifications(){
  const el=document.getElementById('notificationsContent');
  if(!el)return;
  cleanupNotifications();
  const items=[];
  const chatItems=ld('bs-notifications-v1',[]).slice(0,3);
  chatItems.forEach(n=>items.push({
    id:n.id||'',
    type:n.type||'',
    invitationId:n.invitationId||'',
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
  const updates=ld('bs-admin-changelog-v1',[]).slice(0,3);
  if(isAdmin()){
    updates.forEach(u=>items.push({
      title:u.message||'Auto update',
      body:tt({pl:'Wpis z changeloga admina.',en:'Admin changelog entry.',de:'Admin-Changelog-Eintrag.',es:'Entrada del changelog admin.'}),
      at:u.at,
      action:"showScreen('profile')",
    }));
  }
  if(!items.length){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Brak powiadomień.',en:'No notifications.',de:'Keine Benachrichtigungen.',es:'Sin notificaciones.'})}</div>`;
    markLocalNotificationsRead(chatItems);
    return;
  }
  const fmt=iso=>{try{return iso?new Date(iso).toLocaleString():'';}catch(e){return '';}};
  el.innerHTML=items.slice(0,3).map(item=>{
    const click=item.id?`openNotificationItem('${chatEsc(item.id)}')`:(item.action||'');
    return `<div class="client-card" onclick="${click}">
    <div style="width:38px;height:38px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" width="18" height="18"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    </div>
    <div class="client-card-info">
      <div class="client-card-name">${chatEsc(item.title)}</div>
      <div class="client-card-meta">${chatEsc(item.body)}</div>
      ${item.at?`<div class="client-card-meta" style="margin-top:3px;color:var(--text3);">${fmt(item.at)}</div>`:''}
    </div>
  </div>`;
  }).join('');
  markLocalNotificationsRead(chatItems);
}

function openNotificationItem(id){
  const entries=ld('bs-notifications-v1',[]);
  const item=entries.find(n=>n.id===id);
  if(id){
    sv('bs-notifications-v1',entries.filter(n=>n.id!==id));
    updateNotificationBadge();
    renderNotifications();
  }
  if(item?.type==='chat_message'&&item.invitationId&&typeof openChatFromNotification==='function'){
    openChatFromNotification(item.invitationId);
    return;
  }
  if(item?.type==='friend_message'&&item.invitationId&&typeof openFriendChatFromNotification==='function'){
    openFriendChatFromNotification(item.invitationId);
    return;
  }
  if(item?.action){
    try{new Function(item.action)();}catch(e){console.warn('notification action failed',e);}
  }
}

function addAdminChangelogEntry(type,message){
  const entries=ld('bs-admin-changelog-v1',[]);
  entries.unshift({type,message,at:new Date().toISOString()});
  sv('bs-admin-changelog-v1',entries.slice(0,3));
  updateNotificationBadge();
}

async function manualHardRefresh(){
  if(location.protocol==='file:'){
    showSyncToast(tt({
      pl:'Hard refresh działa tylko z serwera, nie z pliku index.html.',
      en:'Hard refresh only works from a server, not from index.html file.',
      de:'Hard Refresh funktioniert nur vom Server, nicht aus index.html.',
      es:'Hard refresh solo funciona desde servidor, no desde index.html.'
    }),'error');
    return;
  }
  showSyncToast(tt({
    pl:'Pobieram świeże pliki z serwera...',
    en:'Fetching fresh files from server...',
    de:'Neue Dateien werden vom Server geladen...',
    es:'Descargando archivos nuevos del servidor...'
  }),'success');
  try{
    const coreAssets=['./','./index.html','./manifest.json','./styles.css','./i18n.js','./storage.js','./workouts.js','./supabase.js','./coach.js','./friends.js','./admin.js','./app.js','./sw.js'];
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(reg=>reg.update().catch(()=>{})));
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    await Promise.all(coreAssets.map(src=>fetch(src,{cache:'reload'}).catch(()=>null)));
    sessionStorage.setItem('bs-manual-hard-refresh','1');
    const url=new URL(location.href);
    url.searchParams.set('bs-refresh',Date.now().toString());
    location.replace(url.toString());
  }catch(e){
    console.warn('manualHardRefresh failed',e);
    showSyncToast(tt({
      pl:'Nie udało się wymusić odświeżenia.',
      en:'Could not force refresh.',
      de:'Aktualisierung konnte nicht erzwungen werden.',
      es:'No se pudo forzar la actualización.'
    }),'error');
  }
}
window.manualHardRefresh=manualHardRefresh;

function addAppNotification(entry){
  cleanupNotifications();
  const entries=ld('bs-notifications-v1',[]);
  const id=entry.id||`n_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  entries.unshift({...entry,id,read:entry.read===true,at:entry.at||new Date().toISOString()});
  sv('bs-notifications-v1',entries.slice(0,3));
  if(document.getElementById('screen-notifications')?.classList.contains('active'))renderNotifications();
  updateNotificationBadge();
}

function cleanupNotifications(){
  const entries=ld('bs-notifications-v1',[]);
  if(!entries.length)return [];
  const newest=entries.reduce((max,n)=>{
    const t=n.at?Date.parse(n.at):0;
    return Number.isFinite(t)&&t>max?t:max;
  },0);
  if(!newest||Date.now()-newest>24*60*60*1000){
    sv('bs-notifications-v1',[]);
    return [];
  }
  const trimmed=entries.slice(0,3);
  if(trimmed.length!==entries.length)sv('bs-notifications-v1',trimmed);
  return trimmed;
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
  const local=cleanupNotifications().filter(n=>!n.read).length;
  const pending=(S.pendingInvites||[]).length;
  return local+pending;
}

function updateNotificationBadge(){
  const btn=document.getElementById('mobileNotificationsBtn');
  if(!btn)return;
  btn.classList.toggle('has-notifications',getUnreadNotificationCount()>0);
}

window.openNotificationItem=openNotificationItem;

function toggleMobileFabMenu(){
  updateFabMenuVisibility();
  const open=document.body.classList.toggle('fab-open');
  document.getElementById('mobileFabBtn')?.setAttribute('aria-expanded',open?'true':'false');
}
function closeMobileFabMenu(){
  document.body.classList.remove('fab-open');
  document.getElementById('mobileFabBtn')?.setAttribute('aria-expanded','false');
}
function runFabAction(action){
  closeMobileFabMenu();
  if(action==='exercises'){showScreen('exercises');return;}
  if(action==='friends'){showScreen('friends');return;}
  if(action==='chat'){showScreen('chat');return;}
  if(action==='clients'){
    if(S.coachMode&&isCoachAllowed()){showScreen('clients');return;}
    showPaywall('coach');
    return;
  }
  if(action==='coach'){
    if(isPro()||S.coachMode){showScreen('coaches');return;}
    showPaywall('coach');
    return;
  }
}
function updateFabMenuVisibility(){
  const canCoach=!!(S.user&&(isPro()||S.coachMode));
  const canClients=!!(S.user&&S.coachMode&&isCoachAllowed());
  document.querySelectorAll('.fab-pro-only').forEach(el=>el.classList.toggle('is-hidden',!canCoach));
  document.querySelectorAll('.fab-coach-only').forEach(el=>el.classList.toggle('is-hidden',!canClients));
}
function openMoreMenu(){
  closeMobileFabMenu();
  closeModal();
  const items=[
    {label:t('calendar'),screen:'calendar',icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'},
    {label:t('exercises'),screen:'exercises',icon:'<path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><rect x="2" y="9" width="3" height="6" rx="0.5"/><rect x="19" y="9" width="3" height="6" rx="0.5"/><rect x="5" y="7" width="2" height="10" rx="0.5"/><rect x="17" y="7" width="2" height="10" rx="0.5"/>'},
    {label:t('programs'),screen:'programs',icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/>'},
    {label:t('templates'),screen:'templates',icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>'},
    {label:t('profile'),screen:'profile',icon:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>'},
  ];
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;">
      <div class="modal-title" style="margin-bottom:0;">${t('more')}</div>
      <button class="rm-btn" onclick="closeModal()" style="width:34px;height:34px;font-size:18px;">✕</button>
    </div>
    ${items.map(item=>`<div onclick="closeModal();showScreen('${item.screen}')" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;border:1px solid var(--border);background:var(--bg3);margin-bottom:8px;">
      <span style="width:36px;height:36px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">${item.icon}</svg></span>
      <span style="font-size:15px;font-weight:700;">${item.label}</span>
    </div>`).join('')}
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
  document.body.appendChild(ov);S.modal=ov;
}
window.toggleMobileFabMenu=toggleMobileFabMenu;
window.closeMobileFabMenu=closeMobileFabMenu;
window.runFabAction=runFabAction;
window.updateFabMenuVisibility=updateFabMenuVisibility;
window.openMoreMenu=openMoreMenu;

function adminChangelogHtml(){
  const stored=ld('bs-admin-changelog-v1',[]);
  const entries=stored.slice(0,3);
  if(stored.length>3)sv('bs-admin-changelog-v1',entries);
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
      <div onclick="manualHardRefresh()" style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg2);cursor:pointer;transition:background 0.12s;" onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='var(--bg2)'" ontouchstart="this.style.background='var(--bg3)'" ontouchend="this.style.background='var(--bg2)'">
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
  applyTheme();
  renderSettings();
}

function openSettingsLayout(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const options=[
    {val:'minimal',label:tt({pl:'Minimal',en:'Minimal',de:'Minimal',es:'Minimal'}),desc:tt({pl:'Mniej skrótów na Home, spokojniejszy ekran.',en:'Fewer Home shortcuts, calmer screen.',de:'Weniger Home-Shortcuts, ruhigerer Bildschirm.',es:'Menos accesos en inicio.'})},
    {val:'standard',label:tt({pl:'Standard',en:'Standard',de:'Standard',es:'Estándar'}),desc:tt({pl:'Pełny Quick Access i dolny przycisk +.',en:'Full Quick Access and bottom + action.',de:'Voller Schnellzugriff und + Menü.',es:'Acceso completo y botón +.'})},
  ];
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${tt({pl:'Layout aplikacji',en:'App layout',de:'App-Layout',es:'Layout de app'})}</div>
    ${options.map(o=>`
      <div onclick="setLayoutMode('${o.val}')" style="display:flex;align-items:center;gap:14px;padding:14px 12px;border-radius:12px;cursor:pointer;background:${S.layoutMode===o.val?'var(--accent-dim)':'none'};border:1px solid ${S.layoutMode===o.val?'var(--accent)':'var(--border)'};margin-bottom:8px;transition:all 0.12s;">
        <span style="width:38px;height:38px;border-radius:10px;background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--accent);font-weight:800;">${o.val==='minimal'?'M':'+'}</span>
        <span style="flex:1;min-width:0;"><span style="display:block;font-size:15px;font-weight:700;color:${S.layoutMode===o.val?'var(--accent)':'var(--text)'};">${o.label}</span><span style="display:block;font-size:12px;color:var(--text2);margin-top:2px;">${o.desc}</span></span>
        ${S.layoutMode===o.val?'<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>`).join('')}
    <button class="btn btn-ghost" style="margin-top:8px;" onclick="closeModal()">${t('cancelTemplate')}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.openSettingsLayout=openSettingsLayout;
window.setLayoutMode=function(mode){
  S.layoutMode=mode==='minimal'?'minimal':'standard';
  saveAll();
  if(S.modal)closeModal();
  renderDashboard();
  renderSettings();
};

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
let _allowAppExit=false;
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

function openExitConfirmModal(){
  closeModal();
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="max-width:360px;">
    <div class="modal-title" style="margin-bottom:8px;">${tt({pl:'Wyjść z aplikacji?',en:'Exit app?',de:'App beenden?',es:'¿Salir de la app?'})}</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.45;margin-bottom:18px;">${tt({pl:'Czy na pewno chcesz wyjść?',en:'Are you sure you want to exit?',de:'Möchtest du die App wirklich beenden?',es:'¿Seguro que quieres salir?'})}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <button class="btn btn-ghost" onclick="closeModal();ensureBackTrap();">${tt({pl:'Nie',en:'No',de:'Nein',es:'No'})}</button>
      <button class="btn btn-primary" onclick="confirmExitApp()">${tt({pl:'Tak',en:'Yes',de:'Ja',es:'Sí'})}</button>
    </div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov){closeModal();ensureBackTrap();}});
  document.body.appendChild(ov);
  S.modal=ov;
}

function confirmExitApp(){
  closeModal();
  _allowAppExit=true;
  setTimeout(()=>{_allowAppExit=false;},1200);
  history.go(-999);
}

window.confirmExitApp=confirmExitApp;

let _lastBackOnWorkouts=0;
let _backTrapSeq=0;
function backTrapUrl(){
  _backTrapSeq+=1;
  return `${location.pathname}${location.search}#bs-back-${Date.now()}-${_backTrapSeq}`;
}

function ensureBackTrap(extra){
  if(_allowAppExit)return;
  try{history.pushState({bs:true,trap:true,...(extra||{})},'',backTrapUrl());}catch(e){}
}
window.ensureBackTrap=ensureBackTrap;

function runModalBackHandler(){
  if(!S.modal||typeof S.modal._backHandler!=='function')return false;
  try{
    const handled=S.modal._backHandler();
    return handled!==false;
  }catch(e){
    console.warn('modal back handler failed',e);
    return false;
  }
}
window.runModalBackHandler=runModalBackHandler;

function setupBackButton(){
  try{history.replaceState({bs:true,sentinel:true},'',`${location.pathname}${location.search}#bs-root`);}catch(e){}
  ensureBackTrap();
  window._bsHistoryReady=true;
  window.addEventListener('popstate',()=>{
    if(_allowAppExit)return;
    ensureBackTrap();
    // 1) Close detail modal
    if(S.detailModal){closeDetailModal();return;}
    // 2) Let complex modals consume Back before generic modal closing
    if(runModalBackHandler())return;
    // 3) Client detail subview -> return to client hub before leaving the coach/client context
    if(window._clientDetailData&&window._clientDetailView&&window._clientDetailView!=='hub'){
      renderClientHub();
      return;
    }
    // 4) User coach subview -> return to coach hub before leaving the Coach screen
    if(window._userCoachDetailInvId&&window._userCoachView&&window._userCoachView!=='hub'){
      window._bsHandlingBack=true;
      openUserCoachDetail(window._userCoachDetailInvId).finally(()=>{
        window._bsHandlingBack=false;
        ensureBackTrap({screen:'coaches',view:'user-coach-hub'});
      });
      return;
    }
    // 5) User coach hub -> return to the Coach list before leaving the Coach screen
    if(window._userCoachDetailInvId&&window._userCoachView==='hub'){
      window._bsHandlingBack=true;
      renderUserCoaches();
      window._bsHandlingBack=false;
      ensureBackTrap({screen:'coaches'});
      return;
    }
    // 6) Friend detail subview -> return to friend hub before closing the full-screen friend card
    if(S.modal&&window._friendDetailView&&window._friendDetailView!=='hub'){
      renderFriendHub();
      return;
    }
    // 7) Close any modal/popup
    if(S.modal){
      const returnScreen=S.modal._returnScreen;
      closeModal();
      if(returnScreen){
        window._bsHandlingBack=true;
        showScreen(returnScreen);
        window._bsHandlingBack=false;
      }
      return;
    }

    const active=document.querySelector('.screen.active')?.id?.replace('screen-','');

    // 8) Active workout — double-back asks for confirmation
    if(active==='workouts'&&S.activeWorkout){
      const now=Date.now();
      if(now-_lastBackOnWorkouts<2500){
        showWorkoutBackConfirm();
        return;
      }
      _lastBackOnWorkouts=now;
      showBackToast(tt({pl:'Wciśnij Wstecz ponownie, aby anulować trening',en:'Press Back again to cancel workout',de:'Erneut Zurück zum Abbrechen',es:'Presiona Atrás de nuevo para cancelar'}));
      return;
    }

    // 9) Any screen other than dashboard → go home
    if(active!=='dashboard'){
      window._bsHandlingBack=true;
      showScreen('dashboard');
      window._bsHandlingBack=false;
      return;
    }

    // 8) On dashboard — double-press to exit app
    const now=Date.now();
    if(now-_lastBackOnDash<2500){
      openExitConfirmModal();
      return;
    }
    _lastBackOnDash=now;
    showBackToast(tt({pl:'Wciśnij Wstecz ponownie, aby wyjść',en:'Press Back again to exit',de:'Erneut Zurück drücken zum Beenden',es:'Presiona Atrás otra vez para salir'}));
  });
}
setupBackButton();
setTimeout(updateNotificationBadge,0);

if(sessionStorage.getItem('bs-updated')==='1'){
  sessionStorage.removeItem('bs-updated');
  addAdminChangelogEntry('auto_update',tt({pl:'Auto update wykonany',en:'Auto update completed',de:'Auto update abgeschlossen',es:'Auto update completado'}));
  if(document.getElementById('screen-profile')?.classList.contains('active'))renderSettings();
  setTimeout(()=>showSyncToast(tt({pl:'Aplikacja została zaktualizowana.',en:'App has been updated.',de:'App wurde aktualisiert.',es:'La app se ha actualizado.'}),'success'),700);
}
if(sessionStorage.getItem('bs-manual-hard-refresh')==='1'){
  sessionStorage.removeItem('bs-manual-hard-refresh');
  addAdminChangelogEntry('manual_refresh',tt({pl:'Ręczny hard refresh wykonany',en:'Manual hard refresh completed',de:'Manueller Hard Refresh abgeschlossen',es:'Hard refresh manual completado'}));
  if(document.getElementById('screen-profile')?.classList.contains('active'))renderSettings();
  setTimeout(()=>showSyncToast(tt({pl:'Pobrano świeże pliki z serwera.',en:'Fresh files loaded from server.',de:'Neue Dateien vom Server geladen.',es:'Archivos nuevos cargados desde servidor.'}),'success'),700);
}
