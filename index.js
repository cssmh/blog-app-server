const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blogapp-eaa3d.web.app",
      "https://mblogapp.netlify.app",
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
    const blogCollection = client.db("BlogAppDB").collection("Blogs");

    app.post("/blog", async (req, res) => {
      try {
        const data = req.body;
        const result = await blogCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(err);
      }
    });

    app.get("/home-blog", async (req, res) => {
      const searchTerm = req.query?.search || "";
      const category = req.query?.category || "";
      try {
        const query = {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } },
          ],
        };
        if (category) {
          query.category = category;
        }
        const result = await blogCollection.find(query).limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.log(err);
      }
    });

    app.get("/all-blogs", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const result = await blogCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();

        const totalBlogs = await blogCollection.countDocuments();
        res.send({ result, totalBlogs });
      } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
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

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Blog app Server");
});

app.listen(port, () => {
  console.log(`CRUD IS RUNNING ON PORT ${port}`);
});
