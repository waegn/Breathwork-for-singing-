console.log("RTJ Breathwork loaded");

const fill = document.getElementById("breathFill");
const phaseLabel = document.getElementById("phaseLabel");
const sliders = ["inhale","hold","exhale","after"];
sliders.forEach(id=>{
  const s=document.getElementById(id);
  const v=document.getElementById(id+"Val");
  s.oninput=()=>v.textContent=s.value+"s";
});

let timer, running=false, phaseIndex=0, phaseTime=0, cycleTimer=0;
const phases=["Inhale","Hold","Exhale","Hold-after"];
const colors=["#66b3ff","#99e6ff","#66ffcc","#e6fff9"];

document.getElementById("startBtn").onclick=()=>{
  if(running) return;
  running=true;
  phaseIndex=0; phaseTime=0;
  nextPhase();
};
document.getElementById("stopBtn").onclick=()=>{running=false;clearTimeout(timer);};
document.getElementById("resetBtn").onclick=()=>{
  running=false;clearTimeout(timer);
  fill.style.width="0";phaseLabel.textContent="Ready";
};

// ---- PHASE LOOP ----
function nextPhase(){
  if(!running)return;
  const dur=getDur();
  const thisDur=dur[phaseIndex]*1000;
  phaseLabel.textContent=phases[phaseIndex];
  fill.style.background=colors[phaseIndex];
  animateBar(thisDur);
  timer=setTimeout(()=>{
    phaseIndex=(phaseIndex+1)%phases.length;
    if(phaseIndex===0) giveInsight(dur);
    nextPhase();
  },thisDur);
}

function getDur(){
  return sliders.map(id=>parseFloat(document.getElementById(id).value));
}

function animateBar(ms){
  fill.style.transition=`width ${ms/1000}s linear`;
  if(phases[phaseIndex]==="Inhale"){fill.style.width="100%";}
  else if(phases[phaseIndex]==="Exhale"){fill.style.width="0%";}
}

// ---- RTJ FEEDBACK ----
const feedback=document.getElementById("feedback");
function giveInsight(dur){
  const total=dur.reduce((a,b)=>a+b,0);
  let msg;
  if(total>16) msg="🛡 Shield thickening — calm sustained rhythm.";
  else if(total>10) msg="🌿 Steady cycle — system balanced.";
  else msg="⚡ Thermometer rising — slow down your breath.";
  feedback.textContent=msg;
}

// ---- CO2 HOLD TEST ----
let holdTimer,holdStart;
const holdDisplay=document.getElementById("holdTimer");
document.getElementById("startHold").onclick=()=>{
  holdStart=performance.now();
  holdDisplay.textContent="0.0 s";
  holdTimer=requestAnimationFrame(updateHold);
};
document.getElementById("stopHold").onclick=()=>{
  cancelAnimationFrame(holdTimer);
  const secs=parseFloat(holdDisplay.textContent);
  if(secs>25) feedback.textContent="🛡 High CO₂ tolerance — parasympathetic strength.";
  else if(secs>15) feedback.textContent="🌿 Good control — shield stable.";
  else feedback.textContent="⚡ Quick gasp — shield thin, try longer exhale practice.";
};
function updateHold(){
  const now=(performance.now()-holdStart)/1000;
  holdDisplay.textContent=now.toFixed(1)+" s";
  holdTimer=requestAnimationFrame(updateHold);
}
