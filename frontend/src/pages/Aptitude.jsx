import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTestStore } from "../store/useTestStore";

function Aptitude() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { round } = state || {};

  if (!round) return <p>Invalid navigation</p>;

  const qns = round.questions;

  const [currentQnIndex, setCurrentQnIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { evaluateAptitude } = useTestStore();

  const currentQuestion = qns[currentQnIndex];

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    const data = {
      testIndex: state.index,
      roundIndex: state.rIndex,
      roundType: round.roundType,
      answers,
    };

    await evaluateAptitude(data);
    navigate("/practice");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {round.roundType}
      </h2>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">
          Question {currentQnIndex + 1} / {qns.length}
        </p>

        <p className="font-medium mb-4">
          {currentQuestion.question}
        </p>

        {currentQuestion.options.map(opt => (
          <label
            key={opt}
            className="flex items-center gap-2 mb-2 cursor-pointer"
          >
            <input
              type="radio"
              name={currentQuestion._id}
              checked={answers[currentQuestion._id] === opt}
              onChange={() =>
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion._id]: opt,
                }))
              }
              disabled={submitted}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          className="btn btn-outline"
          disabled={currentQnIndex === 0}
          onClick={() => setCurrentQnIndex(i => i - 1)}
        >
          Previous
        </button>

        {currentQnIndex < qns.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQnIndex(i => i + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitted}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default Aptitude;
