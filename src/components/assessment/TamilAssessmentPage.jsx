import { useState, useRef, useCallback, useEffect } from 'react';
import { ALL_TAMIL_LETTERS, assessPronunciation, shuffleArray } from '../../constants/tamilLetters';

const MAX_RECORD_MS = 6000;
const LETTER_SETS = [
  { id: 'all',        en: 'All letters',    ta: 'அனைத்தும்', count: 246, filter: () => true },
  { id: 'vowels',     en: 'Vowels',         ta: 'உயிர்',      count: 12,  filter: l => l.group === 'vowel' },
  { id: 'consonants', en: 'Consonants',     ta: 'மெய்',       count: 18,  filter: l => l.group === 'consonant' },
  { id: 'combined',   en: 'Combinations',   ta: 'உயிர்மெய்', count: 216, filter: l => l.group === 'combined' },
];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function PulsingDot({ active }) {
  return <span className={`inline-block w-3 h-3 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />;
}
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
function Badge({ correct }) {
  if (correct === null || correct === undefined) return null;
  return correct
    ? <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">✅ Correct</span>
    : <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">❌ Incorrect</span>;
}
function AutoToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
        value ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'
      }`}
    >
      {value ? '🤖 Auto-assess ON' : '👨‍🏫 Manual mode'}
    </button>
  );
}

