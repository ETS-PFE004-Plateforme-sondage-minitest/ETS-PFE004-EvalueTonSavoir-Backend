const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const Response = require('../helpers/Response.js')

dotenv.config();

class Token {

    constructor() {
        
    }

    create(email) {
        return jwt.sign({ email }, process.env.JWT_SECRET);
    }

    authenticate(req, res, next) {
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
        
        if (!token) Response.unauthorized(res, 'Accès refusé. Aucun jeton fourni');
    
        jwt.verify(token, process.env.JWT_SECRET, (err, email) => {
            if (err) Response.unauthorized("Accès refusé. Jeton invalide.");
    
            req.email = email;

            next();
        });
    }
}

module.exports = new Token();