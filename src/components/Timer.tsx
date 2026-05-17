import { useState, useEffect, useRef } from 'react'
import '../styles/Timer.css'

const PRESETS = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
]

export default function Timer() {
  const [seconds, setSeconds] = useState(25 * 60) // default 25 min
  const [isRunning, setIsRunning] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(25)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsRunning(false)
      // Play a simple beep using Web Audio API
      playBeep()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds])

  function playBeep() {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
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
    <div className="timer-shell">
      <div className="timer-container">
        {/* Header */}
        <div className="timer-header">
          <h1 className="timer-title">Timer</h1>
          <p className="timer-sub">Focus on one thing.</p>
        </div>

        {/* Timer display */}
        <div className="timer-card">
          <div className="timer-display">
            <div
              className="timer-progress"
              style={{ width: `${progress * 100}%` }}
            />
            <span className={`timer-time ${seconds === 0 ? 'done' : ''}`}>
              {formatTime(seconds)}
            </span>
          </div>

          {/* Presets */}
          <div className="timer-presets">
            {PRESETS.map(p => (
              <button
                key={p.minutes}
                className={`preset-btn ${selectedPreset === p.minutes ? 'active' : ''}`}
                onClick={() => selectPreset(p.minutes)}
                disabled={isRunning}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button
              className={`control-btn ${isRunning ? 'pause' : 'start'}`}
              onClick={toggleTimer}
            >
              {isRunning ? 'pause' : seconds === 0 ? 'restart' : 'start'}
            </button>
            <button
              className="control-btn reset"
              onClick={resetTimer}
              disabled={seconds === selectedPreset * 60 && !isRunning}
            >
              reset
            </button>
          </div>

          {seconds === 0 && (
            <p className="timer-done">Time's up. Good work.</p>
          )}
        </div>
      </div>
    </div>
  )
}
