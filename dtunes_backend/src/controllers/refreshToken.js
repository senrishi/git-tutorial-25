import jwt from 'jsonwebtoken'
import userModel from '../models/user.js';

async function handleRefreshToken(req, res) {

    try {
        const cookies = req.cookies;
        if (!cookies?.dtunesRefreshToken) return res.status(401).json({ success: false, errorCode: 'noCookie' });

        const refreshToken = cookies.dtunesRefreshToken;

        const user = await userModel.findOne({ refreshToken: refreshToken });
        if (!user) return res.status(403).json({ success: false, errorCode: 'notAllowed' });

        //jwt:
        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
            //either error or if the username found in database doesn't match username found by decoding jwt
            if (err || user.username !== decoded.username) {
                return res.status(403).json({ success: false, errorCode: 'refreshTokenError' });

            }
            //convert mongoose model to json format:
            const foundUser = user.toJSON();
            delete foundUser.password;
            delete foundUser.refreshToken;

            //!expires:
            //access token expire time (search for this comment for other places)

            const accessToken = jwt.sign(foundUser, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
            //foundUser also sent back for ease
            res.json({ success: true, accessToken, user: foundUser });
        })

    } catch (err) {
        res.json({ success: false, errorCode: 'unknownError', err });
        console.log('error', err);
    }
}

export { handleRefreshToken }