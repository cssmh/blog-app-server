const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = 5000;

app.use(
  cors({
    origin: [
      "https://blogapp-eaa3d.web.app",
      "https://ssbloga.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const blogCollection = client.db("BlogAppDB").collection("Blogs");
    const userCollection = client.db("BlogAppDB").collection("Users");

    app.post("/blog", async (req, res) => {
      try {
        const data = req.body;
        const result = await blogCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(err);
      }
    });

    app.get("/all-blogs", async (req, res) => {
      try {
        const page = parseInt(req.query?.page);
        const limit = parseInt(req.query?.limit);
        const searchTerm = req.query?.search || "";
        const skipIndex = (page - 1) * limit;

        const query = {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } },
          ],
        };
        const totalBlogs = (await blogCollection.countDocuments(query)) || 0;
        const totalPages = Math.ceil(totalBlogs / limit) || 0;

        const cursor = blogCollection.find(query).skip(skipIndex).limit(limit);

        const result = await cursor.toArray();
        res.send({ totalPages, totalBlogs, result });
      } catch (err) {
        console.log(err);
      }
    });

    app.get("/popular-blog", async (req, res) => {
      try {
        const result = await blogCollection.find().limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.log(err);
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        const totalAdmin = await userCollection.countDocuments({
          role: "admin",
        });
        res.send({ totalAdmin, result });
      } catch (error) {
        console.log(err);
      }
    });

    app.get("/blog/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params?.id) };
        const result = await blogCollection.findOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    app.get("/my-blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await blogCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    app.get("/role/:email", async (req, res) => {
      try {
        const email = req.params.email.toLowerCase();
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(404).send({ message: "user not found" });
        }
        const result = user.role;
        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.put("/update-blog/:id", async (req, res) => {
      try {
        const filter = { _id: new ObjectId(req.params?.id) };
        const updatedDocs = req.body;
        const options = { new: true };
        const updated = {
          $set: {
            title: updatedDocs.title,
            content: updatedDocs.content,
            category: updatedDocs.category,
            tags: updatedDocs.tags,
            image: updatedDocs.image,
          },
        };

        const result = await blogCollection.updateOne(filter, updated, options);
        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.delete("/blog/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params?.id) };
        const result = await blogCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    app.put("/add-user", async (req, res) => {
      try {
        const currentUser = req.body;
        const query = { email: currentUser.email };
        const user = await userCollection.findOne(query);
        const role = user && user.role === "admin" ? "admin" : "user";
        const options = { upsert: true };
        const result = await userCollection.updateOne(
          query,
          { $set: { ...currentUser, role } },
          options
        );

        res.send(result);
      } catch (err) {
        console.error(err);
      }
    });

    app.patch("/user-update/:email", async (req, res) => {
      try {
        const email = req.params.email.toLowerCase();
        const query = { email };
        const updateDoc = {
          $set: { role: req.body.role },
        };
        const result = await userCollection.updateOne(query, updateDoc);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    app.delete("/delete-user/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params?.id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. Successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to SS Blog app Server");
});

app.listen(port, () => {
  console.log(`CRUD IS RUNNING ON PORT ${port}`);
});
