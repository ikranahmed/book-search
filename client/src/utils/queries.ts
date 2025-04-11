import { gql } from '@apollo/client';

export const ADD_USER = gql`
  query Me {
    me {
      _id
      username
      savedBooks {
        bookId
        title
      }
    }
  }
`;