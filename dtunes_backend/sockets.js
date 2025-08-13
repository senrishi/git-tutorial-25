import { io } from "./server.js";
import playlistModel from "./src/models/playlist.js";
import songModel from "./src/models/song.js";
import userModel from "./src/models/user.js";

//user:

let users = {
    loggedIn: [],
    loggedOut: [],
}

class User {
    constructor(socketId, loggedIn = false, userId = '') {
        this.socketIds = [socketId];
        this.loggedIn = loggedIn;
        this.userId = userId;
    }

    setLoggedIn(bool) {
        this.loggedIn = bool;
    }

    setUserId(id) {
        this.userId = id;
    }
}

function findUserByUserId(id) {
    //return user instance if found, else false
    if (!id) return false;
    for (let user of users.loggedIn) {
        if (user.userId === id) return user;
    }
    return false;
}

function findUserBySocketId(id) {
    //return user instance if found, else false
    if (!id) return false;
    for (let user of users.loggedIn) {
        for (let socketId of user.socketIds) {
            if (id === socketId) return user;
        }
    }
    for (let user of users.loggedOut) {
        for (let socketId of user.socketIds) {
            if (id === socketId) return user;
        }
    }
    return false;
}

//do some function to all friends:

async function toAllFriends(user, func, debugMessage) {
    'Does func to all friends of user'
    'func takes on parameters: friendSocketId userDb'

    const sockets = await io.fetchSockets();
    const userDb = await userModel.findById(user.userId);
    if (!userDb) {
        console.log('Warning: in toAllFriends no user found in db');
        return false;
    }
    const friends = userDb.friends.accepted;

    for (let fSocket of sockets) {
        const fUser = findUserBySocketId(fSocket.id);

        if (friends.find(fId => fId.equals(fUser?.userId))) {
            func(fSocket, userDb);
            if (debugMessage) console.log(debugMessage);
        }
    }
}


//party

let parties = [];

class Party {
    constructor(hostId, hostName, socket) {
        //host userId
        this.hostId = hostId;
        this.hostName = hostName;
        this.partyId = `party:${hostId}`;
        this.members = [hostId]
        this.sockets = [socket.id]; //contains socket Ids inside of it
        this.started = false;
        this.status = 'Waiting';
        this.waitTimer(30); //!only set to integers (see waitTimer socket)

        io.to('partiesPage').emit('getParties', shortPartiesData());

    }

    waitTimer(seconds) {
        this.wait = {
            remaining: seconds,
            ended: false,
            timerId: setInterval(() => {
                this.wait.remaining = Math.max(0, this.wait.remaining - .1);

                updatePartiesPage(); //parties page
                this.updatePartyPage();

                if (this.wait.remaining <= 0) {
                    clearInterval(this.wait.timerId);
                    this.wait.ended = true;
                    this.status = 'Voting';
                    this.voteTimer(30);
                }
            }, 100),
            skip(){
                //within this function, this refers to wait object
                this.remaining = 0;
            },
        }
    }

    voteTimer(seconds) {
        this.vote = {
            remaining: seconds,
            ended: false,
            timerId: setInterval(() => {
                this.vote.remaining = Math.max(0, this.vote.remaining - .1);

                //members of party not yet voted:
                this.vote.votingMembers = this.members.filter(uId => !Object.keys(this.vote.votes).find(voterId=> voterId === uId));
                updatePartiesPage(); //parties page
                this.updatePartyPage();

                if (this.vote.remaining <= 0 || this.vote.votingMembers.length === 0) {
                    
                    //code to get top two voted playlists:
                    let votedPlaylists = Object.values(this.vote.votes);
                    let playlistVotes = {};
                    for (let pl of votedPlaylists){
                        if (playlistVotes[pl]){
                            playlistVotes[pl]++;
                        }
                        else{
                            playlistVotes[pl] = 1;
                        }
                    }
                    votedPlaylists = []
                    for (let pl in playlistVotes){
                        votedPlaylists.push([pl, playlistVotes[pl]]);
                    }
                    votedPlaylists.sort((a, b) => b[1]-a[1]);
                    
                    // in case 0 or 1 playlists only voted for, use pre-selected playlists;
                    if(votedPlaylists.length === 0) this.vote.results = ['669555c89edc408bf453fa2a', '669cb5d4e708ff344dbaadce'];
                    else if (votedPlaylists.length === 1) this.vote.results = [votedPlaylists[0][0], '669cb5d4e708ff344dbaadce'];
                    else this.vote.results = [votedPlaylists[0][0], votedPlaylists[1][0]];
                    
                    
                    
                    clearInterval(this.vote.timerId);
                    this.vote.ended = true;
                    this.started = true;
                    this.status = 'Partying';
                    this.startParty();
                }
            }, 100),

            votes: {

            },

            add(userId, playlistId){
                this.votes[userId] = playlistId;
            },

        }

    }


