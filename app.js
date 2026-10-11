(function () {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(pointer:fine)');
  const hasGSAP=!!(window.gsap&&window.ScrollTrigger);
  let manualLight=false,light=reducedQuery.matches,animationContext=null,selectedScene='studio',selectedColor='moss',audioPending=false,tiltX=null,tiltY=null;
  document.body.classList.add('js');
  try {manualLight=localStorage.getItem('aura-frequency-motion')==='light';selectedColor=localStorage.getItem('aura-frequency-color')||'moss';}catch(e){}
  light=manualLight||reducedQuery.matches;
  const field=window.AuraField?new AuraField($('#field'),{reducedMotion:light}):null;
  const flux=window.AuraFlux?new AuraFlux($('#flux'),{reducedMotion:light}):null;
  const state={energy:0},fieldElement=$('#field-stage');
  const sceneNames={studio:'慢下来',outdoor:'去野外',night:'入夜后'};
  const modes={sphere:'01 / ORBITAL SPHERE',torus:'02 / LUMINOUS TORUS',wave:'03 / FLOWING WAVE'};
  const colors={moss:{en:'MOSS',cn:'苔绿',bg:'#d9ddc6',ink:'#384b30',filter:'none',matrix:[1,1,1]},sand:{en:'SAND',cn:'砂岩',bg:'#e6deca',ink:'#6f604b',filter:'sepia(.6) saturate(.55) brightness(1.30)',matrix:[1.32,1.20,1.1]},graphite:{en:'GRAPHITE',cn:'石墨',bg:'#b4b9b2',ink:'#252923',filter:'grayscale(1) brightness(.65)',matrix:[.65,.65,.65]}};
  if(!colors[selectedColor])selectedColor='moss';
  $$('[data-split]').forEach(el=>{const text=el.textContent;el.setAttribute('aria-label',text);el.textContent='';for(const char of text){const s=document.createElement('span');s.className='char';s.setAttribute('aria-hidden','true');s.textContent=char===' '? '\u00a0':char;el.append(s);}});
  if(hasGSAP){gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});}

  function setupAnimations(){
    if(animationContext){animationContext.revert();animationContext=null;}
    document.body.classList.toggle('light-motion',light);document.documentElement.classList.toggle('light-motion',light);
    if(!hasGSAP||light)return;
    animationContext=gsap.matchMedia();
    animationContext.add({desktop:'(min-width:701px)',mobile:'(max-width:700px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
      if(context.conditions.reduce)return;
      const mobile=context.conditions.mobile;
      gsap.to('.hero-product-float',{y:mobile?-12:-18,duration:3.4,ease:'sine.inOut',repeat:-1,yoyo:true,scrollTrigger:{trigger:'.hero',start:'top bottom',end:'bottom top',toggleActions:'play pause resume pause'}});
      gsap.to('.hero-title',{yPercent:-16,opacity:.25,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.8}});
      gsap.to('.hero-product-wrap',{y:mobile?80:160,x:mobile?-30:-75,rotation:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.1}});
      gsap.to('.hero-orbits',{rotation:45,scale:1.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.from('.manifesto-title',{y:65,opacity:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:'.manifesto',start:'top 78%',once:true}});
      gsap.to('.fill-text',{'--fill':'100%',ease:'none',scrollTrigger:{trigger:'.manifesto-title',start:'top 65%',end:'bottom 30%',scrub:.7}});
      gsap.to('.orbital-art',{rotation:36,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('.plane-a',{rotationY:245,rotationZ:25,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1.3}});
      gsap.to('.plane-b',{rotationY:-245,rotationZ:-25,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1.3}});
      gsap.set('.blueprint',{autoAlpha:0,scale:.85});
      const chapters=$$('.object-chapter');
      const objectTimeline=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{id:'object-story',trigger:'.object-section',pin:'.object-stage',start:'top top',end:()=>'+='+innerHeight*(mobile?2.65:3.1),scrub:.75,invalidateOnRefresh:true,onUpdate:self=>{$('.chapter-progress i').style.transform='scaleX('+Math.max(.02,self.progress)+')';$('.chapter-current').textContent=self.progress<.32?'01':self.progress<.66?'02':'03';}}});
      objectTimeline.to('.object-image',{rotation:8,scale:1.08,duration:1.3},0)
        .to('.object-halo',{scale:1.55,opacity:.7,duration:1.3},0)
        .to(chapters[0],{autoAlpha:0,y:-22,duration:.25},1.15)
        .fromTo(chapters[1],{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.35},1.4)
        .to('.object-image',{rotation:-5,y:mobile?-28:-58,scale:.93,autoAlpha:.30,duration:.8},1.25)
        .to('.blueprint',{autoAlpha:.7,scale:1.04,duration:.7},1.35)
        .to('.blueprint-shell',{y:mobile?-28:-55,duration:.7},1.5)
        .to('.driver-one',{x:-25,y:32,duration:.7},1.5)
        .to('.driver-two',{x:25,y:32,duration:.7},1.5)
        .to('.blueprint-lines',{autoAlpha:.35,duration:.7},1.5)
        .to(chapters[1],{autoAlpha:0,y:-22,duration:.25},2.65)
        .fromTo(chapters[2],{autoAlpha:0,y:30},{autoAlpha:1,y:0,duration:.35},2.9)
        .to('.blueprint',{autoAlpha:0,scale:1.25,duration:.65},2.7)
        .to('.object-image',{autoAlpha:1,rotation:-19,y:0,x:mobile?15:20,scale:1.05,duration:.85},2.8)
        .to('.object-halo',{scale:2,autoAlpha:.2,duration:.8},2.8)
        .to('.object-outline',{xPercent:18,duration:4.2,ease:'none'},0)
        .to({hold:0},{hold:1,duration:.55},3.65);
      gsap.from('.lab-heading h2',{y:65,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.lab',start:'top 78%',once:true}});
      const worldTimeline=gsap.timeline({scrollTrigger:{trigger:'.world',pin:'.world-pin',start:'top top',end:()=>'+='+innerHeight*(mobile?.65:1.05),scrub:.9},defaults:{ease:'none'}});
      worldTimeline.to('.world-image',{clipPath:'inset(0% 0%)',scale:1,duration:1},0).fromTo('.world h2',{y:70},{y:-40,duration:1},0).to('.world-rotation',{rotation:180,duration:1},0);
      gsap.from('.edition-heading h2',{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.edition',start:'top 78%',once:true}});
      gsap.to('#edition-product',{rotation:7,y:-18,ease:'none',scrollTrigger:{trigger:'.edition',start:'top bottom',end:'bottom top',scrub:1.2}});
      gsap.to('.edition-word',{xPercent:10,ease:'none',scrollTrigger:{trigger:'.edition',start:'top bottom',end:'bottom top',scrub:1.2}});
      gsap.from('.finale h2 .char',{yPercent:100,rotation:15,opacity:0,stagger:.035,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:'.finale',start:'top 75%',once:true}});
      gsap.to('.finale-rings',{rotation:60,scale:1.1,ease:'none',scrollTrigger:{trigger:'.finale',start:'top bottom',end:'bottom top',scrub:1}});
      $$('.reveal').filter(el=>!el.matches('h2')).forEach(el=>gsap.from(el,{y:25,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    });
    ScrollTrigger.refresh();
  }
  function setMotion(){
    light=manualLight||reducedQuery.matches;
    $('#motion-toggle').setAttribute('aria-pressed',String(light));$('.motion-label').textContent=light?'LIGHT MOTION':'FULL MOTION';$('#motion-toggle').setAttribute('aria-label',light?'恢复完整动态模式':'开启轻动态模式');
    field?.setReducedMotion(light);flux?.setReducedMotion(light);setupAnimations();
    if(hasGSAP){if(light){tiltX?.tween.pause();tiltY?.tween.pause();gsap.killTweensOf('.magnetic');gsap.set('.magnetic',{x:0,y:0});}gsap.set('.hero-product-float',{rotationX:0,rotationY:0,x:0});}
  }
  $('#motion-toggle').addEventListener('click',()=>{manualLight=!light;try{localStorage.setItem('aura-frequency-motion',manualLight?'light':'full');}catch(e){}setMotion();});
  reducedQuery.addEventListener('change',setMotion);
  setMotion();
  if(hasGSAP){
    if(light){gsap.set('.intro-shutter',{display:'none'});}else{
      const intro=gsap.timeline({onComplete:()=>{$('.intro-shutter').style.display='none';}});
      intro.fromTo('.intro-shutter>span',{opacity:0,y:12},{opacity:1,y:0,duration:.4},0)
        .to('.intro-shutter>span',{opacity:0,duration:.25},.65)
        .to('.intro-shutter>div:first-child',{yPercent:-100,duration:.7,ease:'power3.inOut'},.7)
        .to('.intro-shutter>div:nth-child(2)',{yPercent:100,duration:.7,ease:'power3.inOut'},.7)
        .from('.hero-title .char',{yPercent:110,rotation:12,opacity:0,stagger:.035,duration:1.05,ease:'power4.out'},.88)
        .from('.hero-product-wrap',{scale:.8,opacity:0,duration:1.25,ease:'power3.out'},1.0)
        .from('.hero-footer>*',{y:20,opacity:0,stagger:.12,duration:.65},1.4);
    }
    ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{$('.scroll-progress i').style.transform='scaleX('+self.progress+')';}});
  }else{$('.intro-shutter').style.display='none';light=true;document.body.classList.add('light-motion');}
  setTimeout(()=>{$('.intro-shutter').style.display='none';},2200);

  const hero=$('.hero');
  let heroRect=hero.getBoundingClientRect();
  tiltX=hasGSAP?gsap.quickTo('.hero-product-float','rotationY',{duration:1,ease:'power3.out'}):null;tiltY=hasGSAP?gsap.quickTo('.hero-product-float','rotationX',{duration:1,ease:'power3.out'}):null;
  hero.addEventListener('pointerenter',()=>{heroRect=hero.getBoundingClientRect();});
  hero.addEventListener('pointermove',e=>{if(light)return;const x=(e.clientX-heroRect.left)/heroRect.width*2-1,y=(e.clientY-heroRect.top)/heroRect.height*2-1;flux?.setPointer(x,-y);if(finePointer.matches){tiltX?.(x*8);tiltY?.(-y*6);}});
  hero.addEventListener('pointerleave',()=>{flux?.setPointer(0,0);if(light){if(hasGSAP)gsap.set('.hero-product-float',{rotationX:0,rotationY:0});}else{tiltX?.(0);tiltY?.(0);}});
  let fieldRect=fieldElement.getBoundingClientRect(),pointerDown=null;
  fieldElement.addEventListener('pointerenter',()=>{fieldRect=fieldElement.getBoundingClientRect();});
  fieldElement.addEventListener('pointerdown',e=>{fieldRect=fieldElement.getBoundingClientRect();pointerDown={x:e.clientX,y:e.clientY};});
  fieldElement.addEventListener('pointermove',e=>{if(light)return;field?.setPointer((e.clientX-fieldRect.left)/fieldRect.width*2-1,(e.clientY-fieldRect.top)/fieldRect.height*2-1);});
  fieldElement.addEventListener('pointerleave',()=>field?.setPointer(0,0));
  fieldElement.addEventListener('pointerup',e=>{if(pointerDown&&Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)<14)releasePulse();pointerDown=null;});
  fieldElement.addEventListener('pointercancel',()=>{pointerDown=null;});
  fieldElement.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();releasePulse();}});
  let pulseTimer;
  function releasePulse(){field?.pulse();$('#pulse-status').textContent=light?'轻动态模式已开启':'脉冲已释放。';clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>{$('#pulse-status').textContent='触碰，打破平静。';},1500);}
  $$('[data-mode]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.mode;field?.setMode(mode);$('#field-name').textContent=modes[mode];$$('[data-mode]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}));
  $$('[data-scene]').forEach(button=>button.addEventListener('click',()=>{selectedScene=button.dataset.scene;window.AuraAudio?.setScene(selectedScene);}));
  $$('[data-play]').forEach(button=>button.addEventListener('click',async()=>{if(audioPending||!window.AuraAudio)return;if(AuraAudio.isPlaying())AuraAudio.stop();else{audioPending=true;$$('[data-play]').forEach(b=>b.disabled=true);try{await AuraAudio.play(selectedScene);}finally{audioPending=false;$$('[data-play]').forEach(b=>b.disabled=false);}}}));
  $('#volume').addEventListener('input',e=>{const v=Number(e.target.value);$('#volume-value').textContent=String(v);window.AuraAudio?.setVolume(v/100);});
  window.AuraAudio?.subscribe(value=>{
    document.body.classList.toggle('is-playing',value.playing);selectedScene=value.scene;
    $$('[data-play]').forEach(button=>{button.setAttribute('aria-pressed',String(value.playing));button.setAttribute('aria-label',value.playing?'暂停声音':'开启声音');});
    $('.sound-label').textContent=value.playing?'SOUND ON':'SOUND OFF';$('.play-label').textContent=value.playing?'暂停声音':'开启声音';$('.play-glyph').textContent=value.playing?'Ⅱ':'▶';
    $$('[data-scene]').forEach(button=>{const active=button.dataset.scene===value.scene;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $('#audio-status').textContent=value.error|| (value.playing?'正在播放：'+sceneNames[value.scene]+' · 原创合成声景':'原创合成声景 · 建议佩戴耳机');
  });
  let energyFrame=0,labVisible=false,readoutLast=0;
  function energyTick(now){energyFrame=0;if(document.hidden||!labVisible)return;const measured=window.AuraAudio?.getEnergy()||0;state.energy+=(Math.min(1,measured*18)-state.energy)*.1;field?.setEnergy(state.energy);flux?.setEnergy(state.energy);if(now-readoutLast>120){$('#energy-value').textContent=String(Math.round(state.energy*100)).padStart(3,'0');readoutLast=now;}if(!light||window.AuraAudio?.isPlaying())energyFrame=requestAnimationFrame(energyTick);}
  function energyLoop(){cancelAnimationFrame(energyFrame);energyFrame=0;if(labVisible&&!document.hidden)energyFrame=requestAnimationFrame(energyTick);}
  const labObserver=new IntersectionObserver(entries=>{labVisible=entries[0].isIntersecting;energyLoop();},{rootMargin:'100px'});labObserver.observe(fieldElement);
  window.AuraAudio?.subscribe(energyLoop);

  const tintedCache=new Map();
  function tintedSource(name){
    if(name==='moss')return Promise.resolve('assets/speaker.png');if(tintedCache.has(name))return tintedCache.get(name);
    const promise=(async()=>{const image=new Image();image.src='assets/speaker.png';await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),p=pixels.data;for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const l=p[i]*.299+p[i+1]*.587+p[i+2]*.114;if(name==='sand'){p[i]=Math.min(255,l*1.4);p[i+1]=Math.min(255,l*1.27);p[i+2]=Math.min(255,l*1.06);}else p[i]=p[i+1]=p[i+2]=l*.65;}c.putImageData(pixels,0,0);return canvas.toDataURL('image/png');})();tintedCache.set(name,promise);return promise;
  }
  function setColor(name,animate=true){
    if(!colors[name])name='moss';selectedColor=name;const color=colors[name],product=$('#edition-product');
    $$('.color-tabs button').forEach(b=>{const active=b.dataset.color===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    const show=(source,fallback=false)=>{if(selectedColor!==name)return;const update=()=>{product.src=source;product.style.filter=(fallback?color.filter:'none')+' drop-shadow(0 38px 20px #2733213a)';product.alt=color.cn+'色 AURA 音箱';$('#edition-word').textContent=color.en;document.documentElement.style.setProperty('--edition-bg',color.bg);document.documentElement.style.setProperty('--edition-ink',color.ink);};if(hasGSAP&&animate&&!light){gsap.killTweensOf(product,'scale,opacity');gsap.to(product,{scale:.91,opacity:.1,duration:.25,ease:'power2.in',onComplete:()=>{if(selectedColor!==name)return;update();gsap.to(product,{scale:1,opacity:1,duration:.7,ease:'back.out(1.5)'});}});}else update();};
    tintedSource(name).then(source=>show(source)).catch(()=>show('assets/speaker.png',true));
    try{localStorage.setItem('aura-frequency-color',name);}catch(e){}
  }
  $$('.color-tabs button').forEach(b=>b.addEventListener('click',()=>setColor(b.dataset.color)));setColor(selectedColor,false);
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  $('#download').addEventListener('click',async()=>{
    const button=$('#download'),status=$('#download-status');button.disabled=true;status.textContent='正在制作你的视觉卡片…';
    try{
      const color=colors[selectedColor];await document.fonts.ready;const image=new Image();image.src='assets/speaker.png';await image.decode();
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;const c=canvas.getContext('2d');c.fillStyle='#10110e';c.fillRect(0,0,1200,1600);
      c.strokeStyle=color.bg+'30';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.ellipse(660,835,380+i*45,140+i*20,-.4,0,Math.PI*2);c.stroke();}
      c.fillStyle=color.bg;c.font='800 68px Manrope,sans-serif';c.fillText('AURA ✳',85,140);c.font='500 17px Manrope,sans-serif';c.fillText('FREQUENCY / COLOR STUDY — '+color.en,85,200);
      c.font='800 180px Manrope,sans-serif';c.fillText('SOUND',75,438);c.strokeStyle=color.bg;c.lineWidth=1.5;c.strokeText('BEYOND.',75,610);
      const cutout=document.createElement('canvas');cutout.width=image.naturalWidth;cutout.height=image.naturalHeight;const d=cutout.getContext('2d',{willReadFrequently:true});d.drawImage(image,0,0);
      if(selectedColor!=='moss'){const pixels=d.getImageData(0,0,cutout.width,cutout.height),p=pixels.data;for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const luminance=p[i]*.299+p[i+1]*.587+p[i+2]*.114;if(selectedColor==='sand'){p[i]=Math.min(255,luminance*1.40);p[i+1]=Math.min(255,luminance*1.27);p[i+2]=Math.min(255,luminance*1.06);}else p[i]=p[i+1]=p[i+2]=luminance*.65;}d.putImageData(pixels,0,0);}
      c.save();c.translate(580,840);c.rotate(-.2);c.drawImage(cutout,-530,-246,1060,492);c.restore();
      c.fillStyle=color.bg;c.font='500 32px Manrope,sans-serif';c.fillText('把声音，推向下一维。',85,1215);c.font='500 19px Manrope,sans-serif';c.fillText('AURA / 01  ·  '+color.cn,85,1270);
      c.strokeStyle=color.bg+'55';c.beginPath();c.moveTo(85,1410);c.lineTo(1115,1410);c.stroke();c.font='500 14px Manrope,sans-serif';c.fillText('STAY UNBOUND.',85,1460);c.textAlign='right';c.fillText('© 2026 AURA CONCEPT',1115,1460);c.textAlign='left';c.fillStyle=color.bg+'88';c.font='500 12px Manrope,sans-serif';c.fillText('独立产品设计概念 / 原创视觉',85,1510);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('导出失败')),'image/png'));const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='AURA-FREQUENCY-'+color.en+'.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='卡片已生成 · 若手机未自动下载，可在外部浏览器中保存';
    }catch(error){status.textContent='卡片暂时无法生成，请稍后重试。';}finally{button.disabled=false;}
  });

  const cursor=$('.cursor');
  if(hasGSAP&&finePointer.matches){const moveX=gsap.quickTo(cursor,'x',{duration:.18,ease:'power2.out'}),moveY=gsap.quickTo(cursor,'y',{duration:.18,ease:'power2.out'});document.addEventListener('pointermove',e=>{if(light)return;cursor.style.opacity='1';moveX(e.clientX);moveY(e.clientY);});document.addEventListener('pointerleave',()=>cursor.style.opacity='0');
    $$('.magnetic').forEach(el=>{let rect;const x=gsap.quickTo(el,'x',{duration:.4,ease:'power3.out'}),y=gsap.quickTo(el,'y',{duration:.4,ease:'power3.out'});el.addEventListener('pointerenter',()=>{rect=el.getBoundingClientRect();if(!light)cursor.classList.add('is-large');});el.addEventListener('pointermove',e=>{if(light||!rect)return;x((e.clientX-rect.left-rect.width/2)*.13);y((e.clientY-rect.top-rect.height/2)*.15);});el.addEventListener('pointerleave',()=>{cursor.classList.remove('is-large');if(light)gsap.set(el,{x:0,y:0});else{x(0);y(0);}});});
  }
  document.addEventListener('visibilitychange',()=>{energyLoop();if(hasGSAP){if(document.hidden)gsap.globalTimeline.pause();else gsap.globalTimeline.resume();}});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(energyFrame);});
  window.addEventListener('pageshow',event=>{if(event.persisted){field?.loop();flux?.updateLoop();energyLoop();if(hasGSAP){gsap.globalTimeline.resume();ScrollTrigger.refresh();}}});
  window.addEventListener('resize',()=>{heroRect=hero.getBoundingClientRect();fieldRect=fieldElement.getBoundingClientRect();});
  document.fonts.ready.then(()=>{if(hasGSAP)ScrollTrigger.refresh();});
  $$('a[href^="#"]').filter(a=>!a.classList.contains('skip-link')).forEach(a=>a.addEventListener('click',event=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;event.preventDefault();history.pushState(null,'',a.getAttribute('href'));const top=target.getBoundingClientRect().top+scrollY-(target.id==='top'||target.id==='object'?0:25);window.scrollTo({top:Math.max(0,top),behavior:light?'instant':'smooth'});}));
  window.AuraExperience={field,flux,getState:()=>({light,scene:selectedScene,color:selectedColor,energy:state.energy})};
}());
