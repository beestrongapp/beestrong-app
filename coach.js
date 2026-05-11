// ===== COACH MODE: Custom Programs Editor + Share/Import =====

// Generate a short, URL-safe random code (8 chars). Collisions theoretically possible
// but for ~36^8 = 2.8 trillion combinations, fine for our scale.
function generateShareCode(){
  return Math.random().toString(36).slice(2,10);
}

function openProgramEditor(programId){
  closeModal();
  const userPrograms=Array.isArray(S.programs)?S.programs:[];
  const orig=programId?userPrograms.find(p=>String(p.id)===String(programId)):null;
  // Working copy of the program (so user can cancel without saving)
  const draft={
    id:orig?orig.id:('p_'+Date.now()),
    builtin:false,
    shareCode:orig?(orig.shareCode||generateShareCode()):generateShareCode(),
    name:orig?(typeof orig.name==='object'?{...orig.name}:{en:orig.name||'',pl:orig.name||'',de:orig.name||'',es:orig.name||''}):{en:'',pl:'',de:'',es:''},
    short:orig?(typeof orig.short==='object'?{...orig.short}:{en:orig.short||'',pl:orig.short||'',de:orig.short||'',es:orig.short||''}):{en:'',pl:'',de:'',es:''},
    description:orig?(typeof orig.description==='object'?{...orig.description}:{en:orig.description||'',pl:orig.description||'',de:orig.description||'',es:orig.description||''}):{en:'',pl:'',de:'',es:''},
    level:orig?orig.level:'intermediate',
    duration:orig?(orig.duration||8):8,
    daysPerWeek:orig?(orig.daysPerWeek||3):3,
    types:orig?(orig.types||[]):[],
    templates:orig?JSON.parse(JSON.stringify(orig.templates||[])):[],
  };
  const isPL=lang==='pl';
  const ov=document.createElement('div');ov.className='modal-overlay';

  function render(){
    const lvlOptions=['beginner','intermediate','advanced'];
    const lvlLabels={
      beginner:tt({pl:'Początkujący',en:'Beginner',de:'Anfänger',es:'Principiante'}),
      intermediate:tt({pl:'Średniozaawansowany',en:'Intermediate',de:'Fortgeschritten',es:'Intermedio'}),
      advanced:tt({pl:'Zaawansowany',en:'Advanced',de:'Fortgeschritten+',es:'Avanzado'}),
    };
    const tplsHtml=draft.templates.map((tp,ti)=>`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <div style="font-size:14px;font-weight:700;flex:1;">${tp.name||tt({pl:'Bez nazwy',en:'Untitled',de:'Unbenannt',es:'Sin nombre'})}</div>
        <button class="btn btn-sm btn-ghost" onclick="window.peEditTpl(${ti})" style="font-size:11px;padding:6px 10px;">✎</button>
        <button class="btn btn-sm btn-danger" onclick="window.peRmTpl(${ti})" style="font-size:11px;padding:6px 10px;">🗑</button>
      </div>
      <div style="font-size:12px;color:var(--text3);">${(tp.exercises||[]).length} ${t('exExercises')} · ${t('exRest')} ${tp.restDefault||90}s</div>
    </div>`).join('');

    ov.innerHTML=`<div class="modal" style="max-height:94dvh;display:flex;flex-direction:column;">
      <div class="modal-handle"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;">
        <div class="modal-title" style="margin-bottom:0;">${orig?tt({pl:'Edytuj program',en:'Edit program',de:'Programm bearbeiten',es:'Editar programa'}):tt({pl:'Nowy program',en:'New program',de:'Neues Programm',es:'Nuevo programa'})}</div>
        <button class="rm-btn" onclick="closeModal()" style="width:34px;height:34px;font-size:18px;">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1;min-height:0;padding-right:4px;">
        <label class="form-label">${tt({pl:'Nazwa programu',en:'Program name',de:'Programmname',es:'Nombre del programa'})}</label>
        <input type="text" id="peName" value="${(draft.name[lang]||draft.name.en||'').replace(/"/g,'&quot;')}" placeholder="np. Push Pull Legs 8 tyg" style="margin-bottom:14px;"/>
        <label class="form-label">${tt({pl:'Krótki opis',en:'Short description',de:'Kurzbeschreibung',es:'Descripción corta'})}</label>
        <input type="text" id="peShort" value="${(draft.short[lang]||draft.short.en||'').replace(/"/g,'&quot;')}" placeholder="np. 4 dni / tydzień" style="margin-bottom:14px;"/>
        <label class="form-label">${tt({pl:'Pełny opis',en:'Full description',de:'Vollständige Beschreibung',es:'Descripción completa'})}</label>
        <textarea id="peDesc" rows="3" style="width:100%;padding:10px;font-size:14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;margin-bottom:14px;resize:vertical;" placeholder="${tt({pl:'Dla kogo, jak wygląda progresja, na co uważać.',en:'Who it is for, how progression works, what to watch out for.',de:'Für wen, wie läuft die Progression, worauf achten.',es:'Para quién, cómo es la progresión, qué tener en cuenta.'})}">${(draft.description[lang]||draft.description.en||'').replace(/</g,'&lt;')}</textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
          <div>
            <label class="form-label">${tt({pl:'Poziom',en:'Level',de:'Niveau',es:'Nivel'})}</label>
            <select id="peLevel" style="width:100%;padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:14px;">
              ${lvlOptions.map(l=>`<option value="${l}" ${l===draft.level?'selected':''}>${lvlLabels[l]}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">${tt({pl:'Tygodni',en:'Weeks',de:'Wochen',es:'Semanas'})}</label>
            <input type="number" id="peDuration" value="${draft.duration}" min="1" max="52" style="width:100%;"/>
          </div>
          <div>
            <label class="form-label">${tt({pl:'Dni / tydz.',en:'Days / wk',de:'Tage / Wo.',es:'Días / sem.'})}</label>
            <input type="number" id="peDays" value="${draft.daysPerWeek}" min="1" max="7" style="width:100%;"/>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px;">
          <div style="font-size:13px;color:var(--text2);font-weight:700;">${tt({pl:'Treningi w programie',en:'Workouts in program',de:'Workouts im Programm',es:'Entrenamientos en el programa'})} (${draft.templates.length})</div>
          <button class="btn btn-sm btn-ghost" onclick="window.peAddTpl()" style="font-size:12px;padding:7px 12px;">+ ${tt({pl:'Dodaj trening',en:'Add workout',de:'Training hinzufügen',es:'Añadir entrenamiento'})}</button>
        </div>
        ${tplsHtml||`<div style="font-size:12px;color:var(--text3);text-align:center;padding:18px;background:var(--bg3);border-radius:10px;">${tt({pl:'Brak treningów. Kliknij "Dodaj trening".',en:'No workouts yet. Click "Add workout".',de:'Noch keine Workouts. Klicke auf "Training hinzufügen".',es:'Sin entrenamientos. Haz clic en "Añadir entrenamiento".'})}</div>`}
        ${draft.shareCode?`<div style="margin-top:18px;font-size:11px;color:var(--text3);background:var(--bg3);border:1px dashed var(--border2);border-radius:8px;padding:10px 12px;">
          <div style="font-weight:600;margin-bottom:4px;">${tt({pl:'Kod udostępnienia',en:'Share code',de:'Teilen-Code',es:'Código para compartir'})}</div>
          <code style="color:var(--accent);font-size:13px;">${draft.shareCode}</code>
          <div style="margin-top:4px;color:var(--text3);">${tt({pl:'Po zapisaniu możesz wysłać klientom link.',en:'After save you can send the link to clients.',de:'Nach dem Speichern kannst du Kunden den Link senden.',es:'Después de guardar puedes enviar el enlace a los clientes.'})}</div>
        </div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
        <button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button>
        <button class="btn btn-primary" onclick="window.peSave()">${t('saveTemplate')}</button>
      </div>
    </div>`;
  }

  document.body.appendChild(ov);S.modal=ov;
  ov._backHandler=()=>{closeModal();return true;};
  render();

  // Read input fields back into draft (called before re-render or save)
  function syncFromInputs(){
    const n=document.getElementById('peName');
    const s=document.getElementById('peShort');
    const d=document.getElementById('peDesc');
    const l=document.getElementById('peLevel');
    const du=document.getElementById('peDuration');
    const dd=document.getElementById('peDays');
    if(n){const v=n.value.trim();draft.name[lang]=v;if(!draft.name.en)draft.name.en=v;if(!draft.name.pl)draft.name.pl=v;if(!draft.name.de)draft.name.de=v;if(!draft.name.es)draft.name.es=v;}
    if(s){const v=s.value.trim();draft.short[lang]=v;if(!draft.short.en)draft.short.en=v;}
    if(d){const v=d.value;draft.description[lang]=v;if(!draft.description.en)draft.description.en=v;}
    if(l)draft.level=l.value;
    if(du)draft.duration=Math.max(1,Math.min(52,+du.value||8));
    if(dd)draft.daysPerWeek=Math.max(1,Math.min(7,+dd.value||3));
  }

  window.peAddTpl=()=>{
    syncFromInputs();
    openProgramTplEditor(draft,null,()=>render());
  };
  window.peEditTpl=ti=>{
    syncFromInputs();
    openProgramTplEditor(draft,ti,()=>render());
  };
  window.peRmTpl=ti=>{
    if(!confirm(tt({pl:'Usunąć ten trening z programu?',en:'Remove this workout from the program?',de:'Dieses Workout aus dem Programm entfernen?',es:'¿Eliminar este entrenamiento del programa?'})))return;
    syncFromInputs();
    draft.templates.splice(ti,1);
    render();
  };
  window.peSave=()=>{
    syncFromInputs();
    if(!draft.name[lang]&&!draft.name.en){
      alert(tt({pl:'Wpisz nazwę programu.',en:'Enter a program name.',de:'Programmnamen eingeben.',es:'Introduce un nombre.'}));
      return;
    }
    if(!draft.templates.length){
      if(!confirm(tt({pl:'Program nie ma żadnego treningu. Zapisać mimo to?',en:'Program has no workouts. Save anyway?',de:'Programm hat keine Workouts. Trotzdem speichern?',es:'El programa no tiene entrenamientos. ¿Guardar igualmente?'})))return;
    }
    if(!Array.isArray(S.programs))S.programs=[];
    if(orig){
      const idx=S.programs.findIndex(p=>String(p.id)===String(orig.id));
      if(idx>=0)S.programs[idx]=draft;
      else S.programs.push(draft);
    } else {
      S.programs.push(draft);
    }
    saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
    closeModal();
    renderPrograms();
  };
}
window.openProgramEditor=openProgramEditor;

// Mini-editor for one template inside a program (name + restDefault + exercise picker reuse)
function openProgramTplEditor(draftProgram,tplIdx,onClose){
  // tplIdx may be null (new) or index in draftProgram.templates
  const isNew=tplIdx===null||tplIdx===undefined;
  const orig=isNew?null:draftProgram.templates[tplIdx];
  const tpl={
    name:orig?orig.name:'',
    types:orig?(orig.types||[]):[],
    restDefault:orig?(orig.restDefault||S.defaultRest||90):(S.defaultRest||90),
    exercises:orig?JSON.parse(JSON.stringify(orig.exercises||[])):[],
  };
  // Stash parent modal state so picker can swap and restore
  const parentModal=S.modal;
  S.modal=null;
  closeModal();

  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.style.zIndex='220'; // above program editor (default 200)

  function exRowsHtml(){
    return tpl.exercises.map((e,ei)=>`<div style="background:var(--bg3);border-radius:10px;padding:10px 12px;margin-bottom:6px;display:grid;grid-template-columns:1fr 60px 60px 60px 30px;gap:6px;align-items:center;">
      <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.sup?'<span style="color:#7ec77e;font-weight:700;font-size:10px;">SS </span>':''}${exName(e)}</div>
      <input type="number" value="${e.sets||3}" min="1" max="20" onchange="window.ptUpd(${ei},'sets',this.value)" style="font-size:12px;padding:6px 4px;text-align:center;"/>
      <input type="number" value="${e.reps||10}" min="1" max="100" onchange="window.ptUpd(${ei},'reps',this.value)" style="font-size:12px;padding:6px 4px;text-align:center;"/>
      <input type="number" value="${e.weight||0}" min="0" step="0.5" onchange="window.ptUpd(${ei},'weight',this.value)" style="font-size:12px;padding:6px 4px;text-align:center;"/>
      <button class="rm-btn" onclick="window.ptRm(${ei})" style="width:28px;height:28px;font-size:14px;">✕</button>
    </div>`).join('');
  }

  function render(){
    ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
      <div class="modal-handle"></div>
      <div class="modal-title">${isNew?tt({pl:'Nowy trening',en:'New workout',de:'Neues Workout',es:'Nuevo entrenamiento'}):tt({pl:'Edytuj trening',en:'Edit workout',de:'Workout bearbeiten',es:'Editar entrenamiento'})}</div>
      <label class="form-label">${tt({pl:'Nazwa treningu',en:'Workout name',de:'Workout-Name',es:'Nombre del entrenamiento'})}</label>
      <input type="text" id="ptName" value="${(tpl.name||'').replace(/"/g,'&quot;')}" placeholder="Push A / Lower B itp." style="margin-bottom:12px;"/>
      <label class="form-label">${tt({pl:'Domyślny rest (s)',en:'Default rest (s)',de:'Standardpause (s)',es:'Descanso por defecto (s)'})}</label>
      <input type="number" id="ptRest" value="${tpl.restDefault}" min="10" max="600" step="5" style="margin-bottom:14px;"/>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-size:12px;color:var(--text2);font-weight:700;">${tt({pl:'Ćwiczenia',en:'Exercises',de:'Übungen',es:'Ejercicios'})} (${tpl.exercises.length})</div>
        <button class="btn btn-sm btn-ghost" onclick="window.ptAddEx()" style="font-size:12px;padding:6px 12px;">+ ${tt({pl:'Dodaj',en:'Add',de:'Hinzufügen',es:'Añadir'})}</button>
      </div>
      <div style="overflow-y:auto;flex:1;min-height:0;padding-right:4px;">
        <div style="display:grid;grid-template-columns:1fr 60px 60px 60px 30px;gap:6px;margin-bottom:6px;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;font-weight:700;text-align:center;padding:0 4px;">
          <div style="text-align:left;">${tt({pl:'Ćwiczenie',en:'Exercise',de:'Übung',es:'Ejercicio'})}</div><div>${t('sets')}</div><div>${t('reps')}</div><div>${t('kg')}</div><div></div>
        </div>
        ${exRowsHtml()}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
        <button class="btn btn-ghost" onclick="window.ptCancel()">${t('cancelTemplate')}</button>
        <button class="btn btn-primary" onclick="window.ptSave()">${t('saveTemplate')}</button>
      </div>
    </div>`;
  }

  document.body.appendChild(ov);S.modal=ov;
  ov._backHandler=()=>{window.ptCancel();return true;};
  render();

  function syncFromInputs(){
    const n=document.getElementById('ptName');const r=document.getElementById('ptRest');
    if(n)tpl.name=n.value.trim();
    if(r)tpl.restDefault=Math.max(10,Math.min(600,+r.value||90));
  }
  window.ptUpd=(ei,field,val)=>{
    const v=+val||0;
    if(tpl.exercises[ei])tpl.exercises[ei][field]=v;
  };
  window.ptRm=ei=>{
    syncFromInputs();
    tpl.exercises.splice(ei,1);
    render();
  };
  window.ptAddEx=()=>{
    syncFromInputs();
    // Reuse the exercise picker; it already supports passing existing selection
    closeModal();
    showExPicker(tpl.exercises.map(e=>({...e})),picked=>{
      // Replace exercises with what came back
      tpl.exercises=picked.map(e=>({
        ...e,
        sets:e.sets||3,
        reps:e.reps||10,
        weight:e.weight||0,
        sup:e.sup||false,
      }));
      // Restore this modal
      document.body.appendChild(ov);S.modal=ov;
      render();
    });
  };
  window.ptCancel=()=>{
    closeModal();
    // Restore parent program editor modal
    if(parentModal){document.body.appendChild(parentModal);S.modal=parentModal;}
    if(typeof onClose==='function')onClose();
  };
  window.ptSave=()=>{
    syncFromInputs();
    if(!tpl.name){
      alert(tt({pl:'Wpisz nazwę treningu.',en:'Enter a workout name.',de:'Workout-Namen eingeben.',es:'Introduce un nombre.'}));
      return;
    }
    if(isNew){
      draftProgram.templates.push(tpl);
    } else {
      draftProgram.templates[tplIdx]=tpl;
    }
    closeModal();
    if(parentModal){document.body.appendChild(parentModal);S.modal=parentModal;}
    if(typeof onClose==='function')onClose();
  };
}

window.deleteProgram=function(pid){
  if(!confirm(tt({pl:'Usunąć ten program?',en:'Delete this program?',de:'Dieses Programm löschen?',es:'¿Eliminar este programa?'})))return;
  S.programs=(S.programs||[]).filter(p=>String(p.id)!==String(pid));
  saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
  _expandedProgramId=null;
  renderPrograms();
};

window.shareProgram=async function(pid){
  const userPrograms=Array.isArray(S.programs)?S.programs:[];
  const p=userPrograms.find(x=>String(x.id)===String(pid));
  if(!p)return;
  // Ensure shareCode exists
  if(!p.shareCode){p.shareCode=generateShareCode();saveAll();}
  // To make the link work for clients, the program must be in Supabase (so they can fetch).
  // If user is signed in, push (best-effort) and notify.
  let pushed=false;
  if(sb&&S.user){
    try{
      const{error}=await sb.from('programs').upsert({
        owner_id:S.user.id,
        share_code:p.shareCode,
        name:typeof p.name==='object'?p.name:{en:p.name||'',pl:p.name||''},
        short:typeof p.short==='object'?p.short:null,
        description:typeof p.description==='object'?p.description:null,
        level:p.level||null,
        duration_weeks:p.duration||8,
        days_per_week:p.daysPerWeek||3,
        types:Array.isArray(p.types)?p.types:[],
        templates:p.templates||[],
      },{onConflict:'share_code'});
      if(!error)pushed=true;
    }catch(e){console.warn('share upsert failed',e);}
  }
  const url=`${location.origin}/?p=${p.shareCode}`;
  // Try clipboard, fall back to a modal showing the URL
  try{
    await navigator.clipboard.writeText(url);
    showSyncToast(tt({pl:'Link skopiowany ✓',en:'Link copied ✓',de:'Link kopiert ✓',es:'Enlace copiado ✓'}),'success');
  }catch(e){
    // Fallback: show modal with URL the user can manually copy
    const ov=document.createElement('div');ov.className='modal-overlay';
    ov.innerHTML=`<div class="modal" style="text-align:center;">
      <div class="modal-handle"></div>
      <div class="modal-title">${tt({pl:'Link do programu',en:'Program link',de:'Programm-Link',es:'Enlace del programa'})}</div>
      <input type="text" value="${url}" readonly onclick="this.select()" style="margin:14px 0;font-size:12px;text-align:center;"/>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px;">${tt({pl:'Skopiuj i wyślij klientowi.',en:'Copy and send to your client.',de:'Kopiere und sende an den Kunden.',es:'Copia y envía a tu cliente.'})}</div>
      <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>
    </div>`;
    closeModal();
    document.body.appendChild(ov);S.modal=ov;
  }
  if(!pushed&&S.user){
    setTimeout(()=>showSyncToast(tt({pl:'⚠ Wyślij dane do chmury (Konto → Wyślij), żeby link działał',en:'⚠ Upload data to cloud (Account → Upload) for the link to work',de:'⚠ Daten in Cloud hochladen, damit der Link funktioniert',es:'⚠ Sube los datos a la nube para que el enlace funcione'}),'error'),2900);
  }
  if(!S.user){
    setTimeout(()=>showSyncToast(tt({pl:'⚠ Zaloguj się, aby link działał dla klientów',en:'⚠ Sign in for the link to work for clients',de:'⚠ Melde dich an, damit der Link für Kunden funktioniert',es:'⚠ Inicia sesión para que el enlace funcione'}),'error'),2900);
  }
};

// Detect ?p=<code> on page load and offer to import the program
async function checkUrlForSharedProgram(){
  if(!sb)return;
  const params=new URLSearchParams(location.search);
  const code=params.get('p');
  if(!code)return;
  // Strip the param from URL so refresh doesn't re-trigger
  try{
    const url=new URL(location.href);
    url.searchParams.delete('p');
    history.replaceState(history.state,'',url.toString());
  }catch(e){}
  try{
    const{data,error}=await sb.from('programs').select('*').eq('share_code',code).limit(1).maybeSingle();
    if(error||!data){
      showSyncToast(tt({pl:'Nie znaleziono programu',en:'Program not found',de:'Programm nicht gefunden',es:'Programa no encontrado'}),'error');
      return;
    }
    // Already in our list?
    const exists=(S.programs||[]).some(p=>p.shareCode===code);
    if(exists){
      showSyncToast(tt({pl:'Ten program już masz',en:'You already have this program',de:'Du hast dieses Programm bereits',es:'Ya tienes este programa'}));
      return;
    }
    showImportProgramModal(data);
  }catch(e){
    console.warn('checkUrlForSharedProgram error',e);
  }
}

function showImportProgramModal(remoteProgram){
  closeModal();
  const p=remoteProgram;
  const pName=(typeof p.name==='object'?(p.name[lang]||p.name.en||p.name.pl):p.name)||'(?)';
  const pShort=(typeof p.short==='object'?(p.short[lang]||p.short.en||p.short.pl):p.short)||'';
  const tplCount=(p.templates||[]).length;
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="text-align:center;padding:24px 22px;">
    <div class="modal-handle"></div>
    <div style="font-size:36px;margin-bottom:6px;">📋</div>
    <div style="font-size:18px;font-weight:700;margin-bottom:6px;">${tt({pl:'Zaimportować program?',en:'Import this program?',de:'Programm importieren?',es:'¿Importar este programa?'})}</div>
    <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${pName}</div>
    ${pShort?`<div style="font-size:13px;color:var(--text2);margin-bottom:6px;">${pShort}</div>`:''}
    <div style="font-size:12px;color:var(--text3);margin-bottom:18px;">${tplCount} ${t('exExercises')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
      <button class="btn btn-primary" id="confirmImport">${tt({pl:'Zaimportuj',en:'Import',de:'Importieren',es:'Importar'})}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
  document.getElementById('confirmImport').onclick=()=>{
    const newP={
      id:p.id||('p_'+Date.now()),
      builtin:false,
      shareCode:p.share_code,
      name:p.name||{en:pName,pl:pName,de:pName,es:pName},
      short:p.short||null,
      description:p.description||null,
      level:p.level||'intermediate',
      duration:p.duration_weeks||8,
      daysPerWeek:p.days_per_week||3,
      types:Array.isArray(p.types)?p.types:[],
      templates:p.templates||[],
    };
    if(!Array.isArray(S.programs))S.programs=[];
    S.programs.push(newP);
    saveAll();
    closeModal();
    showSyncToast(tt({pl:'Program zaimportowany ✓',en:'Program imported ✓',de:'Programm importiert ✓',es:'Programa importado ✓'}),'success');
    showScreen('programs');
    renderPrograms();
  };
}

// ===== COACH MODE — FAZA 5 =====

function updateCoachNav(){
  const show=S.coachMode&&S.user&&isCoachAllowed();
  document.querySelectorAll('.coach-nav-item').forEach(el=>{
    el.style.display=show?'flex':'none';
  });
  // If we're on clients screen but coach mode turned off, go to dashboard
  if(!show&&document.getElementById('screen-clients')?.classList.contains('active')){
    showScreen('dashboard');
  }
}

function updateProCoachNav(){
  const show=!!(S.isPro&&S.user);
  document.querySelectorAll('.pro-coach-nav-item').forEach(el=>{
    el.style.display=show?'flex':'none';
  });
  if(!show&&document.getElementById('screen-coaches')?.classList.contains('active')){
    showScreen('dashboard');
  }
}

async function upsertProfile(){
  if(!sb||!S.user)return;
  const metaName=(S.user.name||'').trim();
  const localName=(localStorage.getItem('bs-username')||'').trim();
  const pendingName=(localStorage.getItem('bs-pending-name')||'').trim();
  if(pendingName)localStorage.removeItem('bs-pending-name');
  const name=metaName||localName||pendingName||null;
  if(name){
    localStorage.setItem('bs-username',name);
    const unEl=document.getElementById('sidebarUserName');if(unEl)unEl.textContent=name;
  }
  await sb.from('profiles').upsert({id:S.user.id,email:S.user.email,display_name:name},{onConflict:'id'});
}

async function syncProfileFlags(){
  if(!sb||!S.user)return;
  const {data,error}=await sb.from('profiles').select('is_pro,is_coach,display_name').eq('id',S.user.id).single();
  if(error||!data)return;
  let changed=false;
  const newIsPro=!!data.is_pro;
  if(newIsPro!==S.isPro){S.isPro=newIsPro;changed=true;}
  if(data.is_coach){
    const email=(S.user.email||'').toLowerCase().trim();
    if(!COACH_WHITELIST.map(e=>e.toLowerCase()).includes(email)){COACH_WHITELIST.push(S.user.email);}
    if(!S.coachMode){S.coachMode=true;changed=true;}
  }
  if(data.display_name&&!localStorage.getItem('bs-username')){
    localStorage.setItem('bs-username',data.display_name);
    const unEl=document.getElementById('sidebarUserName');if(unEl)unEl.textContent=data.display_name;
    applyLang();
  }
  if(changed){saveAll();updateCoachNav();updateProCoachNav();updateAdminNav();renderAccountBadge();renderSettings();}
}

// ── CLIENT SCREEN ──────────────────────────────────────────

function renderClients(){
  const el=document.getElementById('clientsContent');
  if(!el)return;
  const bottomBack=`<div class="screen-bottom-back"><button class="btn btn-primary" onclick="showScreen('dashboard')">${t('backBtn')}</button></div>`;
  if(!S.user){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby zarządzać klientami.',en:'Sign in to manage clients.',de:'Melde dich an, um Klienten zu verwalten.',es:'Inicia sesión para gestionar clientes.'})}</div>${bottomBack}`;
    return;
  }
  if(!S.coachMode||!isCoachAllowed()){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Coach Mode nie jest aktywny.',en:'Coach Mode is not active.',de:'Coach-Modus ist nicht aktiv.',es:'El modo entrenador no está activo.'})}</div>${bottomBack}`;
    return;
  }
  el.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  loadClientsFromCloud().then(invitations=>{
    if(!invitations){el.innerHTML=`<div class="empty-state">${tt({pl:'Błąd ładowania klientów.',en:'Error loading clients.',de:'Fehler beim Laden.',es:'Error al cargar.'})}</div>${bottomBack}`;return;}
    if(!invitations.length){
      el.innerHTML=`<div class="empty-state">${tt({pl:'Brak klientów. Zaproś pierwszego klikając +.',en:'No clients yet. Invite one by tapping +.',de:'Noch keine Klienten. Tippe + um einzuladen.',es:'Sin clientes aún. Pulsa + para invitar.'})}</div>${bottomBack}`;
      return;
    }
    window._clientInvitations=invitations;
    el.innerHTML=`<div style="margin-bottom:14px;"><input type="text" id="clientSearch" placeholder="${tt({pl:'Szukaj po imieniu lub mailu...',en:'Search by name or email...',de:'Nach Name oder E-Mail suchen...',es:'Buscar por nombre o email...'})}" oninput="filterClients()" style="font-size:14px;"/></div><div id="clientList"></div>${bottomBack}`;
    renderClientList(window._clientInvitations);
  });
}

