import userModel from "../models/user.js";

//, samesite: 'none', secure: true 

async function handleLogout(req, res) {
    //! Delete accessToken in client
    try {

        const cookies = req.cookies;
        //can not send body because 204 => no content
        if (!cookies?.dtunesRefreshToken) {
            return res.sendStatus(204)
            // return res.json({success: true, message: 'There was no cookie!'});
        }
        const refreshToken = cookies.dtunesRefreshToken;

        const user = await userModel.findOne({ refreshToken: refreshToken });
        if (!user) {
            res.clearCookie('dtunesRefreshToken', { httpOnly: true})

            return res.sendStatus(204)
            // return res.json({success: true, message: 'Refresh token cookie cleared, not found in database'})
        }

        user.refreshToken = '';
        //! if something goes wrong with clearCookie, try removing/adding samesite: none and secure: true (if you do so, also remove in res.cookie in login)

        res.clearCookie('dtunesRefreshToken', { httpOnly: true})
        return res.sendStatus(204)
        // return res.json({success: true, message: 'Successful'})

    } catch (err) {
        console.log('error', err);
        res.sendStatus(500);
        // return res.json({success: false, errorCode: 'unknownError'});
    }
}


export { handleLogout }