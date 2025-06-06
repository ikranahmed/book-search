import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { User } from '../models/User';
import { Book } from '../models/Book';

const SavedBooks = () => {
  const { loading, data } = useQuery(ADD_USER);
  const [removeBook] = useMutation(REMOVE_BOOK);
  
  const userData: User = data?.me || {
    username: '',
    savedBooks: []
  };

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
        // context: {
        //   headers: {
        //     authorization: `Bearer ${token}`
        //   }
        // },
        // update(cache) {
        //   const { me } = (cache.readQuery({ query: ADD_USER }) as { me: typeof userData } | null) || { me: userData };
        //     cache.writeQuery({
        //     query: ADD_USER,
        //     data: { 
        //       me: { 
        //       ...me, 
        //       savedBooks: me?.savedBooks.filter((book: any) => book.bookId !== bookId) 
        //       } 
        //     }
        //     });
        // }
      });

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book: Book) => (
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant='top'
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors?.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className='btn-block btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;