async function renderUserCoaches(){
  stopCoachChatRealtime();
  window._userCoachDetailInvId=null;
  window._userCoachView=null;
  const el=document.getElementById('coachesContent');
  if(!el)return;
  if(!S.user){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby zobaczyć swojego coacha.',en:'Sign in to see your coach.',de:'Melde dich an, um deinen Coach zu sehen.',es:'Inicia sesión para ver tu coach.'})}</div>`;
    return;
  }
  if(!S.isPro){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zakładka Coach jest dostępna dla użytkowników Pro.',en:'Coach tab is available for Pro users.',de:'Coach ist für Pro-Nutzer verfügbar.',es:'Coach está disponible para usuarios Pro.'})}</div>`;
    return;
  }
  if(!sb){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Supabase nie jest dostępny.',en:'Supabase is not available.',de:'Supabase ist nicht verfügbar.',es:'Supabase no está disponible.'})}</div>`;
    return;
  }
  el.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  try{
    const email=(S.user.email||'').toLowerCase();
    const[byId,byEmail]=await Promise.all([
      sb.from('coach_invitations').select('*').eq('client_user_id',S.user.id).eq('status','accepted').order('responded_at',{ascending:false}),
      sb.from('coach_invitations').select('*').eq('client_email',email).eq('status','accepted').order('responded_at',{ascending:false}),
    ]);
    if(byId.error)throw byId.error;
    if(byEmail.error)throw byEmail.error;
    const byInviteId=new Map([...(byId.data||[]),...(byEmail.data||[])].map(inv=>[inv.id,inv]));
    const coaches=[...byInviteId.values()];
    if(!coaches.length){
      el.innerHTML=`<div class="empty-state">${tt({pl:'Nie masz jeszcze przypisanego coacha.',en:'You do not have an assigned coach yet.',de:'Du hast noch keinen zugewiesenen Coach.',es:'Aún no tienes coach asignado.'})}</div>`;
      return;
    }
    el.innerHTML=coaches.map(inv=>userCoachCardHtml(inv)).join('');
  }catch(e){
    el.innerHTML=`<div style="color:var(--red);padding:12px;">${e.message||tt({pl:'Nie udało się pobrać coacha.',en:'Could not load coach.',de:'Coach konnte nicht geladen werden.',es:'No se pudo cargar el coach.'})}</div>`;
  }
}

