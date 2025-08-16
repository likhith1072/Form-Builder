
import mongoose from 'mongoose';
const { Schema } = mongoose;


const McqSchema = new Schema({
  id: { type: String },                         
  question: { type: String, required: true },   // MCQ text
  options: { type: [String], required: true },  // ["A","B","C","D"]
  correctOptionIndex: { type: Number, required: true }, // 0-based
  image: { type: String }, 
}, { _id: false });

const BlankSchema = new Schema({
  tokenIndex: { type: Number, required: true },   // index in tokenized words 
  charStart: { type: Number },    // start in original text 
  charEnd: { type: Number },      // end in original text 

  answer: { type: String, required: true },     // the underlined word
}, { _id: false });

const CategorizedItemSchema = new Schema({
  id: { type: String },                         // "i1"
  text: { type: String, required: true },       // "Dog"
  correctCategory: { type: String, required: true } // "Mammals"
}, { _id: false });

/** --- Base question schema (embedded discriminators) --- */
const QuestionBaseSchema = new Schema({
  id: { type: String },              // "q1" (optional stable id)
  order: { type: Number },    // for ordering in the form        
}, {
  _id: false,
  discriminatorKey: 'type',          // "category" | "blank" | "comprehension"
});

/** --- Form schema --- */
const FormSchema = new Schema({
  name:   { type: String, required: true },          // e.g., "Unit Test 1"
  slug:   { type: String, required: true, unique: true }, // for /render/:slug
  // everything lives in one array, each element discriminates by "type"
  questions: [QuestionBaseSchema],
}, { timestamps: true });

/** --- Discriminators for each question type --- */

// 1) Category question (no question text)
FormSchema.path('questions').discriminator('category', new Schema({
  categories: { type: [String], required: true },     // ["Mammals","Birds"]
  items: { type: [CategorizedItemSchema], required: true },
}, { _id: false }));

// 2) Blank question
FormSchema.path('questions').discriminator('blank', new Schema({
  text:   { type: String, required: true },           // full sentence
  // these are the blanks you created by underlining
  blanks: { type: [BlankSchema], required: true },    // [{ tokenIndex, answer }, ...]
  // optional: pool of draggable choices shown to the student (answer + distractors)
  options: { type: [String], default: [] },           // derived from underlined + distractors
}, { _id: false }));

// 3) Comprehension question
FormSchema.path('questions').discriminator('comprehension', new Schema({
  passage: { type: String, required: true },
  image: { type: String },
  mcqs:    { type: [McqSchema], required: true }      // only MCQs for this task
}, { _id: false }));

const Form = mongoose.model('Form', FormSchema);

export default Form;
