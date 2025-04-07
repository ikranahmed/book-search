import { User } from '../models/index.js';
import { signToken } from '../services/auth.js';
import { GraphQLError } from 'graphql';


export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return await User.findById(context.user._id).select('-__v -password');
    },
    
    getUser: async (_: any, { id, username }: { id?: string, username?: string }) => {
      const foundUser = await User.findOne({
        $or: [{ _id: id }, { username }]
      }).select('-__v -password');

      if (!foundUser) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return foundUser;
    }
  },

  Mutation: {
    addUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          throw new GraphQLError('Username or email already exists', {
            extensions: { code: 'USER_EXISTS' }
          });
        }

        const user: {_id: any; username: string; email: string } = await User.create({ username, email, password });
        const token = signToken(user);
     
        
        return { token, user };
      } catch (error:any) {
        console.log(error);
        throw new GraphQLError(error.message, {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        const user = await User.findOne({ $or: [{ username: email }, { email }] });
        
        if (!user) {
          throw new GraphQLError('No user found with this email', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new GraphQLError('Incorrect password', {
            extensions: { code: 'INVALID_CREDENTIALS' }
          });
        }

        const token = signToken(user);
        return { token, user };
      } catch (error:any) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }
    },

    saveBook: async (_: any, { bookData }: { bookData: any }, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).select('-__v -password');

        if (!updatedUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }

        return updatedUser;
      } catch (error) {
        throw new GraphQLError('Failed to save book', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }
    },

    removeBook: async (_: any, { bookId }: { bookId: string }, context: any) => {
      try {
        if (!context.user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).select('-__v -password');

        if (!updatedUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }

        return updatedUser;
      } catch (error) {
        throw new GraphQLError('Failed to remove book', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }
    }
  }
};