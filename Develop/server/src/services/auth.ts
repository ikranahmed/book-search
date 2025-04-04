import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import User from '../models/User';


const secret = process.env.JWT_SECRET_KEY || 'your-strong-secret-key-here';
const expiration = '2h'; // Token expiration time

interface AuthContext {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface TokenPayload {
  _id: string;
  username: string;
  email: string;
}

export const authMiddleware = ({ req }: { req: any }): AuthContext => {
  let token = req.headers.authorization || '';


  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return { user: undefined };
  }

  try {
    const { _id, username, email } = jwt.verify(token, secret) as TokenPayload;
    return { user: { _id, username, email } };
  } catch (err) {
    throw new GraphQLError('Invalid or expired token', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    });
  }
};

export const signToken = (user: { _id: string; username: string; email: string }): string => {
  const payload = { 
    _id: user._id, 
    username: user.username, 
    email: user.email 
  };

  return jwt.sign(payload, secret, { expiresIn: expiration });
};