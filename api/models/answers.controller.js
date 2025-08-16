// models/Answer.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnswersSchema = new Schema({ //after we implement role based access we should add userId as well
  formId: { type: String, required: true }, // ID of the form
  answers: { type: Object, required: true }, // { questionId: { itemId: categoryName } }
}, { timestamps: true });

const Answers = mongoose.model('Answers', AnswersSchema);

export default Answers;
