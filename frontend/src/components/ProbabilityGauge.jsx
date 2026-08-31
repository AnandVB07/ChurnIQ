import React from 'react';

export default function ProbabilityGauge({ probability = 0, size = 180 }) {
  const percentage = Math.round(probability * 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 270-degree arc for high aesthetic appeal
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  // Determine dynamic gradient / color based on risk level
  const getColor = () => {
    if (percentage >= 70) return '#EF4444'; // Red
    if (percentage >= 40) return '#F59E0B'; // Amber
    return '#10B981'; // Emerald
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className="rotate-[135deg] transform"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="text-dark-secondary dark:text-dark-secondary light:text-light-secondary"
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Centered Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight text-dark-text dark:text-dark-text light:text-light-text">
          {percentage}%
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-dark-muted dark:text-dark-muted light:text-light-muted">
          Churn Risk
        </span>
      </div>
    </div>
  );
}
