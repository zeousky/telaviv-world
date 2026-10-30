(()=>{
const videos=[...document.querySelectorAll('.corner-video')];
const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
let version=0;
const photos=['/assets/bibi-portrait.jpg','/assets/bibi-throwback.jpg'];
const grid=document.getElementById('bibi-grid'),counter=document.getElementById('bibi-count');
let count=0;
function addBibis(amount){
 const captions=['BIBI.EXE','STILL BIBI','BONUS BIBI','SPIN DOCTOR','ONE MORE','BIBI AGAIN'];
 for(let j=0;j<amount&&count<60;j++){
  const figure=document.createElement('figure');figure.className='bibi-tile';figure.style.setProperty('--i',String(count));
  const image=document.createElement('img');image.src=photos[count%2];image.alt='Benjamin Netanyahu, Bibi number '+(count+1);image.loading='lazy';image.width=150;image.height=150;
  const caption=document.createElement('figcaption');caption.textContent=captions[count%captions.length]+' #'+String(count+1).padStart(2,'0');figure.append(image,caption);grid.append(figure);count++;
 }
 counter.textContent=count+' Bibis in containment. Situation: questionable.';
 if(count===60){document.getElementById('more-bibis').disabled=true;counter.textContent='60 Bibis. Maximum containment reached.';}
}
addBibis(24);document.getElementById('more-bibis').addEventListener('click',()=>addBibis(12));
for(let i=0;i<10;i++){
 const image=document.createElement('img');image.src=photos[i%2];image.alt='';image.className='flying-bibi';image.style.setProperty('--flight',(16+i%4*3)+'s');image.style.setProperty('--delay',(-i*2.9)+'s');image.style.setProperty('--lane',(8+i*9)+'%');document.getElementById('bibi-sky').append(image);
}
// Two identical halves make the conveyor loop without a jump.
for(let i=0;i<24;i++){const image=document.createElement('img');image.src=photos[i%2];image.alt='';document.getElementById('bibi-train').append(image);}
function mute(){
 version++;videos.forEach(video=>{video.muted=true;});
}
function isPaused(){return document.body.classList.contains('paused')||preference.matches;}
async function playCorners(){
 if(isPaused()||document.hidden)return;
 const attempt=++version;
 // Only one copy carries sound, avoiding four overlapping soundtracks.
 videos.forEach(video=>{video.muted=true;video.volume=.55;});
 videos[0].muted=false;
 try{await videos[0].play();}catch{
  if(attempt!==version)return;
  videos[0].muted=true;
  void videos[0].play().catch(()=>{});
 }
 if(attempt===version)videos.slice(1).forEach(video=>void video.play().catch(()=>{}));
}
function syncMotion(){
 if(isPaused()){videos.forEach(video=>video.pause());mute();}
 else if(!document.hidden)void playCorners();
}
document.getElementById('start-alarm').addEventListener('click',()=>document.dispatchEvent(new Event('start-alarms')));
document.getElementById('motion').addEventListener('click',syncMotion);
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{if(videos[0].muted&&!isPaused())void playCorners();});
document.addEventListener('stop-clip-audio',mute);
document.addEventListener('keydown',event=>{if(event.key==='Escape')mute();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){mute();videos.forEach(video=>video.pause());}else syncMotion();});
window.addEventListener('pagehide',()=>{mute();videos.forEach(video=>video.pause());});preference.addEventListener('change',syncMotion);
syncMotion();
})();
