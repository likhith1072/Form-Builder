import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Form() {
  const { formId } = useParams();
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/form/${formId}`)
      .then(res => res.json())
      .then(data => setFormData(data))
      .catch(err => console.error("Error fetching form:", err));
  }, [formId]);

  const handleDropCategory = (itemId, categoryName, questionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [itemId]: categoryName
      }
    }));
  };

  function handleDropBlank(questionId, blankIndex, value, fromBlankIndex) {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      const arr = newAnswers[questionId] ? [...newAnswers[questionId]] : [];

      // Remove from previous blank if moving
      if (fromBlankIndex !== null && fromBlankIndex !== undefined) {
        const fromIdx = arr.findIndex(b => b.tokenIndex === fromBlankIndex);
        if (fromIdx > -1) arr.splice(fromIdx, 1);
      }

      // Remove any existing answer in target blank (replace)
      const existingIdx = arr.findIndex(b => b.tokenIndex === blankIndex);
      if (existingIdx > -1) arr.splice(existingIdx, 1);

      arr.push({ tokenIndex: blankIndex, chosenAnswer: value });

      newAnswers[questionId] = arr;
      return newAnswers;
    });
  }


  const handleMCQSelect = (questionId, mcqId, index) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [mcqId]: index
      }
    }));
  };

  const handleSubmit = () => {
    fetch(`/api/form/saveanswers/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId,
        answers
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Answers saved:", data);
        //toast.success("Answers saved successfully");
        navigate("/");
      })
      .catch(err => console.error("Error saving answers:", err));
  };

  if (!formData) return <p className="text-gray-500">Loading form...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{formData.name}</h1>

      {formData.questions.map((question,index) => {
        switch (question.type) {
          case "category":
            return (
              <div key={question.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{index+1}. Category Question</h3>

                {/* Pool of unassigned items */}
                <div className="flex gap-3 flex-wrap mb-4">
                  {question.items
                    .filter(
                      item => !(answers[question.id] && answers[question.id][item.id])
                    )
                    .map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e =>
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({ itemId: item.id })
                          )
                        }
                        className="border border-gray-300 px-3 py-1 rounded cursor-grab bg-white shadow-sm"
                      >
                        {item.text}
                      </div>
                    ))}
                </div>

                {/* Categories */}
                <div className="flex gap-4 justify-center">
                  {question.categories.map(cat => (
                    <div
                      key={cat}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        const { itemId } = JSON.parse(
                          e.dataTransfer.getData("application/json")
                        );
                        handleDropCategory(itemId, cat, question.id);
                      }}
                      className="border-2 border-dashed border-gray-500 p-3 mt-3 rounded bg-gray-50 min-h-[150px] w-48"
                    >
                      <b className="block mb-2">{cat}</b>
                      <ul className="list-disc ml-4 flex flex-col gap-1">
                        {Object.entries(answers[question.id] || {})
                          .filter(([_, category]) => category === cat)
                          .map(([itemId]) => {
                            const text = question.items.find(it => it.id === itemId)?.text;
                            return (
                              <li
                                key={itemId}
                                draggable
                                onDragStart={e =>
                                  e.dataTransfer.setData(
                                    "application/json",
                                    JSON.stringify({ itemId })
                                  )
                                }
                                className="cursor-grab bg-white px-2 py-1 rounded shadow-sm"
                              >
                                {text}
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );


          case "blank":
            return (
              <div key={question.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {index+1}. Fill in the Blanks Question
                </h3>

                <p className="mb-3 flex items-center">
                  {question.text.split(" ").map((word, i) => {
                    const blank = question.blanks.find(b => b.tokenIndex === i);
                    if (blank) {
                      const chosenObj = (answers[question.id] || []).find(
                        b => b.tokenIndex === i
                      );
                      const chosenAnswer = chosenObj?.chosenAnswer;

                      return (
                        <span
                          key={i}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            const draggedData = JSON.parse(
                              e.dataTransfer.getData("application/json")
                            );

                            handleDropBlank(
                              question.id,
                              i,
                              draggedData.value,
                              draggedData.fromBlankIndex
                            );
                          }}
                          className="inline-block min-w-[80px] min-h-[20px] border border-gray-500 rounded-sm text-center m-1"
                        >
                          {chosenAnswer && (
                            <div
                              draggable
                              onDragStart={e =>
                                e.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify({
                                    value: chosenAnswer,
                                    fromBlankIndex: i
                                  })
                                )
                              }
                              className="inline-block bg-blue-100 w-full  rounded cursor-grab"
                            >
                              {chosenAnswer}
                            </div>
                          )}
                        </span>
                      );
                    }
                    return word + " ";
                  })}
                </p>

                {/* Options List */}
                <div className="flex gap-3 flex-wrap">
                  {question.options.map((opt, idx) => {
                    // Check if option is already in a blank
                    const isUsed = (answers[question.id] || []).some(
                      b => b.chosenAnswer === opt
                    );
                    if (isUsed) return null;

                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={e =>
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              value: opt,
                              fromBlankIndex: null
                            })
                          )
                        }
                        className="border border-gray-300 px-3 py-1 rounded cursor-grab bg-white shadow-sm"
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            );

          case "comprehension":
            return (
              <div key={question.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{index+1}. Comprehension Question</h3>
                {question.image && (
                <img
                  src={question.image}
                  alt="ComprehensionImage"
                  className="w-80 h-40 object-contain mx-auto"
                />
              )}
                <p className="mb-3">{question.passage}</p>
                {question.mcqs.map((mcq,i) => (
                  <div key={mcq.id} className="mb-3 flex">
                    <div>{index+1}.{i+1}</div>
                    <div>{mcq.image && (
                    <img
                      src={mcq.image}
                      alt="ComprehensionMCQImage"
                      className="w-80 h-40 object-contain mx-auto"
                    />
                  )}
                    <p className="font-medium">{mcq.question}</p>
                    {mcq.options.map((opt, i) => (
                      <label key={i} className="block">
                        <input
                          type="radio"
                          name={`${question.id}-${mcq.id}`}
                          checked={answers[question.id]?.[mcq.id] === i}
                          onChange={() =>
                            handleMCQSelect(question.id, mcq.id, i)
                          }
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}</div>
                    
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded shadow hover:bg-blue-700"
      >
        Submit
      </button>

    </div>
  );
}
