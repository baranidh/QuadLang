import { useState, useRef, useCallback, useEffect } from 'react';
import { ALL_TAMIL_LETTERS, assessPronunciation, shuffleArray } from '../../constants/tamilLetters';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_RECORD_MS = 6000;
const LETTER_SETS = [
  { id: 'all',        en: 'All letters',    ta: 'அனைத்தும்',  count: 246, filter: () => true },
  { id: 'vowels',     en: 'Vowels',         ta: 'உயிர்',       count: 12,  filter: l => l.group === 'vowel' },
  { id: 'consonants', en: 'Consonants',     ta: 'மெய்',        count: 18,  filter: l => l.group === 'consonant' },
  { id: 'combined',   en: 'Combinations',   ta: 'உயிர்மெய்',  count: 216, filter: l => l.group === 'combined' },
];

// ─── Tiny sub-components ─────────────────────────────────────────────────────

function PulsingDot({ active }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-orange-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Badge({ correct }) {
  if (correct === null) return null;
  return correct
    ? <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">✅ Correct</span>
    : <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">❌ Incorrect</span>;
}

// ─── Setup view ───────────────────────────────────────────────────────────────
function SetupView({ onStart }) {
  const [name, setName] = useState('');
  const [setId, setSetId] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="text-3xl font-black text-gray-800">Tamil Letter</h2>
          <h2 className="text-3xl font-black text-orange-500">Pronunciation Test</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Teacher-controlled oral assessment · Web Speech API
          </p>
        </div>

        {/* Student name */}
        <label className="block mb-5">
          <span className="block text-sm font-bold text-gray-600 mb-1">Student Name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter student name…"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-400 transition"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onStart(name.trim(), setId)}
          />
        </label>

        {/* Letter set selector */}
        <label className="block mb-8">
          <span className="block text-sm font-bold text-gray-600 mb-1">Letters to Test</span>
          <div className="grid grid-cols-2 gap-2">
            {LETTER_SETS.map(s => (
              <button
                key={s.id}
                onClick={() => setSetId(s.id)}
                className={`px-4 py-2.5 rounded-xl border-2 transition-all text-left
                  ${setId === s.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
              >
                <div className="font-bold text-sm leading-tight">{s.en}</div>
                <div className="font-semibold text-xs opacity-75"
                     style={{ fontFamily: 'Noto Sans Tamil, serif' }}>
                  {s.ta} ({s.count})
                </div>
              </button>
            ))}
          </div>
        </label>

        {/* Start button */}
        <button
          disabled={!name.trim()}
          onClick={() => onStart(name.trim(), setId)}
          className="w-full py-4 rounded-2xl text-lg font-black text-white bg-orange-500
                     hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all shadow-lg active:scale-95"
        >
          🚀 Start Assessment
        </button>

        {/* Info note */}
        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          Allow microphone access when prompted · Works best in Chrome / Edge<br/>
          Cards appear in random order · Teacher controls the pace
        </p>
      </div>
    </div>
  );
}

// ─── Flashcard view ───────────────────────────────────────────────────────────
function FlashCard({ letter, flipping }) {
  const groupColors = {
    vowel:     { bg: 'bg-blue-50',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700' },
    consonant: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    combined:  { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  };
  const c = groupColors[letter.group] || groupColors.combined;

  return (
    <div className={`
      w-full max-w-sm mx-auto rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center
      ${c.bg} border-4 border-white
      transition-all duration-300 ${flipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
      select-none
    `} style={{ minHeight: 280 }}>
      <span className={`text-9xl font-black leading-none ${c.text}`}
            style={{ fontFamily: 'Noto Sans Tamil, serif' }}>
        {letter.char}
      </span>
      <span className="text-xl font-mono text-gray-400 mt-4 tracking-widest">
        {letter.romanized}
      </span>
      <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>
        {letter.groupLabel}
      </span>
    </div>
  );
}

// ─── Recording / transcript panel ─────────────────────────────────────────────
function RecordPanel({ recState, transcript, result, onStart, onStop, supported }) {
  const stateLabel = {
    idle:       '🎤 Ready to record',
    recording:  '🔴 Listening…',
    processing: '⏳ Processing…',
    done:       '✔ Recording done',
  }[recState] || '🎤 Ready';

  if (!supported) {
    return (
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-center text-sm text-yellow-700">
        ⚠️ Speech recognition is not supported in this browser.<br/>
        Use Chrome or Edge for full functionality.<br/>
        Audio recording is still available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-3">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          <PulsingDot active={recState === 'recording'} />
          {stateLabel}
        </div>
        {recState === 'idle' || recState === 'done' ? (
          <button
            onClick={onStart}
            className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold
                       transition-all active:scale-95 shadow"
          >
            🎤 Record
          </button>
        ) : recState === 'recording' ? (
          <button
            onClick={onStop}
            className="px-4 py-1.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white text-sm font-bold
                       transition-all active:scale-95 shadow"
          >
            ⏹ Stop
          </button>
        ) : null}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-white rounded-xl px-4 py-2 border border-gray-200">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Heard: </span>
          <span className="text-base font-semibold text-gray-800">{transcript}</span>
        </div>
      )}

      {/* Result badge */}
      {recState === 'done' && <div className="flex justify-center"><Badge correct={result} /></div>}
    </div>
  );
}

// ─── Teacher control panel ────────────────────────────────────────────────────
function TeacherPanel({
  recState, result, currentIdx, totalLetters, answeredCount,
  onRetake, onNext, onOverrideCorrect, onOverrideWrong, onEnd,
}) {
  const canAdvance = recState === 'done';
  return (
    <div className="rounded-2xl bg-white border-2 border-gray-200 p-5 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Teacher Controls</h3>

      {/* Main action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onRetake}
          className="py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-sm
                     transition-all active:scale-95 disabled:opacity-40"
          disabled={recState === 'recording' || recState === 'processing'}
        >
          🔁 Retake
        </button>
        <button
          onClick={onNext}
          disabled={!canAdvance || currentIdx >= totalLetters - 1}
          className="py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm
                     transition-all active:scale-95 disabled:opacity-40 shadow"
        >
          Next ▶
        </button>
      </div>

      {/* Override buttons — only visible after recording */}
      {recState === 'done' && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOverrideCorrect}
            className={`py-2 rounded-xl text-sm font-bold transition-all active:scale-95
              ${result === true
                ? 'bg-green-500 text-white shadow'
                : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'}`}
          >
            ✅ Mark Correct
          </button>
          <button
            onClick={onOverrideWrong}
            className={`py-2 rounded-xl text-sm font-bold transition-all active:scale-95
              ${result === false
                ? 'bg-red-500 text-white shadow'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'}`}
          >
            ❌ Mark Wrong
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="flex justify-between text-xs text-gray-500 font-semibold pt-1">
        <span>Card {currentIdx + 1} / {totalLetters}</span>
        <span>Answered: {answeredCount}</span>
      </div>

      {/* End test */}
      <button
        onClick={onEnd}
        disabled={recState === 'recording' || recState === 'processing'}
        className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm
                   transition-all active:scale-95 disabled:opacity-40"
      >
        ⏹ End Test
      </button>
    </div>
  );
}

// ─── Testing view (main assessment screen) ────────────────────────────────────
function TestingView({
  studentName, letterQueue, currentIdx, results,
  onRetake, onNext, onEnd, onSaveResult, onOverride,
}) {
  const [recState, setRecState]         = useState('idle');   // idle|recording|processing|done
  const [transcript, setTranscript]     = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [flipping, setFlipping]         = useState(false);
  const [sttSupported, setSttSupported] = useState(true);

  const mediaRecorderRef  = useRef(null);
  const recognitionRef    = useRef(null);
  const audioChunksRef    = useRef([]);
  const autoStopTimer     = useRef(null);
  const transcriptRef     = useRef('');
  const currentIdxRef     = useRef(currentIdx);

  // Keep idx ref current
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);

  // Reset panel when card changes
  useEffect(() => {
    setRecState('idle');
    setTranscript('');
    setCurrentResult(null);
    transcriptRef.current = '';
  }, [currentIdx]);

  const letter = letterQueue[currentIdx];

  // ── Recording ──────────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    clearTimeout(autoStopTimer.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (recState === 'recording') return;
    setTranscript('');
    transcriptRef.current = '';

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert('Microphone access denied. Please allow microphone access and try again.');
      return;
    }

    audioChunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '' });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob  = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url   = URL.createObjectURL(blob);
      const tx    = transcriptRef.current;
      const idx   = currentIdxRef.current;
      const ltr   = letterQueue[idx];
      const correct = assessPronunciation(tx, ltr);

      setCurrentResult(correct);
      setRecState('done');

      // Convert to data URL for durable storage (blob URLs are revoked on reload)
      const reader = new FileReader();
      reader.onload = ev => {
        onSaveResult(idx, {
          letter: ltr,
          transcript: tx,
          audioUrl:     url,
          audioDataUrl: ev.target.result,
          correct,
          wasOverridden: false,
        });
      };
      reader.readAsDataURL(blob);
    };

    // Speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ta-IN';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = ev => {
        const tx = Array.from(ev.results).map(r => r[0].transcript).join('');
        setTranscript(tx);
        transcriptRef.current = tx;
      };
      rec.onerror = () => {};
      rec.onend = () => {};
      recognitionRef.current = rec;
      try { rec.start(); } catch (_) { setSttSupported(false); }
    } else {
      setSttSupported(false);
    }

    mr.start();
    setRecState('recording');
    autoStopTimer.current = setTimeout(stopRecording, MAX_RECORD_MS);
  }, [recState, letterQueue, stopRecording, onSaveResult]);

  // ── Next / Retake ──────────────────────────────────────────────────────────
  const handleNext = () => {
    setFlipping(true);
    setTimeout(() => {
      onNext();
      setFlipping(false);
    }, 250);
  };

  const handleRetake = () => {
    setFlipping(true);
    setTimeout(() => {
      onRetake();
      setFlipping(false);
    }, 250);
  };

  const handleOverrideCorrect = () => {
    setCurrentResult(true);
    onOverride(currentIdx, true);
  };
  const handleOverrideWrong = () => {
    setCurrentResult(false);
    onOverride(currentIdx, false);
  };

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
              <span className="text-xs text-gray-400 ml-2 font-semibold">
                {answered} answered · {correct} correct
              </span>
            </div>
            <span className="text-sm font-bold text-orange-600">
              {currentIdx + 1} / {letterQueue.length}
            </span>
          </div>
          <ProgressBar current={answered} total={letterQueue.length} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Flash card */}
        <FlashCard letter={letter} flipping={flipping} />

        {/* Recording panel */}
        <RecordPanel
          recState={recState}
          transcript={transcript}
          result={currentResult}
          onStart={startRecording}
          onStop={stopRecording}
          supported={sttSupported}
        />

        {/* Teacher controls */}
        <TeacherPanel
          recState={recState}
          result={currentResult}
          currentIdx={currentIdx}
          totalLetters={letterQueue.length}
          answeredCount={answered}
          onRetake={handleRetake}
          onNext={handleNext}
          onOverrideCorrect={handleOverrideCorrect}
          onOverrideWrong={handleOverrideWrong}
          onEnd={onEnd}
        />
      </div>
    </div>
  );
}