function userCoachCardHtml(inv){
  const name=inv.coach_name||inv.coach_email||'Coach';
  const meta=inv.coach_name&&inv.coach_email?inv.coach_email:tt({pl:'Twój coach',en:'Your coach',de:'Dein Coach',es:'Tu coach'});
  return `<div class="client-card" onclick="openUserCoachDetail('${inv.id}')">
    <div style="width:38px;height:38px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--btn-text);flex-shrink:0;">${(name||'?')[0].toUpperCase()}</div>
    <div class="client-card-info">
      <div class="client-card-name">${name}</div>
      <div class="client-card-meta">${meta}</div>
    </div>
    <span style="color:var(--text3);font-size:22px;">›</span>
  </div>`;
}

async function openUserCoachDetail(invId){
  closeModal();
  stopCoachChatRealtime();
  window._userCoachDetailInvId=invId;
  window._userCoachView='hub';
  const el=document.getElementById('coachesContent');
  if(!el)return;
  el.innerHTML=`<div id="userCoachDetailContent" style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  try{
    const{data:inv,error}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
    if(error||!inv)throw error||new Error('not found');
    renderUserCoachHub(inv);
  }catch(e){
    document.getElementById('userCoachDetailContent').innerHTML=`<div style="padding:20px;text-align:center;color:var(--red);">${tt({pl:'Nie udało się pobrać danych coacha.',en:'Could not load coach data.',de:'Coach-Daten konnten nicht geladen werden.',es:'No se pudieron cargar los datos del coach.'})}<br><br><button class="btn btn-ghost" onclick="renderUserCoaches()">OK</button></div>`;
  }
}

function userCoachHeader(inv,title,sub,backAction){
  const coachName=inv?.coach_name||inv?.coach_email||'Coach';
  const back=backAction||'renderUserCoaches()';
  return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:16px;">
    <div>
      <button class="modal-back" onclick="${back}" style="margin-bottom:8px;">${t('backBtn')}</button>
      <div class="modal-title" style="margin-bottom:4px;">${title||coachName}</div>
      <div style="font-size:12px;color:var(--text2);">${sub||inv?.coach_email||''}</div>
    </div>
  </div>`;
}

function renderUserCoachHub(inv){
  const content=document.getElementById('userCoachDetailContent');
  if(!content)return;
  window._userCoachDetailInvId=inv.id;
  window._userCoachView='hub';
  const coachName=inv.coach_name||inv.coach_email||'Coach';
  content.style.display='block';
  content.style.padding='0';
  content.innerHTML=`
    ${userCoachHeader(inv,coachName,inv.coach_email||'','renderUserCoaches()')}
    <div class="quick-access-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:10px;">
      ${clientHubTile(`renderUserCoachChat('${inv.id}')`,'Chat','<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>')}
      ${clientHubTile(`renderUserCoachPayments('${inv.id}')`,tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'}),'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>')}
      ${clientHubTile(`renderUserCoachCheckin('${inv.id}')`,'Check-in','<polyline points="20 6 9 17 4 12"/>')}
      ${clientHubTile(`renderUserCoachNotes('${inv.id}')`,tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'}),'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>')}
    </div>`;
}

function filterClients(){
  const q=(document.getElementById('clientSearch')?.value||'').toLowerCase().trim();
  const filtered=(window._clientInvitations||[]).filter(inv=>{
    const name=(inv.client_display_name||'').toLowerCase();
    const email=(inv.client_email||'').toLowerCase();
    return name.includes(q)||email.includes(q);
  });
  renderClientList(filtered);
}

function renderClientList(invitations){
  const el=document.getElementById('clientList');
  if(!el)return;
  if(!invitations.length){
    el.innerHTML=`<div style="text-align:center;color:var(--text3);padding:32px;">${tt({pl:'Brak klientów',en:'No clients found',de:'Keine Klienten',es:'Sin clientes'})}</div>`;
    return;
  }
  const pending=invitations.filter(i=>i.status==='pending');
  const accepted=invitations.filter(i=>i.status==='accepted');
  const declined=invitations.filter(i=>i.status==='declined');
  let html='';
  const sectionHdr=(lbl)=>`<div class="section-label" style="margin-top:16px;">${lbl}</div>`;
  if(accepted.length){
    html+=sectionHdr(tt({pl:'Aktywni',en:'Active',de:'Aktiv',es:'Activos'}));
    html+=accepted.map(inv=>clientCardHtml(inv)).join('');
  }
  if(pending.length){
    html+=sectionHdr(tt({pl:'Oczekujące zaproszenia',en:'Pending invitations',de:'Ausstehende Einladungen',es:'Invitaciones pendientes'}));
    html+=pending.map(inv=>clientCardHtml(inv)).join('');
  }
  if(declined.length){
    html+=sectionHdr(tt({pl:'Odrzucone',en:'Declined',de:'Abgelehnt',es:'Rechazados'}));
    html+=declined.map(inv=>clientCardHtml(inv)).join('');
  }
  el.innerHTML=html;
}

function clientCardHtml(inv){
  const statusLabel={
    pending:tt({pl:'Oczekuje',en:'Pending',de:'Ausstehend',es:'Pendiente'}),
    accepted:tt({pl:'Aktywny',en:'Active',de:'Aktiv',es:'Activo'}),
    declined:tt({pl:'Odrzucono',en:'Declined',de:'Abgelehnt',es:'Rechazado'}),
  }[inv.status]||inv.status;
  const clickable=inv.status==='accepted';
  const name=inv.client_display_name||inv.client_email||'—';
  const meta=inv.client_display_name&&inv.client_email
    ? inv.client_email
    : `${tt({pl:'Zaproszono',en:'Invited',de:'Eingeladen',es:'Invitado'})}: ${inv.created_at?new Date(inv.created_at).toLocaleDateString():''}`;
  return `<div class="client-card" onclick="${clickable?`openClientDetail('${inv.id}')`:''}" style="${clickable?'':'cursor:default;'}">
    <div style="width:38px;height:38px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--btn-text);flex-shrink:0;">${(name||'?')[0].toUpperCase()}</div>
    <div class="client-card-info">
      <div class="client-card-name">${name}</div>
      <div class="client-card-meta">${meta}</div>
    </div>
    <span class="client-status-badge client-status-${inv.status}">${statusLabel}</span>
    ${inv.status==='pending'?`<button class="btn btn-ghost" style="padding:4px 10px;font-size:12px;margin-left:4px;" onclick="event.stopPropagation();cancelInvitation('${inv.id}')">✕</button>`:''}
  </div>`;
}

async function loadClientsFromCloud(){
  if(!sb||!S.user)return null;
  try{
    const{data,error}=await sb.from('coach_invitations')
      .select('*')
      .eq('coach_id',S.user.id)
      .order('created_at',{ascending:false});
    if(error)throw error;
    const invitations=data||[];
    const clientIds=[...new Set(invitations.map(inv=>inv.client_user_id).filter(Boolean))];
    if(clientIds.length){
      const{data:profiles,error:profilesError}=await sb.from('profiles')
        .select('id,email,display_name')
        .in('id',clientIds);
      if(!profilesError&&profiles){
        const byId=new Map(profiles.map(p=>[p.id,p]));
        invitations.forEach(inv=>{
          const profile=byId.get(inv.client_user_id);
          if(profile){
            inv.client_display_name=profile.display_name||null;
            inv.client_email=inv.client_email||profile.email;
          }
        });
      }
    }
    return invitations;
  }catch(e){
    console.error('loadClientsFromCloud',e);
    return null;
  }
}

// ── ADD CLIENT INVITE ──────────────────────────────────────

function openAddClientInvite(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${tt({pl:'Zaproś klienta',en:'Invite client',de:'Klient einladen',es:'Invitar cliente'})}</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px;">${tt({pl:'Wpisz email klienta zarejestrowanego w BeeStrong.',en:'Enter the email of a BeeStrong-registered client.',de:'Gib die E-Mail eines registrierten Klienten ein.',es:'Introduce el email de un cliente registrado en BeeStrong.'})}</div>
    <input type="email" id="inviteEmailInput" placeholder="email@example.com" style="margin-bottom:16px;" />
    <div id="inviteError" style="color:var(--red);font-size:13px;margin-bottom:10px;display:none;"></div>
    <button class="btn btn-primary" id="inviteSendBtn" onclick="sendCoachInvitation()">${tt({pl:'Wyślij zaproszenie',en:'Send invitation',de:'Einladung senden',es:'Enviar invitación'})}</button>
    <button class="btn btn-ghost" style="margin-top:8px;" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
  setTimeout(()=>document.getElementById('inviteEmailInput')?.focus(),300);
}
window.openAddClientInvite=openAddClientInvite;

async function sendCoachInvitation(){
  const emailEl=document.getElementById('inviteEmailInput');
  const errEl=document.getElementById('inviteError');
  const btn=document.getElementById('inviteSendBtn');
  if(!emailEl||!errEl||!btn)return;
  const email=(emailEl.value||'').trim().toLowerCase();
  if(!email||!email.includes('@')){
    errEl.textContent=tt({pl:'Podaj prawidłowy email.',en:'Enter a valid email.',de:'Gültige E-Mail eingeben.',es:'Introduce un email válido.'});
    errEl.style.display='block';return;
  }
  if(email===S.user?.email){
    errEl.textContent=tt({pl:'Nie możesz zaprosić siebie.',en:'You cannot invite yourself.',de:'Du kannst dich nicht selbst einladen.',es:'No puedes invitarte a ti mismo.'});
    errEl.style.display='block';return;
  }
  btn.disabled=true;
  btn.textContent=tt({pl:'Wysyłanie...',en:'Sending...',de:'Senden...',es:'Enviando...'});
  errEl.style.display='none';
  try{
    // Look up client UUID by email
    const{data:uid,error:lookupErr}=await sb.rpc('get_user_id_by_email',{lookup_email:email});
    if(lookupErr)throw lookupErr;
    if(!uid){
      errEl.textContent=tt({pl:'Nie znaleziono użytkownika z tym emailem.',en:'No BeeStrong user found with that email.',de:'Kein Nutzer mit dieser E-Mail gefunden.',es:'No se encontró ningún usuario con ese email.'});
      errEl.style.display='block';btn.disabled=false;btn.textContent=tt({pl:'Wyślij zaproszenie',en:'Send invitation',de:'Einladung senden',es:'Enviar invitación'});return;
    }
    // Check for existing pending/accepted invitation
    const{data:existing}=await sb.from('coach_invitations').select('id,status').eq('coach_id',S.user.id).eq('client_email',email).in('status',['pending','accepted']);
    if(existing&&existing.length){
      errEl.textContent=tt({pl:'Zaproszenie już istnieje.',en:'An invitation already exists for this client.',de:'Eine Einladung für diesen Klienten existiert bereits.',es:'Ya existe una invitación para este cliente.'});
      errEl.style.display='block';btn.disabled=false;btn.textContent=tt({pl:'Wyślij zaproszenie',en:'Send invitation',de:'Einladung senden',es:'Enviar invitación'});return;
    }
    const coachName=(localStorage.getItem('bs-username')||'').trim()||S.user.email;
    const{error:insErr}=await sb.from('coach_invitations').insert({
      coach_id:S.user.id,
      coach_email:S.user.email,
      coach_name:coachName,
      client_email:email,
      client_user_id:uid,
      status:'pending',
    });
    if(insErr)throw insErr;
    closeModal();
    showSyncToast(tt({pl:'Zaproszenie wysłane ✓',en:'Invitation sent ✓',de:'Einladung gesendet ✓',es:'Invitación enviada ✓'}),'success');
    renderClients();
  }catch(e){
    errEl.textContent=e.message||tt({pl:'Błąd wysyłania.',en:'Failed to send.',de:'Fehler beim Senden.',es:'Error al enviar.'});
    errEl.style.display='block';
    btn.disabled=false;btn.textContent=tt({pl:'Wyślij zaproszenie',en:'Send invitation',de:'Einladung senden',es:'Enviar invitación'});
  }
}
window.sendCoachInvitation=sendCoachInvitation;
window.filterClients=filterClients;

