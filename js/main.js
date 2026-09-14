import {HEROES,STAGES,BLESSINGS,ENEMY_ARCHETYPES} from './data.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#gameCanvas'),ctx=canvas.getContext('2d'); let raf=0;
const SPRITES={}, TILES={}, PROPS={};
const heroKeys=['warden','ranger','witch','smith','druid','relic'], enemyKeys=['whisper','swamp','monk','flower','root'], bossKeys=['stag','slime','abbot','queen','king'];
const HERO_SHEET_BY_ID={warden:'hero_warden_hd',ranger:'hero_ranger_hd',witch:'hero_witch_hd',smith:'hero_smith_hd',druid:'hero_druid_hd',relic:'hero_relic_hd'};
const HERO_DRAW_SIZE={warden:80,ranger:76,witch:80,smith:84,druid:80,relic:80};
const spriteFiles=[...heroKeys.map(n=>`hero_${n}`),...bossKeys.map(n=>`boss_${n}`),...Object.values(HERO_SHEET_BY_ID),'shot_tealbolt','shot_thorn','shot_wisp','shot_moon','shot_rune','eshot_forest','eshot_swamp','eshot_ruins','eshot_ashes','eshot_heart'];
for(let si=0;si<enemyKeys.length;si++)for(const a of ENEMY_ARCHETYPES)spriteFiles.push(`enemy_${enemyKeys[si]}_${a.id}`);
for(const n of spriteFiles){const im=new Image();im.src=`assets/sprites/${n}.webp`;SPRITES[n]=im}
const SHOT_STYLE_BY_HERO={warden:'thorn',ranger:'thorn',witch:'moon',smith:'rune',druid:'tealbolt',relic:'rune'};
const ENEMY_SHOT_SHEET_BY_TILE={forest:'eshot_forest',swamp:'eshot_swamp',ruins:'eshot_ruins',ashes:'eshot_ashes',heart:'eshot_heart'};
function primaryShotStyle(heroId){return SHOT_STYLE_BY_HERO[heroId]||'tealbolt'}
function enemyShotSheet(tile){return ENEMY_SHOT_SHEET_BY_TILE[tile]||'eshot_heart'}
const ENEMY_HD_KEYS=new Set(['enemy_whisper_common','enemy_whisper_swift','enemy_whisper_stalker','enemy_whisper_brute','enemy_whisper_ranged']);
function drawEnemySprite(e,key){
  const im=SPRITES[key];
  if(!im?.complete) return false;
  if(ENEMY_HD_KEYS.has(key)){
    let row=1,count=6;
    if(e.hit>0.01){row=3;count=2}
    else if(e.type==='ranged' && (e.attackVisual||0)>0){row=2;count=6}
    else if(e.type==='stalker' && (e.attackVisual||0)>0){row=2;count=6}
    const frame=Math.floor(performance.now()/(e.type==='swift'?85:(e.type==='brute'?135:110)))%count;
    const sz=e.miniboss?84:(e.type==='brute'?78:(e.type==='swift'||e.type==='stalker'?62:68));
    ctx.save();
    if(e.hit)ctx.globalAlpha=.55;
    const flip=e.x>game.x;
    if(flip){ctx.translate(e.x,e.y);ctx.scale(-1,1);ctx.drawImage(im,frame*128,row*128,128,128,-sz/2,-sz/2,sz,sz)}
    else ctx.drawImage(im,frame*128,row*128,128,128,e.x-sz/2,e.y-sz/2,sz,sz);
    ctx.restore();
    return true;
  }
  const f=Math.floor(e.anim/(e.boss?0.15:.18))%3;
  const fs=e.boss?64:32,sz=e.boss?88:(e.miniboss?70:44*(e.r/17));
  ctx.save();if(e.hit)ctx.globalAlpha=.55;ctx.drawImage(im,f*fs,0,fs,fs,e.x-sz/2,e.y-sz/2,sz,sz);ctx.restore();
  return true;
}
function markHeroAttack(duration=.22){if(game)game.attackVisual=Math.max(game.attackVisual||0,duration)}
function drawAtlasSprite(im,row,count,x,y,size,flip=false,alpha=1){
  const frame=Math.floor(performance.now()/({0:240,1:110,2:70,3:120}[row]||120))%count;
  ctx.save();
  ctx.globalAlpha=alpha;
  if(flip){ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(im,frame*128,row*128,128,128,-size/2,-size/2,size,size)}
  else ctx.drawImage(im,frame*128,row*128,128,128,x-size/2,y-size/2,size,size);
  ctx.restore();
}
function drawPlayerSprite(g,moving){
  const key=HERO_SHEET_BY_ID[g.hero.id],custom=SPRITES[key],size=HERO_DRAW_SIZE[g.hero.id]||78;
  if(custom?.complete){
    let row=0,count=4;
    if(g.invuln>0.05){row=3;count=2}
    else if((g.attackVisual||0)>0){row=2;count=6}
    else if(moving){row=1;count=6}
    const alpha=(g.invuln>0 && Math.floor(performance.now()/80)%2)?0.55:1;
    drawAtlasSprite(custom,row,count,g.x,g.y,size,g.lastFacing<0,alpha);
    return;
  }
  const him=SPRITES[`hero_${g.hero.id}`],hf=moving?Math.floor(performance.now()/120)%3:1;
  if(him?.complete){ctx.globalAlpha=(g.invuln>0 && Math.floor(performance.now()/80)%2) ? 0.55 : 1;ctx.drawImage(him,hf*32,0,32,32,g.x-24,g.y-24,48,48);ctx.globalAlpha=1}
  else{ctx.fillStyle='#d7d4b0';ctx.beginPath();ctx.arc(g.x,g.y,16,0,Math.PI*2);ctx.fill()}
}
function drawShotSprite(s,accent,evolved){
  const style=s.style||'tealbolt',im=SPRITES[`shot_${style}`];
  if(im?.complete){
    const frame=Math.abs(Math.floor(performance.now()/65)+(s.frameOffset||0))%5;
    const ang=Math.atan2(s.vy,s.vx),len=18+(s.size||5)*3.3,thick=14+(s.size||5)*1.9;
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(ang);ctx.globalAlpha=Math.max(.72,Math.min(1,s.life/.25));ctx.drawImage(im,frame*96,0,96,96,-len*.55,-thick*.5,len,thick);ctx.restore();return;
  }
  ctx.strokeStyle=evolved?'#efd67d':accent;ctx.lineWidth=s.size||4;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*.025,s.y-s.vy*.025);ctx.stroke();
}
function drawEnemyShotSprite(s){
  const key=s.sheet||enemyShotSheet(game?.stage?.tile||'forest'),im=SPRITES[key];
  if(im?.complete){
    const frame=Math.abs(Math.floor(performance.now()/75)+(s.frameOffset||0))%5;
    const ang=Math.atan2(s.vy,s.vx),len=16+(s.size||6)*3.0,thick=15+(s.size||6)*2.2;
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(ang);ctx.globalAlpha=Math.max(.76,Math.min(1,s.life/.35));ctx.drawImage(im,frame*96,0,96,96,-len*.55,-thick*.5,len,thick);ctx.restore();return;
  }
  ctx.fillStyle='#d56f76';ctx.beginPath();ctx.arc(s.x,s.y,6,0,Math.PI*2);ctx.fill();
}
for(const n of ['forest','swamp','ruins','ashes','heart']){const t=new Image();t.src=`assets/tiles/${n}.webp`;TILES[n]=t;const p=new Image();p.src=`assets/tiles/props/${n}.webp`;PROPS[n]=p}
const save=JSON.parse(localStorage.getItem('ggs-save')||'{}'); save.essence??=0; save.hero??='ranger'; save.upgrades??={vitality:0,might:0,haste:0}; save.mastery??={}; for(const h of HEROES) save.mastery[h.id]??={level:1,xp:0};
const persist=()=>localStorage.setItem('ggs-save',JSON.stringify(save));
const screens=$$('.screen'); const show=id=>{screens.forEach(s=>s.classList.remove('active'));$(id).classList.add('active')};
const qualityCaps={low:60,medium:100,high:150};
const MUTATORS=[
{id:'mist',name:'Névoa Faminta',desc:'alcance de coleta -22%, elites aparecem um pouco mais',apply:g=>{g.magnet*=.78;g.eliteBonus=.035}},
{id:'storm',name:'Tempestade Rúnica',desc:'raios atingem criaturas periodicamente, mas também ameaçam o herói',apply:g=>{g.mutatorTimer=4.5}},
{id:'bloodmoon',name:'Lua Rubra',desc:'inimigos +18% rápidos e +14% dano; experiência +20%',apply:g=>{g.enemySpeedMul=1.18;g.enemyDamageMul=1.14;g.xpMul=1.2}},
{id:'bloom',name:'Florescimento Antigo',desc:'mais cura em caches e regeneração leve, porém chefes +22% vida',apply:g=>{g.regenBonus=.55;g.bossHpMul=1.22}}
];
const BOSS_ASPECTS=[
{id:'echo',name:'Aspecto do Eco',desc:'repete padrões de projéteis'},
{id:'thorns',name:'Aspecto dos Espinhos',desc:'libera anéis defensivos ao perder vida'},
{id:'void',name:'Aspecto do Vazio',desc:'teleporta e convoca perseguidores'}
];
let stageIndex=0, game=null, last=0, paused=false, alertTimer=0,audioCtx=null;
function sfx(kind='tick'){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain(),v=Number($('#volume')?.value??.7);o.connect(g);g.connect(audioCtx.destination);const t=audioCtx.currentTime,f={boss:72,phase:110,chest:540,objective:760,cache:420,special:320,tick:250}[kind]||250;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(45,f*.55),t+.16);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08*v+.001,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.2);o.start(t);o.stop(t+.21)}catch{}}
function renderHeroes(){const g=$('#heroGrid');g.innerHTML='';HEROES.forEach(h=>{const m=save.mastery[h.id]||{level:1,xp:0},need=100+m.level*35,d=document.createElement('div');d.className='card '+(save.hero===h.id?'selected':'');d.innerHTML=`<div class='portrait'>${h.icon}</div><b>${h.name}</b><p>${h.desc}</p><small>HP ${h.hp} • Vel ${h.speed} • Dano ${h.damage}</small><small class='special-label'>Arma: ${h.weapon}</small><small class='special-label'>Especial: ${h.special}</small><small class='mastery-label'>Maestria Nv.${m.level} • ${m.xp}/${need} XP</small><button>SELECIONAR</button>`;d.querySelector('button').onclick=()=>{save.hero=h.id;persist();renderHeroes()};g.append(d)})}
const upgradeDefs=[['vitality','Vitalidade','+5% vida'],['might','Poder','+4% dano'],['haste','Agilidade','+3% velocidade']];
function renderUpgrades(){$('#essenceValue').textContent=save.essence;const g=$('#upgradeGrid');g.innerHTML='';upgradeDefs.forEach(([id,n,t])=>{const lv=save.upgrades[id]||0,cost=25+lv*25,d=document.createElement('div');d.className='card';d.innerHTML=`<b>${n}</b><p>${t} por nível</p><p>Nível ${lv}/10</p><button>${lv>=10?'MÁXIMO':cost+' essência'}</button>`;d.querySelector('button').disabled=lv>=10;d.querySelector('button').onclick=()=>{if(lv<10&&save.essence>=cost){save.essence-=cost;save.upgrades[id]++;persist();renderUpgrades()}};g.append(d)})}
$('#playBtn').onclick=()=>{sfx('tick');startLoading(0)};$('#heroesBtn').onclick=()=>{renderHeroes();show('#heroes')};$('#upgradesBtn').onclick=()=>{renderUpgrades();show('#upgrades')};$('#settingsBtn').onclick=()=>show('#settings');$$('.back').forEach(b=>b.onclick=()=>show('#menu'));
function startLoading(i){stageIndex=i;show('#loading');const st=STAGES[i];$('#loadTitle').textContent=`${st.emoji} ${st.name}`;$('#loadTip').textContent=['Explore o mapa: existem 4 Caches Ancestrais escondidos em cada área.','Objetivos opcionais rendem baús, relíquias e Essência.','Cada área possui cinco arquétipos de inimigos, incluindo o Espreitador.','Espreitadores podem se reposicionar perto do herói para emboscar.','O chefe aparece quando o cronômetro chega a zero.'][i%5];let p=0;$('#loadFill').style.width='0%';const t=setInterval(()=>{p+=10+Math.random()*16;$('#loadFill').style.width=Math.min(100,p)+'%';if(p>=100){clearInterval(t);setTimeout(initGame,120)}},70)}
function initGame(){const h=HEROES.find(x=>x.id===save.hero),m=save.mastery[h.id]||{level:1,xp:0},masteryBonus=1+Math.min(20,m.level-1)*.012,vit=(1+(save.upgrades.vitality||0)*.05)*masteryBonus,might=(1+(save.upgrades.might||0)*.04)*masteryBonus,haste=(1+(save.upgrades.haste||0)*.03)*(1+Math.min(15,m.level-1)*.006);game={hero:h,stage:STAGES[stageIndex],x:0,y:0,hp:h.hp*vit,maxHp:h.hp*vit,speed:h.speed*haste,damage:h.damage*might,fireRate:h.rate,lastShot:0,multishot:1,pierce:0,crit:.05,magnet:95,level:1,xp:0,nextXp:12,kills:0,time:300,spawn:0,enemies:[],shots:[],enemyShots:[],drops:[],chests:[],effects:[],keys:{},bossSpawned:false,bossDead:false,specialCd:0,invuln:0,props:makeProps(),weaponLevel:1,evolved:false,runEssence:0,minibossFlags:[false,false],eventFlags:[false,false,false],secondaryLevel:1,secondaryCd:1.8,secondaryTimer:.8,secondaryEvolved:false,tertiaryLevel:0,tertiaryTimer:1.2,tertiaryEvolved:false,relics:[],eliteKills:0,bossPhase:1,arena:null,shrines:[],shrineFlags:[false,false],pacts:[],synergies:[],synergyTimer:5.5,damageDone:0,chestsOpened:0,objectives:[],objectiveFlags:[false,false],runes:[],caches:makeCaches(),cacheCount:0,shake:0,mutator:MUTATORS[Math.floor(Math.random()*MUTATORS.length)],bossAspect:BOSS_ASPECTS[Math.floor(Math.random()*BOSS_ASPECTS.length)],mutatorTimer:5,enemySpeedMul:1,enemyDamageMul:1,xpMul:1,bossHpMul:1,eliteBonus:0,regenBonus:0,contract:null,contractFlag:false,contractsDone:0,attackVisual:0,lastFacing:1};game.mutator.apply(game);show('#game');$('#heroName').textContent=h.name;$('#specialName').textContent=h.special;paused=false;last=performance.now();updateWeaponHud();announce(`☾ ${game.mutator.name} • ${game.bossAspect.name}`);cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function makeProps(){const a=[];for(let i=0;i<90;i++){const ang=Math.random()*Math.PI*2,dist=220+Math.random()*1800;a.push({x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,s:.7+Math.random()*.8})}return a}
function makeCaches(){const a=[];for(let i=0;i<4;i++){const ang=i*Math.PI/2+Math.random()*.65,dist=520+Math.random()*900;a.push({x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,used:false})}return a}
addEventListener('keydown',e=>{if(game){game.keys[e.key.toLowerCase()]=true;if(e.code==='Space'){e.preventDefault();useSpecial()}}if(e.key==='Escape'&&game)togglePause()});addEventListener('keyup',e=>{if(game)game.keys[e.key.toLowerCase()]=false});
function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;if(!paused){update(dt);draw()}raf=requestAnimationFrame(loop)}
function update(dt){const g=game;if(!g)return;g.time=Math.max(0,g.time-dt);g.specialCd=Math.max(0,g.specialCd-dt);g.invuln=Math.max(0,g.invuln-dt);g.shake=Math.max(0,(g.shake||0)-dt);alertTimer=Math.max(0,alertTimer-dt);g.attackVisual=Math.max(0,(g.attackVisual||0)-dt);if(alertTimer<=0)$('#miniAlert').style.opacity=0;
 let dx=(g.keys.d||g.keys.arrowright?1:0)-(g.keys.a||g.keys.arrowleft?1:0),dy=(g.keys.s||g.keys.arrowdown?1:0)-(g.keys.w||g.keys.arrowup?1:0);const l=Math.hypot(dx,dy)||1;if(dx)g.lastFacing=dx<0?-1:1;g.x+=dx/l*g.speed*dt;g.y+=dy/l*g.speed*dt;if(g.hero.id==='druid')g.hp=Math.min(g.maxHp,g.hp+1.2*dt);if(g.regenBonus)g.hp=Math.min(g.maxHp,g.hp+g.regenBonus*dt);updateMutator(dt);updateContract(dt);
 const elapsed=300-g.time;if(elapsed>=145&&!g.contractFlag){g.contractFlag=true;startContract()}if(elapsed>=35&&!g.objectiveFlags[0]){g.objectiveFlags[0]=true;startRuneObjective()}if(elapsed>=195&&!g.objectiveFlags[1]){g.objectiveFlags[1]=true;startAlphaObjective()}updateObjectives(dt);if(elapsed>=90&&!g.eventFlags[0]){g.eventFlags[0]=true;triggerStageEvent(0)}if(elapsed>=155&&!g.eventFlags[2]){g.eventFlags[2]=true;startArenaEvent()}if(elapsed>=210&&!g.eventFlags[1]){g.eventFlags[1]=true;triggerStageEvent(1)}if(elapsed>=60&&!g.shrineFlags[0]){g.shrineFlags[0]=true;spawnShrine()}if(elapsed>=180&&!g.shrineFlags[1]){g.shrineFlags[1]=true;spawnShrine()}if(elapsed>=120&&!g.minibossFlags[0]){g.minibossFlags[0]=true;spawnEnemy(false,'brute',true);announce('⚔ MINIBOSS: Guardião Corrompido')}if(elapsed>=220&&!g.minibossFlags[1]){g.minibossFlags[1]=true;spawnEnemy(false,'ranged',true);announce('⚔ MINIBOSS: Arauto da Raiz')}
 g.spawn-=dt;const cap=qualityCaps[$('#quality').value]||100;if(g.time>0&&g.spawn<=0&&g.enemies.length<cap){const intensity=1+elapsed/70;for(let i=0;i<Math.min(5,Math.ceil(intensity*.55));i++)spawnEnemy(false);g.spawn=Math.max(.18,1.0/intensity)}if(g.time<=0&&!g.bossSpawned){g.bossSpawned=true;announce(`☠ ${g.stage.boss}`);sfx('boss');g.shake=.5;spawnEnemy(true)}
 g.lastShot-=dt;g.secondaryTimer-=dt;g.tertiaryTimer-=dt;g.synergyTimer-=dt;checkSynergies();if(g.synergyTimer<=0){triggerSynergies();g.synergyTimer=5.5}if(g.lastShot<=0&&g.enemies.length){shoot();g.lastShot=g.fireRate}if(g.secondaryTimer<=0&&g.enemies.length){shootSecondary();g.secondaryTimer=Math.max(.55,g.secondaryCd-(g.secondaryLevel-1)*.13)}if(g.tertiaryLevel>0&&g.tertiaryTimer<=0&&g.enemies.length){shootWisp();g.tertiaryTimer=Math.max(.42,1.35-g.tertiaryLevel*.16)}if(g.arena)updateArena(dt);
 for(const s of g.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.homing){let t=null,b=180**2;for(const e of g.enemies){const d=(e.x-s.x)**2+(e.y-s.y)**2;if(d<b){b=d;t=e}}if(t){const a=Math.atan2(t.y-s.y,t.x-s.x),spd=Math.hypot(s.vx,s.vy);s.vx=s.vx*.9+Math.cos(a)*spd*.1;s.vy=s.vy*.9+Math.sin(a)*spd*.1}}}g.shots=g.shots.filter(s=>s.life>0&&!s.dead);
 for(const s of g.enemyShots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;const d=Math.hypot(s.x-g.x,s.y-g.y);if(d<15&&g.invuln<=0){g.hp-=s.damage*(g.enemyDamageTaken||1);s.dead=true;g.invuln=.25;impact(g.x,g.y,'#d56f76');if(g.hp<=0)return endRun(false)}}g.enemyShots=g.enemyShots.filter(s=>s.life>0&&!s.dead);
 for(const e of g.enemies){e.ai=(e.ai||0)-dt;e.hit=Math.max(0,e.hit-dt);e.anim=(e.anim||0)+dt;e.attackVisual=Math.max(0,(e.attackVisual||0)-dt);const ex=g.x-e.x,ey=g.y-e.y,el=Math.hypot(ex,ey)||1;if(e.boss&&e.phase===1&&e.hp<=e.maxHp*.5){e.phase=2;e.speed*=1.28;e.damage*=1.2;e.ai=0;announce('☠ SEGUNDA FASE DO GUARDIÃO');g.shake=.45;sfx('phase');ringEffect(e.x,e.y,'#f0bd67')}if(e.boss&&e.phase===2&&e.hp<=e.maxHp*.2){e.phase=3;e.speed*=1.22;e.damage*=1.18;e.ai=0;announce('⚠ FÚRIA FINAL DO GUARDIÃO');g.shake=.65;sfx('phase');radialShots(e,18,210,12);ringEffect(e.x,e.y,'#ff8066')}if(e.boss){const lost=1-e.hp/e.maxHp,mark=Math.floor(lost*4);if(mark>e.aspectMarks){e.aspectMarks=mark;triggerBossAspect(e)}}if(e.boss)bossThink(e,dt,ex,ey,el);else if(e.type==='ranged'){if(el>250){e.x+=ex/el*e.speed*dt;e.y+=ey/el*e.speed*dt}else if(el<185){e.x-=ex/el*e.speed*.7*dt;e.y-=ey/el*e.speed*.7*dt}if(e.ai<=0){enemyAimShot(e);e.ai=e.miniboss?1.05:2.2}}else if(e.type==='stalker'){e.x+=ex/el*e.speed*dt;e.y+=ey/el*e.speed*dt;if(e.ai<=0&&el<420){const side=(Math.random()<.5?-1:1),a=Math.atan2(ey,ex)+side*.8;e.x=g.x-Math.cos(a)*110;e.y=g.y-Math.sin(a)*110;e.ai=3.2+Math.random()*1.3;e.attackVisual=.22;ringEffect(e.x,e.y,'#7e6aa8')}}else{e.x+=ex/el*e.speed*dt;e.y+=ey/el*e.speed*dt}if(e.affix==='vampiric'&&el<e.r+38)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.025*dt);if(el<e.r+16&&g.invuln<=0){g.hp-=e.damage*dt*(g.enemyDamageTaken||1);g.invuln=.04;if(g.hp<=0)return endRun(false)}}
 for(const e of [...g.enemies])if(!e.dead&&e.hp<=0)killEnemy(e);
 for(const s of g.shots)for(const e of g.enemies){if(s.dead||e.dead)continue;const d=Math.hypot(s.x-e.x,s.y-e.y);if(d<e.r+7){const crit=Math.random()<g.crit,amt=s.damage*(crit?2:1);e.hp-=amt;g.damageDone+=amt;e.hit=.09;impact(s.x,s.y,crit?'#fff1a8':g.stage.accent);s.p--;if(s.p<0)s.dead=true;if(e.hp<=0)killEnemy(e)}}
 g.shots=g.shots.filter(s=>!s.dead);g.enemies=g.enemies.filter(e=>!e.dead);
 for(const d of g.drops){const dist=Math.hypot(g.x-d.x,g.y-d.y);if(dist<g.magnet){const k=Math.min(1,dt*7);d.x+=(g.x-d.x)*k;d.y+=(g.y-d.y)*k}if(dist<18){d.dead=true;gainXp(d.v)}}g.drops=g.drops.filter(d=>!d.dead);
 for(const c of g.chests){if(Math.hypot(g.x-c.x,g.y-c.y)<28){c.dead=true;g.chestsOpened++;openChest()}}g.chests=g.chests.filter(c=>!c.dead);for(const r of g.runes){if(!r.dead&&Math.hypot(g.x-r.x,g.y-r.y)<26){r.dead=true;const o=g.objectives.find(x=>x.id==='runes'&&!x.done&&!x.failed);if(o){o.progress++;sfx('cache');announce(`✧ Runa encontrada ${o.progress}/${o.target}`);if(o.progress>=o.target)completeObjective('runes')}}}g.runes=g.runes.filter(r=>!r.dead);for(const c of g.caches){if(!c.used&&Math.hypot(g.x-c.x,g.y-c.y)<30){c.used=true;g.cacheCount++;g.runEssence+=6;sfx('cache');if(Math.random()<.4)g.chests.push({x:c.x+18,y:c.y,rare:false});else g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.12);announce(`✦ Cache ancestral ${g.cacheCount}/4`)}}for(const sh of g.shrines){if(!sh.used&&Math.hypot(g.x-sh.x,g.y-sh.y)<34){sh.used=true;openShrine(sh)}}g.shrines=g.shrines.filter(sh=>!sh.used);
 g.effects.forEach(e=>e.life-=dt);g.effects=g.effects.filter(e=>e.life>0);updateHud()}
