var G=[],Z={items:{},exported:null,changes:0},tab="grain",view="name",q="",ft="",fx=0,cur=null,tm=null,T={},fo=false,tmOpen=null,AC=null,bo=false,CK={},fm={},app=document.getElementById("app");
var LV=["Порожня","¼","½","¾","Повна"],PL=["Шафа","Полиця","Ящик · мала коробка","Ящик · велика коробка"],SL={low:"Закінчується",out:"Немає"},KD={jar:"банка",sealed:"закрита пачка",open:"відкрита пачка"};
try{var s0=JSON.parse(localStorage.getItem("krupy-zapas")||"null");if(s0&&s0.items)Z=s0}catch(e){}
try{CK=JSON.parse(localStorage.getItem("krupy-checks")||"{}")||{}}catch(e){CK={}}
function save(){try{localStorage.setItem("krupy-zapas",JSON.stringify(Z))}catch(e){}}
function ckSave(){try{localStorage.setItem("krupy-checks",JSON.stringify(CK))}catch(e){}}
function isOn(gid,k){return!!(CK[gid]&&CK[gid][k])}
function chg(){Z.changes=(Z.changes||0)+1;save()}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function us(id){return Z.items[id]||[]}
function ty(g){return g.type||"grain"}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function tt(g){return g.nick||g.name}
function hit(g,q){var h=((g.nick||"")+" "+g.name+" "+g.brand+" "+g.id+" "+(g.barcode||"")).toLowerCase();return q.toLowerCase().split(/\s+/).filter(Boolean).every(function(w){return h.indexOf(w)>-1})}
function fmt(s){var m=Math.floor(s/60),r=s%60;return m+":"+(r<10?"0":"")+r}
function stop(id){delete T[id];if(!Object.keys(T).some(function(k){return !T[k].done})&&tm){clearInterval(tm);tm=null}}
function left(id){return Math.max(0,Math.ceil((T[id].end-Date.now())/1000))}
function btxt(id){return T[id].done?"Готово: "+gname(id):"⏱ "+gname(id)+" "+fmt(left(id))}
function banners(){var k=Object.keys(T).filter(function(id){return id!==cur});if(!k.length)return"";
 return'<div class="tbs">'+k.map(function(id){return'<button class="btn p" id="tb-'+esc(id)+'" data-act="tbanner" data-v="'+esc(id)+'">'+esc(btxt(id))+'</button>'}).join("")+'</div>'}
function gname(id){var g=G.filter(function(x){return x.id===id})[0];return g?tt(g):""}
function unlock(){try{var C=window.AudioContext||window.webkitAudioContext;if(C){AC=AC||new C();AC.resume()}}catch(e){}}
function beep(){try{if(!AC)return;for(var i=0;i<3;i++){var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.4;o.frequency.value=880;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.25,t);o.start(t);o.stop(t+.25)}}catch(e){}}
function tick(){var redo=false;
 Object.keys(T).forEach(function(id){var t=T[id];if(t.done)return;var s=left(id),n=document.getElementById("tb-"+id);
  if(s<=0){t.done=true;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}if(id===cur)redo=true;if(n)n.textContent=btxt(id);return}
  if(id===cur){var b=document.getElementById("tmb"),v=document.getElementById("tmv");if(b)b.textContent=fmt(s);if(v)v.textContent=fmt(s)}
  if(n)n.textContent=btxt(id)});
 if(redo)card();
 if(!Object.keys(T).some(function(k){return !T[k].done})&&tm){clearInterval(tm);tm=null}}
function pop(g){if(!(tmOpen===g.id&&T[g.id]))return"";var dn=T[g.id].done;
 return'<div class="dim" style="z-index:7" data-act="tclose"></div><div class="pop" role="dialog" aria-modal="true" aria-label="Таймер"><h2>'+esc(tt(g))+'</h2><b id="tmv">'+(dn?"Готово!":fmt(left(g.id)))+'</b><div class="fl2"><button class="btn" data-act="tstop">'+(dn?"Скинути":"Зупинити")+'</button><button class="btn p" data-act="tclose">'+(dn?"Закрити":"Згорнути")+'</button></div></div>'}