async function cancelInvitation(invId){
  if(!sb||!S.user)return;
  if(!confirm(tt({pl:'Anulować zaproszenie?',en:'Cancel this invitation?',de:'Einladung stornieren?',es:'¿Cancelar esta invitación?'})))return;
  await sb.from('coach_invitations').delete().eq('id',invId).eq('coach_id',S.user.id);
  renderClients();
}
window.cancelInvitation=cancelInvitation;

// ── CLIENT DETAIL ──────────────────────────────────────────

async function openClientDetail(invId){
  closeModal();
  window._clientDetailData=null;
  window._clientDetailView=null;
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.classList.add('client-detail-overlay');
  ov.innerHTML=`<div class="modal client-detail-modal">
    <div id="clientDetailContent" style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>
  </div>`;
  ov._cleanup=()=>{stopCoachChatRealtime();window._clientDetailData=null;window._clientDetailView=null;};
  ov._backHandler=()=>{
    if(window._clientDetailData&&window._clientDetailView&&window._clientDetailView!=='hub'){
      renderClientHub();
      return true;
    }
    closeModal();
    return true;
  };
  document.body.appendChild(ov);S.modal=ov;

  try{
    const{data:inv,error:invErr}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
    if(invErr||!inv)throw invErr||new Error('not found');
    const clientId=inv.client_user_id;
    if(!clientId)throw new Error('no client id');

    const[profileRes,woRes,mRes,assignedRes]=await Promise.all([
      sb.from('profiles').select('id,email,display_name').eq('id',clientId).maybeSingle(),
      sb.from('workouts').select('*').eq('user_id',clientId).order('date',{ascending:false}),
      sb.from('measurements').select('*').eq('user_id',clientId).order('date',{ascending:false}),
      sb.from('coach_program_assignments').select('*').eq('client_user_id',clientId).eq('status','active'),
    ]);

    window._clientDetailData={
      inv,
      clientId,
      profile:profileRes.data||null,
      workouts:woRes.data||[],
      measurements:mRes.data||[],
      assigned:assignedRes.data||[],
    };
    renderClientHub();
  }catch(e){
    document.getElementById('clientDetailContent').innerHTML=`<div style="padding:20px;text-align:center;color:var(--red);">${tt({pl:'Nie udało się pobrać danych klienta.',en:'Could not load client data.',de:'Kundendaten konnten nicht geladen werden.',es:'No se pudieron cargar los datos del cliente.'})}<br><br><button class="btn btn-ghost" onclick="closeModal()">OK</button></div>`;
  }
}
window.openClientDetail=openClientDetail;

function clientDetailName(ctx){
  return ctx?.profile?.display_name||ctx?.inv?.client_display_name||ctx?.inv?.client_email||'Client';
}

function clientDetailHeader(title,sub,back){
  const backBtn=back?`<button class="modal-back client-detail-back-top" onclick="renderClientHub()" style="margin-bottom:8px;">${t('backBtn')}</button>`:'';
  const bottomBack=back===true?`<div class="client-detail-bottom-back"><button class="btn btn-primary" onclick="renderClientHub()">${t('backBtn')}</button></div>`:'';
  return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:16px;">
    <div>
      ${backBtn}
      <div class="modal-title" style="margin-bottom:4px;">${title}</div>
      ${sub?`<div style="font-size:12px;color:var(--text2);">${sub}</div>`:''}
    </div>
    <button class="rm-btn" onclick="closeModal()" style="width:34px;height:34px;font-size:18px;">✕</button>
  </div>${bottomBack}`;
}

function renderClientHub(){
  const ctx=window._clientDetailData;
  const el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='hub';
  el.style.display='block';
  el.style.padding='0';
  const name=clientDetailName(ctx);
  const lastWeight=ctx.measurements.find(m=>m.weight_kg!=null);
  el.innerHTML=clientDetailHeader(name,ctx.inv.client_email||'',false)+`
    <div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:18px;">
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Treningi',en:'Workouts',de:'Trainings',es:'Entrenos'})}</span></div><div class="stat-value">${ctx.workouts.length}</div><div class="stat-unit">${tt({pl:'łącznie',en:'total',de:'gesamt',es:'total'})}</div></div>
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${t('objetosc')}</span></div><div class="stat-value">${fmtVol(ctx.workouts.reduce((a,w)=>a+(+(w.volume_kg||0)),0))}</div><div class="stat-unit">${unitVol()}</div></div>
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Waga',en:'Weight',de:'Gewicht',es:'Peso'})}</span></div><div class="stat-value">${lastWeight?dispW(+lastWeight.weight_kg):'—'}</div><div class="stat-unit">${unitW()}</div></div>
    </div>
    <div class="quick-access-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
      ${clientHubTile('renderClientWorkoutsView()',t('workout'),'<path d="M6 4v16M18 4v16M3 12h18M3 7h3M18 7h3M3 17h3M18 17h3"/>')}
      ${clientHubTile('renderClientProgressView()',t('progress'),'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>')}
      ${clientHubTile('renderClientMeasurementsView()',tt({pl:'Pomiary',en:'Measurements',de:'Messungen',es:'Medidas'}),'<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="4"/>')}
      ${clientHubTile('renderClientChatPlaceholder()',tt({pl:'Chat',en:'Chat',de:'Chat',es:'Chat'}),'<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>')}
      ${clientHubTile('renderCoachNotesView()',tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'}),'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>')}
      ${clientHubTile('renderCoachPaymentsView()',tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'}),'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>')}
    </div>
    ${renderClientAssignments(ctx)}
    <button class="btn btn-ghost" style="margin-top:20px;width:100%;" onclick="closeModal()">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>`;
}

function clientHubTile(action,label,svg){
  return `<div class="qa-tile" onclick="${action}">
    <div class="qa-tile-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">${svg}</svg></div>
    <div class="qa-tile-label">${label}</div>
  </div>`;
}

function renderClientAssignments(ctx){
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;margin-bottom:10px;">
    <div class="section-label" style="margin:0;">${tt({pl:'Przypisane plany',en:'Assigned plans',de:'Zugewiesene Pläne',es:'Planes asignados'})}</div>
    <button class="btn btn-sm btn-primary" style="font-size:12px;padding:7px 14px;" onclick="openAssignProgramModal('${ctx.inv.id}','${ctx.clientId}')">+ ${tt({pl:'Przypisz',en:'Assign',de:'Zuweisen',es:'Asignar'})}</button>
  </div>`;
  if(ctx.assigned.length){
    html+=ctx.assigned.map(a=>`
      <div style="background:var(--bg3);border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${a.program_name}</div><div style="font-size:11px;color:var(--text3);">${a.assignment_type||'program'}${a.start_date?' · '+a.start_date:''}</div></div>
        <div style="font-size:11px;color:var(--text3);">${a.assigned_at?new Date(a.assigned_at).toLocaleDateString():''}</div>
        <button class="btn btn-sm btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="openAssignProgramModal('${ctx.inv.id}','${ctx.clientId}','${a.id}')">${tt({pl:'Edit',en:'Edit',de:'Bearbeiten',es:'Editar'})}</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--red);font-size:11px;padding:4px 10px;" onclick="removeCoachAssignment('${a.id}',this)">${tt({pl:'Usuń',en:'Remove',de:'Entfernen',es:'Quitar'})}</button>
      </div>`).join('');
  } else {
    html+=`<div style="font-size:13px;color:var(--text3);padding:8px 0;">${tt({pl:'Brak przypisanych planów.',en:'No plans assigned yet.',de:'Noch keine Pläne zugewiesen.',es:'Aún no hay planes asignados.'})}</div>`;
  }
  return html;
}

function remoteWorkoutName(w){
  if(w.name_key)return t(w.name_key)||w.name||'Workout';
  return w.name||'Workout';
}

function renderClientWorkoutsView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='workouts';
  el.style.display='block';
  el.style.padding='0';
  let html=clientDetailHeader(t('workout'),clientDetailName(ctx),true);
  if(!ctx.workouts.length){
    el.innerHTML=html+`<div class="empty-state">${tt({pl:'Brak treningów.',en:'No workouts yet.',de:'Noch keine Trainings.',es:'Sin entrenamientos.'})}</div>`;
    return;
  }
  html+=ctx.workouts.map((w,i)=>{
    const[y,m,d]=(w.date||'').split('-');
    return `<div class="workout-row" onclick="renderClientWorkoutDetail(${i})">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${remoteWorkoutName(w)}</div><div class="workout-row-meta">${d?`${d}.${m}.${y}`:''}${w.duration_min?` · ${w.duration_min} min`:''} · ${fmtVol(+(w.volume_kg||0))}${unitVol()}</div></div>
      <div>${typeTagHtml(w.types)}</div>
    </div>`;
  }).join('');
  el.innerHTML=html;
}

function renderClientWorkoutDetail(idx){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='workout-detail';
  el.style.display='block';
  el.style.padding='0';
  const w=ctx.workouts[idx];
  if(!w){renderClientWorkoutsView();return;}
  const[y,m,d]=(w.date||'').split('-');
  let html=clientDetailHeader(remoteWorkoutName(w),`${d?`${d}.${m}.${y}`:''}${w.duration_min?` · ${w.duration_min} min`:''} · ${fmtVol(+(w.volume_kg||0))}${unitVol()}`,true);
  html+=`<div class="summary-grid">
    <div class="metric-card"><div class="metric-label">${t('time')}</div><div class="metric-value">${w.duration_min||0}</div><div class="stat-unit">${t('minutes')}</div></div>
    <div class="metric-card"><div class="metric-label">${t('volume')}</div><div class="metric-value">${fmtVol(+(w.volume_kg||0))}</div><div class="stat-unit">${unitVol()}</div></div>
  </div>`;
  const exercises=Array.isArray(w.exercises)?w.exercises:[];
  html+=exercises.length?exercises.map(ex=>{
    const sets=(ex.sets||[]).filter(s=>s.done!==false);
    return `<div class="ex-card">
      <div class="ex-card-header"><div style="font-size:15px;font-weight:700;">${exName(ex)||ex.name||''}</div></div>
      ${sets.length?sets.map((s,si)=>`<div style="display:grid;grid-template-columns:34px 1fr 1fr;gap:8px;padding:8px 0;border-top:1px solid var(--border);font-size:13px;align-items:center;">
        <div style="color:var(--text3);">#${si+1}</div>
        <div>${s.reps||0} ${t('reps')}</div>
        <div style="text-align:right;font-weight:700;">${dispW(+(s.weight||0))}${unitW()}</div>
      </div>`).join(''):`<div style="font-size:13px;color:var(--text3);">${t('noData')}</div>`}
    </div>`;
  }).join(''):`<div class="empty-state">${t('noData')}</div>`;
  el.innerHTML=html;
}

async function renderClientMeasurementsView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='measurements';
  el.style.display='block';
  el.style.padding='0';
  let html=clientDetailHeader(tt({pl:'Pomiary',en:'Measurements',de:'Messungen',es:'Medidas'}),clientDetailName(ctx),true);
  let checkins=[];
  if(sb){
    try{
      const{data}=await sb.from('coach_checkins').select('*').eq('invitation_id',ctx.inv.id).order('created_at',{ascending:false});
      checkins=data||[];
    }catch(e){}
  }
  if(checkins.length){
    const types=(typeof MEASURE_TYPES!=='undefined'?MEASURE_TYPES:[
      {key:'weight_k'},{key:'chest_m'},{key:'waist'},{key:'hips'},{key:'arm'},{key:'thigh'}
    ]);
    html+=`<div class="section-label">${tt({pl:'Check-in od klienta',en:'Client check-ins',de:'Client Check-ins',es:'Check-ins del cliente'})}</div>`;
    html+=checkins.slice(0,6).map(c=>{
      const rec=c.measurement_data||{};
      const parts=types.filter(mt=>rec[mt.key]!=null).map(mt=>`${t(mt.key)}: <strong>${dispMeas(mt.key,+rec[mt.key])}${unitMeas(mt.key)}</strong>`);
      return `<div style="padding:12px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <div style="font-size:12px;color:var(--text2);margin-bottom:5px;">${formatIsoDate(c.measurement_date)} · ${c.created_at?new Date(c.created_at).toLocaleDateString():''}</div>
        <div style="line-height:1.7;">${parts.join(' · ')||t('noData')}</div>
      </div>`;
    }).join('');
    html+=`<div class="section-label" style="margin-top:18px;">${tt({pl:'Wszystkie pomiary',en:'All measurements',de:'Alle Messungen',es:'Todas las medidas'})}</div>`;
  }
  if(!ctx.measurements.length){
    el.innerHTML=html+`<div class="empty-state">${t('noMeasures')}</div>`;
    return;
  }
  html+=ctx.measurements.map(m=>{
    const parts=[];
    if(m.weight_kg!=null)parts.push(`${tt({pl:'Waga',en:'Weight',de:'Gewicht',es:'Peso'})}: <strong>${dispW(+m.weight_kg)}${unitW()}</strong>`);
    if(m.chest_cm!=null)parts.push(`${t('chest_m')}: <strong>${dispL(+m.chest_cm)}${unitL()}</strong>`);
    if(m.waist_cm!=null)parts.push(`${t('waist')}: <strong>${dispL(+m.waist_cm)}${unitL()}</strong>`);
    if(m.hips_cm!=null)parts.push(`${t('hips')}: <strong>${dispL(+m.hips_cm)}${unitL()}</strong>`);
    if(m.arm_cm!=null)parts.push(`${t('arm')}: <strong>${dispL(+m.arm_cm)}${unitL()}</strong>`);
    if(m.thigh_cm!=null)parts.push(`${t('thigh')}: <strong>${dispL(+m.thigh_cm)}${unitL()}</strong>`);
    const[y,mo,d]=(m.date||'').split('-');
    return `<div style="padding:12px 0;border-bottom:1px solid var(--border);font-size:13px;">
      <div style="font-size:12px;color:var(--text2);margin-bottom:5px;">${d?`${d}.${mo}.${y}`:''}</div>
      <div style="line-height:1.7;">${parts.join(' · ')||t('noData')}</div>
    </div>`;
  }).join('');
  el.innerHTML=html;
}

function renderClientProgressView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='progress';
  el.style.display='block';
  el.style.padding='0';
  const workouts=ctx.workouts||[];
  let html=clientDetailHeader(t('progress'),clientDetailName(ctx),true);
  if(!workouts.length){
    el.innerHTML=html+`<div class="empty-state">${t('noData')}</div>`;
    return;
  }
  const totalVolume=workouts.reduce((a,w)=>a+(+(w.volume_kg||0)),0);
  const best=workouts.reduce((b,w)=>(+(w.volume_kg||0)>+(b?.volume_kg||0)?w:b),workouts[0]);
  const exMap={};
  workouts.forEach(w=>(w.exercises||[]).forEach(ex=>{
    const name=exName(ex)||ex.name||'Exercise';
    if(!exMap[name])exMap[name]={name,count:0,volume:0,bestWeight:0};
    exMap[name].count+=1;
    (ex.sets||[]).forEach(s=>{
      const weight=+(s.weight||0),reps=+(s.reps||0);
      exMap[name].volume+=weight*reps;
      if(weight>exMap[name].bestWeight)exMap[name].bestWeight=weight;
    });
  }));
  const top=Object.values(exMap).sort((a,b)=>b.volume-a.volume).slice(0,5);
  html+=`<div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:18px;">
    <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Treningi',en:'Workouts',de:'Trainings',es:'Entrenos'})}</span></div><div class="stat-value">${workouts.length}</div><div class="stat-unit">${tt({pl:'łącznie',en:'total',de:'gesamt',es:'total'})}</div></div>
    <div class="stat-card"><div class="stat-top"><span class="stat-label">${t('volume')}</span></div><div class="stat-value">${fmtVol(totalVolume)}</div><div class="stat-unit">${unitVol()}</div></div>
    <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Najlepszy',en:'Best',de:'Beste',es:'Mejor'})}</span></div><div class="stat-value">${fmtVol(+(best.volume_kg||0))}</div><div class="stat-unit">${unitVol()}</div></div>
  </div>
  <div class="section-label">${tt({pl:'Najczęściej obciążane ćwiczenia',en:'Top exercises by volume',de:'Top-Übungen nach Volumen',es:'Top ejercicios por volumen'})}</div>
  ${top.length?top.map(ex=>`<div class="workout-row" style="cursor:default;">
    <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div>
    <div class="workout-row-info"><div class="workout-row-name">${ex.name}</div><div class="workout-row-meta">${ex.count}× · ${fmtVol(ex.volume)}${unitVol()} · ${tt({pl:'max',en:'max',de:'max',es:'max'})} ${dispW(ex.bestWeight)}${unitW()}</div></div>
  </div>`).join(''):`<div class="empty-state">${t('noData')}</div>`}`;
  el.innerHTML=html;
}

function renderClientChatPlaceholder(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el)return;
  window._clientDetailView='chat';
  el.style.display='block';
  el.style.padding='0';
  renderCoachChat({
    inv:ctx.inv,
    containerId:'clientDetailContent',
    title:'Chat',
    subtitle:clientDetailName(ctx),
    backHtml:clientDetailHeader('Chat',clientDetailName(ctx),'top'),
    backAction:'renderClientHub()',
    inputId:'clientChatInput',
    listId:'clientChatMessages',
  });
}