    startParty() {
        this.partyDetails = {
            started: true,
            startPartyId: setInterval(() => {

                updatePartiesPage(); //parties page
                this.updatePartyPage();

                //handle party empty: set Timeout for 30 seconds to end party, clear timeout if anyone joins
                if (this.members.length === 0) {
                    if (!this.partyDetails.endPartyId) {
                        this.endParty();
                    }
                }
                else {
                    if (this.partyDetails.endPartyId) {
                        clearInterval(this.partyDetails.endPartyId);
                        this.partyDetails.endPartyId = null;
                        this.status = 'Partying';
                    }
                }

            }, 1000),
        };
    }

    endParty() {
        this.partyDetails.ending = 10;
        this.status = 'Ending';

        this.partyDetails.endPartyId = setInterval(() => {
            this.partyDetails.ending -= 1;

            if (this.partyDetails.ending <= 0) {
                clearInterval(this.partyDetails.startPartyId);
                clearInterval(this.partyDetails.endPartyId);
                this.removeParty();

                updatePartiesPage();
                setTimeout(() => updatePartiesPage(), 2 * 1000) // to log this party's removal; 2 s delay to avoid not updating due to update timeout
            }
        }, 1000);
    }

    updatePartyPage() {

        if (this.updatePartyPageTimeout) {
            return;
        }
        else {
            this.updatePartyPageTimeout = setTimeout(() => {
                this.updatePartyPageTimeout = null;
            }, 500);
        }

        if (this.status === 'Waiting') {
            io.to(this.partyId).emit('getPartyDetails', {
                status: 'Waiting',
                waitTime: this.wait.remaining,
                members: this.members.length,
                hostId: this.hostId,
            })
        }

        else if (this.status === 'Voting') {
            io.to(this.partyId).emit('getPartyDetails', {
                status: 'Voting',
                voteTime: this.vote.remaining,
                members: this.members.length,
                hostId: this.hostId,
                votes: this.vote.votes,
                voting: this.vote.votingMembers.length,
            })
        }

        else if (this.status === 'Partying') {
            io.to(this.partyId).emit('getPartyDetails', {
                status: 'Partying',
                members: this.members.length,
                hostId: this.hostId,
                playlists: this.vote.results, //array of top 2 playlists
            })
        }
    }

    addUserId(userId) {
        for (let uId of this.members) {
            if (uId === userId) return;
        }
        const user = findUserByUserId(userId);
        if (user?.loggedIn) this.members.push(user.userId);
        else console.log('class Party> adduser: user was not there or loggedin', userId, user);
    }

    addSocketId(socketId) {
        const user = findUserBySocketId(socketId);
        if (!user) return console.log('Warning no user for socket Id: addSocketId');

        if (!this.members.find(uId => uId === user.userId)) this.members.push(user.userId);
        if (!this.sockets.find(sId => sId === socketId)) this.sockets.push(socketId);

    }

    removeUserId(userId) {
        if (this.hostId === userId) {
            console.log('Remove host: deleting party...');
            return this.removeParty();
        }
        this.members = this.members.filter(uId => uId !== userId);
    }

    removeSocketId(socketId) {
        const user = findUserBySocketId(socketId);
        if (!user) return console.log('Warning: removeSocketId no user for the socketId');

        const otherSocketIds = user.socketIds.filter(sId => sId !== socketId);

        let onlySocket = true;
        for (let soc of this.sockets) {
            if (otherSocketIds.find(sId => sId === soc)) {
                onlySocket = false;
                break;
            }
        }

        if (onlySocket) {
            this.members = this.members.filter(uId => uId !== user.userId);
        }
        this.sockets = this.sockets.filter(sId => sId !== socketId);
    }