function ut(g,u){if(u.kind==="jar")return"банка ≈ "+LV[u.level];if(u.kind==="sealed")return u.count+" × "+g.pack+" закр.";return"відкрита"+(u.grams?" ≈ "+u.grams+" г":"")}
function sum(g){return us(g.id).map(function(u){return u.place+": "+ut(g,u)}).join(" · ")}
function status(g){var a=us(g.id);if(!a.length)return"none";
 if(a.some(function(u){return(u.kind==="jar"&&u.level>=2)||(u.kind==="sealed"&&u.count>0)}))return"ok";
 return a.some(function(u){return(u.kind==="jar"&&u.level===1)||(u.kind==="open"&&u.grams!==0)})?"low":"out"}
function seg(items,c,act){return'<div class="seg">'+items.map(function(i){return'<button data-act="'+act+'" data-v="'+i[0]+'" aria-pressed="'+(i[0]===c)+'">'+i[1]+'</button>'}).join("")+'</div>'}
function row(g,line){var s=status(g),b=ty(g)==="grain"?g.min+" хв":g.pack;
 return'<button class="item" data-act="open" data-v="'+esc(g.id)+'"><span><b>'+esc(tt(g))+'</b><small>'+(g.nick?esc(g.name)+' · ':'')+esc(g.brand)+' · '+esc(g.pack)+'</small>'+(line?'<small class="st">'+esc(line)+'</small>':'')+'</span><span class="bd"><span class="badge">'+esc(b)+'</span>'+((s==="low"||s==="out")?'<span class="badge w">'+SL[s]+'</span>':'')+'</span></button>'}
