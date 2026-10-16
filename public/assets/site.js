/* Shared on every page */
var AID=0;
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var BOOKING_URL="https://calendly.com/faizanahmed07/30min"; /* the one place to change your booking link */
function track(n,p){try{window.dataLayer=window.dataLayer||[];window.dataLayer.push(Object.assign({event:n},p||{}));if(typeof window.gtag==="function")window.gtag("event",n,p||{})}catch(e){}}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href*='calendly.com']");if(a)track("book_call_click",{page:location.pathname})});
/* --- results count-up (once) --- */
(function(){
  var els=[].slice.call(document.querySelectorAll(".rsn [data-to]"));
  function fmt(el,v){var d=+(el.dataset.dec||0),t=v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});if(!el.dataset.comma&&+el.dataset.to<1000)t=v.toFixed(d);el.textContent=t+(el.dataset.suf||"")}
  function run(el){var to=+el.dataset.to,t0=null;function f(ts){if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/1500);fmt(el,to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
  if(RM||!("IntersectionObserver" in window))return;
  els.forEach(function(el){fmt(el,0)});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);run(e.target.querySelector("[data-to]"))}})},{threshold:.4});
  els.forEach(function(el){io.observe(el.parentNode)});
})();
/* --- sticky booking button --- */
var bk=document.getElementById("book"),bq=0;bk.href=BOOKING_URL;
function bookCheck(){var v=document.querySelector(".view.on"),h=v&&(v.querySelector(".hero")||v.querySelector(".hm h1")),past=h&&h.getBoundingClientRect().bottom<0,c=document.getElementById("contact"),inC=false;
  if(c){var r=c.getBoundingClientRect();inC=r.top<innerHeight&&r.bottom>0}
  var on=!!past&&!inC;bk.classList.toggle("show",on);bk.tabIndex=on?0:-1;bk.setAttribute("aria-hidden",on?"false":"true")}
addEventListener("scroll",function(){if(!bq){bq=1;requestAnimationFrame(function(){bq=0;bookCheck()})}},{passive:true});addEventListener("resize",bookCheck);bookCheck();

/* ===== theme toggle, reveal, lightbox ===== */
(function(){
  var ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><g class="su"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g><path class="mo" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  function cur(){return document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}
  function paint(){var t=cur();[].forEach.call(document.querySelectorAll(".tg"),function(b){b.setAttribute("aria-pressed",t==="dark");b.setAttribute("aria-label",t==="dark"?"Switch to light theme":"Switch to dark theme");b.title=t==="dark"?"Light theme":"Dark theme"})}
  function mk(){var b=document.createElement("button");b.type="button";b.className="tg";b.innerHTML=ICON;b.addEventListener("click",function(){var t=cur()==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t);try{localStorage.setItem("theme",t)}catch(e){}paint()});return b}
  [].forEach.call(document.querySelectorAll(".nav .r"),function(r){r.innerHTML='<span class="rt">'+r.textContent+'</span>';r.appendChild(mk())});
  var hs=document.querySelector(".home .top > span");if(hs)hs.appendChild(mk());paint();
  /* scroll reveal */
  if(!RM&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
    [].forEach.call(document.querySelectorAll(".sec .w > *, .stats, .next"),function(el){el.classList.add("rv");io.observe(el)})}
  /* lightbox */
  var last=null;
  function open(box){var img=box.querySelector("img"),o=document.createElement("div");o.className="lb";o.tabIndex=-1;o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label",img.alt+" (press Escape to close)");o.innerHTML='<img src="'+img.src+'" alt="'+img.alt.replace(/"/g,"&quot;")+'">';
    function close(){o.remove();document.removeEventListener("keydown",key);if(last)last.focus()}
    function key(e){if(e.key==="Escape")close()}
    o.addEventListener("click",close);document.addEventListener("keydown",key);document.body.appendChild(o);last=box;o.focus()}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".box.im");if(b)open(b)});
  document.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&document.activeElement&&document.activeElement.classList.contains("im")){e.preventDefault();open(document.activeElement)}});
})();
