require('env2')('./test.env');
const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

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
    await request(app)
          .post('/users')
          .send({
            name: 'not',
            email: 'not@example.com',
            password: '123456ro'
          })
          .expect(201)
})

test('Should logging existing user', async()=>{
  await request(app)
        .post('/users/login')
        .send({
          email:user.email,
          password:user.password
        })
        .expect(200)
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

test('Sould not get profile for unath user', async()=>{
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
})

test('Should not delete account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})