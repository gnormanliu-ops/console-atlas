const COLORS = {Nintendo:'#ed5263', PlayStation:'#6e9efb', Xbox:'#7bd3a0'};
// These are the selected platforms launched after the dataset's first year.
// Every other platform in the cleaned catalog launched by 2010.
const PLATFORM_LAUNCH_YEAR = {
  'Nintendo 3DS':2011, 'Wii U':2012, 'New Nintendo 3DS':2014,
  'Nintendo Switch':2017, 'PlayStation Vita':2011,
  'PlayStation 4':2013, 'PlayStation 5':2020,
  'Xbox One':2013, 'Xbox Series X|S':2020
};
const fmt = n => Number(n).toLocaleString('en-US');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n, digits=1) => n == null || !Number.isFinite(n) ? '—' : Number(n).toFixed(digits);
const median = values => { if (!values.length) return null; values.sort((a,b)=>a-b); let m=Math.floor(values.length/2); return values.length%2 ? values[m] : (values[m-1]+values[m])/2; };

// Decorative covers are separate from the PlayMyData analysis. Local copies
// make the visual layer reliable both on a local server and on GitHub Pages.
const coverGames = [
  ['Hades',1145360],['Stardew Valley',413150],['Hollow Knight',367520],
  ['Celeste',504230],['Cyberpunk 2077',1091500],['Elden Ring',1245620],
  ['Cuphead',268910],['Dead Cells',588650],['The Witcher 3: Wild Hunt',292030],
  ["No Man's Sky",275850],['Ori and the Will of the Wisps',1057090],
  ['Slay the Spire',646570],['Terraria',105600],['Portal 2',620],
  ['It Takes Two',1426210],['Dave the Diver',1868140],
  ['Doom Eternal',782330],['Vampire Survivors',1794680]
];
function initCoverWall(){
  const wall=document.createElement('div');
  wall.className='cover-wall';
  wall.setAttribute('aria-hidden','true');
  for(let column=0;column<6;column++){
    const strip=document.createElement('div');
    strip.className='cover-column';
    const selection=coverGames.slice(column*3,column*3+3);
    for(let repeat=0;repeat<2;repeat++)for(const [title,id] of selection){
      const tile=document.createElement('div');
      tile.className='cover-tile';
      tile.style.setProperty('--cover-hue',String((id*7)%360));
      const label=document.createElement('span');label.textContent=title;
      const art=document.createElement('img');
      art.src=`assets/covers/${id}.jpg`;
      art.alt='';art.decoding='async';
      art.addEventListener('error',()=>art.remove(),{once:true});
      tile.append(label,art);strip.append(tile);
    }
    wall.append(strip);
  }
  document.body.prepend(wall);
}
initCoverWall();

