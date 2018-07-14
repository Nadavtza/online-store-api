const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Product} = require('./../models/product');
const {User} = require('./../models/user');
const { products, populateProducts, populateUsers ,users} = require('./seed/seed');

// clean products before each test
beforeEach(populateUsers);
beforeEach(populateProducts);


//***************TEST FOR PRODUCT*********** */
//Test POST
describe('POST /products' , () => {
    it('should create a new product', (done) => {
        var product = {
            name: "iphone",
            price: 3000,
            quantity: 2 ,
            description: "new iphone 64g"
        };
        request(app)
        .post('/products')
        .set('x-auth' , users[0].tokens[0].token)
        .send({
            name: product.name,
            price: product.price,
            quantity: product.quantity ,
            description: product.description
            })
        .expect(200)
        .expect((res) => {
                expect(res.body.product.name).toBe(product.name);
                expect(res.body.product.price).toBe(product.price);
            }).end((err,res)=>{
                if(err){
                    return done(err);
                }
                Product.find({name:product.name}).then((products) => {
                    expect(products.length).toBe(1);
                    expect(products[0].name).toBe(product.name);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create a product with invalid data', (done) => {
        request(app)
        .post('/products')
        .set('x-auth' , users[0].tokens[0].token)
        .send({})
        .expect(400)
        .end((err,res)=>{
                if(err){
                    return done(err);
                }
                Product.find().then((products) => {
                    expect(products.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create a product with invalid name', (done) => {
        var product = {
            name: "",
            price: 3000,
            quantity: 2 ,
            description: "new iphone 64g"
        };

        request(app)
        .post('/products')
        .set('x-auth' , users[0].tokens[0].token)
        .send({
            name: product.name,
            price: product.price,
            quantity: product.quantity ,
            description: product.description
            })
        .expect(400)
        .end((err,res)=>{
                if(err){
                    return done(err);
                }
                Product.find().then((products) => {
                    expect(products.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});



//Test GET products
describe('GET /products' , () => {
    it('should get all user products' , (done) =>{
        request(app)
        .get('/products')
        .set('x-auth' , users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.body.products.length).toBe(1);
        })
        .end(done);
    });
});

//Test SEARCH
describe('GET /products/:id' , () => {
    it('should return first product' , (done) =>{
        request(app)
        .get(`/products/${products[0]._id.toHexString()}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.body.product.name).toBe(products[0].name);
        })
        .end(done);
    });

    it('should not return product created by other user' , (done) =>{
        request(app)
        .get(`/products/${products[0]._id.toHexString()}`)
        .set('x-auth' , users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if product not found' , (done) =>{
        var id = new ObjectID() ;
        request(app)
        .get(`/products/${id.toHexString()}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(404)
        .expect( (res) => {
            expect(res.body.message).toBe('ID not found');
        })
        .end(done);
    });

    it('should return 404 if ID not valid' , (done) =>{
        var id = '123' ;
        request(app)
        .get(`/products/${id}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(404)
        .expect( (res) => {
            expect(res.body.message).toBe('ID not valid');
        })
        .end(done);
    });
});

//Test DELETE
describe('DELETE /products/:id' , () => {
    it('should delete product by id' , (done) =>{
        var hexId = products[0]._id.toHexString() ; 
        request(app)
        .delete(`/products/${hexId}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(200)
        .expect( (res) => {
            expect(res.body.product.name).toBe(products[0].name);
        })
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Product.findById(hexId).then((product) => {
                expect(product).toBeFalsy();
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not delete products created by other user' , (done) =>{
        var hexId = products[0]._id.toHexString() ; 
        request(app)
        .delete(`/products/${hexId}`)
        .set('x-auth' , users[1].tokens[0].token)
        .expect(404)
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Product.findById(hexId).then((product) => {
                expect(products).toBeDefined();
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return 404 if product not found' , (done) =>{
        var id = new ObjectID() ;
        request(app)
        .delete(`/products/${id.toHexString()}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(404)
        .expect( (res) => {
            expect(res.body.message).toBe('ID not found');
        })
        .end(done);
    });
});

//Test PATCH

describe('PATCH /products/:id' , () => {

    it('should update product' , (done) =>{
        var hexId = products[0]._id.toHexString() ; 
        var quantity = 10 ; 

        request(app)
        .patch(`/products/${hexId}`)
        .set('x-auth' , users[0].tokens[0].token)
        .send({quantity })
        .expect(200)
        .expect( (res) => {
            expect(res.body.product.quantity).toBe(quantity);
        })
        .end((err,res)=>{ 
            if(err){
                return done(err);
            }
            Product.findById(hexId).then((product) => {
                expect(product.quantity).toBe(quantity);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not update product created by other user' , (done) =>{
        var hexId = products[0]._id.toHexString() ; 
        var quantity = 10 ; 
        
        request(app)
        .patch(`/products/${hexId}`)
        .set('x-auth' , users[1].tokens[0].token)
        .send({quantity })
        .expect(404)
        .end((err,res)=>{ 
            if(err){
                return done(err);
            }
            Product.findById(hexId).then((product) => {
                expect(product.quantity).toBe(products[0].quantity);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return 404 if product not found' , (done) =>{
        var id = new ObjectID() ;
        request(app)
        .delete(`/products/${id.toHexString()}`)
        .set('x-auth' , users[0].tokens[0].token)
        .expect(404)
        .expect( (res) => {
            expect(res.body.message).toBe('ID not found');
        })
        .end(done);
    });

    it('should return 404 if ID not valid' , (done) =>{
        var id = '123' ;
        request(app)
        .delete(`/products/${id}`)
         .set('x-auth' , users[0].tokens[0].token)
        .expect(404)
        .expect( (res) => {
            expect(res.body.message).toBe('ID not valid');
        })
        .end(done);
    });
});

//***********TEST FOR USER*********** */

//Test GET /users/me
describe('GET /users/me' , ()=>{
    it('should return user if autenticated' , (done)=>{
        request(app)
        .get('/users/me')
        .set('x-auth' , users[0].tokens[0].token)
        .expect(200)
        .expect((res) =>{
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
            expect(res.body.name).toBe(users[0].name);
        })
        .end(done);
    });

    it('should return 401 if user not autenticated' , (done)=>{
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) =>{
            expect(res.body).toEqual({message: 'Error'});
        })
        .end(done);
    });
});

//Test POST /users

describe('POST /users' , ()=>{
    it('should create a user' , (done)=>{
       var email = 'exam3333ple@gmail.com';
       var name = 'nadav123';
       var password = '123456' ;

       request(app)
       .post('/users')
       .send({email , password , name})
       .expect(200)
       .expect((res) =>{
           expect(res.headers['x-auth']).toBeDefined()  ; 
           expect(res.body._id).toBeDefined() ; 
           expect(res.body.email).toBe(email);
           expect(res.body.name).toBe(name);
       })
       .end((err)=>{
            if(err){
                return done(err);
            }
            User.findOne({email}).then((user)=>{
                expect(user).toBeDefined() ;
                expect(user.password).not.toBe(password) ;
                done();
            }).catch((e) => done(e));
       });
    });

    it('should return validation errors if request invalid' , (done)=>{
        var email = 'exam333.com';
        var name = 'nadav123';
        var password = '12345' ;
 
        request(app)
        .post('/users')
        .send({email , password , name})
        .expect(400)
        .end((err)=>{
             if(err){
                 return done(err);
             }
             User.findOne({email}).then((user)=>{
                 expect(user).toBe(null) ;
                 done();
             });
        });
    });

    it('should not create user if email/name in use' , (done)=>{
        request(app)
        .post('/users')
        .send({
            email :users[0].email,
            password :users[0].password ,
            name :users[0].name})
        .expect(400)
        .end((err)=>{
            if(err){
                return done(err);
            }
            User.findOne({email: users[0].email}).then((user)=>{
                expect(user.email).toBe(users[0].email) ;
                done();
            });
       });
    });

});
//Test login
describe('POST /users/login' , ()=>{
    it('should login user and return auth token' , (done) =>{
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password
        })
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toBeDefined() ; 
        })
        .end((err ,res)=>{
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then( (user) =>{
                expect(user.tokens[1]).toHaveProperty('access' , 'auth');
                expect(user.tokens[1]).toHaveProperty('token' , res.headers['x-auth']);
                done();
            }).catch((e) => done(e));
        }); 
    });

    it('should reject invalid token' , (done) =>{
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: users[1].password + '2'
        })
        .expect(400)
        .expect((res)=>{
            expect(res.headers['x-auth']).not.toBeDefined() ; 
        })
        .end((err ,res)=>{
            if(err){
                return done(err);
            }
            User.findById(users[1]._id).then( (user) =>{
                expect(user.tokens.length).toBe(1);
                done();
            }).catch((e) => done(e));
        }); 
    });
})

//Test DELETE - logout
describe('DELETE /users/me/token' , ()=>{
    it('should remove auth token when logout' , (done) =>{
        request(app)
        .delete('/users/me/token')
        .set('x-auth' , users[0].tokens[0].token)
        .send()
        .expect(200)
        .end((err ,res)=>{
            if(err){
                return done(err);
            }
            User.findById(users[0]._id).then( (user) =>{
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        }); 
    });
})