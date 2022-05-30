const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var admin = require("firebase-admin");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//firebase admin initialization

//var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
  }),
});

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bwohy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedUser = await admin.auth().verifyIdToken(idToken);
      req.decodedUserEmail = decodedUser.email;
      req.decodedUserUid = decodedUser.uid;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

async function run() {
  try {
    await client.connect();
    console.log("database connected");
    const cureEdgeDB = client.db("cureEdgeDB");
    const doctorCollection = cureEdgeDB.collection("doctors");
    const serviceCollection = cureEdgeDB.collection("services");
    const hospitalCollection = cureEdgeDB.collection("hospitals");
    const reviewCollection = cureEdgeDB.collection("reviews");
    const appoinmentCollection = cureEdgeDB.collection("appoinments");
    const userCollection = cureEdgeDB.collection("users");

    //add doctor's info
    app.post("/addDoctor", async (req, res) => {
      const addDoctor = req.body;
      const result = await doctorCollection.insertOne(addDoctor);
      res.json(result);
    });

    //get all doctor's info
    app.get("/doctors", async (req, res) => {
      const cursor = doctorCollection.find({});
      const doctors = await cursor.toArray();
      res.send(doctors);
    });

    //get single doctor's info
    app.get("/doctors/:doctorId", async (req, res) => {
      const id = req.params.doctorId;
      const query = { _id: ObjectId(id) };
      const result = await doctorCollection.findOne(query);
      res.json(result);
    });

    //update doctor's info
    app.put("/doctors/:doctorId", async (req, res) => {
      const id = req.params.doctorId;
      const updatedDoctorsInfo = req.body;
      console.log(updatedDoctorsInfo);
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          doctorName: updatedDoctorsInfo.doctorName,
          facebookLink: updatedDoctorsInfo.facebookLink,
          twitterLink: updatedDoctorsInfo.twitterLink,
          linkedInLink: updatedDoctorsInfo.linkedInLink,
          description: updatedDoctorsInfo.description,
          image: updatedDoctorsInfo.image,
        },
      };

      const result = await doctorCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //delete single doctor's info
    app.delete("/doctors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await doctorCollection.deleteOne(query);
      res.json(result);
    });

    //add service info
    app.post("/addService", async (req, res) => {
      const addService = req.body;
      const result = await serviceCollection.insertOne(addService);
      res.json(result);
    });
    //get all services info
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    //get single service info
    app.get("/services/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.json(result);
    });

    //update service info
    app.put("/services/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const updatedServiceInfo = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          serviceName: updatedServiceInfo.serviceName,
          serviceCharge: updatedServiceInfo.serviceCharge,
          serviceDescription: updatedServiceInfo.serviceDescription,
          image: updatedServiceInfo.image,
        },
      };

      const result = await serviceCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //delete single service
    app.delete("/services/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.json(result);
    });

    //add Hospital info
    app.post("/addHospital", async (req, res) => {
      const addHospital = req.body;
      const result = await hospitalCollection.insertOne(addHospital);
      res.json(result);
    });

    //get all hospital info
    app.get("/hospitals", async (req, res) => {
      const cursor = hospitalCollection.find({});
      const hospitals = await cursor.toArray();
      res.send(hospitals);
    });

    //get single hospital info
    app.get("/hospitals/:hospitalId", async (req, res) => {
      const id = req.params.hospitalId;
      const query = { _id: ObjectId(id) };
      const result = await hospitalCollection.findOne(query);
      res.json(result);
    });

    //update hospital info
    app.put("/hospitals/:hospitalId", async (req, res) => {
      const id = req.params.hospitalId;
      const updatedHospitalInfo = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          hospitalName: updatedHospitalInfo.hospitalName,
        },
      };

      const result = await hospitalCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //delete single service
    app.delete("/hospitals/:hospitalId", async (req, res) => {
      const id = req.params.hospitalId;
      const query = { _id: ObjectId(id) };
      const result = await hospitalCollection.deleteOne(query);
      res.json(result);
    });

    //add riview
    app.post("/addReview", async (req, res) => {
      const addReview = req.body;
      const result = await reviewCollection.insertOne(addReview);
      res.json(result);
    });

    //get all riviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    //update review status
    app.patch("/updateReviewStatus", verifyToken, async (req, res) => {
      const requester = req.decodedUserEmail;
      const { id, status } = req.body;
      if (requester) {
        const requesterAccount = await userCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "Admin") {
          reviewCollection
          .findOneAndUpdate(
            { _id: ObjectId(id) },
            {
              $set: { status },
            }
          )
          .then((result) => {
            res.send(result.modifiedCount > 0);
          });
        }
      } else {
        res.status(401).json({ message: "Unauthorized user" });
      }
      
      
    });

    //delete single review
    app.delete("/reviews/:reviewId", async (req, res) => {
      const id = req.params.reviewId;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.json(result);
    });

    //add appoinment info
    app.post("/addAppoinment", async (req, res) => {
      const addAppoinment = req.body;
      const result = await appoinmentCollection.insertOne(addAppoinment);
      res.json(result);
    });

    //get all appoinment info
    app.get("/appoinments", verifyToken, async (req, res) => {
      const requester = req.decodedUserEmail;
      if (requester) {
        const requesterAccount = await userCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "Admin") {
          const cursor = await appoinmentCollection.find({});
          const appoinments = await cursor.toArray();
          res.json(appoinments);
        }
      } else {
        res.status(401).json({ message: "Unauthorized user" });
      }
    });

    //get single appoinment info
    app.get("/appoinments/:appoinmentId", async (req, res) => {
      const id = req.params.appoinmentId;
      const query = { _id: ObjectId(id) };
      const result = await appoinmentCollection.findOne(query);
      res.json(result);
    });

    //get appoinment by user
    app.get("/appoinmentByUser", verifyToken, async (req, res) => {
      const email = req.decodedUserEmail;
      if (req.decodedUserEmail === email) {
        const query = { email: email };
        const cursor = appoinmentCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
      } else {
        res.status(401).json({ message: "Unauthorized user" });
      }
    });

    //update appoinment status
    app.patch("/updateAppoinmentStatus", verifyToken, async (req, res) => {
      const requester = req.decodedUserEmail;
      const { id, status } = req.body;
      if (requester) {
        const requesterAccount = await userCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "Admin") {
          appoinmentCollection
            .findOneAndUpdate(
              { _id: ObjectId(id) },
              {
                $set: { status },
              }
            )
            .then((result) => {
              res.send(result.modifiedCount > 0);
            });
        }
      } else {
        res.status(401).json({ message: "Unauthorized user" });
      }
    });

    //delete single appoinment
    app.delete("/appoinments/:appoinmentId", async (req, res) => {
      const id = req.params.appoinmentId;
      const query = { _id: ObjectId(id) };
      const result = await appoinmentCollection.deleteOne(query);
      res.json(result);
    });

    //get all users
    app.get("/users", verifyToken, async (req, res) => {
      const requester = req.decodedUserEmail;
      if (requester) {
        const requesterAccount = await userCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "Admin") {
          const cursor = await userCollection.find({});
          const users = await cursor.toArray();
          res.json(users);
        }
      } else {
        res.status(401).json({ message: "Unauthorized user" });
      }
    });

    //get admin users
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'Admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //delete single user
    app.delete("/users/:userId", async (req, res) => {
      const id = req.params.userId;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.json(result);
    });

    //add users
    app.post("/addUser", async (req, res) => {
      const addUser = req.body;
      const result = await userCollection.insertOne(addUser);
      res.json(result);
    });

    //upsert users
    app.put("/addUser", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //admin user role set
    app.put("/users/role", async (req, res) => {
      const { email, role } = req.body;
      const filter = { email: email };
      const updateDoc = { $set: { role } };
      const result = await userCollection.findOneAndUpdate(filter, updateDoc);
      res.json(result);
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
