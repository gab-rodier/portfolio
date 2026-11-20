try{
(function(){
try{/* maturity assessment */
  var phases=[
    {n:'Unstructured',q:'"What data?"',steps:['Audit the current setup so tracking is installed correctly on every page.','Add custom event tracking for the handful of actions that matter most.','Define a few business objectives and the basic KPIs that map to them.']},
    {n:'Descriptive',q:'"What happened?"',steps:['Build a measurement framework that maps business objectives to user actions.','Define primary and secondary KPIs and track them through your tag manager.','Stand up a simple automated dashboard for key stakeholders.']},
    {n:'Diagnostic',q:'"Why did it happen?"',steps:['Segment audiences (new vs. returning, location, source) to find performance gaps.','Line up site data with campaign timelines and offline data.','Find friction points, like high-exit steps in your conversion funnel.']},
    {n:'Prescriptive',q:'"What should we do?"',steps:['Formalize a testing program with a clear hypothesis-to-results process.','Run A/B tests on high-impact pages based on diagnostic findings.','Use segments to personalize campaigns and on-site experiences.']},
    {n:'Predictive',q:'"What might happen next?"',steps:['Use built-in predictive audiences, like likely purchasers.','Connect analytics to a data warehouse to build custom models.','Forecast demand to plan budgets and resources ahead of time.']}
  ];}catch(e){if(window.console)console.warn(e)}
try{
  var qs=[
    {c:'Data collection',t:'How would you describe your tracking?',o:['Default install, not sure it works everywhere','Key actions tracked and mostly trustworthy','Clean, monitored, combined with other sources','Integrated across tools and feeding decisions','Unified in a warehouse, ready for modeling'],v:1},
    {c:'Strategic measurement',t:'Are your KPIs defined?',o:['Not really','A few basic ones','Mapped to business objectives','Tied to decisions and owned by teams','Include forward-looking, predictive KPIs'],v:1},
    {c:'Reporting',t:'What does reporting look like?',o:['Ad hoc, if at all','A dashboard someone checks','Regular reports with segmentation','Shared dashboards drive cross-team planning','Interactive and predictive dashboards'],v:2},
    {c:'Data application',t:'What do you do with the data?',o:['Mostly nothing yet','Describe last month','Explain why things changed','Run tests and change things because of it','Act on forecasts before things happen'],v:1},
    {c:'Audience segmentation',t:'How do you segment audiences?',o:['One audience for everyone','Basic splits like device or source','Behavior-based segments, sometimes used','Personalization and retargeting in use','Predictive segments, like likely to churn'],v:0}
  ];}catch(e){if(window.console)console.warn(e)}
try{
  var wrap=document.getElementById('quiz-qs');}catch(e){if(window.console)console.warn(e)}
try{
  qs.forEach(function(q,i){
    var d=document.createElement('div'); d.className='q';
    var id='mq'+i;
    var html='<label for="'+id+'">'+q.c+': '+q.t+'</label><select id="'+id+'">';
    q.o.forEach(function(o,j){ html+='<option value="'+j+'"'+(j===q.v?' selected':'')+'>'+o+'</option>'; });
    d.innerHTML=html+'</select>'; wrap.appendChild(d);
    d.querySelector('select').addEventListener('change',function(){ document.getElementById('quiz-stale').hidden=false; });
  });}catch(e){if(window.console)console.warn(e)}
try{
  function score(){
    var vals=qs.map(function(q,i){return +document.getElementById('mq'+i).value;});
    var avg=vals.reduce(function(a,b){return a+b;},0)/vals.length;
    var lvl=Math.max(0,Math.min(4,Math.floor(avg+0.001)));
    var min=Math.min.apply(null,vals); var weak=qs[vals.indexOf(min)].c;
    var p=phases[lvl];
    document.getElementById('r-name').textContent=p.n;
    document.getElementById('r-q').textContent=p.q;
    document.querySelectorAll('#r-meter div').forEach(function(m,i){m.className=i<=lvl?'on':'';});
    document.getElementById('r-steps').innerHTML=p.steps.map(function(s){return '<li>'+s+'</li>';}).join('');
    document.getElementById('r-bott').textContent= min<lvl ? 'Your bottleneck: '+weak.toLowerCase()+'. It sits a phase or more behind the rest, and it will cap everything built on top of it.' : (lvl===4?'You are operating at the top of the model. The work now is keeping data quality as tight as the models built on it.':'Your categories are evenly matched. Advance them together rather than jumping ahead in one.');
  }
  score();}catch(e){if(window.console)console.warn(e)}
try{
  document.getElementById('quiz-go').addEventListener('click',function(){ score(); document.getElementById('r-eye').textContent='Your overall phase'; document.getElementById('quiz-stale').hidden=true; var rs=document.querySelector('#assess .result'); rs.classList.remove('pop'); void rs.offsetWidth; rs.classList.add('pop'); if(window.innerWidth<760) rs.scrollIntoView({behavior:'smooth',block:'start'}); });}catch(e){if(window.console)console.warn(e)}
try{

  /* estimator */
  var tasks=[
    ['Strategy','Discovery + kickoff',4,10,1],
    ['Strategy','Measurement strategy + stakeholder questionnaires',25,40,1],
    ['Tracking','Tracking document with data layer specs',12,20,1],
    ['Tracking','Data layer QA, staging + production (per 5 events avg)',10,15,1],
    ['Tracking','Tag implementation + QA, staging + production (per 5 events avg)',14,25,1],
    ['Tracking','Marketing pixels (per 1-2 pixels avg)',3,5,0],
    ['Data quality','Critical-issues audit',8,15,0],
    ['Data quality','Comprehensive audit',25,35,0],
    ['Data quality','Go-live monitoring + troubleshooting support',4,10,1],
    ['Data quality','Automated custom data monitoring with alerts',8,15,0],
    ['Reporting','Custom dashboard (per 2 standard pages avg)',15,25,1],
    ['Reporting','Focused actionable analysis deliverable',12,20,0],
    ['Consent','Consent platform config + aligned site tracking',25,40,0],
    ['CRO','Multivariate test: proposal, build, and results',28,45,0]
  ];}catch(e){if(window.console)console.warn(e)}
try{
  var tw=document.getElementById('est-tasks');}catch(e){if(window.console)console.warn(e)}
try{ var grp='';}catch(e){if(window.console)console.warn(e)}
try{
  tasks.forEach(function(t,i){
    if(t[0]!==grp){grp=t[0]; var g=document.createElement('p'); g.className='grp'; g.textContent=grp; tw.appendChild(g);}
    var l=document.createElement('label'); l.className='task';
    l.innerHTML='<input type="checkbox" id="et'+i+'"'+(t[4]?' checked':'')+'><span>'+t[1]+'</span><small>'+t[2]+'–'+t[3]+' h</small>';
    tw.appendChild(l); l.querySelector('input').addEventListener('change',calc);
  });}catch(e){if(window.console)console.warn(e)}
try{
  var f={cx:1.1,cd:1,ec:1,ss:1,ad:0.2};}catch(e){if(window.console)console.warn(e)}
try{
  document.querySelectorAll('.seg-ctl').forEach(function(s){
    s.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){
        s.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed','false');});
        b.setAttribute('aria-pressed','true'); f[s.dataset.f]=+b.dataset.v; calc();
      });
    });
  });}catch(e){if(window.console)console.warn(e)}
try{
  function round5(n){return Math.round(n/5)*5;}
  function calc(){
    var mn=0,mx=0,c=0;
    tasks.forEach(function(t,i){ if(document.getElementById('et'+i).checked){mn+=t[2];mx+=t[3];c++;} });
    var m=f.cx*f.cd*f.ec*f.ss*(1+f.ad);
    var lo=round5(mn*m), hi=round5(mx*m), mid=round5((mn*m+mx*m)/2);
    document.getElementById('est-range').textContent=c? lo+'–'+hi : '0';
    document.getElementById('est-note').textContent=c? c+' tasks · combined multiplier ×'+m.toFixed(2) : 'Pick at least one task to see a range.';
    document.getElementById('t-core').textContent=(c?lo:0)+'h';
    document.getElementById('t-prem').textContent=(c?mid:0)+'h';
    document.getElementById('t-adv').textContent=(c?hi:0)+'h';
  }
  calc();}catch(e){if(window.console)console.warn(e)}
try{

  /* collapsible tools */
  function setTool(t,open){
    t.classList.toggle('collapsed',!open);
    var b=t.querySelector('.tool-toggle'); if(b) b.setAttribute('aria-expanded',open?'true':'false');
  }
  document.querySelectorAll('.tool').forEach(function(t){
    var b=t.querySelector('.tool-toggle');
    if(b) b.addEventListener('click',function(){ setTool(t,t.classList.contains('collapsed')); });
  });}catch(e){if(window.console)console.warn(e)}
try{
  document.querySelectorAll('a[href="#assess"],a[href="#estimator"]').forEach(function(a){
    a.addEventListener('click',function(){ var t=document.querySelector(a.getAttribute('href')); if(t) setTool(t,true); });
  });}catch(e){if(window.console)console.warn(e)}
try{
  (function peeks(){
    var n=document.getElementById('r-name'), q=document.getElementById('r-q'), pa=document.getElementById('peek-assess');
    var e=document.getElementById('est-range'), pe=document.getElementById('peek-est');
    function upd(){ if(pa&&n&&q) pa.textContent=n.textContent+', '+q.textContent; if(pe&&e) pe.textContent=e.textContent+' hours'; }
    upd(); document.addEventListener('change',upd); document.addEventListener('click',function(){ setTimeout(upd,0); });
  })();}catch(e){if(window.console)console.warn(e)}
