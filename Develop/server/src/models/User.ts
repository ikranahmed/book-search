import { Schema, model, type Document } from 'mongoose';
import bcrypt from 'bcryptjs'; 
import bookSchema from './Book';
import type { BookDocument } from './Book';

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Must use a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    savedBooks: [bookSchema]
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password; 
        delete ret.__v; 
        return ret;
      }
    },
    timestamps: true 
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual('bookCount').get(function () {
  return this.savedBooks?.length || 0;
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = model<UserDocument>('User', userSchema);

export default User;