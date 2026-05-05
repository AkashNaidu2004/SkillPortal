'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { HiClock, HiExclamation, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function TestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violationLog, setViolationLog] = useState([]);
  const violationsRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);
  const [codeLang, setCodeLang] = useState('python');

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Fetch test data
  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && params.testId) fetchTest();
  }, [user, authLoading, params.testId]);

  const fetchTest = async () => {
    try {
      const { data } = await API.get(`/test/${params.testId}`);
      setTest(data.test);
      setQuestions(data.questions);
      setTimeLeft(data.test.duration * 60);
    } catch (err) {
      toast.error('Failed to load test');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  // Proctoring - Tab visibility + blur + fullscreen exit
  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) addViolation('Tab switching detected');
    };
    const handleBlur = () => addViolation('Window lost focus');
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && started) {
        setIsFullscreen(false);
        addViolation('Exited fullscreen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [started]);

  const addViolation = useCallback((reason) => {
    const message = `${reason} at ${new Date().toLocaleTimeString()}`;
    setViolationLog(logs => [...logs, message]);

    setViolations(prev => {
      const newCount = prev + 1;
      violationsRef.current = newCount;
      setTimeout(() => {
        if (violationsRef.current >= 3) {
          toast.error('⛔ Maximum violations reached! Auto-submitting test...', { duration: 5000 });
          setTimeout(() => handleSubmit(), 1000);
        } else {
          toast(`⚠️ Warning ${violationsRef.current}/3: ${reason}`, {
            icon: '🚨',
            duration: 4000,
            style: { background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: '1px solid rgba(239, 68, 68, 0.5)' },
          });
        }
      }, 0);
      return newCount;
    });
  }, []);

  // Start test
  const startTest = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (e) {
      // Fullscreen not supported
    }
    setStarted(true);
    startTimeRef.current = Date.now();
  };

  // Save answer
  const saveAnswer = (questionId, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: type === 'mcq'
        ? { questionId, selectedAnswer: value }
        : { questionId, code: value },
    }));
  };

  // Submit test
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {}

    const timeTaken = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : test.duration * 60 - timeLeft;

    const answerArray = questions.map(q => {
      const a = answers[q._id];
      return a || { questionId: q._id, selectedAnswer: '', code: '' };
    });

    try {
      const { data } = await API.post('/test/submit', {
        testId: params.testId,
        answers: answerArray,
        timeTaken,
        violations,
        violationLog,
      });
      toast.success('Test submitted successfully!');
      router.push(`/result/${data._id}`);
    } catch (err) {
      toast.error('Submission failed');
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const q = questions[currentQ];
  const isUrgent = timeLeft < 60;
  const answeredCount = Object.keys(answers).length;

  // Pre-test instructions screen
  if (!started) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{test.title}</h1>
          <p className="text-slate-600 mb-6">{test.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{questions.length}</p>
              <p className="text-xs text-slate-600">Questions</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{test.duration} min</p>
              <p className="text-xs text-slate-600">Duration</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-lg font-bold capitalize text-slate-900">{test.type}</p>
              <p className="text-xs text-slate-600">Type</p>
            </div>
          </div>

          <div className="text-left p-4 rounded-xl mb-6" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <p className="text-sm font-medium text-yellow-400 mb-2">⚠️ Important Rules:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• The test will enter fullscreen mode</li>
              <li>• Tab switching and window blur are monitored</li>
              <li>• You have 3 warnings before auto-submit</li>
              <li>• Timer starts immediately after clicking begin</li>
            </ul>
          </div>

          <button onClick={startTest} className="btn-primary w-full py-3.5 text-sm">
            Begin Test 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#eff6ff' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(255, 255, 255, 0.95)', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', backdropFilter: 'blur(10px)' }}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{test.title}</h2>
          <p className="text-xs text-slate-600">Q {currentQ + 1} of {questions.length} · {answeredCount} answered</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Violations */}
          {violations > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <HiExclamation className="w-4 h-4" /> {violations}/3 Warnings
            </div>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ${isUrgent ? 'animate-pulse' : ''}`}
            style={{
              background: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: isUrgent ? '#ef4444' : '#475569',
            }}>
            <HiClock className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-900"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question nav sidebar */}
        <div className="w-20 border-r p-3 overflow-y-auto hidden sm:block"
          style={{ borderColor: 'rgba(148, 163, 184, 0.2)', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="grid grid-cols-2 gap-2">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                  i === currentQ ? 'text-slate-900' : answers[questions[i]._id] ? 'text-green-400' : 'text-slate-500'
                }`}
                style={{
                  background: i === currentQ ? 'rgba(59, 130, 246, 0.3)' : answers[questions[i]._id] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                  border: `1px solid ${i === currentQ ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)'}`,
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main question area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Question */}
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-3 capitalize"
                  style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#475569' }}>
                  {q.type} · {q.difficulty}
                </span>
                <h3 className="text-xl font-semibold text-slate-900 leading-relaxed"
                  style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {q.questionText}
                </h3>
              </div>

              {/* MCQ options */}
              {q.type === 'mcq' && (
                <div className="space-y-3 max-w-2xl">
                  {q.options.map((opt, idx) => {
                    const isSelected = answers[q._id]?.selectedAnswer === opt;
                    return (
                      <motion.button key={idx} whileTap={{ scale: 0.98 }}
                        onClick={() => saveAnswer(q._id, opt, 'mcq')}
                        className="w-full text-left p-4 rounded-xl transition-all flex items-center gap-3"
                        style={{
                          background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                          border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)'}`,
                        }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background: isSelected ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                            color: isSelected ? '#fff' : '#475569',
                          }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={`text-sm ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Coding editor */}
              {q.type === 'coding' && (
                <div className="space-y-4">
                  {q.constraints && (
                    <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <p className="text-slate-600"><strong className="text-slate-600">Constraints:</strong> {q.constraints}</p>
                    </div>
                  )}
                  {q.sampleInput && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <p className="text-xs text-slate-600 mb-1">Sample Input</p>
                        <code className="text-sm text-green-400">{q.sampleInput}</code>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <p className="text-xs text-slate-600 mb-1">Expected Output</p>
                        <code className="text-sm text-green-400">{q.sampleOutput}</code>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mb-2">
                    {['python', 'java', 'c'].map(lang => (
                      <button key={lang} onClick={() => setCodeLang(lang)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                        style={{
                          background: codeLang === lang ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                          color: codeLang === lang ? '#475569' : '#64748b',
                          border: `1px solid ${codeLang === lang ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'}`,
                        }}>
                        {lang}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                    <Editor
                      height="350px"
                      language={codeLang === 'c' ? 'c' : codeLang}
                      theme="vs-dark"
                      value={answers[q._id]?.code || ''}
                      onChange={(value) => saveAnswer(q._id, value, 'coding')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-4" style={{ borderTop: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 transition-all disabled:opacity-30"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
              <HiChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Mobile question indicator */}
            <span className="text-sm text-slate-600 sm:hidden">{currentQ + 1} / {questions.length}</span>

            <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
              disabled={currentQ === questions.length - 1}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#475569' }}>
              Next <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