try{

  /* custom dropdowns: list always opens below the control */
  (function(){
    var open=null;
    function close(){ if(open){ open.list.hidden=true; open.btn.setAttribute('aria-expanded','false'); open=null; } }
    document.addEventListener('click',function(e){ if(open && !open.wrap.contains(e.target)) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape' && open){ var b=open.btn; close(); b.focus(); } });
    window.enhanceSelect=function(sel){
      if(sel.dataset.cs) return; sel.dataset.cs='1';
      var wrap=document.createElement('div'); wrap.className='csel';
      var btn=document.createElement('button'); btn.type='button'; btn.className='cs-btn'; btn.setAttribute('aria-haspopup','listbox'); btn.setAttribute('aria-expanded','false');
      var lbl=document.querySelector('label[for="'+sel.id+'"]'); if(lbl){ if(!lbl.id) lbl.id=sel.id+'-lbl'; btn.setAttribute('aria-labelledby',lbl.id+' '+sel.id+'-cv'); }
      else if(sel.closest('label')){ var t=sel.closest('label').querySelector('span'); if(t) btn.setAttribute('aria-label',t.textContent); }
      var cv=document.createElement('span'); cv.className='cs-v'; cv.id=sel.id+'-cv'; btn.appendChild(cv);
      var car=document.createElement('span'); car.className='cs-car'; car.setAttribute('aria-hidden','true'); btn.appendChild(car);
      var list=document.createElement('ul'); list.className='cs-list'; list.setAttribute('role','listbox'); list.hidden=true;
      function sync(){ cv.textContent=sel.options[sel.selectedIndex].text; list.querySelectorAll('li').forEach(function(li,i){ li.setAttribute('aria-selected',i===sel.selectedIndex?'true':'false'); }); }
      Array.prototype.forEach.call(sel.options,function(o,i){
        var li=document.createElement('li'); li.setAttribute('role','option'); li.tabIndex=-1; li.textContent=o.text;
        li.addEventListener('click',function(){ sel.selectedIndex=i; sel.dispatchEvent(new Event('change',{bubbles:true})); sync(); close(); btn.focus(); });
        li.addEventListener('keydown',function(e){
          if(e.key==='ArrowDown'){ e.preventDefault(); (li.nextElementSibling||li).focus(); }
          if(e.key==='ArrowUp'){ e.preventDefault(); (li.previousElementSibling||li).focus(); }
          if(e.key==='Enter'||e.key===' '){ e.preventDefault(); li.click(); }
          if(e.key==='Tab'){ close(); }
        });
        list.appendChild(li);
      });
      btn.addEventListener('click',function(){ var was=open&&open.btn===btn; close(); if(was) return; list.hidden=false; btn.setAttribute('aria-expanded','true'); open={wrap:wrap,btn:btn,list:list}; var cur=list.children[sel.selectedIndex]; if(cur){ cur.focus({preventScroll:true}); } });
      btn.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'&&list.hidden){ e.preventDefault(); btn.click(); } });
      sel.parentNode.insertBefore(wrap,sel); wrap.appendChild(sel); wrap.appendChild(btn); wrap.appendChild(list);
      sel.classList.add('cs-native'); sel.tabIndex=-1; sel.setAttribute('aria-hidden','true');
      sel.addEventListener('change',sync); sync();
    };
    document.querySelectorAll('select').forEach(window.enhanceSelect);
  })();}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var bx=[].slice.call(document.querySelectorAll("#est-tasks input"));}catch(e){if(window.console)console.warn(e)}
try{var s0=bx.map(function(x){return x.checked});}catch(e){if(window.console)console.warn(e)}
try{var f0=[].slice.call(document.querySelectorAll("#est-body .seg-ctl [aria-pressed=true]"));}catch(e){if(window.console)console.warn(e)}
try{document.querySelectorAll("[data-tasks]").forEach(function(b){b.addEventListener("click",function(){var all=b.dataset.tasks==="none";bx.forEach(function(x,i){x.checked=all?false:s0[i];x.dispatchEvent(new Event("change",{bubbles:true}))});if(!all)f0.forEach(function(x){x.click()})})})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{document.querySelectorAll("[data-open^=cs-]").forEach(function(a){a.addEventListener("click",function(e){var d=document.getElementById(a.dataset.open);if(d&&d.showModal){e.preventDefault();d.showModal();}})});}catch(e){if(window.console)console.warn(e)}
try{document.querySelectorAll("dialog.csd").forEach(function(d){d.addEventListener("click",function(e){if(e.target===d)d.close()});d.querySelectorAll("[data-close]").forEach(function(c){c.addEventListener("click",function(){d.close()})})});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{/* dashboard sample */
  (function(){
    if(!document.getElementById('d-kpis')) return;
    var seed=11; function rnd(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }
    var W=52, start=new Date(2025,3,6);
    var base=[]; for(var i=0;i<W;i++){ base.push(Math.round(3800+i*38+420*Math.sin(i/52*4*Math.PI+1)+(rnd()-.5)*520)); }
    var noise=[]; for(i=0;i<W;i++) noise.push(.88+rnd()*.24);
    var jit=[]; for(i=0;i<W*10;i++) jit.push(.82+rnd()*.36);
    function lbl(i){ var d=new Date(start.getTime()+i*7*864e5); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
    var fmt=function(n){ return Math.round(n).toLocaleString('en-US'); };
    var pct=function(n,d){ return (n*100).toFixed(d==null?1:d)+'%'; };
    var dur=function(s){ s=Math.round(s); return Math.floor(s/60)+'m '+('0'+s%60).slice(-2)+'s'; };
    var kfmt=function(t){ return t>=1000?(+(t/1000).toFixed(1))+'K':fmt(t); };
    var HOSTS={ all:{n:'All hostnames',sc:1,cvr:.0294,er:.638,adj:0}, www:{n:'www.larkspurlabs.com',sc:.62,cvr:.031,er:.62,adj:.02}, app:{n:'app.larkspurlabs.com',sc:.21,cvr:.041,er:.74,adj:.05}, docs:{n:'docs.larkspurlabs.com',sc:.13,cvr:.012,er:.69,adj:-.04}, comm:{n:'community.larkspurlabs.com',sc:.04,cvr:.009,er:.58,adj:-.06} };
    var DEV={ all:[.58,.38,.04], www:[.52,.44,.04], app:[.81,.16,.03], docs:[.71,.26,.03], comm:[.49,.47,.04] };
    var DEVN=['Desktop','Mobile','Tablet'], DEVCVR=[1.18,.71,.82];
    var PESO={ 'Paid':['Paid search','Paid social','Display'], 'Earned':['Organic search','Referral'], 'Shared':['Organic social'], 'Owned':['Direct','Email'] };
    var CH=[['Organic search','Earned',.38,.68,.031,94,'var(--p5)'],['Direct','Owned',.21,.61,.024,88,'var(--p3)'],['Paid search','Paid',.14,.52,.038,71,'var(--rose-ink)'],['Referral','Earned',.09,.66,.029,102,'var(--soil)'],['Email','Owned',.07,.72,.044,118,'var(--p2)'],['Organic social','Shared',.05,.44,.011,49,'var(--rose)'],['Paid social','Paid',.04,.37,.009,38,'var(--rose-deep)'],['Display','Paid',.02,.29,.006,22,'var(--ink-3)']];
    var SRC=[['google / organic','Organic search',.86],['bing / organic','Organic search',.10],['duckduckgo / organic','Organic search',.04],['(direct) / (none)','Direct',1],['google / cpc','Paid search',.83],['bing / cpc','Paid search',.17],['g2.com / referral','Referral',.42],['partner-blog.example / referral','Referral',.33],['capterra.com / referral','Referral',.25],['newsletter / email','Email',.68],['product-updates / email','Email',.32],['linkedin.com / social','Organic social',.61],['reddit.com / social','Organic social',.39],['linkedin / paid_social','Paid social',1],['programmatic / display','Display',1]];
    var TYPES=['Home','Product','Pricing','Blog','Docs','Company'];
    var TCOL={Home:'var(--p5)',Product:'var(--p3)',Pricing:'var(--rose-ink)',Blog:'var(--soil)',Docs:'var(--p2)',Company:'var(--rose)'};
    var TSTAT={Home:[.26,.021],Product:[.22,.034],Pricing:[.11,.061],Blog:[.21,.009],Docs:[.14,.006],Company:[.06,.015]};
    var PAGES=[['/','Home','www',.22,48],['/pricing','Pricing','www',.10,71],['/features/reporting','Product','www',.08,64],['/features/alerts','Product','www',.05,58],['/blog/ga4-migration-checklist','Blog','www',.07,112],['/blog/attribution-for-b2b','Blog','www',.04,97],['/customers','Company','www',.03,52],['/about','Company','www',.02,41],['/login','Product','app',.11,18],['/dashboard','Product','app',.09,156],['/settings/integrations','Product','app',.03,83],['/getting-started','Docs','docs',.06,134],['/api/reference','Docs','docs',.04,171],['/guides/sso','Docs','docs',.02,122],['/community/forum','Company','comm',.03,88]];
    var LANDS=[['/','Home','www',.24,.61,.022],['/blog/ga4-migration-checklist','Blog','www',.12,.71,.008],['/pricing','Pricing','www',.09,.66,.064],['/features/reporting','Product','www',.07,.63,.036],['/login','Product','app',.11,.79,.041],['/blog/attribution-for-b2b','Blog','www',.06,.69,.011],['/getting-started','Docs','docs',.07,.74,.007],['/api/reference','Docs','docs',.05,.68,.004],['/customers','Company','www',.03,.58,.019],['/community/forum','Company','comm',.024,.57,.009]];
    var EVS=[['page_view',1],['scroll',.46],['cta_click',.18],['form_start',.061],['site_search',.049],['file_download',.034],['generate_lead',.024],['video_progress_75',.019]];
    var TERMS=[['pricing',412],['api docs',288],['sso',231],['integrations',204],['export to csv',167],['case study',139],['security',118]];
    var CTAS=[['Book a demo',.31],['Start free trial',.24],['See pricing',.15],['Read the case study',.10],['Download the guide',.08],['Talk to sales',.07],['View integrations',.05]];
    var FORMS=[['Demo request',1,.42],['Free trial sign-up',.82,.57],['Newsletter',.64,.81],['Contact sales',.31,.38],['Guide download',.27,.66]];
    var KEV=[['generate_lead','Demo request',.34,'var(--p5)',[1.32,.58,.74]],['sign_up','Free trial sign-up',.31,'var(--p3)',[1.12,.86,.95]],['newsletter_signup','Newsletter',.19,'var(--rose-ink)',[.84,1.24,1.08]],['contact_submit','Contact sales',.09,'var(--soil)',[1.26,.64,.8]],['guide_download','Guide download',.07,'var(--rose)',[.96,1.05,1.12]]];
    var GOALS=[['New users',function(S,KE){return S*.71;},1.07],['Newsletter subscribers',function(S,KE){return KE*.19;},1.12],['Demo requests',function(S,KE){return KE*.34;},.91],['Organic search sessions',function(S,KE){return S*.38;},.97]];
    var st={host:'all',range:13,peso:{Paid:1,Earned:1,Shared:1,Owned:1},types:{}}; TYPES.forEach(function(t){st.types[t]=1;});
    var el=function(id){return document.getElementById(id);};
    function sum(a){return a.reduce(function(x,y){return x+y;},0);}
    function series(){ var h=HOSTS[st.host]; return base.map(function(v,i){ return v*h.sc*(st.host==='all'?1:noise[(i*7+h.sc*100|0)%W]); }); }
    function CW(){ var c=document.querySelector('#ws-dash .dash'), w=c&&c.clientWidth; return w>0?Math.max(260,Math.min(w-28,900)):640; }
    function niceStep(range){ var s=Math.pow(10,Math.floor(Math.log10(Math.max(range,1)))); if(range/s<3) s/=2; return s; }
    function xLabels(R,X,h,w){ var sp=w<520?(R>13?9:4):(R>13?4:2), xl=''; for(var i=0;i<R;i+=sp){ var an=i===0?'start':(i+sp>=R?'end':'middle'); xl+='<text x="'+X(i)+'" y="'+(h-6)+'" text-anchor="'+an+'">'+lbl(W-R+i)+'</text>'; } return xl; }
    function grid(mn,mx,step,Y,pl,w,pr,f){ var g=''; for(var t=mn;t<=mx+1e-9;t+=step){ g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="g"/><text x="'+(pl-6)+'" y="'+(Y(t)+4)+'" text-anchor="end">'+f(t)+'</text>'; } return g; }
    function chartLine(cur,prev,label,fmtY){
      var R=cur.length, all=cur.concat(prev||[]), mx=Math.max.apply(null,all), mn=Math.min.apply(null,all), step=niceStep(mx-mn);
      mx=Math.ceil(mx/step)*step; mn=Math.max(0,Math.floor(mn/step)*step-step);
      var w=CW(),h=w<520?190:210,pl=42,pr=10,pt=10,pb=26, X=function(i){return pl+(w-pl-pr)*i/(R-1);}, Y=function(v){return pt+(h-pt-pb)*(1-(v-mn)/(mx-mn));};
      var path=function(a){return a.map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);}).join(' ');};
      var area=path(cur)+' L'+X(R-1)+' '+Y(mn)+' L'+X(0)+' '+Y(mn)+' Z';
      return '<svg viewBox="0 0 '+w+' '+h+'" class="chart" role="img" aria-label="'+label+'">'+grid(mn,mx,step,Y,pl,w,pr,fmtY)+xLabels(R,X,h,w)+'<path d="'+area+'" class="ar"/>'+(prev?'<path d="'+path(prev)+'" class="lp"/>':'')+'<path d="'+path(cur)+'" class="lc"/><circle cx="'+X(R-1)+'" cy="'+Y(cur[R-1])+'" r="4" class="dot"/></svg>';
    }
    function legend(names,cols){ return '<p class="d-leg2">'+names.map(function(n,j){return '<span><i style="background:'+cols[j]+'"></i>'+n+'</span>';}).join('')+'</p>'; }
    /* weeks x series stacked bars */
    function stackBars(cols,names,colors,label){
      var R=cols.length, tots=cols.map(sum), mx=Math.max.apply(null,tots), step=niceStep(mx); mx=Math.ceil(mx/step)*step;
      var w=CW(),h=w<520?200:220,pl=42,pr=8,pt=10,pb=26, bw=(w-pl-pr)/R, Y=function(v){return pt+(h-pt-pb)*(1-v/mx);};
      var r=''; cols.forEach(function(col,i){ var y0=h-pb; col.forEach(function(v,j){ var bh=(h-pt-pb)*v/mx; y0-=bh; r+='<rect x="'+(pl+i*bw+bw*.14).toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+(bw*.72).toFixed(1)+'" height="'+Math.max(bh,0).toFixed(1)+'" fill="'+colors[j]+'"></rect>'; }); });
      return '<svg viewBox="0 0 '+w+' '+h+'" class="chart" role="img" aria-label="'+label+'">'+grid(0,mx,step,Y,pl,w,pr,kfmt)+r+xLabels(R,function(i){return pl+i*bw+bw/2;},h,w)+'</svg>'+legend(names,colors);
    }
    /* weeks x series stacked area */
    function stackArea(cols,names,colors,label){
      var R=cols.length, n=names.length, tots=cols.map(sum), mx=Math.max.apply(null,tots), step=niceStep(mx); mx=Math.ceil(mx/step)*step;
      var w=CW(),h=w<520?200:220,pl=42,pr=10,pt=10,pb=26, X=function(i){return pl+(w-pl-pr)*i/(R-1);}, Y=function(v){return pt+(h-pt-pb)*(1-v/mx);};
      var lo=cols.map(function(){return 0;}), out='';
      for(var j=0;j<n;j++){ var hi=cols.map(function(c,i){return lo[i]+c[j];});
        var d=hi.map(function(v,i){return (i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);}).join(' ')+' '+lo.slice().reverse().map(function(v,k){var i=R-1-k;return 'L'+X(i).toFixed(1)+' '+Y(v).toFixed(1);}).join(' ')+' Z';
        out+='<path d="'+d+'" fill="'+colors[j]+'" stroke="var(--paper)" stroke-width=".8"></path>'; lo=hi; }
      return '<svg viewBox="0 0 '+w+' '+h+'" class="chart" role="img" aria-label="'+label+'">'+grid(0,mx,step,Y,pl,w,pr,kfmt)+out+xLabels(R,X,h,w)+'</svg>'+legend(names,colors);
    }
    function bars(rows,cls){ var mx=Math.max.apply(null,rows.map(function(r){return r[1];}))||1; return rows.map(function(r){ return '<div class="hb"><span>'+r[0]+'</span><div class="hb-t"><i class="'+(cls||'')+'" style="width:'+(r[1]/mx*100).toFixed(1)+'%"></i></div><b>'+(r[2]||fmt(r[1]))+'</b></div>'; }).join(''); }
    function table(head,rows){ return '<table class="ws-tbl d-tbl"><thead><tr>'+head.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>'; }
    function empty(msg){ return '<p class="d-empty">'+msg+'</p>'; }
    function delta(d){ return '<span class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ ':'▼ ')+Math.abs(d*100).toFixed(1)+'%</span>'; }
    /* squarified treemap, rendered as positioned blocks */
    function treemap(items){
      var cw=CW(), W0=100, H0=100*(cw<520?1.7:.36), tot=sum(items.map(function(x){return x[1];}));
      var rest=items.map(function(x){return {d:x,a:x[1]/tot*W0*H0};}), rect={x:0,y:0,w:W0,h:H0}, out=[];
      function worst(row,len){ var s2=sum(row.map(function(r){return r.a;})), mx=Math.max.apply(null,row.map(function(r){return r.a;})), mn=Math.min.apply(null,row.map(function(r){return r.a;})); return Math.max(len*len*mx/(s2*s2),s2*s2/(len*len*mn)); }
      function lay(row){ var s2=sum(row.map(function(r){return r.a;}));
        if(rect.w>=rect.h){ var cw2=s2/rect.h, y=rect.y; row.forEach(function(r){ var hh=r.a/cw2; out.push({d:r.d,x:rect.x,y:y,w:cw2,h:hh}); y+=hh; }); rect={x:rect.x+cw2,y:rect.y,w:rect.w-cw2,h:rect.h}; }
        else { var rh=s2/rect.w, x=rect.x; row.forEach(function(r){ var ww=r.a/rh; out.push({d:r.d,x:x,y:rect.y,w:ww,h:rh}); x+=ww; }); rect={x:rect.x,y:rect.y+rh,w:rect.w,h:rect.h-rh}; } }
      var row=[]; while(rest.length){ var len=Math.min(rect.w,rect.h), nx=rest[0];
        if(!row.length||worst(row.concat([nx]),len)<=worst(row,len)){ row.push(nx); rest.shift(); } else { lay(row); row=[]; } }
      if(row.length) lay(row);
      var n=items.length;
      return '<div class="tm" style="aspect-ratio:'+W0+'/'+H0.toFixed(2)+'" role="img" aria-label="CTA clicks by link text, sized by share">'+out.map(function(b,i){ var m=Math.round(100-i*(78/(n-1))), dark=m>52;
        return '<div class="tm-b'+(dark?' dk-t':'')+'" style="left:'+(b.x/W0*100).toFixed(2)+'%;top:'+(b.y/H0*100).toFixed(2)+'%;width:'+(b.w/W0*100).toFixed(2)+'%;height:'+(b.h/H0*100).toFixed(2)+'%;background:color-mix(in srgb, var(--p5) '+m+'%, var(--paper))" title="'+b.d[0]+': '+fmt(b.d[1])+' clicks ('+pct(b.d[2],0)+')"><b>'+b.d[0]+'</b><span>'+pct(b.d[2],0)+' · '+fmt(b.d[1])+'</span></div>'; }).join('')+'</div>';
    }
    /* paired columns: starts with submits inside */
    function formCols(rows){
      var w=CW(), sm=w<520, h=sm?280:240, pl=sm?34:42, pr=4, pt=26, pb=sm?54:34, mx=Math.max.apply(null,rows.map(function(r){return r[1];})), step=niceStep(mx); mx=Math.ceil(mx/step)*step;
      var gw=(w-pl-pr)/rows.length, Y=function(v){return pt+(h-pt-pb)*(1-v/mx);}, o=grid(0,mx,step,Y,pl,w,pr,kfmt);
      rows.forEach(function(r,i){ var cx=pl+gw*i+gw/2, bw=Math.min(gw*.62,90), iw=bw*.52;
        o+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+Y(r[1]).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(Y(0)-Y(r[1])).toFixed(1)+'" rx="3" class="fc-s"></rect>';
        o+='<rect x="'+(cx-iw/2).toFixed(1)+'" y="'+Y(r[2]).toFixed(1)+'" width="'+iw.toFixed(1)+'" height="'+(Y(0)-Y(r[2])).toFixed(1)+'" rx="2" class="fc-c"></rect>';
        o+='<text x="'+cx.toFixed(1)+'" y="'+(Y(r[1])-8).toFixed(1)+'" text-anchor="middle" class="fc-p">'+pct(r[3],0)+'</text>';
        var lines=sm?r[0].split(' '):(w<700&&r[0].indexOf(' ')>0?[r[0].split(' ').slice(0,Math.ceil(r[0].split(' ').length/2)).join(' '),r[0].split(' ').slice(Math.ceil(r[0].split(' ').length/2)).join(' ')]:[r[0]]);
        lines.forEach(function(t,j){ o+='<text x="'+cx.toFixed(1)+'" y="'+(h-pb+15+j*(sm?12:14))+'" text-anchor="middle" class="fc-l'+(sm?' sm':'')+'">'+t+'</text>'; }); });
      return '<svg viewBox="0 0 '+w+' '+h+'" class="chart" role="img" aria-label="Form starts and submits with start-to-completion rate">'+o+'</svg><p class="d-leg2"><span><i style="background:var(--p2)"></i>form_start</span><span><i style="background:var(--p5)"></i>form_submit</span><span>% = start-to-completion</span></p>';
    }
    function render(){
      var R=st.range, h=HOSTS[st.host];
      var all=series(), cur=all.slice(W-R,W), prev=all.slice(W-2*R,W-R), S=sum(cur), P=sum(prev);
      var ER=h.er, ERp=h.er*.958, CV=h.cvr, CVp=h.cvr*.9, KE=S*CV, KEp=P*CVp;
      el('d-host-note').textContent=st.host==='all'?'':'Filtered to '+h.n;
      /* overview */
      var k=[['Sessions',fmt(S),S/P-1],['Engaged sessions',fmt(S*ER),(S*ER)/(P*ERp)-1],['Engagement rate',pct(ER),ER/ERp-1],['Key events',fmt(KE),KE/KEp-1],['Session key event rate',pct(CV,2),CV/CVp-1]];
      el('d-kpis').innerHTML=k.map(function(x){var up=x[2]>=0;return '<div class="dk"><span>'+x[0]+'</span><b>'+x[1]+'</b><em class="'+(up?'up':'dn')+'">'+(up?'▲ ':'▼ ')+Math.abs(x[2]*100).toFixed(1)+'% vs prior</em></div>';}).join('');
      el('d-line').innerHTML=chartLine(cur,prev,'Weekly sessions, this period versus prior period',kfmt);
      var dv=DEV[st.host], dcol=['var(--p5)','var(--p3)','var(--rose-ink)'];
      el('d-dev').innerHTML='<div class="stack100">'+dv.map(function(v,j){return '<i style="width:'+(v*100)+'%;background:'+dcol[j]+'" title="'+DEVN[j]+'"></i>';}).join('')+'</div><div class="dev-leg">'+dv.map(function(v,j){return '<div><span class="sw" style="background:'+dcol[j]+'"></span>'+DEVN[j]+'<b>'+pct(v,0)+'</b><small>'+fmt(S*v)+' sessions</small></div>';}).join('')+'</div>';
      el('d-funnel').innerHTML=[['Awareness','Sessions',S,1],['Engagement','Engaged sessions',S*ER,ER],['Completion','Key events',KE,CV]].map(function(f){return '<div class="fb"><span class="fb-k">'+f[0]+'</span><b>'+fmt(f[2])+'</b><span class="fb-s">'+f[1]+'</span><div class="fb-bar"><i style="width:'+Math.max(f[3]*100,3).toFixed(1)+'%"></i></div></div>';}).join('<span class="fb-arrow" aria-hidden="true">→</span>');
      /* acquisition */
      var chs=CH.filter(function(c){return st.peso[c[1]];});
      el('d-chan').innerHTML=chs.length?stackBars(cur.map(function(s,i){return chs.map(function(c,j){return s*c[2]*jit[(i*8+CH.indexOf(c))%jit.length];});}),chs.map(function(c){return c[0];}),chs.map(function(c){return c[6];}),'Weekly sessions stacked by channel'):empty('Select at least one PESO group.');
      var srcRows=SRC.filter(function(x){ var c=CH.find(function(c){return c[0]===x[1];}); return st.peso[c[1]]; }).map(function(x){ var c=CH.find(function(c){return c[0]===x[1];}); var se=S*c[2]*x[2]; return [se,[x[0],fmt(se),pct(c[3]),dur(c[5]*(0.9+x[2]*.2)),fmt(se*c[4]),pct(c[4])]]; }).sort(function(a,b){return b[0]-a[0];}).slice(0,10).map(function(x){return x[1];});
      el('d-src').innerHTML=srcRows.length?table(['Source / medium','Sessions','Engagement rate','Avg session duration','Key events','Key event rate'],srcRows):empty('Select at least one PESO group.');
      /* content: scatter */
      var ts=TYPES.filter(function(t){return st.types[t];});
      if(ts.length){
        var pts=ts.map(function(t,j){ var sh=TSTAT[t][0]*(st.host==='all'?1:(.6+jit[j*13%jit.length]*.6)); return [t,S*sh,TSTAT[t][1]*(CV/.0294)]; });
        var w=CW(),hh=w<520?240:260,pl=48,pr=16,pt=14,pb=34, xm=Math.max.apply(null,pts.map(function(p){return p[1];}))*1.12, ym=Math.max.apply(null,pts.map(function(p){return p[2];}))*1.18;
        var xs=niceStep(xm), ysx=niceStep(ym*1000)/1000; xm=Math.ceil(xm/xs)*xs; ym=Math.ceil(ym/ysx)*ysx;
        var X=function(v){return pl+(w-pl-pr)*v/xm;}, Y=function(v){return pt+(hh-pt-pb)*(1-v/ym);}, g='';
        for(var t=0;t<=ym+1e-9;t+=ysx){ g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="g"/><text x="'+(pl-6)+'" y="'+(Y(t)+4)+'" text-anchor="end">'+pct(t,1)+'</text>'; }
        for(t=0;t<=xm+1e-9;t+=xs){ g+='<text x="'+X(t)+'" y="'+(hh-16)+'" text-anchor="'+(t===0?'start':(t+xs>xm?'end':'middle'))+'">'+kfmt(t)+'</text>'; }
        g+='<text x="'+(pl+(w-pl-pr)/2)+'" y="'+(hh-2)+'" text-anchor="middle" class="ax">Sessions (landing page type)</text>';
        g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+Y(CV)+'" y2="'+Y(CV)+'" class="avg-l"/><text x="'+(w-pr)+'" y="'+(Y(CV)-5)+'" text-anchor="end" class="avg-t"></text>';
        var dots=pts.map(function(p){ var x=X(p[1]), y=Y(p[2]), an=x>w-90?'end':'start', dx=an==='end'?-11:11; return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="8" fill="'+TCOL[p[0]]+'" stroke="var(--paper)" stroke-width="1.5"></circle><text x="'+(x+dx).toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="'+an+'" class="pt-l">'+p[0]+'</text>'; }).join('');
        el('d-scatter').innerHTML='<svg viewBox="0 0 '+w+' '+hh+'" class="chart" role="img" aria-label="Page types by sessions and session key event rate">'+g+dots+'</svg><p class="d-foot">Dashed line = site average ('+pct(CV,2)+'). Top-right = high traffic and high conversion. Bottom-right = traffic that isn\'t converting yet.</p>';
      } else el('d-scatter').innerHTML=empty('Select at least one page type.');
      var hostOK=function(p){return st.host==='all'||p[2]===st.host;};
      var pg=PAGES.filter(function(p){return hostOK(p)&&st.types[p[1]];});
      var tot=sum(PAGES.filter(hostOK).map(function(p){return p[3];}))||1, PV=S*2.4;
      var pgv=pg.map(function(p){return [p, PV*p[3]/tot];}).sort(function(a,b){return b[1]-a[1];});
      el('d-top').innerHTML=pgv.length?table(['Page path','Type','Views','Avg engagement time'],pgv.slice(0,8).map(function(x){return ['<code>'+x[0][0]+'</code>',x[0][1],fmt(x[1]),dur(x[0][4])];})):empty('No pages match these filters.');
      var ld=LANDS.filter(function(p){return hostOK(p)&&st.types[p[1]];}), ltot=sum(LANDS.filter(hostOK).map(function(p){return p[3];}))||1;
      var ldv=ld.map(function(p){return [p,S*p[3]/ltot];}).sort(function(a,b){return b[1]-a[1];});
      el('d-land').innerHTML=ldv.length?table(['Landing page','Type','Sessions','Engagement rate','Key events','Session key event rate'],ldv.slice(0,8).map(function(x){var r=x[0][5]*(CV/.0294);return ['<code>'+x[0][0]+'</code>',x[0][1],fmt(x[1]),pct(x[0][4]),fmt(x[1]*r),pct(r,2)];})):empty('No landing pages match these filters.');
      /* engagement */
      var pv2=S*2.4;
      el('d-ev').innerHTML=bars(EVS.map(function(e){return ['<code>'+e[0]+'</code>',pv2*e[1]];}));
      el('d-search').innerHTML=bars(TERMS.map(function(e){return [e[0],e[1]*R/13*h.sc];}),'rose');
      var ctaT=pv2*.18;
      el('d-cta').innerHTML=treemap(CTAS.map(function(c){return [c[0],ctaT*c[1],c[1]];}));
      var fs=S*.061;
      el('d-forms').innerHTML=formCols(FORMS.map(function(f){var a=fs*f[1]/3.04;return [f[0],a,a*f[2],f[2]];}));
      /* conversions */
      el('d-ketrend').innerHTML=stackArea(cur.map(function(v,i){return KEV.map(function(x,j){return v*CV*x[2]*jit[(i*5+j*17)%jit.length];});}),KEV.map(function(x){return x[0];}),KEV.map(function(x){return x[3];}),'Weekly key events stacked by key event name');
      el('d-kenames').innerHTML=table(['Key event name','Form / action','Key events','vs prior','Session key event rate'],KEV.map(function(x,j){var d=(KE/KEp-1)*[1.1,.85,1.25,-.35,1.05][j];return ['<code>'+x[0]+'</code>',x[1],fmt(KE*x[2]),delta(d),pct(CV*x[2],2)];}));
      var radj=h.adj-(R>13?.02:0);
      el('d-pace').innerHTML=GOALS.map(function(g,j){ var act=g[1](S,KE), ratio=g[2]+radj*(j%2?1:-1), tgt=act/ratio, mx=tgt*1.25, f=function(v){return (Math.min(v,mx)/mx*100).toFixed(1)+'%';}, ok=ratio>=1;
        return '<div class="bul"><div class="bul-h"><span>'+g[0]+'</span><b>'+pct(ratio,0)+'</b><em class="'+(ok?'up':'dn')+'">'+(ok?'Ahead of goal':'Behind goal')+'</em></div>'+
        '<div class="bul-t" role="img" aria-label="'+g[0]+': '+fmt(act)+' of '+fmt(tgt)+' goal"><i class="bd b1" style="width:'+f(tgt*.7)+'"></i><i class="bd b2" style="left:'+f(tgt*.7)+';width:'+((.2*tgt)/mx*100).toFixed(1)+'%"></i><i class="bd b3" style="left:'+f(tgt*.9)+';right:0"></i><i class="bul-m" style="width:'+f(act)+'"></i><i class="bul-g" style="left:'+f(tgt)+'"></i></div>'+
        '<p class="bul-f">'+fmt(act)+' <span>of '+fmt(tgt)+' goal</span></p></div>'; }).join('')+
        '<p class="d-leg3"><span><i class="k-m"></i>Actual</span><span><i class="k-g"></i>Goal</span><span><i class="k-b"></i>Bands: under 70%, 70–90%, 90%+ of goal</span></p>';
      var cells=DEVN.map(function(n,d){ return [CV*DEVCVR[d]].concat(KEV.map(function(x){return CV*DEVCVR[d]*x[2]*x[4][d];})); });
      var heads=['All key events'].concat(KEV.map(function(x){return x[1];}));
      var colMax=heads.map(function(_,c){return Math.max.apply(null,cells.map(function(r){return r[c];}));}), colMin=heads.map(function(_,c){return Math.min.apply(null,cells.map(function(r){return r[c];}));});
      el('d-devcvr').innerHTML='<table class="heat"><thead><tr><th></th>'+heads.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+cells.map(function(r,d){return '<tr><th>'+DEVN[d]+'</th>'+r.map(function(v,c){ var s=colMax[c]===colMin[c]?.5:(v-colMin[c])/(colMax[c]-colMin[c]), m=Math.round(12+s*70); return '<td style="background:color-mix(in srgb, var(--p5) '+m+'%, var(--paper))" class="'+(m>52?'dk-t':'')+'">'+pct(v,2)+'</td>'; }).join('')+'</tr>';}).join('')+'</tbody></table><p class="d-foot">Session key event rate. Shading compares devices within each column.</p>';
    }
    function pills(id,keys,obj){ var box=el(id); box.innerHTML=keys.map(function(k){return '<button type="button" class="pill-f" aria-pressed="true" data-k="'+k+'">'+k+'</button>';}).join('');
      box.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){ var on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',on?'true':'false'); obj[b.dataset.k]=on?1:0; render(); }); }); }
    pills('f-peso',Object.keys(PESO),st.peso);
    pills('f-types',TYPES,st.types);
    el('dash-range').addEventListener('change',function(){ st.range=+this.value; render(); });
    el('dash-host').addEventListener('change',function(){ st.host=this.value; render(); });
    document.querySelectorAll('.dash-tabs [role=tab]').forEach(function(b){
      b.addEventListener('click',function(){
        document.querySelectorAll('.dash-tabs [role=tab]').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false');});
        document.querySelectorAll('.dash-pane').forEach(function(p){p.hidden=p.dataset.pane!==b.dataset.tab;});
      });
    });
    document.querySelectorAll('[data-open="ws-dash"]').forEach(function(b){ b.addEventListener('click',function(){ setTimeout(render,30); }); });
    var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(render,150); });
    render();
  })();}catch(e){if(window.console)console.warn(e)}
try{

  /* strategy deck */
  (function(){
    document.querySelectorAll('dialog .deck').forEach(function(dk){
    var sl=dk.querySelectorAll('.slide'), dots=dk.querySelectorAll('.wdot'), cnt=dk.querySelector('.deck-count'), btns=dk.querySelectorAll('.deck-btn'), i=0, n=sl.length;
    function go(k){ i=Math.max(0,Math.min(n-1,k));
      sl.forEach(function(s,j){ s.classList.toggle('on',j===i); s.setAttribute('aria-hidden',j===i?'false':'true'); });
      dots.forEach(function(d,j){ d.classList.toggle('on',j===i); });
      cnt.textContent=(i+1)+' / '+n; btns[0].disabled=i===0; btns[1].disabled=i===n-1; }
    btns.forEach(function(b){ b.addEventListener('click',function(){ go(i+(+b.dataset.dir)); }); });
    dots.forEach(function(d){ d.addEventListener('click',function(){ go(+d.dataset.go); }); });
    var dlg=dk.closest('dialog');
    dlg.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){go(i+1);e.preventDefault();} if(e.key==='ArrowLeft'){go(i-1);e.preventDefault();} });
    var sx=null; dk.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
    dk.addEventListener('touchend',function(e){ if(sx===null)return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) go(i+(dx<0?1:-1)); sx=null; });
    dlg.addEventListener('close',function(){ go(0); });
    go(0);
    });
  })();}catch(e){if(window.console)console.warn(e)}
try{

  /* tracking doc tabs */
  (function(){
    var tabs=document.querySelectorAll('.sh-tabs [role=tab]');
    tabs.forEach(function(b){ b.addEventListener('click',function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected',x===b?'true':'false'); });
      document.querySelectorAll('.sh-pane').forEach(function(p){ p.hidden=p.dataset.sh!==b.dataset.sht; });
    }); });
  })();}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{

(function(){
try{
  /* menu takeover */
  var mb=document.querySelector('.menu-btn'),to=document.getElementById('takeover');}catch(e){if(window.console)console.warn(e)}
try{
  function openM(o){to.hidden=!o;mb.setAttribute('aria-expanded',o?'true':'false');document.body.style.overflow=o?'hidden':'';if(o)to.querySelector('.to-close').focus();}
  mb.addEventListener('click',function(){openM(true)});}catch(e){if(window.console)console.warn(e)}
try{
  to.querySelector('.to-close').addEventListener('click',function(){openM(false);mb.focus()});}catch(e){if(window.console)console.warn(e)}
try{
  to.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){openM(false)})});}catch(e){if(window.console)console.warn(e)}
