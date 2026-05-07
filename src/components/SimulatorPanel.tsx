/**
 * SimulatorPanel Component
 * Animates pipeline execution flow based on stages and needs dependencies
 */

import { memo, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { startSimulator, advanceSimulator, stopSimulator } from '@/store/uiSlice';

/** Compute execution waves: groups of jobs that can run in parallel */
function computeWaves(jobs: Record<string, any>, stages: string[]): string[][] {
  const waves: string[][] = [];
  const completed = new Set<string>();
  const allJobIds = new Set(Object.keys(jobs));
  let safety = 0;

  while (completed.size < allJobIds.size && safety < 50) {
    safety++;
    const wave: string[] = [];

    // Process by stage order
    for (const stage of stages) {
      const stageJobs = Object.values(jobs).filter(
        (j: any) => j.stage === stage && !completed.has(j.id)
      );
      for (const job of stageJobs as any[]) {
        // Check if all dependencies are completed
        const deps = job.needs
          ? (Array.isArray(job.needs) ? job.needs : [job.needs]).map((n: any) =>
              typeof n === 'string' ? n : n.job
            )
          : [];
        const allDepsCompleted = deps.every((d: string) => completed.has(d));

        // If no needs: can run with other same-stage jobs once all prior stages are done
        if (deps.length === 0) {
          const stageIdx = stages.indexOf(stage);
          const priorStages = stages.slice(0, stageIdx);
          const priorJobs = Object.values(jobs).filter((j: any) => priorStages.includes(j.stage));
          const allPriorDone = priorJobs.every((j: any) => completed.has(j.id));
          if (allPriorDone) wave.push(job.id);
        } else if (allDepsCompleted) {
          wave.push(job.id);
        }
      }
    }

    if (wave.length === 0) break; // Deadlock or done
    waves.push(wave);
    wave.forEach((id) => completed.add(id));
  }

  return waves;
}

export const SimulatorPanel = memo(() => {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.pipeline.present.jobs);
  const stages = useAppSelector((state) => state.pipeline.present.stages);
  const running = useAppSelector((state) => (state.ui as any).simulatorRunning);
  const step = useAppSelector((state) => (state.ui as any).simulatorStep);
  const activeJobs = useAppSelector((state) => (state.ui as any).activeSimJobs || []);
  const wavesRef = useRef<string[][]>([]);
  const timerRef = useRef<number | null>(null);

  const waves = computeWaves(jobs, stages);
  wavesRef.current = waves;
  const totalJobs = Object.keys(jobs).length;

  const handleStart = useCallback(() => {
    if (totalJobs === 0) return;
    dispatch(startSimulator());
  }, [dispatch, totalJobs]);

  const handleStop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    dispatch(stopSimulator());
  }, [dispatch]);

  // Auto-advance when running
  useEffect(() => {
    if (!running) return;
    const wv = wavesRef.current;
    if (step >= wv.length) {
      // Simulation complete
      setTimeout(() => handleStop(), 1200);
      return;
    }
    // Highlight current wave
    dispatch(advanceSimulator(wv[step] || []));

    const timer = setTimeout(() => {
      dispatch(advanceSimulator(wv[step + 1] || []));
      // Advance the step by dispatching again
      dispatch({ type: 'ui/advanceSimulator', payload: wv[step + 1] || [] });
    }, 1500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, step]);

  // Step-by-step auto-advance
  useEffect(() => {
    if (!running || step < 0) return;
    const wv = wavesRef.current;
    if (step >= wv.length) {
      setTimeout(handleStop, 800);
      return;
    }
    dispatch(advanceSimulator(wv[step]));
    timerRef.current = window.setTimeout(() => {
      dispatch({ type: 'ui/startSimulator' }); // Just increment the step
      // Actually, we need a different mechanism. Let's use advanceSimulator
    }, 1500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proper step-through using interval
  useEffect(() => {
    if (!running) return;
    const wv = wavesRef.current;
    let currentStep = 0;
    dispatch(advanceSimulator(wv[0] || []));

    const iv = setInterval(() => {
      currentStep++;
      if (currentStep >= wv.length) {
        clearInterval(iv);
        setTimeout(handleStop, 800);
        return;
      }
      dispatch(advanceSimulator(wv[currentStep]));
    }, 1500);

    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 rounded-xl shadow-2xl w-[280px] overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: running ? '#22c55e' : 'var(--text-muted)', animation: running ? 'pulse 1s infinite' : 'none' }} />
          <h4 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Pipeline Simulator</h4>
        </div>
        {running ? (
          <button onClick={handleStop} className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-400">Stop</button>
        ) : (
          <button
            onClick={handleStart}
            disabled={totalJobs === 0}
            className="text-[10px] font-medium px-2 py-0.5 rounded disabled:opacity-40 transition-colors"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
          >
            Run
          </button>
        )}
      </div>

      {/* Waves visualization */}
      <div className="px-4 py-3 space-y-2 max-h-[200px] overflow-y-auto">
        {waves.length === 0 ? (
          <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>Add jobs to simulate execution</p>
        ) : waves.map((wave, i) => {
          const isDone = running && step > i;
          const isCurrent = running && activeJobs.length > 0 && JSON.stringify(wave) === JSON.stringify(activeJobs);
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                background: isCurrent ? 'rgba(34,197,94,0.12)' : isDone ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                border: `1px solid ${isCurrent ? 'rgba(34,197,94,0.3)' : 'transparent'}`,
              }}
            >
              <span className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone ? 'var(--accent)' : isCurrent ? '#22c55e' : 'var(--bg-primary)',
                  color: isDone || isCurrent ? 'white' : 'var(--text-muted)',
                }}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <div className="flex flex-wrap gap-1 flex-1">
                {wave.map((jobId) => (
                  <span
                    key={jobId}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded truncate max-w-[100px]"
                    style={{
                      background: isCurrent ? 'rgba(34,197,94,0.2)' : 'var(--bg-primary)',
                      color: isCurrent ? '#22c55e' : 'var(--text-primary)',
                    }}
                  >
                    {jobs[jobId]?.name || jobId}
                  </span>
                ))}
              </div>
              {isCurrent && (
                <svg className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: '#22c55e' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {waves.length} wave{waves.length !== 1 ? 's' : ''} · {totalJobs} job{totalJobs !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
});

SimulatorPanel.displayName = 'SimulatorPanel';
export default SimulatorPanel;
