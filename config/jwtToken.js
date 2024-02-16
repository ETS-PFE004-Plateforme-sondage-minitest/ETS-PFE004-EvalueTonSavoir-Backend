
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config();

class Token {

    constructor() {
        
    }

    create(email) {
        return jwt.sign({ email }, process.env.JWT_SECRET);
    }

    authenticateToken(req, res, next) {
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    
        
        if (!token) throw new Error('Accès refusé. Aucun jeton fourni');
    
        jwt.verify(token, process.env.JWT_SECRET, (err, email) => {
            if (err) throw new Error('Jeton invalide');
    
            req.email = email;
            next();
        });
    }
}

module.exports = new Token();