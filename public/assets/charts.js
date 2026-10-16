/* Growth charts (case-study pages only). Data lives in case-data.js */
var MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function mlab(m,full){var p=m.split("-");return MN[+p[1]-1]+(full?" "+p[0]:" \u2019"+p[0].slice(2))}
function fmtAx(v){return v>=1000?+(v/1000).toFixed(2)+"K":""+v}
function fmtN(v){return Math.round(v).toLocaleString("en-US")}
/* --- monotone smooth path --- */
function mono(P){var n=P.length,d=[],m=[],i;for(i=0;i<n-1;i++)d[i]=(P[i+1][1]-P[i][1])/(P[i+1][0]-P[i][0]);m[0]=d[0];m[n-1]=d[n-2];for(i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  for(i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0}else{var a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){var t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i]}}}
  var p="M"+P[0][0]+","+P[0][1];for(i=0;i<n-1;i++){var dx=(P[i+1][0]-P[i][0])/3;p+="C"+(P[i][0]+dx)+","+(P[i][1]+m[i]*dx)+","+(P[i+1][0]-dx)+","+(P[i+1][1]-m[i+1]*dx)+","+P[i+1][0]+","+P[i+1][1]}return p}
function mkChart(host,cfg,aria){
  var cur=0,started=false,raf=0,lastW=0,uid="c"+(++AID),multi=cfg.series.length>1;
  host.innerHTML='<div class="chw">'+(multi?'<div class="cht" role="group" aria-label="Metric">'+cfg.series.map(function(s,i){return'<button type="button" data-i="'+i+'" aria-pressed="'+(i===0)+'">'+esc(s.label)+'</button>'}).join("")+'</div>':'')+
   '<div class="ch" tabindex="0" role="group" aria-label="'+esc(aria)+'. Use left and right arrow keys to read each month."><div class="tt" hidden></div></div>'+
   '<ol class="ml" aria-label="Milestones">'+cfg.milestones.map(function(m,i){return'<li><span class="mk" aria-hidden="true">'+(i+1)+'</span>'+esc(m.label)+' <em>'+mlab(m.month,1)+'</em></li>'}).join("")+'</ol>'+
   (cfg.placeholder?'<p class="note">Illustrative monthly figures. Replace with real GSC data.</p>':'')+
   '<div class="vh" aria-live="polite"></div><div class="vh sm"></div></div>';
  var box=host.querySelector(".ch"),tt=host.querySelector(".tt"),live=host.querySelector("[aria-live]"),sm=host.querySelector(".sm");
  function vals(S){var run=0;return S.data.map(function(p){run+=p[1];return{m:p[0],v:S.cumulative?run:p[1],d:p[1]}})}
  function summary(){var S=cfg.series[cur],D=vals(S),a=D[0],z=D[D.length-1];
    sm.innerHTML='<p>'+esc(aria)+': '+esc(S.label)+(S.cumulative?' (running total)':'')+' rose from '+fmtN(a.v)+' in '+mlab(a.m,1)+' to '+fmtN(z.v)+' in '+mlab(z.m,1)+'. Milestones: '+cfg.milestones.map(function(m){return esc(m.label)+' ('+mlab(m.month,1)+')'}).join('; ')+'.</p><table><caption>'+esc(S.label)+' by month</caption><tr><th>Month</th><th>'+(S.cumulative?'Running total':'Value')+'</th></tr>'+D.map(function(q){return'<tr><td>'+mlab(q.m,1)+'</td><td>'+fmtN(q.v)+'</td></tr>'}).join("")+'</table>'}
  function draw(an){
    var W=box.clientWidth,H=box.clientHeight;if(W<40||H<40)return;lastW=W;cancelAnimationFrame(raf);
    var S=cfg.series[cur],D=vals(S),n=D.length,mob=W<520,l=mob?40:52,r=mob?14:20,t=22,b=32,pw=W-l-r,ph=H-t-b,mx=0,i;
    D.forEach(function(q){mx=Math.max(mx,q.v)});
    var raw=mx/5,p10=Math.pow(10,Math.floor(Math.log10(raw))),st=[1,2,2.5,5,10].map(function(k){return k*p10}).filter(function(x){return x>=raw})[0],top=Math.ceil(mx/st-1e-9)*st;
    function X(k){return l+pw*k/(n-1)}function Y(v){return t+ph*(1-v/top)}
    var P=D.map(function(q,k){return[X(k),Y(q.v)]}),L=mono(P),base=t+ph;
    var g='<g class="cg">',v;for(v=0;v<=top+1e-9;v+=st){g+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="ct" x="'+(l-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+fmtAx(v)+'</text>'}g+='</g><g>';
    var step=Math.ceil(n/Math.max(2,Math.floor(pw/(mob?60:80))));for(i=n-1;i>=0;i-=step)g+='<text class="ct" x="'+X(i)+'" y="'+(H-10)+'" text-anchor="middle">'+mlab(D[i].m)+'</text>';g+='</g>';
    var mk='';cfg.milestones.forEach(function(m,k){var j=D.findIndex(function(q){return q.m===m.month});if(j<0)return;mk+='<g class="cmk"><line class="cdl" x1="'+P[j][0]+'" x2="'+P[j][0]+'" y1="'+P[j][1]+'" y2="'+base+'"/><circle cx="'+P[j][0]+'" cy="'+P[j][1]+'" r="10"/><text x="'+P[j][0]+'" y="'+P[j][1]+'">'+(k+1)+'</text></g>'});
    box.querySelector("svg")&&box.removeChild(box.querySelector("svg"));
    var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("width",W);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
    svg.innerHTML='<defs><linearGradient id="g'+uid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--gl);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--gl);stop-opacity:0"/></linearGradient><clipPath id="k'+uid+'"><rect class="kr" x="0" y="0" width="'+(an&&!RM?0:W)+'" height="'+H+'"/></clipPath></defs>'+g+
      '<g clip-path="url(#k'+uid+')"><path d="'+L+'L'+X(n-1)+','+base+'L'+X(0)+','+base+'Z" fill="url(#g'+uid+')"/><path class="cln" d="'+L+'"/>'+mk+'</g><line class="cvl" y1="'+t+'" y2="'+base+'" visibility="hidden"/><circle class="cdt" r="5" visibility="hidden"/><rect class="ov" x="'+l+'" y="0" width="'+pw+'" height="'+H+'"/>';
    box.insertBefore(svg,tt);
    var vl=svg.querySelector(".cvl"),dt=svg.querySelector(".cdt"),ov=svg.querySelector(".ov");
    function hide(){tt.hidden=true;vl.setAttribute("visibility","hidden");dt.setAttribute("visibility","hidden")}
    function show(k,say){var q=D[k],ms=cfg.milestones.filter(function(m){return m.month===q.m})[0];
      vl.setAttribute("x1",P[k][0]);vl.setAttribute("x2",P[k][0]);vl.setAttribute("visibility","visible");dt.setAttribute("cx",P[k][0]);dt.setAttribute("cy",P[k][1]);dt.setAttribute("visibility","visible");
      tt.innerHTML='<b>'+mlab(q.m,1)+'</b>'+esc(S.label)+': <b style="display:inline">'+fmtN(q.v)+'</b>'+(S.cumulative?'<em>+'+fmtN(q.d)+' this month</em>':'')+(ms?'<em>\u25C6 '+esc(ms.label)+'</em>':'');
      tt.hidden=false;var tw=tt.offsetWidth,th=tt.offsetHeight,lf=Math.min(Math.max(P[k][0]-tw/2,4),W-tw-4),tp=P[k][1]-th-16;if(tp<4)tp=P[k][1]+16;tt.style.left=lf+"px";tt.style.top=tp+"px";
      if(say)live.textContent=mlab(q.m,1)+': '+fmtN(q.v)+' '+S.label+(ms?'. Milestone: '+ms.label:'')}
    function idx(e){var rc=svg.getBoundingClientRect();return Math.max(0,Math.min(n-1,Math.round((e.clientX-rc.left-l)/pw*(n-1))))}
    ov.addEventListener("pointermove",function(e){show(idx(e))});ov.addEventListener("pointerdown",function(e){show(idx(e))});ov.addEventListener("pointerleave",hide);
    var ki=n-1;box.onkeydown=function(e){var k=e.key;if(k==="ArrowLeft")ki=Math.max(0,ki-1);else if(k==="ArrowRight")ki=Math.min(n-1,ki+1);else if(k==="Home")ki=0;else if(k==="End")ki=n-1;else if(k==="Escape"){hide();return}else return;e.preventDefault();show(ki,true)};box.onblur=hide;
    if(an&&!RM){var kr=svg.querySelector(".kr"),t0=null;(function f(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/1600);kr.setAttribute("width",W*(1-Math.pow(1-p,3)));if(p<1)raf=requestAnimationFrame(f)})(performance.now())}
  }
  summary();
  [].forEach.call(host.querySelectorAll(".cht button"),function(btn){btn.addEventListener("click",function(){cur=+btn.dataset.i;[].forEach.call(host.querySelectorAll(".cht button"),function(x){x.setAttribute("aria-pressed",x===btn)});tt.hidden=true;summary();draw(true)})});
  if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting&&box.clientWidth>40){io.disconnect();started=true;draw(true)}},{threshold:.25});io.observe(box)}else{started=true;draw(false)}
  if("ResizeObserver" in window)new ResizeObserver(function(){if(started&&Math.abs(box.clientWidth-lastW)>1)draw(false)}).observe(box);
}
if(document.getElementById("ch-aj"))mkChart(document.getElementById("ch-aj"),CASE_DATA.aj,"The American Jackets monthly organic visits");
if(document.getElementById("ch-ec"))mkChart(document.getElementById("ch-ec"),CASE_DATA.ec,"Ecashinsight Search Console performance");
