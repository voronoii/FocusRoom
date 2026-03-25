'use client';

let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let audioBuffer: AudioBuffer | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let isPlaying = false;

export async function initAmbientSound() {
  if (audioContext) return;
  audioContext = new AudioContext();
  gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0;

  try {
    const response = await fetch('/sounds/cafe-ambient.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch {
    console.warn('Failed to load ambient sound');
  }
}

export function startAmbientSound(userCount: number) {
  if (!audioContext || !audioBuffer || !gainNode || isPlaying) return;

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.loop = true;
  sourceNode.connect(gainNode);
  sourceNode.start();
  isPlaying = true;

  updateVolume(userCount);
}

export function updateVolume(userCount: number) {
  if (!gainNode) return;
  const targetVolume = Math.min(0.4, userCount * 0.03);
  gainNode.gain.setTargetAtTime(targetVolume, gainNode.context.currentTime, 0.5);
}

export function stopAmbientSound() {
  if (sourceNode && isPlaying) {
    sourceNode.stop();
    isPlaying = false;
  }
}

export function toggleMute(muted: boolean) {
  if (!gainNode) return;
  gainNode.gain.setTargetAtTime(muted ? 0 : 0.3, gainNode.context.currentTime, 0.1);
}