    findUserId(userId) {
        for (let uId of this.members) {
            if (uId === userId) return uId;
        }
        return false;
    }

    removeParty() {
        let idx = parties.indexOf(this);
        if (idx !== -1) parties.splice(idx, 1);
        else console.log('removeParty in Party warning: not found in list', this);
    }


}

function findPartyByHostId(id) {
    //return user instance if found, else false
    if (!id) return false;
    for (let party of parties) {
        if (party.hostId !== id) return party;
    }
    return false;
}

function findPartyByPartyId(id) {
    //return user instance if found, else false
    if (!id) return false;
    for (let party of parties) {
        if (party.partyId === id) return party;
    }
    return false;
}

//to send to client
function shortPartiesData() {
    return parties.map(p => {
        let obj = {
            hostId: p.hostId,
            hostName: p.hostName,
            partyId: p.partyId, members: p.members, started: p.started,
            sockets: p.sockets,
            status: p.status,
            wait: {
                remaining: p.wait.remaining,
                ended: p.wait.ended,

            },
        }
        if (p.wait.ended) {
            obj = {
                ...obj,
                vote: {
                    remaining: p.vote.remaining,
                    ended: p.vote.ended
                },
            }
        }
        if (p?.partyDetails?.endPartyId) {
            obj = {
                ...obj,
                partyDetails: {
                    ending: p.partyDetails.ending,
                }
            }
        }

        return obj;

    });
}

//to update parties page every second, without overloading:

let partiesPageUpdateId;
function updatePartiesPage() {

    if (!partiesPageUpdateId) {
        io.to('partiesPage').emit('getParties', shortPartiesData());
        partiesPageUpdateId = setTimeout(() => {
            partiesPageUpdateId = null;
        }, 1000)
    }
}

