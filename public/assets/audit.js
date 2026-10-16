/* ===== Free SEO Mini-Audit ===== */
var CFG={ENDPOINT:"https://srjndvnlmurrcmwcxavj.supabase.co/functions/v1/seo-audit",CONTACT:"#contact"};
var LIVE=CFG.ENDPOINT.indexOf("YOUR-PROJECT")<0,STEPS=["Fetching page…","Checking on-page SEO…","Scoring…"];
var MEAN={
title:"The title tag is the headline search engines show for your page. Too short wastes space; too long gets cut off.",
description:"The meta description is the snippet under your title in results. A good one lifts the number of people who click.",
h1:"The H1 tells visitors and search engines what the page is about. One clear H1 per page keeps the topic unambiguous.",
headings:"H2–H6 headings outline your page. Skipped levels and missing H2s make the structure harder to read and to crawl.",
images:"Alt text describes images to search engines and screen readers, and helps your images show up in image search.",
canonical:"A canonical tag names the preferred URL for a page, preventing duplicate-content confusion from URL variants.",
robots:"A noindex directive tells search engines to leave the page out of results. If it is there by accident, the page can't rank.",
og:"Open Graph tags control the title, description and image shown when your page is shared on social and chat apps.",
viewport:"The viewport tag makes the page render properly on phones. Without it, mobile visitors see a shrunken desktop page.",
https:"HTTPS encrypts the connection. Browsers warn about plain HTTP and search engines prefer secure pages.",
schema:"Structured data (JSON-LD) describes your content in a form search engines read directly, and can unlock rich results.",
links:"Internal links spread authority and help crawlers discover pages. External links to good sources add context.",
words:"Pages with very little text give search engines little to understand and rank. Key pages usually need substance.",
files:"robots.txt guides crawlers and sitemap.xml lists the pages you want found. Both help search engines crawl efficiently.",
time:"Slow responses frustrate visitors and slow how much of your site search engines crawl."};
var ERR={invalid_url:"That doesn't look like a valid web address. Try something like yourstore.com or https://yourstore.com.",blocked:"That address can't be audited. Please use the public address of a live website.",unreachable:"We couldn't reach that site. Check the address and that it's publicly online, then try again.",timeout:"The site took longer than 10 seconds to respond, so we stopped. Try again, or check that it loads normally.",rate_limited:"You've used your 5 free audits for this hour. Please try again a little later, or book a free review below.",bad_status:"The site answered with an error instead of a page. Check the address and try again.",not_html:"That address doesn't return a web page we can read. Try your homepage or another page URL.",unreadable:"We couldn't read that page's HTML. Try another page on the site.",network:"We couldn't connect to the audit service. Check your connection and try again.",server:"Something went wrong on our side. Please try again in a moment."};
function normUrl(raw){var s=(raw||"").trim();if(!s)return null;if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(s))s="https://"+s;var u;try{u=new URL(s)}catch(e){return null}if(u.protocol!=="http:"&&u.protocol!=="https:")return null;if(u.hostname.indexOf(".")<1)return null;return u.href}
function sample(u){var R=[["title","Title tag","pass","Title is 54 characters.","",10],["description","Meta description","warning","Meta description is 172 characters and may be cut off.","Trim it to 70–160 characters and lead with the benefit.",8],["h1","H1 heading","pass","Exactly one H1 found.","",8],["headings","Heading structure","warning","Heading levels skip from H2 to H4.","Add an H3 before the H4 so the outline flows in order.",5],["images","Image alt text","fail","38% of images (12 of 31) have no alt text.","Add short, descriptive alt text to every meaningful image.",6],["canonical","Canonical tag","pass","Canonical tag is present.","",5],["robots","Meta robots","pass","No noindex directive found.","",10],["og","Open Graph tags","warning","og:image is missing.","Add an og:image (1200×630) so shared links show a preview.",5],["viewport","Viewport tag","pass","Viewport meta tag is present.","",7],["https","HTTPS","pass","The page is served over HTTPS.","",8],["schema","Structured data","warning","No JSON-LD structured data found.","Add Product or Organization schema so search engines can read your pages directly.",5],["links","Internal vs external links","pass","42 internal and 9 external links.","",3],["words","Word count","warning","Only 214 words of text on this page.","Aim for 300+ words of useful copy on key pages.",5],["files","robots.txt & sitemap.xml","warning","robots.txt found, sitemap.xml missing.","Publish /sitemap.xml and reference it in robots.txt.",7],["time","Response time","pass","The page responded in 840 ms.","",6]];var t=0,g=0;var c=R.map(function(a){t+=a[5];g+=a[5]*(a[2]==="pass"?1:a[2]==="warning"?.5:0);return{id:a[0],name:a[1],status:a[2],detail:a[3],fix:a[4],w:a[5]}});return{sample:true,url:u,score:Math.round(g/t*100),ms:840,checks:c}}
function sleep(n){return new Promise(function(r){setTimeout(r,n)})}
function countUp(el,ring,to,circ){function set(v){el.textContent=Math.round(v);ring.style.strokeDashoffset=circ*(1-v/100)}if(matchMedia("(prefers-reduced-motion: reduce)").matches){set(to);return}var t0=null;function f(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/1400);set(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
ERR.invalid_email="Please enter a valid email address.";ERR.invalid_name="Please enter your name.";ERR.report_not_found="That report has expired. Please run the audit again.";
async function postLead(name,email,d,hp){
  if(LIVE){var r=await fetch(CFG.ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"lead",id:d.id,name:name,email:email,hp:hp||""})}),j=await r.json().catch(function(){return{}});if(!r.ok||!j.report)throw{code:j.error||"server"};return j.report}
  try{var db=window.claude&&await claude.use("db"),us=window.claude&&await claude.use("user");if(db&&us)await db.collection("leads").doc(await us.id()).set({name:name,email:email,url:d.url,score:d.score,sample:true,createdAt:new Date().toISOString()})}catch(e){}
  return d}
