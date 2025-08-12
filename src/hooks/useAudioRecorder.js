import { useState, useRef, useCallback, useEffect } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState([]);
  const [audioStats, setAudioStats] = useState({
    duration: 0,
    sampleRate: 16000,
    totalSamples: 0,
    rmsValue: 0,
    hasAudio: false,
  });

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioWorkletRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create media stream source
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create audio worklet processor (modern approach)
      await audioContextRef.current.audioWorklet.addModule(
        "/audio-processor.js"
      );
      const worklet = new AudioWorkletNode(
        audioContextRef.current,
        "audio-processor"
      );

      worklet.port.onmessage = (event) => {
        const { audioData, rms, hasAudio } = event.data;

        if (hasAudio) {
          setAudioBuffer((prev) => {
            const newBuffer = [...prev, ...audioData];
            const maxSamples = 16000 * 10; // 10 seconds max
            return newBuffer.length > maxSamples
              ? newBuffer.slice(-maxSamples)
              : newBuffer;
          });
        }

        setAudioStats((prev) => ({
          ...prev,
          rmsValue: rms,
          hasAudio,
          totalSamples: audioBuffer.length,
        }));
      };

      audioWorkletRef.current = worklet;
      source.connect(worklet);
      worklet.connect(audioContextRef.current.destination);

      return true;
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    const success = await initializeAudioContext();
    if (success) {
      setIsRecording(true);
      startTimeRef.current = Date.now();
    }
  }, [initializeAudioContext]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioWorkletRef.current) {
      audioWorkletRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  // Clear buffer
  const clearBuffer = useCallback(() => {
    setAudioBuffer([]);
    setAudioStats((prev) => ({ ...prev, totalSamples: 0 }));
  }, []);

  // Get current buffer
  const getAudioBuffer = useCallback(() => {
    return audioBuffer;
  }, [audioBuffer]);

  // Calculate duration
  useEffect(() => {
    if (isRecording && startTimeRef.current) {
      const interval = setInterval(() => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setAudioStats((prev) => ({ ...prev, duration }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return {
    isRecording,
    audioBuffer,
    audioStats,
    startRecording,
    stopRecording,
    clearBuffer,
    getAudioBuffer,
  };
};
