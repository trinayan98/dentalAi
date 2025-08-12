import React, { useState, useEffect, useRef } from "react";

const AudioDebugger = ({ audioBuffer, isActive }) => {
  const [debugInfo, setDebugInfo] = useState({
    bufferSize: 0,
    hasAudio: false,
    rmsValue: 0,
    maxValue: 0,
    minValue: 0,
    nonZeroCount: 0,
    totalSamples: 0,
  });

  useEffect(() => {
    if (audioBuffer && audioBuffer.length > 0) {
      // Calculate debug information
      const nonZeroSamples = audioBuffer.filter((sample) => sample !== 0);
      const maxValue = Math.max(...audioBuffer);
      const minValue = Math.min(...audioBuffer);

      // Calculate RMS
      let rms = 0;
      for (let i = 0; i < audioBuffer.length; i++) {
        rms += audioBuffer[i] * audioBuffer[i];
      }
      rms = Math.sqrt(rms / audioBuffer.length);

      setDebugInfo({
        bufferSize: audioBuffer.length,
        hasAudio: nonZeroSamples.length > 0,
        rmsValue: rms,
        maxValue: maxValue,
        minValue: minValue,
        nonZeroCount: nonZeroSamples.length,
        totalSamples: audioBuffer.length,
      });
    } else {
      setDebugInfo({
        bufferSize: 0,
        hasAudio: false,
        rmsValue: 0,
        maxValue: 0,
        minValue: 0,
        nonZeroCount: 0,
        totalSamples: 0,
      });
    }
  }, [audioBuffer]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <h3 className="font-bold mb-2">Audio Debug Info</h3>
      <div className="space-y-1">
        <div>Buffer Size: {debugInfo.bufferSize.toLocaleString()}</div>
        <div>
          Has Audio:{" "}
          <span
            className={debugInfo.hasAudio ? "text-green-400" : "text-red-400"}
          >
            {debugInfo.hasAudio ? "YES" : "NO"}
          </span>
        </div>
        <div>RMS Value: {debugInfo.rmsValue.toFixed(6)}</div>
        <div>Max Value: {debugInfo.maxValue}</div>
        <div>Min Value: {debugInfo.minValue}</div>
        <div>Non-Zero Samples: {debugInfo.nonZeroCount.toLocaleString()}</div>
        <div>Total Samples: {debugInfo.totalSamples.toLocaleString()}</div>
        <div>
          Audio Percentage:{" "}
          {debugInfo.totalSamples > 0
            ? ((debugInfo.nonZeroCount / debugInfo.totalSamples) * 100).toFixed(
                2
              )
            : 0}
          %
        </div>
      </div>
    </div>
  );
};

export default AudioDebugger;
