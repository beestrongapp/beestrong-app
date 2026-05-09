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
    saveAll();
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
  saveAll();
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
  }
  if(changed){saveAll();updateCoachNav();updateAdminNav();renderDashboard();renderSettings();}
}

// ── CLIENT SCREEN ──────────────────────────────────────────

function renderClients(){
  const el=document.getElementById('clientsContent');
  if(!el)return;
  if(!S.user){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Zaloguj się, aby zarządzać klientami.',en:'Sign in to manage clients.',de:'Melde dich an, um Klienten zu verwalten.',es:'Inicia sesión para gestionar clientes.'})}</div>`;
    return;
  }
  if(!S.coachMode||!isCoachAllowed()){
    el.innerHTML=`<div class="empty-state">${tt({pl:'Coach Mode nie jest aktywny.',en:'Coach Mode is not active.',de:'Coach-Modus ist nicht aktiv.',es:'El modo entrenador no está activo.'})}</div>`;
    return;
  }
  el.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>`;
  loadClientsFromCloud().then(invitations=>{
    if(!invitations){el.innerHTML=`<div class="empty-state">${tt({pl:'Błąd ładowania klientów.',en:'Error loading clients.',de:'Fehler beim Laden.',es:'Error al cargar.'})}</div>`;return;}
    if(!invitations.length){
      el.innerHTML=`<div class="empty-state">${tt({pl:'Brak klientów. Zaproś pierwszego klikając +.',en:'No clients yet. Invite one by tapping +.',de:'Noch keine Klienten. Tippe + um einzuladen.',es:'Sin clientes aún. Pulsa + para invitar.'})}</div>`;
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
  });
}

function clientCardHtml(inv){
  const statusLabel={
    pending:tt({pl:'Oczekuje',en:'Pending',de:'Ausstehend',es:'Pendiente'}),
    accepted:tt({pl:'Aktywny',en:'Active',de:'Aktiv',es:'Activo'}),
    declined:tt({pl:'Odrzucono',en:'Declined',de:'Abgelehnt',es:'Rechazado'}),
  }[inv.status]||inv.status;
  const clickable=inv.status==='accepted';
  return `<div class="client-card" onclick="${clickable?`openClientDetail('${inv.id}')`:''}" style="${clickable?'':'cursor:default;'}">
    <div style="width:38px;height:38px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--btn-text);flex-shrink:0;">${(inv.client_email||'?')[0].toUpperCase()}</div>
    <div class="client-card-info">
      <div class="client-card-name">${inv.client_email||'—'}</div>
      <div class="client-card-meta">${tt({pl:'Zaproszono',en:'Invited',de:'Eingeladen',es:'Invitado'})}: ${inv.created_at?new Date(inv.created_at).toLocaleDateString():''}</div>
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
    return data||[];
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
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="max-height:85vh;overflow-y:auto;">
    <div class="modal-handle"></div>
    <div id="clientDetailContent" style="display:flex;align-items:center;justify-content:center;padding:40px 0;"><div class="spinner"></div></div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;

  try{
    const{data:inv,error:invErr}=await sb.from('coach_invitations').select('*').eq('id',invId).single();
    if(invErr||!inv)throw invErr||new Error('not found');
    const clientId=inv.client_user_id;
    if(!clientId)throw new Error('no client id');

    const[woRes,mRes]=await Promise.all([
      sb.from('workouts').select('*').eq('user_id',clientId).order('date',{ascending:false}).limit(10),
      sb.from('measurements').select('*').eq('user_id',clientId).order('date',{ascending:false}).limit(30),
    ]);

    const workouts=woRes.data||[];
    const measurements=mRes.data||[];

    // Weekly stats (last 4 weeks)
    const now=new Date();
    const weekStats=[];
    for(let w=0;w<4;w++){
      const wEnd=new Date(now);wEnd.setDate(wEnd.getDate()-w*7);
      const wStart=new Date(wEnd);wStart.setDate(wStart.getDate()-6);
      const wWos=workouts.filter(wo=>{const d=new Date(wo.date);return d>=wStart&&d<=wEnd;});
      weekStats.push({label:`-${w}w`,count:wWos.length,vol:wWos.reduce((a,w)=>a+(w.volume_kg||0),0)});
    }

    const lastWeight=measurements.find(m=>m.weight_kg!=null);

    let html=`<div class="modal-title" style="margin-bottom:4px;">${inv.client_email}</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:20px;">${tt({pl:'Klient od',en:'Client since',de:'Klient seit',es:'Cliente desde'})}: ${new Date(inv.created_at).toLocaleDateString()}</div>`;

    // Stats row
    html+=`<div class="stats-grid" style="margin-bottom:20px;">
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Treningi',en:'Workouts',de:'Trainings',es:'Entrenos'})}</span></div><div class="stat-value">${workouts.length}</div><div class="stat-unit">${tt({pl:'ostatnie 10',en:'last 10',de:'letzte 10',es:'últimos 10'})}</div></div>
      <div class="stat-card"><div class="stat-top"><span class="stat-label">${tt({pl:'Waga',en:'Weight',de:'Gewicht',es:'Peso'})}</span></div><div class="stat-value">${lastWeight?dispW(lastWeight.weight_kg):'—'}</div><div class="stat-unit">${unitW()}</div></div>
    </div>`;

    // Recent workouts
    if(workouts.length){
      html+=`<div class="section-label">${tt({pl:'Ostatnie treningi',en:'Recent workouts',de:'Letzte Trainings',es:'Últimos entrenos'})}</div>`;
      html+=workouts.slice(0,5).map(w=>{
        const[y,m,d]=(w.date||'').split('-');
        return `<div class="workout-row"><div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18"/></svg></div><div class="workout-row-info"><div class="workout-row-name">${w.name||'Workout'}</div><div class="workout-row-meta">${d?`${d}.${m}.${y}`:''}${w.duration_min?` · ${w.duration_min} min`:''} · ${fmtVol(w.volume_kg||0)}${unitVol()}</div></div></div>`;
      }).join('');
    } else {
      html+=`<div class="empty-state">${tt({pl:'Brak treningów.',en:'No workouts yet.',de:'Noch keine Trainings.',es:'Sin entrenamientos.'})}</div>`;
    }

    // Recent measurements
    if(measurements.length){
      html+=`<div class="section-label" style="margin-top:16px;">${tt({pl:'Ostatnie pomiary',en:'Recent measurements',de:'Letzte Messungen',es:'Últimas medidas'})}</div>`;
      html+=measurements.slice(0,5).map(m=>{
        const parts=[];
        if(m.weight_kg!=null)parts.push(`${tt({pl:'Waga',en:'Weight',de:'Gewicht',es:'Peso'})}: ${dispW(m.weight_kg)}${unitW()}`);
        if(m.waist_cm!=null)parts.push(`${tt({pl:'Talia',en:'Waist',de:'Taille',es:'Cintura'})}: ${dispL(m.waist_cm)}${unitL()}`);
        const[y,mo,d]=(m.date||'').split('-');
        return `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;"><span style="color:var(--text2);margin-right:10px;">${d?`${d}.${mo}.${y}`:''}</span>${parts.join(' · ')}</div>`;
      }).join('');
    }

    // Coach-assigned programs for this client
    const{data:assignedData}=await sb.from('coach_program_assignments')
      .select('*').eq('client_user_id',clientId).eq('status','active');
    const assigned=assignedData||[];

    html+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;margin-bottom:10px;">
      <div class="section-label" style="margin:0;">${tt({pl:'Przypisane programy',en:'Assigned programs',de:'Zugewiesene Programme',es:'Programas asignados'})}</div>
      <button class="btn btn-sm btn-primary" style="font-size:12px;padding:7px 14px;" onclick="openAssignProgramModal('${inv.id}','${clientId}')">+ ${tt({pl:'Przypisz',en:'Assign',de:'Zuweisen',es:'Asignar'})}</button>
    </div>`;
    if(assigned.length){
      html+=assigned.map(a=>`
        <div style="background:var(--bg3);border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
          <div style="flex:1;font-size:13px;font-weight:600;">${a.program_name}</div>
          <div style="font-size:11px;color:var(--text3);">${new Date(a.assigned_at).toLocaleDateString()}</div>
          <button class="btn btn-sm btn-ghost" style="color:var(--red);font-size:11px;padding:4px 10px;" onclick="removeCoachAssignment('${a.id}',this)">${tt({pl:'Usuń',en:'Remove',de:'Entfernen',es:'Quitar'})}</button>
        </div>`).join('');
    } else {
      html+=`<div style="font-size:13px;color:var(--text3);padding:8px 0;">${tt({pl:'Brak przypisanych programów.',en:'No programs assigned yet.',de:'Noch keine Programme zugewiesen.',es:'Aún no hay programas asignados.'})}</div>`;
    }

    html+=`<button class="btn btn-ghost" style="margin-top:20px;width:100%;" onclick="closeModal()">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>`;

    document.getElementById('clientDetailContent').innerHTML=html;
  }catch(e){
    document.getElementById('clientDetailContent').innerHTML=`<div style="padding:20px;text-align:center;color:var(--red);">${tt({pl:'Nie udało się pobrać danych klienta.',en:'Could not load client data.',de:'Kundendaten konnten nicht geladen werden.',es:'No se pudieron cargar los datos del cliente.'})}<br><br><button class="btn btn-ghost" onclick="closeModal()">OK</button></div>`;
  }
}
window.openClientDetail=openClientDetail;

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
  }catch(e){
    console.warn('checkPendingInvitations',e);
  }
}

function renderInvitationBanners(){
  const el=document.getElementById('inviteBanners');
  if(!el)return;
  if(!S.pendingInvites||!S.pendingInvites.length){el.innerHTML='';return;}
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
  }catch(e){
    showSyncToast(tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '})+(e.message||''),'error');
  }
}
window.declineInvitation=declineInvitation;

// ===== COACH: ASSIGN PROGRAM TO CLIENT =====

function openAssignProgramModal(invId, clientUserId){
  closeModal();
  const allPrograms=[...BUILTIN_PROGRAMS,...(Array.isArray(S.programs)?S.programs.filter(p=>!p.fromCoach):[])];
  if(!allPrograms.length){
    showSyncToast(tt({pl:'Brak programów do przypisania.',en:'No programs to assign.',de:'Keine Programme zum Zuweisen.',es:'No hay programas para asignar.'}),'error');
    return;
  }
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${tt({pl:'Wybierz program',en:'Choose program',de:'Programm wählen',es:'Elige programa'})}</div>
    <div style="max-height:55vh;overflow-y:auto;margin-bottom:12px;">
      ${allPrograms.map(p=>{
        const n=localizedField(p,'name')||p.name?.en||p.name?.pl||'';
        return `<div class="workout-row" style="cursor:pointer;margin-bottom:8px;" onclick="assignProgramToClient('${invId}','${clientUserId}',${JSON.stringify(JSON.stringify(p)).replace(/'/g,"\\'")},'${n.replace(/'/g,"\\'")}')" >
          <div class="workout-row-info">
            <div class="workout-row-name">${n}</div>
            <div class="workout-row-meta">${p.daysPerWeek||3}× ${tt({pl:'tyg.',en:'/wk',de:'/Wo.',es:'/sem.'})} · ${p.duration||8} ${tt({pl:'tyg.',en:'wks',de:'Wo.',es:'sem.'})}</div>
          </div>
          <div style="color:var(--accent);font-size:20px;">›</div>
        </div>`;
      }).join('')}
    </div>
    <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'Anuluj',en:'Cancel',de:'Abbrechen',es:'Cancelar'})}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.openAssignProgramModal=openAssignProgramModal;

window.assignProgramToClient=async function(invId,clientUserId,programJson,programName){
  if(!sb||!S.user)return;
  try{
    const programData=JSON.parse(programJson);
    // Embed coach name for display on client side
    programData.coachName=(localStorage.getItem('bs-username')||'').trim()||S.user.email;
    const{error}=await sb.from('coach_program_assignments').insert({
      invitation_id:invId,
      coach_id:S.user.id,
      client_user_id:clientUserId,
      program_name:programName,
      program_data:programData,
      status:'active',
    });
    if(error)throw error;
    closeModal();
    showSyncToast(tt({pl:'Program przypisany ✓',en:'Program assigned ✓',de:'Programm zugewiesen ✓',es:'Programa asignado ✓'}),'success');
  }catch(e){
    showSyncToast(tt({pl:'Błąd: ',en:'Error: ',de:'Fehler: ',es:'Error: '})+(e.message||''),'error');
  }
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

