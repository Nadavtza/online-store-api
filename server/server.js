require('./config/config');

//library exports
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

//Local exports
const {mongoose} = require('./db/mongoose');
const {Product} = require('./models/product');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');



var app = express();

const port = process.env.PORT ||3000 ; 

app.use(bodyParser.json());

//products
//Get  user products
app.get('/products' ,authenticate , (req , res) => {
    Product.find().then((products)=>{
        res.send({message: 'List of all products:',
        products});
    } , (e) =>{
        res.status(400).send(e);
    });
});

//post route
app.post('/products',authenticate , (req, res)=>{ 
                                
    var product = new Product({
        id: req.body.id ,
        name: req.body.name ,
        description: req.body.description ,
        price: req.body.price ,
        quantity: req.body.quantity ,
        _creator: req.user._id
    })
    product.save().then((product)=>{
        res.send({product});
    }, (e)=>{
        res.status(400).send(e);
    });
});

app.get('/products' ,authenticate, (req , res) => {
    Product.find({_creator: req.user._id}).then((products)=>{
        res.send({message: 'List of all user products:',
        products});
    } , (e) =>{
        res.status(400).send(e);
    });
});

//get product by id
app.get('/products/:id' ,authenticate, (req , res) => {
    var id = req.params.id ;

    if(!ObjectID.isValid(id)){
        return res.status(404).send({message:'ID not valid'});
    }
    
    Product.findOne({
        _creator: req.user._id,
        _id : id
        }).then((product)=>{
        if(!product){
            return res.status(404).send({message:'ID not found'});
        }
        res.send({message: 'Product description:',
        product});
    } , (e) =>{
        res.status(400).send();
    });
});

//delete product
app.delete('/products/:id' , authenticate ,  (req , res) => {
    var id = req.params.id ;

    if(!ObjectID.isValid(id)){
        return res.status(404).send({message:'ID not valid'});
    }

    Product.findOneAndRemove({
        _creator: req.user._id,
        _id : id
        }).then((product)=>{
        if(!product){
            return res.status(404).send({message:'ID not found'});
        }
        res.status(200).send({message: 'Product removed:',
        product});
    } , (e) =>{
        res.status(400).send();
    });
});

//edit product
app.patch('/products/:id' ,authenticate, (req , res) => {
    var id = req.params.id ; 
    var body = _.pick(req.body , ['price' , 'quantity']); //***can edit only price and quantity*** 

    if(!ObjectID.isValid(id)){
        return res.status(404).send({message:'ID not valid'});
    }

    Product.findOneAndUpdate({
        _id: id,
        _creator : req.user._id,
        } ,
          {$set: body}
           ,{new: true}).then((product)=>{
        if(!product){
            return res.status(404).send({message:'ID not found'});
        }
        res.send({message: 'Product updated:',
        product});
    } , (e) =>{
        res.status(400).send();
    });


});

//users
//POST - sign in user
app.post('/users' , (req, res)=>{ 
    var body = _.pick(req.body , ['name' , 'email', 'password']);
    var user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
      }).then((token) => {
        res.header('x-auth', token).send(user);
      }).catch((e) => {
        res.status(400).send(e);
      })
    });


//GET private route
app.get('/users/me' ,authenticate , (req ,res) =>{
   res.send(req.user);
});

//POST /users/login
app.post('/users/login' , (req , res)=>{
    var body = _.pick(req.body , [ 'email', 'password']);
    User.findByCredentials(body.email , body.password).then((user)=>{
       return user.generateAuthToken().then((token)=>{
            res.header('x-auth', token).send(user);
       });
    }).catch((e)=>{
        res.status(400).send();
    });
    
    

});

//DELETE token logout user 
app.delete('/users/me/token' , authenticate, (req , res) => {
   req.user.removeToken(req.token).then( ()=>{
       res.status(200).send();
   } , () =>{
    res.status(400).send();
   }
)
});

app.listen(port , ()=>{
    console.log('Started on port ' , port);
});

module.exports = {
    app
};