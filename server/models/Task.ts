import { Schema, model } from 'mongoose'

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  },
  { timestamps: true }, // adds createdAt and updatedAt
)

export default model('Task', taskSchema)