try{
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!to.hidden){openM(false);mb.focus()}});}catch(e){if(window.console)console.warn(e)}
try{
  /* sectors */
  var chips=document.querySelectorAll('.sectors .stab'),panels=document.querySelectorAll('.sectors .spanel-w');}catch(e){if(window.console)console.warn(e)}
try{
  chips.forEach(function(c){c.addEventListener('click',function(){var i=+c.dataset.i;chips.forEach(function(x,j){x.setAttribute('aria-selected',j===i?'true':'false')});panels.forEach(function(p,j){p.hidden=j!==i})})});}catch(e){if(window.console)console.warn(e)}
try{
  /* toolkit folders */
  var fs=document.querySelectorAll('.folder'),fp=document.querySelectorAll('.fpanel');}catch(e){if(window.console)console.warn(e)}
try{
  fs.forEach(function(f,i){f.addEventListener('click',function(){fs.forEach(function(x,j){x.setAttribute('aria-selected',j===i?'true':'false')});fp.forEach(function(p,j){p.hidden=j!==i})})});}catch(e){if(window.console)console.warn(e)}
try{
  /* active nav link */
  var secs=['analytics','operations','leadership','about'].map(function(id){return document.getElementById(id)});}catch(e){if(window.console)console.warn(e)}
try{
  var nl=document.querySelectorAll('.links a');}catch(e){if(window.console)console.warn(e)}
