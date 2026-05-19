import { useState, useEffect, useRef } from 'react'
import '../styles/FloatingTimer.css'

const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
]

export default function FloatingTimer() {
  const [open, setOpen] = useState(false)
  const [seconds, setSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(25)
  const intervalRef = useRef<number | null>(null)
  const originalTitleRef = useRef<string>(document.title)

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsRunning(false)
      playChime()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds])

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(seconds)} — brain-os`
    } else if (seconds === 0) {
      document.title = `Time's up — brain-os`
    } else {
      document.title = originalTitleRef.current
    }
    return () => {
      document.title = originalTitleRef.current
    }
  }, [isRunning, seconds])

  function playChime() {
    try {
      const ctx = new AudioContext()
      const now = ctx.currentTime
      const partials = [
        { freq: 880, gain: 0.4 },
        { freq: 1320, gain: 0.2 },
        { freq: 1760, gain: 0.12 },
        { freq: 2640, gain: 0.06 },
      ]
      partials.forEach(({ freq, gain }) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(gain, now + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 2.6)
      })
    } catch {
      // Audio not supported, fail silently
    }
  }

  function selectPreset(minutes: number) {
    setSelectedPreset(minutes)
    setSeconds(minutes * 60)
    setIsRunning(false)
  }

  function toggleTimer() {
    setIsRunning(!isRunning)
  }

  function resetTimer() {
    setIsRunning(false)
    setSeconds(selectedPreset * 60)
  }

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = 1 - seconds / (selectedPreset * 60)

  return (
    <>
      <button
        className={`floating-timer-btn ${isRunning ? 'running' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close timer' : 'Open timer'}
      >
        {isRunning ? (
          <span className="floating-timer-time">{formatTime(seconds)}</span>
        ) : (
          <span className="floating-timer-icon">{open ? '×' : '+'}</span>
        )}
      </button>

      {open && (
        <div className="floating-timer-panel">
          <div className="floating-timer-header">
            <span className="floating-timer-label">Timer</span>
            <button
              className="floating-timer-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="floating-timer-display">
            <div
              className="floating-timer-progress"
              style={{ width: `${progress * 100}%` }}
            />
            <span className={`floating-timer-readout ${seconds === 0 ? 'done' : ''}`}>
              {formatTime(seconds)}
            </span>
          </div>

          <div className="floating-timer-presets">
            {PRESETS.map(p => (
              <button
                key={p.minutes}
                className={`floating-preset-btn ${selectedPreset === p.minutes ? 'active' : ''}`}
                onClick={() => selectPreset(p.minutes)}
                disabled={isRunning}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="floating-timer-controls">
            <button
              className={`floating-control-btn ${isRunning ? 'pause' : 'start'}`}
              onClick={toggleTimer}
            >
              {isRunning ? 'pause' : seconds === 0 ? 'restart' : 'start'}
            </button>
            <button
              className="floating-control-btn reset"
              onClick={resetTimer}
              disabled={seconds === selectedPreset * 60 && !isRunning}
            >
              reset
            </button>
          </div>

          {seconds === 0 && <p className="floating-timer-done">Time's up.</p>}
        </div>
      )}
    </>
  )
}