function paymentStatusBadge(p,onclick){
  const paid=p.status==='paid';
  return `<button class="client-status-badge" onclick="${onclick||''}" style="border:none;cursor:${onclick?'pointer':'default'};background:${paid?'rgba(80,200,80,0.16)':'rgba(255,190,70,0.18)'};color:${paid?'#3db860':'#d89b17'};">${paid?'Paid':'Pending'}</button>`;
}

function addMonthsIso(dateStr,months){
  const[dY,dM,dD]=(dateStr||today()).split('-').map(Number);
  const d=new Date(dY,dM-1,dD||1);
  const day=d.getDate();
  d.setMonth(d.getMonth()+months);
  if(d.getDate()!==day)d.setDate(0);
  return d.toISOString().slice(0,10);
}

function formatIsoDate(iso){
  if(!iso)return '';
  const[y,m,d]=iso.split('-');
  return d&&m&&y?`${d}.${m}.${y}`:iso;
}

async function renderClientNotesView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el||!sb)return;
  window._clientDetailView='notes';
  el.style.display='block';
  el.style.padding='0';
  el.innerHTML=clientDetailHeader(tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'}),clientDetailName(ctx),true)+`<div style="display:flex;justify-content:center;padding:30px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('coach_client_notes').select('*').eq('invitation_id',ctx.inv.id).order('created_at',{ascending:false});
  if(error){
    el.innerHTML=clientDetailHeader(tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'}),clientDetailName(ctx),true)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const notes=data||[];
  el.innerHTML=clientDetailHeader(tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'}),clientDetailName(ctx),true)+
    (notes.length?notes.map(n=>`<div class="ex-card">
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px;">${n.created_at?new Date(n.created_at).toLocaleDateString():''}</div>
      <div style="font-size:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;">${chatEsc(n.note)}</div>
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Brak notatek od coacha.',en:'No coach notes yet.',de:'Noch keine Notizen.',es:'Sin notas.'})}</div>`);
}

async function renderClientPaymentsView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el||!sb)return;
  window._clientDetailView='payments';
  el.style.display='block';
  el.style.padding='0';
  el.innerHTML=clientDetailHeader(tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'}),clientDetailName(ctx),true)+`<div style="display:flex;justify-content:center;padding:30px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('coach_payments').select('*').eq('invitation_id',ctx.inv.id).order('due_date',{ascending:true});
  if(error){
    el.innerHTML=clientDetailHeader(tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'}),clientDetailName(ctx),true)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const rows=data||[];
  el.innerHTML=clientDetailHeader(tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'}),clientDetailName(ctx),true)+
    (rows.length?rows.map(p=>`<div class="workout-row" style="cursor:default;">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${formatIsoDate(p.due_date)}</div><div class="workout-row-meta">${p.paid_at?tt({pl:'Zapłacono',en:'Paid',de:'Bezahlt',es:'Pagado'})+': '+formatIsoDate((p.paid_at||'').slice(0,10)):tt({pl:'Oczekuje',en:'Pending',de:'Ausstehend',es:'Pendiente'})}</div></div>
      ${paymentStatusBadge(p)}
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Brak harmonogramu płatności.',en:'No payment schedule yet.',de:'Noch kein Zahlungsplan.',es:'Sin calendario de pagos.'})}</div>`);
}

async function renderCoachNotesView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el||!sb)return;
  window._clientDetailView='notes';
  el.style.display='block';
  el.style.padding='0';
  const title=tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'});
  el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`<div style="display:flex;justify-content:center;padding:30px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('coach_client_notes').select('*').eq('invitation_id',ctx.inv.id).order('created_at',{ascending:false});
  if(error){
    el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const notes=data||[];
  el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`
    <textarea id="coachNoteInput" rows="4" maxlength="4000" placeholder="${tt({pl:'Napisz notatkę dla klienta...',en:'Write a note for the client...',de:'Notiz für den Klienten schreiben...',es:'Escribe una nota para el cliente...'})}" style="resize:vertical;margin-bottom:10px;"></textarea>
    <button class="btn btn-primary" onclick="saveCoachClientNote()" style="width:100%;margin-bottom:18px;">${tt({pl:'Wyślij notatkę',en:'Send note',de:'Notiz senden',es:'Enviar nota'})}</button>
    ${notes.length?notes.map(n=>`<div class="ex-card">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;">
        <div style="font-size:12px;color:var(--text3);">${n.created_at?new Date(n.created_at).toLocaleDateString():''}</div>
        <button class="rm-btn" onclick="deleteCoachClientNote('${n.id}')" style="width:30px;height:30px;">✕</button>
      </div>
      <div style="font-size:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;">${chatEsc(n.note)}</div>
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Brak notatek.',en:'No notes yet.',de:'Keine Notizen.',es:'Sin notas.'})}</div>`}`;
}

async function saveCoachClientNote(){
  const ctx=window._clientDetailData;
  const note=(document.getElementById('coachNoteInput')?.value||'').trim();
  if(!ctx||!sb||!S.user||!note)return;
  const{error}=await sb.from('coach_client_notes').insert({
    invitation_id:ctx.inv.id,
    coach_id:S.user.id,
    client_user_id:ctx.clientId,
    note,
  });
  if(error)return showSyncToast(error.message,'error');
  showSyncToast(tt({pl:'Notatka wysłana ✓',en:'Note sent ✓',de:'Notiz gesendet ✓',es:'Nota enviada ✓'}),'success');
  renderCoachNotesView();
}

async function deleteCoachClientNote(noteId){
  if(!sb||!noteId)return;
  const{error}=await sb.from('coach_client_notes').delete().eq('id',noteId).eq('coach_id',S.user.id);
  if(error)return showSyncToast(error.message,'error');
  renderCoachNotesView();
}

async function renderCoachPaymentsView(){
  const ctx=window._clientDetailData,el=document.getElementById('clientDetailContent');
  if(!ctx||!el||!sb)return;
  window._clientDetailView='payments';
  el.style.display='block';
  el.style.padding='0';
  const title=tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'});
  el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`<div style="display:flex;justify-content:center;padding:30px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('coach_payments').select('*').eq('invitation_id',ctx.inv.id).order('due_date',{ascending:true});
  if(error){
    el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const rows=data||[];
  el.innerHTML=clientDetailHeader(title,clientDetailName(ctx),true)+`
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px;margin-bottom:14px;">
      <label class="form-label">${tt({pl:'Pierwsza płatność',en:'First payment',de:'Erste Zahlung',es:'Primer pago'})}</label>
      <input id="coachPaymentStartDate" type="date" value="${rows[0]?.due_date||today()}" style="margin-bottom:10px;">
      <button class="btn btn-primary" onclick="createClientPaymentSchedule()" style="width:100%;">${tt({pl:'Wygeneruj harmonogram',en:'Generate schedule',de:'Plan erstellen',es:'Generar calendario'})}</button>
    </div>
    ${rows.length?rows.map(p=>`<div class="workout-row" style="cursor:default;">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${formatIsoDate(p.due_date)}</div><div class="workout-row-meta">${p.paid_at?tt({pl:'Zapłacono',en:'Paid',de:'Bezahlt',es:'Pagado'})+': '+formatIsoDate((p.paid_at||'').slice(0,10)):tt({pl:'Oczekuje',en:'Pending',de:'Ausstehend',es:'Pendiente'})}</div></div>
      ${paymentStatusBadge(p,`toggleClientPaymentStatus('${p.id}','${p.status||'pending'}')`)}
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Wpisz pierwszą datę, żeby utworzyć harmonogram.',en:'Enter the first date to create a schedule.',de:'Erstes Datum eingeben.',es:'Introduce la primera fecha.'})}</div>`}`;
}

async function createClientPaymentSchedule(){
  const ctx=window._clientDetailData;
  const start=document.getElementById('coachPaymentStartDate')?.value;
  if(!ctx||!sb||!S.user||!start)return;
  const rows=Array.from({length:12},(_,i)=>({
    invitation_id:ctx.inv.id,
    coach_id:S.user.id,
    client_user_id:ctx.clientId,
    due_date:addMonthsIso(start,i),
    status:'pending',
  }));
  const{error}=await sb.from('coach_payments').upsert(rows,{onConflict:'invitation_id,due_date',ignoreDuplicates:true});
  if(error)return showSyncToast(error.message,'error');
  showSyncToast(tt({pl:'Harmonogram wygenerowany ✓',en:'Schedule generated ✓',de:'Plan erstellt ✓',es:'Calendario generado ✓'}),'success');
  renderCoachPaymentsView();
}

async function toggleClientPaymentStatus(paymentId,status){
  if(!sb||!paymentId)return;
  const next=status==='paid'?'pending':'paid';
  const{error}=await sb.from('coach_payments').update({status:next,paid_at:next==='paid'?new Date().toISOString():null}).eq('id',paymentId);
  if(error)return showSyncToast(error.message,'error');
  renderCoachPaymentsView();
}

window.renderClientHub=renderClientHub;
window.renderClientWorkoutsView=renderClientWorkoutsView;
window.renderClientWorkoutDetail=renderClientWorkoutDetail;
window.renderClientMeasurementsView=renderClientMeasurementsView;
window.renderClientProgressView=renderClientProgressView;
window.renderClientChatPlaceholder=renderClientChatPlaceholder;
window.renderClientNotesView=renderClientNotesView;
window.renderClientPaymentsView=renderClientPaymentsView;
window.renderCoachNotesView=renderCoachNotesView;
window.renderCoachPaymentsView=renderCoachPaymentsView;
window.saveCoachClientNote=saveCoachClientNote;
window.deleteCoachClientNote=deleteCoachClientNote;
window.createClientPaymentSchedule=createClientPaymentSchedule;
window.toggleClientPaymentStatus=toggleClientPaymentStatus;

let _coachChatChannel=null;
let _coachChatContext=null;
let _lastSeenChatMessageAt=ld('bs-chat-last-seen-v1',{});

function stopCoachChatRealtime(){
  if(_coachChatChannel&&sb){
    try{sb.removeChannel(_coachChatChannel);}catch(e){}
  }
  _coachChatChannel=null;
  _coachChatContext=null;
}

function chatEsc(v){
  return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function chatTime(iso){
  try{return new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}catch(e){return '';}
}

async function renderCoachChat(opts){
  if(!opts?.inv)return;
  stopCoachChatRealtime();
  const el=document.getElementById(opts.containerId);
  if(!el)return;
  el.style.display='block';
  el.style.padding='0';
  _coachChatContext=opts;
  const backAction=opts.backAction||'renderClientHub()';
  el.innerHTML=`${opts.backHtml||clientDetailHeader(opts.title||'Chat',opts.subtitle||'','top')}
    <div id="${opts.listId}" class="chat-messages coach-chat-messages"></div>
    <div class="chat-input-bar coach-chat-input-bar">
      <textarea id="${opts.inputId}" rows="1" maxlength="2000" placeholder="${tt({pl:'Napisz wiadomość...',en:'Write a message...',de:'Nachricht schreiben...',es:'Escribe un mensaje...'})}" style="min-height:44px;max-height:110px;resize:none;"></textarea>
      <button class="btn btn-primary" onclick="sendCoachChatMessage('${opts.inputId}')" style="width:auto;min-width:86px;height:44px;padding:0 16px;">${tt({pl:'Wyślij',en:'Send',de:'Senden',es:'Enviar'})}</button>
    </div>
    <div class="chat-bottom-actions">
      <button class="btn btn-ghost" onclick="clearCoachChat()">${tt({pl:'Clear chat',en:'Clear chat',de:'Chat löschen',es:'Limpiar chat'})}</button>
      <button class="btn btn-primary" onclick="${backAction}">${t('backBtn')}</button>
    </div>`;
  await loadCoachChatMessages();
  if(sb){
    _coachChatChannel=sb.channel('bs-chat-'+opts.inv.id)
      .on('postgres_changes',{event:'*',schema:'public',table:'coach_messages',filter:`invitation_id=eq.${opts.inv.id}`},()=>loadCoachChatMessages())
      .subscribe();
  }
  setTimeout(()=>document.getElementById(opts.inputId)?.focus(),150);
}

async function loadCoachChatMessages(){
  const ctx=_coachChatContext;
  if(!ctx||!sb)return;
  const list=document.getElementById(ctx.listId);
  if(!list)return;
  list.innerHTML=`<div style="display:flex;justify-content:center;padding:26px 0;"><div class="spinner"></div></div>`;
  const{data,error}=await sb.from('coach_messages')
    .select('id,sender_id,message,created_at')
    .eq('invitation_id',ctx.inv.id)
    .order('created_at',{ascending:true});
  if(error){
    list.innerHTML=`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const messages=data||[];
  if(!messages.length){
    list.innerHTML=`<div class="empty-state" style="padding:36px 16px;">${tt({pl:'Brak wiadomości. Zacznij rozmowę.',en:'No messages yet. Start the conversation.',de:'Noch keine Nachrichten.',es:'Sin mensajes todavía.'})}</div>`;
    return;
  }
  list.innerHTML=messages.map(m=>{
    const mine=m.sender_id===S.user?.id;
    return `<div style="display:flex;justify-content:${mine?'flex-end':'flex-start'};margin:8px 0;">
      <div style="max-width:78%;background:${mine?'var(--accent)':'var(--bg2)'};color:${mine?'var(--btn-text)':'var(--text)'};border:1px solid ${mine?'var(--accent)':'var(--border)'};border-radius:14px;padding:9px 11px;">
        <div style="font-size:14px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere;">${chatEsc(m.message)}</div>
        <div style="font-size:10px;opacity:0.65;text-align:right;margin-top:5px;">${chatTime(m.created_at)}</div>
      </div>
    </div>`;
  }).join('');
  list.scrollTop=list.scrollHeight;
  if(ctx.inv?.id){
    _lastSeenChatMessageAt[ctx.inv.id]=messages[messages.length-1]?.created_at||new Date().toISOString();
    sv('bs-chat-last-seen-v1',_lastSeenChatMessageAt);
  }
}

async function sendCoachChatMessage(inputId){
  const ctx=_coachChatContext;
  const input=document.getElementById(inputId);
  if(!ctx||!input||!sb||!S.user)return;
  const message=(input.value||'').trim();
  if(!message)return;
  input.disabled=true;
  const row={
    invitation_id:ctx.inv.id,
    coach_id:ctx.inv.coach_id,
    client_user_id:ctx.inv.client_user_id||S.user.id,
    sender_id:S.user.id,
    message,
  };
  const{error}=await sb.from('coach_messages').insert(row);
  input.disabled=false;
  if(error){
    showSyncToast(error.message,'error');
    input.focus();
    return;
  }
  input.value='';
  await loadCoachChatMessages();
  input.focus();
}

async function renderUserCoachChat(invId){
  const content=document.getElementById('userCoachDetailContent');
  if(!content||!sb)return;
  window._userCoachDetailInvId=invId;
  window._userCoachView='chat';
  content.style.display='block';
  content.style.padding='0';
  content.innerHTML=`<div style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  const{data:inv,error}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
  if(error||!inv){
    content.innerHTML=`<div style="color:var(--red);padding:16px;">${error?.message||'Chat unavailable'}</div>`;
    return;
  }
  const title=inv.coach_name||inv.coach_email||'Coach';
  renderCoachChat({
    inv,
    containerId:'userCoachDetailContent',
    title:'Chat',
    subtitle:title,
    backHtml:userCoachHeader(inv,'Chat',title,`openUserCoachDetail('${inv.id}')`),
    backAction:`openUserCoachDetail('${inv.id}')`,
    inputId:'userCoachChatInput',
    listId:'userCoachChatMessages',
  });
}

async function renderUserCoachPayments(invId){
  const content=document.getElementById('userCoachDetailContent');
  if(!content||!sb)return;
  window._userCoachDetailInvId=invId;
  window._userCoachView='payments';
  content.innerHTML=`<div style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  const{data:inv,error:invErr}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
  if(invErr||!inv){content.innerHTML=`<div style="color:var(--red);padding:16px;">${invErr?.message||'Payments unavailable'}</div>`;return;}
  const{data,error}=await sb.from('coach_payments').select('*').eq('invitation_id',invId).order('due_date',{ascending:true});
  const title=tt({pl:'Płatności',en:'Payments',de:'Zahlungen',es:'Pagos'});
  if(error){
    content.innerHTML=userCoachHeader(inv,title,inv.coach_name||inv.coach_email||'',`openUserCoachDetail('${inv.id}')`)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const rows=data||[];
  content.innerHTML=userCoachHeader(inv,title,inv.coach_name||inv.coach_email||'',`openUserCoachDetail('${inv.id}')`)+
    (rows.length?rows.map(p=>`<div class="workout-row" style="cursor:default;">
      <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg></div>
      <div class="workout-row-info"><div class="workout-row-name">${formatIsoDate(p.due_date)}</div><div class="workout-row-meta">${p.paid_at?tt({pl:'Zapłacono',en:'Paid',de:'Bezahlt',es:'Pagado'})+': '+formatIsoDate((p.paid_at||'').slice(0,10)):tt({pl:'Oczekuje',en:'Pending',de:'Ausstehend',es:'Pendiente'})}</div></div>
      ${paymentStatusBadge(p)}
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Coach nie dodał jeszcze harmonogramu płatności.',en:'Your coach has not added a payment schedule yet.',de:'Noch kein Zahlungsplan.',es:'Sin calendario de pagos.'})}</div>`);
}

async function renderUserCoachNotes(invId){
  const content=document.getElementById('userCoachDetailContent');
  if(!content||!sb)return;
  window._userCoachDetailInvId=invId;
  window._userCoachView='notes';
  content.innerHTML=`<div style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  const{data:inv,error:invErr}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
  if(invErr||!inv){content.innerHTML=`<div style="color:var(--red);padding:16px;">${invErr?.message||'Notes unavailable'}</div>`;return;}
  const{data,error}=await sb.from('coach_client_notes').select('*').eq('invitation_id',invId).order('created_at',{ascending:false});
  const title=tt({pl:'Notatki',en:'Notes',de:'Notizen',es:'Notas'});
  if(error){
    content.innerHTML=userCoachHeader(inv,title,inv.coach_name||inv.coach_email||'',`openUserCoachDetail('${inv.id}')`)+`<div style="color:var(--red);padding:14px;">${error.message}</div>`;
    return;
  }
  const notes=data||[];
  content.innerHTML=userCoachHeader(inv,title,inv.coach_name||inv.coach_email||'',`openUserCoachDetail('${inv.id}')`)+
    (notes.length?notes.map(n=>`<div class="ex-card">
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px;">${n.created_at?new Date(n.created_at).toLocaleDateString():''}</div>
      <div style="font-size:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;">${chatEsc(n.note)}</div>
    </div>`).join(''):`<div class="empty-state">${tt({pl:'Brak notatek od coacha.',en:'No coach notes yet.',de:'Noch keine Notizen.',es:'Sin notas.'})}</div>`);
}

function renderUserCoachCheckin(invId){
  const content=document.getElementById('userCoachDetailContent');
  if(!content)return;
  window._userCoachDetailInvId=invId;
  window._userCoachView='checkin';
  const measurements=Object.entries(S.measurements||{}).sort((a,b)=>String(b[0]).localeCompare(String(a[0])));
  content.innerHTML=`<div style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  sb.from('coach_invitations').select('*').eq('id',invId).single().then(({data:inv,error})=>{
    if(error||!inv){content.innerHTML=`<div style="color:var(--red);padding:16px;">${error?.message||'Check-in unavailable'}</div>`;return;}
    const title='Check-in';
    const types=(typeof MEASURE_TYPES!=='undefined'?MEASURE_TYPES:[
      {key:'weight_k'},{key:'chest_m'},{key:'waist'},{key:'hips'},{key:'arm'},{key:'thigh'}
    ]);
    content.innerHTML=userCoachHeader(inv,title,inv.coach_name||inv.coach_email||'',`openUserCoachDetail('${inv.id}')`)+
      (measurements.length?measurements.map(([date,m])=>{
        const parts=types.filter(mt=>m[mt.key]!=null).map(mt=>`${t(mt.key)}: ${dispMeas(mt.key,+m[mt.key])}${unitMeas(mt.key)}`);
        return `<div class="workout-row" onclick="sendCoachCheckin('${inv.id}','${date}')">
          <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div class="workout-row-info"><div class="workout-row-name">${formatIsoDate(date)}</div><div class="workout-row-meta">${parts.join(' · ')||t('noData')}</div></div>
        </div>`;
      }).join(''):`<div class="empty-state">${tt({pl:'Nie masz jeszcze pomiarów do wysłania.',en:'You have no measurements to send yet.',de:'Keine Messungen zum Senden.',es:'No tienes medidas para enviar.'})}</div>`);
  });
}

async function sendCoachCheckin(invId,date){
  if(!sb||!S.user)return;
  const m=S.measurements?.[date];
  if(!m)return;
  const{data:inv,error:invErr}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
  if(invErr||!inv)return showSyncToast(invErr?.message||'Check-in unavailable','error');
  const payload={
    invitation_id:inv.id,
    coach_id:inv.coach_id,
    client_user_id:S.user.id,
    measurement_date:date,
    measurement_data:m,
  };
  const{error}=await sb.from('coach_checkins').insert(payload);
  if(error)return showSyncToast(error.message,'error');
  showSyncToast(tt({pl:'Check-in wysłany do coacha ✓',en:'Check-in sent to coach ✓',de:'Check-in gesendet ✓',es:'Check-in enviado ✓'}),'success');
}

window.renderUserCoachChat=renderUserCoachChat;
window.renderUserCoachPayments=renderUserCoachPayments;
window.renderUserCoachNotes=renderUserCoachNotes;
window.renderUserCoachCheckin=renderUserCoachCheckin;
window.sendCoachCheckin=sendCoachCheckin;
window.sendCoachChatMessage=sendCoachChatMessage;

async function clearCoachChat(){
  const ctx=_coachChatContext;
  if(!ctx||!sb)return;
  if(!confirm(tt({pl:'Wyczyścić cały chat?',en:'Clear the whole chat?',de:'Gesamten Chat löschen?',es:'¿Limpiar todo el chat?'})))return;
  const{error}=await sb.from('coach_messages').delete().eq('invitation_id',ctx.inv.id);
  if(error){showSyncToast(error.message,'error');return;}
  await loadCoachChatMessages();
  showSyncToast(tt({pl:'Chat wyczyszczony',en:'Chat cleared',de:'Chat gelöscht',es:'Chat limpiado'}),'success');
}
window.clearCoachChat=clearCoachChat;

async function openChatFromNotification(invId){
  if(!invId||!sb)return showScreen('notifications');
  closeModal();
  const ov=document.createElement('div');
  ov.className='modal-overlay client-detail-overlay';
  ov.innerHTML=`<div class="modal client-detail-modal"><div id="notificationChatContent" style="display:flex;justify-content:center;padding:40px 0;"><div class="spinner"></div></div></div>`;
  ov._cleanup=()=>stopCoachChatRealtime();
  ov._returnScreen='notifications';
  document.body.appendChild(ov);
  S.modal=ov;
  if(window._bsHistoryReady&&!window._bsHandlingBack){
    if(typeof ensureBackTrap==='function')ensureBackTrap({modal:'notification-chat'});
    else history.pushState({bs:true,modal:'notification-chat'},'','');
  }
  const{data:inv,error}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
  if(error||!inv){
    document.getElementById('notificationChatContent').innerHTML=`<div style="color:var(--red);padding:16px;">${chatEsc(error?.message||'Chat unavailable')}</div>`;
    return;
  }
  const otherName=S.user?.id===inv.coach_id
    ? (inv.client_name||inv.client_email||'Client')
    : (inv.coach_name||inv.coach_email||'Coach');
  const header=`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:16px;">
    <div>
      <button class="modal-back" onclick="closeModal();showScreen('notifications')" style="margin-bottom:8px;">${t('backBtn')}</button>
      <div class="modal-title" style="margin-bottom:4px;">Chat</div>
      <div style="font-size:12px;color:var(--text2);">${chatEsc(otherName)}</div>
    </div>
    <button class="rm-btn" onclick="closeModal()" style="width:34px;height:34px;font-size:18px;">✕</button>
  </div>`;
  renderCoachChat({
    inv,
    containerId:'notificationChatContent',
    title:'Chat',
    subtitle:otherName,
    backHtml:header,
    backAction:"closeModal();showScreen('notifications')",
    inputId:'notificationChatInput',
    listId:'notificationChatMessages',
  });
}

window.openChatFromNotification=openChatFromNotification;

function rememberChatMessageNotification(payload){
  const m=payload?.new;
  if(!m||!S.user||m.sender_id===S.user.id)return;
  const currentInv=_coachChatContext?.inv?.id;
  if(currentInv===m.invitation_id)return;
  const lastSeen=_lastSeenChatMessageAt[m.invitation_id];
  if(lastSeen&&new Date(m.created_at)<=new Date(lastSeen))return;
  _lastSeenChatMessageAt[m.invitation_id]=m.created_at||new Date().toISOString();
  sv('bs-chat-last-seen-v1',_lastSeenChatMessageAt);
  addAppNotification({
    type:'chat_message',
    title:tt({pl:'Nowa wiadomość na czacie',en:'New chat message',de:'Neue Chat-Nachricht',es:'Nuevo mensaje de chat'}),
    body:(m.message||'').slice(0,120),
    at:m.created_at,
    invitationId:m.invitation_id,
    action:`openChatFromNotification('${chatEsc(m.invitation_id)}')`,
  });
  showSyncToast(tt({pl:'Nowa wiadomość na czacie',en:'New chat message',de:'Neue Chat-Nachricht',es:'Nuevo mensaje de chat'}),'success');
}

window.rememberChatMessageNotification=rememberChatMessageNotification;

// ── INVITATION BANNERS (client side) ──────────────────────

async function checkPendingInvitations(){
  if(!sb||!S.user)return;
  try{
    const email=S.user.email;
    const{data,error}=await sb.from('coach_invitations')
      .select('*')
      .eq('client_email',email)
      .eq('status','pending');
    if(error)throw error;
    S.pendingInvites=data||[];
    // Update client_user_id on any rows that don't have it yet (first-time accept flow)
    if(S.pendingInvites.length){
      await sb.from('coach_invitations')
        .update({client_user_id:S.user.id})
        .eq('client_email',email)
        .is('client_user_id',null);
    }
    renderInvitationBanners();
    if(typeof updateNotificationBadge==='function')updateNotificationBadge();
  }catch(e){
    console.warn('checkPendingInvitations',e);
  }
}

function renderInvitationBanners(){
  const el=document.getElementById('inviteBanners');
  if(!el)return;
  if(!S.pendingInvites||!S.pendingInvites.length){
    el.innerHTML='';
    if(typeof updateNotificationBadge==='function')updateNotificationBadge();
    return;
  }
  el.innerHTML=S.pendingInvites.map(inv=>`
    <div class="invite-banner">
      <div class="invite-banner-icon">🏋️</div>
      <div class="invite-banner-body">
        <div class="invite-banner-title">${tt({pl:'Zaproszenie od trenera',en:'Coach invitation',de:'Trainer-Einladung',es:'Invitación del entrenador'})}</div>
        <div class="invite-banner-sub"><strong>${inv.coach_name||inv.coach_email}</strong> ${tt({pl:'chce mieć wgląd w Twoje treningi.',en:'wants to follow your progress.',de:'möchte deinen Fortschritt verfolgen.',es:'quiere seguir tu progreso.'})}</div>
        <div class="invite-banner-actions">
          <button class="btn btn-primary" style="padding:7px 16px;font-size:13px;" onclick="acceptInvitation('${inv.id}')">${tt({pl:'Akceptuj',en:'Accept',de:'Annehmen',es:'Aceptar'})}</button>
          <button class="btn btn-ghost" style="padding:7px 14px;font-size:13px;" onclick="declineInvitation('${inv.id}')">${tt({pl:'Odrzuć',en:'Decline',de:'Ablehnen',es:'Rechazar'})}</button>
        </div>
      </div>
    </div>`).join('');
  if(typeof updateNotificationBadge==='function')updateNotificationBadge();
}

async function acceptInvitation(invId){
  if(!sb||!S.user)return;
  try{
    await sb.from('coach_invitations').update({
      status:'accepted',
      client_user_id:S.user.id,
      responded_at:new Date().toISOString(),
    }).eq('id',invId);
    S.pendingInvites=S.pendingInvites.filter(i=>i.id!==invId);
    renderInvitationBanners();
    if(typeof updateNotificationBadge==='function')updateNotificationBadge();
    showSyncToast(tt({pl:'Zaproszenie zaakceptowane ✓',en:'Invitation accepted ✓',de:'Einladung angenommen ✓',es:'Invitación aceptada ✓'}),'success');
  }catch(e){
    showSyncToast(tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '})+(e.message||''),'error');
  }
}
window.acceptInvitation=acceptInvitation;

async function declineInvitation(invId){
  if(!sb||!S.user)return;
  try{
    await sb.from('coach_invitations').update({
      status:'declined',
      client_user_id:S.user.id,
      responded_at:new Date().toISOString(),
    }).eq('id',invId);
    S.pendingInvites=S.pendingInvites.filter(i=>i.id!==invId);
    renderInvitationBanners();
    if(typeof updateNotificationBadge==='function')updateNotificationBadge();
  }catch(e){
    showSyncToast(tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '})+(e.message||''),'error');
  }
}
window.declineInvitation=declineInvitation;

// ===== COACH: ASSIGN PROGRAM / WORKOUT TO CLIENT =====

function assignIso(d){return d.toISOString().slice(0,10);}
function assignMondayWeekday(dateStr){
  const d=new Date(dateStr+'T00:00:00');
  const js=d.getDay();
  return js===0?7:js;
}
function assignProgramSchedule(program,startDate,weekdays){
  const templates=program.templates||[];
  const duration=Math.max(1,+(program.duration||8));
  const days=[...weekdays].sort((a,b)=>a-b);
  const start=new Date(startDate+'T00:00:00');
  const items=[];
  let templateIdx=0;
  for(let i=0;i<duration*7;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const iso=assignIso(d);
    if(!days.includes(assignMondayWeekday(iso)))continue;
    const tpl=templates[templateIdx%Math.max(templates.length,1)];
    if(!tpl)continue;
    items.push({date:iso,type:'template',name:tpl.name||program.name?.en||'Workout',template:tpl,exercises:tpl.exercises||[]});
    templateIdx++;
  }
  const end=new Date(start);end.setDate(start.getDate()+duration*7-1);
  return{items,startDate,endDate:assignIso(end),weekdays:days};
}
function assignWeekdayPicker(idPrefix,selected){
  const labels=T[lang]?.days||T.en.days;
  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:10px 0 14px;">
    ${labels.map((d,i)=>{
      const val=i+1,checked=selected.includes(val);
      return `<button type="button" data-assign-weekday data-day="${val}" class="${checked?'is-selected':''}" onclick="window.assignToggleWeekday(${val})" style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:10px;border:1px solid ${checked?'var(--accent)':'var(--border)'};background:${checked?'var(--accent-dim)':'var(--bg3)'};font-size:12px;font-weight:700;color:${checked?'var(--accent)':'var(--text2)'};">${d}</button>`;
    }).join('')}
  </div>`;
}

function openAssignProgramModal(invId, clientUserId, assignmentId){
  closeModal();
  const allPrograms=[...BUILTIN_PROGRAMS,...(Array.isArray(S.programs)?S.programs.filter(p=>!p.fromCoach):[])];
  const coachTemplates=Array.isArray(S.templates)?S.templates:[];
  const existing=(window._clientDetailData?.assigned||[]).find(a=>String(a.id)===String(assignmentId));
  const existingItems=existing?.schedule_data?.items||[];
  const state={
    mode:existing?.assignment_type||'program',
    startDate:existing?.start_date||today(),
    workoutDate:existing?.start_date||today(),
    programWeekdays:existing?.weekdays?.length?[...existing.weekdays]:[1,2,3],
    customExercises:existingItems[0]?.exercises||existing?.program_data?.exercises||[],
    customName:existing?.program_name||'',
    selectedProgramIndex:-1,
    selectedTemplateIndex:-1,
  };
  if(existing?.assignment_type==='program'&&existing.program_data){
    state.selectedProgramData=existing.program_data;
  }
  if(existing?.assignment_type==='template'&&existing.program_data?.template){
    state.selectedTemplateData=existing.program_data.template;
  }
  const ov=document.createElement('div');ov.className='modal-overlay';
  function sync(){
    state.startDate=document.getElementById('assignStartDate')?.value||state.startDate;
    state.workoutDate=document.getElementById('assignWorkoutDate')?.value||state.workoutDate;
    state.customName=document.getElementById('assignCustomName')?.value||state.customName||'';
    state.programWeekdays=[...ov.querySelectorAll('[data-assign-weekday].is-selected')].map(x=>+x.dataset.day);
  }
  function modeBtn(mode,label){
    const active=state.mode===mode;
    return `<button class="btn ${active?'btn-primary':'btn-ghost'}" onclick="window.assignSetMode('${mode}')" style="font-size:12px;padding:10px 6px;">${label}</button>`;
  }
  function selectedProgram(){
    return state.selectedProgramData||allPrograms[state.selectedProgramIndex]||null;
  }
  function selectedTemplate(){
    return state.selectedTemplateData||coachTemplates[state.selectedTemplateIndex]||null;
  }
  function render(){
    const selectedProg=selectedProgram();
    const programHtml=`<label class="form-label">${tt({pl:'Start programu',en:'Program start',de:'Programmstart',es:'Inicio del programa'})}</label>
      <input id="assignStartDate" type="date" value="${state.startDate}" style="margin-bottom:8px;">
      ${selectedProg?`<div style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:10px;padding:10px 12px;margin-bottom:10px;">
        <div style="font-size:13px;font-weight:800;color:var(--accent);">${localizedField(selectedProg,'name')||selectedProg.name?.en||selectedProg.name?.pl||'Program'}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px;">${selectedProg.daysPerWeek||3} ${tt({pl:'dni / tydz.',en:'days / week',de:'Tage / Woche',es:'días / semana'})} · ${selectedProg.duration||8} ${tt({pl:'tyg.',en:'weeks',de:'Wochen',es:'semanas'})}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">${tt({pl:'Zaznaczone dni:',en:'Selected days:',de:'Ausgewählte Tage:',es:'Días seleccionados:'})} ${state.programWeekdays.length}/${selectedProg.daysPerWeek||3}</div>
      </div>`:''}
      <div style="font-size:12px;color:var(--text2);font-weight:700;">${tt({pl:'Dni treningowe',en:'Training days',de:'Trainingstage',es:'Días de entrenamiento'})}</div>
      ${assignWeekdayPicker('assign',state.programWeekdays)}
      <div style="max-height:42vh;overflow-y:auto;">
        ${allPrograms.length?allPrograms.map((p,i)=>{
          const n=localizedField(p,'name')||p.name?.en||p.name?.pl||'Program';
          const active=(state.selectedProgramIndex===i)||(!state.selectedProgramData?false:(localizedField(state.selectedProgramData,'name')||state.selectedProgramData.name?.en)===(localizedField(p,'name')||p.name?.en));
          return `<div class="workout-row" style="cursor:pointer;margin-bottom:8px;border-color:${active?'var(--accent)':'var(--border)'};background:${active?'var(--accent-dim)':'var(--bg2)'};" onclick="window.assignSelectProgram(${i})">
            <div class="workout-row-info"><div class="workout-row-name">${n}</div><div class="workout-row-meta">${p.daysPerWeek||3}× ${tt({pl:'tyg.',en:'/wk',de:'/Wo.',es:'/sem.'})} · ${p.duration||8} ${tt({pl:'tyg.',en:'wks',de:'Wo.',es:'sem.'})}</div></div>
            <div style="color:var(--accent);font-size:18px;">${active?'✓':'›'}</div>
          </div>`;
        }).join(''):`<div class="empty-state">${tt({pl:'Brak programów.',en:'No programs.',de:'Keine Programme.',es:'Sin programas.'})}</div>`}
      </div>
      <button class="btn btn-primary" onclick="assignProgramToClient('${invId}','${clientUserId}')" style="margin-top:10px;" ${selectedProg?'':'disabled'}>${assignmentId?tt({pl:'Zapisz zmiany',en:'Save changes',de:'Änderungen speichern',es:'Guardar cambios'}):tt({pl:'Confirm assign',en:'Confirm assign',de:'Zuweisung bestätigen',es:'Confirmar asignación'})}</button>`;
    const templateHtml=`<label class="form-label">${t('date')}</label>
      <input id="assignWorkoutDate" type="date" value="${state.workoutDate}" style="margin-bottom:12px;">
      <div style="max-height:48vh;overflow-y:auto;">
        ${coachTemplates.length?coachTemplates.map((tp,i)=>{
          const active=state.selectedTemplateIndex===i;
          return `<div class="workout-row" style="cursor:pointer;margin-bottom:8px;border-color:${active?'var(--accent)':'var(--border)'};background:${active?'var(--accent-dim)':'var(--bg2)'};" onclick="window.assignSelectTemplate(${i})">
          <div class="workout-row-info"><div class="workout-row-name">${tp.name||'Template'}</div><div class="workout-row-meta">${(tp.exercises||[]).length} ${t('exExercises')} · ${t('exRest')} ${tp.restDefault||90}s</div></div>
          <div style="color:var(--accent);font-size:18px;">${active?'✓':'›'}</div>
        </div>`;}).join(''):`<div class="empty-state">${tt({pl:'Brak templates coacha.',en:'No coach templates.',de:'Keine Coach-Vorlagen.',es:'Sin templates del coach.'})}</div>`}
      </div>
      <button class="btn btn-primary" onclick="assignTemplateWorkoutToClient('${invId}','${clientUserId}')" style="margin-top:10px;" ${(selectedTemplate()||state.selectedTemplateData)?'':'disabled'}>${assignmentId?tt({pl:'Zapisz zmiany',en:'Save changes',de:'Änderungen speichern',es:'Guardar cambios'}):tt({pl:'Confirm assign',en:'Confirm assign',de:'Zuweisung bestätigen',es:'Confirmar asignación'})}</button>`;
    const customHtml=`<label class="form-label">${t('date')}</label>
      <input id="assignWorkoutDate" type="date" value="${state.workoutDate}" style="margin-bottom:10px;">
      <label class="form-label">${tt({pl:'Nazwa treningu',en:'Workout name',de:'Workout-Name',es:'Nombre del entrenamiento'})}</label>
      <input id="assignCustomName" type="text" value="${(state.customName||'').replace(/"/g,'&quot;')}" placeholder="${t('customWorkout')}" style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-size:13px;font-weight:700;">${t('exercises')} (${state.customExercises.length})</div>
        <button class="btn btn-sm btn-ghost" onclick="window.assignPickCustomExercises()" style="font-size:12px;padding:7px 12px;">+ ${t('addExercise')}</button>
      </div>
      <div style="max-height:34vh;overflow-y:auto;margin-bottom:12px;">
        ${state.customExercises.length?state.customExercises.map((e,i)=>`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px;">${exName(e)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <label style="font-size:11px;color:var(--text3);font-weight:700;">${t('sets')}<input type="number" min="1" max="20" value="${e.sets||3}" oninput="window.assignCustomSet(${i},'sets',this.value)" style="margin-top:4px;text-align:center;"></label>
            <label style="font-size:11px;color:var(--text3);font-weight:700;">${t('reps')}<input type="number" min="1" max="100" value="${e.reps||10}" oninput="window.assignCustomSet(${i},'reps',this.value)" style="margin-top:4px;text-align:center;"></label>
          </div>
        </div>`).join(''):`<div class="empty-state" style="padding:18px;">${tt({pl:'Dodaj ćwiczenia albo zapisz samą nazwę.',en:'Add exercises or save the name only.',de:'Übungen hinzufügen oder nur Namen speichern.',es:'Añade ejercicios o guarda solo el nombre.'})}</div>`}
      </div>
      <button class="btn btn-primary" onclick="assignCustomWorkoutToClient('${invId}','${clientUserId}')">${assignmentId?tt({pl:'Zapisz zmiany',en:'Save changes',de:'Änderungen speichern',es:'Guardar cambios'}):tt({pl:'Przypisz custom workout',en:'Assign custom workout',de:'Eigenes Training zuweisen',es:'Asignar entrenamiento personalizado'})}</button>`;
    ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
      <div class="modal-handle"></div>
      <div class="modal-title">${tt({pl:'Assign dla klienta',en:'Client assign',de:'Client-Zuweisung',es:'Asignación de cliente'})}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px;">
        ${modeBtn('program',tt({pl:'Program',en:'Program',de:'Programm',es:'Programa'}))}
        ${modeBtn('template',tt({pl:'Template',en:'Template',de:'Vorlage',es:'Template'}))}
        ${modeBtn('custom',tt({pl:'Custom',en:'Custom',de:'Eigen',es:'Custom'}))}
      </div>
      <div style="overflow-y:auto;min-height:0;flex:1;">${state.mode==='program'?programHtml:state.mode==='template'?templateHtml:customHtml}</div>
      <button class="btn btn-ghost" style="margin-top:12px;" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
    </div>`;
  }
  window.assignSetMode=mode=>{sync();state.mode=mode;render();};
  window.assignSelectProgram=i=>{sync();state.selectedProgramIndex=i;state.selectedProgramData=null;const p=allPrograms[i];if(p?.daysPerWeek){state.programWeekdays=state.programWeekdays.slice(0,p.daysPerWeek);}render();};
  window.assignSelectTemplate=i=>{sync();state.selectedTemplateIndex=i;state.selectedTemplateData=null;render();};
  window.assignToggleWeekday=day=>{sync();const i=state.programWeekdays.indexOf(day);if(i>=0)state.programWeekdays.splice(i,1);else state.programWeekdays.push(day);render();};
  window.assignCustomSet=(idx,field,val)=>{if(state.customExercises[idx])state.customExercises[idx][field]=Math.max(1,+val||1);};
  window.assignPickCustomExercises=()=>{
    sync();
    const previous=new Map((state.customExercises||[]).map(e=>[String(e.id||e.name||exName(e)),e]));
    S.modal=null;
    showExPicker(state.customExercises,picked=>{
      state.customExercises=picked.map(e=>{
        const old=previous.get(String(e.id||e.name||exName(e)));
        return {...e,sets:e.sets||old?.sets||3,reps:e.reps||old?.reps||10};
      });
      S.modal=ov;
      render();
    });
  };
  window._assignPrograms=allPrograms;
  window._assignTemplates=coachTemplates;
  window._assignState=state;
  window._assignEditId=assignmentId||null;
  ov._backHandler=()=>{closeModal();return true;};
  document.body.appendChild(ov);S.modal=ov;render();
}
window.openAssignProgramModal=openAssignProgramModal;

async function insertClientAssignment(invId,clientUserId,row,successMsg){
  if(!sb||!S.user)return;
  try{
    const payload={
      invitation_id:invId,
      coach_id:S.user.id,
      client_user_id:clientUserId,
      status:'active',
      ...row,
    };
    const editId=window._assignEditId;
    const query=editId
      ?sb.from('coach_program_assignments').update(payload).eq('id',editId).eq('coach_id',S.user.id)
      :sb.from('coach_program_assignments').insert(payload);
    const{error}=await query;
    if(error)throw error;
    closeModal();
    showSyncToast(successMsg,'success');
    setTimeout(()=>openClientDetail(invId),150);
  }catch(e){
    showSyncToast(tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '})+(e.message||''),'error');
  }
}

window.assignProgramToClient=async function(invId,clientUserId){
  const state=window._assignState;
  const picked=state?.selectedProgramData||window._assignPrograms?.[state?.selectedProgramIndex];
  const programData=JSON.parse(JSON.stringify(picked||null));
  if(!programData||!state)return;
  const weekdays=[...document.querySelectorAll('[data-assign-weekday].is-selected')].map(x=>+x.dataset.day);
  if(!weekdays.length)return showSyncToast(tt({pl:'Wybierz dni tygodnia.',en:'Choose training days.',de:'Trainingstage wählen.',es:'Elige días de entrenamiento.'}),'error');
  const required=+(programData.daysPerWeek||3);
  if(weekdays.length!==required)return showSyncToast(tt({pl:`Ten program wymaga ${required} dni treningowych.`,en:`This program needs ${required} training days.`,de:`Dieses Programm braucht ${required} Trainingstage.`,es:`Este programa necesita ${required} días de entrenamiento.`}),'error');
  const startDate=document.getElementById('assignStartDate')?.value||today();
  const schedule=assignProgramSchedule(programData,startDate,weekdays);
  const programName=localizedField(programData,'name')||programData.name?.en||programData.name?.pl||'Program';
  programData.coachName=(localStorage.getItem('bs-username')||'').trim()||S.user.email;
  await insertClientAssignment(invId,clientUserId,{
    assignment_type:'program',
    program_name:programName,
    program_data:programData,
    schedule_data:schedule,
    start_date:schedule.startDate,
    end_date:schedule.endDate,
    weekdays:schedule.weekdays,
  },tt({pl:'Program rozpisany w kalendarzu klienta ✓',en:'Program scheduled in client calendar ✓',de:'Programm im Client-Kalender geplant ✓',es:'Programa planificado en el calendario ✓'}));
};

window.assignTemplateWorkoutToClient=async function(invId,clientUserId){
  const state=window._assignState;
  const picked=state?.selectedTemplateData||window._assignTemplates?.[state?.selectedTemplateIndex];
  const tp=JSON.parse(JSON.stringify(picked||null));
  if(!tp)return;
  const date=document.getElementById('assignWorkoutDate')?.value||today();
  const name=tp.name||'Template';
  await insertClientAssignment(invId,clientUserId,{
    assignment_type:'template',
    program_name:name,
    program_data:{coachName:(localStorage.getItem('bs-username')||'').trim()||S.user.email,template:tp},
    schedule_data:{items:[{date,type:'template',name,template:tp,exercises:tp.exercises||[]}]},
    start_date:date,
    end_date:date,
    weekdays:[assignMondayWeekday(date)],
  },tt({pl:'Workout z template przypisany ✓',en:'Template workout assigned ✓',de:'Vorlagen-Workout zugewiesen ✓',es:'Workout de template asignado ✓'}));
};

window.assignCustomWorkoutToClient=async function(invId,clientUserId){
  const state=window._assignState||{};
  const date=document.getElementById('assignWorkoutDate')?.value||today();
  const name=(document.getElementById('assignCustomName')?.value||'').trim()||t('customWorkout');
  const exercises=(state.customExercises||[]).map(e=>({id:e.id,name:exName(e),pl:e.pl,en:e.en,gk:e.gk,equipment:e.equipment,sets:e.sets||3,reps:e.reps||10}));
  await insertClientAssignment(invId,clientUserId,{
    assignment_type:'custom',
    program_name:name,
    program_data:{coachName:(localStorage.getItem('bs-username')||'').trim()||S.user.email,name,exercises},
    schedule_data:{items:[{date,type:'custom',name,exercises}]},
    start_date:date,
    end_date:date,
    weekdays:[assignMondayWeekday(date)],
  },tt({pl:'Custom workout przypisany ✓',en:'Custom workout assigned ✓',de:'Eigenes Training zugewiesen ✓',es:'Workout personalizado asignado ✓'}));
};

window.removeCoachAssignment=async function(assignmentId,btnEl){
  if(!sb||!S.user)return;
  if(!confirm(tt({pl:'Usunąć program od klienta?',en:'Remove this program from client?',de:'Dieses Programm vom Klienten entfernen?',es:'¿Quitar este programa del cliente?'})))return;
  if(btnEl)btnEl.disabled=true;
  const{error}=await sb.from('coach_program_assignments')
    .update({status:'removed'})
    .eq('id',assignmentId)
    .eq('coach_id',S.user.id);
  if(error){
    showSyncToast(tt({pl:'Błąd usuwania.',en:'Remove failed.',de:'Fehler.',es:'Error.'}),'error');
    if(btnEl)btnEl.disabled=false;
    return;
  }
  // Remove the row from UI
  btnEl?.closest('[style*="background:var(--bg3)"]')?.remove();
};

