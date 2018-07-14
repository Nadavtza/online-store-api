const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

//local
const {Product} = require('./../../models/product');
const {User} = require('./../../models/user');

const userOneID = new ObjectID(); 
const userTwoeID = new ObjectID(); 

const users =[
    {   _id: userOneID,
        name: 'nadavavav',
        email: 'nadaddddv@gmail.com',
        password: 'userOnePassword',
        tokens: [{
            access : 'auth',
            token: jwt.sign({_id: userOneID , access: 'auth'} , process.env.JWT_SECRET).toString()
        }]},
    {   _id: userTwoeID,
        name: 'sivan',
        email: 'sivanvvv@gmail.com',
        password: 'userTwoPassword',
        tokens: [{
            access : 'auth',
            token: jwt.sign({_id: userTwoeID , access: 'auth'} , process.env.JWT_SECRET).toString()
        }]},
];

const products = [
    {   _id: new ObjectID(),
        name: 'First product',
        price: 3,
        quantity: 2 ,
        description: "first product to sell",
        _creator: userOneID
    },
        
    { _id: new ObjectID(),
        name: 'First product',
        price: 3,
        quantity: 2 ,
        description: "first product to sell",
      _creator: userTwoeID
    }
];

const populateProducts = (done) => {
    Product.remove({}).then(() => {
        return Product.insertMany(products);
    }).then( () => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
  
      return Promise.all([userOne, userTwo])
    }).then(() => done());
  };

module.exports = {
    products,
    populateProducts,
    users,
    populateUsers
};