function killEnemy(e){const g=game;e.dead=true;g.kills++;if(e.objective==='alpha')completeObjective('alpha');if(e.elite)g.eliteKills++;deathBurst(e.x,e.y,(e.miniboss||e.elite)?g.stage.accent:'#938e69',e.miniboss?18:(e.elite?12:7));if(e.boss){g.bossDead=true;g.chests.push({x:e.x,y:e.y,rare:true});setTimeout(()=>endRun(true),650)}else if(e.miniboss){g.chests.push({x:e.x,y:e.y,rare:true});g.runEssence+=8}else if(e.elite){if(Math.random()<.55)g.chests.push({x:e.x,y:e.y,rare:false});g.runEssence+=3;g.drops.push({x:e.x,y:e.y,v:3})}else if(Math.random()<.88)g.drops.push({x:e.x,y:e.y,v:e.type==='brute'?2:1})}
function bossThink(e,dt,ex,ey,el){const g=game,pattern=g.stage.bossPattern,phase=e.phase||1,mul=phase===3?1.15:phase===2?0.72:.55;e.x+=ex/el*e.speed*dt*mul;e.y+=ey/el*e.speed*dt*mul;if(e.ai>0)return;e.ai=phase===3?0.58:(phase===2?0.95:1.7)+Math.random()*(phase===3?0.45:phase===2?0.8:1.6);if(pattern==='charge'){e.x+=ex/el*(phase===3?240:phase===2?175:110);e.y+=ey/el*(phase===3?240:phase===2?175:110);ringEffect(e.x,e.y,g.stage.accent);if(phase>=2)radialShots(e,phase===3?12:8,phase===3?220:170,phase===3?14:11)}else if(pattern==='split'){for(let i=0;i<(phase===3?7:phase===2?5:3);i++)spawnEnemy(false);radialShots(e,phase===3?14:phase===2?10:6,phase===3?210:phase===2?175:135,phase===3?15:12)}else if(pattern==='bolts'){radialShots(e,phase===3?22:phase===2?16:10,phase===3?270:phase===2?225:180,phase===3?16:13);if(phase===3)spiralShots(e,9,200,11)}else if(pattern==='spores'){radialShots(e,phase===3?28:phase===2?20:14,phase===3?190:phase===2?150:115,phase===3?12:9);ringEffect(e.x,e.y,'#c36f66');if(phase===3)for(let i=0;i<3;i++)spawnEnemy(false,'swift')}else{radialShots(e,phase===3?32:phase===2?24:16,phase===3?230:phase===2?190:150,phase===3?17:14);for(let i=0;i<(phase===3?6:phase===2?4:2);i++)spawnEnemy(false);if(phase===3)spiralShots(e,12,185,12)}}
function spiralShots(e,count,speed,damage){const off=performance.now()/500,sheet=enemyShotSheet(game?.stage?.tile);for(let i=0;i<count;i++){const a=off+Math.PI*2*i/count;game.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4.5,damage,size:6,sheet,frameOffset:i})}}
function radialShots(e,count,speed,damage){const sheet=enemyShotSheet(game?.stage?.tile);for(let i=0;i<count;i++){const a=Math.PI*2*i/count;game.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4,damage,size:6,sheet,frameOffset:i})}}
function enemyAimShot(e){const g=game,a=Math.atan2(g.y-e.y,g.x-e.x),speed=e.miniboss?220:155;e.attackVisual=.28;g.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4,damage:e.damage*(e.miniboss?0.8:.65),size:e.miniboss?7:6,sheet:enemyShotSheet(g.stage.tile),frameOffset:Math.floor(Math.random()*5)})}
function pickArchetype(){const elapsed=300-game.time,allowed=ENEMY_ARCHETYPES.filter(a=>a.id==='common'||(a.id==='swift'&&elapsed>35)||(a.id==='brute'&&elapsed>80)||(a.id==='ranged'&&elapsed>110)||(a.id==='stalker'&&elapsed>145));let sum=allowed.reduce((n,a)=>n+a.weight,0),r=Math.random()*sum;for(const a of allowed){r-=a.weight;if(r<=0)return a}return allowed[0]}
function spawnEnemy(boss=false,forced=null,miniboss=false,forceElite=false){const g=game,a=Math.random()*Math.PI*2,dist=miniboss?500:420+Math.random()*240,elapsed=300-g.time,base=25+elapsed*.18;let arch=ENEMY_ARCHETYPES.find(x=>x.id===forced)||pickArchetype();const elite=!boss&&!miniboss&&(forceElite||elapsed>55&&Math.random()<Math.min(.13,.025+elapsed/5000+(g.eliteBonus||0))); let hp=(boss?760:base*arch.hp)*(1+stageIndex*.35),speed=(boss?68:(45+Math.random()*45+stageIndex*4)*arch.speed)*(boss?1:(g.enemySpeedMul||1)),damage=(boss?26:9+stageIndex*2)*arch.damage*(boss?1:(g.enemyDamageMul||1)),r=boss?46:(14+Math.random()*7)*arch.scale;if(boss)hp*=g.bossHpMul||1;let affix='';if(miniboss){hp*=6.5;damage*=1.7;speed*=.9;r*=1.65}if(elite){const affixes=['furious','armored','swift','vampiric'];affix=affixes[Math.floor(Math.random()*affixes.length)];hp*=affix==='armored'?3.0:2.2;damage*=affix==='furious'?1.75:1.35;speed*=affix==='swift'?1.55:1.12;if(affix==='vampiric'){hp*=1.35;damage*=1.25}r*=1.18}const enemy={x:g.x+Math.cos(a)*dist,y:g.y+Math.sin(a)*dist,r,hp,maxHp:hp,speed,damage,boss,miniboss,elite,affix,phase:1,type:boss?'boss':arch.id,hit:0,dead:false,ai:boss?0.8:(arch.ranged?1.2:arch.stalker?2.2:0),anim:0,bossAspect:boss?g.bossAspect.id:null,aspectMarks:0};g.enemies.push(enemy);return enemy}
function shoot(){const g=game;let target=null,best=1e9;for(const e of g.enemies){const d=(e.x-g.x)**2+(e.y-g.y)**2;if(d<best){best=d;target=e}}if(!target)return;const base=Math.atan2(target.y-g.y,target.x-g.x),id=g.hero.id,style=primaryShotStyle(id);let speed=560,life=1.1,p=g.pierce,damage=g.damage,size=4,homing=false;if(id==='ranger'){speed=720;damage*=1.05}else if(id==='witch'){speed=500;p+=2;size=7}else if(id==='smith'){speed=410;life=.85;damage*=1.65;size=8}else if(id==='druid'){speed=470;homing=true;size=6}else if(id==='relic'){speed=610;life=1.25;p+=1}if(g.evolved){damage*=1.35;p+=1;speed*=1.08;size+=2}
 markHeroAttack(id==='ranger' ? .26 : .18);let count=g.multishot+(g.evolved?1:0);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.13;g.shots.push({x:g.x,y:g.y,vx:Math.cos(base+off)*speed,vy:Math.sin(base+off)*speed,life,p,damage,size,homing,style,frameOffset:i})}}
