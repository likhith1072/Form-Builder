import Form from '../models/form.model.js';
import Answers from '../models/answers.controller.js';
// Create a new form
export const create = async (req, res) => {
  try {
    const form = new Form(req.body);
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all forms id's and names
export const getforms = async (req, res) => {
  try {
    const forms = await Form.find().select({ _id: 1, name: 1, slug: 1 });
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update a form by ID
export const updateform = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedForm = await Form.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true
    });

    if (!updatedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a form by ID
export const getform = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveanswers = async (req, res) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ error: "formId and answers are required" });
    }

    // Check if an answer document for this form already exists
    let existing = await Answers.findOne({ formId });

    if (existing) {
      // Update existing answers
      existing.answers = answers;
      await existing.save();
      return res.json({ message: "Answers updated successfully", data: existing });
    }

    // Create new answer document
    const newAnswer = new Answers({ formId, answers });
    await newAnswer.save();

    res.json({ message: "Answers saved successfully", data: newAnswer });
  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ error: "Server error" });
  }
};