try{
  function act(){if(document.body.dataset.page!=='home')return;var cur=null,mid=innerHeight*.35;secs.forEach(function(s){if(s.getBoundingClientRect().top<mid)cur=s.id});nl.forEach(function(a){a.toggleAttribute('aria-current',a.getAttribute('href')==='#'+cur)})}
  addEventListener('scroll',act,{passive:true});}catch(e){if(window.console)console.warn(e)}
try{act();}catch(e){if(window.console)console.warn(e)}
try{
  /* copy email */
  var cp=document.getElementById('copy'),out=document.getElementById('copied');}catch(e){if(window.console)console.warn(e)}
try{
  cp.addEventListener('click',function(){var t='gab.rodier@gmail.com';function sel(){var r=document.createRange();r.selectNodeContents(document.getElementById('email'));var s=getSelection();s.removeAllRanges();s.addRange(r);out.textContent='Selected'}
    try{navigator.clipboard.writeText(t).then(function(){out.textContent='Copied'},sel)}catch(e){sel()}});}catch(e){if(window.console)console.warn(e)}
try{
  /* tier hour bars: each tier's hours relative to Advanced */
  var tadv=document.getElementById('t-adv');}catch(e){if(window.console)console.warn(e)}
try{
  function hb(){var v={};['core','prem','adv'].forEach(function(k){v[k]=parseFloat(document.getElementById('t-'+k).textContent)||0});
    ['core','prem','adv'].forEach(function(k){document.getElementById('hb-'+k).style.width=(v.adv?v[k]/v.adv*100:0)+'%'})}
  if(tadv){new MutationObserver(hb).observe(tadv,{childList:true,characterData:true,subtree:true});hb()}
  /* back to top */
  var tt=document.querySelector('.totop');}catch(e){if(window.console)console.warn(e)}
