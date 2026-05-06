/**
 * AddJobButton Component
 * Button to add new jobs to the canvas
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addJob } from '@/store/pipelineSlice';
import type { Job_Node_Config } from '@/types';
import Tooltip from './Tooltip';

export const AddJobButton = () => {
  const dispatch = useAppDispatch();
  const { jobs, stages } = useAppSelector((state) => state.pipeline.present);

  const handleAddJob = useCallback(() => {
    // Generate unique job ID and name
    let jobIndex = Object.keys(jobs).length + 1;
    let jobId = `job_${jobIndex}`;
    let jobName = `job_${jobIndex}`;

    while (jobs[jobId]) {
      jobIndex++;
      jobId = `job_${jobIndex}`;
      jobName = `job_${jobIndex}`;
    }

    // Cycle through available stages for better distribution
    const existingJobCount = Object.keys(jobs).length;
    const stageIndex = existingJobCount % stages.length;
    const selectedStage = stages[stageIndex] || 'test';

    // Count how many jobs already exist in the selected stage
    const jobsInStage = Object.values(jobs).filter((j) => j.stage === selectedStage).length;

    // Create new job
    const newJob: Job_Node_Config = {
      id: jobId,
      name: jobName,
      stage: selectedStage,
      script: ['echo "Hello World"'],
    };

    // Calculate position: spread horizontally within the stage's swim lane
    const stageY = stages.indexOf(selectedStage) * 200;
    const position = {
      x: 250 + jobsInStage * 300,
      y: stageY + 50,
    };

    dispatch(addJob({ job: newJob, position }));
  }, [dispatch, jobs, stages]);

  return (
    <Tooltip content="Add a new job">
      <button
        onClick={handleAddJob}
        aria-label="Add Job"
        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Job
      </button>
    </Tooltip>
  );
};

export default AddJobButton;
