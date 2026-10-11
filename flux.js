/* Original GPU light-field for AURA. No remote runtime dependencies. */
(function () {
  'use strict';
  class AuraFlux {
    constructor(canvas, options = {}) {
      this.canvas = canvas; this.reduced = !!options.reducedMotion; this.visible = true; this.dead = false;
      this.pointer = [0, 0]; this.target = [0, 0]; this.energy = 0; this.frame = 0; this.time = 0; this.last = 0;
      this.gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
      if (!this.gl) { canvas.style.background = 'radial-gradient(ellipse at 60% 50%,#58652f55,transparent 65%)'; return; }
      const gl = this.gl;
      const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      const fs = `precision mediump float;
        uniform vec2 res; uniform float time; uniform vec2 pointer; uniform float energy;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
        void main(){
          vec2 uv=(gl_FragCoord.xy-.5*res)/res.y;
          vec2 q=uv-vec2(.12,-.02)-pointer*.055;
          float t=time*.13;
          vec3 col=vec3(.037,.043,.03);
          float haze=exp(-dot(q,q)*2.8);
          col+=vec3(.055,.075,.019)*haze;
          for(int i=0;i<8;i++){
            float fi=float(i); vec2 s=q*rot(-.29+fi*.018);
            s.y*=2.0+fi*.06;
            float a=atan(s.y,s.x); float r=length(s);
            float curve=.49+fi*.047+.023*sin(a*3.+t+fi*.28)+.012*sin(a*7.-t*1.7);
            float d=abs(r-curve);
            float thin=.0024/(d+.004);
            float glow=.0018/(d*d+.003);
            float arc=smoothstep(-.9,.9,sin(a+t*.4+fi*.43));
            vec3 shade=mix(vec3(.39,.48,.16),vec3(.82,.94,.40),arc);
            col+=shade*(thin*.13+glow*.017)*(.35+arc*.8)*(1.+energy*.5);
          }
          vec2 stars=floor(uv*155.); float noise=hash(stars);
          float star=step(.998,noise)*pow(max(0.,1.-length(fract(uv*155.)-.5)*2.),3.);
          col+=vec3(.54,.63,.29)*star*(.45+.35*sin(time*.7+noise*28.));
          float grain=(hash(gl_FragCoord.xy)-.5)*.018;
          float vignette=1.-smoothstep(.25,1.2,length(uv));
          col=col*(.45+.55*vignette)+grain;
          gl_FragColor=vec4(col,1.);
        }`;
      const shader = (type, source) => { const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s; };
      const vertex=shader(gl.VERTEX_SHADER,vs), fragment=shader(gl.FRAGMENT_SHADER,fs);
      if(!vertex || !fragment) {this.gl=null;return;}
      this.program=gl.createProgram();gl.attachShader(this.program,vertex);gl.attachShader(this.program,fragment);gl.linkProgram(this.program);gl.deleteShader(vertex);gl.deleteShader(fragment);
      if(!gl.getProgramParameter(this.program,gl.LINK_STATUS)){gl.deleteProgram(this.program);this.gl=null;return;}
      gl.useProgram(this.program);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const p=gl.getAttribLocation(this.program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
      this.uniforms={};['res','time','pointer','energy'].forEach(n=>this.uniforms[n]=gl.getUniformLocation(this.program,n));
      this.tick=this.tick.bind(this);this.resize=this.resize.bind(this);
      this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(canvas.parentElement);
      this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.updateLoop();},{rootMargin:'100px'});this.observer.observe(canvas);
      this.visibility=()=>this.updateLoop();document.addEventListener('visibilitychange',this.visibility);
      this.lost=e=>{e.preventDefault();this.lostContext=true;cancelAnimationFrame(this.frame);this.frame=0;};this.restored=()=>{this.lostContext=false;this.updateLoop();};
      canvas.addEventListener('webglcontextlost',this.lost);canvas.addEventListener('webglcontextrestored',this.restored);
      this.resize();this.updateLoop();
    }
    resize(){if(!this.gl)return;const r=this.canvas.parentElement.getBoundingClientRect();const d=Math.min(devicePixelRatio||1,1.4,1600/Math.max(r.width,1));this.canvas.width=Math.max(1,Math.round(r.width*d));this.canvas.height=Math.max(1,Math.round(r.height*d));this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.draw();}
    setPointer(x,y){this.target=[x,y];}
    setEnergy(value){this.energy=value;}
    setReducedMotion(value){this.reduced=value;this.updateLoop();this.draw();}
    updateLoop(){if(!this.gl||this.dead)return;cancelAnimationFrame(this.frame);this.frame=0;this.last=0;if(this.visible&&!document.hidden&&!this.reduced&&!this.lostContext)this.frame=requestAnimationFrame(this.tick);}
    tick(now){this.frame=0;if(this.dead||document.hidden||!this.visible||this.reduced||this.lostContext)return;this.time+=this.last?Math.min((now-this.last)/1000,.05):.016;this.last=now;this.pointer[0]+=(this.target[0]-this.pointer[0])*.035;this.pointer[1]+=(this.target[1]-this.pointer[1])*.035;this.draw();this.frame=requestAnimationFrame(this.tick);}
    draw(){if(!this.gl||this.lostContext)return;const gl=this.gl;gl.useProgram(this.program);gl.uniform2f(this.uniforms.res,this.canvas.width,this.canvas.height);gl.uniform1f(this.uniforms.time,this.time);gl.uniform2f(this.uniforms.pointer,...this.pointer);gl.uniform1f(this.uniforms.energy,this.energy);gl.drawArrays(gl.TRIANGLES,0,6);}
    destroy(){this.dead=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();this.observer?.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.canvas.removeEventListener('webglcontextlost',this.lost);this.canvas.removeEventListener('webglcontextrestored',this.restored);if(this.gl){this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);}}
  }
  window.AuraFlux=AuraFlux;
}());
