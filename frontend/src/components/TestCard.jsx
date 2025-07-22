import { useAIStore } from "../store/useAIStore";
import { useEffect } from "react";
import { Loader2 } from "lucide-react"; // optional icon
import { Link } from "react-router-dom"; // if you want navigation

const TestCard = ({ id }) => {
  const { tests, getTests, isLoadingRounds } = useAIStore();

  useEffect(() => {
    if (id) getTests(id);
  }, [id, getTests]);

  if (isLoadingRounds) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin w-6 h-6 text-primary" />
      </div>
    );
  }

  if (!tests.length) {
    return <div className="text-center text-gray-500 mt-10">No tests found.</div>;
  }

return (
  <div className="flex flex-col gap-6 p-4">
    {tests.map((test, index) => (
      <div key={index} className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-primary">{test.testName}</h2>
          <p className="text-sm text-gray-500">
            Total Rounds: {test.numberOfRounds}
          </p>
          <div className="divider my-2" />
          {test.rounds?.map((round, rIndex) => (
            <div key={rIndex} className="mb-4">
              <Link className="text-accent font-semibold">{round.roundType}</Link>
              <p className="text-sm italic mb-1">{round.description}</p>

              {/* {round.isScorable && (
                <p className="text-sm text-success">Score: {round.score} / 10</p>
              )}
              {round.feedback && (
                <p className="text-sm text-warning">Feedback: {round.feedback}</p>
              )} */}

              {/* <details className="collapse collapse-arrow bg-base-200 mt-2">
                <summary className="collapse-title text-sm font-medium">
                  Questions ({round.qnASchema?.length || 0})
                </summary>
                <div className="collapse-content">
                  {round.qnASchema?.map((qna, qIndex) => (
                    <div
                      key={qIndex}
                      className="mb-3 p-2 bg-base-100 border border-gray-200 rounded"
                    >
                      <p className="font-medium">{qna.question}</p>
                      <ul className="list-disc list-inside text-sm ml-2">
                        {qna.options.map((opt, i) => (
                          <li
                            key={i}
                            className={
                              opt === qna.correctAnswer
                                ? "text-green-600 font-semibold"
                                : ""
                            }
                          >
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details> */}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

};

export default TestCard;
