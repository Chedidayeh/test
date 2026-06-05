'use client';

import { Button } from '@/src/components/ui/button';
import { Mic, StopCircle, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { transcribeAudioAction } from '@/src/lib/ai-service/server-actions';

interface VoiceInputAnswerProps {
  onSubmit: (answer: string) => void;
  isDisabled: boolean;
  isLoading?: boolean;
  languageCode?: string;
}

const VoiceInputAnswer = ({
  onSubmit,
  isDisabled,
  isLoading = false,
  languageCode = 'en-US',
}: VoiceInputAnswerProps) => {
  const t = useTranslations('StoryReadingInterface.riddleInterface');

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setMicPermissionDenied(false);
      audioChunksRef.current = [];
      setTranscript('');
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[Voice Input] Recording error:', event.error);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access microphone';
      console.error('[Voice Input] Error accessing microphone:', errorMsg);

      if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission denied')) {
        setMicPermissionDenied(true);
        setError('Microphone permission denied');
      } else {
        setError(errorMsg);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleStopClick = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        await processAudio();
      };
      stopRecording();
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
      const base64Audio = btoa(binaryString);

      const result = await transcribeAudioAction({
        audioBuffer: base64Audio,
        languageCode,
      });

      if (result.success && result.data?.transcript) {
        setTranscript(result.data.transcript);
      } else {
        setError(result.error || 'Failed to transcribe audio');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process audio';
      console.error('[Voice Input] Error processing audio:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onSubmit(transcript.trim());
      setTranscript('');
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (micPermissionDenied) {
    return (
      <div className="w-full space-y-3 sm:space-y-4">
        <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm sm:text-base font-body">
            {t('voiceInputAnswer.permissionDenied') || 'Microphone permission denied. Please enable microphone access in your browser settings.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <label className="block font-body text-foreground text-base sm:text-lg">
        {t('voiceInputAnswer.yourAnswer') || 'Speak Your Answer'}
      </label>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm sm:text-base font-body">{error}</p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {isRecording && (
          <div className="flex items-center justify-between p-4 sm:p-6 bg-secondary/10 rounded-xl border border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-foreground font-body text-sm sm:text-base">
                {t('voiceInputAnswer.recording') || 'Recording...'} {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}

        {transcript && (
          <div className="p-4 sm:p-6 bg-secondary/10 rounded-xl border border-secondary/20">
            <p className="text-foreground font-body text-sm sm:text-base">
              <span className="font-semibold">{t('voiceInputAnswer.transcript') || 'Transcript'}:</span> {transcript}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {!isRecording ? (
            <>
              <Button
                onClick={startRecording}
                disabled={isDisabled || isLoading || isProcessing}
                variant="secondary"
                className="w-full sm:flex-1 flex items-center justify-center gap-2"
              >
                <Mic size={20} />
                {t('voiceInputAnswer.startRecording') || 'Start Recording'}
              </Button>
              {transcript && (
                <Button
                  onClick={handleSubmit}
                  disabled={!transcript.trim() || isDisabled || isLoading || isProcessing}
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      {t('voiceInputAnswer.submit') || 'Submit'}
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleStopClick}
              disabled={isDisabled || isProcessing}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <StopCircle size={20} />
              {t('voiceInputAnswer.stopRecording') || 'Stop Recording'}
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 p-4 sm:p-6 bg-secondary/10 rounded-xl">
            <Loader2 size={20} className="animate-spin text-secondary" />
            <span className="text-foreground font-body text-sm sm:text-base">
              {t('voiceInputAnswer.processing') || 'Processing audio...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInputAnswer;
