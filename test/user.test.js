require('env2')('./test.env');
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const user ={
  name: 'Mohammed',
  email:'moh@example.com',
  password:'123456789'
}

beforeEach(async ()=>{
  await User.deleteMany()
  await new User(user).save()
})

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'not',
        email: 'not@example.com',
        password: '123456ro'
    }).expect(201)
})

test('Should logging existing user', async()=>{
  await request(app).post('/users/login').send({
    email:user.email,
    password:user.password
  }).expect(200)
})

test('should not logging non existing user', async()=>{
  await request(app).post('/users/login').send({
    email:'non@example.com',
    password:'123456789'
  }).expect(400)
})