try{function tts(){tt.dataset.show=scrollY>innerHeight*.9?'1':'0'}addEventListener('scroll',tts,{passive:true});}catch(e){if(window.console)console.warn(e)}
try{tts();}catch(e){if(window.console)console.warn(e)}
try{
  tt.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{
  var page=document.body.dataset.page;}catch(e){if(window.console)console.warn(e)}
try{
  /* old single-page links (#samples, #skills, #write) keep working */
  var legacy={samples:'work-samples/',skills:'skills-tools/',write:'contact/'};}catch(e){if(window.console)console.warn(e)}
try{
  var h=(location.hash||'').slice(1);}catch(e){if(window.console)console.warn(e)}
try{
  if(page==='home'&&legacy[h]){location.replace(legacy[h]);return}
  /* highlight the nav link for this page */
  var here=location.pathname.replace(/index\.html$/,'');}catch(e){if(window.console)console.warn(e)}
try{
  document.querySelectorAll('.links a,.nav-cta .btn').forEach(function(a){
    var u=new URL(a.getAttribute('href'),location.href);
    a.toggleAttribute('aria-current',page!=='home'&&!u.hash&&u.pathname.replace(/index\.html$/,'')===here)});}catch(e){if(window.console)console.warn(e)}
try{
  document.querySelectorAll('[data-open^=ws-]').forEach(function(a){a.addEventListener('click',function(e){var d=document.getElementById(a.dataset.open);if(d&&d.showModal){e.preventDefault();d.showModal()}})});}catch(e){if(window.console)console.warn(e)}
try{
  document.querySelectorAll('dialog.wsd').forEach(function(d){d.addEventListener('click',function(e){if(e.target===d)d.close()});d.querySelectorAll('[data-close]').forEach(function(c){c.addEventListener('click',function(){d.close()})})});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var st=document.querySelector('#write .env-stage');}catch(e){if(window.console)console.warn(e)}
try{if(!st)return;}catch(e){if(window.console)console.warn(e)}
try{var f=st.querySelector('.cform'),tn=st.querySelector('.seal-t');}catch(e){if(window.console)console.warn(e)}
try{
st.querySelector('.seal').addEventListener('click',function(){if(st.dataset.state!=='closed'&&st.dataset.state!=='sealed')return;f.reset();tn.textContent='Open';st.dataset.state='open';setTimeout(function(){var i=f.querySelector('input');if(i)i.focus({preventScroll:true})},1300)});}catch(e){if(window.console)console.warn(e)}
try{
f.addEventListener('submit',function(e){e.preventDefault();var bad=[];f.querySelectorAll('[required]').forEach(function(x){var ok=x.value.trim()&&(x.type!=='email'||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.value));x.setAttribute('aria-invalid',ok?'false':'true');if(!ok)bad.push(x.name)});
 var er=f.querySelector('.ferr');if(bad.length){er.textContent='Please fill in: '+bad.join(', ')+'.';return}er.textContent='';
 var btn=f.querySelector('.send'),lbl=btn.innerHTML;if(btn.disabled)return;btn.disabled=true;btn.setAttribute('aria-busy','true');btn.innerHTML='Sending&hellip;';
 function done(){btn.disabled=false;btn.removeAttribute('aria-busy');btn.innerHTML=lbl}
 fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){
   if(r.ok){done();st.querySelector('.ty-n').textContent=f.querySelector('[name=name]').value.trim().split(' ')[0];st.dataset.state='thanks';
     setTimeout(function(){st.dataset.state='sealed';tn.textContent='Sent'},2600);return}
   return r.json().catch(function(){return {}}).then(function(d){done();var m=d&&d.errors&&d.errors.map(function(x){return x.message}).join(' ');
     er.textContent=(m?m+' ':'')+'Your note didn\u2019t send. Please try again, or email me directly using the address in the footer.'})
 }).catch(function(){done();er.textContent='Your note didn\u2019t send (connection problem). Please try again, or email me directly using the address in the footer.'})});}catch(e){if(window.console)console.warn(e)}
