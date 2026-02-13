import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useTestStore } from "../store/useTestStore";
import RecordRTC from "recordrtc";

function Telephonic() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { round } = state || {};

  if (!round) return <p>Invalid navigation</p>;

  const questions = round.questions;

  const [currentQnIndex, setCurrentQnIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(new Set());
  const timerRef = useRef(null);

  const { transcribeAudio, evaluateTelephonic } = useTestStore();

  const currentQuestion = questions[currentQnIndex];
  const isLocked = lockedQuestions[currentQuestion._id];

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // ✅ FIX: Only cleanup on component unmount, NOT when isRecording changes
  useEffect(() => {
    return () => {
      // This only runs when component unmounts
      console.log("🧹 Component unmounting, cleaning up...");
      
      if (recorderRef.current) {
        try {
          if (recorderRef.current.getState() === 'recording') {
            recorderRef.current.stopRecording();
          }
        } catch (e) {
          console.log("Cleanup recorder error:", e);
        }
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          console.log("🛑 Stopping track on unmount:", track.label);
          track.stop();
        });
        streamRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // ✅ Empty dependency array - only run on unmount

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRecording || loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRecording, loading]);

  const startRecording = async () => {
    console.log("🎤 startRecording called");
    
    if (isRecording || isLocked) {
      console.log("❌ Blocked: isRecording=", isRecording, "isLocked=", isLocked);
      return;
    }

    setError(null);
    setRecordingTime(0);

    try {
      console.log("📡 Requesting microphone access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;

      // Check track health
      const audioTracks = stream.getAudioTracks();
      console.log("🎵 Audio tracks:", audioTracks.length);
      
      if (audioTracks.length === 0) {
        throw new Error("No audio tracks found in stream");
      }

      audioTracks.forEach((track, i) => {
        console.log(`Track ${i}:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label
        });
        
        // Monitor for unexpected track ending
        track.onended = () => {
          //consolee.error("⚠️ Track ended unexpectedly!");
          if (isRecording) {
            setError("Microphone disconnected. Please check permissions and try again.");
            setIsRecording(false);
          }
        };

        track.onmute = () => {
          console.warn("⚠️ Track muted!");
        };
      });

      // Verify track is actually live
      const track = audioTracks[0];
      if (track.readyState !== 'live') {
        throw new Error(`Track not live. State: ${track.readyState}`);
      }

      console.log("🔧 Creating RecordRTC recorder");

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        timeSlice: 1000,
        ondataavailable: (blob) => {
          console.log("📦 Data chunk:", blob.size, "bytes");
        }
      });

      recorderRef.current = recorder;

      console.log("▶️ Starting recording");
      recorder.startRecording();
      setIsRecording(true);
      console.log("✅ Recording started successfully");

    } catch (error) {
      console.error("❌ Failed to start recording:", error);
      
      let errorMessage = "Failed to start recording. ";
      
      if (error.name === "NotAllowedError") {
        errorMessage = "🚫 Microphone permission denied!\n\n" +
          "Please:\n" +
          "1. Check Windows Settings → Privacy → Microphone\n" +
          "2. Enable microphone for your browser\n" +
          "3. Click 'Allow' when browser asks for permission";
      } else if (error.name === "NotFoundError") {
        errorMessage = "🎤 No microphone detected!\n\n" +
          "Please connect a microphone and try again.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "⚠️ Microphone is being used by another application!\n\n" +
          "Please close other apps and try again.";
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    console.log("⏹️ stopRecording called");
    
    if (!recorderRef.current || !isRecording) {
      console.log("❌ No recorder or not recording");
      return;
    }

    // Check minimum duration BEFORE processing
    if (recordingTime < 2) {
      const confirmShort = window.confirm(
        `Recording is only ${recordingTime} second(s). This might be too short.\n\n` +
        `Continue anyway? (Recommended: 3+ seconds)`
      );
      
      if (!confirmShort) {
        return;
      }
    }

    console.log("🛑 Stopping recorder");
    setIsRecording(false);
    
    recorderRef.current.stopRecording(async () => {
      console.log("✅ Recording stopped, processing...");
      
      const qId = currentQuestion._id;

      if (processingRef.current.has(qId)) {
        console.log("⚠️ Already processing this question");
        return;
      }
      if (answers[qId]) {
        console.log("⚠️ Answer already exists");
        return;
      }

      processingRef.current.add(qId);

      try {
        setLoading(true);
        setError(null);

        const audioBlob = recorderRef.current.getBlob();
        console.log("💾 Audio blob:", {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: recordingTime + "s"
        });

        // Validate blob size BEFORE sending
        if (audioBlob.size < 1000) {
          throw new Error(
            `Recording too small (${audioBlob.size} bytes).\n\n` +
            `This usually means:\n` +
            `1. Windows Privacy Settings blocked microphone\n` +
            `2. Recording was too short\n` +
            `3. Browser permissions issue\n\n` +
            `Please check:\n` +
            `- Windows Settings → Privacy → Microphone → Enable for browser\n` +
            `- Browser microphone permissions\n` +
            `- Try Chrome or Edge browser`
          );
        }

        console.log("📤 Sending to transcription service...");
        
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        const transcript = await transcribeAudio(formData);

        console.log("✅ Transcription received:", transcript.substring(0, 50) + "...");

        setAnswers((prev) => ({
          ...prev,
          [qId]: transcript,
        }));

        setError(null);

      } catch (error) {
        console.error("❌ Processing error:", error);
        
        let errorMsg = "Transcription failed. ";
        
        if (error.response) {
          errorMsg += error.response.data?.message || error.response.statusText;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setError(errorMsg);
        alert(errorMsg + "\n\nThis answer has been locked.");
        
      } finally {
        setLockedQuestions((prev) => ({
          ...prev,
          [qId]: true,
        }));

        setLoading(false);
        setRecordingTime(0);

        // Clean up stream after processing
        if (streamRef.current) {
          console.log("🧹 Cleaning up stream after recording");
          streamRef.current.getTracks().forEach((track) => {
            console.log("🛑 Stopping track:", track.label);
            track.stop();
          });
          streamRef.current = null;
        }

        processingRef.current.delete(qId);
      }
    });
  };

  const handleNext = () => {
    if (!answers[currentQuestion._id]) {
      alert("Please record your answer before proceeding.");
      return;
    }
    
    setError(null);
    setCurrentQnIndex((i) => i + 1);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    
    if (!answers[currentQuestion._id]) {
      alert("Please record your answer before submitting.");
      return;
    }
    
    setSubmitted(true);

    const data = {
      testIndex: state.index,
      roundIndex: state.rIndex,
      roundType: round.roundType,
      answers,
    };

    try {
      await evaluateTelephonic(data);
      navigate("/practice");
    } catch (error) {
      console.error("Submit error:", error);
      alert("Submission failed. Please try again.");
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {round.roundType}
      </h2>

      <p className="text-sm text-gray-500 mb-1">
        Question {currentQnIndex + 1} / {questions.length}
      </p>

      <p className="font-medium mb-6">
        {currentQuestion.question}
      </p>

      {/* Recording Timer */}
      {isRecording && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-800 font-semibold">Recording...</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-red-700 font-mono text-lg">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-blue-800 font-semibold">
              Transcribing your answer... Please wait.
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold mb-1">Error</p>
              <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Record Button */}
      <button
        onClick={() => {
          console.log("🔘 Button clicked", { isRecording, loading, isLocked });
          isRecording ? stopRecording() : startRecording();
        }}
        disabled={loading || isLocked}
        className={`btn w-full ${
          isRecording ? "btn-error animate-pulse" : "btn-primary"
        }`}
      >
        <Mic className="w-4 h-4 mr-2" />
        {isLocked
          ? "Answer Locked"
          : isRecording
          ? `Stop Recording (${formatTime(recordingTime)})`
          : "Start Recording"}
      </button>

      {/* Transcript Display */}
      {answers[currentQuestion._id] && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-semibold">Answer Recorded</p>
          </div>
          <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-100">
            {answers[currentQuestion._id]}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        {currentQnIndex < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!answers[currentQuestion._id]}
          >
            Next Question →
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!answers[currentQuestion._id] || submitted}
          >
            {submitted ? "Submitting..." : "Submit Test"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Telephonic;