function shootSecondary(){const g=game;if(!g)return;let target=null,best=1e9;for(const e of g.enemies){const d=(e.x-g.x)**2+(e.y-g.y)**2;if(d<best){best=d;target=e}}if(!target)return;const a=Math.atan2(target.y-g.y,target.x-g.x),count=g.secondaryEvolved?7:Math.min(5,1+Math.floor((g.secondaryLevel-1)/2));markHeroAttack(.12);for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.22;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a+off)*390,vy:Math.sin(a+off)*390,life:1.65,p:Math.floor(g.secondaryLevel/3),damage:g.damage*(.5+g.secondaryLevel*.1)*(g.secondaryEvolved?1.28:1),size:g.secondaryEvolved?8:6,homing:g.secondaryLevel>=4,style:g.secondaryEvolved?'moon':'tealbolt',frameOffset:i})}}
function shootWisp(){const g=game;if(!g||!g.enemies.length)return;const targets=[...g.enemies].sort((a,b)=>((a.x-g.x)**2+(a.y-g.y)**2)-((b.x-g.x)**2+(b.y-g.y)**2)).slice(0,g.tertiaryEvolved?6:Math.min(3,g.tertiaryLevel));markHeroAttack(.1);for(const [i,t] of targets.entries()){const a=Math.atan2(t.y-g.y,t.x-g.x),off=(i-(targets.length-1)/2)*.08;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a+off)*330,vy:Math.sin(a+off)*330,life:2.1,p:1+Math.floor(g.tertiaryLevel/3),damage:g.damage*(.38+g.tertiaryLevel*.09)*(g.tertiaryEvolved?1.35:1),size:g.tertiaryEvolved?10:8,homing:true,wisp:true,style:'wisp',frameOffset:i})}}
const RELICS=[
{id:'thorn',name:'Ídolo de Espinhos',text:'+1 perfuração',apply:g=>g.pierce++},
{id:'moon',name:'Lente Lunar',text:'+10% crítico',apply:g=>g.crit+=.10},
{id:'root',name:'Nó da Raiz-Mãe',text:'+18% vida máxima e cura',apply:g=>{g.maxHp*=1.18;g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.18)}},
{id:'wind',name:'Pena do Vendaval',text:'+10% movimento',apply:g=>g.speed*=1.10},
{id:'ember',name:'Carvão do Primeiro Fogo',text:'+14% dano',apply:g=>g.damage*=1.14}
];
function grantRelic(){const g=game;if(g.relics.length>=3){g.runEssence+=10;announce('✦ Relíquias cheias: +10 Essência');return}const pool=RELICS.filter(r=>!g.relics.includes(r.id));if(!pool.length)return;const r=pool[Math.floor(Math.random()*pool.length)];g.relics.push(r.id);r.apply(g);announce(`✧ RELÍQUIA: ${r.name}`);updateWeaponHud()}
function startArenaEvent(){const g=game;if(!g||g.arena)return;g.arena={x:g.x,y:g.y,r:285,time:20,spawn:.1};announce('◉ EVENTO RARO: CÍRCULO DOS ANTIGOS');ringEffect(g.x,g.y,'#8fd0c2')}
function updateArena(dt){const g=game,a=g.arena;if(!a)return;a.time-=dt;a.spawn-=dt;const d=Math.hypot(g.x-a.x,g.y-a.y);if(d>a.r){const ang=Math.atan2(g.y-a.y,g.x-a.x);g.x=a.x+Math.cos(ang)*a.r;g.y=a.y+Math.sin(ang)*a.r}if(a.spawn<=0&&a.time>0){for(let i=0;i<2;i++)spawnEnemy(false,Math.random()<.45?'swift':'common',false,Math.random()<.18);a.spawn=1.15}if(a.time<=0){g.arena=null;if(g.tertiaryLevel===0){g.tertiaryLevel=1;announce('✦ FOGO-FÁTUO DESBLOQUEADO')}else g.tertiaryLevel=Math.min(5,g.tertiaryLevel+1);grantRelic();updateWeaponHud()}}
function triggerStageEvent(slot){const g=game;if(!g)return;if(slot===0){announce('✦ EVENTO: Lua de Espinhos');for(let i=0;i<6;i++)spawnEnemy(false,i%2?'swift':'common',false,i===5);g.runEssence+=2}else{announce('✦ EVENTO: Caçada dos Anciões');for(let i=0;i<4;i++)spawnEnemy(false,'brute',false,true);g.secondaryLevel=Math.min(5,g.secondaryLevel+1);updateWeaponHud()}}
function useSpecial(){const g=game;if(!g||paused||g.specialCd>0)return;g.specialCd=g.hero.cooldown;sfx('special');const id=g.hero.id;if(id==='warden'){g.invuln=3;for(const e of g.enemies)if(Math.hypot(e.x-g.x,e.y-g.y)<150)e.hp-=g.damage*2;ringEffect(g.x,g.y,'#b7cf76')}else if(id==='ranger'){markHeroAttack(.34);for(let i=0;i<18;i++){const a=Math.PI*2*i/18;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,life:1.2,p:2,damage:g.damage*1.25,size:4,style:'moon',frameOffset:i})}}else if(id==='witch'){for(const e of g.enemies)if(Math.hypot(e.x-g.x,e.y-g.y)<230)e.hp-=g.damage*3;ringEffect(g.x,g.y,'#b084d6')}else if(id==='smith'){for(const e of g.enemies)if(Math.hypot(e.x-g.x,e.y-g.y)<180){e.hp-=g.damage*4;e.x+=(e.x-g.x)*.18;e.y+=(e.y-g.y)*.18}ringEffect(g.x,g.y,'#d6a55f')}else if(id==='druid'){g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.35);g.invuln=1.5;ringEffect(g.x,g.y,'#7fd17b')}else{markHeroAttack(.2);for(let i=0;i<24;i++){const a=Math.PI*2*i/24;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*500,vy:Math.sin(a)*500,life:1.4,p:4,damage:g.damage,size:5,style:'rune',frameOffset:i})}ringEffect(g.x,g.y,'#d48cd9')}for(const e of [...g.enemies])if(!e.dead&&e.hp<=0)killEnemy(e)}

