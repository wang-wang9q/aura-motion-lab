/* Original AURA 3D particle projection and continuous topology morphs. */
(function () {
  'use strict';
  const TAU=Math.PI*2, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  class AuraField {
    constructor(canvas, options={}) {
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.reduced=!!options.reducedMotion;this.dead=false;this.visible=true;this.mode='sphere';this.energy=0;this.smoothedEnergy=0;
      this.pointer={x:0,y:0};this.targetPointer={x:0,y:0};this.time=0;this.last=0;this.frame=0;this.morph=1;this.pulses=[];
      this.count=matchMedia('(max-width:700px)').matches?1000:2400;
      this.coords={sphere:[],torus:[],wave:[]};this.current=[];this.from=[];this.projected=[];
      for(let i=0;i<this.count;i++){
        const f=(i+.5)/this.count,y=1-2*f,r=Math.sqrt(1-y*y),a=i*2.3999632297;
        this.coords.sphere.push([Math.cos(a)*r,y,Math.sin(a)*r]);
        const u=f*TAU*25,v=i*2.3999632297;
        this.coords.torus.push([(0.77+0.26*Math.cos(v))*Math.cos(u),.26*Math.sin(v),(0.77+0.26*Math.cos(v))*Math.sin(u)]);
        const col=i%80,row=Math.floor(i/80),x=col/79*2.7-1.35,z=row/(Math.ceil(this.count/80)-1)*1.7-.85;
        this.coords.wave.push([x,Math.sin(x*3+z*2)*.28,z]);
        this.current.push([...this.coords.sphere[i]]);this.from.push([...this.coords.sphere[i]]);this.projected.push({x:0,y:0,z:0,r:0,i});
      }
      this.sprites=[this.sprite('#d1ef5c'),this.sprite('#f0f4d5'),this.sprite('#ff8358')];
      this.tick=this.tick.bind(this);this.resize=this.resize.bind(this);
      this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(canvas.parentElement);
      this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.loop();},{rootMargin:'80px'});this.observer.observe(canvas);
      this.visibility=()=>this.loop();document.addEventListener('visibilitychange',this.visibility);
      this.resize();this.loop();
    }
    sprite(color){const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d'),gradient=g.createRadialGradient(20,20,0,20,20,20);gradient.addColorStop(0,color);gradient.addColorStop(.16,color);gradient.addColorStop(.3,color+'88');gradient.addColorStop(1,color+'00');g.fillStyle=gradient;g.fillRect(0,0,40,40);return c;}
    resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.w=r.width;this.h=r.height;this.dpr=Math.min(devicePixelRatio||1,1.65);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);this.scale=Math.min(this.h*.35,this.w*.35);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.draw();}
    setMode(mode){if(!this.coords[mode]||this.mode===mode)return;for(let i=0;i<this.count;i++)this.from[i]=[...this.current[i]];this.mode=mode;this.morph=0;if(this.reduced){this.morph=1;for(let i=0;i<this.count;i++)this.current[i]=[...this.coords[mode][i]];this.draw();}else this.loop();}
    setEnergy(n){this.energy=clamp(Number(n)||0,0,1);}
    setPointer(x,y){this.targetPointer={x:clamp(x,-1,1),y:clamp(y,-1,1)};}
    pulse(){if(this.reduced)return;this.pulses.push({age:0,x:this.w*(.5+this.targetPointer.x*.25),y:this.h*(.5+this.targetPointer.y*.25)});if(this.pulses.length>5)this.pulses.shift();this.loop();}
    setReducedMotion(v){this.reduced=!!v;if(v){this.morph=1;this.pulses=[];for(let i=0;i<this.count;i++)this.current[i]=[...this.coords[this.mode][i]];}this.loop();this.draw();}
    loop(){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(!this.dead&&this.visible&&!document.hidden&&!this.reduced)this.frame=requestAnimationFrame(this.tick);}
    tick(now){this.frame=0;if(this.dead||!this.visible||document.hidden||this.reduced)return;const dt=this.last?Math.min((now-this.last)/1000,.05):.016;this.last=now;this.time+=dt;this.morph=Math.min(1,this.morph+dt/1.4);this.smoothedEnergy+=(this.energy-this.smoothedEnergy)*.12;this.pointer.x+=(this.targetPointer.x-this.pointer.x)*.035;this.pointer.y+=(this.targetPointer.y-this.pointer.y)*.035;for(const p of this.pulses)p.age+=dt;this.pulses=this.pulses.filter(p=>p.age<1.8);this.draw();this.frame=requestAnimationFrame(this.tick);}
    draw(){
      if(!this.ctx||!this.w)return;const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.h);
      const t=this.reduced?0:this.time,energy=this.reduced?0:this.smoothedEnergy,ry=t*.10+this.pointer.x*.5,rx=(this.mode==='torus'?-.74:this.mode==='wave'?-.52:-.19)+this.pointer.y*.32;
      const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),ease=this.morph*this.morph*(3-2*this.morph),target=this.coords[this.mode];
      let pulse=0;for(const p of this.pulses)pulse+=Math.sin(Math.min(1,p.age/1.3)*Math.PI)*.15;
      for(let i=0;i<this.count;i++){
        const c=this.current[i],f=this.from[i],d=target[i];c[0]=f[0]+(d[0]-f[0])*ease;c[1]=f[1]+(d[1]-f[1])*ease;c[2]=f[2]+(d[2]-f[2])*ease;
        const ripple=this.reduced?1:1+.025*Math.sin(i*.052+t*1.1)+energy*.14*Math.sin(i*.038+t*6)+pulse;
        let x=c[0]*ripple,y=c[1]*ripple,z=c[2]*ripple;
        if(this.mode==='wave')y+=Math.sin(x*3.5+z*3-t*1.25)*(.10+energy*.19)*ease;
        const xx=x*cy-z*sy,zz=x*sy+z*cy,yy=y*cx-zz*sx,depth=y*sx+zz*cx;
        const perspective=3.5/(3.5-depth),point=this.projected[i];point.i=i;point.x=this.w*.5+xx*this.scale*perspective;point.y=this.h*.5+yy*this.scale*perspective;point.z=depth;point.r=perspective;
      }
      this.projected.sort((a,b)=>a.z-b.z);
      ctx.globalCompositeOperation='lighter';
      for(let k=0;k<this.count;k++){
        const p=this.projected[k],i=p.i,alpha=.18+(p.z+1.6)*.19;ctx.globalAlpha=clamp(alpha,.13,.83);
        const size=(i%31===0?5.5:2.6)*p.r*(1+energy*.32),sprite=this.sprites[i%49===0?2:i%5===0?1:0];
        let x=p.x,y=p.y;
        if(!this.reduced){const dx=x-this.w*(.5+this.pointer.x*.4),dy=y-this.h*(.5+this.pointer.y*.4),dist=Math.sqrt(dx*dx+dy*dy);if(dist<95&&dist>1){const push=(95-dist)*.16;x+=dx/dist*push;y+=dy/dist*push;}}
        ctx.drawImage(sprite,x-size,y-size,size*2,size*2);
      }
      ctx.globalAlpha=.16;ctx.strokeStyle='#cbe79c';ctx.lineWidth=.5;
      for(let i=0;i<this.projected.length-8;i+=37){const a=this.projected[i],b=this.projected[i+8];if(Math.hypot(a.x-b.x,a.y-b.y)<36){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
      for(const p of this.pulses){const progress=p.age/1.8,r=progress*Math.max(this.w,this.h)*.55;ctx.globalAlpha=(1-progress)*.3;ctx.strokeStyle='#d1ef5c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.stroke();ctx.globalAlpha=(1-progress)*.08;ctx.beginPath();ctx.arc(p.x,p.y,r*.88,0,TAU);ctx.stroke();}
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    destroy(){this.dead=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);}
  }
  window.AuraField=AuraField;
}());
