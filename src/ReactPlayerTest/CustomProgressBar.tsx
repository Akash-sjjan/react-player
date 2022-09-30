import * as React from "react";

export interface CustomProgressBarProps {
  value?: number;
}

export const CustomProgressBar: React.FunctionComponent<CustomProgressBarProps> = ({ value = 0 }) => (
  <div className="w-full bg-gray-200 rounded h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded"
      style={{
        width: `${value * 100}%`,
      }}
    ></div>
  </div>
);

export default CustomProgressBar;
