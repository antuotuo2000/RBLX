'use strict';
(()=>{
  const fmt=(n,d=1)=>Number.isFinite(n)?n.toFixed(d):'—';
  function calculate(model){
    const inputs=[...model.querySelectorAll('input[data-key]')],out=model.querySelector('.model-result');
    if(inputs.some(i=>!i.value.trim()||!i.checkValidity()||!Number.isFinite(Number(i.value)))){out.classList.add('error');out.textContent='请检查输入：参数须在标注范围内，且不能留空。';return}
    out.classList.remove('error');const v=Object.fromEntries(inputs.map(i=>[i.dataset.key,Number(i.value)]));const n=v.years;
    let end,wealth;
    if(model.dataset.model==='index'){end=100*Math.pow((1+(v.priceGrowth+v.yield)/100)*(1-v.fee/100),n);wealth=end}
    else if(model.dataset.model==='sales'){end=100*Math.pow((1+v.growth/100)/(1+v.dilution/100),n)*(v.margin/100)*v.exit/v.entry;wealth=end}
    else{end=100*Math.pow(1+v.growth/100,n)*v.exit/v.entry;wealth=end+v.yield*n}
    const cagr=(Math.pow(wealth/100,1/n)-1)*100;
    if(!Number.isFinite(end)||!Number.isFinite(cagr)||wealth<0){out.classList.add('error');out.textContent='此参数组合无法计算，请调整参数。';return}
    out.innerHTML='<div><small>期末'+(model.dataset.model==='index'?'总回报':'价格')+'指数 / 初始 100</small><strong>'+fmt(end)+'</strong></div><div><small>年化'+(model.dataset.model==='index'?'总回报':'财富增长')+'</small><strong>'+fmt(cagr)+'%</strong></div><div><small>累计总回报</small><strong>'+fmt(wealth-100)+'%</strong></div>';
  }
  document.querySelectorAll('.model').forEach(calculate);
  document.addEventListener('input',e=>{const m=e.target.closest('.model');if(m)calculate(m)});
  document.addEventListener('click',e=>{if(e.target.closest('.reset-model')){const m=e.target.closest('.model');m.querySelectorAll('input').forEach(i=>i.value=i.defaultValue);calculate(m)}});
  const launch=document.getElementById('present');if(!launch)return;
  let shell,stage,counter,previous,next,play,progress,slides=[],index=0,timer=null,oldOverflow='',returnFocus,enteredFullscreen=false;
  function stop(){clearInterval(timer);timer=null;if(play){play.textContent='自动播放';play.setAttribute('aria-pressed','false')}}
  function draw(){stage.replaceChildren(slides[index]);stage.scrollTop=0;counter.textContent=(index+1)+' / '+slides.length;previous.disabled=index===0;next.disabled=index===slides.length-1;progress.style.width=(index+1)/slides.length*100+'%';if(index===slides.length-1)stop()}
  function move(delta){index=Math.max(0,Math.min(slides.length-1,index+delta));draw()}
  function close(){if(!shell)return;stop();const old=shell;shell=null;enteredFullscreen=false;if(document.fullscreenElement===old)document.exitFullscreen().catch(()=>{});old.remove();document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',key);returnFocus?.focus()}
  function key(e){if(!shell)return;if(e.key==='Escape'){e.preventDefault();close();return}if(e.key==='Tab'){const els=[...shell.querySelectorAll('button:not(:disabled),input,a[href]')];const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}return}if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    if(['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();stop();move(['ArrowRight','PageDown'].includes(e.key)?1:-1)}
    if(e.key==='Home'||e.key==='End'){e.preventDefault();stop();index=e.key==='Home'?0:slides.length-1;draw()}
    if(e.key===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();play.click()}
  }
  function prepare(node){const clone=node.cloneNode(true);clone.querySelectorAll('.chapter-pager').forEach(n=>n.remove());if(clone.id)clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));clone.querySelectorAll('a[href^="#"]').forEach(a=>{const label=document.createElement('span');label.textContent=a.textContent;a.replaceWith(label)});const wrap=document.createElement('div');wrap.className='slide-inner';wrap.append(clone);return wrap}
  launch.addEventListener('click',()=>{
    if(shell)return;returnFocus=document.activeElement;slides=[prepare(document.querySelector('header'))];
    // Two cards per desktop slide; a scrollable stage preserves readability on small screens.
    document.querySelectorAll('.reading-section').forEach(section=>{const cards=[...section.querySelectorAll('.insight')];for(let start=0;start<cards.length;start+=2){const clone=section.cloneNode(true);clone.querySelector('.insight-grid').replaceChildren(...cards.slice(start,start+2).map(c=>c.cloneNode(true)));if(cards.length>2){const part=document.createElement('span');part.textContent=' · '+(start/2+1)+' / '+Math.ceil(cards.length/2);clone.querySelector('.eyebrow').append(part)}slides.push(prepare(clone))}});
    slides.push(prepare(document.getElementById('valuation')),prepare(document.getElementById('sources')));
    shell=document.createElement('div');shell.className='slideshow';shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label',document.body.dataset.ticker+' 全屏演示');
    shell.innerHTML='<div class="slide-top"><strong><span class="slide-title"></span> <span style="color:#ed403b">RESEARCH</span></strong><button type="button" class="slide-exit">退出演示 ✕</button></div><div class="slide-stage"></div><div class="slide-progress"></div><div class="slide-controls"><button type="button" class="slide-prev">← 上一页</button><span class="slide-counter" aria-live="polite"></span><button type="button" class="slide-next">下一页 →</button><button type="button" class="slide-play" aria-pressed="false">自动播放</button><span class="slide-help">← → 翻页 · 空格播放/暂停 · 每页 20 秒 · Esc 退出</span></div>';
    shell.querySelector('.slide-title').textContent=document.body.dataset.ticker;
    document.body.append(shell);stage=shell.querySelector('.slide-stage');counter=shell.querySelector('.slide-counter');previous=shell.querySelector('.slide-prev');next=shell.querySelector('.slide-next');play=shell.querySelector('.slide-play');progress=shell.querySelector('.slide-progress');shell.querySelector('.slide-exit').onclick=close;
    previous.onclick=()=>{stop();move(-1)};next.onclick=()=>{stop();move(1)};play.onclick=()=>{if(timer){stop();return}if(index===slides.length-1){index=0;draw()}play.textContent='暂停播放';play.setAttribute('aria-pressed','true');timer=setInterval(()=>move(1),20000)};
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';index=0;draw();document.addEventListener('keydown',key);shell.querySelector('.slide-exit').focus();if(shell.requestFullscreen)shell.requestFullscreen().catch(()=>{});
    slides.forEach(w=>w.querySelectorAll('.model').forEach(calculate));
  });
  document.addEventListener('fullscreenchange',()=>{if(!shell)return;if(document.fullscreenElement===shell)enteredFullscreen=true;else if(enteredFullscreen)close()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