function barChart(items, {format=fmt, maxItems=12, color='#6e9efb'}={}) {
  const data=items.slice(0,maxItems).filter(d=>d.value!=null && Number.isFinite(d.value));
  if (!data.length) return '<div class="empty">No observations for this view.</div>';
  const max=Math.max(1,...data.map(d=>d.value));
  return `<div class="bars" role="img" aria-label="${esc(data.map(d=>`${d.label}: ${format(d.value)}`).join('; '))}">${data.map(d=>`<div class="bar-row"><div class="bar-label" title="${esc(d.label)}">${esc(d.label)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(1,100*d.value/max)}%;background:${d.color||color}"></div></div><strong>${format(d.value)}</strong></div>`).join('')}</div>`;
}
function metric(label,value,detail='') {return `<div class="metric"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(detail)}</small></div>`;}
function insight(label,title,body) {return `<article class="analysis-card"><span>${esc(label)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;}

async function initReport(){
  const d=await fetch('data/report.json').then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()});
  document.getElementById('intro').textContent=`A retrospective of ${fmt(d.unique_games)} distinct games across Nintendo, PlayStation, and Xbox, first released from 2010 through November 2023. The ${fmt(d.row_count)} game–platform entries show how catalog presence, reviews, and playtime differ across console families. The dataset ends in 2023; these numbers do not describe games released in 2024–2026 or console sales.`;
  document.getElementById('headline').innerHTML=metric('GAME–PLATFORM ENTRIES',fmt(d.row_count),'One title may appear more than once')+metric('DISTINCT GAMES',fmt(d.unique_games),'Deduplicated by game ID')+metric('CONSOLE PLATFORMS',fmt(d.platform_count),'Across three families')+metric('FIRST RELEASE YEARS',fmt(d.year_count),'2010 through 2023');
  document.getElementById('method-cleaning').textContent=`The three source files contain ${fmt(d.raw_rows)} records. Deduplicating on IGDB game ID leaves ${fmt(d.deduplicated_games)} games; ${fmt(d.drops.invalid_date_or_list)} lack a usable date or platform/genre list, ${fmt(d.drops.no_selected_platform)} do not map to the selected 26 hardware platforms, and ${fmt(d.drops.outside_2010_2023)} were first released before 2010. The remaining titles expand into ${fmt(d.row_count)} game–platform rows. A score of zero with no reviews is treated as missing, as are zero-hour playtime estimates. No ratings or hours are imputed.`;
  const familyOrder=['Nintendo','PlayStation','Xbox'];
  const top=Object.entries(d.top_platforms), genre=Object.entries(d.genres);
  const findings=[
    {title:`The catalog peaks at ${fmt(d.years['2022'])} entries for games first released in 2022`,body:`Entries rise from ${fmt(d.years['2013'])} in 2013 to ${fmt(d.years['2022'])} in 2022. These are first-release cohorts for games present on selected consoles, not annual console launch counts. Collection coverage and the partial 2023 year affect the shape.`,items:Object.entries(d.years).filter(([y])=>+y>=2013).map(([label,value])=>({label,value})),limit:11},
    {title:`PlayStation accounts for ${fmt(d.families.PlayStation)} catalog entries`,body:`The three families contribute ${fmt(d.families.PlayStation)} PlayStation, ${fmt(d.families.Nintendo)} Nintendo, and ${fmt(d.families.Xbox)} Xbox game–platform entries. The same game can count in multiple families and on more than one generation.`,items:familyOrder.map(label=>({label,value:d.families[label],color:COLORS[label]}))},
    {title:`Switch is the largest individual platform in this snapshot`,body:`Nintendo Switch has ${fmt(d.top_platforms['Nintendo Switch'])} entries, followed by PlayStation 4 with ${fmt(d.top_platforms['PlayStation 4'])} and Xbox One with ${fmt(d.top_platforms['Xbox One'])}. This measures catalog coverage, not hardware popularity or game sales.`,items:top.map(([label,value])=>({label,value})),limit:10},
    {title:`Cross-family presence peaks at ${d.eras[2].percent}% for the 2018–2020 cohort`,body:`Among distinct games first released in 2010–2013, ${fmt(d.eras[0].multi)} of ${fmt(d.eras[0].total)} (${d.eras[0].percent}%) appear in more than one family. The share reaches ${d.eras[2].percent}% (${fmt(d.eras[2].multi)} of ${fmt(d.eras[2].total)}) for 2018–2020, then stands at ${d.eras[3].percent}% for 2021–2023. This is catalog presence, and the dataset stops in November 2023.`,items:d.eras.map(x=>({label:x.label,value:x.percent})),format:v=>`${money(v)}%`},
    {title:`Shooter leads the recorded primary genres`,body:`The first listed genre is Shooter for ${fmt(d.genres.Shooter)} entries, followed by RPG for ${fmt(d.genres['Role-playing (RPG)'])} and Platform for ${fmt(d.genres.Platform)}. Multi-genre games are assigned one primary genre here to avoid counting a single game more than once in this chart.`,items:genre.map(([label,value])=>({label,value})),limit:8},
    {title:`Reviewed games average roughly 66 out of 100`,body:`Average HowLongToBeat user review scores are ${d.score.Xbox.mean} on Xbox (n=${fmt(d.score.Xbox.n)}), ${d.score.PlayStation.mean} on PlayStation (n=${fmt(d.score.PlayStation.n)}), and ${d.score.Nintendo.mean} on Nintendo (n=${fmt(d.score.Nintendo.n)}). These are not critic scores; many entries have no review and therefore are excluded.`,items:familyOrder.map(label=>({label,value:d.score[label].mean,color:COLORS[label]})),format:v=>money(v)},
    {title:`The median main-story estimate is ${d.hours.PlayStation.median} hours for PlayStation entries`,body:`For entries with a positive reported estimate, median main-story time is ${d.hours.PlayStation.median} hours on PlayStation (n=${fmt(d.hours.PlayStation.n)}), ${d.hours.Xbox.median} on Xbox (n=${fmt(d.hours.Xbox.n)}), and ${d.hours.Nintendo.median} on Nintendo (n=${fmt(d.hours.Nintendo.n)}). Game mix differs by family, and a multiplatform title may enter several groups.`,items:familyOrder.map(label=>({label,value:d.hours[label].median,color:COLORS[label]})),format:v=>`${money(v)} h`},
    {title:`Review coverage ranges from ${d.coverage.Nintendo.percent}% to ${d.coverage.Xbox.percent}%`,body:`A positive user review count is recorded for ${fmt(d.coverage.Nintendo.n)} of ${fmt(d.coverage.Nintendo.total)} Nintendo entries (${d.coverage.Nintendo.percent}%), ${fmt(d.coverage.PlayStation.n)} of ${fmt(d.coverage.PlayStation.total)} PlayStation entries (${d.coverage.PlayStation.percent}%), and ${fmt(d.coverage.Xbox.n)} of ${fmt(d.coverage.Xbox.total)} Xbox entries (${d.coverage.Xbox.percent}%). This missingness limits comparisons of average scores.`,items:familyOrder.map(label=>({label,value:d.coverage[label].percent,color:COLORS[label]})),format:v=>`${money(v)}%`},
  ];
  document.getElementById('findings').innerHTML=findings.map((f,i)=>`<section class="finding"><div class="finding-copy"><span class="finding-number">${String(i+1).padStart(2,'0')} / 08</span><h2>${esc(f.title)}</h2><p>${esc(f.body)}</p></div><div class="finding-chart"><div class="chart-caption">${['CATALOG ENTRIES · FIRST RELEASE YEAR','CATALOG ENTRIES · FAMILY','CATALOG ENTRIES · PLATFORM','SHARE OF DISTINCT GAMES IN MULTIPLE FAMILIES','CATALOG ENTRIES · PRIMARY GENRE','AVERAGE USER REVIEW SCORE · REVIEWED ENTRIES','MEDIAN MAIN-STORY HOURS · POSITIVE ESTIMATES','PERCENT WITH AT LEAST ONE USER REVIEW'][i]}</div>${barChart(f.items,{format:f.format||fmt,maxItems:f.limit||12})}</div></section>`).join('');
}

async function initDashboard(){
  const status=document.getElementById('status');
  try {
    const data=await fetch('data/console_games.json').then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()});
    const ix=Object.fromEntries(data.columns.map((name,i)=>[name,i]));
    const rows=data.rows;
    const controls=['year','family','platform','genre'].map(id=>document.getElementById(id));
    const [yearSelect,familySelect,platformSelect,genreSelect]=controls;
    const hardwareAvailable=r=>!yearSelect.value||Number(yearSelect.value)>=(PLATFORM_LAUNCH_YEAR[r[ix.platform]]||2010);
    for(const el of [yearSelect,familySelect,genreSelect]) {
      const values=[...new Set(rows.map(r=>r[ix[el.id]]))].sort(el.id==='year'?(a,b)=>a-b:(a,b)=>String(a).localeCompare(String(b)));
      el.insertAdjacentHTML('beforeend',values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''));
    }
    function refreshPlatforms(){
      const previous=platformSelect.value;
      const available=[...new Set(rows.filter(r=>(!yearSelect.value||String(r[ix.year])===yearSelect.value)&&(!familySelect.value||r[ix.family]===familySelect.value)&&hardwareAvailable(r)).map(r=>r[ix.platform]))].sort((a,b)=>String(a).localeCompare(String(b)));
      platformSelect.innerHTML='<option value="">All platforms</option>'+available.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
      platformSelect.value=available.includes(previous)?previous:'';
    }
    for(const el of [yearSelect,familySelect])el.addEventListener('change',()=>{refreshPlatforms();render()});
    for(const el of [platformSelect,genreSelect])el.addEventListener('change',render);
    document.getElementById('measure').addEventListener('change',render);
    document.getElementById('breakdown').addEventListener('change',render);
    document.getElementById('reset').addEventListener('click',()=>{controls.forEach(el=>el.value='');refreshPlatforms();document.getElementById('measure').value='count';document.getElementById('breakdown').value='genre';render()});
    function summarize(rs){
      const scores=[],hours=[],ids=new Set(),multi=new Set();
      for(const r of rs){ids.add(r[ix.game_id]);if(r[ix.family_count]>1)multi.add(r[ix.game_id]);if(r[ix.review_score]!=null)scores.push(r[ix.review_score]);if(r[ix.main_hours]!=null)hours.push(r[ix.main_hours]);}
      return {count:rs.length,unique:ids.size,score:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,scoreN:scores.length,hours:median(hours),hoursN:hours.length,multi:ids.size?100*multi.size/ids.size:null};
    }
    function groups(rs,key){const buckets=new Map();for(const r of rs){const val=r[ix[key]];if(!buckets.has(val))buckets.set(val,[]);buckets.get(val).push(r)}return [...buckets].map(([label,entries])=>({label,...summarize(entries)}));}
    function render(){
      const filtered=rows.filter(r=>hardwareAvailable(r)&&controls.every(el=>!el.value||String(r[ix[el.id]])===el.value));
      const all=summarize(filtered), measure=document.getElementById('measure').value, by=document.getElementById('breakdown').value;
      status.textContent=`${fmt(filtered.length)} / ${fmt(rows.length)} entries shown`;
      document.getElementById('dash-headline').innerHTML=metric('CATALOG ENTRIES',fmt(all.count),'Game × platform')+metric('DISTINCT GAMES',fmt(all.unique),'Unique game IDs')+metric('AVG REVIEW SCORE',money(all.score),'Reviewed n = '+fmt(all.scoreN))+metric('MEDIAN MAIN HOURS',all.hours==null?'—':`${money(all.hours)} h`,'Hours n = '+fmt(all.hoursN));
      const scope=[yearSelect.value?`first released in ${yearSelect.value}`:'first released in 2010–2023',familySelect.value||'all console families',platformSelect.value||'all platforms',genreSelect.value?`${genreSelect.value} as primary genre`:'all primary genres'];
      document.getElementById('analysis-scope').textContent=scope.join(' · ');
      const insights=document.getElementById('analysis-insights');
      if(!all.count){
        insights.innerHTML=insight('NO MATCHES','Try a broader selection','This combination has no catalog entries. Clear a filter to see the comparisons and their sample sizes.');
      } else {
        const platformRanks=groups(filtered,'platform').sort((a,b)=>b.count-a.count);
        const genreRanks=groups(filtered,'genre').sort((a,b)=>b.count-a.count);
        const topPlatform=platformRanks[0],topGenre=genreRanks[0],extra=all.count-all.unique;
        const share=n=>money(100*n/all.count);
        const platformStory=platformRanks.length>1
          ?`${topPlatform.label} contributes ${fmt(topPlatform.count)} of ${fmt(all.count)} game–platform entries (${share(topPlatform.count)}%) within this selection. This is catalog coverage, not sales or console popularity.`
          :`All ${fmt(all.count)} entries are on ${topPlatform.label} in this selection. Clear the Platform or other filters to compare consoles; this slice alone cannot rank them.`;
        const genreComparison=genreRanks.length>1
          ?`, ${genreRanks[1].count===topGenre.count?'tied with':'ahead of'} ${genreRanks[1].label} at ${fmt(genreRanks[1].count)}`:'';
        const genreStory=genreRanks.length>1
          ?`${topGenre.label} accounts for ${fmt(topGenre.count)} entries (${share(topGenre.count)}%)${genreComparison}. Each game–platform row uses only its first listed genre.`
          :`All entries here have ${topGenre.label} as their recorded primary genre. The selected slice cannot show the wider genre mix; clear the Genre filter to compare it.`;
        const coverage=100*all.scoreN/all.count,hourCoverage=100*all.hoursN/all.count;
        insights.innerHTML=
          insight('01 / SCOPE',`${fmt(all.unique)} distinct games`,`${fmt(all.count)} game–platform entries ${extra?`include ${fmt(extra)} additional listings of games on selected consoles`:'each represent a distinct game in this selection'}. ${money(all.multi)}% of these distinct games appear in more than one console family in the full cleaned catalog.`)+
          insight('02 / PLATFORM',topPlatform.label,platformStory)+
          insight('03 / GENRE',topGenre.label,genreStory)+
          insight('04 / DATA COVERAGE',`${money(coverage)}% have a review`,`The average score uses ${fmt(all.scoreN)} of ${fmt(all.count)} entries; main-story hours use ${fmt(all.hoursN)} (${money(hourCoverage)}%). Missing values are excluded. Scores and hours belong to games, not separate platform-specific measurements.`);
      }
      const format=measure==='count'?fmt:measure==='hours'?(v=>`${money(v)} h`):(v=>money(v));
      const get=(key,limit)=>{
        let a=groups(filtered,key);a.sort(key==='year'?(a,b)=>Number(a.label)-Number(b.label):(a,b)=>b[measure]-a[measure]);
        return a.slice(0,limit).map(d=>({label:String(d.label),value:d[measure],color:COLORS[d.label]}));
      };
      document.getElementById('chart-year').innerHTML=barChart(get('year',40),{format,maxItems:40});
      document.getElementById('chart-family').innerHTML=barChart(get('family',3),{format,maxItems:3});
      document.getElementById('chart-platform').innerHTML=barChart(get('platform',8),{format,maxItems:8});
      document.getElementById('chart-breakdown').innerHTML=barChart(get(by,10),{format,maxItems:10});
      const familyCoverage=groups(filtered,'family').sort((a,b)=>['Nintendo','PlayStation','Xbox'].indexOf(a.label)-['Nintendo','PlayStation','Xbox'].indexOf(b.label));
      document.getElementById('coverage-family').innerHTML=familyCoverage.length?familyCoverage.map(d=>`<div class="coverage-row"><strong>${esc(d.label)}</strong><span>${fmt(d.count)} entries</span><span>Reviewed <b>${money(100*d.scoreN/d.count)}%</b> <small>(${fmt(d.scoreN)})</small></span><span>Hours <b>${money(100*d.hoursN/d.count)}%</b> <small>(${fmt(d.hoursN)})</small></span></div>`).join(''):'<p class="empty">No entries match these filters.</p>';
      const labels={year:'first release year',family:'console family',platform:'platform',genre:'primary genre'};
      document.getElementById('breakdown-title').textContent=`By ${labels[by]}`;
      document.getElementById('table-title').textContent=`By ${labels[by]}`;
      const data=groups(filtered,by).sort(by==='year'?(a,b)=>Number(a.label)-Number(b.label):(a,b)=>b.count-a.count);
      document.getElementById('table-count').textContent=`${fmt(data.length)} groups`;
      document.getElementById('numbers').innerHTML=data.length?data.map(d=>`<tr><th scope="row">${esc(d.label)}</th><td>${fmt(d.count)}</td><td>${fmt(d.unique)}</td><td>${money(d.score)}</td><td>${fmt(d.scoreN)}</td><td>${money(d.hours)}</td><td>${fmt(d.hoursN)}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">No entries match these filters.</td></tr>';
    }
    refreshPlatforms();
    render();
  } catch(error){status.textContent='Could not load the dataset';document.getElementById('chart-year').textContent=`Data load failed: ${error.message}`;}
}

if(document.getElementById('findings'))initReport().catch(e=>{document.getElementById('intro').textContent=`Data load failed: ${e.message}`});
if(document.getElementById('dash-headline'))initDashboard();
