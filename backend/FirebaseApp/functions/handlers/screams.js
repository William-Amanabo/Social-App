const { db } = require("../util/admin");

exports.getAllScreams = (req, res) => {
  // return res.json([]); // DEBUGGING
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return res.json(screams);
    })
    .catch((err) => {
      console.trace({ "error from getAllScreams": err.message });
      return res.json([]);
    });
};

exports.postOneScream = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };
  console.log("[New scream that is being created]", newScream);

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      const resScream = newScream;
      resScream.screamId = doc.id;
      return res.json({
         ...resScream
      });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

// fetch one scream
exports.getScream = (req, res) => {
  // return res.json([]); // DEBUGGING
  console.log('[checking req.params.screamId]',req.params.screamId)
  let screamData = {};
  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((document) => {
      if (!document.exists) {
        return response.status(404).json({ error: "Scream not found" });
      }
      screamData = document.data();
      screamData.screamId = document.id;
      return db
        .collection("comments")
        .where("screamId", "==", req.params.screamId)
        .orderBy("createdAt", "desc")
        .get();
    })
    .then((data) => {
      console.log("[comment data from getScream]", data);
      screamData.comments = [];
      data.forEach((doc) => {
        console.log('Foreach runs',doc,doc.data())
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.log({ "error from getScream": err });
      //return res.status(500).json({ error: err.code });
      return res.json([]);
    });
};

//Comment on a scream

exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };

  db.doc(`screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }

      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch((err) => {
      console.log("[error from commentOnScream]", err);
      return res.status(500).json({ error: "Something went wrong" + err });
    });
};

//Like a scream
exports.likeScream = (req, res) => {
  console.log("LikeScream backend runs")
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);

  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData = {};

  screamDocument
    .get()
    .then((doc) => {
      if (!doc.exist) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.json({ error: "scream not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            screamId: req.params.screamId,
            userHandle: req.user.handle,
          })
          .then(() => {
            screamData.likeCount++;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(() => {
            return res.json(screamData);
          });
      } else {
        return res.json({ error: "Scream already liked" });
      }
    })
    .catch((err) => {
      console.trace("[error from likeScream]", err);
      /* res.json({ error: err.code }); */
    });
};

exports.unlikeScream = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("screamId", "==", req.params.screamId)
    .limit(1);

  const screamDocument = db.doc(`/screams/${req.params.screamId}`);

  let screamData = {};

  screamDocument
    .get()
    .then((doc) => {
      if (!doc.exist) {
        screamData = doc.data();
        screamData.screamId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "scream not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Scream not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            screamData.likeCount--;
            return screamDocument.update({ likeCount: screamData.likeCount });
          })
          .then(() => {
            return res.json(screamData);
          });
      }
    })
    .catch((err) => {
      console.trace(err);
      return res.status(500).json({ error: err.code });
    });
};

// Delete  a scream
exports.deleteScream = (req, res) => {
  const document = db.doc(`/screams/${req.params.screamId}`);

  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Scream not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: " Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      return res.json({ message: "Scream Deleted" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