function mountAudit(el,dark){
  var id=++AID;
  el.innerHTML='<div class="at'+(dark?' dk':'')+'"><form class="af" novalidate><label class="vh" for="au'+id+'">Website URL</label><input id="au'+id+'" type="text" inputmode="url" autocomplete="url" placeholder="yourstore.com" aria-describedby="ae'+id+'"><button type="submit">Run audit</button></form><p class="aerr" id="ae'+id+'" role="alert" hidden></p><ul class="aprog" aria-live="polite" hidden></ul><div class="ares" aria-live="polite" tabindex="-1"></div><p class="adis">This is a quick automated snapshot, not a full SEO audit.</p></div>';
  var f=el.querySelector("form"),inp=f.querySelector("input"),btn=f.querySelector("button"),er=el.querySelector(".aerr"),pg=el.querySelector(".aprog"),rs=el.querySelector(".ares");
  function fail(m){er.textContent=m;er.hidden=false;pg.hidden=true}
  function prog(i){pg.innerHTML=STEPS.map(function(s,k){return'<li class="'+(k<i?"done":k===i?"on":"")+'">'+s+'</li>'}).join("")}
  f.addEventListener("submit",async function(e){
    e.preventDefault();er.hidden=true;rs.innerHTML="";
    var u=normUrl(inp.value);if(!u){fail(ERR.invalid_url);inp.focus();return}
    inp.value=u.replace(/^https?:\/\//,"").replace(/\/$/,"");track("audit_started");btn.disabled=true;btn.textContent="Auditing…";rs.setAttribute("aria-busy","true");
    var i=0;pg.hidden=false;prog(0);var tm=setInterval(function(){if(i<STEPS.length-1)prog(++i)},1500),d=null;
    try{
      if(!LIVE){await sleep(3200);d=sample(u)}
      else{
        var ctl=new AbortController(),to=setTimeout(function(){ctl.abort()},30000),r;
        try{r=await fetch(CFG.ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:u}),signal:ctl.signal})}catch(x){throw{code:"network"}}finally{clearTimeout(to)}
        d=await r.json().catch(function(){return{error:"server"}});if(!r.ok||d.error)throw{code:d.error||"server"}
      }
      clearInterval(tm);pg.hidden=true
    }catch(x){clearInterval(tm);fail(ERR[x&&x.code]||ERR.server);d=null}
    btn.disabled=false;btn.textContent="Run audit";rs.removeAttribute("aria-busy");
    if(d)gate(rs,d)
  })
}
function gate(rs,d){
  rs.innerHTML='<div class="gn"><p><b>Your report is ready.</b> Enter your name and email to view it.</p><button type="button" class="ab">View my report</button></div>';
  var b=rs.querySelector("button");b.onclick=function(){ask(rs,d,b)};ask(rs,d,b)}
