import { expect } from 'chai';
import * as express from 'express';
import { describe, it } from 'mocha';
import * as supertest from 'supertest';

import { createRouter } from '../src';

const app = express();

app.use(express.json());

const router1 = createRouter([
  {
    method: 'GET',
    path: '/',
    handler: (req, res) => {
      res.json({ message: 'Hello World' });
    },
  },
  {
    method: 'POST',
    path: '/',
    handler: [
      (req, res, next) => {
        (req as any).user = {
          id: 1,
          username: req.body.username,
        };
        next();
      },
      (req, res) => {
        res.status(201).json({ message: (req as any).user });
      },
    ],
  },
]);

const router2 = createRouter({
  'GET /home': (req, res) => {
    res.json({
      message: 'Hello Home',
    });
  },
  'POST /home': [
    (req, res, next) => {
      (req as any).user = {
        id: 1,
        username: req.body.username,
      };
      next();
    },
    (req, res) => {
      res.status(201).json({ message: (req as any).user });
    },
  ],
});

app.use(router1, router2);

describe('Creating express routes.', () => {
  it('using an array style with a single handler.', async () => {
    const getResponse = await supertest(app)
      .get('/')
      .expect(200);
    expect(getResponse.body.message).to.equal('Hello World');
  });

  it('using an array style with multiple handlers.', async () => {
    const postResponse = await supertest(app)
      .post('/')
      .send({ username: 'James' })
      .expect(201);
    expect(postResponse.body.message).to.deep.equal({
      id: 1,
      username: 'James',
    });
  });

  it('using an object style with a single handler.', async () => {
    const getResponse = await supertest(app)
      .get('/home')
      .expect(200);
    expect(getResponse.body.message).to.equal('Hello Home');
  });

  it('using an object style with multiple handlers.', async () => {
    const postResponse = await supertest(app)
      .post('/home')
      .send({ username: 'Homeboi' })
      .expect(201);
    expect(postResponse.body.message).to.deep.equal({
      id: 1,
      username: 'Homeboi',
    });
  });

  it('throws when using incorrect http verb.', () => {
    const app2 = express();

    const router3 = createRouter({
      'XXX /xxx': (req, res) => {
        res.json({ message: 'XXX' });
      },
    });

    const err = new Error();
    err.name = 'UnsupportedHttpVerbError';
    err.message = 'The HTTP verb is not supported.';

    expect(app2.use(router3)).to.throw(err, 'UnsupportedHttpVerbError');
  });
});
