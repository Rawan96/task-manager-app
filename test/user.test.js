require('env2')('./test.env');
const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user');
const { response } = require('express');

const userId = new mongoose.Types.ObjectId()

const user ={
  _id: userId,
  name: 'Mohammed',
  email:'moh@example.com',
  password:'123456789',
  tokens:[{
    token : jwt.sign({_id:userId}, process.env.JWT_SECRET)
  }]
}

beforeEach(async ()=>{
  await User.deleteMany()
  await new User(user).save()
})

test('Should signup a new user', async () => {
    const response = await request(app)
          .post('/users')
          .send({
            name: 'Rawan',
            email: 'raw@example.com',
            password: '123456ro'
          })
          .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
      user:{
        name:'Rawan',
        email: 'raw@example.com'
      }, 
      token: user.tokens[0].token
    })
})

test('Should logging existing user', async()=>{
  const response = await request(app)
        .post('/users/login')
        .send({
          email:user.email,
          password:user.password
        })
        .expect(200)
        
  const logUser = await User.findById(user._id)
  expect(response.body.token).toBe(logUser.tokens[1].token)
})

test('should not logging non existing user', async()=>{
  await request(app)
        .post('/users/login')
        .send({
          email:'non@example.com',
          password:'123456789'
        })
        .expect(400)
})


test('Should get profile for user', async()=>{
  await request(app)
        .get('/users/me')
        .send()
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .expect(200)
})

test('Should not get profile for unath user', async()=>{
  await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)

    const deleteUser = await User.findById(userId)
    expect(deleteUser).toBeNull()
})

test('Should not delete account for unauth user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async()=>{
  await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .attach('avatar', 'test/fixtures/philly.jpg')
        .expect(200)

  const avatarUser = await User.findById(userId)
  expect(avatarUser.avatar).toEqual(expect.any(Buffer))
})


test('Should update valid user fields', async()=>{
  await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
          name:'jess'
        })
        .expect(200)
  
  const updUser = await User.findById(userId)
  expect(updUser.name).toBe('jess')
})


test('Should not update invalid user fields', async()=>{
  await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
          location:'Gaza'
        })
        .expect(400)
})
