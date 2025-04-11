import { Schema, type Document } from 'mongoose';

export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;  // Made optional
  link?: string;   // Made optional
}

const bookSchema = new Schema<BookDocument>({
  authors: {
    type: [String],
    default: []  // Explicit default value
  },
  description: {
    type: String,
    required: true
  },
  bookId: {
    type: String,
  },
  image: {
    type: String,
    default: ''  // Default empty string
  },
  link: {
    type: String,
    default: ''  // Default empty string
  },
  title: {
    type: String,
    required: true,
    trim: true   // Auto-trim whitespace
  }
}, {
  _id: false,    
  versionKey: false 
});

export default bookSchema;