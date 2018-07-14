var mongoose = require('mongoose');
const _ = require('lodash');

//create Product model 
var ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 1,
        trim: true 
    },
    description :{
        type: String,
        trim: true 
    },
    price:{
        type: Number,
        required: true,
    },
    quantity :{
        type: Number,
        required: true,
    }, 
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

//override
//trim info for product
ProductSchema.methods.toJSON = function () {
    var product = this ; 
    var productObject = product.toObject();

    return _.pick(productObject , ['_id','name' , 'description' , 'price', 'quantity']);
};

var Product = mongoose.model('Product', ProductSchema);

module.exports = {
    Product
};