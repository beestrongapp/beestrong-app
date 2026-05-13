// ===== EXERCISE DATABASE (free-exercise-db) =====
// Source: https://github.com/yuhonas/free-exercise-db (Unlicense / public domain)
// Skipped categories: stretching, cardio (don't fit sets×reps×weight model)
const FEDB_MUSCLE_MAP={
  'chest':'chest',
  'lats':'back','middle back':'back','lower back':'back','traps':'back','neck':'back',
  'biceps':'arms','triceps':'arms','forearms':'arms',
  'shoulders':'shoulders',
  'quadriceps':'legs','hamstrings':'legs','abductors':'legs','adductors':'legs',
  'calves':'calves',
  'abdominals':'abs',
  'glutes':'glutes',
};
const SKIP_FEDB_CATEGORIES=new Set(['stretching','cardio']);
const EQUIPMENT_LABELS={
  'barbell':{pl:'Sztanga',en:'Barbell',de:'Langhantel',es:'Barra'},
  'dumbbell':{pl:'Hantle',en:'Dumbbell',de:'Kurzhantel',es:'Mancuernas'},
  'machine':{pl:'Maszyna',en:'Machine',de:'Maschine',es:'Máquina'},
  'cable':{pl:'Wyciąg',en:'Cable',de:'Kabelzug',es:'Cable'},
  'kettlebells':{pl:'Kettlebell',en:'Kettlebells',de:'Kettlebell',es:'Pesa rusa'},
  'bands':{pl:'Gumy',en:'Bands',de:'Bänder',es:'Bandas'},
  'body only':{pl:'Bez sprzętu',en:'Body only',de:'Eigengewicht',es:'Sin equipo'},
  'medicine ball':{pl:'Piłka lekarska',en:'Medicine ball',de:'Medizinball',es:'Balón medicinal'},
  'exercise ball':{pl:'Piłka gimnastyczna',en:'Exercise ball',de:'Gymnastikball',es:'Pelota suiza'},
  'e-z curl bar':{pl:'Łamana',en:'EZ curl bar',de:'SZ-Stange',es:'Barra Z'},
  'foam roll':{pl:'Roller',en:'Foam roll',de:'Faszienrolle',es:'Rodillo'},
  'other':{pl:'Inne',en:'Other',de:'Andere',es:'Otro'},
};
const GROUP_LABELS={
  chest:{pl:'Klatka',en:'Chest',de:'Brust',es:'Pecho'},
  back:{pl:'Plecy',en:'Back',de:'Rücken',es:'Espalda'},
  arms:{pl:'Ramiona',en:'Arms',de:'Arme',es:'Brazos'},
  shoulders:{pl:'Barki',en:'Shoulders',de:'Schultern',es:'Hombros'},
  legs:{pl:'Nogi',en:'Legs',de:'Beine',es:'Piernas'},
  calves:{pl:'Łydki',en:'Calves',de:'Waden',es:'Pantorrillas'},
  abs:{pl:'Brzuch',en:'Abs',de:'Bauch',es:'Abdomen'},
  glutes:{pl:'Pośladki',en:'Glutes',de:'Gesäß',es:'Glúteos'},
};

function chartGrowthPercent(data){
  const vals=(data||[]).map(x=>typeof x==='number'?x:+(x&&x.v)).filter(Number.isFinite);
  if(vals.length<2)return null;
  const firstIndex=vals.findIndex(v=>Math.abs(v)>0.000001);
  if(firstIndex<0||firstIndex>=vals.length-1)return null;
  const first=vals[firstIndex];
  const last=vals[vals.length-1];
  if(!Number.isFinite(last))return null;
  const pct=((last-first)/Math.abs(first))*100;
  return Number.isFinite(pct)?pct:null;
}
function chartGrowthBadge(data){
  const pct=chartGrowthPercent(data);
  if(pct==null)return'';
  const rounded=Math.abs(pct)<0.05?0:pct;
  const cls=rounded>0?'':(rounded<0?' is-down':' is-flat');
  return`<div class="chart-growth-badge${cls}">${rounded>0?'+':''}${rounded.toFixed(1)}%</div>`;
}
window.chartGrowthPercent=chartGrowthPercent;
window.chartGrowthBadge=chartGrowthBadge;

const OFFLINE_EX_GROUPS={
  chest:{pl:'Klatka',en:'Chest',items:[{id:'c001',en:'Barbell Bench Press',pl:'Wyciskanie sztangi płasko',img:null},{id:'c002',en:'Incline Barbell Bench Press',pl:'Wyciskanie sztangi skos dodatni',img:null},{id:'c003',en:'Decline Barbell Bench Press',pl:'Wyciskanie sztangi skos ujemny',img:null},{id:'c004',en:'Dumbbell Bench Press',pl:'Wyciskanie hantli płasko',img:null},{id:'c005',en:'Incline Dumbbell Press',pl:'Wyciskanie hantli skos dodatni',img:null},{id:'c006',en:'Decline Dumbbell Press',pl:'Wyciskanie hantli skos ujemny',img:null},{id:'c007',en:'Machine Chest Press',pl:'Maszyna chest press',img:null},{id:'c008',en:'Smith Machine Bench Press',pl:'Wyciskanie na maszynie Smitha',img:null},{id:'c009',en:'Dumbbell Flyes',pl:'Rozpiętki hantlami płasko',img:null},{id:'c010',en:'Incline Dumbbell Flyes',pl:'Rozpiętki hantlami skos',img:null},{id:'c011',en:'Cable Crossover',pl:'Kabel krzyżowy',img:null},{id:'c012',en:'Cable Fly High',pl:'Kabel krzyżowy górny',img:null},{id:'c013',en:'Cable Fly Low',pl:'Kabel krzyżowy dolny',img:null},{id:'c014',en:'Chest Dips',pl:'Dips klatka',img:null},{id:'c015',en:'Push-Ups',pl:'Pompki',img:null},{id:'c016',en:'Wide Push-Ups',pl:'Pompki szeroki chwyt',img:null},{id:'c017',en:'Diamond Push-Ups',pl:'Pompki diament',img:null},{id:'c018',en:'Pec Deck Machine',pl:'Maszyna pec deck',img:null},{id:'c019',en:'Around The Worlds',pl:'Koła hantlami',img:null},{id:'c020',en:'Svend Press',pl:'Wyciskanie z talerzem',img:null}]},
  back:{pl:'Plecy',en:'Back',items:[{id:'b001',en:'Barbell Deadlift',pl:'Martwy ciąg',img:null},{id:'b002',en:'Romanian Deadlift',pl:'Martwy ciąg rumuński',img:null},{id:'b003',en:'Sumo Deadlift',pl:'Martwy ciąg sumo',img:null},{id:'b004',en:'Barbell Row',pl:'Wiosłowanie sztangą',img:null},{id:'b005',en:'Dumbbell Row',pl:'Wiosłowanie hantlem',img:null},{id:'b006',en:'Machine Row',pl:'Wiosłowanie na maszynie',img:null},{id:'b007',en:'Cable Row',pl:'Wiosłowanie kabel',img:null},{id:'b008',en:'Pull-Ups',pl:'Podciąganie na drążku',img:null},{id:'b009',en:'Chin-Ups',pl:'Podciąganie podchwytem',img:null},{id:'b010',en:'Lat Pulldown',pl:'Ściąganie drążka',img:null},{id:'b011',en:'Wide-Grip Lat Pulldown',pl:'Ściąganie drążka szeroko',img:null},{id:'b012',en:'Close-Grip Lat Pulldown',pl:'Ściąganie drążka wąsko',img:null},{id:'b013',en:'Face Pull',pl:'Face pull',img:null},{id:'b014',en:'Seated Cable Row',pl:'Wiosłowanie siedząc kabel',img:null},{id:'b015',en:'T-Bar Row',pl:'Wiosłowanie T-bar',img:null},{id:'b016',en:'Hyperextension',pl:'Hyperextension',img:null},{id:'b017',en:'Good Morning',pl:'Good morning',img:null},{id:'b018',en:'Rack Pulls',pl:'Martwy ciąg z bloku',img:null},{id:'b019',en:'Pendlay Row',pl:'Wiosłowanie Pendlay',img:null},{id:'b020',en:'Inverted Row',pl:'Wiosłowanie odwrotne',img:null},{id:'b021',en:'Single Arm Cable Row',pl:'Wiosłowanie kabel jedną ręką',img:null},{id:'b022',en:'Meadows Row',pl:'Wiosłowanie Meadows',img:null}]},
  arms:{pl:'Ramiona',en:'Arms',items:[{id:'a001',en:'Barbell Curl',pl:'Uginanie sztangi',img:null},{id:'a002',en:'Dumbbell Curl',pl:'Uginanie hantli',img:null},{id:'a003',en:'Hammer Curl',pl:'Uginanie młotkowe',img:null},{id:'a004',en:'Preacher Curl',pl:'Uginanie na modlitewniku',img:null},{id:'a005',en:'Incline Dumbbell Curl',pl:'Uginanie hantli skos',img:null},{id:'a006',en:'Cable Curl',pl:'Uginanie kablowe',img:null},{id:'a007',en:'EZ Bar Curl',pl:'Uginanie sztangi EZ',img:null},{id:'a008',en:'Concentration Curl',pl:'Uginanie koncentryczne',img:null},{id:'a009',en:'Spider Curl',pl:'Uginanie spider',img:null},{id:'a010',en:'Reverse Curl',pl:'Uginanie odwrotne',img:null},{id:'a011',en:'Alternating Dumbbell Curl',pl:'Uginanie naprzemienne',img:null},{id:'a012',en:'Close-Grip Bench Press',pl:'Wyciskanie wąskim chwytem',img:null},{id:'a013',en:'Triceps Pushdown',pl:'Prostowanie na wyciągu górnym',img:null},{id:'a014',en:'Skull Crushers',pl:'Skull crushers',img:null},{id:'a015',en:'Triceps Dips',pl:'Dips triceps',img:null},{id:'a016',en:'Overhead Triceps Extension',pl:'Prostowanie nad głową',img:null},{id:'a017',en:'Rope Triceps Pushdown',pl:'Prostowanie lina wyciąg',img:null},{id:'a018',en:'Triceps Kickback',pl:'Kickback triceps',img:null},{id:'a019',en:'Overhead Cable Extension',pl:'Wyciąg górny nad głową',img:null},{id:'a020',en:'Diamond Push-Ups',pl:'Pompki diament triceps',img:null},{id:'a021',en:'Wrist Curl',pl:'Uginanie nadgarstka',img:null},{id:'a022',en:'Reverse Wrist Curl',pl:'Uginanie nadgarstka odwrotne',img:null},{id:'a023',en:'Zottman Curl',pl:'Uginanie Zottmana',img:null},{id:'a024',en:'21s Curl',pl:'Uginanie 21',img:null}]},
  shoulders:{pl:'Barki',en:'Shoulders',items:[{id:'s001',en:'Overhead Press',pl:'Wyciskanie stojąc',img:null},{id:'s002',en:'Seated Dumbbell Press',pl:'Wyciskanie hantli siedząc',img:null},{id:'s003',en:'Arnold Press',pl:'Arnold press',img:null},{id:'s004',en:'Lateral Raises',pl:'Unoszenia bokiem',img:null},{id:'s005',en:'Front Raises',pl:'Wznosy przodem',img:null},{id:'s006',en:'Bent-Over Lateral Raises',pl:'Wznosy w opadzie',img:null},{id:'s007',en:'Cable Lateral Raise',pl:'Unoszenia bokiem kabel',img:null},{id:'s008',en:'Face Pull',pl:'Face pull barki',img:null},{id:'s009',en:'Upright Row',pl:'Wiosłowanie wąskie stojąc',img:null},{id:'s010',en:'Barbell Overhead Press',pl:'Wyciskanie sztangi nad głowę',img:null},{id:'s011',en:'Machine Shoulder Press',pl:'Maszyna barki',img:null},{id:'s012',en:'Dumbbell Shrugs',pl:'Wzruszanie ramion hantlami',img:null},{id:'s013',en:'Barbell Shrugs',pl:'Wzruszanie ramion sztangą',img:null},{id:'s014',en:'Behind The Neck Press',pl:'Wyciskanie za głowę',img:null},{id:'s015',en:'Cable Front Raise',pl:'Wznosy przodem kabel',img:null},{id:'s016',en:'Alternating Deltoid Raise',pl:'Unoszenia naprzemienne',img:null},{id:'s017',en:'Plate Front Raise',pl:'Wznosy talerz',img:null},{id:'s018',en:'Push Press',pl:'Push press',img:null}]},
  legs:{pl:'Nogi',en:'Legs',items:[{id:'l001',en:'Barbell Squat',pl:'Przysiad ze sztangą',img:null},{id:'l002',en:'Front Squat',pl:'Przysiad ze sztangą z przodu',img:null},{id:'l003',en:'Goblet Squat',pl:'Przysiad goblet',img:null},{id:'l004',en:'Sumo Squat',pl:'Przysiad sumo',img:null},{id:'l005',en:'Hack Squat',pl:'Hack squat',img:null},{id:'l006',en:'Leg Press',pl:'Suwnica / Leg press',img:null},{id:'l007',en:'Lunges',pl:'Wykrok',img:null},{id:'l008',en:'Walking Lunges',pl:'Wykrok w marszu',img:null},{id:'l009',en:'Reverse Lunges',pl:'Wykrok w tył',img:null},{id:'l010',en:'Bulgarian Split Squat',pl:'Bulgarian split squat',img:null},{id:'l011',en:'Leg Extension',pl:'Prostowanie nóg',img:null},{id:'l012',en:'Lying Leg Curl',pl:'Uginanie nóg leżąc',img:null},{id:'l013',en:'Seated Leg Curl',pl:'Uginanie nóg siedząc',img:null},{id:'l014',en:'Stiff Leg Deadlift',pl:'Martwy ciąg nogi proste',img:null},{id:'l015',en:'Step Ups',pl:'Wejście na podwyższenie',img:null},{id:'l016',en:'Box Jumps',pl:'Skoki na skrzynię',img:null},{id:'l017',en:'Wall Sit',pl:'Siedzenie przy ścianie',img:null},{id:'l018',en:'Sissy Squat',pl:'Sissy squat',img:null},{id:'l019',en:'Leg Press (Wide Stance)',pl:'Leg press szeroko',img:null},{id:'l020',en:'Smith Machine Squat',pl:'Przysiad maszyna Smitha',img:null},{id:'l021',en:'Pistol Squat',pl:'Pistolet',img:null},{id:'l022',en:'Nordic Hamstring Curl',pl:'Nordic hamstring curl',img:null}]},
  calves:{pl:'Łydki',en:'Calves',items:[{id:'cv001',en:'Standing Calf Raises',pl:'Łydki stojąc',img:null},{id:'cv002',en:'Seated Calf Raises',pl:'Łydki siedząc',img:null},{id:'cv003',en:'Leg Press Calf Raises',pl:'Łydki na suwnicy',img:null},{id:'cv004',en:'Single Leg Calf Raise',pl:'Łydki jednonóż',img:null},{id:'cv005',en:'Donkey Calf Raises',pl:'Łydki osiołek',img:null},{id:'cv006',en:'Jump Rope',pl:'Skakanka',img:null}]},
  abs:{pl:'Brzuch',en:'Abs',items:[{id:'ab001',en:'Crunch',pl:'Crunch',img:null},{id:'ab002',en:'Plank',pl:'Plank',img:null},{id:'ab003',en:'Side Plank',pl:'Plank boczny',img:null},{id:'ab004',en:'Leg Raises',pl:'Unoszenie nóg',img:null},{id:'ab005',en:'Hanging Leg Raises',pl:'Unoszenie nóg w zwisie',img:null},{id:'ab006',en:'Cable Crunch',pl:'Kabel brzuch',img:null},{id:'ab007',en:'Russian Twist',pl:'Russian twist',img:null},{id:'ab008',en:'Mountain Climbers',pl:'Mountain climbers',img:null},{id:'ab009',en:'Ab Roller',pl:'Kółko brzuch',img:null},{id:'ab010',en:'Bicycle Crunch',pl:'Crunch rowerek',img:null},{id:'ab011',en:'Decline Crunch',pl:'Crunch skos ujemny',img:null},{id:'ab012',en:'Reverse Crunch',pl:'Crunch odwrotny',img:null},{id:'ab013',en:'Hollow Hold',pl:'Hollow hold',img:null},{id:'ab014',en:'Dead Bug',pl:'Dead bug',img:null},{id:'ab015',en:'V-Ups',pl:'V-ups',img:null},{id:'ab016',en:'Toe Touches',pl:'Dotykanie palców',img:null},{id:'ab017',en:'Windshield Wipers',pl:'Wycieraczki',img:null},{id:'ab018',en:'Flutter Kicks',pl:'Flutter kicks',img:null},{id:'ab019',en:'Machine Crunch',pl:'Maszyna brzuch',img:null},{id:'ab020',en:'Pallof Press',pl:'Pallof press',img:null}]},
  glutes:{pl:'Pośladki',en:'Glutes',items:[{id:'g001',en:'Hip Thrust',pl:'Hip thrust',img:null},{id:'g002',en:'Barbell Hip Thrust',pl:'Hip thrust ze sztangą',img:null},{id:'g003',en:'Glute Bridge',pl:'Mostek biodrowy',img:null},{id:'g004',en:'Cable Kickback',pl:'Odwodzenie w kablu',img:null},{id:'g005',en:'Donkey Kickback',pl:'Donkey kickback',img:null},{id:'g006',en:'Abductor Machine',pl:'Maszyna odwodzenie',img:null},{id:'g007',en:'Adductor Machine',pl:'Maszyna przywodzenie',img:null},{id:'g008',en:'Sumo Squat',pl:'Przysiad sumo pośladki',img:null},{id:'g009',en:'Single Leg Hip Thrust',pl:'Hip thrust jednonóż',img:null},{id:'g010',en:'Fire Hydrant',pl:'Fire hydrant',img:null},{id:'g011',en:'Clamshell',pl:'Clamshell',img:null},{id:'g012',en:'Romanian Deadlift',pl:'RDL pośladki',img:null}]},
};

// Use OFFLINE_EX_GROUPS as fallback
const EX_GROUPS=OFFLINE_EX_GROUPS;