function updateMutator(dt){const g=game;if(!g)return;if(g.mutator.id==='storm'){g.mutatorTimer-=dt;if(g.mutatorTimer<=0){g.mutatorTimer=4+Math.random()*2.2;const victims=[...g.enemies].filter(e=>!e.boss).sort(()=>Math.random()-.5).slice(0,Math.min(4,g.enemies.length));for(const e of victims){const dmg=g.damage*(1.1+Math.random()*.35);e.hp-=dmg;g.damageDone+=dmg;ringEffect(e.x,e.y,'#8fc6ff')}if(Math.random()<.22&&g.invuln<=0){g.hp-=Math.max(4,g.maxHp*.045);g.invuln=.35;ringEffect(g.x,g.y,'#8fc6ff');announce('⚡ A tempestade atingiu você')}}}}
function startContract(){const g=game;if(!g||g.contract)return;const types=[{id:'hunt',name:'Contrato: Caçada Implacável',target:22,time:38,desc:'Derrote 22 criaturas em 38s.'},{id:'elite',name:'Contrato: Sangue Ancestral',target:3,time:50,desc:'Derrote 3 elites em 50s.'},{id:'survive',name:'Contrato: Juramento de Ferro',target:1,time:28,desc:'Sobreviva 28s sem cair.'}];const t=types[Math.floor(Math.random()*types.length)];g.contract={...t,progress:0,startKills:g.kills,startElite:g.eliteKills,done:false,failed:false};announce(`⚑ ${t.name}`);sfx('objective')}
function updateContract(dt){const g=game,c=g?.contract;if(!c||c.done||c.failed)return;c.time-=dt;if(c.id==='hunt')c.progress=g.kills-c.startKills;else if(c.id==='elite')c.progress=g.eliteKills-c.startElite;else c.progress=c.time<=0?1:0;if(c.progress>=c.target){c.done=true;g.contractsDone++;g.runEssence+=18;g.chests.push({x:g.x+50,y:g.y-15,rare:true});if(g.relics.length<3)grantRelic();announce(`✓ CONTRATO CONCLUÍDO: ${c.name}`);sfx('objective');ringEffect(g.x,g.y,'#e6c477')}else if(c.time<=0){c.failed=true;announce(`✕ Contrato falhou: ${c.name}`);for(let i=0;i<3;i++)spawnEnemy(false,i===2?'brute':'swift',false,true)}}
function triggerBossAspect(e){const g=game;if(!g||!e)return;if(e.bossAspect==='echo'){radialShots(e,10+e.phase*4,170+e.phase*20,9+e.phase*2);setTimeout(()=>{if(game&&e&&!e.dead)radialShots(e,10+e.phase*4,150+e.phase*18,8+e.phase*2)},180);announce('◈ O Eco repete o padrão do Guardião')}else if(e.bossAspect==='thorns'){radialShots(e,14+e.phase*3,130+e.phase*22,11+e.phase*2);ringEffect(e.x,e.y,'#d9bd7a');announce('✹ Espinhos ancestrais irrompem')}else{const a=Math.random()*Math.PI*2,d=220+Math.random()*120;e.x=g.x+Math.cos(a)*d;e.y=g.y+Math.sin(a)*d;for(let i=0;i<Math.min(4,e.phase+1);i++)spawnEnemy(false,'stalker');ringEffect(e.x,e.y,'#8d6bb1');announce('◌ O Vazio desloca o Guardião')}}
function evolveSecondary(){const g=game;if(g.secondaryEvolved)return;g.secondaryEvolved=true;g.secondaryLevel=5;g.secondaryCd*=.78;announce('✦ SELO RÚNICO → MANDALA ANCESTRAL');ringEffect(g.x,g.y,'#aee7cc')}
function evolveTertiary(){const g=game;if(g.tertiaryEvolved)return;g.tertiaryEvolved=true;g.tertiaryLevel=5;announce('✦ FOGO-FÁTUO → CORTEJO ESPECTRAL');ringEffect(g.x,g.y,'#bfa9ff')}
function startRuneObjective(){const g=game;if(!g)return;const o={id:'runes',name:'Runas Perdidas',progress:0,target:3,time:75,done:false,failed:false};g.objectives.push(o);for(let i=0;i<3;i++){const a=Math.random()*Math.PI*2,d=300+i*170+Math.random()*120;g.runes.push({x:g.x+Math.cos(a)*d,y:g.y+Math.sin(a)*d,dead:false})}announce('✧ OBJETIVO: encontre 3 Runas Perdidas');sfx('objective')}
function startAlphaObjective(){const g=game;if(!g)return;const o={id:'alpha',name:'Caçada do Alfa',progress:0,target:1,time:42,done:false,failed:false};g.objectives.push(o);const e=spawnEnemy(false,'stalker',false,true);if(e){e.objective='alpha';e.hp*=2.2;e.maxHp=e.hp;e.damage*=1.35;e.r*=1.2}announce('⚔ OBJETIVO: derrote o Espreitador Alfa');sfx('objective')}
function updateObjectives(dt){const g=game;if(!g)return;for(const o of g.objectives){if(o.done||o.failed)continue;o.time-=dt;if(o.time<=0){o.failed=true;if(o.id==='runes')g.runes.length=0;announce(`✕ Objetivo falhou: ${o.name}`)}}}
function completeObjective(id){const g=game,o=g.objectives.find(x=>x.id===id&&!x.done&&!x.failed);if(!o)return;o.done=true;o.progress=o.target;g.runEssence+=14;g.chests.push({x:g.x+55,y:g.y,rare:true});if(id==='alpha')grantRelic();announce(`✓ OBJETIVO CONCLUÍDO: ${o.name}`);sfx('objective');ringEffect(g.x,g.y,'#9fe0a2')}
function spawnShrine(){const g=game,a=Math.random()*Math.PI*2,d=260+Math.random()*170;g.shrines.push({x:g.x+Math.cos(a)*d,y:g.y+Math.sin(a)*d,used:false});announce('✧ Um Santuário Corrompido surgiu próximo')}
function openShrine(sh){const g=game;paused=true;$('#levelup h2').textContent='Santuário Corrompido';const c=$('#cards');c.innerHTML='';const opts=[
{name:'Pacto da Fera',text:'+28% dano, mas -12% vida máxima.',apply:()=>{g.damage*=1.28;g.maxHp*=.88;g.hp=Math.min(g.hp,g.maxHp);g.pacts.push('Fera')}},
{name:'Pacto da Névoa',text:'+18% velocidade e +1 perfuração, mas inimigos causam +12% dano.',apply:()=>{g.speed*=1.18;g.pierce++;g.enemyDamageTaken=(g.enemyDamageTaken||1)*1.12;g.pacts.push('Névoa')}},
{name:'Pacto da Seiva',text:'+35% alcance de coleta e cura 35%, mas -9% dano.',apply:()=>{g.magnet*=1.35;g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.35);g.damage*=.91;g.pacts.push('Seiva')}},
{name:'Recusar o pacto',text:'+10 essência, sem penalidade.',apply:()=>g.runEssence+=10}
];for(const o of opts.sort(()=>Math.random()-.5).slice(0,3)){const d=document.createElement('div');d.className='card shrine-card';d.innerHTML=`<h3>${o.name}</h3><p>${o.text}</p>`;d.onclick=()=>{o.apply();checkSynergies();$('#levelup').classList.remove('active');$('#levelup h2').textContent='Escolha uma bênção';paused=false;checkSynergies();updateWeaponHud()};c.append(d)}$('#levelup').classList.add('active')}
function checkSynergies(){const g=game;if(!g)return;const add=(id,name)=>{if(!g.synergies.includes(id)){g.synergies.push(id);announce(`✦ SINERGIA: ${name}`);const hud=$('#weaponHud');hud?.classList.add('synergy-flash');setTimeout(()=>hud?.classList.remove('synergy-flash'),1200)}};if(g.evolved&&g.secondaryLevel>=4)add('thornstorm','Tempestade Rúnica');if(g.tertiaryLevel>=3&&g.relics.length>=2)add('covenant','Pacto dos Fogos');if(g.relics.length>=3)add('ancient','Tríade Ancestral');if(g.crit>=.23&&g.tertiaryLevel>=4)add('moonhunt','Caçada Lunar');if(g.maxHp>=g.hero.hp*1.35&&g.secondaryLevel>=4)add('bastion','Bastião Vivo');if(g.secondaryEvolved&&g.tertiaryEvolved)add('convergence','Convergência Espectral');updateWeaponHud()}
function triggerSynergies(){const g=game;if(!g||!g.enemies.length)return;if(g.synergies.includes('thornstorm')){for(let i=0;i<14;i++){const a=Math.PI*2*i/14;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*500,vy:Math.sin(a)*500,life:1.25,p:2,damage:g.damage*.8,size:6,style:'thorn',frameOffset:i})}ringEffect(g.x,g.y,'#efd67d')}if(g.synergies.includes('covenant')){const es=[...g.enemies].sort(()=>Math.random()-.5).slice(0,5);for(const e of es){const a=Math.atan2(e.y-g.y,e.x-g.x);g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,life:2,p:1,damage:g.damage*.72,size:7,homing:true,style:'tealbolt',frameOffset:Math.floor(Math.random()*5)})}}if(g.synergies.includes('ancient')){g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.035);for(const e of g.enemies)if(Math.hypot(e.x-g.x,e.y-g.y)<120)e.hp-=g.damage*.25}if(g.synergies.includes('moonhunt')){for(const e of [...g.enemies].sort(()=>Math.random()-.5).slice(0,6)){const a=Math.atan2(e.y-g.y,e.x-g.x);g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*480,vy:Math.sin(a)*480,life:1.8,p:2,damage:g.damage*.9,size:6,homing:true,style:'moon',frameOffset:Math.floor(Math.random()*5)})}}if(g.synergies.includes('bastion')){g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.018);g.invuln=Math.max(g.invuln,.22);ringEffect(g.x,g.y,'#b7cf76')}if(g.synergies.includes('convergence')){for(let i=0;i<18;i++){const a=Math.PI*2*i/18;g.shots.push({x:g.x,y:g.y,vx:Math.cos(a)*540,vy:Math.sin(a)*540,life:1.5,p:3,damage:g.damage*1.05,size:7,homing:i%2===0,style:i%2===0?'moon':'rune',frameOffset:i})}ringEffect(g.x,g.y,'#c9b4ff')}}