try{
st.querySelector('.replay').addEventListener('click',function(){st.dataset.state='closed';tn.textContent='Open'});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var v=document.getElementById('skills');}catch(e){if(window.console)console.warn(e)}
try{if(!v)return;}catch(e){if(window.console)console.warn(e)}
try{var fa='all',fl='all',q='';}catch(e){if(window.console)console.warn(e)}
try{
v.querySelectorAll('.hr').forEach(function(r){var h=r.closest('.hsub'),g=r.closest('.hgroup'),t=[];if(h){var x=h.querySelector('.hs-h');if(x)t.push(x.textContent)}if(g){var y=g.querySelector('.hg-h h2');if(y)t.push(y.textContent)}r.dataset.s=t.join(' | ').toLowerCase()});}catch(e){if(window.console)console.warn(e)}
try{
var rows=v.querySelectorAll('.hr'),rad=v.querySelectorAll('.hr-r'),cnt=v.querySelector('.hb-count'),inp=v.querySelector('#hb-q'),empty=v.querySelector('.hb-empty');}catch(e){if(window.console)console.warn(e)}
try{
function lv(l){if(fl==='all')return true;if(fl==='3-5')return l>=3&&l<=5;return String(l)===fl}
function apply(){var n=0;rows.forEach(function(r){var ok=(fa==='all'||r.dataset.a===fa)&&lv(+r.dataset.l)&&(!q||r.dataset.n.indexOf(q)>-1||(r.dataset.s||'').indexOf(q)>-1);r.hidden=!ok;if(ok)n++});
 v.querySelectorAll('.hsub').forEach(function(s){s.hidden=!s.querySelector('.hr:not([hidden])')});
 v.querySelectorAll('.hgroup').forEach(function(g){g.hidden=!g.querySelector('.hr:not([hidden])')});
 var rn=0;rad.forEach(function(r){var ok=(fa==='all'||r.dataset.a===fa)&&fl==='all'&&(!q||r.dataset.n.indexOf(q)>-1);r.hidden=!ok;if(ok)rn++});
 v.querySelector('.radar').hidden=!rn;empty.hidden=!!(n+rn);cnt.textContent=(n+rn)+' of '+(rows.length+rad.length)+' shown'}
v.querySelectorAll('[data-fa]').forEach(function(b){b.addEventListener('click',function(){fa=b.dataset.fa;v.querySelectorAll('[data-fa]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});apply()})});}catch(e){if(window.console)console.warn(e)}
try{
v.querySelectorAll('[data-fl]').forEach(function(b){b.addEventListener('click',function(){fl=b.dataset.fl;v.querySelectorAll('[data-fl]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});apply()})});}catch(e){if(window.console)console.warn(e)}
try{
inp.addEventListener('input',function(){q=inp.value.trim().toLowerCase();apply()});}catch(e){if(window.console)console.warn(e)}
try{apply();}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
document.addEventListener("touchstart",function(){},{passive:true});
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;}catch(e){if(window.console)console.warn(e)}
try{document.querySelectorAll("main .ground").forEach(function(g){g.classList.add("pre");var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){requestAnimationFrame(function(){g.classList.remove("pre")})}else if(e.boundingClientRect.top>0){g.classList.add("pre")}})},{threshold:[0,.4]});io.observe(g)})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var bs=document.querySelectorAll('.rv-info');}catch(e){if(window.console)console.warn(e)}
try{function closeAll(x){bs.forEach(function(b){if(b!==x)b.setAttribute('aria-expanded','false')})}
bs.forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();var o=b.getAttribute('aria-expanded')==='true';closeAll(b);b.setAttribute('aria-expanded',o?'false':'true')})});}catch(e){if(window.console)console.warn(e)}
try{
document.addEventListener('click',function(){closeAll(null)});}catch(e){if(window.console)console.warn(e)}
try{document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll(null)})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{document.querySelectorAll(".xcta").forEach(function(a){a.addEventListener("pointerenter",function(e){if(e.pointerType!=="touch")a.classList.add("is-open")});a.addEventListener("pointerleave",function(){a.classList.remove("is-open")});a.addEventListener("mouseenter",function(){a.classList.add("is-open")});a.addEventListener("mouseleave",function(){a.classList.remove("is-open")});a.addEventListener("focus",function(){a.classList.add("is-open")});a.addEventListener("blur",function(){a.classList.remove("is-open")})})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{document.querySelectorAll('.rf3').forEach(function(w){var S=[["01", "Find the Friction", "Analyze digital data - via funnels, heatmaps, segments, and more - to find where users stall"], ["02", "Recommend the Change", "Propose data-backed UX recommendations with hypotheses & statistical significance estimates"], ["03", "Test or Ship", "Roll out UX recommendation - either via testing (e.g. A/B, multivariate, etc) or as a measured direct rollout"], ["04", "Measure the Impact", "Analyze performance to determine the outcome of the update & confirm statistical significance of the outcome"]],W=["Analyze", "Suggest", "Ship", "Measure"],nodes=w.querySelectorAll('.rf-node'),ics=w.querySelectorAll('.rf-ic'),dots=w.querySelectorAll('.rf-dots i'),hits=w.querySelectorAll('.rf-hit'),cur=0,dial=w.querySelector('.rf-dial'),prog=w.querySelector('.rf-prog');
function place(){var r=dial.getBoundingClientRect().width/420;hits.forEach(function(h,k){var a=(-90+90*k)*Math.PI/180;h.style.left=(210+120*Math.cos(a))*r+'px';h.style.top=(180+120*Math.sin(a))*r+'px'})}
function go(i){cur=(i%4+4)%4;nodes.forEach(function(x,k){x.classList.toggle('on',k===cur)});hits.forEach(function(h,k){h.setAttribute('aria-pressed',k===cur?'true':'false')});
ics.forEach(function(x,k){x.classList.toggle('on',k===cur)});dots.forEach(function(x,k){x.classList.toggle('on',k===cur)});
if(prog){var C=+prog.dataset.c,L=C*cur/4;prog.setAttribute('stroke-dasharray',L.toFixed(1)+' '+C.toFixed(1))}
w.querySelector('.rf-k').textContent='Step '+S[cur][0]+' of 04 \u00b7 '+W[cur];w.querySelector('.rf-t').textContent=S[cur][1];w.querySelector('.rf-d').textContent=S[cur][2]}
hits.forEach(function(h,k){h.addEventListener('click',function(){go(k)});h.addEventListener('mouseenter',function(){nodes[k].classList.add('hov')});h.addEventListener('mouseleave',function(){nodes[k].classList.remove('hov')});
h.addEventListener('focus',function(){nodes[k].classList.add('hov')});h.addEventListener('blur',function(){nodes[k].classList.remove('hov')})});
w.querySelector('.rf-prev').addEventListener('click',function(){go(cur-1)});w.querySelector('.rf-next').addEventListener('click',function(){go(cur+1)});
w.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(cur+1)}if(e.key==='ArrowLeft'){go(cur-1)}});addEventListener('resize',place);place();go(0)})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{

document.querySelectorAll('.qcar3').forEach(function(c){
  var tr=c.querySelector('.qc-tr'),it=[].slice.call(tr.children),pv=c.querySelector('.qc-prev'),nx=c.querySelector('.qc-next'),
      cnt=c.querySelector('.qc-cnt'),bar=c.querySelector('.qc-bar2'),th=c.querySelector('.qc-th'),dw=c.querySelector('.qc-dots2'),pk=c.querySelector('.qc-peek');
  var vis,n,target=null,ctl=[],raf=0,endT;
  function perView(){var g=parseFloat(getComputedStyle(tr).columnGap)||0,w=it[0].getBoundingClientRect().width;return Math.max(1,Math.floor((tr.clientWidth+g+1)/(w+g)))}
  function lab(k){return vis>1?'Show quotes '+(k+1)+' to '+(k+vis)+' of '+it.length:'Show quote '+(k+1)+' of '+it.length}
  function build(){vis=perView();n=it.length-vis+1;ctl=[];
    if(bar){[].slice.call(bar.querySelectorAll('.qc-seg')).forEach(function(x){x.remove()});th.style.width=(100/n)+'%';th.style.transition='none';
      for(var k=0;k<n;k++){var b=document.createElement('button');b.type='button';b.className='qc-seg';b.setAttribute('aria-label',lab(k));b.dataset.k=k;bar.appendChild(b);ctl.push(b)}}
    if(dw){dw.innerHTML='';for(var k=0;k<n;k++){var b=document.createElement('button');b.type='button';b.className='qc-dot';b.setAttribute('aria-label',lab(k));b.dataset.k=k;b.innerHTML='<i></i>';dw.appendChild(b);ctl.push(b)}}
    ctl.forEach(function(b){b.addEventListener('click',function(){to(+b.dataset.k)})});thumb();mark(cur())}
  function maxS(){return tr.scrollWidth-tr.clientWidth}
  function off(i){return Math.min(it[i].offsetLeft-it[0].offsetLeft,maxS())}
  function cur(){if(tr.scrollLeft>=maxS()-4)return n-1;var best=0;for(var k=0;k<n;k++)if(Math.abs(off(k)-tr.scrollLeft)<Math.abs(off(best)-tr.scrollLeft))best=k;return best}
  function p2(x){return String(x).padStart(2,'0')}
  function mark(k){ctl.forEach(function(b){var on=+b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'true':'false')});
    if(cnt)cnt.textContent=(vis>1?p2(k+1)+'–'+p2(k+vis):p2(k+1))+' / '+p2(it.length);
    if(pk)pk.classList.toggle('end',k===n-1)}
  function thumb(){if(!th)return;var x=tr.scrollLeft,pos=n-1;for(var j=0;j<n-1;j++){var a=off(j),b=off(j+1);if(x<=b){pos=j+(b>a?Math.max(0,x-a)/(b-a):0);break}}th.style.transform='translateX('+(pos*100)+'%)'}
  function to(k){k=(k+n)%n;target=k;mark(k);tr.scrollTo({left:off(k),behavior:'smooth'})}
  pv.addEventListener('click',function(){to((target!=null?target:cur())-1)});nx.addEventListener('click',function(){to((target!=null?target:cur())+1)});
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();nx.click()}if(e.key==='ArrowLeft'){e.preventDefault();pv.click()}});
  tr.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){thumb();if(target==null)mark(cur())});
    clearTimeout(endT);endT=setTimeout(function(){target=null;mark(cur())},140)});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(perView()!==vis)build();else{thumb();mark(cur())}},120)});
  build();
});
}catch(e){if(window.console)console.warn(e)}
;
try{

document.querySelectorAll('.t1b').forEach(function(x){var t=x.querySelectorAll('.t1-b'),p=x.querySelectorAll('.t1b-p'),box=x.querySelector('.t1b-box');
  function sel(b,i){t.forEach(function(y){y.setAttribute('aria-selected',y===b)});p.forEach(function(q,j){q.hidden=j!==i;q.classList.toggle('on',j===i)});
    box.style.setProperty('--cx',(b.offsetLeft-box.offsetLeft+b.offsetWidth/2)+'px')}
  t.forEach(function(b,i){b.addEventListener('click',function(){sel(b,i)})});sel(t[0],0);window.addEventListener('resize',function(){var a=x.querySelector('.t1-b[aria-selected=true]');sel(a,[].indexOf.call(t,a))})});
}catch(e){if(window.console)console.warn(e)}
;
try{

document.querySelectorAll('.rw2').forEach(function(w){var hits=w.querySelectorAll('.rf-hit'),bs=w.querySelectorAll('.rl button');
  function sync(){var k=[].findIndex.call(hits,function(h){return h.getAttribute('aria-pressed')==='true'});bs.forEach(function(b,j){b.setAttribute('aria-pressed',j===k?'true':'false')})}
  bs.forEach(function(b,j){b.addEventListener('click',function(){hits[j].click();sync()})});
  w.addEventListener('click',function(){setTimeout(sync,0)});w.addEventListener('keydown',function(){setTimeout(sync,0)});
  window.addEventListener('load',function(){setTimeout(sync,50)});sync();
});
}catch(e){if(window.console)console.warn(e)}
;
try{

/* Off the Clock shelf: open/close books; covers are pre-measured so they open at their final size */
(function(){
document.querySelectorAll('.nsel2').forEach(function(s){
  var bk=[].slice.call(s.querySelectorAll('.bk2')),row=s.querySelector('.s2-row'),cur=null,H=[];
  var dt=parseFloat(s.getAttribute('data-dt')||'0.5');
  function spineW(){var v=bk.map(function(o){return o.classList.contains('on')?99:parseFloat(getComputedStyle(o).flexBasis)||50});return Math.min.apply(null,v)}
  function target(){var cs=getComputedStyle(row),gap=parseFloat(cs.columnGap)||5,
      avail=row.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    return Math.min(310,avail-(bk.length-1)*(spineW()+gap))}
  function clone(k,w){var c=k.querySelector('.bk2-c').cloneNode(true);
    c.style.cssText='position:absolute;inset:auto;left:-9999px;top:0;width:'+w+'px;height:auto;visibility:hidden;opacity:1;transition:none;box-sizing:border-box;padding:'+(.05*w)+'px '+(.06*w)+'px '+(.06*w)+'px '+(.19*w)+'px';
    k.appendChild(c);return c}
  function measure(){
    var w=target(),cl=bk.map(function(k){var c=clone(k,w);var t=c.querySelector('.bc-t'),p=c.querySelector('.bc-p');t.style.removeProperty('font-size');p.style.removeProperty('font-size');return c});
    // one title size for every cover: shrink all by the tightest fit
    var f=1;cl.forEach(function(c){var t=c.querySelector('.bc-t');if(t.scrollWidth>t.clientWidth+1)f=Math.min(f,t.clientWidth/t.scrollWidth)});
    var ts=parseFloat(getComputedStyle(cl[0].querySelector('.bc-t')).fontSize)*f*(f<1?0.98:1);
    cl.forEach(function(c,i){var t=c.querySelector('.bc-t'),p=c.querySelector('.bc-p');t.style.setProperty('font-size',ts+'px','important');
      var ps=Math.min(parseFloat(getComputedStyle(p).fontSize),ts-dt);p.style.setProperty('font-size',ps+'px','important');
      H[i]=Math.ceil(c.getBoundingClientRect().height);
      var rt=bk[i].querySelector('.bk2-c .bc-t'),rp=bk[i].querySelector('.bk2-c .bc-p');
      rt.style.setProperty('font-size',ts+'px','important');rp.style.setProperty('font-size',ps+'px','important');
      bk[i].removeChild(c)});
  }
  function size(){bk.forEach(function(x){x.style.height=''});row.style.height='';
    if(cur){var h=H[bk.indexOf(cur)];cur.style.height=h+'px';row.style.height=(h+10)+'px'}}
  function set(k){cur=k;bk.forEach(function(x){var on=x===k;x.classList.toggle('on',on);x.querySelector('.bk2-sp').setAttribute('aria-expanded',on)});s.classList.toggle('open',!!k);size()}
  bk.forEach(function(k){k.querySelector('.bk2-sp').addEventListener('click',function(){set(k)});k.querySelector('.bk2-c').addEventListener('click',function(){set(null)})});
  function remeasure(){measure();size()}
  remeasure();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure);
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(remeasure,120)});
  s._open=function(i){set(bk[i])};
});
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{
function fit(){document.querySelectorAll('.cov-row').forEach(function(g){var ts=[].slice.call(g.querySelectorAll('.bc-t'));
 ts.forEach(function(t){t.style.removeProperty('font-size')});
 var k=1;ts.forEach(function(t){if(t.offsetParent&&t.closest('.bc').clientWidth>150&&t.scrollWidth>t.clientWidth+1)k=Math.min(k,t.clientWidth/t.scrollWidth)});
 if(k<1)ts.forEach(function(t){t.style.setProperty('font-size',(parseFloat(getComputedStyle(t).fontSize)*k*0.98)+'px','important')})})}
fit();}catch(e){if(window.console)console.warn(e)}
try{if(document.fonts)document.fonts.ready.then(fit);}catch(e){if(window.console)console.warn(e)}
try{addEventListener('resize',fit);}catch(e){if(window.console)console.warn(e)}
try{
document.addEventListener('click',function(){setTimeout(fit,500)});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{document.querySelectorAll('.ocases').forEach(function(r){var it=[].slice.call(r.children);if(it.length<2)return;
var d=document.createElement('div');d.className='oc-dots';d.setAttribute('aria-hidden','true');
it.forEach(function(c,i){var b=document.createElement('button');b.type='button';b.tabIndex=-1;b.addEventListener('click',function(){r.scrollTo({left:c.offsetLeft-r.offsetLeft-16,behavior:'smooth'})});d.appendChild(b)});
r.parentNode.insertBefore(d,r.nextSibling);
function upd(){var x=r.scrollLeft,k=0,best=1e9;it.forEach(function(c,i){var v=Math.abs(c.offsetLeft-r.offsetLeft-16-x);if(v<best){best=v;k=i}});if(x>=r.scrollWidth-r.clientWidth-4)k=it.length-1;[].forEach.call(d.children,function(b,i){b.classList.toggle('on',i===k)})}
var t;r.addEventListener('scroll',function(){cancelAnimationFrame(t);t=requestAnimationFrame(upd)});addEventListener('resize',upd);upd()})}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{
/* leadership tap-to-open (phones only; desktop shows everything) */
document.querySelectorAll('.lx2 .lxc').forEach(function(c,i){var b=c.querySelector('b');if(!b)return;b.classList.add('lx-b');
 var t=document.createElement('button');t.type='button';t.className='lx-t';t.textContent=b.textContent;t.setAttribute('aria-expanded','false');
 var pp=c.querySelector('p');if(pp){pp.id='lxp'+i;t.setAttribute('aria-controls','lxp'+i)}
 b.parentNode.insertBefore(t,b);t.addEventListener('click',function(){var o=c.classList.toggle('open');t.setAttribute('aria-expanded',o)})});}catch(e){if(window.console)console.warn(e)}
try{
/* sector pills: keep the selected pill in view */
document.querySelectorAll('.t1c .t1-b').forEach(function(b){b.addEventListener('click',function(){var r=b.parentNode;r.scrollTo({left:b.offsetLeft-r.offsetLeft-16-(r.clientWidth-b.offsetWidth)/2+16,behavior:'smooth'})})});}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var v=document.getElementById('skills');}catch(e){if(window.console)console.warn(e)}
try{if(!v)return;}catch(e){if(window.console)console.warn(e)}
try{
var gs=[].slice.call(v.querySelectorAll('.hgroup')),inp=v.querySelector('#hb-q');}catch(e){if(window.console)console.warn(e)}
try{
gs.forEach(function(g,i){var h=g.querySelector('.hg-h h2');if(!h)return;var n=g.querySelectorAll('.hr').length;
 var t=document.createElement('button');t.type='button';t.className='hg-tg';t.setAttribute('aria-expanded','false');
 h.parentNode.insertBefore(t,h);t.appendChild(h);var c=document.createElement('span');c.className='hg-n';c.textContent=n+' skills';t.appendChild(c);
 t.addEventListener('click',function(){g.dataset.user=g.classList.contains('sk-open')?'closed':'open';sync()})});}catch(e){if(window.console)console.warn(e)}