function parts(s){var m=s.match(/^([^:,(]{2,24}):\s*(.+)$/);if(!m)return{g:"",a:[s]};var a=[],d=0,c="",t=m[2];
 for(var i=0;i<t.length;i++){var ch=t.charAt(i);if(ch==="(")d++;if(ch===")")d--;if(ch===","&&d===0){a.push(c.trim());c=""}else c+=ch}
 if(c.trim())a.push(c.trim());return{g:m[1],a:a}}
function pin(gid,k,t){var o=isOn(gid,k);return'<button class="pin'+(o?' done':'')+'" data-act="ck" data-k="'+k+'" role="checkbox" aria-checked="'+o+'"><i aria-hidden="true"></i><span>'+esc(t)+'</span></button>'}
function stepLi(gid,k,i,s){var o=isOn(gid,k);return'<li class="stp'+(o?' done':'')+'" data-act="ck" data-k="'+k+'" role="checkbox" tabindex="0" aria-checked="'+o+'"><i>'+(i+1)+'</i><span>'+esc(s)+'</span></li>'}
function rec(r,gid){var n=0,op=false,h='<section class="rcp"><div class="rh"><span class="eyebrow">Рецепт з пачки</span><h2 class="rt">'+esc(r.title)+'</h2><div class="prog" id="rp"></div></div><h3>Інгредієнти</h3>';
 r.ingredients.forEach(function(x){var p=parts(x);if(p.g){if(op)h+='</div>';h+='<div class="grp">'+esc(p.g)+'</div><div class="pins">';op=true}else if(!op){h+='<div class="pins">';op=true}
  p.a.forEach(function(t){h+=pin(gid,"i"+n++,t)})});
 if(op)h+='</div>';
 h+='<h3>Приготування</h3><ol class="rs">';r.steps.forEach(function(s,i){h+=stepLi(gid,"r"+i,i,s)});return h+'</ol></section>'}
function updProg(){if(!cur)return;var r=document.getElementById("rp"),s=document.getElementById("sp"),q=function(x){return document.querySelectorAll(x)},rs=' <button class="lk" data-act="ckr">Скинути відмітки</button>';
 if(r){var d1=q(".rcp .pin.done").length,d2=q(".rcp .stp.done").length;r.innerHTML='Інгредієнти '+d1+'/'+q(".rcp .pin").length+' · кроки '+d2+'/'+q(".rcp .stp").length+((d1+d2)?rs:"")}
 if(s){var d=q(".ms .stp.done").length;s.innerHTML=d?'Виконано '+d+' з '+q(".ms .stp").length+rs:""}}
function route(){var id=location.hash.slice(1),g=G.filter(function(x){return x.id===id})[0];cur=g?g.id:null;if(!g||g.id!==tmOpen)tmOpen=null;fm={};window.scrollTo(0,0);if(g)tab=ty(g);document.body.className=tab==="spice"?"sp":"";cur?card():home()}
function days(){return Z.exported?Math.floor((Date.now()-Date.parse(Z.exported))/864e5):null}
function home(){
 var l=G.filter(function(g){return ty(g)===tab&&hit(g,q)&&(tab!=="grain"||((!ft||g.tag===ft)&&(!fx||(g.min>0&&g.min<=fx))))});
 var need=G.filter(function(g){var s=status(g);return s==="low"||s==="out"});
 var nf=(tab==="grain"?(ft?1:0)+(fx?1:0):0)+(view==="place"?1:0),h='<h1>Наша кухня</h1>'+banners()+seg([["grain","Крупи"],["spice","Приправи"]],tab,"tab")+'<input id="q" aria-label="Пошук" placeholder="Знайти…" value="'+esc(q)+'">'+'<div class="fl"><button class="btn" data-act="fo" aria-expanded="'+fo+'">Фільтри'+(nf?' · '+nf:'')+'</button><span>Знайдено: '+l.length+'</span>'+(nf?'<button class="btn" data-act="fr">Скинути</button>':'')+'</div>'+(fo?'<div class="frm">'+(tab==="grain"?seg([["","Усі"],["kasha","Каша"],["side","Гарнір"]],ft,"ft")+seg([[0,"Будь-який"],[10,"до 10 хв"],[15,"до 15 хв"]],fx,"fx"):"")+seg([["name","За назвою"],["place","За місцем"]],view,"view")+'</div>':'');
 if(view==="name"){l.forEach(function(g){h+=row(g,sum(g))})}
 else{var gr={},no=[];l.forEach(function(g){var a=us(g.id);if(!a.length)no.push(g);a.forEach(function(u){(gr[u.place]=gr[u.place]||[]).push([g,u])})});
  Object.keys(gr).sort(function(a,b){return a.localeCompare(b,"uk",{numeric:true})}).forEach(function(p){h+='<h2>'+esc(p)+'</h2>';gr[p].forEach(function(x){h+=row(x[0],ut(x[0],x[1]))})});
  if(no.length){h+='<h2>Місце не вказано</h2>';no.forEach(function(g){h+=row(g,"")})}}
 if(!l.length)h+='<p>Нічого не знайдено.</p>'+(nf?'<button class="btn" data-act="fr">Скинути фільтри</button>':'');
 if(need.length){h+='<div class="cart"><h2>Купити</h2><ul style="margin:8px 0 0;padding-left:20px">';need.forEach(function(g){h+='<li style="display:list-item">'+esc(tt(g))+' — '+SL[status(g)].toLowerCase()+'</li>'});h+='</ul></div>'}
 var d=days();
 var warn=(Z.changes||0)>0&&(d===null||d>7);
 h+='<details class="bk"'+(bo?' open':'')+'><summary><span>Резервна копія</span><small>'+(d===null?'ще не робилась':'збережено '+d+' дн. тому')+((Z.changes||0)?' · змін: '+Z.changes:'')+'</small>'+(warn?'<b class="dot" role="img" aria-label="Є незбережені зміни"></b>':'')+'</summary><p>Облік запасів і нотатки живуть лише в цьому браузері. Збережіть файл, щоб їх не втратити.</p><div class="bkb"><button class="gh" data-act="export">⬇ Зберегти файл</button><label class="gh">⬆ Відновити з файлу<input id="im" type="file" accept=".json,application/json" hidden></label></div></details>';
 app.className="";app.innerHTML=h;
 var bd=document.querySelector(".bk");bd.ontoggle=function(){bo=bd.open};
 var i=document.getElementById("q");i.oninput=function(){q=i.value;var p=i.selectionStart;home();var n=document.getElementById("q");n.focus();n.setSelectionRange(p,p)};
 document.getElementById("im").onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var o=JSON.parse(r.result);if(!o||typeof o.items!=="object")throw 0;if(confirm("Замінити поточний облік даними з файлу?")){Z=o;save();home()}}catch(x){alert("Не вдалося прочитати файл")}};r.readAsText(f)};
}
function unitHtml(g,u){
 var h='<div class="unit"><div class="uh"><b>'+esc(u.place)+'</b><span>'+KD[u.kind]+'</span><button class="x" data-act="del" data-u="'+u.u+'" aria-label="Видалити запис">✕</button></div>';
 if(u.kind==="jar"){h+='<div class="seg">';LV.forEach(function(t,i){h+='<button data-act="lv" data-u="'+u.u+'" data-v="'+i+'" aria-pressed="'+(u.level===i)+'">'+t+'</button>'});h+='</div>'}
 else if(u.kind==="sealed")h+='<div class="step"><button data-act="dec" data-u="'+u.u+'" aria-label="Менше">−</button><b>'+u.count+' × '+esc(g.pack)+'</b><button data-act="inc" data-u="'+u.u+'" aria-label="Більше">+</button></div>';
 else h+='<label style="font-size:14px;color:var(--mute)">Залишилось, г<input type="number" min="0" inputmode="numeric" data-act="grams" data-u="'+u.u+'" value="'+(u.grams==null?"":u.grams)+'"></label>';
 return h+'</div>'}
