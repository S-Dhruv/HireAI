import { useAIStore } from "../store/useAIStore";
import { useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const roundRouteMap = {
  "Aptitude Round": "/aptitude",
  "Telephonic Round": "/telephonic",
  "DSA Round": "/dsa",
  "Technical Round": "/technical-interview",
  "HR Round": "/hr",
};

const TestCard = ({ id }) => {
  const { tests, getTests, isLoadingRounds } = useAIStore();
  const [expandedFeedback, setExpandedFeedback] = useState({});

  useEffect(() => {
    if (id) getTests(id);
  }, [id, getTests]);

  const toggleFeedback = (testIndex, roundIndex) => {
    const key = `${testIndex}-${roundIndex}`;
    setExpandedFeedback((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoadingRounds) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  if (!tests.length) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No tests found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {tests.map((test, index) => (
        <div
          key={index}
          className="card bg-base-100 shadow-md border border-base-200"
        >
          <div className="card-body">
            <h2 className="card-title text-primary">
              {test.testName}
            </h2>

            <p className="text-sm text-gray-500">
              Total Rounds: {test.numberOfRounds}
            </p>

            <div className="divider my-2" />

            {test.rounds?.map((round, rIndex) => {
              const route = roundRouteMap[round.roundType];
              const key = `${index}-${rIndex}`;
              const isExpanded = expandedFeedback[key];

              return (
                <div
                  key={rIndex}
                  className="p-4 rounded-lg border border-base-300 bg-base-50"
                >
                  <h3 className="font-semibold text-accent mb-1">
                    {round.roundType}
                  </h3>

                  <div className="flex items-center gap-4 flex-wrap mt-2">

                    {/* Take Test */}
                    {!round.status && route && (
                      <Link
                        to={route}
                        state={{ test, index, round, rIndex }}
                        className="btn btn-primary btn-sm"
                      >
                        Take Test
                      </Link>
                    )}

                    {/* Score (ONLY if scorable + completed) */}
                    {round.status && round.isScorable && (
                      <span className="text-sm font-semibold text-success">
                        Score: {round.score}
                      </span>
                    )}

                    {/* Toggle Feedback (ONLY if non-scorable + completed) */}
                    {round.status && !round.isScorable && (
                      <button
                        onClick={() => toggleFeedback(index, rIndex)}
                        className="btn btn-outline btn-sm flex items-center gap-2"
                      >
                        {isExpanded ? "Hide Feedback" : "View Feedback"}
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    )}

                    <span
                      className={`badge ${
                        round.status
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {round.status ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {/* Feedback Content */}
                  {round.status && !round.isScorable && isExpanded && (
                    <div className="mt-4 p-4 bg-base-200 rounded-lg border border-base-300">
                      <p className="text-sm whitespace-pre-line">
                        {round.feedback || "No feedback available."}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCard;