function startSocket() {

    io.on('connection', socket => {
        users.loggedOut.push(new User(socket.id));
        // socket.emit('getUserAuth'); //for handling reloading a page where user islogged in

        socket.on('disconnect', async reason => {
            console.log('disconnect', reason);
            try {
                // sendSyncedState(socket, false);
                // console.log(socket.id, reason, findUserBySocketId(socket.id));
                const user = findUserBySocketId(socket.id);

                const user_ = { ...user };
                console.log(user, user_);
                //remove currently playing song from all friends:
                if (user_.loggedIn) {
                    toAllFriends(user_, (fSocket, userDb) => {
                        fSocket.emit('getFriendSongRemove', { username: userDb.username });
                    });
                }

                //deal with user object:
                if (user.socketIds.length > 1) {
                    user.socketIds.splice(user.socketIds.indexOf(socket.id));
                }
                else {
                    if (user.loggedIn) users.loggedIn.splice(users.loggedIn.indexOf(user));
                    else users.loggedOut.splice(users.loggedOut.indexOf(user));
                }
            } catch (err) {
                console.log('error in disconnect', err);
            }
        });

        //to properly update users list
        socket.on('authChange', ({ loggedIn, userId }) => {
            try {

                const user = findUserBySocketId(socket.id);
                if (user) {
                    //socket is now logging in
                    if (loggedIn) {
                        //if user was already loggedin:
                        //  if different userid, disassociate this socket.id with the earlier userId
                        //  if same, do nothing
                        if (user.loggedIn) {
                            if (user.userId !== userId) {
                                //don't leave empty users
                                if (user.socketIds.length > 1) {
                                    user.socketIds.splice(user.socketIds.indexOf(socket.id));
                                    users.loggedIn.push(new User(socket.id, true, userId));
                                    // sendSyncedState(socket, true);
                                }
                                else {
                                    user.userId = userId;
                                }
                            }
                        }
                        //if user was not:
                        //  if you find another user with userId (naturally, in loggedIn), merge them
                        //  else, add to loggedIN
                        else {
                            users.loggedOut.splice(users.loggedOut.indexOf(user));

                            const anotherUser = findUserByUserId(userId);
                            if (anotherUser) {
                                anotherUser.socketIds.push(socket.id);

                                //2nd point of sync playback, set track_id of this new user to given track id
                                // setTimeout(() => {
                                // setTimeout(() => setNewLoginTrack(socket, anotherUser), 1250);
                                // setTimeout(() => setNewLoginDuration(socket, anotherUser), 1250)
                                // }, 100);
                            }
                            else {
                                user.setLoggedIn(true);
                                user.setUserId(userId);
                                users.loggedIn.push(user);
                                // sendSyncedState(socket, true);

                            }
                        }
                    }

                    //socket is now logging out:
                    else {
                        //if already loggedOut, do nothing
                        //if was loggedIn, cause this socketId alone to be noted as logged out
                        if (user.loggedIn) {

                            //remove playing songs from friends:
                            const user_ = { ...user };
                            console.log(user, user_);
                            //remove currently playing song from all friends:
                            if (user_.loggedIn) {
                                toAllFriends(user_, (fSocket, userDb) => {
                                    fSocket.emit('getFriendSongRemove', { username: userDb.username });
                                });
                            }

                            //note as logged out:
                            if (user.socketIds.length > 1) {
                                user.socketIds.splice(user.socketIds.indexOf(socket.id));
                                users.loggedOut.push(new User(socket.id));
                            }
                            else {
                                users.loggedIn.splice(users.loggedIn.indexOf(user));
                                user.setLoggedIn(false);
                                user.setUserId('');
                                users.loggedOut.push(user);
                            }
                        }
                    }

                }
                else {
                    console.log('Warning, sockets.js no user with this socketid', socket.id);
                }

                //!debug:
                // console.log(users);
                console.log('=========== loggedin ==========');
                users.loggedIn.forEach(u => console.log(u))
                console.log('=========== loggedOut ==========');
                users.loggedOut.forEach(u => console.log(u))
                console.log('--------------------------------------------------\n\n')
            } catch (err) {
                console.log('error in authChange', err);
            }

        }
        )

        //socket emits sendFriendTrack: for showing playing song to friends
        socket.on('sendFriendTrack', async ({ trackId }) => {
            try {

                const user = findUserBySocketId(socket.id);
                if (!user?.loggedIn) return;

                const trackDb = await songModel.findById(trackId);

                toAllFriends(user, (fSocket, userDb) => {
                    fSocket.emit('getFriendSong', { username: userDb.username, name: userDb.name, trackId, trackName: trackDb.name, profileColor: userDb.profileColor, isArtist: userDb.isArtist });
                });
            } catch (err) {
                console.log('error in sockets.js show playing song to friends', err);
            }

        })

        //-------- SYNC PLAYBACK----------------

        // 1. socket emits sendSyncTrack: when the track is changed, this is sent
        socket.on('sendSyncTrack', async ({ trackId }) => {
            try {
                const user = findUserBySocketId(socket.id);
                if (user && trackId) {
                    user.trackId = trackId;

                    const sockets = await io.fetchSockets();
                    const otherSocketIds = user.socketIds.filter(sId => sId !== socket.id);

                    sockets.forEach(s => {
                        if (otherSocketIds.find(sId => sId === s.id)) {
                            s.emit('getTrack', { trackId });
                        }
                    })
                }
                // console.log('socket:', socket.id, trackId, 'current:', user.trackId);
            } catch (err) {
                console.log('error in sendSyncTrack', err);
            }
        })

        //2 when logging in, we're checking if same userId has loggedin and if so
        //A. new login's track is set
        //search for setNewLoginTrack for implementation

        //B. emit request for latest duration from first socketId and set this socketId to that
        //search for setNewLoginDuration for implementation

        //3. When user clicks on progress bar, emit sendDuration to server and set it
        //in playerContext.jsx search for sendSyncDuration 
        //in this file, search sendSyncedState

        socket.on('sendDuration', async ({ duration }) => {
            try {
                const user = findUserBySocketId(socket.id);
                if (!user) throw new Error('No user found');

                let otherSocketIds = user.socketIds.filter(sId => sId !== socket.id);
                if (!otherSocketIds.length) return;

                const sockets = await io.fetchSockets();
                sockets.forEach(s => {
                    if (otherSocketIds.find(sId => sId === s.id)) {
                        s.emit('getDuration', { duration });
                    }
                })
            } catch (err) {
                console.log('error in sendDuration', err);
            }
        })

        socket.on('sendPause', async () => {
            try {

                const user = findUserBySocketId(socket.id);
                if (!user) return;
                const sockets = await io.fetchSockets();
                const otherSocketIds = user.socketIds.filter(sId => sId !== socket.id);

                sockets.forEach(s => {
                    if (otherSocketIds.find(sId => sId === s.id)) {
                        s.emit('getPause');
                    }
                })
            } catch (err) {
                console.log('error in sendPause', err);
            }
        })

        socket.on('sendPlay', async () => {
            const user = findUserBySocketId(socket.id);
            const sockets = await io.fetchSockets();
            const otherSocketIds = user.socketIds.filter(sId => sId !== socket.id);

            sockets.forEach(s => {
                if (otherSocketIds.find(sId => sId === s.id)) {
                    s.emit('getPlay');
                }
            })
        })


        //---------------- PARTY MODE ----------------

        socket.on('createParty', ({ userId, name }, callback) => {
            try {
                console.log('userid', userId);
                const user = findUserByUserId(userId);
                if (!user) return;

                let newParty = new Party(userId, name, socket);
                parties.push(newParty);

                callback({
                    success: true,
                    partyId: newParty.partyId,
                });

            } catch (err) {
                console.log('error in socket.on createParty', err);
                callback({ success: false });
            }
        })

        socket.on('joinParty', ({ partyId }) => {
            //!Account for duplicate user joining from different ids
            const party = findPartyByPartyId(partyId);
            if (!party) return;

            socket.join(party.partyId);
            party.addSocketId(socket.id);

            console.log('join')
            console.log(party.sockets, party.members);

        })

        socket.on('leaveParty', ({ partyId }) => {

            const party = findPartyByPartyId(partyId);
            if (!party) return;

            socket.leave(party.partyId);
            party.removeSocketId(socket.id);

            console.log('leave')
            console.log(party.sockets, party.members);
        })

        // socket.on('partyPermissions', ({ partyId, userId }, callback) => {
        //     try {

        //         const party = findPartyByPartyId(partyId);
        //         if (!party) return callback({ success: true, allowed: false });

        //         if (party.findUserId(userId)) return callback({ success: true, allowed: true });

        //         return callback({ success: true, allowed: false })
        //     } catch (err) {
        //         console.log('error in socket.on partyPermissions', err);
        //         callback({ success: false });
        //     }
        // })

        socket.on('getPartyStatus', ({ partyId }, callback) => {
            try {

                const party = findPartyByPartyId(partyId);
                if (!party) return callback({ success: true, status: 'inactive' });
                return callback({ success: true, status: party.status });
                // else if (party.status === 'Waiting') return callback({ success: true, status: 'Waiting' });
                // else if (party.status === 'Voting') return callback({ success: true, status: 'Voting' });
                // else if (party.status === 'Partying') return callback({ success: true, status: 'Partying' });
                // else return callback({ success: true, status: 'inactive', warning: 'look over here!' });

            } catch (err) {
                console.log('error in socket.on getPartyStatus', err);
                callback({ success: false });
            }
        })

        socket.on('joinPartiesPage', () => {
            socket.join('partiesPage');
            socket.emit('getParties', shortPartiesData());
        })

        socket.on('leavePartiesPage', () => {
            socket.leave('partiesPage');
        })

        // ________________ WITHIN PARTY_________________________
        //WAIT:
        socket.on('skipPartyWait', ({ partyId }) => {
            const user = findUserBySocketId(socket.id);
            if (!user) return console.log('Warning skipPartyWait: no user with socketid');

            const party = findPartyByPartyId(partyId);
            if (!party) return console.log('Warning skipPartyWait: no such party');

            if (party.hostId !== user.userId) return;

            party.wait.skip();

        })

        //VOTE:
        socket.on('partyVote', ({pId, partyId}) => {
            const user = findUserBySocketId(socket.id);
            if (!user) return console.log('Warning partyVote: no user with socketid');
            
            const playlist = playlistModel.findById(pId);
            if(!playlist) return console.log('Warning: partyVote: No such playlist');
            
            const party = findPartyByPartyId(partyId);
            if(!playlist) return console.log('Warning: partyVote: No such party');

            party.vote.add(user.userId, pId);           

        })
    })
}

export { startSocket };