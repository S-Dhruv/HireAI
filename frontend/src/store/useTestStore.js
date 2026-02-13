import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useTestStore = create((set, get) => ({
  activeTranscriptions: new Map(),

  evaluateAptitude: async (data) => {
    try {
      await axiosInstance.post("/tests/evaluate-test", data);
    } catch (error) {
      console.log(error);
    }
  },

  evaluateTelephonic: async (data) => {
    try {
      await axiosInstance.post("/tests/evaluate-test", data);
    } catch (error) {
      console.log(error);
    }
  },

  transcribeAudio: async (formData) => {
    const store = get();

    // Generate unique key from audio blob
    const audioFile = formData.get("audio");
    const key = `${audioFile.size}-${audioFile.type}`;

    // Return existing promise if already transcribing
    if (store.activeTranscriptions.has(key)) {
      return store.activeTranscriptions.get(key);
    }

    const transcriptionPromise = (async () => {
      try {
        const res = await axiosInstance.post(
          "/services/transcribe",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return res.data.transcript;
      } catch (error) {
        console.log("Transcription failed", error);
        throw error;
      } finally {
        // Clean up tracking
        set((state) => {
          const newMap = new Map(state.activeTranscriptions);
          newMap.delete(key);
          return { activeTranscriptions: newMap };
        });
      }
    })();

    // Track this request
    set((state) => ({
      activeTranscriptions: new Map(state.activeTranscriptions).set(
        key,
        transcriptionPromise
      ),
    }));

    return transcriptionPromise;
  },
}));