// ─── Results / Complete view ──────────────────────────────────────────────────
function CompleteView({ studentName, letterQueue, results, onNewStudent }) {
  const answered = Object.keys(results).length;
  const correct  = Object.values(results).filter(r => r.correct).length;
  const wrong    = answered - correct;
  const pct      = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
  const gradeColor = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';

  // ── Download CSV report ──────────────────────────────────────────────────
  const downloadReport = () => {
    const headers = ['#', 'Tamil Letter', 'Romanized', 'Group', 'What Was Heard', 'Result', 'Overridden'];
    const rows = letterQueue.map((letter, idx) => {
      const r = results[idx];
      if (!r) return [idx + 1, letter.char, letter.romanized, letter.group, '—', 'Not tested', '—'];
      return [
        idx + 1,
        letter.char,
        letter.romanized,
        letter.group,
        r.transcript || '(no transcription)',
        r.correct ? 'Correct' : 'Wrong',
        r.wasOverridden ? 'Yes' : 'No',
      ];
    });

    const summary = [
      ['Student', studentName],
      ['Date', new Date().toLocaleString()],
      ['Total Letters', letterQueue.length],
      ['Answered', answered],
      ['Correct', correct],
      ['Wrong', wrong],
      ['Score', `${pct}%`],
      ['Grade', grade],
      [],
      ...([headers, ...rows]),
    ];

    const csv = summary.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `tamil-assessment-${studentName}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Download audio as self-contained HTML page ───────────────────────────
  const downloadAudios = () => {
    const entries = Object.entries(results)
      .filter(([, r]) => r.audioDataUrl)
      .map(([idx, r]) => ({ idx: +idx, ...r }))
      .sort((a, b) => a.idx - b.idx);

    if (entries.length === 0) {
      alert('No audio recordings found. Make sure to record each letter before clicking Next.');
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Audio Recordings — ${studentName}</title>
<style>
  body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;background:#fffbf0}
  h1{color:#ea580c}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;margin:.5rem 0;
        display:flex;align-items:center;gap:1rem}
  .letter{font-size:2.5rem;font-family:'Noto Sans Tamil',serif;min-width:60px;text-align:center}
  .info{flex:1}
  .roman{color:#6b7280;font-size:.85rem}
  .badge{padding:.2rem .6rem;border-radius:999px;font-size:.75rem;font-weight:700}
  .correct{background:#dcfce7;color:#15803d}
  .wrong{background:#fee2e2;color:#dc2626}
  .heard{font-size:.8rem;color:#9ca3af;margin-top:.2rem}
  audio{height:36px}
</style>
</head>
<body>
<h1>🎓 Tamil Assessment Recordings</h1>
<p><strong>Student:</strong> ${studentName} &nbsp; <strong>Date:</strong> ${new Date().toLocaleString()}</p>
<p><strong>Score:</strong> ${correct}/${answered} (${pct}%) — Grade: ${grade}</p>
<hr/>
${entries.map(({ letter, transcript, audioDataUrl, correct: cor }) => `
<div class="card">
  <div class="letter">${letter.char}</div>
  <div class="info">
    <div><strong>${letter.romanized}</strong> <span class="roman">${letter.group}</span></div>
    <div class="heard">Heard: ${transcript || '(none)'}</div>
    <span class="badge ${cor ? 'correct' : 'wrong'}">${cor ? '✅ Correct' : '❌ Wrong'}</span>
  </div>
  <audio controls src="${audioDataUrl}"></audio>
</div>`).join('\n')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audio-recordings-${studentName}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Letter grid ──────────────────────────────────────────────────────────
  const groups = [
    { key: 'vowel',     label: 'உயிர் (Vowels)',        color: 'blue' },
    { key: 'consonant', label: 'மெய் (Consonants)',     color: 'purple' },
    { key: 'combined',  label: 'உயிர்மெய் (Combinations)', color: 'orange' },
  ];

  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Score card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">Assessment Complete!</h2>
          <p className="text-gray-500 mb-6">{studentName} · {new Date().toLocaleDateString()}</p>

          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className={`text-6xl font-black ${gradeColor}`}>{grade}</div>
              <div className="text-sm text-gray-400 font-semibold">Grade</div>
            </div>
            <div>
              <div className={`text-6xl font-black ${gradeColor}`}>{pct}%</div>
              <div className="text-sm text-gray-400 font-semibold">Score</div>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-sm font-semibold mb-6">
            <span className="text-green-600">✅ Correct: {correct}</span>
            <span className="text-red-500">❌ Wrong: {wrong}</span>
            <span className="text-gray-400">⏭ Not tested: {letterQueue.length - answered}</span>
          </div>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={downloadReport}
              className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold
                         transition-all active:scale-95 shadow-md"
            >
              📄 Download Report (CSV)
            </button>
            <button
              onClick={downloadAudios}
              className="px-6 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold
                         transition-all active:scale-95 shadow-md"
            >
              🎵 Download Audio Recordings
            </button>
            <button
              onClick={onNewStudent}
              className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold
                         transition-all active:scale-95 shadow-md"
            >
              👤 Next Student
            </button>
          </div>
        </div>

        {/* Detailed letter grid per group */}
        {groups.map(g => {
          const gLetters = letterQueue
            .map((l, idx) => ({ l, idx }))
            .filter(({ l }) => l.group === g.key);
          if (gLetters.length === 0) return null;

          const gc = colorMap[g.color];
          return (
            <div key={g.key} className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-black text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {g.label} ({gLetters.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {gLetters.map(({ l, idx }) => {
                  const r = results[idx];
                  const bg = r ? (r.correct ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300')
                               : `${gc.bg} ${gc.border}`;
                  const txt = r ? (r.correct ? 'text-green-700' : 'text-red-700') : gc.text;
                  const icon = r ? (r.correct ? '✅' : '❌') : '·';
                  return (
                    <div
                      key={l.id}
                      title={`${l.char} (${l.romanized})${r ? ' — ' + (r.transcript || 'no audio') : ''}`}
                      className={`border rounded-xl px-2 py-1.5 text-center cursor-default transition-all hover:scale-110 ${bg}`}
                      style={{ minWidth: 48 }}
                    >
                      <div className={`text-lg font-bold leading-none ${txt}`}
                           style={{ fontFamily: 'Noto Sans Tamil, serif' }}>
                        {l.char}
                      </div>
                      <div className="text-xs">{icon}</div>
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

// ─── Main exported component ──────────────────────────────────────────────────
const TamilAssessmentPage = () => {
  const [phase, setPhase]             = useState('setup');   // setup | testing | complete
  const [studentName, setStudentName] = useState('');
  const [letterQueue, setLetterQueue] = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [results, setResults]         = useState({});

  // ── Start test ─────────────────────────────────────────────────────────────
  const handleStart = (name, setId) => {
    const filter = LETTER_SETS.find(s => s.id === setId)?.filter ?? (() => true);
    const queue  = shuffleArray(ALL_TAMIL_LETTERS.filter(filter));
    setStudentName(name);
    setLetterQueue(queue);
    setCurrentIdx(0);
    setResults({});
    setPhase('testing');
  };

  // ── Save a recorded result ─────────────────────────────────────────────────
  const handleSaveResult = useCallback((idx, data) => {
    setResults(prev => ({ ...prev, [idx]: data }));
  }, []);

  // ── Teacher override (correct / wrong) ────────────────────────────────────
  const handleOverride = useCallback((idx, correct) => {
    setResults(prev => {
      if (!prev[idx]) return prev;
      return { ...prev, [idx]: { ...prev[idx], correct, wasOverridden: true } };
    });
  }, []);

  // ── Next card ──────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setCurrentIdx(i => {
      const next = i + 1;
      if (next >= letterQueue.length) { setPhase('complete'); return i; }
      return next;
    });
  }, [letterQueue.length]);

  // ── Retake (re-show same card, clear its result) ───────────────────────────
  const handleRetake = useCallback(() => {
    setResults(prev => {
      const next = { ...prev };
      delete next[currentIdx];
      return next;
    });
  }, [currentIdx]);

  // ── End test early ─────────────────────────────────────────────────────────
  const handleEnd = () => setPhase('complete');

  // ── New student ────────────────────────────────────────────────────────────
  const handleNewStudent = () => {
    setPhase('setup');
    setStudentName('');
    setLetterQueue([]);
    setCurrentIdx(0);
    setResults({});
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return <SetupView onStart={handleStart} />;
  }

  if (phase === 'complete') {
    return (
      <CompleteView
        studentName={studentName}
        letterQueue={letterQueue}
        results={results}
        onNewStudent={handleNewStudent}
      />
    );
  }

  return (
    <TestingView
      studentName={studentName}
      letterQueue={letterQueue}
      currentIdx={currentIdx}
      results={results}
      onNext={handleNext}
      onRetake={handleRetake}
      onEnd={handleEnd}
      onSaveResult={handleSaveResult}
      onOverride={handleOverride}
    />
  );
};

export default TamilAssessmentPage;
