const { db, admin } = require('../util/admin');

const config = require("../util/config")

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators')


//Sign user in
exports.signUp = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    const { valid, errors } = validateSignupData(newUser);


    if (!valid) return res.status(400).json(errors)


    const noImg = 'no-img.png'

    let token, userId
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken' })
            } else {
               // console.log("[stage]",'about to create email auth')
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        }).then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
           // console.log({"returning access token": token})
            return res.status(201).json({ token })
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email already in use' })
            } else {
                return res.status(500).json({ general: err.message }) // change this error code to Something went wrong later
            }
        })
}


// Log user in 
exports.logIn = (req, res) => {
    //return res.json({token:'q3w4e56r7t8y9hjj8hgfdse45dr67ft8g9h0jjh7gf8d90s85utjgmyguifcod9rifgj'}); // DEBUGGING
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const { valid, errors } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors)



    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.error('[error from Login]',err); // this if block might be cause of a crash later
            return res.status(400).json({ general: 'Something went wrong, pls try again' })
        })
}


//Add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details updated successfully' })
        })
        .catch(err => {
            console.error(err.message);
            return res.status(500).json({ err: err.code });
        })
}

//getUserDetails handler to get a user's details
exports.getUserDetails = (request, response) => {
    let userData = {};
    db.doc(`/users/${request.params.handle}`).get()
      .then((document) => {
        //Check if the user exists
        if(document.exists){
          userData.user = document.data();
          //Return the screams of the queried user
          return db.collection('screams').where('userHandle', '==', request.params.handle)
            .orderBy('createdAt', 'desc').get();
        } else {
          return response.status(404).json({error: 'User not found'});
        }
      }).then((data) => {
        //Initialize the Screams of the queried user as an empty array.
        //console.log("[data gotten from getUserDetails] ", data)
        userData.screams = [];
        data.forEach(document => {
          userData.screams.push({
            body: document.data().body,
            createdAt: document.data().createdAt,
            userHandle: document.data().userHandle,
            userImage: document.data().userImage,
            likeCount: document.data().likeCount,
            commentCount: document.data().commentCount,
            screamId: document.id,
          });
        });
        return response.json(userData);
      }).catch((err) => {
        console.log("[error from getUser details]",err)
        return response.status(500).json({error: err});
      });
  };


//Get user details

exports.getAuthenticatedUser = (req, res) => {
    let userData = {}
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get();
            }
        })
        .then(data => {
            //console.log("[check for db search of collection likes]",data)
            userData.likes = []
            data.forEach(doc => {
                userData.likes.push(doc.data())
            });
            return db.collection('notifications')
            .where('recipient', '==', req.user.handle)
            .orderBy('createdAt', 'desc').limit(10).get();
                   
        })
        .then(data => {
            //console.log('[data for notification query in getAuthenticated]',data.docs)
            userData.notifications = []
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id,
                    screamId:doc.data().screamId
                })
            })
           // console.log(`%c [getting users own data]:${userData}`,'color: orange; font-weight: bold;') 
            return res.json(userData)
        })
        .catch(err => {
            console.trace({"getAuthenticated User error":err});
            return res.status(500).json({ error: err.code })
        })
}

//Upload image
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};
    let mimeType = ''

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype)
        mimeType = mimetype
            //img.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random() *100000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        console.log("this is file path ", filepath)
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    })
    busboy.on('finish', () => {
        console.log('this is mimetype',mimeType)
        console.log(mimeType != 'image/jpeg')
        if (mimeType != 'image/png' && mimeType != 'image/jpeg') {
            return res.status(400).json({
                error: "wrong file type submitted"
            })
        }
        console.log('[Passed the if check]')
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            })
            .then(() => {
                console.log('[Image successfully uploaded now wetting it to user]')
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
            })
            .then(() => {
                console.log('[Image upload process successful]')
                return res.json({ message: "Image Uploaded successfully" })
            })
            .catch(err => {
                console.error({ "error from uploadImage": err.code })
                return res.status(500).json({ error: err.code })
            })
    })

    busboy.end(req.rawBody);
}



exports.markNotificationsRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const notification = db.doc(`notifications/${notificationId}`);
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return res.json({ message: 'Notification marked read' })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        })
}

exports.setPushNotification = (req,res) =>{
    console.log("finding out what token is",req.body.token)
    const notificationCredentials = {
//        user:req.user.handle,
        token:req.body.token,
//        image:req.user.imageUrl
    }

    db.doc(`/pushNotification/${req.user.handle}`).set(notificationCredentials).then(doc=>{
        console.log("this is doc,", doc);
        return res.status(200).send("OK")
    })
}