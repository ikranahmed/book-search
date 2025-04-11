import express from 'express';
import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';
import db from './config/connection.js';
import { expressMiddleware } from '@apollo/server/express4';
import type { Request, Response } from 'express';

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});



async function startApolloServer() {
  await server.start()
  await db;
  

  // server.applyMiddleware({ app });
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authMiddleware as any
    }
  ));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../client/dist'));
    
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('../client/dist/index.html');
    });
  }

  // db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Express server running on port ${PORT}`);
      console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    });
  // });
}

startApolloServer();