function sheet(g){
 var a=us(g.id),src=a.filter(function(u){return u.kind!=="jar"}),dst=a.filter(function(u){return u.kind==="jar"});
 var h='<div id="dim" class="dim" data-act="close" style="display:'+(fm.open?'block':'none')+'"></div><div id="sh" class="sheet'+(fm.open?' open':'')+'"><button id="hd" class="hd" aria-expanded="'+(!!fm.open)+'" aria-controls="sb"><i></i><span>'+(fm.open?'Запас ↓':'Запас ↑')+'</span></button><div id="sb" class="sb"'+(fm.open?'':' inert')+'>';
 if(!a.length)h+='<p style="margin:0;color:var(--mute)">Запису про запас ще немає. Додайте банку чи пачку.</p>';
 a.forEach(function(u){h+=unitHtml(g,u)});
 if(src.length&&dst.length){h+='<button class="btn" data-act="tpour">Пересипати з пачки в банку</button>';
  if(fm.pour){h+='<div class="frm"><label>Звідки<select id="ps">'+src.map(function(u){return'<option value="'+u.u+'">'+esc(u.place)+' · '+KD[u.kind]+'</option>'}).join("")+'</select></label><label>Куди<select id="pd">'+dst.map(function(u){return'<option value="'+u.u+'">'+esc(u.place)+'</option>'}).join("")+'</select></label><label>Скільки лишиться в пачці, г<input id="pr" type="number" min="0" inputmode="numeric" value="0"></label><button class="btn p" data-act="dopour">Пересипати</button></div>'}}
 h+='<button class="btn" data-act="tadd">+ Додати банку чи пачку</button>';
 if(fm.add){h+='<div class="frm"><label>Що<select id="ak"><option value="jar">Банка (рівень)</option><option value="sealed">Закрита пачка</option><option value="open">Відкрита пачка</option></select></label><label>Де лежить<input id="ap" list="pl" placeholder="Банка 3, Шафа, Ящик…"></label><datalist id="pl">'+PL.map(function(p){return'<option value="'+esc(p)+'">'}).join("")+'</datalist><button class="btn p" data-act="doadd">Додати</button></div>'}
 return h+'</div></div>'}
