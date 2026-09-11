"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import styles from "./VoiceAssistantBar.module.css";

export interface VoiceAssistantBarProps {
  pageSpeechSummary?: string;
  onEmergencyTrigger?: () => void;
  className?: string;
}

export function VoiceAssistantBar({
  pageSpeechSummary,
  onEmergencyTrigger,
  className,
}: VoiceAssistantBarProps) {
  const router = useRouter();
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [transcript, setTranscript] = React.useState<string>("");
  const [feedback, setFeedback] = React.useState<string>("Say \"Go to timeline\", \"Open emergency\", or \"Read my health\"");

  // Text to Speech
  const handleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      pageSpeechSummary ||
      "Welcome to your KinSphere Health Memory System. Your health state is stable. You have a doctor appointment tomorrow at 10 AM, and morning medications due. Emergency assistance is always available.";

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Friendly, clear speed for seniors
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Voice Command Processing
  const processVoiceCommand = (cmd: string) => {
    const text = cmd.toLowerCase().trim();
    setTranscript(`"${cmd}"`);

    if (text.includes("emergency") || text.includes("help") || text.includes("sos") || text.includes("911")) {
      setFeedback("Opening Emergency Medical Card...");
      if (onEmergencyTrigger) onEmergencyTrigger();
      return;
    }

    if (text.includes("home") || text.includes("dashboard")) {
      setFeedback("Navigating to Home...");
      router.push("/patient");
      return;
    }

    if (text.includes("profile") || text.includes("my info") || text.includes("contact")) {
      setFeedback("Navigating to My Profile...");
      router.push("/patient/profile");
      return;
    }

    if (text.includes("upload") || text.includes("add report") || text.includes("scan")) {
      setFeedback("Navigating to Upload Records...");
      router.push("/patient/upload");
      return;
    }

    if (text.includes("report") || text.includes("document") || text.includes("lab")) {
      setFeedback("Navigating to Reports...");
      router.push("/patient/reports");
      return;
    }

    if (text.includes("timeline") || text.includes("history") || text.includes("events")) {
      setFeedback("Navigating to Health Timeline...");
      router.push("/patient/timeline");
      return;
    }

    if (text.includes("consent") || text.includes("sharing") || text.includes("privacy") || text.includes("access")) {
      setFeedback("Navigating to Consent & Sharing...");
      router.push("/patient/consent");
      return;
    }

    if (text.includes("notification") || text.includes("alert") || text.includes("message")) {
      setFeedback("Navigating to Notifications...");
      router.push("/patient/notifications");
      return;
    }

    if (text.includes("read") || text.includes("listen") || text.includes("speak")) {
      handleReadAloud();
      return;
    }

    setFeedback(`Heard: "${cmd}". Try "Go to timeline" or "Open emergency".`);
  };

  // Voice Recognition Handler
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Check Web Speech Recognition API
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Graceful elderly-friendly simulation prompt if browser denies Web Speech
      const simulated = prompt(
        "Voice Assistant: What would you like to do? (e.g. \"Go to timeline\", \"Open emergency\", \"Read my health\", \"Upload record\")",
        "Go to timeline"
      );
      if (simulated) {
        processVoiceCommand(simulated);
      }
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback("Listening... Speak clearly now.");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        processVoiceCommand(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedback("Could not hear clearly. Click the button to try again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setFeedback("Microphone access could not be started.");
    }
  };

  return (
    <div
      className={clsx(styles.voiceBar, isListening && styles.voiceBarActive, className)}
      role="region"
      aria-label="Voice Health Assistant"
    >
      <div className={styles.leftInfo}>
        <Mic size={24} className={styles.micIcon} aria-hidden="true" />
        <div>
          <span>Voice Health Assistant: </span>
          <span className={styles.transcript}>{feedback}</span>
          {transcript && <span> ({transcript})</span>}
        </div>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={clsx(styles.speakButton, isListening && styles.speakButtonActive)}
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Speak a command to navigate or search"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span>{isListening ? "Listening..." : "Speak to KinSphere"}</span>
        </button>

        <button
          type="button"
          className={styles.readAloudButton}
          onClick={handleReadAloud}
          aria-label={isSpeaking ? "Stop reading aloud" : "Read this page aloud"}
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          <span>{isSpeaking ? "Stop Voice" : "Listen Aloud"}</span>
        </button>
      </div>
    </div>
  );
}
