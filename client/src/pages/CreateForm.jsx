import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import { MdDragIndicator } from "react-icons/md";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function CreateForm() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    questions: []
  });

  const [formId, setFormId] = useState(null);

  const [fileName, setFileName] = useState("No file chosen");
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);


  const addCategoryQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: crypto.randomUUID(),
          type: "category",
          order: prev.questions.length,
          categories: [],
          items: []
        }
      ]
    }));
  };

  const addBlankQuestion = (initialText = "") => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: crypto.randomUUID(),
          type: "blank",
          order: prev.questions.length,
          text: initialText,
          blanks: [],
          options: []
        }
      ]
    }));
  };

  const addComprehension = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: crypto.randomUUID(),
          type: "comprehension",
          order: prev.questions.length,
          passage: "",
          mcqs: []
        }
      ]
    }));
  };

  const setPassage = (qid, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid && q.type === "comprehension"
          ? { ...q, passage: value }
          : q
      )
    }));
  };

  const addMcq = qid => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qid && q.type === "comprehension") {
          return {
            ...q,
            mcqs: [
              ...q.mcqs,
              {
                id: crypto.randomUUID(),
                question: "",
                options: ["", "", "", ""],//here we can add dynamic number of options just like mcqs
                correctOptionIndex: 0
              }
            ]
          };
        }
        return q;
      })
    }));
  };

  const updateMcq = (qid, mcqId, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qid && q.type === "comprehension") {
          return {
            ...q,
            mcqs: q.mcqs.map(m =>
              m.id === mcqId ? { ...m, [field]: value } : m
            )
          };
        }
        return q;
      })
    }));
  };

  const updateMcqOption = (qid, mcqId, index, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qid && q.type === "comprehension") {
          return {
            ...q,
            mcqs: q.mcqs.map(m =>
              m.id === mcqId
                ? {
                  ...m,
                  options: m.options.map((opt, i) =>
                    i === index ? value : opt
                  )
                }
                : m
            )
          };
        }
        return q;
      })
    }));
  };

  const addCategory = (qid, name) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid && q.type === "category"
          ? { ...q, categories: [...q.categories, name] }
          : q
      )
    }));
  };



  const toggleBlankAtToken = (qid, tokenIndex, tokenText) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qid && q.type === "blank") {
          const exists = q.blanks.find(b => b.tokenIndex === tokenIndex);
          let blanks = exists
            ? q.blanks.filter(b => b.tokenIndex !== tokenIndex)
            : [...q.blanks, { tokenIndex, answer: tokenText }];

          const answers = blanks.map(b => b.answer);

          const distractors = q.options.filter(
            opt => !answers.includes(opt) && opt !== tokenText
          );
          const options = Array.from(new Set([...answers, ...distractors]));
          return { ...q, blanks, options };
        }
        return q;
      })
    }));
  };

  const addBlankDistractor = (qid, text) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid && q.type === "blank"
          ? { ...q, options: Array.from(new Set([...q.options, text])) }
          : q
      )
    }));
  };

  const navigate = useNavigate();



  // 🔹 Helper function to generate slug from form name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""); // remove extra hyphens
  };

  const handleNameChange = (value) => {
    const slug = generateSlug(value);
    setForm((prev) => ({
      ...prev,
      name: value,
      slug
    }));
  };

  const saveForm = async () => {
    if (!formId) {
      try {
        const res = await fetch("/api/form/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error("Failed to save");
        const data = await res.json();
        setFormId(data._id);
        // toast("Form saved successfully!");
      } catch (err) {
        console.error(err);
        // toast.error("Error saving form");
      }
    }
    else {
      await fetch(`/api/form/updateform/${formId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };

  const saveAndProceed = async () => {
    if (!formId) {
      try {
        const res = await fetch("/api/form/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error("Failed to save");
        const data = await res.json();
        setFormId(data._id);
        navigate(`/form/${data._id}`);
        // toast("Form saved successfully!");
      } catch (err) {
        console.error(err);
        // toast.error("Error saving form");
      }
    }
    else {
      try {
        const res = await fetch(`/api/form/updateform/${formId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error("Failed to save");
        const data = await res.json();
        navigate(`/form/${data._id}`);
        // toast("Form saved successfully!");
      } catch (err) {
        console.error(err);
        // toast.error("Error saving form");
      }
    }
  };

  const removeBlankDistractor = (qid, opt) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid && q.type === "blank"
          ? { ...q, options: q.options.filter(o => o !== opt) }
          : q
      )
    }));
  };

  const removeQuestion = (qid) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qid)
    }));
  }

  const removeMCQ = (qid, mcqId) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === qid && q.type === "comprehension") {
          return {
            ...q,
            mcqs: q.mcqs.filter(m => m.id !== mcqId)
          };
        }
        return q;
      })
    }));
  };

  const handleComprehensionUploadImage = async (qid) => {
    try {
      if (!file) {
        setImageUploadError("Please select a file to upload");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error.message);
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadError(null);
            setImageUploadProgress(null);
            setFileName("No file Chosen");
            setFile(null);
            setForm(prev => ({
              ...prev,
              questions: prev.questions.map(q => {
                if (q.id === qid && q.type === "comprehension") {
                  return {
                    ...q,
                    image: downloadURL
                  };
                }
                return q;
              })
            }));
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image Upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleMCQUploadImage = async (qid, mcqId) => {
    try {
      if (!file) {
        setImageUploadError("Please select a file to upload");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error.message);
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadError(null);
            setImageUploadProgress(null);
            setFileName("No file Chosen");
            setFile(null);
            setForm(prev => ({
              ...prev,
              questions: prev.questions.map(q => {
                if (q.id === qid && q.type === "comprehension") {
                  return {
                    ...q,
                    mcqs: q.mcqs.map(m => {
                      if (m.id === mcqId) {
                        return { ...m, image: downloadURL };
                      }
                      return m;
                    })
                  };
                }
                return q;
              })
            }));
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image Upload failed");
      setImageUploadProgress(null);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };




  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-xl font-bold cursor-pointer" onClick={() => navigate(-1)}>{"<- Go Back"}</div>
      <h1 className="text-3xl font-bold mb-6 mt-2 text-gray-800">Create a New Form</h1>

      <div className="mb-6 flex gap-1 items-center ">
        <label className="block font-medium mb-1">Form Name:</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter form name"
          className="border px-3 py-2 rounded "
        />
      </div>

      <div className="mb-6 flex gap-1 items-center ">
        <label className="block font-medium mb-1">Slug:</label>
        <input
          type="text"
          value={form.slug}
          readOnly
          className="border px-3 py-2 rounded  "
        />
      </div>

      {form.questions.map((q, idx) => (
        <div
          key={q.id}
          className="border rounded-lg p-4 mb-6 shadow-sm bg-white"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold mb-4">
              {idx + 1}. {q.type.toUpperCase()}
            </h3>
            <button className="text-red-500 hover:text-red-700 hover:bg-gray-50 p-1 mb-2 flex items-center border border-gray-500 rounded-md cursor-pointer" onClick={() => removeQuestion(q.id)}><AiOutlineDelete /> Remove this Question</button>
          </div>


          {/* CATEGORY UI */}
          {q.type === "category" && (
            <div className="space-y-4">
              {/* Categories Section */}
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter category"
                    className="border px-3 py-2 rounded flex-1"
                    id={`newCat-${q.id}`}
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                    onClick={() => {
                      const catInput = document.getElementById(`newCat-${q.id}`);
                      if (catInput.value.trim()) {
                        addCategory(q.id, catInput.value.trim());
                        catInput.value = "";
                      }
                    }}
                  >
                    Add Category
                  </button>
                </div>

                <ul className="list-disc list-inside text-gray-700">
                  {q.categories.map((c, i) => (
                    <li key={i} className="flex gap-3 items-center">
                      <span>{i + 1}. {c}</span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            questions: prev.questions.map(qq =>
                              qq.id === q.id
                                ? {
                                  ...qq,
                                  categories: qq.categories.filter(cat => cat !== c),
                                  items: qq.items.filter(it => it.correctCategory !== c),
                                }
                                : qq
                            ),
                          }))
                        }
                      >
                        <AiOutlineDelete />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Items Section */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>


                <div className="space-y-2">
                  {q.items.map(it => (
                    <div
                      key={it.id}
                      className="flex gap-2 items-center p-2 rounded"

                    >
                      {/* Item Text */}
                      <div className="flex items-center" draggable
                        onDragStart={e => {
                          e.dataTransfer.setData("draggedId", it.id);
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          const draggedId = e.dataTransfer.getData("draggedId");
                          if (draggedId && draggedId !== it.id) {
                            setForm(prev => ({
                              ...prev,
                              questions: prev.questions.map(qq =>
                                qq.id === q.id
                                  ? {
                                    ...qq,
                                    items: qq.items.map(item => {
                                      // swap texts if matched
                                      if (item.id === draggedId) {
                                        return { ...item, text: it.text };
                                      }
                                      if (item.id === it.id) {
                                        const draggedItem = qq.items.find(
                                          i => i.id === draggedId
                                        );
                                        return { ...item, text: draggedItem?.text || "" };
                                      }
                                      return item;
                                    }),
                                  }
                                  : qq
                              ),
                            }));
                          }
                        }}>
                        <label htmlFor={`item-text-${it.id}`} className="cursor-pointer"> <MdDragIndicator className="text-gray-500 cursor-move" size={20} /></label>
                        <input
                          type="text"
                          id={`item-text-${it.id}`}

                          value={it.text}
                          onChange={e =>
                            setForm(prev => ({
                              ...prev,
                              questions: prev.questions.map(qq =>
                                qq.id === q.id
                                  ? {
                                    ...qq,
                                    items: qq.items.map(item =>
                                      item.id === it.id
                                        ? { ...item, text: e.target.value }
                                        : item
                                    ),
                                  }
                                  : qq
                              ),
                            }))
                          }
                          placeholder="Item text"
                          className="border px-2 py-1 rounded flex"
                        />
                      </div>

                      {/* Category Select */}
                      <select
                        value={it.correctCategory}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            questions: prev.questions.map(qq =>
                              qq.id === q.id
                                ? {
                                  ...qq,
                                  items: qq.items.map(item =>
                                    item.id === it.id
                                      ? { ...item, correctCategory: e.target.value }
                                      : item
                                  ),
                                }
                                : qq
                            ),
                          }))
                        }
                        className="border px-2 py-1 rounded"
                      >
                        <option value="">Select Category</option>
                        {q.categories.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      {/* Delete Item */}
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            questions: prev.questions.map(qq =>
                              qq.id === q.id
                                ? {
                                  ...qq,
                                  items: qq.items.filter(item => item.id !== it.id),
                                }
                                : qq
                            ),
                          }))
                        }
                      >
                        <AiOutlineDelete />
                      </button>
                    </div>
                  ))}
                  <button
                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 mb-3"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        questions: prev.questions.map(qq =>
                          qq.id === q.id
                            ? {
                              ...qq,
                              items: [
                                ...qq.items,
                                { id: crypto.randomUUID(), text: "", correctCategory: "" },
                              ],
                            }
                            : qq
                        ),
                      }))
                    }
                  >
                    + Add Item
                  </button>
                </div>
              </div>

            </div>
          )}


          {/* BLANK UI */}
          {q.type === "blank" && (
            <div className="space-y-4">
              <textarea
                value={q.text}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    questions: prev.questions.map(qq =>
                      qq.id === q.id
                        ? { ...qq, text: e.target.value }
                        : qq
                    )
                  }))
                }
                placeholder="Enter full question text"
                className="border px-3 py-2 rounded w-full"
              />
              <h2 className="font-medium">Click on the words where you want a blank:</h2>
              <div className="flex flex-wrap gap-2">
                {q.text.split(" ").map((word, i) => {
                  const isBlank = q.blanks.some(b => b.tokenIndex === i);
                  return (
                    <span
                      key={i}
                      className={`px-1 cursor-pointer ${isBlank ? "underline decoration-2 text-blue-600" : ""
                        }`}
                      onClick={() => toggleBlankAtToken(q.id, i, word)}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
              <h4 className="font-medium">Options:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {q.options.map((opt, i) => {
                  const isAnswer = q.blanks.some(b => b.answer === opt);
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span>{opt}</span>
                      {!isAnswer && (
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeBlankDistractor(q.id, opt)}
                        >
                          <AiOutlineDelete className="cursor-pointer" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>


              <input
                type="text"
                placeholder="Add distractor"
                className="border px-3 py-2 rounded w-full"
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addBlankDistractor(q.id, e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}

          {/* COMPREHENSION UI */}
          {q.type === "comprehension" && (
            <div className="space-y-4">
              {/* File Upload Section */}
              <div className="flex gap-4 items-center justify-between border-4 border-teal-600 border-dotted p-3">
                <div className="border border-gray-500 rounded-sm flex gap-2 items-center text-sm sm:text-md">
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="fileInput"
                    className="bg-blue-500 text-white px-4 py-2 cursor-pointer hover:bg-blue-600 font-semibold"
                  >
                    Choose File
                  </label>
                  <span className="text-gray-600 w-40 truncate dark:text-gray-300">{fileName}</span>
                </div>
                {/* Upload Button */}
                <button
                  type="button"
                  className="cursor-pointer borderdark:border-gray-800 rounded p-1 font-semibold bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                  onClick={() => { handleComprehensionUploadImage(q.id) }}
                  disabled={imageUploadProgress}
                >
                  {imageUploadProgress ? (
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 text-gray-300">
                      <CircularProgressbar
                        value={imageUploadProgress}
                        text={`${imageUploadProgress || 0}%`}
                      />
                    </div>
                  ) : (
                    "Upload Image"
                  )}
                </button>
              </div>

              {imageUploadError && (
                <div className="bg-red-100 text-red-400 rounded-sm p-1">
                  {imageUploadError}
                </div>
              )}

              {q.image && (
                <img
                  src={q.image}
                  alt="ComprehensionImage"
                  className="w-80 h-40 object-contain mx-auto"
                />
              )}
              <textarea
                value={q.passage}
                onChange={e => setPassage(q.id, e.target.value)}
                placeholder="Enter paragraph"
                className="border px-3 py-2 rounded w-full h-[200px]"
              />

              {q.mcqs.map((mcq, index) => (
                <div
                  key={mcq.id}
                  className="border rounded p-3 bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">MCQ Question:{index + 1}</h3>
                    <button
                      className="text-red-500 hover:text-red-700 hover:bg-gray-50 p-1 mb-2 flex items-center border border-gray-500 rounded-md cursor-pointer"
                      onClick={() => removeMCQ(q.id, mcq.id)}
                    >
                      <AiOutlineDelete className="cursor-pointer" />
                    </button>
                  </div>

                  {/* File Upload Section */}
                  <div className="flex gap-4 items-center justify-between border-4 border-teal-600 border-dotted p-3">
                    <div className="border border-gray-500 rounded-sm flex gap-2 items-center text-sm sm:text-md">
                      <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="fileInput"
                        className="bg-blue-500 text-white px-4 py-2 cursor-pointer hover:bg-blue-600 font-semibold"
                      >
                        Choose File
                      </label>
                      <span className="text-gray-600 w-40 truncate dark:text-gray-300">{fileName}</span>
                    </div>
                    {/* Upload Button */}
                    <button
                      type="button"
                      className="cursor-pointer borderdark:border-gray-800 rounded p-1 font-semibold bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                      onClick={() => { handleMCQUploadImage(q.id, mcq.id) }}
                      disabled={imageUploadProgress}
                    >
                      {imageUploadProgress ? (
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 text-gray-300">
                          <CircularProgressbar
                            value={imageUploadProgress}
                            text={`${imageUploadProgress || 0}%`}
                          />
                        </div>
                      ) : (
                        "Upload Image"
                      )}
                    </button>
                  </div>

                  {imageUploadError && (
                    <div className="bg-red-100 text-red-400 rounded-sm p-1">
                      {imageUploadError}
                    </div>
                  )}

                  {mcq.image && (
                    <img
                      src={mcq.image}
                      alt="ComprehensionMCQImage"
                      className="w-80 h-40 object-contain mx-auto"
                    />
                  )}

                  <input
                    type="text"
                    placeholder="MCQ question"
                    value={mcq.question}
                    onChange={e =>
                      updateMcq(q.id, mcq.id, "question", e.target.value)
                    }
                    className="border px-3 py-2 rounded w-full"
                  />
                  {mcq.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e =>
                          updateMcqOption(q.id, mcq.id, i, e.target.value)
                        }
                        className="border px-3 py-2 rounded flex-1"
                      />
                      <input
                        type="radio"
                        name={`correct-${mcq.id}`}
                        checked={mcq.correctOptionIndex === i}
                        onChange={() =>
                          updateMcq(q.id, mcq.id, "correctOptionIndex", i)
                        }
                      />
                      <span className="text-sm text-gray-600">Correct</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-center">
                <button
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                  onClick={() => addMcq(q.id)}
                >
                  + Add MCQ
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 mb-8 items-center justify-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addCategoryQuestion}
        >
          + Category Question
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => addBlankQuestion("")}
        >
          + Blank Question
        </button>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={addComprehension}
        >
          + Comprehension
        </button>
      </div>


      <div className="flex gap-3 mt-6 items-center justify-center">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 cursor-pointer"
          onClick={saveForm}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={saveAndProceed}
        >
          Save & Proceed
        </button>
      </div>

      
    </div>
  );
}
