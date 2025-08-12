import userModel from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

async function addUser(req, res) {
    let { username, name, password, isArtist, profileColor } = req.body;

    try {
        //valid username?
        const duplicateUsers = await userModel.find({ username });
        if (duplicateUsers.length) {
            return res.json({ success: false, message: 'Duplicate Username!', errorCode: 'usernameDuplicate' });
        }

        //validate isArtist:
        if (isArtist === 'true' || isArtist === true) {
            isArtist = true;
        }
        else if (isArtist === 'false' || isArtist === false) {
            isArtist = false;
        }
        else {
            return res.json({ success: false, message: 'isArtist should be either true or false!', errorCode: 'isArtistNotValid' })
        }


        password = await bcrypt.hash(password, 12);

        const userData = {
            username,
            name,
            password,
            isArtist,
            profileColor,
        }

        const user = userModel(userData);

        //jwt:
        let userJson = user.toJSON();
        delete userJson.password;
        delete userJson?.refreshToken;

        //access token expire time (search for this comment for other places)
        const accessToken = jwt.sign(userJson, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        const refreshToken = jwt.sign(userJson, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

        user.refreshToken = refreshToken;

        await user.save();

        //! if something goes wrong, try removing samesite: None and secure: true (if you do, also remove in res.clearCookie in logout)
        //, samesite: 'none', secure: true
        res.cookie('dtunesRefreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 1 })
        res.json({ success: true, user: userJson, accessToken });

    } catch (e) {
        console.log('Error adding user:', e);
        res.json({ success: false, errorCode: 'unknownError', message: 'controllers>adduser.js' });
    }
}

async function listUser(req, res) {
    try {
        const allUsers = await userModel.find({});
        res.json({ success: true, message: 'Successful', users: allUsers })
    } catch (e) {
        res.json({ success: false, message: e })
    }
}

async function authenticateUser(req, res) {
    const { username, password } = req.body;
    // console.log('username:', username, 'password', password);
    try {
        const user = await userModel.findOne({ username });
        if (!user) return res.json({ success: false, errorCode: 'usernameNotExist' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.json({ success: false, errorCode: 'invalidCredentials' });

        //jwt:
        //!expire
        //jwt accepts json user not mongoose model
        let foundUser = user.toJSON();
        delete foundUser.password; //remove password before making token from it 
        delete foundUser?.refreshToken;

        //access token expire time (search for this comment for other places)
        const accessToken = jwt.sign(foundUser, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        const refreshToken = jwt.sign(foundUser, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1d' })

        //store refresh token in db
        user.refreshToken = refreshToken;
        await user.save();

        //! if something goes wrong, try removing samesite: None and secure: true (if you do, also remove in res.clearCookie in logout)
        //, samesite: 'none', secure: true
        res.cookie('dtunesRefreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 1 })
        res.json({ success: true, user: foundUser, accessToken });

    } catch (err) {
        res.json({ success: false, errorCode: 'unknownError', message: 'controllers>authenticateUser' });
        console.log('error', err);
    }
}

async function getUserDetails(req, res) {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);
        if (!user) return res.json({ success: false, errorCode: 'idNotExist' });

        res.json({ success: true, user })
    } catch (err) {
        res.json({ success: false, errorCode: 'unknownError', message: 'from getUserDetails in controllers>user.js' });
    }

}

async function getLikedSongs(req, res) {
    try {
        //old method:
        // const {id} = req.params;

        const { _id: id } = req.authenticatedUser;
        // console.log(req.authenticatedUser._id);
        const user = await userModel.findById(id).populate('likedSongs');
        if (!user) return res.json({ success: false, errorCode: 'idNotExist' });

        return res.json({ success: true, likedSongs: user.likedSongs });

    } catch (err) {
        console.log(err);
        res.json({ success: false, errorCode: 'unknownError', error: err });
    }
}

async function sendFriendRequest(req, res) {
    try {

        const { _id: senderId } = req.authenticatedUser;
        const senderUser = await userModel.findById(senderId);
        if (!senderUser) return res.json({ success: false, errorCode: 'senderNotExists' });

        const { id: receiverId } = req.params;
        const receiverUser = await userModel.findById(receiverId);
        if (!receiverUser) return res.json({ success: false, errorCode: 'receiverNotExists' });

        //prevent duplicate friend requests:
        let checks = [
            //case1: sender already sent receiver
            senderUser.friends.outgoing.find(fId => fId.equals(receiverId)),
            receiverUser.friends.incoming.find(fId => fId.equals(senderId)),

            //case2: receiver already sent sender
            senderUser.friends.incoming.find(fId => fId.equals(receiverId)),
            receiverUser.friends.outgoing.find(fId => fId.equals(senderId))
        ]

        if (checks.find(check => check)) {
            return res.json({ success: false, errorCode: 'alreadySent', checks })
        }

        senderUser.friends.outgoing.push(receiverId);
        senderUser.save();

        receiverUser.friends.incoming.push(senderId);
        receiverUser.save();

        return res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: 'controllers>user.js>sendFriendRequest' });
    }
}

async function acceptRequest(req, res) {
    try {

        //logged in user must be receiver and only then accept
        const { id: senderId } = req.params;
        const senderUser = await userModel.findById(senderId);
        if (!senderUser) return res.json({ success: false, errorCode: 'senderNotExists' });

        const { _id: receiverId } = req.authenticatedUser;
        const receiverUser = await userModel.findById(receiverId);
        if (!receiverUser) return res.json({ success: false, errorCode: 'receiverNotExists' });

        let check1 = senderUser.friends.outgoing.find(fId => fId.equals(receiverId));
        let check2 = receiverUser.friends.incoming.find(fId => fId.equals(senderId));

        if (check1 && check2) {
            //delete request
            senderUser.friends.outgoing = senderUser.friends.outgoing.filter(fId => !fId.equals(receiverId))
            receiverUser.friends.incoming = receiverUser.friends.incoming.filter(fId => !fId.equals(senderId))

            //add friends
            senderUser.friends.accepted.push(receiverId);
            await senderUser.save();
            receiverUser.friends.accepted.push(senderId);
            await receiverUser.save();
            res.json({ success: true })
        }
        else {
            res.json({ success: false, errorCode: 'noRequestAvailable', checks: [check1, check2] })
        }
    } catch (err) {
        res.json({ success: false, errorCode: 'unknownError', message: 'controllers>user.js>acceptRequest' })
        console.log(err);
    }

}

async function removeRequest(req, res) {
    try {
        //Both the parties are allowed to remove/reject the request:

        const { id: senderId } = req.params;
        const senderUser = await userModel.findById(senderId);
        if (!senderUser) return res.json({ success: false, errorCode: 'senderNotExists' });

        const { _id: receiverId } = req.authenticatedUser;
        const receiverUser = await userModel.findById(receiverId);
        if (!receiverUser) return res.json({ success: false, errorCode: 'receiverNotExists' });

        // let check1 = senderUser.friends.outgoing.find(fId => fId.equals(receiverId));
        // let check2 = receiverUser.friends.incoming.find(fId => fId.equals(senderId));

        let checks = [
            //case1: sender sent receiver
            senderUser.friends.outgoing.find(fId => fId.equals(receiverId)),
            receiverUser.friends.incoming.find(fId => fId.equals(senderId)),

            //case2: receiver sent sender
            senderUser.friends.incoming.find(fId => fId.equals(receiverId)),
            receiverUser.friends.outgoing.find(fId => fId.equals(senderId))
        ]

        //case1
        if (checks[0] && checks[1]) {
            senderUser.friends.outgoing = senderUser.friends.outgoing.filter(fId => !fId.equals(receiverId))
            receiverUser.friends.incoming = receiverUser.friends.incoming.filter(fId => !fId.equals(senderId))

            await senderUser.save();
            await receiverUser.save();
            return res.json({ success: true, message: 'request rejected' })

        }
        //case2
        if (checks[2] && checks[3]){
            receiverUser.friends.outgoing = receiverUser.friends.outgoing.filter(fId => !fId.equals(senderId))
            senderUser.friends.incoming = senderUser.friends.incoming.filter(fId => !fId.equals(receiverId))

            await senderUser.save();
            await receiverUser.save();
            return res.json({ success: true, message: 'request cancelled' })

        }

        return res.json({ success: false, errorCode: 'noRequestAvailable', checks })

    } catch (err) {
        res.json({ success: false, errorCode: 'unknownError', message: 'controllers>user.js>removeRequest' })

    }
}

async function removeFriend(req, res){
    try{

        const {_id: userId} = req.authenticatedUser;
        const user = await userModel.findById(userId);
        if (!user) return res.json({success: false, errorCode: 'userNotExists'});

        const {id: friendId} = req.params;
        const friend = await userModel.findById(friendId);
        if (!friend) return res.json({success: false, errorCode: 'friendNotExists'});

        user.friends.accepted = user.friends.accepted.filter(fId => !fId.equals(friendId))
        friend.friends.accepted = friend.friends.accepted.filter(fId => !fId.equals(userId))

        await friend.save();
        await user.save();

        return res.json({success: true});

    }catch(err){
        console.log(err);
        res.json({ success: false, errorCode: 'unknownError', message: 'controllers>user.js>removeFriend' })

    }

}

function privateTest(req, res) {

    const authenticatedUser = req?.authenticatedUser;
    res.json({ success: true, gotUser: authenticatedUser })
}

// async function resetLikes(req, res){
//     const allUsers = await userModel.updateMany({}, {$set: {likedSongs: [], dislikedSongs: []}});
//     res.send('done');

// }

// async function seedFriends(req, res){
//     // const response = await userModel.updateMany({}, {$set: {'friends.incoming': [], 'friends.accepted': [], 'friends.outgoing': []}})
//     const response = await userModel.updateMany({}, {$set: {friends: {incoming: [], accepted: [], outgoing: []}}})
//     res.send('done');
// }

export {
    addUser, listUser, authenticateUser, getUserDetails, getLikedSongs,
    sendFriendRequest, acceptRequest, removeRequest, removeFriend
};

export { privateTest }
