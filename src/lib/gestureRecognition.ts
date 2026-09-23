import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureName = "Hello" | "Thank You" | "Help" | "Yes" | "No" | "Unknown";

export interface GestureResult {
  name: GestureName;
  confidence: number;
}

const GESTURE_LABELS: Record<Exclude<GestureName, "Unknown">, string> = {
  Hello: "Hello",
  "Thank You": "Thank You",
  Help: "Help",
  Yes: "Yes",
  No: "No",
};

export function gestureLabel(name: GestureName): string {
  return GESTURE_LABELS[name as Exclude<GestureName, "Unknown">] ?? "Unknown";
}

function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fingerExtended(landmarks: NormalizedLandmark[], tip: number, pip: number, mcp: number, wrist: number): boolean {
  return distance(landmarks[tip], landmarks[wrist]) > distance(landmarks[pip], landmarks[wrist]) * 1.15;
}

function thumbExtended(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  const wristToThumbTip = distance(wrist, thumbTip);
  const wristToThumbMcp = distance(wrist, thumbMcp);
  const palmWidth = distance(indexMcp, pinkyMcp);

  return wristToThumbTip > wristToThumbMcp * 1.4 && distance(thumbTip, indexMcp) > palmWidth * 0.6;
}

function getFingerStates(landmarks: NormalizedLandmark[]): boolean[] {
  const thumb = thumbExtended(landmarks);
  const index = fingerExtended(landmarks, 8, 6, 5, 0);
  const middle = fingerExtended(landmarks, 12, 10, 9, 0);
  const ring = fingerExtended(landmarks, 16, 14, 13, 0);
  const pinky = fingerExtended(landmarks, 20, 18, 17, 0);
  return [thumb, index, middle, ring, pinky];
}

function isPinch(landmarks: NormalizedLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const palmWidth = distance(landmarks[5], landmarks[17]);

  const di = distance(thumbTip, indexTip);
  const dm = distance(thumbTip, middleTip);
  const dr = distance(thumbTip, ringTip);
  const dp = distance(thumbTip, pinkyTip);

  return di < palmWidth * 0.45 && dm < palmWidth * 0.45 && dr < palmWidth * 0.45 && dp < palmWidth * 0.45;
}

export function classifyGesture(landmarks: NormalizedLandmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { name: "Unknown", confidence: 0 };
  }

  const [thumb, index, middle, ring, pinky] = getFingerStates(landmarks);

  if (isPinch(landmarks)) {
    return { name: "Thank You", confidence: 0.85 };
  }

  if (thumb && index && middle && ring && pinky) {
    return { name: "Hello", confidence: 0.9 };
  }

  if (thumb && !index && !middle && !ring && !pinky) {
    return { name: "Help", confidence: 0.88 };
  }

  if (!thumb && !index && !middle && !ring && !pinky) {
    return { name: "Yes", confidence: 0.82 };
  }

  if (!thumb && index && !middle && !ring && !pinky) {
    return { name: "No", confidence: 0.85 };
  }

  return { name: "Unknown", confidence: 0.3 };
}

export const SUPPORTED_GESTURES: Exclude<GestureName, "Unknown">[] = [
  "Hello",
  "Thank You",
  "Help",
  "Yes",
  "No",
];