try{
function filtering(){return (inp&&inp.value.trim())||v.querySelector('[data-fa][aria-pressed="true"]:not([data-fa="all"])')||v.querySelector('[data-fl][aria-pressed="true"]:not([data-fl="all"])')}
var was=false;}catch(e){if(window.console)console.warn(e)}
try{function sync(){var f=!!filtering();if(f!==was){gs.forEach(function(g){delete g.dataset.user});was=f}
 gs.forEach(function(g){var o=g.dataset.user?g.dataset.user==='open':f;g.classList.toggle('sk-open',o);var t=g.querySelector('.hg-tg');if(t)t.setAttribute('aria-expanded',o)})}
if(inp)inp.addEventListener('input',function(){setTimeout(sync,0)});}catch(e){if(window.console)console.warn(e)}
try{
v.querySelectorAll('[data-fa],[data-fl]').forEach(function(b){b.addEventListener('click',function(){setTimeout(sync,0)})});}catch(e){if(window.console)console.warn(e)}
try{sync();}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}
;
try{
(function(){
try{var v=document.getElementById('skills');}catch(e){if(window.console)console.warn(e)}
try{if(!v)return;}catch(e){if(window.console)console.warn(e)}
try{var r=v.querySelector('.hb-reset'),inp=v.querySelector('#hb-q');}catch(e){if(window.console)console.warn(e)}
try{if(!r)return;}catch(e){if(window.console)console.warn(e)}
try{
function active(){return (inp&&inp.value.trim())||v.querySelector('[data-fa][aria-pressed="true"]:not([data-fa="all"])')||v.querySelector('[data-fl][aria-pressed="true"]:not([data-fl="all"])')}
function upd(){r.hidden=!active()}
r.addEventListener('click',function(){var a=v.querySelector('[data-fa="all"]'),l=v.querySelector('[data-fl="all"]');if(a)a.click();if(l)l.click();if(inp){inp.value='';inp.dispatchEvent(new Event('input',{bubbles:true}))}upd();if(inp)inp.focus()});}catch(e){if(window.console)console.warn(e)}
try{
if(inp)inp.addEventListener('input',function(){setTimeout(upd,0)});}catch(e){if(window.console)console.warn(e)}
try{v.querySelectorAll('[data-fa],[data-fl]').forEach(function(b){b.addEventListener('click',function(){setTimeout(upd,0)})});}catch(e){if(window.console)console.warn(e)}
try{upd()}catch(e){if(window.console)console.warn(e)}
})();
}catch(e){if(window.console)console.warn(e)}