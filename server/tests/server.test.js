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
