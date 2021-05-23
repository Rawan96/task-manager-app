require('env2')('./.env');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should sing up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Sami',
      email: 'sami@example.com',
      password: '123456789',
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: 'Sami',
      email: 'sami@example.com',
    },
    token: user.tokens[0].token,
  });
  expect(response.body.user.password).not.toBe('123456789');
});

test('Should logging existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not logging non existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'non@example.com',
      password: '123456789',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200);
});

test('Should not get profile for unath user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account for unauth user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'test/fixtures/img.jpg')
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'jess',
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe('jess');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Gaza',
    })
    .expect(400);
});

test('Should not signup user with invalid email', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Sally',
      email: 'sal.com',
      password: 'saly123456',
    })
    .expect(400);
});

test('Should not signup user with invalid password', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Lama',
      emial: 'lam@gmail.com',
      password: '123',
    })
    .expect(400);
});

test('Should not update the user if unauthenticated', async () => {
  await request(app)
    .patch('/users/me')
    .send({
      name: 'Salem',
    })
    .expect(401);
});

test('Should not update user with invalid email', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      email: 'sally.com',
    })
    .expect(400);

  const user = await User.findById(userOneId);
  expect(user.email).not.toBe('sally.com');
});

test('Should not update user with invalid password', async () => {
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      password: '1234',
    })
    .expect(400);

  const user = await User.findById(userOneId);
  const isSame = await bcrypt.compare('1234', user.password);
  expect(isSame).toBe(false);
});
