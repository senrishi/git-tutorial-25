import jwt from 'jsonwebtoken'

function authenticateToken(req, res, next){
    //authHeader format: BEARER TOKEN
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if(!token) return res.status(401).json({success: false, errorCode: 'noToken'});

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, authenticatedUser) => {
        if (err){
            return res.status(403).json({success: false, errorCode: 'userNotAllowed'})
        }
        req.authenticatedUser = authenticatedUser;
        next();
    })

}

export {authenticateToken};