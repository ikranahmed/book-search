import express from 'express';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resoolvers } from './schemas';
import { resolvers } from './schemas/resolvers';
import { authMiddleware } from './config/auth';
import db from './config/connection';

const PORT = process.env.PORT || 3001;
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

async function startApolloServer() {
  await server.start();
  

  server.applyMiddleware({ app });


  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Express server running on port ${PORT}`);
      console.log(`🚀 GraphQL ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startApolloServer();
