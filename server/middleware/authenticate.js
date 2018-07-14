const {User} = require('./../models/user');

//middleware authentication
var authenticate = (req,res,next) =>{
    var token = req.header('x-auth');
    User.findByToken(token).then((user)=>{
        if(!user){
            return Promise.reject();
        }

       req.user = user ; 
       req.token = token ; 
       next();
    }).catch((e)=>{
        res.status(401).send({message: 'Error'});
    });
};

module.exports = {
    authenticate 
};