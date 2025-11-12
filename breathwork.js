console.log("RTJ Breathwork Trainer loaded");

// Elements
const fill=document.getElementById("breathFill");
const phaseLabel=document.getElementById("phaseLabel");
const cycleBox=document.getElementById("cycleFeedback");
const co2Box=document.getElementById("co2Feedback");
const presetSelect=document.getElementById("presetSelect");
const presetInfo=document.getElementById("presetInfo");

// Preset definitions
const presets={
  nasal:{times:[4,2,6,2],
    info:"Gentle nasal breathing builds nitric-oxide rhythm and calms the system."},
  box:{times:[4,4,4,4],
    info:"Even 4-4-4-4 pattern for focus and balance."},
  co2:{times:[4,2,8,0],
    info:"Longer exhale builds CO₂ tolerance and parasympathetic strength."},
  release:{times:[5,0,7,2],
    info:"Soft belly expansion; relaxes the diaphragm."},
  custom:null
};

// Update sliders on preset change
presetSelect.onchange=()=>{
  const val=presetSelect.value;
  if(presets[val]){
    const t=presets[val].times;
    ["inhale","hold","exhale","after"].forEach((id,i)=>{
      document.getElementById(id).value=t[i];
      document.getElementById(id+"Val").textContent=t[i]+" s";
    });
    presetInfo.textContent=presets[val].info;
  }else{
    presetInfo.textContent="Set your own custom timings.";
  }
};

// Slider readouts
["inhale","hold","exhale","after"].forEach(id=>{
  const s=document.getElementById(id);
  const v=document.getElementById(id+"Val");
  s.oninput=()=>v.textContent=s.value+" s";
});

// Phase engine
const phases=["Inhale","Hold","Exhale","Hold-after"];
const colors=["var(--inhale)","var(--hold)","var(--exhale)","var(--after)"];
let running=false,phaseIndex=0,timer;

document.getElementById("startBtn").onclick=()=>{
  if(running) return;
  running=true;phaseIndex=0;nextPhase();
};
document.getElementById("stopBtn").onclick=()=>{running=false;clearTimeout(timer);};
document.getElementById("resetBtn").onclick=()=>{
  running=false;clearTimeout(timer);
  fill.style.width="0";phaseLabel.textContent="Ready";
};

// Cycle loop
function nextPhase(){
  if(!running)return;
  const durations=["inhale","hold","exhale","after"].map(id=>+document.getElementById(id).value);
  const ms=durations[phaseIndex]*1000;
  phaseLabel.textContent=phases[phaseIndex];
  fill.style.background=colors[phaseIndex];
  animate(ms,phaseIndex);
  timer=setTimeout(()=>{
    phaseIndex=(phaseIndex+1)%phases.length;
    if(phaseIndex===0)giveFeedback(durations);
    nextPhase();
  },ms);
}

function animate(ms,idx){
  fill.style.transition=`width ${ms/1000}s linear`;
  if(phases[idx]==="Inhale")fill.style.width="100%";
  if(phases[idx]==="Exhale")fill.style.width="0%";
}

// RTJ feedback
function giveFeedback(dur){
  const total=dur.reduce((a,b)=>a+b,0);
  let msg;
  if(total>16)msg="🛡 Shield thickening — slow, steady rhythm.";
  else if(total>10)msg="🌿 Balanced cycle — system centred.";
  else msg="⚡ Thermometer rising — lengthen your exhale.";
  cycleBox.textContent=msg;
}

// CO₂ hold
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
  let msg;
  if(secs>25)msg="🛡 High CO₂ tolerance — shield strong.";
  else if(secs>15)msg="🌿 Good control — steady progress.";
  else msg="⚡ Quick gasp — try longer exhales tomorrow.";
  co2Box.textContent=msg;
};
function updateHold(){
  const now=(performance.now()-holdStart)/1000;
  holdDisplay.textContent=now.toFixed(1)+" s";
  holdTimer=requestAnimationFrame(updateHold);
}
