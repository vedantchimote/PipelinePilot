/**
 * AddJobButton Component
 * Button to add new jobs to the canvas
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addJob } from '@/store/pipelineSlice';
import type { Job_Node_Config } from '@/types';

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

    // Create new job at center of viewport
    const newJob: Job_Node_Config = {
      id: jobId,
      name: jobName,
      stage: stages[0] || 'test',
      script: ['echo "Hello World"'],
    };

    dispatch(addJob({ job: newJob, position: { x: 250, y: 100 } }));
  }, [dispatch, jobs, stages]);

  return (
    <button
      onClick={handleAddJob}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Job
    </button>
  );
};

export default AddJobButton;