function ask(rs,d,ret){
  var o=document.createElement("div");o.className="gm";
  o.innerHTML='<div class="at gc" role="dialog" aria-modal="true" aria-labelledby="gt"><h3 id="gt" class="sg">Your SEO report is ready</h3><p>Enter your name and email to view your score and fixes. Your details go to Faizan so he can follow up on your audit.</p><form novalidate><label for="gn">Name</label><input id="gn" type="text" autocomplete="name" maxlength="100"><label for="ge">Email</label><input id="ge" type="email" autocomplete="email" maxlength="254"><p class="aerr" role="alert" hidden></p><div class="vh" aria-hidden="true"><label for="gh">Leave this field empty</label><input id="gh" type="text" tabindex="-1" autocomplete="off"></div><button type="submit" class="ab">View my report</button><button type="button" class="ab ghost gx">Not now</button></form></div>';
  var f=o.querySelector("form"),er=o.querySelector(".aerr"),sb=f.querySelector("[type=submit]");
  function close(){o.remove();document.removeEventListener("keydown",key)}
  function key(e){if(e.key==="Escape"){close();ret&&ret.focus();return}if(e.key!=="Tab")return;var q=o.querySelectorAll("input,button"),a=q[0],z=q[q.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  o.addEventListener("click",function(e){if(e.target===o){close();ret&&ret.focus()}});
  f.querySelector(".gx").onclick=function(){close();ret&&ret.focus()};
  f.addEventListener("submit",async function(e){e.preventDefault();er.hidden=true;
    var nm=f.querySelector("#gn").value.trim(),em=f.querySelector("#ge").value.trim();
    if(nm.length<2){er.textContent=ERR.invalid_name;er.hidden=false;f.querySelector("#gn").focus();return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){er.textContent=ERR.invalid_email;er.hidden=false;f.querySelector("#ge").focus();return}
    sb.disabled=true;sb.textContent="Unlocking…";
    try{var rep=await postLead(nm,em,d,f.querySelector("#gh").value);track("generate_lead",{method:"seo_audit",score:rep.score});close();render(rs,rep);rs.focus()}
    catch(x){er.textContent=ERR[x&&x.code]||"We couldn't unlock your report just now. Please try again.";er.hidden=false;sb.disabled=false;sb.textContent="View my report"}
  });
  document.addEventListener("keydown",key);document.body.appendChild(o);f.querySelector("#gn").focus()}
function render(box,d){
  var col=d.score>=80?"#3f9d5a":d.score>=50?"#d99a1e":"#d0503f",lab=d.score>=80?"Strong foundation":d.score>=50?"Room to grow":"Needs attention";
  var ord={fail:0,warning:1,pass:2},BL={pass:"Pass",warning:"Warning",fail:"Fail"},C=2*Math.PI*84;
  var pri=d.checks.filter(function(c){return c.status!=="pass"}).sort(function(a,b){return ord[a.status]-ord[b.status]||b.w-a.w}).slice(0,3);
  var h=(d.sample?'<p class="asm">Sample report: the live audit backend isn\'t connected in this preview, so these results are example data, not your site.</p>':'')+
  '<div class="sc"><div class="ring" role="img" aria-label="Overall score '+d.score+' out of 100"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84" fill="none" stroke="var(--tl)" stroke-width="12"/><circle class="rg" cx="100" cy="100" r="84" fill="none" stroke="'+col+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/></svg><div class="n" aria-hidden="true"><span class="cn">0</span><small>out of 100</small></div></div><div><h3 class="sg">'+lab+'</h3><p>'+esc(d.url)+(d.ms?' · fetched in '+d.ms+' ms':'')+'</p></div></div>';
  if(pri.length)h+='<div class="pri"><h3 class="sg">Top '+pri.length+' priority fixes</h3><ol>'+pri.map(function(c){return'<li><b>'+esc(c.name)+'</b><span>'+esc(c.fix)+'</span></li>'}).join("")+'</ol></div>';
  [["fail","Failed"],["warning","Needs attention"],["pass","Passed"]].forEach(function(g){
    var L=d.checks.filter(function(c){return c.status===g[0]});if(!L.length)return;
    h+='<section class="grp" aria-label="'+g[1]+'"><h3>'+g[1]+' ('+L.length+')</h3>'+L.map(function(c){return'<details class="ck s-'+c.status+'"><summary><span class="bd">'+BL[c.status]+'</span><span class="nt"><b>'+esc(c.name)+'</b><small>'+esc(c.detail)+'</small></span></summary><div class="bx"><p><b>What it means</b>'+esc(MEAN[c.id]||"")+'</p><p><b>How to fix it</b>'+(c.fix?esc(c.fix):"Nothing to fix. This check passed.")+'</p></div></details>'}).join("")+'</section>'});
  h+='<div class="cta"><h3 class="sg">Want a custom action plan?</h3><p>Book a free 30-min call and we\'ll go through these results together.</p><a class="ab" href="'+esc(BOOKING_URL)+'" target="_blank" rel="noopener">Book a free 30-min review</a></div>';
  box.innerHTML=h;countUp(box.querySelector(".cn"),box.querySelector(".rg"),d.score,C)}
if(document.getElementById("mount-home"))mountAudit(document.getElementById("mount-home"),true);
if(document.getElementById("mount-audit"))mountAudit(document.getElementById("mount-audit"),false);