// ===== BUILT-IN PROGRAMS =====
// Multi-week training plans. Each has a list of templates a trainee rotates through.
// `level` ∈ beginner/intermediate/advanced. `daysPerWeek` is informational.
const BUILTIN_PROGRAMS=[
  {
    id:'fbw_basic',builtin:true,
    name:{pl:'Full Body — Podstawowy',en:'Full Body — Basic',de:'Ganzkörper — Basis',es:'Cuerpo Completo — Básico'},
    short:{pl:'3 dni / tydzień',en:'3 days / week',de:'3 Tage / Woche',es:'3 días / semana'},
    description:{
      pl:'Klasyczny program full body dla początkujących. 3 sesje w tygodniu, każda angażuje całe ciało. Idealny do zbudowania bazy siłowej w pierwszych miesiącach na siłowni.',
      en:'Classic full body program for beginners. 3 sessions a week, each hits the whole body. Ideal for building a base of strength in your first months in the gym.',
      de:'Klassisches Ganzkörper-Programm für Anfänger. 3 Sitzungen pro Woche, jede trainiert den gesamten Körper. Ideal für den Aufbau einer Kraftbasis in den ersten Monaten.',
      es:'Programa clásico de cuerpo completo para principiantes. 3 sesiones por semana, cada una trabaja todo el cuerpo. Ideal para construir una base de fuerza en los primeros meses.'
    },
    level:'beginner',duration:8,daysPerWeek:3,types:['fbw'],
    templates:[
      {name:'FBW A',types:['fbw'],restDefault:90,exercises:[
        {en:'Barbell Squat',pl:'Przysiad ze sztangą',sets:3,reps:8,weight:60,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Bench Press',pl:'Wyciskanie sztangi płasko',sets:3,reps:8,weight:60,sup:false,gk:'chest',equipment:'barbell'},
        {en:'Barbell Row',pl:'Wiosłowanie sztangą',sets:3,reps:8,weight:50,sup:false,gk:'back',equipment:'barbell'},
        {en:'Overhead Press',pl:'Wyciskanie nad głowę',sets:3,reps:8,weight:30,sup:false,gk:'shoulders',equipment:'barbell'},
        {en:'Plank',pl:'Plank',sets:3,reps:30,weight:0,sup:false,gk:'abs',equipment:'body only'},
      ]},
      {name:'FBW B',types:['fbw'],restDefault:90,exercises:[
        {en:'Romanian Deadlift',pl:'Martwy ciąg rumuński',sets:3,reps:8,weight:70,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Incline Dumbbell Press',pl:'Wyciskanie hantli skos dodatni',sets:3,reps:10,weight:20,sup:false,gk:'chest',equipment:'dumbbell'},
        {en:'Lat Pulldown',pl:'Ściąganie drążka',sets:3,reps:10,weight:50,sup:false,gk:'back',equipment:'cable'},
        {en:'Lateral Raises',pl:'Unoszenia bokiem',sets:3,reps:12,weight:8,sup:false,gk:'shoulders',equipment:'dumbbell'},
        {en:'Hanging Leg Raises',pl:'Unoszenie nóg w zwisie',sets:3,reps:10,weight:0,sup:false,gk:'abs',equipment:'body only'},
      ]},
      {name:'FBW C',types:['fbw'],restDefault:90,exercises:[
        {en:'Leg Press',pl:'Suwnica / Leg press',sets:3,reps:10,weight:100,sup:false,gk:'legs',equipment:'machine'},
        {en:'Dumbbell Bench Press',pl:'Wyciskanie hantli płasko',sets:3,reps:10,weight:22,sup:false,gk:'chest',equipment:'dumbbell'},
        {en:'Seated Cable Row',pl:'Wiosłowanie siedząc kabel',sets:3,reps:10,weight:50,sup:false,gk:'back',equipment:'cable'},
        {en:'Dumbbell Curl',pl:'Uginanie hantli',sets:3,reps:12,weight:10,sup:false,gk:'arms',equipment:'dumbbell'},
        {en:'Triceps Pushdown',pl:'Prostowanie na wyciągu górnym',sets:3,reps:12,weight:25,sup:false,gk:'arms',equipment:'cable'},
      ]},
    ]
  },
  {
    id:'upper_lower',builtin:true,
    name:{pl:'Upper / Lower',en:'Upper / Lower',de:'Upper / Lower',es:'Tren superior / inferior'},
    short:{pl:'4 dni / tydzień',en:'4 days / week',de:'4 Tage / Woche',es:'4 días / semana'},
    description:{
      pl:'Czterodniowy split góra/dół. Każda część ciała trafiana 2× w tygodniu. Sprawdza się świetnie przy budowaniu masy i siły dla średnio-zaawansowanych.',
      en:'Four-day upper/lower split. Each body part hit 2× per week. Excellent for muscle and strength building for intermediates.',
      de:'Viertägiger Upper/Lower-Split. Jede Körperregion 2× pro Woche. Hervorragend für Muskel- und Kraftaufbau bei Fortgeschrittenen.',
      es:'Split de cuatro días tren superior/inferior. Cada parte del cuerpo se entrena 2× por semana. Excelente para construir masa y fuerza para nivel intermedio.'
    },
    level:'intermediate',duration:8,daysPerWeek:4,types:['upper','lower'],
    templates:[
      {name:'Upper A',types:['upper'],restDefault:90,exercises:[
        {en:'Bench Press',pl:'Wyciskanie sztangi płasko',sets:4,reps:6,weight:80,sup:false,gk:'chest',equipment:'barbell'},
        {en:'Barbell Row',pl:'Wiosłowanie sztangą',sets:4,reps:8,weight:70,sup:false,gk:'back',equipment:'barbell'},
        {en:'Overhead Press',pl:'Wyciskanie nad głowę',sets:3,reps:8,weight:40,sup:false,gk:'shoulders',equipment:'barbell'},
        {en:'Lat Pulldown',pl:'Ściąganie drążka',sets:3,reps:10,weight:55,sup:false,gk:'back',equipment:'cable'},
        {en:'Barbell Curl',pl:'Uginanie sztangi',sets:3,reps:10,weight:25,sup:false,gk:'arms',equipment:'barbell'},
        {en:'Triceps Pushdown',pl:'Prostowanie na wyciągu górnym',sets:3,reps:10,weight:30,sup:false,gk:'arms',equipment:'cable'},
      ]},
      {name:'Lower A',types:['lower'],restDefault:120,exercises:[
        {en:'Barbell Squat',pl:'Przysiad ze sztangą',sets:4,reps:6,weight:90,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Romanian Deadlift',pl:'Martwy ciąg rumuński',sets:4,reps:8,weight:90,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Leg Press',pl:'Suwnica / Leg press',sets:3,reps:12,weight:140,sup:false,gk:'legs',equipment:'machine'},
        {en:'Leg Curl',pl:'Uginanie nóg leżąc',sets:3,reps:12,weight:35,sup:false,gk:'legs',equipment:'machine'},
        {en:'Standing Calf Raises',pl:'Łydki stojąc',sets:4,reps:15,weight:60,sup:false,gk:'calves',equipment:'machine'},
      ]},
      {name:'Upper B',types:['upper'],restDefault:90,exercises:[
        {en:'Incline Dumbbell Press',pl:'Wyciskanie hantli skos dodatni',sets:4,reps:8,weight:28,sup:false,gk:'chest',equipment:'dumbbell'},
        {en:'Pull-Ups',pl:'Podciąganie na drążku',sets:4,reps:8,weight:0,sup:false,gk:'back',equipment:'body only'},
        {en:'Seated Dumbbell Press',pl:'Wyciskanie hantli siedząc',sets:3,reps:10,weight:18,sup:false,gk:'shoulders',equipment:'dumbbell'},
        {en:'Cable Row',pl:'Wiosłowanie kabel',sets:3,reps:10,weight:55,sup:false,gk:'back',equipment:'cable'},
        {en:'Hammer Curl',pl:'Uginanie młotkowe',sets:3,reps:12,weight:12,sup:true,gk:'arms',equipment:'dumbbell'},
        {en:'Overhead Triceps Extension',pl:'Prostowanie nad głową',sets:3,reps:12,weight:18,sup:true,gk:'arms',equipment:'dumbbell'},
      ]},
      {name:'Lower B',types:['lower'],restDefault:120,exercises:[
        {en:'Barbell Deadlift',pl:'Martwy ciąg',sets:4,reps:5,weight:110,sup:false,gk:'back',equipment:'barbell'},
        {en:'Front Squat',pl:'Przysiad ze sztangą z przodu',sets:3,reps:8,weight:60,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Bulgarian Split Squat',pl:'Bulgarian split squat',sets:3,reps:10,weight:14,sup:false,gk:'legs',equipment:'dumbbell'},
        {en:'Leg Extension',pl:'Prostowanie nóg',sets:3,reps:12,weight:40,sup:false,gk:'legs',equipment:'machine'},
        {en:'Seated Calf Raises',pl:'Łydki siedząc',sets:4,reps:15,weight:40,sup:false,gk:'calves',equipment:'machine'},
      ]},
    ]
  },
  {
    id:'ppl_classic',builtin:true,
    name:{pl:'Push / Pull / Legs',en:'Push / Pull / Legs',de:'Push / Pull / Legs',es:'Empuje / Tirón / Piernas'},
    short:{pl:'6 dni / tydzień',en:'6 days / week',de:'6 Tage / Woche',es:'6 días / semana'},
    description:{
      pl:'Klasyczny 6-dniowy split. Push (klatka, barki, triceps), Pull (plecy, biceps), Legs (nogi, łydki). Każda partia 2× w tygodniu. Wymaga regularności — najlepszy dla zaawansowanych.',
      en:'Classic 6-day split. Push (chest, shoulders, triceps), Pull (back, biceps), Legs (legs, calves). Each muscle group hit 2× per week. Requires consistency — best for advanced lifters.',
      de:'Klassischer 6-Tage-Split. Push (Brust, Schultern, Trizeps), Pull (Rücken, Bizeps), Legs (Beine, Waden). Jede Muskelgruppe 2× pro Woche.',
      es:'Split clásico de 6 días. Empuje (pecho, hombros, tríceps), Tirón (espalda, bíceps), Piernas. Cada grupo muscular 2× por semana.'
    },
    level:'advanced',duration:12,daysPerWeek:6,types:['upper','lower'],
    templates:[
      {name:'Push A',types:['upper'],restDefault:90,exercises:[
        {en:'Bench Press',pl:'Wyciskanie sztangi płasko',sets:4,reps:6,weight:85,sup:false,gk:'chest',equipment:'barbell'},
        {en:'Overhead Press',pl:'Wyciskanie nad głowę',sets:4,reps:8,weight:45,sup:false,gk:'shoulders',equipment:'barbell'},
        {en:'Incline Dumbbell Press',pl:'Wyciskanie hantli skos dodatni',sets:3,reps:10,weight:26,sup:false,gk:'chest',equipment:'dumbbell'},
        {en:'Lateral Raises',pl:'Unoszenia bokiem',sets:4,reps:12,weight:10,sup:false,gk:'shoulders',equipment:'dumbbell'},
        {en:'Triceps Pushdown',pl:'Prostowanie na wyciągu górnym',sets:3,reps:12,weight:35,sup:false,gk:'arms',equipment:'cable'},
        {en:'Overhead Triceps Extension',pl:'Prostowanie nad głową',sets:3,reps:12,weight:20,sup:false,gk:'arms',equipment:'dumbbell'},
      ]},
      {name:'Pull A',types:['upper'],restDefault:90,exercises:[
        {en:'Barbell Deadlift',pl:'Martwy ciąg',sets:3,reps:5,weight:120,sup:false,gk:'back',equipment:'barbell'},
        {en:'Pull-Ups',pl:'Podciąganie na drążku',sets:4,reps:8,weight:0,sup:false,gk:'back',equipment:'body only'},
        {en:'Barbell Row',pl:'Wiosłowanie sztangą',sets:4,reps:8,weight:75,sup:false,gk:'back',equipment:'barbell'},
        {en:'Face Pull',pl:'Face pull',sets:3,reps:15,weight:20,sup:false,gk:'shoulders',equipment:'cable'},
        {en:'Barbell Curl',pl:'Uginanie sztangi',sets:3,reps:10,weight:30,sup:false,gk:'arms',equipment:'barbell'},
        {en:'Hammer Curl',pl:'Uginanie młotkowe',sets:3,reps:12,weight:14,sup:false,gk:'arms',equipment:'dumbbell'},
      ]},
      {name:'Legs A',types:['lower'],restDefault:120,exercises:[
        {en:'Barbell Squat',pl:'Przysiad ze sztangą',sets:4,reps:6,weight:100,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Romanian Deadlift',pl:'Martwy ciąg rumuński',sets:3,reps:8,weight:90,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Leg Press',pl:'Suwnica / Leg press',sets:3,reps:12,weight:160,sup:false,gk:'legs',equipment:'machine'},
        {en:'Leg Curl',pl:'Uginanie nóg leżąc',sets:3,reps:12,weight:40,sup:false,gk:'legs',equipment:'machine'},
        {en:'Standing Calf Raises',pl:'Łydki stojąc',sets:5,reps:12,weight:80,sup:false,gk:'calves',equipment:'machine'},
      ]},
      {name:'Push B',types:['upper'],restDefault:90,exercises:[
        {en:'Incline Bench Press',pl:'Wyciskanie sztangi skos dodatni',sets:4,reps:8,weight:65,sup:false,gk:'chest',equipment:'barbell'},
        {en:'Seated Dumbbell Press',pl:'Wyciskanie hantli siedząc',sets:4,reps:10,weight:22,sup:false,gk:'shoulders',equipment:'dumbbell'},
        {en:'Dumbbell Bench Press',pl:'Wyciskanie hantli płasko',sets:3,reps:10,weight:28,sup:false,gk:'chest',equipment:'dumbbell'},
        {en:'Cable Lateral Raise',pl:'Unoszenia bokiem kabel',sets:4,reps:15,weight:8,sup:false,gk:'shoulders',equipment:'cable'},
        {en:'Skull Crushers',pl:'Skull crushers',sets:3,reps:10,weight:25,sup:false,gk:'arms',equipment:'barbell'},
        {en:'Triceps Dips',pl:'Dips triceps',sets:3,reps:10,weight:0,sup:false,gk:'arms',equipment:'body only'},
      ]},
      {name:'Pull B',types:['upper'],restDefault:90,exercises:[
        {en:'T-Bar Row',pl:'Wiosłowanie T-bar',sets:4,reps:8,weight:55,sup:false,gk:'back',equipment:'barbell'},
        {en:'Lat Pulldown',pl:'Ściąganie drążka',sets:4,reps:10,weight:60,sup:false,gk:'back',equipment:'cable'},
        {en:'Cable Row',pl:'Wiosłowanie kabel',sets:3,reps:12,weight:55,sup:false,gk:'back',equipment:'cable'},
        {en:'Bent-Over Lateral Raises',pl:'Wznosy w opadzie',sets:3,reps:15,weight:8,sup:false,gk:'shoulders',equipment:'dumbbell'},
        {en:'Preacher Curl',pl:'Uginanie na modlitewniku',sets:3,reps:10,weight:25,sup:false,gk:'arms',equipment:'barbell'},
        {en:'Cable Curl',pl:'Uginanie kablowe',sets:3,reps:12,weight:25,sup:false,gk:'arms',equipment:'cable'},
      ]},
      {name:'Legs B',types:['lower'],restDefault:120,exercises:[
        {en:'Front Squat',pl:'Przysiad ze sztangą z przodu',sets:4,reps:8,weight:65,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Stiff Leg Deadlift',pl:'Martwy ciąg nogi proste',sets:3,reps:10,weight:70,sup:false,gk:'legs',equipment:'barbell'},
        {en:'Bulgarian Split Squat',pl:'Bulgarian split squat',sets:3,reps:10,weight:16,sup:false,gk:'legs',equipment:'dumbbell'},
        {en:'Leg Extension',pl:'Prostowanie nóg',sets:3,reps:12,weight:45,sup:false,gk:'legs',equipment:'machine'},
        {en:'Hip Thrust',pl:'Hip thrust',sets:4,reps:10,weight:80,sup:false,gk:'glutes',equipment:'barbell'},
        {en:'Seated Calf Raises',pl:'Łydki siedząc',sets:4,reps:15,weight:50,sup:false,gk:'calves',equipment:'machine'},
      ]},
    ]
  },
];
let exDbCache=null;
const EXDB_CACHE_KEY='bs-fedb-v3';
const EXDB_CACHE_TTL=14*24*60*60*1000; // 14 days

// Clear old cache versions
try{['bs-wger-v1','bs-wger-v2','bs-wger-v3','bs-fedb-v1','bs-fedb-v2'].forEach(k=>localStorage.removeItem(k));}catch(e){}

const FEDB_BASE='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const FEDB_JSON_URL=FEDB_BASE+'/dist/exercises.json';
const FEDB_IMG_BASE=FEDB_BASE+'/exercises/';

async function fetchExerciseDb(){
  try{
    const cached=JSON.parse(localStorage.getItem(EXDB_CACHE_KEY)||'null');
    if(cached&&cached.ts&&Date.now()-cached.ts<EXDB_CACHE_TTL){
      exDbCache=cached.data;return exDbCache;
    }
  }catch(e){}
  try{
    const resp=await fetch(FEDB_JSON_URL);
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const all=await resp.json();
    const groups={};
    const seenPerGroup={};
    for(const ex of all){
      if(!ex||!ex.name)continue;
      if(SKIP_FEDB_CATEGORIES.has(ex.category))continue;
      const primary=(ex.primaryMuscles||[])[0];
      const gk=FEDB_MUSCLE_MAP[primary];
      if(!gk)continue;
      // Dedupe by normalized name within group
      const norm=ex.name.toLowerCase().replace(/[^a-z0-9]/g,'');
      if(!seenPerGroup[gk])seenPerGroup[gk]=new Set();
      if(seenPerGroup[gk].has(norm))continue;
      seenPerGroup[gk].add(norm);
      if(!groups[gk]){
        const lbl=GROUP_LABELS[gk]||{pl:gk,en:gk,de:gk,es:gk};
        groups[gk]={pl:lbl.pl,en:lbl.en,de:lbl.de||lbl.en,es:lbl.es||lbl.en,items:[]};
      }
      const imgs=Array.isArray(ex.images)?ex.images.map(p=>FEDB_IMG_BASE+p):[];
      groups[gk].items.push({
        id:'f_'+ex.id,
        en:ex.name,
        pl:ex.name,
        img:imgs[0]||null,
        imgs,
        gk,
        equipment:ex.equipment||'other',
        level:ex.level||null,
        force:ex.force||null,
        mechanic:ex.mechanic||null,
        instructions:Array.isArray(ex.instructions)?ex.instructions:[],
      });
    }
    Object.values(groups).forEach(g=>g.items.sort((a,b)=>a.en.localeCompare(b.en)));
    exDbCache={groups};
    try{localStorage.setItem(EXDB_CACHE_KEY,JSON.stringify({ts:Date.now(),data:exDbCache}));}catch(e){}
    return exDbCache;
  }catch(err){
    console.warn('Exercise DB fetch failed:',err);
    exDbCache=false;
    return false;
  }
}

function getExGroups(){
  if(exDbCache&&exDbCache.groups)return exDbCache.groups;
  return EX_GROUPS;
}

function exSvgByGroup(gk){
  const svgs={
    chest:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><ellipse cx="24" cy="26" rx="16" ry="10"/><path d="M8 26 Q24 12 40 26"/><line x1="24" y1="16" x2="24" y2="36"/></svg>`,
    back:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><rect x="14" y="10" width="20" height="28" rx="5"/><line x1="24" y1="10" x2="24" y2="38"/><line x1="14" y1="21" x2="34" y2="21"/><line x1="14" y1="29" x2="34" y2="29"/></svg>`,
    arms:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><path d="M18 38 L18 22 Q18 10 24 10 Q30 10 30 22 L30 38"/><path d="M18 24 Q24 17 30 24"/></svg>`,
    shoulders:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><circle cx="24" cy="20" r="8"/><path d="M10 38 Q10 30 24 28 Q38 30 38 38"/></svg>`,
    legs:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><path d="M17 10 L15 38"/><path d="M31 10 L33 38"/><path d="M17 10 Q24 6 31 10"/><path d="M17 24 Q24 28 31 24"/></svg>`,
    calves:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><path d="M20 10 Q18 24 16 38"/><path d="M28 10 Q30 24 32 38"/><path d="M20 10 Q24 7 28 10"/></svg>`,
    abs:`<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="1.8"><rect x="17" y="10" width="14" height="28" rx="4"/><line x1="17" y1="19" x2="31" y2="19"/><line x1="17" y1="26" x2="31" y2="26"/><line x1="17" y1="33" x2="31" y2="33"/><line x1="24" y1="10" x2="24" y2="38"/></svg>`,
  };
  return svgs[gk]||svgs.chest;
}

function dumbbellFallbackSvg(){
  return `<svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;"><path d="M5 20v8M10 17v14M16 21l16 6M32 21l-16 6M38 17v14M43 20v8"/></svg>`;
}
function exerciseThumbFallback(el){
  if(!el)return;
  el.innerHTML=dumbbellFallbackSvg();
  el.classList.add('ex-thumb-fallback');
}
window.exerciseThumbFallback=exerciseThumbFallback;

const DEFAULT_TEMPLATES=[
  {id:1,name:'Upper A',types:['upper'],restDefault:90,exercises:[
    {id:11,en:'Bench Press',pl:'Wyciskanie sztangi płasko',sets:4,reps:6,weight:80,sup:false,gk:'chest',equipment:'barbell'},
    {id:12,en:'Barbell Row',pl:'Wiosłowanie sztangą',sets:4,reps:8,weight:70,sup:false,gk:'back',equipment:'barbell'},
    {id:13,en:'Overhead Press',pl:'Wyciskanie nad głowę',sets:3,reps:8,weight:40,sup:false,gk:'shoulders',equipment:'barbell'},
    {id:14,en:'Lat Pulldown',pl:'Ściąganie drążka',sets:3,reps:10,weight:55,sup:false,gk:'back',equipment:'cable'},
    {id:15,en:'Barbell Curl',pl:'Uginanie sztangi',sets:3,reps:10,weight:25,sup:false,gk:'arms',equipment:'barbell'},
    {id:16,en:'Triceps Pushdown',pl:'Prostowanie na wyciągu górnym',sets:3,reps:10,weight:30,sup:false,gk:'arms',equipment:'cable'},
  ]},
  {id:2,name:'Lower A',types:['lower'],restDefault:120,exercises:[
    {id:21,en:'Barbell Squat',pl:'Przysiad ze sztangą',sets:4,reps:6,weight:90,sup:false,gk:'legs',equipment:'barbell'},
    {id:22,en:'Romanian Deadlift',pl:'Martwy ciąg rumuński',sets:4,reps:8,weight:90,sup:false,gk:'legs',equipment:'barbell'},
    {id:23,en:'Leg Press',pl:'Suwnica / Leg press',sets:3,reps:12,weight:140,sup:false,gk:'legs',equipment:'machine'},
    {id:24,en:'Leg Curl',pl:'Uginanie nóg leżąc',sets:3,reps:12,weight:35,sup:false,gk:'legs',equipment:'machine'},
    {id:25,en:'Standing Calf Raises',pl:'Łydki stojąc',sets:4,reps:15,weight:60,sup:false,gk:'calves',equipment:'machine'},
  ]},
  {id:3,name:'Upper B',types:['upper'],restDefault:90,exercises:[
    {id:31,en:'Incline Dumbbell Press',pl:'Wyciskanie hantli skos dodatni',sets:4,reps:8,weight:28,sup:false,gk:'chest',equipment:'dumbbell'},
    {id:32,en:'Pull-Ups',pl:'Podciąganie na drążku',sets:4,reps:8,weight:0,sup:false,gk:'back',equipment:'body only'},
    {id:33,en:'Seated Dumbbell Press',pl:'Wyciskanie hantli siedząc',sets:3,reps:10,weight:18,sup:false,gk:'shoulders',equipment:'dumbbell'},
    {id:34,en:'Cable Row',pl:'Wiosłowanie kabel',sets:3,reps:10,weight:55,sup:false,gk:'back',equipment:'cable'},
    {id:35,en:'Hammer Curl',pl:'Uginanie młotkowe',sets:3,reps:12,weight:12,sup:true,gk:'arms',equipment:'dumbbell'},
    {id:36,en:'Overhead Triceps Extension',pl:'Prostowanie nad głową',sets:3,reps:12,weight:18,sup:true,gk:'arms',equipment:'dumbbell'},
  ]},
  {id:4,name:'Lower B',types:['lower'],restDefault:120,exercises:[
    {id:41,en:'Barbell Deadlift',pl:'Martwy ciąg',sets:4,reps:5,weight:110,sup:false,gk:'back',equipment:'barbell'},
    {id:42,en:'Front Squat',pl:'Przysiad ze sztangą z przodu',sets:3,reps:8,weight:60,sup:false,gk:'legs',equipment:'barbell'},
    {id:43,en:'Bulgarian Split Squat',pl:'Bulgarian split squat',sets:3,reps:10,weight:14,sup:false,gk:'legs',equipment:'dumbbell'},
    {id:44,en:'Leg Extension',pl:'Prostowanie nóg',sets:3,reps:12,weight:40,sup:false,gk:'legs',equipment:'machine'},
    {id:45,en:'Seated Calf Raises',pl:'Łydki siedząc',sets:4,reps:15,weight:40,sup:false,gk:'calves',equipment:'machine'},
  ]},
];

// When false: all Pro gates disabled (everyone has full access). Flip to true when wiring IAP for release.
const PAYWALL_ACTIVE=true;
const PRO_PRICE='£5.99';

// Emails that may enable Coach Mode. Add/remove here as needed.
const COACH_WHITELIST=[
  'deka.dsz@gmail.com', // ← zamień na swój email
  'beestrong@beestrongapp.com',
  'beestrong.pt@gmail.com',
  'dylanlaura1513@gmail.com'
];
function isCoachAllowed(){
  const email=(S.user?.email||'').toLowerCase().trim();
  return COACH_WHITELIST.map(e=>e.toLowerCase().trim()).includes(email);
}

const ADMIN_EMAILS=['beestrong@beestrongapp.com','deka.dsz@gmail.com','beestrong.pt@gmail.com','dylanlaura1513@gmail.com'];
function isAdmin(){return S.user&&ADMIN_EMAILS.includes(S.user.email);}
// ===== EXERCISE PICKER =====
function showExPicker(currentExs,onConfirm){
  const selected=new Map(currentExs.map(e=>[e.pl||e.en||e.name,{...e}]));
  let searchQ='';
  let activeGks=new Set();
  let activeEquip=new Set();
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';

  function thumbHtml(e,gk){
    if(typeof navigator!=='undefined'&&navigator.onLine===false)return `<div class="ex-thumb-fallback">${dumbbellFallbackSvg()}</div>`;
    if(e.img){
      return`<img src="${e.img}" class="ex-thumb-img" loading="lazy" onerror="exerciseThumbFallback(this.parentElement)"/>`;
    }
    return `<div class="ex-thumb-fallback">${dumbbellFallbackSvg()}</div>`;
  }

  function updateList(){
    const listEl=document.getElementById('exPickerList');
    const cntEl=document.getElementById('exPickerCount');
    if(!listEl)return;
    if(exDbCache===null){
      listEl.innerHTML=`<div style="text-align:center;padding:32px;color:var(--text2);"><div class="spinner" style="margin:0 auto 12px;"></div><div style="font-size:13px;">${lang==='pl'?'Ładowanie ćwiczeń z bazy danych...':'Loading exercises from database...'}</div></div>`;
      if(cntEl)cntEl.textContent=`${t('confirmSelected')} (${selected.size})`;
      return;
    }
    const exGroups=getExGroups();
    const gks=Object.keys(exGroups);
    const html=gks.map(gk=>{
      if(activeGks.size>0&&!activeGks.has(gk))return'';
      const grp=exGroups[gk];
      const label=grp[lang]||grp.pl||grp.en||gk;
      const items=grp.items.filter(e=>{
        if(searchQ&&!((e[lang]||e.pl||e.en||'').toLowerCase().includes(searchQ.toLowerCase())))return false;
        if(activeEquip.size>0&&!activeEquip.has(e.equipment))return false;
        return true;
      });
      if(!items.length)return'';
      return'<div class="ex-picker-group"><div class="ex-picker-group-title">'+label+'</div>'+items.map(e=>{
        const nm=e[lang]||e.pl||e.en||'';
        const key=e.pl||e.en;
        const isSel=selected.has(key);
        const safeId=(e.id||'').toString().replace(/'/g,"\'");
        return`<div class="ex-picker-item ${isSel?'selected':''}" onclick="toggleExPick('${safeId}','${gk}')">
          <div class="ex-thumb">${thumbHtml(e,gk)}</div>
          <div class="ex-info"><div class="ex-info-name">${nm}</div><div class="ex-info-group">${label}</div></div>
          <button class="ex-info-btn" onclick="event.stopPropagation();showExerciseDetail('${safeId}','${gk}')" aria-label="Details"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <div class="ex-check">${isSel?'✓':''}</div>
        </div>`;
      }).join('')+'</div>';
    }).join('');
    listEl.innerHTML=html||`<div style="text-align:center;padding:32px;color:var(--text3);font-size:13px;">${lang==='pl'?'Brak wyników':'No results'}</div>`;
    if(cntEl)cntEl.textContent=`${t('confirmSelected')} (${selected.size})`;
  }

  function renderFilterChips(){
    const chipsEl=document.getElementById('exFilterChips');
    if(!chipsEl)return;
    const exGroups=getExGroups();
    const gks=Object.keys(exGroups);
    const allLabel=lang==='pl'?'Wszystkie':'All';
    const chips=[
      `<button onclick="toggleExGk('__all__')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${activeGks.size===0?'var(--accent)':'none'};color:${activeGks.size===0?'var(--btn-text)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${allLabel}</button>`,
      ...gks.map(gk=>{
        const grp=exGroups[gk];const label=grp[lang]||grp.pl||grp.en||gk;const isAct=activeGks.has(gk);
        return`<button onclick="toggleExGk('${gk}')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent)':'none'};color:${isAct?'var(--btn-text)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${label}</button>`;
      })
    ].join('');
    chipsEl.innerHTML=chips;
  }

  function renderEquipChips(){
    const el=document.getElementById('exEquipChips');
    if(!el)return;
    // Pro gate: hide equipment filter row entirely for free users
    if(!isPro()){el.innerHTML='';el.style.display='none';return;}
    // Only show equipment types that exist in the loaded data
    const exGroups=getExGroups();
    const present=new Set();
    Object.values(exGroups).forEach(g=>g.items.forEach(it=>{if(it.equipment)present.add(it.equipment);}));
    const order=['barbell','dumbbell','machine','cable','body only','kettlebells','bands','e-z curl bar','medicine ball','exercise ball','foam roll','other'];
    const eqs=order.filter(k=>present.has(k));
    if(!eqs.length){el.innerHTML='';el.style.display='none';return;}
    el.style.display='flex';
    const allLabel=lang==='pl'?'Cały sprzęt':'All equipment';
    const chips=[
      `<button onclick="toggleExEquip('__all__')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${activeEquip.size===0?'var(--accent-dim)':'none'};color:${activeEquip.size===0?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${allLabel}</button>`,
      ...eqs.map(eq=>{
        const lbl=(EQUIPMENT_LABELS[eq]||{en:eq,pl:eq})[lang]||eq;
        const isAct=activeEquip.has(eq);
        const safeEq=eq.replace(/'/g,"\\'");
        return`<button onclick="toggleExEquip('${safeEq}')" style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);background:${isAct?'var(--accent-dim)':'none'};color:${isAct?'var(--accent)':'var(--text2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0;">${lbl}</button>`;
      })
    ].join('');
    el.innerHTML=chips;
  }

  const isLoaded=exDbCache!==null;
  const statusBadge=exDbCache===null?'':exDbCache?` <span style="font-size:11px;color:var(--accent);font-weight:500;">✓ ${Object.values(exDbCache.groups||{}).reduce((a,g)=>a+g.items.length,0)} ćwiczeń</span>`:' <span style="font-size:11px;color:var(--text3);">(tryb offline)</span>';

  ov.innerHTML=`<div class="modal" style="max-height:95dvh;display:flex;flex-direction:column;">
    <button class="modal-back" onclick="goBackToPicker()">${t('backBtn')}</button>
    <div style="font-size:17px;font-weight:700;margin-bottom:10px;">${t('pickExercises')}${statusBadge}</div>
    <input type="text" id="exSearch" placeholder="${t('search')}" value="${searchQ}" oninput="onExSearch(this.value)" style="margin-bottom:10px;flex-shrink:0;"/>
    <div id="exFilterChips" style="display:flex;gap:7px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;flex-shrink:0;scrollbar-width:none;"></div>
    <div id="exEquipChips" style="display:flex;gap:7px;overflow-x:auto;padding-bottom:10px;-webkit-overflow-scrolling:touch;flex-shrink:0;scrollbar-width:none;"></div>
    <div id="exPickerList" style="overflow-y:auto;flex:1;min-height:0;"></div>
    <div style="padding:12px 0 0;flex-shrink:0;">
      <button class="btn btn-primary" id="exPickerCount" onclick="confirmExPick()">${t('confirmSelected')} (${selected.size})</button>
    </div>
  </div>`;

  document.body.appendChild(ov);S.modal=ov;
  ov._backHandler=()=>{window.goBackToPicker();return true;};
  renderFilterChips();renderEquipChips();updateList();

  // Fetch DB if not yet loaded
  if(exDbCache===null){
    fetchExerciseDb().then(()=>{
      // Update header badge
      const header=ov.querySelector('.modal > div:nth-child(2)');
      if(header&&exDbCache){
        const count=Object.values(exDbCache.groups||{}).reduce((a,g)=>a+g.items.length,0);
        header.innerHTML=`${t('pickExercises')} <span style="font-size:11px;color:var(--accent);font-weight:500;">✓ ${count} ${lang==='pl'?'ćwiczeń':'exercises'}</span>`;
      }
      renderFilterChips();renderEquipChips();updateList();
    });
  }

  window.toggleExGk=gk=>{
    if(gk==='__all__'){activeGks.clear();}
    else{if(activeGks.has(gk))activeGks.delete(gk);else activeGks.add(gk);}
    renderFilterChips();updateList();
  };
  window.toggleExEquip=eq=>{
    if(eq==='__all__'){activeEquip.clear();}
    else{if(activeEquip.has(eq))activeEquip.delete(eq);else activeEquip.add(eq);}
    renderEquipChips();updateList();
  };
  window.toggleExPick=(exId,gk)=>{
    const exGroups=getExGroups();
    const grp=exGroups[gk];if(!grp)return;
    const e=grp.items.find(x=>(x.id||'').toString()===exId);if(!e)return;
    const key=e.pl||e.en;
    if(selected.has(key))selected.delete(key);
    else selected.set(key,{id:e.id,pl:e.pl||e.en,en:e.en||e.pl,img:e.img||null,gk:gk,equipment:e.equipment||null,sets:1,reps:10,weight:0,sup:false});
    // Toggle in-place — no scroll jump
    const listEl=document.getElementById('exPickerList');
    if(listEl){
      listEl.querySelectorAll('.ex-picker-item').forEach(el=>{
        if((el.getAttribute('onclick')||'').includes(`'${exId}'`)){
          const isSel=selected.has(key);
          el.classList.toggle('selected',isSel);
          const chk=el.querySelector('.ex-check');
          if(chk)chk.textContent=isSel?'✓':'';
        }
      });
    }
    const cntEl=document.getElementById('exPickerCount');
    if(cntEl)cntEl.textContent=`${t('confirmSelected')} (${selected.size})`;
  };
  window.onExSearch=q=>{searchQ=q;updateList();};
  window.goBackToPicker=()=>{closeModal();onConfirm(Array.from(selected.values()));};
  window.confirmExPick=()=>{closeModal();onConfirm(Array.from(selected.values()));};
}
function closeModal(){
  if(S.modal){
    if(S.modal._cleanup)try{S.modal._cleanup();}catch(e){}
    S.modal.remove();S.modal=null;
  }
}

// ===== EXERCISE DETAIL =====
// Find an exercise in the loaded DB (or offline fallback) by id; optional gk hint speeds it up.
function findExerciseById(id,gkHint){
  const groups=getExGroups();
  if(gkHint&&groups[gkHint]){
    const f=groups[gkHint].items.find(e=>String(e.id)===String(id));
    if(f)return{e:f,gk:gkHint};
  }
  for(const gk of Object.keys(groups)){
    const f=groups[gk].items.find(e=>String(e.id)===String(id));
    if(f)return{e:f,gk};
  }
  return null;
}
function closeDetailModal(){
  if(S.detailModal){
    if(S.detailModal._cleanup)try{S.detailModal._cleanup();}catch(e){}
    S.detailModal.remove();
    S.detailModal=null;
  }
}
window.closeDetailModal=closeDetailModal;

function findExerciseMatch(ex){
  if(!ex)return null;
  const byId=ex.id!=null?findExerciseById(ex.id,ex.gk):null;
  if(byId)return byId;
  const wanted=String(ex.en||ex.pl||ex.name||'').trim().toLowerCase();
  if(!wanted)return null;
  const groups=getExGroups();
  for(const gk of Object.keys(groups)){
    const f=(groups[gk].items||[]).find(e=>{
      const names=[e.en,e.pl,e.name].filter(Boolean).map(v=>String(v).trim().toLowerCase());
      return names.includes(wanted);
    });
    if(f)return{e:f,gk};
  }
  return null;
}

function openExerciseDetailModal(e,gk){
  closeDetailModal();
  const isPL=lang==='pl';
  const nm=e[lang]||e.pl||e.en||'';
  const grp=getExGroups()[gk];
  const grpLbl=grp?(grp[lang]||grp.pl||grp.en||gk):gk;
  const eqLbl=e.equipment?((EQUIPMENT_LABELS[e.equipment]||{en:e.equipment,pl:e.equipment})[lang]||e.equipment):'';
  const levelMap={beginner:{pl:'Początkujący',en:'Beginner',de:'Anfänger',es:'Principiante'},intermediate:{pl:'Średniozaawansowany',en:'Intermediate',de:'Fortgeschritten',es:'Intermedio'},expert:{pl:'Zaawansowany',en:'Expert',de:'Experte',es:'Experto'}};
  const lvlLbl=e.level?((levelMap[e.level]||{})[lang]||e.level):'';
  const tag=(text,color)=>text?`<span style="display:inline-block;font-size:11px;padding:4px 10px;border-radius:14px;background:${color||'var(--bg4)'};color:${color?'var(--accent)':'var(--text2)'};font-weight:600;margin:0 6px 6px 0;white-space:nowrap;">${text}</span>`:'';
  const tagsHtml=tag(grpLbl,'var(--accent-dim)')+tag(eqLbl)+tag(lvlLbl)+tag(e.force)+tag(e.mechanic);
  const imgs=Array.isArray(e.imgs)&&e.imgs.length?e.imgs:(e.img?[e.img]:[]);
  const imgHtml=imgs.length
    ?`<div style="position:relative;width:100%;aspect-ratio:1.2;background:var(--bg3);border-radius:14px;overflow:hidden;margin-bottom:14px;">
        ${imgs.map((src,i)=>`<img src="${src}" data-frame="${i}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:${i===0?1:0};transition:opacity 0.25s;" loading="lazy"/>`).join('')}
      </div>`
    :`<div style="width:100%;aspect-ratio:1.2;background:var(--bg3);border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;color:var(--text3);font-size:13px;">${isPL?'Brak zdjęcia':'No image'}</div>`;
  const instr=Array.isArray(e.instructions)?e.instructions:[];
  const instrHtml=instr.length
    ?`<div style="font-size:13px;font-weight:600;margin:8px 0 8px;color:var(--text2);">${isPL?'Jak wykonać':'How to perform'}</div>`+
      `<ol style="padding-left:20px;margin:0;font-size:13px;line-height:1.6;color:var(--text2);">${instr.map(s=>`<li style="margin-bottom:8px;">${s}</li>`).join('')}</ol>`
    :`<div style="font-size:13px;color:var(--text3);text-align:center;padding:18px 0;">${isPL?'Brak opisu':'No description'}</div>`;
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.style.zIndex='250'; // above default modals (200) so it stacks over picker
  ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
    <div class="modal-handle"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;">
      <div style="font-size:18px;font-weight:700;line-height:1.25;flex:1;">${nm}</div>
      <button class="rm-btn" onclick="closeDetailModal()" style="width:34px;height:34px;flex-shrink:0;font-size:18px;">✕</button>
    </div>
    <div style="overflow-y:auto;flex:1;min-height:0;padding-bottom:6px;">
      ${imgHtml}
      <div style="margin-bottom:10px;">${tagsHtml}</div>
      ${instrHtml}
    </div>
  </div>`;
  // Tap on backdrop closes detail modal too
  ov.addEventListener('click',ev=>{if(ev.target===ov)closeDetailModal();});
  document.body.appendChild(ov);S.detailModal=ov;
  // Animate between frames if multiple images
  if(imgs.length>=2){
    let frame=0;
    const interval=setInterval(()=>{
      if(!S.detailModal||S.detailModal!==ov){clearInterval(interval);return;}
      frame=(frame+1)%imgs.length;
      ov.querySelectorAll('img[data-frame]').forEach(im=>{
        im.style.opacity=(+im.dataset.frame===frame)?'1':'0';
      });
    },1100);
    ov._cleanup=()=>clearInterval(interval);
  }
}

function showExerciseDetail(id,gkHint){
  const found=findExerciseById(id,gkHint);
  if(!found){alert(lang==='pl'?'Nie znaleziono ćwiczenia':'Exercise not found');return;}
  openExerciseDetailModal(found.e,found.gk);
}
window.showExerciseDetail=showExerciseDetail;

function showWorkoutExerciseDetail(ei){
  const ex=S.activeWorkout?.exercises?.[ei];
  if(!ex)return;
  const found=findExerciseMatch(ex);
  openExerciseDetailModal(found?.e||ex,found?.gk||ex.gk||'other');
}
window.showWorkoutExerciseDetail=showWorkoutExerciseDetail;

// ===== PRO / PAYWALL =====
function isPro(){
  if(!PAYWALL_ACTIVE)return true; // dev/free phase: everyone unlocked
  return !!S.isPro;
}
function requirePro(featureKey){
  if(isPro())return true;
  showPaywall(featureKey);
  return false;
}
function showCoachModeInfo(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  const logoSrc=isDark?'./logo.jpg':'./light_logo.png';
  ov.innerHTML=`<div class="modal" style="max-height:92dvh;overflow-y:auto;">
    <div class="modal-handle"></div>
    <div style="text-align:center;margin-bottom:18px;">
      <img src="${logoSrc}" alt="BeeStrong" style="width:52px;height:52px;object-fit:contain;border-radius:12px;display:block;margin:0 auto 10px;"/>
      <div style="font-size:20px;font-weight:800;letter-spacing:-0.4px;">Coach Mode</div>
      <div style="font-size:13px;color:var(--text2);margin-top:4px;">${tt({pl:'Zarządzaj klientami jak profesjonalista',en:'Manage your clients like a pro',de:'Verwalte deine Klienten professionell',es:'Gestiona tus clientes como un profesional'})}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
      ${[
        {icon:'👥',t:{pl:'Lista klientów',en:'Client list',de:'Kundenliste',es:'Lista de clientes'},d:{pl:'Zapraszaj klientów i śledź ich postępy',en:'Invite clients and track their progress',de:'Lade Klienten ein und verfolge ihre Fortschritte',es:'Invita clientes y sigue su progreso'}},
        {icon:'📋',t:{pl:'Przypisywanie programów',en:'Program assignment',de:'Programmzuweisung',es:'Asignación de programas'},d:{pl:'Wysyłaj spersonalizowane plany treningowe',en:'Send personalised training plans to clients',de:'Sende personalisierte Trainingspläne',es:'Envía planes de entrenamiento personalizados'}},
        {icon:'🔔',t:{pl:'Powiadomienia w czasie rzeczywistym',en:'Real-time notifications',de:'Echtzeit-Benachrichtigungen',es:'Notificaciones en tiempo real'},d:{pl:'Klienci otrzymują plan natychmiast',en:'Clients receive their plan instantly',de:'Klienten erhalten ihren Plan sofort',es:'Los clientes reciben su plan al instante'}},
      ].map(f=>`<div style="display:flex;align-items:flex-start;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;">
        <span style="font-size:22px;flex-shrink:0;">${f.icon}</span>
        <div><div style="font-size:13px;font-weight:600;margin-bottom:2px;">${tt(f.t)}</div><div style="font-size:12px;color:var(--text2);">${tt(f.d)}</div></div>
      </div>`).join('')}
    </div>
    <div style="background:rgba(0,200,83,0.08);border:1px solid rgba(0,200,83,0.30);border-radius:10px;padding:12px 14px;margin-bottom:18px;font-size:12px;color:var(--text2);line-height:1.5;">
      ${tt({pl:'Coach Mode to subskrypcja dla trenerów za £19.99 miesięcznie. Odblokowuje klientów, programy, chat i podgląd progresu.',en:'Coach Mode is a trainer subscription at £19.99 per month. It unlocks clients, programs, chat, and progress visibility.',de:'Coach Mode ist ein Trainer-Abo fuer £19.99 pro Monat. Es schaltet Kunden, Programme, Chat und Fortschrittsansicht frei.',es:'Coach Mode es una suscripcion para entrenadores por £19.99 al mes. Desbloquea clientes, programas, chat y vista de progreso.'})}
    </div>
    <button class="btn btn-primary" onclick="subscribeCoach()" style="width:100%;margin-bottom:10px;">SUBSCRIBE</button>
    <button class="btn btn-ghost" onclick="closeModal()">${tt({pl:'Zamknij',en:'Close',de:'Schließen',es:'Cerrar'})}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.showCoachModeInfo=showCoachModeInfo;

function showPaywall(featureKey){
  closeModal();
  const leadIns={
    template_limit:tt({pl:'Wersja darmowa pozwala na 3 szablony. Pro daje nieograniczone.',en:'Free version is limited to 3 templates. Pro is unlimited.',de:'Die kostenlose Version erlaubt 3 Vorlagen. Pro ist unbegrenzt.',es:'La versión gratuita permite 3 plantillas. Pro es ilimitado.'}),
    your_lifts:tt({pl:'Pełna analiza progresu (filtr sprzętu, top ćwiczenia) jest częścią Pro.',en:'Full progress view (equipment filter, top exercises) is part of Pro.',de:'Volle Fortschrittsansicht (Gerätefilter, Top-Übungen) ist Teil von Pro.',es:'Vista completa de progreso (filtro de equipo, top ejercicios) es parte de Pro.'}),
    equipment_filter:tt({pl:'Filtr po sprzęcie w bazie ćwiczeń to feature Pro.',en:'Equipment filter in the exercise database is a Pro feature.',de:'Gerätefilter in der Übungsdatenbank ist eine Pro-Funktion.',es:'Filtro de equipo en la base de datos es función Pro.'}),
    full_db:tt({pl:'Pełna baza ~700 ćwiczeń z obrazkami to feature Pro.',en:'Full database of ~700 exercises with images is a Pro feature.',de:'Volle Datenbank mit ~700 Übungen und Bildern ist eine Pro-Funktion.',es:'Base completa de ~700 ejercicios con imágenes es función Pro.'}),
    body_measure:tt({pl:'Wszystkie pomiary ciała (poza wagą) są w Pro.',en:'All body measurements (beyond weight) are Pro.',de:'Alle Körpermaße (außer Gewicht) sind Pro.',es:'Todas las medidas corporales (más allá del peso) son Pro.'}),
    export:tt({pl:'Eksport / backup danych to feature Pro.',en:'Data export / backup is a Pro feature.',de:'Datenexport / Backup ist eine Pro-Funktion.',es:'Exportación / backup de datos es función Pro.'}),
  };
  const leadIn=leadIns[featureKey]||'';
  const B=(pl,en,de,es)=>tt({pl,en,de,es});
  const benefits=[
    ['📋',B('Nieograniczone szablony treningowe','Unlimited workout templates','Unbegrenzte Trainingsvorlagen','Plantillas de entrenamiento ilimitadas')],
    ['🏋️',B('Pełna baza ~700 ćwiczeń z obrazkami','Full ~700-exercise database with images','Volle ~700-Übungen-Datenbank mit Bildern','Base de ~700 ejercicios con imágenes')],
    ['🔧',B('Filtr po sprzęcie (multi-choose)','Equipment filter (multi-choose)','Gerätefilter (Mehrfachauswahl)','Filtro de equipo (multi-selección)')],
    ['📊',B('Twoje wyniki: top ćwiczenia + analiza per partia','Your Lifts: top exercises + per-muscle analysis','Deine Leistung: Top-Übungen + Muskel-Analyse','Tu Rendimiento: top ejercicios + análisis por músculo')],
    ['📏',B('Wszystkie pomiary ciała + wykresy','All body measurements + charts','Alle Körpermaße + Diagramme','Todas las medidas corporales + gráficos')],
    ['💾',B('Eksport i backup danych','Data export and backup','Datenexport und Backup','Exportación y backup de datos')],
    ['🚫',B('Bez reklam','Ad-free','Werbefrei','Sin anuncios')],
  ];
  const benefitsHtml=benefits.map(([icon,text])=>`<div style="display:flex;gap:12px;align-items:flex-start;padding:7px 0;font-size:14px;"><div style="flex-shrink:0;font-size:18px;line-height:1.2;">${icon}</div><div style="flex:1;">${text}</div></div>`).join('');
  const logoSrc=isDark?'./logo.jpg':'./light_logo.png';
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
    <div class="modal-handle"></div>
    <div style="text-align:center;margin-bottom:6px;">
      <img src="${logoSrc}" alt="BeeStrong" style="width:54px;height:54px;object-fit:contain;border-radius:12px;display:block;margin:0 auto;"/>
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.4px;margin-top:8px;">BeeStrong Pro</div>
      <div style="font-size:13px;color:var(--text2);margin-top:4px;">${tt({pl:'Odblokuj wszystko, co BeeStrong ma do zaoferowania.',en:'Unlock everything BeeStrong has to offer.',de:'Entdecke alles, was BeeStrong zu bieten hat.',es:'Desbloquea todo lo que BeeStrong tiene para ofrecer.'})}</div>
    </div>
    ${leadIn?`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--text2);margin:14px 0 4px;">${leadIn}</div>`:'<div style="height:14px;"></div>'}
    <div style="overflow-y:auto;flex:1;min-height:0;padding:6px 0;">${benefitsHtml}</div>
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
      <button class="btn btn-primary" onclick="buyPro()">${tt({pl:'Kup Pro',en:'Get Pro',de:'Pro kaufen',es:'Obtener Pro'})} — ${PRO_PRICE}</button>
      <button class="btn btn-ghost" onclick="restorePurchase()" style="font-size:13px;">${tt({pl:'Przywróć zakup',en:'Restore purchase',de:'Kauf wiederherstellen',es:'Restaurar compra'})}</button>
      <button class="btn btn-ghost" onclick="closeModal()" style="font-size:13px;color:var(--text3);">${tt({pl:'Może później',en:'Maybe later',de:'Vielleicht später',es:'Quizás más tarde'})}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.showPaywall=showPaywall;
window.buyPro=function(){
  // TODO: wire up Google Play Billing / Digital Goods API for TWA here.
  alert(lang==='pl'?'IAP nie jest jeszcze podłączone. Użyj [dev] toggle do testów.':'IAP not wired up yet. Use [dev] toggle to test.');
};
window.restorePurchase=function(){
  alert(lang==='pl'?'IAP nie jest jeszcze podłączone.':'IAP not wired up yet.');
};

// Cleanup legacy plate calculator config from localStorage (feature removed)
try{localStorage.removeItem('bs-plate-cfg-v1');}catch(e){}

// ===== TIMER ALERTS =====
function beepSound(freq,dur,vol){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();const gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.type='sine';osc.frequency.value=freq||880;
    gain.gain.setValueAtTime(vol||0.25,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(dur||0.15));
    osc.start(ctx.currentTime);osc.stop(ctx.currentTime+(dur||0.15)+0.05);
    setTimeout(()=>{try{ctx.close();}catch(e){}},((dur||0.15)+0.2)*1000);
  }catch(e){}
}
function timerAlert(type){
  if(type==='warning'){
    beepSound(980,0.06,0.18);
    if(navigator.vibrate)navigator.vibrate(35);
  } else { // done
    beepSound(740,0.16,0.24);
    setTimeout(()=>beepSound(980,0.22,0.34),210);
    if(navigator.vibrate)navigator.vibrate([180,70,260]);
  }
}

// ===== SUPERSET LABELS =====
function computeSupLabels(exercises){
  const labels=[];
  let groupIdx=0,i=0;
  while(i<exercises.length){
    if(!exercises[i].sup){labels.push('');i++;continue;}
    const ch=String.fromCharCode(65+groupIdx); // A, B, C...
    let j=i;
    while(j<exercises.length&&exercises[j].sup){labels.push(ch+(j-i+1));j++;}
    groupIdx++;i=j;
  }
  return labels;
}

function moveArrayItem(arr,from,to){
  if(!Array.isArray(arr)||from===to||from<0||to<0||from>=arr.length||to>arr.length)return false;
  const [item]=arr.splice(from,1);
  arr.splice(to,0,item);
  return true;
}

function reorderHandle(label){
  const safe=label||'Reorder';
  return `<button type="button" class="drag-handle" aria-label="${safe}" title="${safe}">
    <span></span><span></span><span></span>
  </button>`;
}

function initExerciseReorder(root,onMove){
  const container=typeof root==='string'?document.querySelector(root):root;
  if(!container||container._reorderReady)return;
  container._reorderReady=true;
  let state=null;
  const clearMarkers=()=>{
    container.querySelectorAll('.drop-before,.drop-after').forEach(el=>el.classList.remove('drop-before','drop-after'));
  };
  const getInsertIndex=y=>{
    const items=[...container.querySelectorAll('[data-reorder-item]')];
    const active=state?.card;
    const others=items.filter(el=>el!==active);
    for(const item of others){
      const r=item.getBoundingClientRect();
      if(y<r.top+r.height/2){
        const idx=Number(item.dataset.reorderIndex);
        return idx>state.from?idx-1:idx;
      }
    }
    return items.length-1;
  };
  const markTarget=y=>{
    clearMarkers();
    const items=[...container.querySelectorAll('[data-reorder-item]')];
    const active=state?.card;
    const others=items.filter(el=>el!==active);
    if(!others.length)return;
    for(const item of others){
      const r=item.getBoundingClientRect();
      if(y<r.top+r.height/2){item.classList.add('drop-before');return;}
    }
    others[others.length-1].classList.add('drop-after');
  };
  const finish=()=>{
    if(!state)return;
    const {card,from,active,lastY,pointerId,handle,timer}=state;
    const to=active?getInsertIndex(lastY):from;
    clearTimeout(timer);
    try{handle.releasePointerCapture(pointerId);}catch(e){}
    card.classList.remove('dragging');
    card.style.transform='';
    document.body.classList.remove('is-reordering');
    clearMarkers();
    state=null;
    if(active&&to!==from)onMove(from,to);
  };
  const startDrag=()=>{
    if(!state)return;
    const beforeTop=state.card.getBoundingClientRect().top;
    state.active=true;
    state.card.classList.add('dragging');
    document.body.classList.add('is-reordering');
    const afterTop=state.card.getBoundingClientRect().top;
    state.baseTranslateY=beforeTop-afterTop;
    state.card.style.transform=`translateY(${state.baseTranslateY}px)`;
  };
  container.addEventListener('pointerdown',ev=>{
    const handle=ev.target.closest('.drag-handle');
    if(!handle||!container.contains(handle))return;
    const card=handle.closest('[data-reorder-item]');
    if(!card)return;
    ev.preventDefault();
    handle.setPointerCapture(ev.pointerId);
    state={handle,card,pointerId:ev.pointerId,from:Number(card.dataset.reorderIndex),startY:ev.clientY,lastY:ev.clientY,active:false,timer:null};
    state.timer=setTimeout(startDrag,ev.pointerType==='mouse'?0:230);
  });
  container.addEventListener('pointermove',ev=>{
    if(!state||ev.pointerId!==state.pointerId)return;
    state.lastY=ev.clientY;
    if(!state.active){
      if(Math.abs(ev.clientY-state.startY)>10&&ev.pointerType==='mouse')startDrag();
      return;
    }
    ev.preventDefault();
    state.card.style.transform=`translateY(${(state.baseTranslateY||0)+ev.clientY-state.startY}px)`;
    markTarget(ev.clientY);
  });
  container.addEventListener('pointerup',ev=>{if(state&&ev.pointerId===state.pointerId)finish();});
  container.addEventListener('pointercancel',ev=>{if(state&&ev.pointerId===state.pointerId)finish();});
}
window.initExerciseReorder=initExerciseReorder;
window.moveArrayItem=moveArrayItem;
window.reorderHandle=reorderHandle;

// ===== STREAK =====
function getWorkoutStreak(){
  const dates=new Set(Object.values(S.workouts).map(w=>w.date).filter(Boolean));
  let streak=0;
  const d=new Date();
  if(!dates.has(today()))d.setDate(d.getDate()-1);
  for(let guard=0;guard<3650;guard++){
    const ds=d.toISOString().split('T')[0];
    if(!dates.has(ds))break;
    streak++;
    d.setDate(d.getDate()-1);
  }
  return streak;
}

// ===== PR DETECTION =====
// Returns the best estimated 1RM across ALL saved workouts for a given exercise name
function _histBestE1RM(exName_){
  const nm=String(exName_||'').trim().toLowerCase();
  if(!nm)return 0;
  let best=0;
  for(const w of Object.values(S.workouts)){
    for(const ex of (w.exercises||[])){
      const n=(ex[lang]||ex.pl||ex.en||ex.name||'').trim().toLowerCase();
      if(n!==nm)continue;
      for(const s of (ex.sets||[])){
        const wt=+(s.weight||0),r=+(s.reps||0);
        if(wt<=0||r<=0)continue;
        const e=epleyEst1RM(wt,r);
        if(e>best)best=e;
      }
    }
  }
  return best;
}
function detectPRs(exercises){
  const prs=[];
  const seen=new Set();
  for(const ex of exercises){
    const nm=(ex[lang]||ex.pl||ex.en||ex.name||'').trim();
    if(!nm||seen.has(nm.toLowerCase()))continue;
    seen.add(nm.toLowerCase());
    const histBest=_histBestE1RM(nm);
    let bestNew=0,bestSet=null;
    for(const s of (ex.sets||[])){
      const wt=+(s.weight||0),r=+(s.reps||0);
      if(wt<=0||r<=0)continue;
      const e1=epleyEst1RM(wt,r);
      if(e1>bestNew){bestNew=e1;bestSet={weight:wt,reps:r};}
    }
    if(bestNew>0&&bestNew>histBest&&bestSet){
      prs.push({name:nm,weight:bestSet.weight,reps:bestSet.reps,e1RM:bestNew,prev:histBest});
    }
  }
  return prs;
}

// ===== ONBOARDING WIZARD =====
function showOnboarding(){
  let step=0;
  let goal=S.goal||'strength';
  let level=S.level||'beginner';
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  document.body.appendChild(ov);S.modal=ov;
  const GOALS=[
    {key:'strength',    icon:'⚡',label:tt({pl:'Siła',         en:'Strength',     de:'Kraft',         es:'Fuerza'})},
    {key:'hypertrophy', icon:'💪',label:tt({pl:'Masa mięśniowa',en:'Muscle mass',  de:'Muskelmasse',   es:'Masa muscular'})},
    {key:'fat_loss',    icon:'🔥',label:tt({pl:'Redukcja',      en:'Fat loss',     de:'Fettabbau',     es:'Pérdida de grasa'})},
    {key:'health',      icon:'❤️', label:tt({pl:'Zdrowie',       en:'Health',       de:'Gesundheit',    es:'Salud'})},
  ];
  const LEVELS=[
    {key:'beginner',     icon:'🌱',label:tt({pl:'Początkujący',          en:'Beginner',     de:'Anfänger',      es:'Principiante'})},
    {key:'intermediate', icon:'🌿',label:tt({pl:'Średniozaawansowany',   en:'Intermediate', de:'Fortgeschritten',es:'Intermedio'})},
    {key:'advanced',     icon:'🌲',label:tt({pl:'Zaawansowany',          en:'Advanced',     de:'Experte',        es:'Avanzado'})},
  ];
  function render(){
    if(step===0){
      ov.innerHTML=`<div class="modal" style="text-align:center;padding:28px 22px 24px;">
        <div style="font-size:52px;margin-bottom:12px;">🐝</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px;">BeeStrong</div>
        <div style="font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:24px;">${tt({pl:'Cześć! Skonfigurujmy aplikację w 2 szybkich krokach.',en:'Hi! Let\'s set up the app in 2 quick steps.',de:'Hallo! Richten wir die App in 2 Schritten ein.',es:'¡Hola! Configuremos la app en 2 pasos.'})}</div>
        <button class="btn btn-primary" style="width:100%;" onclick="_onbNext()">${tt({pl:'Zaczynamy →',en:"Let's go →",de:'Los geht\'s →',es:'¡Empecemos →'})}</button>
        <button class="btn btn-ghost" style="margin-top:8px;font-size:13px;color:var(--text3);width:100%;" onclick="closeModal()">${tt({pl:'Pomiń',en:'Skip',de:'Überspringen',es:'Omitir'})}</button>
      </div>`;
    } else if(step===1){
      ov.innerHTML=`<div class="modal"><div class="modal-handle"></div>
        <div style="font-size:11px;color:var(--text3);text-align:right;margin-bottom:6px;">1/2</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:16px;">${tt({pl:'Jaki jest Twój cel?',en:"What's your goal?",de:'Was ist dein Ziel?',es:'¿Cuál es tu objetivo?'})}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
          ${GOALS.map(g=>`<button onclick="_onbGoal('${g.key}')" style="padding:16px 8px;border-radius:14px;border:2px solid ${goal===g.key?'var(--accent)':'var(--border)'};background:${goal===g.key?'var(--accent-dim)':'var(--bg3)'};cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:7px;transition:all 0.15s;">
            <div style="font-size:28px;">${g.icon}</div>
            <div style="font-size:12px;font-weight:700;text-align:center;color:${goal===g.key?'var(--accent)':'var(--text)'};">${g.label}</div>
          </button>`).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="_onbNext()">${tt({pl:'Dalej →',en:'Next →',de:'Weiter →',es:'Siguiente →'})}</button>
      </div>`;
    } else {
      ov.innerHTML=`<div class="modal"><div class="modal-handle"></div>
        <div style="font-size:11px;color:var(--text3);text-align:right;margin-bottom:6px;">2/2</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:16px;">${tt({pl:'Jaki jest Twój poziom?',en:"What's your experience level?",de:'Was ist dein Trainingsniveau?',es:'¿Cuál es tu nivel?'})}</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
          ${LEVELS.map(l=>`<button onclick="_onbLevel('${l.key}')" class="onb-option${level===l.key?' selected':''}">
            <div class="onb-option-icon">${l.icon}</div>
            <div class="onb-option-label">${l.label}</div>
          </button>`).join('')}
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="_onbFinish()">${tt({pl:'Gotowe! 🎉',en:'Done! 🎉',de:'Fertig! 🎉',es:'¡Listo! 🎉'})}</button>
      </div>`;
    }
  }
  window._onbNext=()=>{step++;render();};
  window._onbGoal=g=>{goal=g;render();};
  window._onbLevel=l=>{level=l;render();};
  window._onbFinish=()=>{
    S.goal=goal;S.level=level;
    saveAll();
    localStorage.setItem('bs-onboarded-v1','1');
    closeModal();
    showSyncToast(tt({pl:'Profil zapisany 🎉',en:'Profile saved 🎉',de:'Profil gespeichert 🎉',es:'Perfil guardado 🎉'}),'success');
  };
  render();
}

// ===== WORKOUT =====
function startWorkout(tidOrTpl){
  // Accepts either a template ID (from S.templates) or a template object directly (e.g. from a Program).
  const tp=(typeof tidOrTpl==='object'&&tidOrTpl)?tidOrTpl:S.templates.find(x=>x.id===tidOrTpl);
  if(!tp)return;
  S.activeWorkout={templateId:tp.id||null,name:tp.name,types:tp.types||[],startTime:Date.now(),restDefault:tp.restDefault||90,
    exercises:tp.exercises.map(e=>({...e,sets:Array.from({length:e.sets},()=>({reps:e.reps,weight:e.weight,done:false,rest:tp.restDefault||90}))}))};
  pushWorkoutHistory();
  showScreen('workouts');
}

function renderWorkout(){
  const el=document.getElementById('workoutContent');
  document.body.classList.toggle('workout-active',!!S.activeWorkout);
  if(S.activeWorkout&&typeof closeMobileFabMenu==='function')closeMobileFabMenu();
  if(!S.activeWorkout){
    // No active workout — show CHRONOLOGICAL history of all completed workouts.
    // (Starting a new workout happens from Dashboard or Templates.)
    const isPL=lang==='pl';
    const allEntries=Object.entries(S.workouts);
    if(!allEntries.length){
      el.innerHTML=`<div style="padding:4px 0 12px;">
        <div style="font-size:17px;font-weight:700;margin-bottom:14px;">${t('workout')}</div>
        <div class="empty-state">${t('noWorkouts')}</div>
        <div style="font-size:12px;color:var(--text3);text-align:center;margin-top:14px;">${tt({pl:'Zacznij trening z Dashboardu lub Szablonów.',en:'Start a workout from Dashboard or Templates.',de:'Starte ein Training von der Übersicht oder den Vorlagen.',es:'Empieza un entrenamiento desde el Panel o las Plantillas.'})}</div>
      </div>`;
      return;
    }
    // Sort newest first, group by date
    const sorted=allEntries.sort((a,b)=>(b[0]||'').localeCompare(a[0]||''));
    const byDate={};
    sorted.forEach(([k,w])=>{
      const dateStr=w.date||k.split('_')[0];
      if(!byDate[dateStr])byDate[dateStr]=[];
      byDate[dateStr].push([k,w]);
    });
    const totals={
      count:sorted.length,
      vol:sorted.reduce((a,[,w])=>a+(w.volume||0),0),
      mins:sorted.reduce((a,[,w])=>a+(w.duration||0),0),
    };
    const totalsLbl=tt({pl:'Łącznie',en:'Total',de:'Gesamt',es:'Total'});
    const treningiLbl=tt({pl:'treningi',en:'workouts',de:'Trainings',es:'entrenamientos'});
    const minutLbl=tt({pl:'min',en:'min',de:'Min',es:'min'});
    let h=`<div style="padding:4px 0 12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="font-size:17px;font-weight:700;">${t('workout')}</div>
        <div style="font-size:11px;color:var(--text3);">${totalsLbl}: <strong style="color:var(--text2);">${totals.count}</strong> ${treningiLbl} · <strong style="color:var(--text2);">${(totals.vol/1000).toFixed(1)}t</strong> · <strong style="color:var(--text2);">${totals.mins}</strong> ${minutLbl}</div>
      </div>`;
    for(const dateStr of Object.keys(byDate)){
      const[y,m,d]=dateStr.split('-');
      h+=`<div style="font-size:11px;color:var(--text3);font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 8px;">${d}.${m}.${y}</div>`;
      for(const[k,w] of byDate[dateStr]){
        const exCount=(w.exercises||[]).length;
        const setCount=(w.exercises||[]).reduce((a,ex)=>a+(ex.sets||[]).length,0);
        h+=`<div class="workout-row" onclick="showWorkoutSummary('${k}')" style="margin-bottom:8px;">
          <div class="workout-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M6 4v16M18 4v16M3 12h18M3 7h3M18 7h3M3 17h3M18 17h3"/></svg></div>
          <div class="workout-row-info">
            <div class="workout-row-name">${displayWorkoutName(w)}</div>
            <div class="workout-row-meta">${w.duration||0} min · ${(w.volume/1000).toFixed(1)}t · ${exCount} ${t('exExercises')} · ${setCount} ${t('exSets')}</div>
          </div>
          <div>${typeTagHtml(w.types||[])}</div>
        </div>`;
      }
    }
    h+='</div>';
    el.innerHTML=h;
    return;
  }
  const w=S.activeWorkout;
  const elapsed=Math.max(0,Math.floor((Date.now()-w.startTime)/60000));
  const done=w.exercises.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const total=w.exercises.reduce((a,ex)=>a+ex.sets.length,0);
  const pct=total?Math.round(done/total*100):0;
  const finishFn=w.isQuick?'finishQuickWorkout()':'finishWorkout()';
  let h=`<div class="workout-header"><div style="flex:1;"><div style="font-size:19px;font-weight:700;">${displayWorkoutName(w)}${w.isQuick?` <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:var(--accent-dim);color:var(--accent);vertical-align:middle;">${t('quickWorkout')}</span>`:''}</div><div style="font-size:12px;color:var(--text2);margin-top:3px;">${elapsed} min · ${done}/${total} ${t('exSets')}</div><div style="margin-top:8px;height:4px;background:var(--bg4);border-radius:2px;width:100%;max-width:220px;"><div style="height:4px;background:var(--accent);border-radius:2px;width:${pct}%;transition:width 0.3s;"></div></div></div></div>`;
  const _supLabels=computeSupLabels(w.exercises);
  w.exercises.forEach((ex,ei)=>{
    const _slbl=_supLabels[ei];
    h+=`<div class="ex-card${ex.sup?' super':''}" data-reorder-item data-reorder-index="${ei}"><div class="ex-card-header"><div class="exercise-title-drag">${reorderHandle(lang==='pl'?'Zmień kolejność':'Reorder')}<button class="workout-ex-name-btn" onclick="event.stopPropagation();showWorkoutExerciseDetail(${ei})" title="${lang==='pl'?'Podgląd ćwiczenia':'Exercise preview'}">${_slbl?`<span class="super-tag">${_slbl}</span>`:''}<span>${exName(ex)}</span></button></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0;"><button class="ex-info-btn workout-ex-info-btn" onclick="event.stopPropagation();showWorkoutExerciseDetail(${ei})" aria-label="${lang==='pl'?'Podgląd ćwiczenia':'Exercise preview'}" title="${lang==='pl'?'Podgląd ćwiczenia':'Exercise preview'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button><button onclick="toggleWorkoutSup(${ei})" style="padding:3px 8px;border-radius:6px;border:1px solid ${ex.sup?'var(--accent)':'var(--border2)'};background:${ex.sup?'var(--accent-dim)':'var(--bg3)'};color:${ex.sup?'var(--accent)':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;transition:all 0.15s;">SS</button></div></div><div class="set-grid-labels"><div></div><div></div><div class="set-lbl" style="font-size:9px;">LAST</div><div class="set-lbl">${unitW()}</div><div class="set-lbl">${t('reps')}</div><div class="set-lbl">${t('exRest')}</div><div></div></div>`;
    ex.sets.forEach((s,si)=>{
      const last=getLastSet(ex,si);
      const lastHtml=last?`<div class="set-last">${dispW(last.weight)}<br><span style="color:var(--text3);font-size:10px;">×${last.reps}</span></div>`:`<div class="set-last" style="opacity:0.4;">—</div>`;
      h+=`<div class="set-grid"><button class="rm-btn" onclick="removeSet(${ei},${si})">✕</button><div class="set-num">${si+1}</div>${lastHtml}<input class="si" type="number" value="${dispW(s.weight)}" onfocus="clearZeroInput(this)" onchange="upd(${ei},${si},'weight',this.value)"/><input class="si" type="number" value="${s.reps}" onfocus="clearZeroInput(this)" onchange="upd(${ei},${si},'reps',this.value)"/><input class="si" type="number" value="${s.rest}" onfocus="clearZeroInput(this)" onchange="upd(${ei},${si},'rest',this.value)"/><button class="set-done ${s.done?'completed':''}" onclick="toggleSet(${ei},${si})">${s.done?'✓':'○'}</button></div>`;
    });
    h+=`<button class="btn btn-sm btn-ghost" style="font-size:12px;padding:6px 12px;margin-top:6px;width:100%;justify-content:center;" onclick="addSet(${ei})">+ ${t('addSet')}</button>`;
    h+=`</div>`;
  });
  h+=`<div style="height:90px;"></div>`;
  h+=`<div class="workout-actions-bar">`;
  h+=`<button class="workout-action-btn danger" onclick="cancelWorkout()">${t('cancelWorkout')}</button>`;
  h+=`<button class="workout-action-btn" onclick="addExToActiveWorkout()">${t('addExerciseToWorkout')}</button>`;
  h+=`<button class="workout-action-btn primary" onclick="${w.isQuick?finishFn:'confirmFinishWorkout()'}">${t('finish')}</button>`;
  h+=`</div>`;
  el.innerHTML=h;
  initExerciseReorder(el,(from,to)=>{moveArrayItem(S.activeWorkout.exercises,from,to);renderWorkout();});
  // If timer was running, re-insert timer bar (DOM was rebuilt)
  if(S.timerSecs>0) _renderTimerBar();
}

function upd(ei,si,f,v){S.activeWorkout.exercises[ei].sets[si][f]=f==='weight'?inputToKg(v):+v;}
function clearZeroInput(input){if(input)input.value='';}
window.clearZeroInput=clearZeroInput;
function toggleWorkoutSup(ei){S.activeWorkout.exercises[ei].sup=!S.activeWorkout.exercises[ei].sup;renderWorkout();}
window.toggleWorkoutSup=toggleWorkoutSup;

function getLastSet(currentEx,setIndex){
  const name=exName(currentEx);
  if(!name)return null;
  const sorted=Object.entries(S.workouts).sort((a,b)=>{
    const da=a[1].date||a[0].split('_')[0];
    const db=b[1].date||b[0].split('_')[0];
    return db>da?1:db<da?-1:0;
  });
  for(const[,w] of sorted){
    if(!w.exercises)continue;
    const match=w.exercises.find(e=>exName(e)===name);
    if(match&&match.sets&&match.sets[setIndex]!=null){
      const s=match.sets[setIndex];
      if(s.weight||s.reps)return{weight:s.weight||0,reps:s.reps||0};
    }
  }
  return null;
}
function toggleSet(ei,si){const s=S.activeWorkout.exercises[ei].sets[si];s.done=!s.done;if(s.done)startTimer(s.rest||S.activeWorkout.restDefault);else stopTimer();renderWorkout();}
function addSet(ei){const ex=S.activeWorkout.exercises[ei];const last=ex.sets[ex.sets.length-1]||{reps:ex.reps,weight:ex.weight};ex.sets.push({reps:last.reps,weight:last.weight,done:false,rest:S.activeWorkout.restDefault});renderWorkout();}
function removeSet(ei,si){const ex=S.activeWorkout.exercises[ei];if(ex.sets.length<=1)return;ex.sets.splice(si,1);renderWorkout();}
function adjustTimer(delta){
  if(!S.timerSecs)return;
  S.timerSecs=Math.max(1,S.timerSecs+delta);
  _renderTimerBar();
}
window.adjustTimer=adjustTimer;
function startTimer(s){
  stopTimer();
  S.timerSecs=s;
  _renderTimerBar();
  S.timerInterval=setInterval(()=>{
    S.timerSecs--;
    if(S.timerSecs<=0){
      timerAlert('done');
      stopTimer();
      const tb=document.getElementById('workoutTimerBar');
      if(tb)tb.remove();
    } else {
      if(S.timerSecs<=5)timerAlert('warning');
      _renderTimerBar();
    }
  },1000);
}

function stopTimer(){
  if(S.timerInterval){clearInterval(S.timerInterval);S.timerInterval=null;}
  S.timerSecs=0;
  const tb=document.getElementById('workoutTimerBar');
  if(tb)tb.remove();
}

function _renderTimerBar(){
  const min=Math.floor(S.timerSecs/60);
  const sec=String(S.timerSecs%60).padStart(2,'0');
  let tb=document.getElementById('workoutTimerBar');
  if(!tb){
    // Create and insert after workout header
    tb=document.createElement('div');
    tb.id='workoutTimerBar';
    const wc=document.getElementById('workoutContent');
    const header=wc?.querySelector('.workout-header');
    if(header)header.after(tb);
    else if(wc)wc.prepend(tb);
  }
  const isWarning=S.timerSecs>0&&S.timerSecs<=5;
  tb.className='timer-bar'+(isWarning?' timer-warning':'');
  tb.innerHTML=`<div class="timer-display" style="${isWarning?'color:var(--red);':''}">${min}:${sec}</div><div class="timer-label">${t('restBreak')}</div><div class="timer-controls"><button class="timer-adjust timer-minus" onclick="adjustTimer(-10)">- 10 sec</button><button class="timer-skip" onclick="stopTimer()">SKIP</button><button class="timer-adjust timer-plus" onclick="adjustTimer(10)">+ 10 sec</button></div>`;
}

function confirmFinishWorkout(){
  if(!S.activeWorkout)return;
  if(S.activeWorkout.isQuick){finishQuickWorkout();return;}
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov._backHandler=()=>{closeModal();return true;};
  ov.innerHTML=`<div class="modal finish-confirm-modal">
    <div class="modal-handle"></div>
    <div class="modal-title" style="margin-bottom:8px;">${tt({pl:'Zakończyć trening?',en:'Finish workout?',de:'Training beenden?',es:'¿Terminar entrenamiento?'})}</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.45;margin-bottom:18px;">${tt({pl:'Jeśli kliknąłeś Finish przez pomyłkę, wróć do aktywnego treningu.',en:'If you tapped Finish by mistake, go back to the active workout.',de:'Wenn du versehentlich Finish getippt hast, gehe zurück zum aktiven Training.',es:'Si tocaste Finish por error, vuelve al entrenamiento activo.'})}</div>
    <button class="btn btn-primary" style="width:100%;margin-bottom:10px;" onclick="closeModal();finishWorkout()">${t('finish')}</button>
    <button class="btn btn-ghost" style="width:100%;" onclick="closeModal()">${t('backBtn')}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}
window.confirmFinishWorkout=confirmFinishWorkout;

function finishWorkout(){
  stopTimer();const w=S.activeWorkout;
  const prs=detectPRs(w.exercises); // detect PRs BEFORE saving (historical stats don't include current workout yet)
  console.log('[PR] exercises:', w.exercises.map(e=>({name:e[lang]||e.pl||e.en||e.name,sets:e.sets})));
  console.log('[PR] detected:', prs);
  const duration=Math.max(1,Math.floor((Date.now()-w.startTime)/60000));
  let volume=0;w.exercises.forEach(ex=>ex.sets.forEach(s=>{if(s.done&&s.weight>0)volume+=s.weight*s.reps;}));
  const k=today()+'_'+Date.now();
  S.workouts[k]={templateId:w.templateId,name:w.name,nameKey:w.nameKey||null,types:w.types,volume,duration,date:today(),exercises:w.exercises.map(ex=>({id:ex.id,pl:ex.pl,en:ex.en,name:ex.name,sup:ex.sup,gk:ex.gk,equipment:ex.equipment,sets:ex.sets}))};
  S.activeWorkout=null;document.body.classList.remove('workout-active');saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();showWorkoutSummary(k,prs);showScreen('dashboard');
}
function cancelWorkout(){stopTimer();S.activeWorkout=null;document.body.classList.remove('workout-active');renderWorkout();}

// Back-button guard: central popstate handling lives in app.js
function pushWorkoutHistory(){
  if(typeof ensureBackTrap==='function')ensureBackTrap({workout:true});
  else history.pushState({bsWorkout:true},'');
}
function showWorkoutBackConfirm(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal" style="text-align:center;padding:24px 20px;">
    <div class="modal-handle"></div>
    <div style="font-size:36px;margin-bottom:8px;">⚠️</div>
    <div style="font-size:17px;font-weight:700;margin-bottom:8px;">${tt({pl:'Opuścić trening?',en:'Leave workout?',de:'Training verlassen?',es:'¿Salir del entrenamiento?'})}</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.5;">${tt({pl:'Trening jest aktywny. Możesz go kontynuować wracając do zakładki Workouts.',en:'Your workout is still active. You can resume it from the Workouts tab.',de:'Dein Training läuft noch. Du kannst es im Workouts-Tab fortsetzen.',es:'Tu entrenamiento sigue activo. Puedes retomarlo desde la pestaña Workouts.'})}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn btn-danger" onclick="closeModal();cancelWorkout()">${tt({pl:'Zakończ trening',en:'End workout',de:'Training beenden',es:'Terminar'})}</button>
      <button class="btn btn-primary" onclick="closeModal()">${tt({pl:'Kontynuuj',en:'Continue',de:'Weiter',es:'Continuar'})}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
}

// ===== SUMMARY =====
function showWorkoutSummary(key,prs=[]){
  const w=S.workouts[key];if(!w)return;
  const prev=getPrev(key,w.templateId);
  const vd=prev?+(+fmtVol(w.volume)-+fmtVol(prev.volume)).toFixed(1):null;
  const dd=prev?w.duration-prev.duration:null;
  const dateStr=w.date||key.split('_')[0];
  const[y,m,d]=dateStr.split('-');
  closeModal();
  const dH=(val,unit,inv)=>{if(val===null)return`<div style="font-size:12px;color:var(--text2);">${t('firstEver')}</div>`;const good=inv?val<0:val>0;return`<div class="${good?'delta-up':'delta-down'}">${val>0?'+':''}${val}${unit} ${t('vsLast')}</div>`;};
  let exBreakdown='';
  if(w.exercises&&w.exercises.length){
    const rows=w.exercises.map(ex=>{
      const sets=Array.isArray(ex.sets)?ex.sets:[];
      // Count only done sets (consistent with stored w.volume)
      let vol=0,bestE1=0,bestSetTxt='';
      for(const s of sets){
        const done=s.done===true||s.done===undefined;
        const wt=+(s.weight||0),r=+(s.reps||0);
        if(!done||wt<=0)continue;
        vol+=wt*r;
        const e=epleyEst1RM(wt,r);
        if(e>bestE1){bestE1=e;bestSetTxt=`${wt}×${r}`;}
      }
      if(!vol)return'';
      const nm=ex[lang]||ex.pl||ex.name||'';
      const e1Html=bestE1?`<div style="font-size:11px;color:var(--text3);margin-top:2px;">${bestSetTxt} · e1RM ${dispW(bestE1)}${unitW()}</div>`:'';
      return`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start;"><div style="font-size:13px;color:var(--text2);flex:1;padding-right:8px;min-width:0;"><div>${nm}</div>${e1Html}</div><div style="font-size:13px;font-weight:600;flex-shrink:0;">${dispW(vol).toLocaleString()} ${unitW()}</div></div>`;
    }).filter(Boolean).join('');
    if(rows)exBreakdown=`<div style="font-size:13px;font-weight:600;margin:16px 0 8px;">${t('volPerEx')}</div><div style="background:var(--bg3);border-radius:10px;padding:0 12px;">${rows}</div>`;
  }
  const prBannerHtml=prs.length?`<div class="pr-banner">
    <div style="font-size:28px;margin-bottom:4px;">🏆</div>
    <div style="font-size:15px;font-weight:800;color:var(--accent);margin-bottom:6px;">${tt({pl:'Nowy rekord!',en:'New Personal Record!',de:'Neuer Rekord!',es:'¡Nuevo récord personal!'})}</div>
    ${prs.map(pr=>`<div style="font-size:13px;color:var(--text2);margin-bottom:2px;"><strong style="color:var(--text);">${pr.name}</strong>: ${dispW(pr.weight)}${unitW()}×${pr.reps} · e1RM <strong style="color:var(--accent);">${dispW(pr.e1RM)}${unitW()}</strong>${pr.prev?` <span style="color:var(--text3);font-size:11px;">(${tt({pl:'poprz.',en:'prev.',de:'vorh.',es:'ant.'})} ${dispW(pr.prev)}${unitW()})</span>`:''}</div>`).join('')}
  </div>`:'';
  const summaryHistData=w.templateId?getProgress(w.templateId,key):[];
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal"><div class="modal-handle"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;"><div class="modal-title" style="margin-bottom:0;">${t('summary')} ${d}.${m}.${y}</div><button class="btn btn-sm btn-ghost" onclick="closeModal()">✕</button></div><div style="font-size:13px;color:var(--text2);margin-bottom:14px;">${displayWorkoutName(w)}</div>${prBannerHtml}<div class="summary-grid"><div class="metric-card"><div class="metric-label">${t('totalLifted')}</div><div class="metric-value" style="font-size:22px;">${dispW(w.volume).toLocaleString()}</div><div style="font-size:11px;color:var(--text2);margin-top:2px;">${unitW()}</div>${dH(vd,unitVol(),false)}</div><div class="metric-card"><div class="metric-label">${t('time')}</div><div class="metric-value">${w.duration}</div><div style="font-size:11px;color:var(--text2);margin-top:2px;">min</div>${dH(dd,'min',true)}</div></div>${exBreakdown}<div style="font-size:13px;font-weight:600;margin:16px 0 10px;">${t('objetosc')} — ${displayWorkoutName(w)}</div><div style="position:relative;width:100%;height:180px;margin-bottom:16px;"><canvas id="summChart"></canvas>${summaryHistData.length>=2?chartGrowthBadge(summaryHistData):''}</div>${prev?`<div style="background:var(--bg3);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--text2);">${t('prevWorkout')} ${dispW(prev.volume).toLocaleString()} ${unitW()} · ${prev.duration} min</div>`:`<div style="font-size:13px;color:var(--text2);text-align:center;padding:8px 0;">${t('firstWorkout')}</div>`}
    <button class="btn btn-danger" style="margin-top:14px;" onclick="deleteWorkout('${key}')">${lang==='pl'?'Usuń trening':'Delete workout'}</button>
  </div>`;
  document.body.appendChild(ov);S.modal=ov;
  setTimeout(()=>{
    const ctx=document.getElementById('summChart');if(!ctx)return;
    const histData=summaryHistData;
    if(histData.length>=2){
      // Multiple sessions of this template — show history line chart
      new Chart(ctx,{type:'line',data:{labels:histData.map(x=>x.l),datasets:[{data:histData.map(x=>x.v),borderColor:'#c9a96e',backgroundColor:'rgba(201,169,110,0.07)',borderWidth:2.5,pointBackgroundColor:'#c9a96e',pointRadius:histData.map((_,i)=>i===histData.length-1?7:4),fill:true,tension:0.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:10},callback:v=>fmtVolTick(v)}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
    } else {
      // No history (Quick Workout or first session) — show per-exercise bar chart for this workout
      const exData=(w.exercises||[]).map(ex=>{
        let vol=0;
        for(const s of (ex.sets||[])){
          const done=s.done===true||s.done===undefined;
          const wt=+(s.weight||0),r=+(s.reps||0);
          if(done&&wt>0&&r>0)vol+=wt*r;
        }
        return{l:ex[lang]||ex.pl||ex.name||'',v:vol};
      }).filter(x=>x.v>0);
      if(!exData.length)return;
      new Chart(ctx,{type:'bar',data:{labels:exData.map(x=>x.l.length>14?x.l.slice(0,13)+'…':x.l),datasets:[{data:exData.map(x=>x.v),backgroundColor:'rgba(201,169,110,0.65)',borderColor:'#c9a96e',borderWidth:1.5,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:10},callback:v=>fmtVolTick(v)}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
    }
  },100);
}
function getPrev(key,tid){
  if(!tid)return null;
  const dateOfKey=key.split('_')[0];
  const s=Object.entries(S.workouts)
    .filter(([k,w])=>w.templateId===tid&&k.split('_')[0]<dateOfKey)
    .sort((a,b)=>a[0]>b[0]?1:-1);
  return s.length?s[s.length-1][1]:null;
}
function getProgress(tid,upTo){
  if(!tid)return[];
  const upToDate=upTo.split('_')[0];
  return Object.entries(S.workouts)
    .filter(([k,w])=>w.templateId===tid&&k.split('_')[0]<=upToDate)
    .sort((a,b)=>a[0]>b[0]?1:-1)
    .slice(-8)
    .map(([k,w])=>{const d=(w.date||k.split('_')[0]);const[,m,dd]=d.split('-');return{l:`${dd}.${m}`,v:w.volume};});
}

// ===== PROFILE =====
const MEASURE_TYPES=[
  {key:'weight_k',icon:'⚖️',unit:'kg'},
  {key:'chest_m',icon:'💪',unit:'cm'},
  {key:'waist',icon:'📏',unit:'cm'},
  {key:'hips',icon:'📐',unit:'cm'},
  {key:'arm',icon:'💪',unit:'cm'},
  {key:'thigh',icon:'🦵',unit:'cm'},
];

function proCardHtml(){
  const logoSrc=isDark?'./logo.jpg':'./light_logo.png';
  const logoImg=`<img src="${logoSrc}" alt="BeeStrong" style="width:34px;height:34px;object-fit:contain;border-radius:8px;flex-shrink:0;"/>`;
  const isCoach=!!(S.user&&S.coachMode);
  const isPaid=!!(S.user&&S.isPro);
  const plan=isCoach?'COACH':(isPaid?'PRO':'FREE');
  const bg=isCoach
    ?(isDark?'linear-gradient(135deg,rgba(0,200,83,0.08),rgba(245,197,66,0.08))':'#d3c48f')
    :(isPaid?(isDark?'rgba(0,200,83,0.08)':'#bdd8c8'):'var(--bg2)');
  const border=isCoach
    ?(isDark?'rgba(245,197,66,0.45)':'rgba(130,96,18,0.42)')
    :(isPaid?(isDark?'rgba(0,200,83,0.35)':'rgba(0,105,55,0.38)'):'var(--border)');
  const dataLine=(isPaid||isCoach)
    ?tt({pl:'Cloud backup aktywny',en:'Cloud backup active',de:'Cloud-Backup aktiv',es:'Backup en nube activo'})
    :tt({pl:'Dane tylko na tym urządzeniu',en:'Stored on this device only',de:'Nur auf diesem Gerät gespeichert',es:'Solo en este dispositivo'});
  const detail=S.user?(S.user.email||dataLine):tt({pl:'Niezalogowany',en:'Signed out',de:'Abgemeldet',es:'Sin sesión'});
  const cta=S.user?'':`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();showAuthModal()" style="font-size:11px;padding:7px 11px;flex-shrink:0;">${tt({pl:'Login',en:'Log in',de:'Login',es:'Login'})}</button>`;
  return `<div style="display:flex;align-items:center;gap:10px;background:${bg};border:1px solid ${border};border-radius:12px;padding:12px 14px;margin-bottom:14px;${S.user?'':'cursor:pointer;'}" ${S.user?'':'onclick="showAuthModal()"'}">
    ${logoImg}
    <div style="flex:1;min-width:0;">
      <div style="font-size:14px;font-weight:900;color:var(--accent);">${plan}</div>
      <div style="font-size:12px;color:var(--text2);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${detail} · ${dataLine}</div>
    </div>
    ${cta}
  </div>`;
}

// Render the body-measurement section used inside Settings (latest cards, charts, history)
function bodyMeasurementsHtml(hideTitle){
  const entries=Object.entries(S.measurements).sort((a,b)=>b[0]>a[0]?1:-1);
  const sectionLbl=tt({pl:'Pomiary ciała',en:'Body measurements',de:'Körpermaße',es:'Medidas corporales'});
  const sectionTitle=hideTitle?'': `<div style="font-size:12px;color:var(--text3);font-weight:700;letter-spacing:0.6px;text-transform:uppercase;margin:24px 0 12px;">${sectionLbl}</div>`;
  if(!entries.length){
    return sectionTitle+`<div class="empty-state">${t('noMeasures')}</div>`;
  }
  const latest={};
  entries.forEach(([date,rec])=>Object.entries(rec).forEach(([k,v])=>{if(!latest[k])latest[k]={v,date};}));
  const tiles=MEASURE_TYPES.filter(mt=>latest[mt.key]).map(mt=>`<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;"><div style="font-size:22px;margin-bottom:2px;">${mt.icon}</div><div style="font-size:11px;color:var(--text2);font-weight:600;">${t(mt.key)}</div><div><span style="font-size:22px;font-weight:700;color:var(--accent);">${dispMeas(mt.key,latest[mt.key].v)}</span> <span style="font-size:11px;color:var(--text2);">${unitMeas(mt.key)}</span></div><div style="font-size:10px;color:var(--text3);">${latest[mt.key].date}</div></div>`).join('');
  const cards=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">${tiles}</div>`;
  const chartSections=MEASURE_TYPES.map(mt=>{
    const data=entries.filter(([,r])=>r[mt.key]!=null).reverse().map(([date,r])=>{const[y,m,d]=date.split('-');return{l:`${d}.${m}`,v:dispMeas(mt.key,r[mt.key])};}).slice(-10);
    if(data.length<2)return'';
    return`<div style="margin-bottom:20px;">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px;">${mt.icon} ${t(mt.key)} <span style="font-size:11px;color:var(--text2);font-weight:400;">(${unitMeas(mt.key)})</span></div>
      <div style="position:relative;width:100%;height:150px;"><canvas id="chart_${mt.key}"></canvas>${chartGrowthBadge(data)}</div>
    </div>`;
  }).join('');
  const historyLbl=tt({pl:'Historia pomiarów',en:'Measurement history',de:'Messhistorie',es:'Historial de medidas'});
  const history=entries.slice(0,5).map(([date,rec])=>`<div style="position:relative;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;padding-right:48px;margin-bottom:8px;"><div style="font-size:12px;color:var(--text2);margin-bottom:6px;">${date}</div><div style="display:flex;flex-wrap:wrap;gap:10px;">${MEASURE_TYPES.filter(mt=>rec[mt.key]!=null).map(mt=>`<span style="font-size:13px;"><span style="color:var(--text2);">${t(mt.key)}:</span> <strong>${dispMeas(mt.key,rec[mt.key])} ${unitMeas(mt.key)}</strong></span>`).join('')}</div><button class="rm-btn" style="position:absolute;top:6px;right:6px;width:36px;height:36px;font-size:15px;" onclick="deleteMeasurement('${date}')" aria-label="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div>`).join('');
  return sectionTitle+cards+(chartSections?`<div style="margin-top:20px;">${chartSections}</div>`:'')+`<div style="font-size:13px;color:var(--text2);margin-bottom:8px;">${historyLbl}</div>`+history;
}

function renderBodyCharts(){
  // Called after renderSettings injects HTML, to instantiate Chart.js charts
  const entries=Object.entries(S.measurements).sort((a,b)=>b[0]>a[0]?1:-1);
  if(!entries.length)return;
  setTimeout(()=>{
    MEASURE_TYPES.forEach(mt=>{
      const data=entries.filter(([,r])=>r[mt.key]!=null).reverse().map(([date,r])=>{const[y,m,d]=date.split('-');return{l:`${d}.${m}`,v:dispMeas(mt.key,r[mt.key])};}).slice(-10);
      if(data.length<2)return;
      const ctx=document.getElementById('chart_'+mt.key);if(!ctx)return;
      new Chart(ctx,{type:'line',data:{labels:data.map(x=>x.l),datasets:[{data:data.map(x=>x.v),borderColor:'#c9a96e',backgroundColor:'rgba(201,169,110,0.07)',borderWidth:2,pointBackgroundColor:'#c9a96e',pointRadius:data.map((_,i)=>i===data.length-1?6:3),fill:true,tension:0.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,0.08)'},ticks:{font:{size:10},callback:v=>v+unitMeas(mt.key)}},x:{grid:{display:false},ticks:{font:{size:10}}}}}});
    });
  },100);
}

function openAddMeasure(){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal"><div class="modal-handle"></div><div class="modal-title">${t('addMeasure')}</div><label class="form-label">${t('date')}</label><div style="margin-bottom:14px;"><input type="date" id="measDate" value="${today()}"/></div>${MEASURE_TYPES.map(mt=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:end;margin-bottom:10px;"><label class="form-label" style="margin-bottom:0;">${mt.icon} ${t(mt.key)} (${unitMeas(mt.key)})</label><input type="number" id="meas_${mt.key}" placeholder="—" step="0.1"/></div>`).join('')}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;"><button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button><button class="btn btn-primary" onclick="saveMeasure()">${t('saveTemplate')}</button></div></div>`;
  window.saveMeasure=()=>{
    const date=document.getElementById('measDate').value;if(!date)return;
    const rec={};MEASURE_TYPES.forEach(mt=>{const v=document.getElementById('meas_'+mt.key).value;if(v!=='')rec[mt.key]=mt.key==='weight_k'?inputToKg(parseFloat(v)):inputToCm(parseFloat(v));});
    if(!Object.keys(rec).length)return;
    S.measurements[date]=rec;saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();closeModal();renderSettings();if(typeof isProfileMeasurementsSection!=='function'||!isProfileMeasurementsSection())openSettingsMeasurements();
  };
  document.body.appendChild(ov);S.modal=ov;
}

function deleteMeasurement(date){
  if(!confirm(lang==='pl'?'Usunąć ten pomiar?':'Delete this measurement?'))return;
  delete S.measurements[date];
  saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
  renderSettings();
  if(typeof isProfileMeasurementsSection!=='function'||!isProfileMeasurementsSection())openSettingsMeasurements();
}

function showMonthChart(){
  const now=new Date();
  let chartYear=now.getFullYear();
  let chartMonth=now.getMonth();

  function buildChart(){
    closeModal();
    const ov=document.createElement('div');ov.className='modal-overlay';
    const daysInMonth=new Date(chartYear,chartMonth+1,0).getDate();
    const monthLabel=t('months')[chartMonth]+' '+chartYear;

    // Aggregate per day
    const perDay=Array.from({length:daysInMonth},(_,i)=>{
      const dateStr=dk(chartYear,chartMonth,i+1);
      const dayEntries=Object.entries(S.workouts).filter(([k,w])=>(w.date||k.split('_')[0])===dateStr);
      return{
        d:i+1,
        count:dayEntries.length,
        mins:dayEntries.reduce((a,[,w])=>a+(w.duration||0),0),
        vol:dayEntries.reduce((a,[,w])=>a+(w.volume||0),0)
      };
    });

    const totalCount=perDay.reduce((a,d)=>a+d.count,0);
    const totalMins=perDay.reduce((a,d)=>a+d.mins,0);
    const totalVol=perDay.reduce((a,d)=>a+d.vol,0);

    ov.innerHTML=`<div class="modal" style="max-height:92dvh;">
      <div class="modal-handle"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <button onclick="prevChartMonth()" style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:4px 8px;">‹</button>
        <div style="font-size:16px;font-weight:700;">${monthLabel}</div>
        <button onclick="nextChartMonth()" style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:4px 8px;">›</button>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:16px;justify-content:center;">
        <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#c9a96e;display:inline-block;"></span>${lang==='pl'?'Treningi':'Workouts'}</span>
        <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#64c8ff;display:inline-block;"></span>${lang==='pl'?'Czas (min)':'Time (min)'}</span>
        <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#78c878;display:inline-block;"></span>${lang==='pl'?'Objętość (t)':'Volume (t)'}</span>
      </div>
      <div style="position:relative;width:100%;height:220px;margin-bottom:20px;"><canvas id="monthChart"></canvas></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
        <div class="metric-card" style="text-align:center;">
          <div class="metric-label">${lang==='pl'?'Treningi':'Workouts'}</div>
          <div class="metric-value">${totalCount}</div>
        </div>
        <div class="metric-card" style="text-align:center;">
          <div class="metric-label">${lang==='pl'?'Czas':'Time'}</div>
          <div class="metric-value" style="font-size:20px;">${totalMins}</div>
          <div style="font-size:11px;color:var(--text2);">min</div>
        </div>
        <div class="metric-card" style="text-align:center;">
          <div class="metric-label">${lang==='pl'?'Objętość':'Volume'}</div>
          <div class="metric-value" style="font-size:20px;">${(totalVol/1000).toFixed(1)}</div>
          <div style="font-size:11px;color:var(--text2);">ton</div>
        </div>
      </div>
      <button class="btn btn-ghost" onclick="closeModal()">${t('cancelTemplate')}</button>
    </div>`;
    document.body.appendChild(ov);S.modal=ov;

    setTimeout(()=>{
      const ctx=document.getElementById('monthChart');if(!ctx)return;
      const labels=perDay.map(d=>d.d);
      new Chart(ctx,{
        type:'bar',
        data:{
          labels,
          datasets:[
            {label:lang==='pl'?'Treningi':'Workouts',data:perDay.map(d=>d.count),backgroundColor:'rgba(201,169,110,0.8)',borderRadius:3,yAxisID:'y'},
            {label:lang==='pl'?'Czas (min)':'Time (min)',data:perDay.map(d=>d.mins),backgroundColor:'rgba(100,200,255,0.7)',borderRadius:3,yAxisID:'y2'},
            {label:lang==='pl'?'Objętość (t)':'Volume (t)',data:perDay.map(d=>+(d.vol/1000).toFixed(2)),backgroundColor:'rgba(120,200,120,0.7)',borderRadius:3,yAxisID:'y3'},
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{const ds=ctx.dataset.label;return`${ds}: ${ctx.raw}`;}}}},
          scales:{
            x:{grid:{display:false},ticks:{font:{size:9},maxRotation:0}},
            y:{display:false,beginAtZero:true},
            y2:{display:false,beginAtZero:true},
            y3:{display:false,beginAtZero:true},
          }
        }
      });
    },100);
  }

  window.prevChartMonth=()=>{chartMonth--;if(chartMonth<0){chartMonth=11;chartYear--;}buildChart();};
  window.nextChartMonth=()=>{chartMonth++;if(chartMonth>11){chartMonth=0;chartYear++;}buildChart();};
  buildChart();
}

function deleteWorkout(key){
  if(!confirm(lang==='pl'?`Usunąć ten trening?`:`Delete this workout?`))return;
  delete S.workouts[key];
  if(S.selectedDate&&key.startsWith(S.selectedDate)){}
  saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();closeModal();renderCalendar();renderDashboard();
}

function openManualWorkout(dateStr){
  closeModal();

  // All state on window — survives re-renders and picker round-trips
  window.mwDate=dateStr;
  window.mwMode='pick';
  window.mwTplId=S.templates.length?S.templates[0].id:null;
  window.mwExercises=[];
  window.mwDuration=60;

  // Single persistent overlay — never destroyed until explicit close/save
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  document.body.appendChild(ov);
  S.modal=ov;
  ov._backHandler=()=>{
    if(window.mwMode&&window.mwMode!=='pick'){
      window.mwMode='pick';
      window.mwExercises=[];
      window.renderMw();
      return true;
    }
    window.closeMw();
    return true;
  };

  window.renderMw=function(){
    const mode=window.mwMode;
    const date=window.mwDate;
    const tplId=window.mwTplId;
    const exs=window.mwExercises;
    const dur=window.mwDuration;
    const L=lang==='pl';
    const cancelBtn=`<button class="btn btn-ghost" onclick="closeMw()">${t('cancelTemplate')}</button>`;

    if(mode==='pick'){
      ov.innerHTML=`<div class="modal"><div class="modal-handle"></div>
        <div class="modal-title">${L?'Dodaj trening':'Add Workout'}</div>
        <label class="form-label">${t('date')}</label>
        <div style="margin-bottom:16px;"><input type="date" id="mwDateInp" value="${date}" oninput="window.mwDate=this.value"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          <button class="btn btn-ghost" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--border2);"
            onclick="window.mwMode='template';window.mwExercises=[];window.renderMw()">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="24" height="24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span style="font-size:13px;font-weight:600;">${L?'Z szablonu':'From Template'}</span>
          </button>
          <button class="btn btn-ghost" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid var(--border2);"
            onclick="window.mwMode='custom';window.mwExercises=[];window.renderMw()">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="24" height="24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span style="font-size:13px;font-weight:600;">${L?'Własny trening':'Custom Workout'}</span>
          </button>
        </div>
        ${cancelBtn}
      </div>`;

    } else if(mode==='template'){
      if(!S.templates.length){window.mwMode='pick';window.renderMw();return;}
      const tp=S.templates.find(x=>x.id===tplId)||S.templates[0];
      window.mwTplId=tp.id;

      // Initialise mwExercises from template if empty
      if(!exs.length){
        window.mwExercises=tp.exercises.map(ex=>({
          ...ex,
          sets:Array.from({length:ex.sets||1},()=>({reps:ex.reps||10,weight:ex.weight||0}))
        }));
      }
      const curExs=window.mwExercises;

      const exRows=curExs.map((ex,ei)=>{
        const rows=ex.sets.map((s,si)=>`
          <div style="display:grid;grid-template-columns:20px 1fr 1fr;gap:6px;margin-top:5px;align-items:center;">
            <div style="font-size:11px;color:var(--text3);text-align:center;">${si+1}</div>
            <input class="si" type="number" placeholder="${L?'Powt':'Reps'}" value="${s.reps}"
              style="font-size:13px;padding:6px 4px;"
              onfocus="clearZeroInput(this)"
              oninput="window.mwExercises[${ei}].sets[${si}].reps=+this.value"/>
            <input class="si" type="number" placeholder="${unitW()}" value="${dispW(s.weight)}"
              style="font-size:13px;padding:6px 4px;"
              onfocus="clearZeroInput(this)"
              oninput="window.mwExercises[${ei}].sets[${si}].weight=inputToKg(+this.value)"/>
          </div>`).join('');
        return`<div class="tpl-edit-ex-card" data-reorder-item data-reorder-index="${ei}" style="background:var(--bg3);border-radius:10px;padding:10px 12px;margin-bottom:8px;">
          <div class="exercise-title-drag" style="margin-bottom:4px;">${reorderHandle(L?'Zmień kolejność':'Reorder')}<div style="font-size:13px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${exName(ex)}</div></div>
          <div style="display:grid;grid-template-columns:20px 1fr 1fr;gap:6px;">
            <div></div>
            <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${L?'Powt':'Reps'}</div>
            <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${unitW()}</div>
          </div>${rows}
        </div>`;
      }).join('');

      const tplSel=S.templates.map(tp2=>`<option value="${tp2.id}" ${tp2.id===window.mwTplId?'selected':''}>${tp2.name}</option>`).join('');
      ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
        <button class="modal-back" onclick="window.mwMode='pick';window.mwExercises=[];window.renderMw()">${L?'Wróć':'Back'}</button>
        <div class="modal-title">${L?'Z szablonu':'From Template'}</div>
        <label class="form-label">${t('date')}</label>
        <div style="margin-bottom:10px;"><input type="date" value="${window.mwDate}" oninput="window.mwDate=this.value"/></div>
        <label class="form-label">${L?'Szablon':'Template'}</label>
        <div style="margin-bottom:12px;"><select style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:11px 13px;font-size:15px;color:var(--text);width:100%;font-family:inherit;"
          onchange="window.mwTplId=+this.value;window.mwExercises=[];window.renderMw()">${tplSel}</select></div>
        <label class="form-label">${L?'Czas (min)':'Duration (min)'}</label>
        <div style="margin-bottom:12px;"><input type="number" value="${window.mwDuration}" min="1" style="width:100px;"
          oninput="window.mwDuration=+this.value||60"/></div>
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;">${L?'Serie i ciężary':'Sets & weights'}</div>
        <div style="overflow-y:auto;flex:1;min-height:0;">${exRows}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:12px;flex-shrink:0;">
          ${cancelBtn}
          <button class="btn btn-primary" onclick="window.saveMw('template')">${t('saveTemplate')}</button>
        </div>
      </div>`;

    } else { // custom
      const curExs=window.mwExercises;
      const exRows=curExs.map((ex,ei)=>{
        const rows=ex.sets.map((s,si)=>`
          <div style="display:grid;grid-template-columns:20px 1fr 1fr 24px;gap:5px;margin-top:5px;align-items:center;">
            <div style="font-size:11px;color:var(--text3);text-align:center;">${si+1}</div>
            <input class="si" type="number" placeholder="${L?'Powt':'Reps'}" value="${s.reps}"
              style="font-size:13px;padding:6px 4px;"
              onfocus="clearZeroInput(this)"
              oninput="window.mwExercises[${ei}].sets[${si}].reps=+this.value"/>
            <input class="si" type="number" placeholder="${unitW()}" value="${dispW(s.weight)}"
              style="font-size:13px;padding:6px 4px;"
              onfocus="clearZeroInput(this)"
              oninput="window.mwExercises[${ei}].sets[${si}].weight=inputToKg(+this.value)"/>
            <button onclick="window.mwRmSet(${ei},${si})"
              style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0;font-family:inherit;">✕</button>
          </div>`).join('');
        return`<div class="tpl-edit-ex-card" data-reorder-item data-reorder-index="${ei}" style="background:var(--bg3);border-radius:10px;padding:10px 12px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div class="exercise-title-drag">${reorderHandle(L?'Zmień kolejność':'Reorder')}<div style="font-size:13px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${exName(ex)}</div></div>
            <button onclick="window.mwRmEx(${ei})"
              style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;font-family:inherit;">✕</button>
          </div>
          <div style="display:grid;grid-template-columns:20px 1fr 1fr 24px;gap:5px;margin-bottom:2px;">
            <div></div>
            <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${L?'Powt':'Reps'}</div>
            <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;">${unitW()}</div>
            <div></div>
          </div>${rows}
          <button onclick="window.mwAddSet(${ei})"
            style="margin-top:8px;width:100%;padding:6px;border-radius:8px;border:1px solid var(--border2);background:var(--accent-dim);color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
            + ${L?'Seria':'Set'}
          </button>
        </div>`;
      }).join('');

      ov.innerHTML=`<div class="modal" style="max-height:92dvh;display:flex;flex-direction:column;">
        <button class="modal-back" onclick="window.mwMode='pick';window.mwExercises=[];window.renderMw()">${L?'Wróć':'Back'}</button>
        <div class="modal-title">${L?'Własny trening':'Custom Workout'}</div>
        <label class="form-label">${t('date')}</label>
        <div style="margin-bottom:10px;"><input type="date" value="${window.mwDate}" oninput="window.mwDate=this.value"/></div>
        <label class="form-label">${L?'Czas (min)':'Duration (min)'}</label>
        <div style="margin-bottom:12px;"><input type="number" value="${window.mwDuration}" min="1" style="width:100px;"
          oninput="window.mwDuration=+this.value||60"/></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:600;">${L?'Ćwiczenia':'Exercises'} (${curExs.length})</div>
          <button class="btn btn-sm btn-ghost" onclick="window.mwPickEx()">${L?'Dodaj ćwiczenie':'Add exercise'}</button>
        </div>
        <div style="overflow-y:auto;flex:1;min-height:0;">
          ${exRows||`<div style="text-align:center;padding:24px;color:var(--text3);font-size:13px;">${L?'Brak ćwiczeń. Dodaj pierwsze.':'No exercises yet.'}</div>`}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:12px;flex-shrink:0;">
          ${cancelBtn}
          <button class="btn btn-primary" onclick="window.saveMw('custom')">${t('saveTemplate')}</button>
        </div>
      </div>`;
    }
    initExerciseReorder(ov.querySelector('.modal [style*="overflow-y:auto"]'),(from,to)=>{moveArrayItem(window.mwExercises,from,to);window.renderMw();});
  };

  // Handlers — all on window, reference window.mw* directly
  window.closeMw=()=>{if(S.modal===ov){S.modal=null;ov.remove();}};

  window.mwAddSet=ei=>{
    window.mwExercises[ei].sets.push({reps:10,weight:0});
    window.renderMw();
  };
  window.mwRmSet=(ei,si)=>{
    if(window.mwExercises[ei].sets.length<=1)return;
    window.mwExercises[ei].sets.splice(si,1);
    window.renderMw();
  };
  window.mwRmEx=ei=>{
    window.mwExercises.splice(ei,1);
    window.renderMw();
  };
  window.mwPickEx=()=>{
    // Open picker as separate overlay on top — do NOT close mw overlay
    const savedModal=S.modal;
    S.modal=null; // temporarily detach so showExPicker can use S.modal
    showExPicker(window.mwExercises,picked=>{
      // Picker calls closeModal() which removes picker overlay
      // Restore mw modal
      S.modal=ov;
      window.mwExercises=picked.map(e=>({
        ...e,
        sets:e.setRows||[{reps:10,weight:0}]
      }));
      window.renderMw();
    });
  };
  window.saveMw=mode=>{
    const date=window.mwDate;
    if(!date){alert('Please select a date');return;}
    let volume=0,exercises=[],name,types=[],templateId=null,nameKey=null;
    if(mode==='template'){
      const tp=S.templates.find(x=>x.id===window.mwTplId);
      name=tp?tp.name:t('workout');
      types=tp?tp.types||[]:[];
      templateId=window.mwTplId;
      exercises=window.mwExercises.map(ex=>({
        id:ex.id,pl:ex.pl,en:ex.en,name:ex.name,sup:ex.sup||false,gk:ex.gk,equipment:ex.equipment,
        sets:(ex.sets||[]).map(s=>({reps:+s.reps||0,weight:+s.weight||0,done:true,rest:tp?.restDefault||S.defaultRest||90}))
      }));
    } else {
      name=t('customWorkout');
      nameKey='customWorkout';
      exercises=window.mwExercises.map(ex=>({
        id:ex.id,pl:ex.pl||ex.name,en:ex.en||ex.name,name:ex.name,sup:false,gk:ex.gk,equipment:ex.equipment,
        sets:(ex.sets||[]).map(s=>({reps:+s.reps||0,weight:+s.weight||0,done:true,rest:S.defaultRest||90}))
      }));
    }
    exercises.forEach(ex=>ex.sets.forEach(s=>{if(s.weight>0)volume+=s.weight*s.reps;}));
    const k=date+'_'+Date.now();
    S.workouts[k]={templateId,name,nameKey,types,volume,duration:window.mwDuration,date,exercises};
    saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
    window.closeMw();
    S.selectedDate=date;
    renderCalendar();renderDashboard();
  };

  window.renderMw();
}

// ===== QUICK WORKOUT =====
function startQuickWorkout(){
  document.body.classList.add('workout-active');
  S.activeWorkout={
    templateId:null, nameKey:'quickWorkout', name:t('quickWorkout'),
    types:[], startTime:Date.now(), restDefault:S.defaultRest||90,
    exercises:[], isQuick:true
  };
  pushWorkoutHistory();
  // Tick every minute to update elapsed display
  if(S.elapsedInterval) clearInterval(S.elapsedInterval);
  S.elapsedInterval=setInterval(()=>{if(S.activeWorkout)renderWorkout();},60000);
  showScreen('workouts');
}

function addExToActiveWorkout(){
  if(!S.activeWorkout)return;
  const existingExes=S.activeWorkout.exercises; // keep reference to preserve user data
  const pickerFormat=existingExes.map(e=>({...e}));
  showExPicker(pickerFormat,picked=>{
    const converted=picked.map(e=>{
      // Preserve existing exercise data (user-entered weights/reps) if already in workout
      const existing=existingExes.find(ex=>exKey(ex)===exKey(e));
      if(existing)return existing;
      // New exercise — create fresh sets
      const sr=e.setRows||[{reps:e.reps||10,weight:e.weight||0}];
      return{...e,sets:sr.map(s=>({reps:s.reps||10,weight:s.weight||0,done:false,rest:S.activeWorkout.restDefault}))};
    });
    S.activeWorkout.exercises=converted;
    renderWorkout();
  });
}
window.addExToActiveWorkout=addExToActiveWorkout;
function addExToQuickWorkout(){addExToActiveWorkout();}

function finishQuickWorkout(){
  stopTimer();
  if(S.elapsedInterval){clearInterval(S.elapsedInterval);S.elapsedInterval=null;}
  const w=S.activeWorkout;
  const prs=detectPRs(w.exercises); // detect PRs BEFORE saving
  const duration=Math.max(1,Math.floor((Date.now()-w.startTime)/60000));
  let volume=0;
  w.exercises.forEach(ex=>{
    if(Array.isArray(ex.sets)) ex.sets.forEach(s=>{if(s.done&&s.weight>0)volume+=s.weight*s.reps;});
  });
  const k=today()+'_'+Date.now();
  const wo={templateId:null,name:w.name,nameKey:w.nameKey||null,types:[],volume,duration,date:today(),
    exercises:w.exercises.map(ex=>({id:ex.id,pl:ex.pl,en:ex.en,name:ex.name,sup:ex.sup||false,gk:ex.gk,equipment:ex.equipment,
      sets:Array.isArray(ex.sets)?ex.sets:[]}))};
  S.workouts[k]=wo;
  S.activeWorkout=null;
  saveAll();if(typeof syncQueuedCloudChanges==='function')syncQueuedCloudChanges();
  window._lastFinishedWorkout=wo;
  window._lastFinishedPrs=prs;
  showSaveAsTemplateModal(wo,k,prs);
}

function showSaveAsTemplateModal(wo,dateKey,prs=[]){
  closeModal();
  const ov=document.createElement('div');ov.className='modal-overlay';
  ov._saveTplStep='choice';
  ov._backHandler=()=>{
    if(ov._saveTplStep==='name'){
      showSaveAsTemplateModal(wo,dateKey,prs);
      return true;
    }
    closeModal();
    return true;
  };
  ov.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title" style="margin-bottom:20px;">${t('saveAsTemplate')}</div>
    <div style="display:grid;grid-template-columns:1fr;gap:9px;">
      <button class="btn btn-primary" onclick="promptSaveTemplate()">${t('saveAsTemplateYes')}</button>
      <button class="btn btn-ghost" onclick="dontSaveTemplate('${dateKey}')">${t('saveAsTemplateNo')}</button>
      <button class="btn btn-ghost" onclick="restoreWorkoutFromFinish('${dateKey}')" style="margin-top:4px;">${t('backBtn')}</button>
    </div>
  </div>`;
  window.promptSaveTemplate=()=>{
    ov._saveTplStep='name';
    ov.querySelector('.modal').innerHTML=`
      <div class="modal-handle"></div>
      <div class="modal-title">${t('enterTemplateName')}</div>
      <div style="margin-bottom:14px;"><input type="text" id="quickTplName" placeholder="np. Push A" style="font-size:15px;"/></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
        <button class="btn btn-ghost" onclick="dontSaveTemplate('${dateKey}')">${t('cancelTemplate')}</button>
        <button class="btn btn-primary" onclick="confirmSaveTemplate('${dateKey}')">${t('saveTemplate')}</button>
      </div>
      <button class="btn btn-ghost" onclick="showSaveAsTemplateModal(window._lastFinishedWorkout,'${dateKey}',window._lastFinishedPrs||[])" style="width:100%;">${t('backBtn')}</button>`;
    setTimeout(()=>document.getElementById('quickTplName')?.focus(),100);
  };
  window.confirmSaveTemplate=wKey=>{
    const name=(document.getElementById('quickTplName')?.value||'').trim();
    if(!name)return;
    const newTid=Date.now();
    const exs=wo.exercises.map(e=>({...e,sets:1,reps:e.sets?.[0]?.reps||10,weight:e.sets?.[0]?.weight||0}));
    S.templates.push({id:newTid,name,types:[],restDefault:S.defaultRest||90,exercises:exs});
    // Link workout to template so progress tracking works
    if(S.workouts[wKey]) S.workouts[wKey].templateId=newTid;
    saveAll();closeModal();showWorkoutSummary(wKey,prs);showScreen('dashboard');
  };
  window.dontSaveTemplate=wKey=>{closeModal();showWorkoutSummary(wKey,prs);showScreen('dashboard');};
  window.restoreWorkoutFromFinish=wKey=>{
    const saved=S.workouts[wKey];
    if(!saved)return closeModal();
    delete S.workouts[wKey];
    S.activeWorkout={
      templateId:saved.templateId||null,
      name:saved.name,
      nameKey:saved.nameKey||null,
      types:saved.types||[],
      startTime:Date.now(),
      restDefault:S.defaultRest||90,
      exercises:(saved.exercises||[]).map(ex=>({...ex,sets:(Array.isArray(ex.sets)?ex.sets:[]).map(s=>({...s,done:!!s.done,rest:s.rest||S.defaultRest||90}))})),
      isQuick:true,
    };
    document.body.classList.add('workout-active');
    saveAll();closeModal();showScreen('workouts');renderWorkout();
  };
  document.body.appendChild(ov);S.modal=ov;
}


// ===== MUSCLE GROUP MAPPING =====
const MUSCLE_GROUPS=['chest','back','arms','shoulders','legs','calves','abs','glutes'];
const MUSCLE_LABELS={
  chest:{en:'Chest',pl:'Klatka',de:'Brust',es:'Pecho'},
  back:{en:'Back',pl:'Plecy',de:'Rücken',es:'Espalda'},
  arms:{en:'Arms',pl:'Ramiona',de:'Arme',es:'Brazos'},
  shoulders:{en:'Shoulders',pl:'Barki',de:'Schultern',es:'Hombros'},
  legs:{en:'Legs',pl:'Nogi',de:'Beine',es:'Piernas'},
  calves:{en:'Calves',pl:'Łydki',de:'Waden',es:'Pantorrillas'},
  abs:{en:'Abs',pl:'Brzuch',de:'Bauch',es:'Abdomen'},
  glutes:{en:'Glutes',pl:'Pośladki',de:'Gesäß',es:'Glúteos'},
};

// Build reverse lookup: normalised name -> group key (built once, lazily)
let _exNameToGroup=null;
function buildNameToGroup(){
  _exNameToGroup={};
  const db=OFFLINE_EX_GROUPS;
  for(const gk of Object.keys(db)){
    for(const e of db[gk].items){
      if(e.en) _exNameToGroup[e.en.toLowerCase().trim()]=gk;
      if(e.pl) _exNameToGroup[e.pl.toLowerCase().trim()]=gk;
    }
  }
}

function getExMuscleGroup(name){
  if(!name)return null;
  if(!_exNameToGroup)buildNameToGroup();
  const nm=name.toLowerCase().trim();
  // Exact match first
  if(_exNameToGroup[nm])return _exNameToGroup[nm];
  // Partial match — only if db name is at least 6 chars (avoid short false positives)
  for(const [key,gk] of Object.entries(_exNameToGroup)){
    if(key.length>=6&&(nm===key||nm.includes(key)||key.includes(nm)))return gk;
  }
  // Keyword fallback — order matters: more specific first
  // Use whole-word style matching with spaces/start/end to avoid false positives
  const kw=[
    {gk:'calves',   words:['calf raise','calf raises','standing calf','seated calf']},
    {gk:'glutes',   words:['hip thrust','glute bridge','glute bridge','cable kickback','abductor machine','donkey kick','fire hydrant']},
    {gk:'abs',      words:['crunch','ab roller','ab wheel','leg raise','hanging leg','hollow hold','dead bug','mountain climber','russian twist','flutter kick','pallof','windshield wiper']},
    {gk:'chest',    words:['bench press','chest press','chest fly','pec deck','chest dip','push-up','push up','pushup','cable fly','cable crossover','svend press','dumbbell fly','dumbbell flye']},
    {gk:'back',     words:['deadlift','lat pulldown','pull-up','pullup','chin-up','chinup','barbell row','dumbbell row','cable row','machine row','t-bar row','face pull','hyperextension','good morning','pendlay','meadow']},
    {gk:'arms',     words:['bicep curl','barbell curl','dumbbell curl','hammer curl','preacher curl','skull crusher','tricep pushdown','tricep dip','tricep extension','tricep kickback','overhead extension','zottman','wrist curl']},
    {gk:'shoulders',words:['lateral raise','front raise','overhead press','shoulder press','arnold press','upright row','shrug','bent-over raise','bent over raise','rear delt','deltoid raise']},
    {gk:'legs',     words:['barbell squat','front squat','goblet squat','sumo squat','hack squat','leg press','leg extension','leg curl','lunges','lunge','split squat','step up','box jump','wall sit','sissy squat','nordic ham','pistol squat']},
  ];
  for(const {gk,words} of kw){
    if(words.some(w=>nm.includes(w)))return gk;
  }
  return null;
}

// Sum volume of a single exercise's done sets
function exSetVolume(ex){
  let v=0;
  for(const s of (ex.sets||[])){
    const w=+(s.weight||0),r=+(s.reps||0);
    if(s.done&&w>0&&r>0)v+=w*r;
  }
  return v;
}

// Stable identity for an exercise across workouts
function exKey(ex){
  return ex.id||(ex.en||ex.pl||ex.name||'').toLowerCase().trim();
}

// Returns {chest:vol, back:vol, ...} for a workout object
function calcMuscleVols(workout){
  const vols={};
  if(!workout.exercises||!workout.exercises.length)return vols;
  for(const ex of workout.exercises){
    const gk=ex.gk||getExMuscleGroup(ex.en||ex.pl||ex.name||'');
    if(!gk)continue;
    const v=exSetVolume(ex);
    if(v>0)vols[gk]=(vols[gk]||0)+v;
  }
  return vols;
}

// Muscle groups that appear in at least one saved workout
function getPresentMuscleGroups(){
  const present=new Set();
  for(const w of Object.values(S.workouts)){
    for(const ex of (w.exercises||[])){
      const gk=ex.gk||getExMuscleGroup(ex.en||ex.pl||ex.name||'');
      if(gk)present.add(gk);
    }
  }
  return MUSCLE_GROUPS.filter(g=>present.has(g));
}

// Equipment used in workouts for a given muscle group
function getPresentEquipForGroup(gk){
  const present=new Set();
  for(const w of Object.values(S.workouts)){
    for(const ex of (w.exercises||[])){
      const exGk=ex.gk||getExMuscleGroup(ex.en||ex.pl||ex.name||'');
      if(exGk!==gk)continue;
      if(ex.equipment)present.add(ex.equipment);
    }
  }
  const order=['barbell','dumbbell','machine','cable','body only','kettlebells','bands','e-z curl bar','medicine ball','exercise ball','foam roll','other'];
  return order.filter(o=>present.has(o));
}

// Build time-series for a muscle group across all workouts (optional equipment filter)
function getMuscleProgress(gk,equipFilter){
  const eqOn=equipFilter&&equipFilter.size>0;
  return Object.entries(S.workouts)
    .map(([k,w])=>{
      let vol=0;
      for(const ex of (w.exercises||[])){
        const exGk=ex.gk||getExMuscleGroup(ex.en||ex.pl||ex.name||'');
        if(exGk!==gk)continue;
        if(eqOn&&(!ex.equipment||!equipFilter.has(ex.equipment)))continue;
        vol+=exSetVolume(ex);
      }
      return{k,vol,date:w.date||k.split('_')[0]};
    })
    .filter(x=>x.vol>0)
    .sort((a,b)=>a.date>b.date?1:-1)
    .slice(-12)
    .map(x=>{const[,m,d]=x.date.split('-');return{l:`${d}.${m}`,v:x.vol};});
}

// Top-N exercises for a muscle group, ranked by count of workouts they appeared in
function getTopExercisesForGroup(gk,equipFilter,limit){
  const eqOn=equipFilter&&equipFilter.size>0;
  const stats=new Map(); // key -> {key, name, equipment, count}
  for(const w of Object.values(S.workouts)){
    const seen=new Set();
    for(const ex of (w.exercises||[])){
      const exGk=ex.gk||getExMuscleGroup(ex.en||ex.pl||ex.name||'');
      if(exGk!==gk)continue;
      if(eqOn&&(!ex.equipment||!equipFilter.has(ex.equipment)))continue;
      const k=exKey(ex);
      if(!k||seen.has(k))continue;
      seen.add(k);
      const existing=stats.get(k);
      if(existing){existing.count++;}
      else{stats.set(k,{key:k,name:(ex[lang]||ex.pl||ex.en||ex.name||k),equipment:ex.equipment||null,count:1});}
    }
  }
  return Array.from(stats.values()).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)).slice(0,limit);
}

// Estimated 1RM via Epley formula: w * (1 + reps/30)
function epleyEst1RM(weight,reps){
  if(!weight||!reps||reps<1)return 0;
  if(reps===1)return Math.round(weight);
  return Math.round(weight*(1+reps/30));
}

// Aggregate stats for one exercise across all workouts
function getExerciseStats(key){
  let maxW=0,totalVol=0,est1RM=0,bestSet=null;
  for(const [wkey,w] of Object.entries(S.workouts)){
    const dateStr=w.date||wkey.split('_')[0];
    for(const ex of (w.exercises||[])){
      if(exKey(ex)!==key)continue;
      for(const s of (ex.sets||[])){
        const wt=+(s.weight||0),r=+(s.reps||0);
        if(!(s.done===true||s.done===undefined)||wt<=0||r<=0)continue;
        totalVol+=wt*r;
        if(wt>maxW)maxW=wt;
        const e=epleyEst1RM(wt,r);
        if(e>est1RM){est1RM=e;bestSet={weight:wt,reps:r,date:dateStr,est1RM:e};}
      }
    }
  }
  return{maxW,totalVol,est1RM,bestSet};
}

// Volume time-series for a single exercise (matched by exKey)
function getExerciseProgress(key){
  const series=[];
  for(const [wkey,w] of Object.entries(S.workouts)){
    let vol=0;
    let found=false;
    for(const ex of (w.exercises||[])){
      if(exKey(ex)!==key)continue;
      found=true;
      vol+=exSetVolume(ex);
    }
    if(found&&vol>0){
      const date=w.date||wkey.split('_')[0];
      series.push({date,vol});
    }
  }
  series.sort((a,b)=>a.date>b.date?1:-1);
  return series.slice(-12).map(x=>{const[,m,d]=x.date.split('-');return{l:`${d}.${m}`,v:x.vol};});
}

