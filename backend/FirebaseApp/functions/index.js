const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/FBAuth");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams");
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
  setPushNotification,
} = require("./handlers/users.js");
const { db, admin } = require("./util/admin");

const cors = require("cors");

app.use(cors());

// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// Users route
app.post("/signup", signUp);
app.post("/login", logIn);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user/", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/pushNotification", FBAuth, setPushNotification);

app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    console.log("creating notification on like");
    var pushNotificationInfo = {};
    pushNotificationInfo.scream = snapshot.data().screamId;
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          console.log("creating notification on like passed if statement");
          pushNotificationInfo.recipient = doc.data().userHandle;
          pushNotificationInfo.sender = snapshot.data().userHandle;

          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .then(() => {
        return db
          .doc(`/users/${pushNotificationInfo.sender}`)
          .get()
          .then((doc) => {
            return (pushNotificationInfo.image = doc.data().imageUrl);
          })
          .then(() => {
            return db
              .doc(`/pushNotification/${pushNotificationInfo.recipient}`)
              .get()
              .then((doc) => {
                const token = doc.data().token;

                const title = JSON.stringify(
                  `${pushNotificationInfo.sender} liked  your Scream !`
                );
                const icon = JSON.stringify(`${pushNotificationInfo.image}`);
                const click = 
                  `users/${pushNotificationInfo.recipient}/scream/${pushNotificationInfo.scream}`
                

                console.log("title", title);
                console.log("icon", icon);
                console.log("click", click);

                var payload = {
                  data: {
                    title: title,
                    body: "Notification from socialape webapp",
                    icon: icon,
                    click: click,
                  },
                  token: token,
                };

                admin
                  .messaging()
                  .send(payload)
                  .then((response) => {
                    // Response is a message ID string.
                    console.log("Successfully sent message:", response);
                  })
                  .catch((error) => {
                    console.log("Error sending message:", error);
                  });
              });
          })
          .catch((err) => {
            console.error(err);
          });
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    console.log("deleting notification on unlike");
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate((snapshot) => {
    var pushNotificationInfo = {};
    pushNotificationInfo.scream = snapshot.data().screamId;

    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        console.log("creating notification on comment");
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          console.log("creating notification on comment passed if section");
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .then(() => {
        return db
          .doc(`/users/${pushNotificationInfo.sender}`)
          .get()
          .then((doc) => {
            return (pushNotificationInfo.image = doc.data().imageUrl);
          })
          .then(() => {
            return db
              .doc(`/pushNotification/${pushNotificationInfo.recipient}`)
              .get()
              .then((doc) => {
                var token = doc.data().token;

                const title = JSON.stringify(
                  `${pushNotificationInfo.sender} commented on your Scream !`
                );
                const icon = JSON.stringify(`${pushNotificationInfo.image}`);
                const click = 
                  `users/${pushNotificationInfo.recipient}/scream/${pushNotificationInfo.scream}`
                

                console.log("title", title);
                console.log("icon", icon);
                console.log("click", click);

                var payload = {
                  data: {
                    title: title,
                    body: "Notification from socialape webapp",
                    icon: icon,
                    click: click,
                  },
                  token: token,
                };

                admin
                  .messaging()
                  .send(payload)
                  .then((response) => {
                    // Response is a message ID string.
                    console.log("Successfully sent message:", response);
                  })
                  .catch((error) => {
                    console.log("Error sending message:", error);
                  });
              });
          });
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore
  .document("user/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());

    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image has changed");

      let batch = db.batch();
      return db
        .collection("screams")
        .where("userhandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions.firestore
  .document("/scream/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("screamId", "==", screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get(); // this get() might be problem in future delete it
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
