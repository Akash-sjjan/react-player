import * as React from "react";

//---//

const pad = (value: number) => `0${value}`.slice(-2);

const format = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${mm}:${ss}`;
};

//---//

export interface DurationProps {
  className?: string;
  seconds: number;
}

export const Duration: React.FunctionComponent<DurationProps> = ({ className, seconds }) => (
  <time dateTime={`P${Math.round(seconds)}S`} className={className}>
    {format(seconds)}
  </time>
);

export default Duration;