// ── Setup ─────────────────────────────────────────────────────────────────────
function SetupView({ onStart }) {
  const [name, setName]           = useState('');
  const [setId, setSetId]         = useState('all');
  const [autoAssess, setAuto]     = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="text-3xl font-black text-gray-800">Tamil Letter</h2>
          <h2 className="text-3xl font-black text-orange-500">Pronunciation Test</h2>
          <p className="text-gray-500 mt-2 text-sm">Teacher-controlled oral assessment · Web Speech API</p>
        </div>

        {/* Student name */}
        <label className="block mb-5">
          <span className="block text-sm font-bold text-gray-600 mb-1">Student Name</span>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter student name…"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-400 transition"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onStart(name.trim(), setId, autoAssess)}
          />
        </label>

        {/* Letter set */}
        <div className="mb-5">
          <span className="block text-sm font-bold text-gray-600 mb-1">Letters to Test</span>
          <div className="grid grid-cols-2 gap-2">
            {LETTER_SETS.map(s => (
              <button key={s.id} onClick={() => setSetId(s.id)}
                className={`px-4 py-2.5 rounded-xl border-2 transition-all text-left ${
                  setId === s.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-300'
                }`}>
                <div className="font-bold text-sm leading-tight">{s.en}</div>
                <div className="font-semibold text-xs opacity-75" style={{ fontFamily: 'Noto Sans Tamil, serif' }}>
                  {s.ta} ({s.count})
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Assessment mode toggle */}
        <div className="mb-8 rounded-2xl border-2 border-gray-100 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-gray-700">
              {autoAssess ? '🤖 Auto-assess (recommended)' : '👨‍🏫 Manual mode'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {autoAssess
                ? 'STT suggests a result; teacher can override'
                : 'Teacher decides every result — no auto-scoring'}
            </p>
          </div>
          <button
            onClick={() => setAuto(v => !v)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 focus:outline-none
              ${autoAssess ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200
              ${autoAssess ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <button
          disabled={!name.trim()}
          onClick={() => onStart(name.trim(), setId, autoAssess)}
          className="w-full py-4 rounded-2xl text-lg font-black text-white bg-orange-500
                     hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
        >
          🚀 Start Assessment
        </button>
        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          Allow microphone access when prompted · Works best in Chrome / Edge<br />
          Cards appear in random order · Teacher controls the pace
        </p>
      </div>
    </div>
  );
}

// ── FlashCard ─────────────────────────────────────────────────────────────────
function FlashCard({ letter, flipping }) {
  const gc = {
    vowel:     { bg: 'bg-blue-50',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
    consonant: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    combined:  { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  }[letter.group] || {};
  return (
    <div className={`w-full max-w-sm mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center
      ${gc.bg} border-4 border-white transition-all duration-300 select-none
      ${flipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`} style={{ minHeight: 280 }}>
      <span className={`text-9xl font-black leading-none ${gc.text}`} style={{ fontFamily: 'Noto Sans Tamil, serif' }}>
        {letter.char}
      </span>
      <span className="text-xl font-mono text-gray-400 mt-4 tracking-widest">{letter.romanized}</span>
      <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${gc.badge}`}>{letter.groupLabel}</span>
    </div>
  );
}

// ── Record Panel ──────────────────────────────────────────────────────────────
function RecordPanel({ recState, transcript, result, autoAssess, onStart, onStop, supported }) {
  const label = { idle: '🎤 Ready to record', recording: '🔴 Listening…', processing: '⏳ Processing…', done: '✔ Done' }[recState];

  if (!supported)
    return (
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-center text-sm text-yellow-700">
        ⚠️ Speech recognition not supported in this browser. Use Chrome or Edge.<br />
        Audio is still recorded for manual review.
      </div>
    );

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <PulsingDot active={recState === 'recording'} />
          {label}
        </div>
        {(recState === 'idle' || recState === 'done') && (
          <button onClick={onStart}
            className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all active:scale-95 shadow">
            🎤 Record
          </button>
        )}
        {recState === 'recording' && (
          <button onClick={onStop}
            className="px-4 py-1.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold transition-all active:scale-95 shadow">
            ⏹ Stop
          </button>
        )}
      </div>

      {transcript && (
        <div className="bg-white rounded-xl px-4 py-2 border border-gray-200">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Heard: </span>
          <span className="text-base font-semibold text-gray-800">{transcript}</span>
        </div>
      )}

      {recState === 'done' && (
        <div className="flex flex-col items-center gap-1">
          {autoAssess && result !== null
            ? <div className="flex items-center gap-2"><Badge correct={result} /><span className="text-xs text-gray-400">auto-assessed · teacher can override</span></div>
            : <p className="text-sm font-semibold text-amber-600 bg-amber-50 rounded-xl py-2 px-4 text-center">👆 Mark correct or wrong below</p>
          }
        </div>
      )}
    </div>
  );
}

// ── Teacher Panel ─────────────────────────────────────────────────────────────
function TeacherPanel({ recState, result, autoAssess, currentIdx, totalLetters, answeredCount, onRetake, onNext, onOverrideCorrect, onOverrideWrong, onEnd }) {
  // In manual mode, teacher must mark before advancing
  const canAdvance = recState === 'done' && (autoAssess ? true : result !== null);
  return (
    <div className="rounded-2xl bg-white border-2 border-gray-200 p-5 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Teacher Controls</h3>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onRetake}
          disabled={recState === 'recording' || recState === 'processing'}
          className="py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm transition-all active:scale-95 disabled:opacity-40">
          🔁 Retake
        </button>
        <button onClick={onNext}
          disabled={!canAdvance}
          title={!canAdvance && !autoAssess && recState === 'done' ? 'Mark correct or wrong first' : ''}
          className="py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-40 shadow">
          Next ▶
        </button>
      </div>

      {recState === 'done' && (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverrideCorrect}
            className={`py-2 rounded-xl text-sm font-bold transition-all active:scale-95
              ${result === true ? 'bg-green-500 text-white shadow' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'}`}>
            ✅ Mark Correct
          </button>
          <button onClick={onOverrideWrong}
            className={`py-2 rounded-xl text-sm font-bold transition-all active:scale-95
              ${result === false ? 'bg-red-500 text-white shadow' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'}`}>
            ❌ Mark Wrong
          </button>
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-500 font-semibold pt-1">
        <span>Card {currentIdx + 1} / {totalLetters}</span>
        <span>Answered: {answeredCount}</span>
      </div>

      <button onClick={onEnd}
        disabled={recState === 'recording' || recState === 'processing'}
        className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-all active:scale-95 disabled:opacity-40">
        ⏹ End Test
      </button>
    </div>
  );
}

// ── Testing View ──────────────────────────────────────────────────────────────
function TestingView({ studentName, letterQueue, currentIdx, results, autoAssess: initAutoAssess, onRetake, onNext, onEnd, onSaveResult, onOverride }) {
  const [recState, setRecState]       = useState('idle');
  const [transcript, setTranscript]   = useState('');
  const [currentResult, setResult]    = useState(null);
  const [flipping, setFlipping]       = useState(false);
  const [sttOk, setSttOk]             = useState(true);
  const [autoAssess, setAutoAssess]   = useState(initAutoAssess);

  const mrRef           = useRef(null);
  const recRef          = useRef(null);
  const chunksRef       = useRef([]);
  const timerRef        = useRef(null);
  const txRef           = useRef('');
  const idxRef          = useRef(currentIdx);
  const autoRef         = useRef(initAutoAssess);

  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { autoRef.current = autoAssess; }, [autoAssess]);

  // Reset on card change
  useEffect(() => {
    setRecState('idle');
    setTranscript('');
    setResult(null);
    txRef.current = '';
  }, [currentIdx]);

  const letter = letterQueue[currentIdx];

  // ── stopRecording: stops recognition; mr is stopped inside rec.onend ────────
  const stopRecording = useCallback(() => {
    clearTimeout(timerRef.current);
    setRecState('processing');
    if (recRef.current) {
      try { recRef.current.stop(); } catch (_) {}
      // mr.stop() will be called from rec.onend — see startRecording
    } else {
      // No STT — stop mr directly
      if (mrRef.current?.state !== 'inactive') mrRef.current.stop();
    }
  }, []);

  // ── startRecording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (recState === 'recording') return;
    setTranscript('');
    txRef.current = '';

    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { alert('Microphone access denied. Please allow access and try again.'); return; }

    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
    mrRef.current = mr;

    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };

    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      recRef.current = null;

      const blob    = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url     = URL.createObjectURL(blob);
      const tx      = txRef.current;
      const idx     = idxRef.current;
      const ltr     = letterQueue[idx];
      // Auto-assess only when enabled; otherwise null = pending teacher decision
      const correct = autoRef.current ? assessPronunciation(tx, ltr) : null;

      setResult(correct);
      setRecState('done');

      const reader = new FileReader();
      reader.onload = ev => onSaveResult(idx, {
        letter: ltr, transcript: tx,
        audioUrl: url, audioDataUrl: ev.target.result,
        correct, wasOverridden: false,
      });
      reader.readAsDataURL(blob);
    };

    // Speech recognition — en-US for reliable short-syllable recognition
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = 'en-US';          // ← en-US: far more reliable for short phonemes
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = ev => {
        const tx = Array.from(ev.results)
          .filter(r => r.isFinal || r[0])
          .map(r => r[0].transcript)
          .join('');
        setTranscript(tx);
        txRef.current = tx;
      };
      rec.onerror = () => {};

      // ← KEY FIX: stop MediaRecorder only AFTER recognition has fully ended
      rec.onend = () => {
        if (mrRef.current?.state !== 'inactive') mrRef.current.stop();
      };

      recRef.current = rec;
      try { rec.start(); } catch (_) {
        setSttOk(false);
        recRef.current = null;
      }
    } else {
      setSttOk(false);
    }

    // If no STT, mr.stop() is called directly from stopRecording
    if (!recRef.current) {
      // override onend to never fire — mr.stop() handled in stopRecording
    }

    mr.start();
    setRecState('recording');
    timerRef.current = setTimeout(stopRecording, MAX_RECORD_MS);
  }, [recState, letterQueue, stopRecording, onSaveResult]);

  const handleNext = () => {
    setFlipping(true);
    setTimeout(() => { onNext(); setFlipping(false); }, 250);
  };
  const handleRetake = () => {
    setFlipping(true);
    setTimeout(() => { onRetake(); setFlipping(false); }, 250);
  };
  const handleOverrideCorrect = () => { setResult(true);  onOverride(currentIdx, true); };
  const handleOverrideWrong   = () => { setResult(false); onOverride(currentIdx, false); };

  const answered = Object.keys(results).length;
  const correct  = Object.values(results).filter(r => r.correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-black text-gray-800">{studentName}</span>
              <span className="text-xs text-gray-400 ml-2 font-semibold">{answered} answered · {correct} correct</span>
            </div>
            <div className="flex items-center gap-2">
              <AutoToggle value={autoAssess} onChange={setAutoAssess} />
              <span className="text-sm font-bold text-orange-600">{currentIdx + 1} / {letterQueue.length}</span>
            </div>
          </div>
          <ProgressBar current={answered} total={letterQueue.length} />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        <FlashCard letter={letter} flipping={flipping} />
        <RecordPanel
          recState={recState} transcript={transcript} result={currentResult}
          autoAssess={autoAssess} onStart={startRecording} onStop={stopRecording} supported={sttOk}
        />
        <TeacherPanel
          recState={recState} result={currentResult} autoAssess={autoAssess}
          currentIdx={currentIdx} totalLetters={letterQueue.length} answeredCount={answered}
          onRetake={handleRetake} onNext={handleNext}
          onOverrideCorrect={handleOverrideCorrect} onOverrideWrong={handleOverrideWrong}
          onEnd={onEnd}
        />
      </div>
    </div>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function CompleteView({ studentName, letterQueue, results, onNewStudent }) {
  const answered = Object.keys(results).length;
  const correct  = Object.values(results).filter(r => r.correct).length;
  const wrong    = answered - correct;
  const pct      = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const grade    = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
  const gradeCl  = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';

  const downloadReport = () => {
    const headers = ['#', 'Tamil Letter', 'Romanized', 'Group', 'What Was Heard', 'Result', 'Overridden'];
    const rows = letterQueue.map((letter, idx) => {
      const r = results[idx];
      if (!r) return [idx + 1, letter.char, letter.romanized, letter.group, '—', 'Not tested', '—'];
      return [idx + 1, letter.char, letter.romanized, letter.group, r.transcript || '(none)', r.correct ? 'Correct' : 'Wrong', r.wasOverridden ? 'Yes' : 'No'];
    });
    const summary = [
      ['Student', studentName], ['Date', new Date().toLocaleString()],
      ['Total', letterQueue.length], ['Answered', answered],
      ['Correct', correct], ['Wrong', wrong], ['Score', `${pct}%`], ['Grade', grade],
      [], headers, ...rows,
    ];
    const csv  = summary.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a    = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tamil-assessment-${studentName}-${new Date().toISOString().slice(0,10)}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const downloadAudios = () => {
    const entries = Object.entries(results).filter(([,r]) => r.audioDataUrl).map(([i,r]) => ({ idx:+i, ...r })).sort((a,b) => a.idx - b.idx);
    if (!entries.length) { alert('No audio recordings found.'); return; }

    // Embedded JS runs inside the downloaded HTML — handles sequential playback
    // and on-demand WAV stitching using Web Audio API (no size limit, no deps)
    const embeddedScript = `
function playAll(){
  const clips=document.querySelectorAll('.clip');
  const btn=document.getElementById('play-btn');
  let i=0;
  btn.disabled=true; btn.textContent='⏸ Playing…';
  const next=()=>{
    if(i>=clips.length){btn.disabled=false;btn.textContent='▶ Play Full Session';return;}
    const card=clips[i]; card.scrollIntoView({behavior:'smooth',block:'nearest'});
    card.style.outline='3px solid #ea580c';
    const a=card.querySelector('audio'); i++;
    a.play(); a.onended=()=>{card.style.outline='';next();};
  };
  next();
}
function encWAV(buf){
  const sr=buf.sampleRate,len=buf.length,ab=new ArrayBuffer(44+len*2),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,36+len*2,true);ws(8,'WAVE');
  ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);
  ws(36,'data');v.setUint32(40,len*2,true);
  const d=buf.getChannelData(0);let o=44;
  for(let i=0;i<len;i++){const s=Math.max(-1,Math.min(1,d[i]));v.setInt16(o,s<0?s*0x8000:s*0x7FFF,true);o+=2;}
  return new Blob([ab],{type:'audio/wav'});
}
async function dlStitched(){
  const btn=document.getElementById('stitch-btn');
  btn.disabled=true;btn.textContent='⏳ Processing…';
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const srcs=[...document.querySelectorAll('.clip audio')].map(a=>a.src);
    const bufs=await Promise.all(srcs.map(async s=>{
      const r=await fetch(s),ab=await r.arrayBuffer();
      return ctx.decodeAudioData(ab);
    }));
    const rate=bufs[0].sampleRate,gap=Math.floor(rate*0.35);
    const total=bufs.reduce((s,b)=>s+b.length+gap,0);
    const out=ctx.createBuffer(1,total,rate);
    const ch=out.getChannelData(0);let off=0;
    for(const b of bufs){ch.set(b.getChannelData(0),off);off+=b.length+gap;}
    await ctx.close();
    const wav=encWAV(out);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(wav);a.download='full-session-stitched.wav';a.click();
    btn.disabled=false;btn.textContent='⬇ Download Stitched WAV';
  }catch(e){btn.disabled=false;btn.textContent='⚠ Error: '+e.message;}
}`;

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Recordings — ${studentName}</title>
<style>
body{font-family:sans-serif;max-width:820px;margin:2rem auto;padding:1rem;background:#fffbf0}
h1{color:#ea580c}
.toolbar{display:flex;gap:.75rem;flex-wrap:wrap;margin:1rem 0;padding:1rem;
  background:#fff;border-radius:14px;border:1px solid #e5e7eb;align-items:center}
.toolbar button{padding:.5rem 1.2rem;border-radius:999px;border:none;cursor:pointer;
  font-weight:700;font-size:.9rem;transition:opacity .15s}
.toolbar button:disabled{opacity:.5;cursor:not-allowed}
#play-btn{background:#ea580c;color:#fff}
#stitch-btn{background:#7c3aed;color:#fff}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;
  margin:.5rem 0;display:flex;align-items:center;gap:1rem;transition:outline .1s}
.letter{font-size:2.5rem;font-family:'Noto Sans Tamil',serif;min-width:60px;text-align:center}
.info{flex:1}
.badge{padding:.2rem .6rem;border-radius:999px;font-size:.75rem;font-weight:700}
.c{background:#dcfce7;color:#15803d}.w{background:#fee2e2;color:#dc2626}
.heard{font-size:.8rem;color:#9ca3af;margin-top:.2rem}
audio{height:36px}
</style></head>
<body>
<h1>🎓 Tamil Assessment Recordings</h1>
<p><strong>Student:</strong> ${studentName} &nbsp;<strong>Date:</strong> ${new Date().toLocaleString()}</p>
<p><strong>Score:</strong> ${correct}/${answered} (${pct}%) — Grade: ${grade}</p>
<div class="toolbar">
  <span style="font-weight:700;color:#6b7280">${entries.length} recordings</span>
  <button id="play-btn" onclick="playAll()">▶ Play Full Session</button>
  <button id="stitch-btn" onclick="dlStitched()">⬇ Download Stitched WAV</button>
</div>
<hr/>
${entries.map(({letter:l, transcript:tx, audioDataUrl:src, correct:cor}) =>
  `<div class="card clip"><div class="letter">${l.char}</div><div class="info">
  <div><strong>${l.romanized}</strong> <span style="color:#6b7280;font-size:.85rem">${l.group}</span></div>
  <div class="heard">Heard: ${tx||'(none)'}</div>
  <span class="badge ${cor?'c':'w'}">${cor?'✅ Correct':'❌ Wrong'}</span></div>
  <audio class="clip-audio" controls src="${src}"></audio></div>`).join('\n')}
<script>${embeddedScript}<\/script>
</body></html>`;

    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
      download: `audio-recordings-${studentName}-${new Date().toISOString().slice(0,10)}.html`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const groups = [
    { key: 'vowel',     label: 'உயிர் (Vowels)',             colorBg: 'bg-blue-50',   colorTx: 'text-blue-700',   colorBd: 'border-blue-200' },
    { key: 'consonant', label: 'மெய் (Consonants)',          colorBg: 'bg-purple-50', colorTx: 'text-purple-700', colorBd: 'border-purple-200' },
    { key: 'combined',  label: 'உயிர்மெய் (Combinations)', colorBg: 'bg-orange-50', colorTx: 'text-orange-700', colorBd: 'border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">Assessment Complete!</h2>
          <p className="text-gray-500 mb-6">{studentName} · {new Date().toLocaleDateString()}</p>
          <div className="flex justify-center gap-8 mb-6">
            <div><div className={`text-6xl font-black ${gradeCl}`}>{grade}</div><div className="text-sm text-gray-400 font-semibold">Grade</div></div>
            <div><div className={`text-6xl font-black ${gradeCl}`}>{pct}%</div><div className="text-sm text-gray-400 font-semibold">Score</div></div>
          </div>
          <div className="flex justify-center gap-6 text-sm font-semibold mb-6">
            <span className="text-green-600">✅ Correct: {correct}</span>
            <span className="text-red-500">❌ Wrong: {wrong}</span>
            <span className="text-gray-400">⏭ Not tested: {letterQueue.length - answered}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={downloadReport} className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all active:scale-95 shadow-md">📄 Download Report (CSV)</button>
            <button onClick={downloadAudios} className="px-6 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all active:scale-95 shadow-md">🎵 Download Audio Recordings</button>
            <button onClick={onNewStudent} className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all active:scale-95 shadow-md">👤 Next Student</button>
          </div>
        </div>

        {groups.map(g => {
          const gLetters = letterQueue.map((l, idx) => ({ l, idx })).filter(({ l }) => l.group === g.key);
          if (!gLetters.length) return null;
          return (
            <div key={g.key} className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-black text-gray-700 mb-3 text-sm uppercase tracking-wide">{g.label} ({gLetters.length})</h3>
              <div className="flex flex-wrap gap-2">
                {gLetters.map(({ l, idx }) => {
                  const r   = results[idx];
                  const bg  = r ? (r.correct ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300') : `${g.colorBg} ${g.colorBd}`;
                  const tx  = r ? (r.correct ? 'text-green-700' : 'text-red-700') : g.colorTx;
                  return (
                    <div key={l.id} title={`${l.char} (${l.romanized})${r ? ' — ' + (r.transcript || 'no audio') : ''}`}
                      className={`border rounded-xl px-2 py-1.5 text-center cursor-default hover:scale-110 transition-all ${bg}`}
                      style={{ minWidth: 48 }}>
                      <div className={`text-lg font-bold leading-none ${tx}`} style={{ fontFamily: 'Noto Sans Tamil, serif' }}>{l.char}</div>
                      <div className="text-xs">{r ? (r.correct ? '✅' : '❌') : '·'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
const TamilAssessmentPage = () => {
  const [phase, setPhase]         = useState('setup');
  const [studentName, setName]    = useState('');
  const [letterQueue, setQueue]   = useState([]);
  const [currentIdx, setIdx]      = useState(0);
  const [results, setResults]     = useState({});
  const [autoAssess, setAuto]     = useState(true);

  const handleStart = (name, setId, auto) => {
    const filter = LETTER_SETS.find(s => s.id === setId)?.filter ?? (() => true);
    setName(name);
    setQueue(shuffleArray(ALL_TAMIL_LETTERS.filter(filter)));
    setIdx(0);
    setResults({});
    setAuto(auto);
    setPhase('testing');
  };

  const handleSaveResult = useCallback((idx, data) => setResults(p => ({ ...p, [idx]: data })), []);
  const handleOverride   = useCallback((idx, correct) =>
    setResults(p => p[idx] ? { ...p, [idx]: { ...p[idx], correct, wasOverridden: true } } : p), []);
  const handleNext       = useCallback(() =>
    setIdx(i => { const n = i + 1; if (n >= letterQueue.length) { setPhase('complete'); return i; } return n; }),
    [letterQueue.length]);
  const handleRetake     = useCallback(() => setResults(p => { const n = { ...p }; delete n[currentIdx]; return n; }), [currentIdx]);
  const handleEnd        = () => setPhase('complete');
  const handleNewStudent = () => { setPhase('setup'); setName(''); setQueue([]); setIdx(0); setResults({}); };

  if (phase === 'setup')    return <SetupView onStart={handleStart} />;
  if (phase === 'complete') return <CompleteView studentName={studentName} letterQueue={letterQueue} results={results} onNewStudent={handleNewStudent} />;
  return (
    <TestingView
      studentName={studentName} letterQueue={letterQueue} currentIdx={currentIdx}
      results={results} autoAssess={autoAssess}
      onNext={handleNext} onRetake={handleRetake} onEnd={handleEnd}
      onSaveResult={handleSaveResult} onOverride={handleOverride}
    />
  );
};

export default TamilAssessmentPage;