function card(){
 var g=G.filter(function(x){return x.id===cur})[0],h=banners()+'<button class="back" data-act="back">← Усі</button><div><h1>'+esc(tt(g))+'</h1><div style="margin-top:6px;font-size:14px;color:var(--mute)">'+(g.nick&&g.nick!==g.name?esc(g.name)+' · ':'')+esc(g.brand)+' · '+esc(g.pack)+'</div></div><div class="stats">';
 var ti=-1;if(ty(g)==="grain"&&g.min>0)g.stats.forEach(function(s,i){if(ti<0&&/хв/.test(s.v))ti=i});
 g.stats.forEach(function(s,i){if(i===ti){var ts=T[g.id],run=ts&&!ts.done,dn=ts&&ts.done;h+='<button class="stat tb2" data-act="timer" aria-label="'+(run?"Відкрити таймер":"Запустити таймер")+': '+esc(s.v)+' '+esc(s.l)+'"><span><b id="tmb">'+(run?fmt(left(g.id)):dn?"Готово!":esc(s.v))+'</b><span>'+esc(s.l)+'</span></span><i class="pl" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="'+(run?"M7 5h4v14H7zM13 5h4v14h-4z":dn?"M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z":"M8 5v14l11-7z")+'"/></svg></i></button>'}
  else h+='<div class="stat"><b>'+esc(s.v)+'</b><span>'+esc(s.l)+'</span></div>'});
 h+='</div>';
 if(g.steps&&g.steps.length){h+='<div class="prog" id="sp"></div><ol class="ms">';g.steps.forEach(function(s,i){h+=stepLi(g.id,"s"+i,i,s)});h+='</ol>'}
 if(g.uses&&g.uses.length){h+='<div><h2 style="margin-bottom:8px">Куди додавати</h2><div class="chips">';g.uses.forEach(function(c){h+='<span class="chip">'+esc(c)+'</span>'});h+='</div></div>'}
 h+='<div class="chips">';g.chips.forEach(function(c){h+='<span class="chip">'+esc(c)+'</span>'});
 h+='</div>'+(g.note?'<p class="note">'+esc(g.note)+'</p>':'');
 if(g.photo)h+='<a href="'+esc(g.photo)+'" target="_blank" rel="noopener"><img src="'+esc(g.photo)+'" alt="Упаковка: '+esc(tt(g))+'" loading="lazy" style="width:100%;border-radius:16px;display:block"></a>';
 h+='<div><h2 style="margin-bottom:8px">Нотатки родини <span id="ns" style="font-weight:400;color:var(--mute);font-size:14px"></span></h2><textarea id="nt" rows="3" aria-label="Нотатки родини" placeholder="Наприклад: розсипчаста 1:2, 15 хв">'+esc((Z.notes||{})[g.id]||"")+'</textarea></div>'+(g.recipe?rec(g.recipe,g.id):'');
 app.className="c";app.innerHTML=h+sheet(g)+pop(g);bindSheet();updProg();
 var nt=document.getElementById("nt");if(nt){var nto=null,sv=function(){Z.notes=Z.notes||{};if(nt.value.trim())Z.notes[g.id]=nt.value;else delete Z.notes[g.id];chg();var s=document.getElementById("ns");if(s)s.textContent="· Збережено"};
  nt.oninput=function(){clearTimeout(nto);var s=document.getElementById("ns");if(s)s.textContent="";nto=setTimeout(sv,400)};
  nt.onblur=function(){clearTimeout(nto);if(nt.value!==((Z.notes||{})[g.id]||""))sv()}}
}
function bindSheet(){
 var hd=document.getElementById("hd"),sh=document.getElementById("sh");if(!hd)return;
 hd.onclick=function(e){if(e.detail===0){fm.open=!fm.open;card()}};
 hd.onpointerdown=function(e){var y0=e.clientY,mv=0,base=fm.open?0:sh.offsetHeight-56,mx=sh.offsetHeight-56;try{hd.setPointerCapture(e.pointerId)}catch(x){}
  sh.style.transition="none";
  hd.onpointermove=function(ev){var dy=ev.clientY-y0;mv=Math.max(mv,Math.abs(dy));sh.style.transform="translateY("+Math.min(Math.max(base+dy,0),mx)+"px)"};
  hd.onpointerup=function(ev){hd.onpointermove=null;hd.onpointerup=null;var dy=ev.clientY-y0;sh.style.transition="";
   if(mv<6)fm.open=!fm.open;else if(dy<-20)fm.open=true;else if(dy>20)fm.open=false;
   card()}};
}
function unit(id){return us(cur).filter(function(x){return x.u===id})[0]}
function rm(u){Z.items[cur]=us(cur).filter(function(x){return x!==u})}
app.addEventListener("click",function(e){
 var b=e.target.closest("[data-act]");if(!b)return;var a=b.getAttribute("data-act"),v=b.getAttribute("data-v"),u=unit(b.getAttribute("data-u"));
 if(a==="open"){location.hash=v}
 else if(a==="back"){tmOpen=null;location.hash=""}
 else if(a==="tbanner"){tmOpen=v;location.hash=v}
 else if(a==="timer"){var tg=G.filter(function(x){return x.id===cur})[0];if(!tg)return;
  if(!T[cur]){unlock();T[cur]={end:Date.now()+tg.min*60000,done:false};if(!tm)tm=setInterval(tick,1000)}
  tmOpen=cur;card()}
 else if(a==="tstop"){stop(cur);tmOpen=null;card()}
 else if(a==="tclose"){tmOpen=null;card()}
 else if(a==="ck"){CK[cur]=CK[cur]||{};var ck=b.getAttribute("data-k");if(CK[cur][ck])delete CK[cur][ck];else CK[cur][ck]=1;if(!Object.keys(CK[cur]).length)delete CK[cur];ckSave();var on=isOn(cur,ck);b.classList.toggle("done",on);b.setAttribute("aria-checked",on);updProg()}
 else if(a==="ckr"){delete CK[cur];ckSave();card()}
 else if(a==="tab"){tab=v;document.body.className=tab==="spice"?"sp":"";home()}
 else if(a==="view"){view=v;home()}
 else if(a==="fo"){fo=!fo;home()}
 else if(a==="fr"){ft="";fx=0;view="name";home()}
 else if(a==="ft"){ft=v;home()}
 else if(a==="fx"){fx=+v;home()}
 else if(a==="close"){fm.open=false;card()}
 else if(a==="export"){Z.exported=new Date().toISOString();Z.changes=0;save();var bl=new Blob([JSON.stringify(Z,null,1)],{type:"application/json"}),l=document.createElement("a");l.href=URL.createObjectURL(bl);l.download="zapas.json";document.body.appendChild(l);l.click();l.remove();home()}
 else if(a==="lv"&&u){u.level=+v;chg();card()}
 else if(a==="inc"&&u){u.count++;chg();card()}
 else if(a==="dec"&&u){u.count--;if(u.count<=0)rm(u);chg();card()}
 else if(a==="del"&&u){if(confirm("Видалити цей запис?")){rm(u);chg();card()}}
 else if(a==="tpour"){fm.pour=!fm.pour;card()}
 else if(a==="tadd"){fm.add=!fm.add;card()}
 else if(a==="doadd"){var k=document.getElementById("ak").value,p=document.getElementById("ap").value.trim()||"Шафа",n={u:uid(),kind:k,place:p};if(k==="jar")n.level=4;else if(k==="sealed")n.count=1;else n.grams=null;(Z.items[cur]=us(cur)).push(n);fm.add=false;fm.open=true;chg();card()}
 else if(a==="dopour"){var s=unit(document.getElementById("ps").value),d=unit(document.getElementById("pd").value),r=parseInt(document.getElementById("pr").value,10)||0;if(!s||!d)return;d.level=4;
  if(s.kind==="sealed"){s.count--;if(s.count<=0)rm(s);if(r>0)us(cur).push({u:uid(),kind:"open",place:s.place,grams:r})}
  else{if(r>0)s.grams=r;else rm(s)}
  fm.pour=false;fm.open=true;chg();card()}
});
app.addEventListener("change",function(e){var t=e.target;if(t.getAttribute&&t.getAttribute("data-act")==="grams"){var u=unit(t.getAttribute("data-u"));if(u){u.grams=t.value===""?null:Math.max(0,parseInt(t.value,10)||0);chg()}}});
app.addEventListener("keydown",function(e){var t=e.target;if((e.key===" "||e.key==="Enter")&&t.getAttribute&&t.getAttribute("role")==="checkbox"&&t.tagName==="LI"){e.preventDefault();t.click()}});
window.onhashchange=route;
fetch("data/krupy.json",{cache:"no-cache"}).then(function(r){return r.json()}).then(function(d){G=d;route()}).catch(function(){app.textContent="Не вдалося завантажити data/krupy.json"});
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});