function openChest(){const g=game;sfx('chest');paused=true;$('#levelup h2').textContent='Baú do Guardião';const c=$('#cards');c.innerHTML='';const options=[];if(g.secondaryLevel>=5&&!g.secondaryEvolved&&g.pacts.length>=1)options.push({name:'EVOLUIR: Mandala Ancestral',text:'Evolui o Selo Rúnico: mais projéteis, dano e cadência.',cls:'evolved',apply:()=>evolveSecondary()});if(g.tertiaryLevel>=5&&!g.tertiaryEvolved&&g.relics.length>=2)options.push({name:'EVOLUIR: Cortejo Espectral',text:'Evolui o Fogo-Fátuo: mais espíritos e dano guiado.',cls:'evolved',apply:()=>evolveTertiary()});if(!g.evolved&&g.weaponLevel>=5)options.push({name:`EVOLUIR: ${g.hero.evolved}`,text:'Transforma sua arma em sua forma máxima.',cls:'evolved',apply:()=>evolveWeapon()});else if(!g.evolved)options.push({name:'Fortalecer arma',text:'+1 nível de arma e +8% dano.',apply:()=>{g.weaponLevel=Math.min(5,g.weaponLevel+1);g.damage*=1.08;updateWeaponHud()}});options.push({name:'Selo Rúnico',text:'+1 nível da arma secundária.',apply:()=>{g.secondaryLevel=Math.min(5,g.secondaryLevel+1);updateWeaponHud()}},{name:g.tertiaryLevel?'Fogo-Fátuo':'Despertar Fogo-Fátuo',text:g.tertiaryLevel?'+1 nível da terceira arma.':'Desbloqueia uma terceira arma automática.',apply:()=>{g.tertiaryLevel=Math.min(5,Math.max(1,g.tertiaryLevel+1));updateWeaponHud()}},{name:'Relíquia do Bosque',text:'Receba uma relíquia passiva única (máx. 3).',apply:()=>grantRelic()},{name:'Essência concentrada',text:'+12 essência nesta expedição.',apply:()=>g.runEssence+=12},{name:'Seiva restauradora',text:'Recupera 45% da vida máxima.',apply:()=>g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.45)});for(const o of options.sort(()=>Math.random()-.5).slice(0,3)){const d=document.createElement('div');d.className='card chest-card '+(o.cls||'');d.innerHTML=`<h3>${o.name}</h3><p>${o.text}</p>`;d.onclick=()=>{o.apply();checkSynergies();$('#levelup').classList.remove('active');$('#levelup h2').textContent='Escolha uma bênção';paused=false};c.append(d)}$('#levelup').classList.add('active')}
function evolveWeapon(){const g=game;g.evolved=true;g.damage*=1.35;g.fireRate*=.82;g.pierce++;g.multishot=Math.min(6,g.multishot+1);announce(`✦ ${g.hero.evolved} DESPERTA`);updateWeaponHud();ringEffect(g.x,g.y,'#efd67d')}
function ringEffect(x,y,color){game.effects.push({type:'ring',x,y,life:.6,max:.6,color})}function impact(x,y,color){game.effects.push({type:'impact',x,y,life:.18,max:.18,color})}function deathBurst(x,y,color,count){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=30+Math.random()*90;game.effects.push({type:'particle',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.35+Math.random()*.35,max:.7,color})}}
function gainXp(v){const g=game;g.xp+=v*(g.xpMul||1);if(g.xp>=g.nextXp){g.xp-=g.nextXp;g.level++;g.nextXp=Math.ceil(g.nextXp*1.25+3);openLevelUp()}}
function openLevelUp(){paused=true;$('#levelup h2').textContent='Escolha uma bênção';const picks=[...BLESSINGS].sort(()=>Math.random()-.5).slice(0,3),c=$('#cards');c.innerHTML='';for(const b of picks){const d=document.createElement('div');d.className='card';d.innerHTML=`<h3>${b.name}</h3><p>${b.text}</p>`;d.onclick=()=>{b.apply(game);updateWeaponHud();checkSynergies();$('#levelup').classList.remove('active');paused=false};c.append(d)}$('#levelup').classList.add('active')}
function objectiveStatusText(o){
  if(!o) return 'Objetivo: aguardando...';
  let progress='';
  if(o.done) progress='✓';
  else if(o.failed) progress='✕';
  else if(o.id==='runes') progress=o.progress+'/'+o.target;
  else progress=Math.ceil(o.time)+'s';
  return 'Objetivo: '+o.name+' '+progress;
}
function contractStatusText(c){
  if(!c) return 'Contrato: aguardando...';
  let progress='';
  if(c.done) progress='✓';
  else if(c.failed) progress='✕';
  else if(c.id==='survive') progress=Math.ceil(c.time)+'s';
  else progress=c.progress+'/'+c.target;
  return 'Contrato: '+progress;
}
function updateWeaponHud(){
  if(!game)return;
  const g=game;
  $('#weaponName').textContent=g.evolved?g.hero.evolved:g.hero.weapon;
  $('#weaponName').classList.toggle('evolved',g.evolved);
  $('#weaponLevel').textContent=g.evolved?'EVOLUÍDA':'Nv.'+g.weaponLevel;
  const sh=$('#secondaryHud');
  if(sh) sh.textContent=g.secondaryEvolved?'Secundária: Mandala Ancestral ✦':'Secundária: Selo Rúnico Nv.'+g.secondaryLevel;
  const th=$('#tertiaryHud');
  if(th) th.textContent=g.tertiaryEvolved?'Terceira: Cortejo Espectral ✦':(g.tertiaryLevel?'Terceira: Fogo-Fátuo Nv.'+g.tertiaryLevel:'Terceira: bloqueada');
  const rh=$('#relicHud');
  if(rh) rh.textContent='Relíquias: '+g.relics.length+'/3';
  const names={thornstorm:'Tempestade Rúnica',covenant:'Pacto dos Fogos',ancient:'Tríade Ancestral',moonhunt:'Caçada Lunar',bastion:'Bastião Vivo',convergence:'Convergência Espectral'};
  const sy=$('#synergyHud');
  if(sy) sy.textContent='Sinergias: '+(g.synergies.length?g.synergies.map(x=>names[x]||x).join(' • '):'nenhuma');
  const cu=$('#curseHud');
  if(cu) cu.textContent='Pactos: '+g.pacts.length;
  const oh=$('#objectiveHud');
  if(oh){
    const o=[...g.objectives].reverse().find(x=>!x.done&&!x.failed)||[...g.objectives].reverse()[0];
    oh.textContent=objectiveStatusText(o);
  }
  const ch=$('#cacheHud');
  if(ch) ch.textContent='Exploração: '+g.cacheCount+'/4';
  const mh=$('#mutatorHud');
  if(mh) mh.textContent='Mutador: '+g.mutator.name;
  const bh=$('#bossAspectHud');
  if(bh) bh.textContent='Boss: '+g.bossAspect.name;
  const co=$('#contractHud');
  if(co) co.textContent=contractStatusText(g.contract);
}
function announce(text){$('#miniAlert').textContent=text;$('#miniAlert').style.opacity=1;alertTimer=2.5}
function updateHud(){
  const g=game;
  if(!g)return;
  $('#hpText').textContent=Math.ceil(g.hp)+'/'+Math.ceil(g.maxHp);
  $('#kills').textContent=g.kills;
  const m=Math.floor(g.time/60);
  const sec=Math.floor(g.time%60);
  $('#timer').textContent=String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
  $('#xpFill').style.width=(g.xp/g.nextXp*100)+'%';
  $('#level').textContent='Nv. '+g.level;
  const pct=g.specialCd<=0?100:Math.max(0,100-g.specialCd/g.hero.cooldown*100);
  $('#specialFill').style.width=pct+'%';
  $('#specialCd').textContent=g.specialCd<=0?'PRONTO':g.specialCd.toFixed(1)+'s';
  const oh=$('#objectiveHud');
  if(oh){
    const o=[...g.objectives].reverse().find(x=>!x.done&&!x.failed)||[...g.objectives].reverse()[0];
    oh.textContent=objectiveStatusText(o);
  }
  const ch=$('#cacheHud');
  if(ch) ch.textContent='Exploração: '+g.cacheCount+'/4';
  const co=$('#contractHud');
  if(co) co.textContent=contractStatusText(g.contract);
}
function draw(){const g=game,st=g.stage,w=canvas.width,h=canvas.height,ox=w/2-g.x,oy=h/2-g.y;ctx.fillStyle=st.bg;ctx.fillRect(0,0,w,h);ctx.save();const sx=g.shake?(Math.random()-.5)*18*g.shake:0,sy=g.shake?(Math.random()-.5)*18*g.shake:0;ctx.translate(ox+sx,oy+sy);const tile=TILES[st.tile];if(tile?.complete){for(let x=Math.floor((g.x-w/2)/128)*128;x<g.x+w/2+128;x+=128)for(let y=Math.floor((g.y-h/2)/128)*128;y<g.y+h/2+128;y+=128)ctx.drawImage(tile,x,y,128,128)}else{ctx.fillStyle=st.ground;ctx.fillRect(g.x-w/2,g.y-h/2,w,h)}
 const prop=PROPS[st.tile];for(const p of g.props){if(Math.abs(p.x-g.x)<w*.65&&Math.abs(p.y-g.y)<h*.7&&prop?.complete)ctx.drawImage(prop,p.x-32*p.s,p.y-32*p.s,64*p.s,64*p.s)}
 if(g.arena){ctx.save();ctx.strokeStyle='#8fd0c2aa';ctx.lineWidth=5;ctx.setLineDash([18,12]);ctx.beginPath();ctx.arc(g.arena.x,g.arena.y,g.arena.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#d7fff3';ctx.font='bold 16px system-ui';ctx.fillText(`Círculo ${Math.ceil(g.arena.time)}s`,g.arena.x-42,g.arena.y-g.arena.r-12);ctx.restore()}
 for(const d of g.drops){ctx.fillStyle='#e8e3a8';ctx.beginPath();ctx.arc(d.x,d.y,5,0,Math.PI*2);ctx.fill()}for(const r of g.runes){ctx.save();ctx.translate(r.x,r.y);ctx.rotate(performance.now()/900);ctx.strokeStyle='#aee7cc';ctx.lineWidth=3;ctx.strokeRect(-10,-10,20,20);ctx.rotate(Math.PI/4);ctx.strokeRect(-7,-7,14,14);ctx.restore()}for(const c of g.caches){if(c.used)continue;ctx.fillStyle='#3e2d22';ctx.fillRect(c.x-13,c.y-10,26,20);ctx.strokeStyle='#86b99f';ctx.lineWidth=2;ctx.strokeRect(c.x-14,c.y-11,28,22);ctx.fillStyle='#86b99f';ctx.fillRect(c.x-3,c.y-3,6,6)}for(const c of g.chests){ctx.fillStyle='#5b3b20';ctx.fillRect(c.x-15,c.y-10,30,22);ctx.fillStyle='#d3ae55';ctx.fillRect(c.x-16,c.y-12,32,7);ctx.fillRect(c.x-3,c.y-3,6,8);ctx.strokeStyle='#efd67d';ctx.strokeRect(c.x-17,c.y-13,34,26)}for(const sh of g.shrines){ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(performance.now()/1800);ctx.strokeStyle='#bd82ad';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI*2*i/6,x=Math.cos(a)*22,y=Math.sin(a)*22;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.stroke();ctx.fillStyle='#7b436d88';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.restore()}
 for(const s of g.shots)drawShotSprite(s,st.accent,g.evolved);for(const s of g.enemyShots)drawEnemyShotSprite(s)
 for(const e of g.enemies){const key=e.boss?`boss_${bossKeys[stageIndex]}`:`enemy_${enemyKeys[stageIndex]}_${e.type}`;if(!drawEnemySprite(e,key)){ctx.fillStyle=e.boss?'#7d4459':'#5e6944';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill()}if(e.elite&&!e.boss&&!e.miniboss){ctx.strokeStyle=e.affix==='furious'?'#d66d56':e.affix==='swift'?'#80c5d6':e.affix==='vampiric'?'#c06b9f':'#d7bb6c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r+7,0,Math.PI*2);ctx.stroke()}if(e.boss||e.miniboss){const bw=e.boss?120:82;ctx.fillStyle='#0009';ctx.fillRect(e.x-bw/2,e.y-e.r-20,bw,8);ctx.fillStyle=e.boss?'#c05c71':'#d1a55d';ctx.fillRect(e.x-bw/2,e.y-e.r-20,bw*Math.max(0,e.hp/e.maxHp),8);if(e.boss&&e.phase>=2){ctx.fillStyle=e.phase===3?'#ff8066':'#f0bd67';ctx.fillRect(e.x-bw/2,e.y-e.r-26,bw,3)}}}
 for(const e of g.effects){const t=1-e.life/e.max;if(e.type==='ring'){ctx.strokeStyle=e.color;ctx.globalAlpha=1-t;ctx.lineWidth=6*(1-t)+2;ctx.beginPath();ctx.arc(e.x,e.y,30+t*170,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}else if(e.type==='impact'){ctx.fillStyle=e.color;ctx.globalAlpha=e.life/e.max;ctx.beginPath();ctx.arc(e.x,e.y,4+t*15,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}else if(e.type==='particle'){e.x+=e.vx*.016;e.y+=e.vy*.016;ctx.fillStyle=e.color;ctx.globalAlpha=Math.max(0,e.life/e.max);ctx.fillRect(e.x-2,e.y-2,4,4);ctx.globalAlpha=1}}
 if(g.mutator.id==='mist'){ctx.save();ctx.fillStyle='#cfd8ce16';for(let i=0;i<12;i++){const px=g.x-700+((performance.now()*.025+i*137)%1400),py=g.y-390+((i*83)%780);ctx.beginPath();ctx.ellipse(px,py,120,34,0,0,Math.PI*2);ctx.fill()}ctx.restore()}else if(g.mutator.id==='bloodmoon'){ctx.save();ctx.fillStyle='#6e182011';ctx.fillRect(g.x-w/2,g.y-h/2,w,h);ctx.restore()}const moving=g.keys.w||g.keys.a||g.keys.s||g.keys.d||g.keys.arrowup||g.keys.arrowdown||g.keys.arrowleft||g.keys.arrowright;drawPlayerSprite(g,moving);ctx.restore();ctx.fillStyle='#ffffff20';ctx.font='bold 22px system-ui';ctx.fillText(`${st.emoji} ${st.name}`,24,h-28)}
function endRun(win){if(!game)return;paused=true;const reward=Math.max(5,Math.floor(game.kills/12)+(win?40:0)+game.runEssence),masteryGain=Math.floor(game.kills*.35)+(win?55:15)+stageIndex*10;save.essence+=reward;const m=save.mastery[game.hero.id]||(save.mastery[game.hero.id]={level:1,xp:0});m.xp+=masteryGain;let ups=0,need=100+m.level*35;while(m.xp>=need&&m.level<25){m.xp-=need;m.level++;ups++;need=100+m.level*35}persist();$('#resultTitle').textContent=win?'Guardião derrotado!':'A floresta venceu desta vez';$('#resultText').innerHTML=`<p>Derrotados: <b>${game.kills}</b></p><p>Nível da run: <b>${game.level}</b></p><p>Arma: <b>${game.evolved?game.hero.evolved:game.hero.weapon}</b></p><p>Elites derrotados: <b>${game.eliteKills}</b></p><p>Secundária: <b>Selo Rúnico Nv.${game.secondaryLevel}</b></p><p>Terceira: <b>${game.tertiaryLevel?'Fogo-Fátuo Nv.'+game.tertiaryLevel:'não obtida'}</b></p><p>Relíquias: <b>${game.relics.length}/3</b></p><p>Sinergias: <b>${game.synergies.length}</b></p><p>Pactos: <b>${game.pacts.length}</b></p><p>Mutador: <b>${game.mutator.name}</b></p><p>Aspecto do boss: <b>${game.bossAspect.name}</b></p><p>Contratos concluídos: <b>${game.contractsDone}</b></p><p>Baús abertos: <b>${game.chestsOpened}</b></p><p>Objetivos concluídos: <b>${game.objectives.filter(o=>o.done).length}/2</b></p><p>Caches encontrados: <b>${game.cacheCount}/4</b></p><p>Dano causado: <b>${Math.floor(game.damageDone)}</b></p><p>Essência obtida: <b>${reward}</b></p><p>Maestria: <b>+${masteryGain} XP • Nv.${m.level}${ups?' ↑':''}</b></p>`;$('#nextBtn').style.display=win&&stageIndex<STAGES.length-1?'block':'none';$('#results').classList.add('active')}
$('#nextBtn').onclick=()=>{$('#results').classList.remove('active');game=null;startLoading(stageIndex+1)};$('#menuBtn').onclick=()=>{$('#results').classList.remove('active');game=null;cancelAnimationFrame(raf);show('#menu')};
function togglePause(){paused=!paused;$('#pause').classList.toggle('active',paused)}$('#pauseBtn').onclick=togglePause;$('#resumeBtn').onclick=togglePause;$('#quitBtn').onclick=()=>{$('#pause').classList.remove('active');paused=false;game=null;cancelAnimationFrame(raf);show('#menu')};
$('#quality').value=save.quality||'medium';$('#volume').value=save.volume??.7;$('#quality').onchange=e=>{save.quality=e.target.value;persist()};$('#volume').oninput=e=>{save.volume=Number(e.target.value);persist()};renderHeroes();persist();
