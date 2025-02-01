const { ObjectId } = require("mongodb");
const client = require("../config/db");
const blogCollection = client.db("BlogAppDB").collection("Blogs");

const postBlog = async (req, res) => {
  try {
    const data = req.body;
    const result = await blogCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.log(err);
  }
};

const navbarBlogs = async (req, res) => {
  const searchTerm = req.query.search || "";
  try {
    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const result = await blogCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).send({ message: "Failed to search blogs", error });
  }
};

const getHomeBlog = async (req, res) => {
  const category = req.query?.category || "";
  const sortOption = req.query?.sort || "latest"; // Get sorting option from query

  try {
    const query = {};

    if (category) {
      query.category = category;
    }

    let sortCriteria = { timestamp: -1 }; // Default to latest (newest first)

    if (sortOption === "random") {
      sortCriteria = { $sample: { size: 10 } }; // MongoDB random selection
    } else if (sortOption === "all") {
      sortCriteria = {}; // No sorting, return all
    }

    let result;

    if (sortOption === "random") {
      // If random, use aggregation
      result = await blogCollection
        .aggregate([{ $match: query }, sortCriteria])
        .toArray();
    } else {
      // Otherwise, use find() with sorting
      result = await blogCollection.find(query).sort(sortCriteria).toArray();
    }

    res.send(result);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send({ message: "Failed to fetch blogs", error });
  }
};

const getSingleBlog = async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params?.id) };
    const result = await blogCollection.findOne(query);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

const getMyBlogs = async (req, res) => {
  try {
    if (req.decodedUser?.email !== req.query?.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    let query = {};
    if (req.query?.email) {
      query = { email: req.query.email };
    }
    const result = await blogCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

const updateBlog = async (req, res) => {
  try {
    const filter = { _id: new ObjectId(req.params?.id) };
    const { email } = await blogCollection.findOne(filter);
    if (req.decodedUser?.email !== email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    const options = { new: true };
    const updated = {
      $set: {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        tags: req.body.tags,
        image: req.body.image,
      },
    };

    const result = await blogCollection.updateOne(filter, updated, options);
    res.send(result);
  } catch (err) {
    console.error(err);
  }
};

const deleteBlog = async (req, res) => {
  try {
    const filter = { _id: new ObjectId(req.params?.id) };
    const { email } = await blogCollection.findOne(filter);
    if (req.decodedUser?.email !== email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    const result = await blogCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

const addComment = async (req, res) => {
  const { user, email, content, timestamp } = req.body;
  try {
    const newComment = { user, email, content, timestamp };
    const filter = { _id: new ObjectId(req.params.id) };
    const result = await blogCollection.updateOne(filter, {
      $push: { comments: newComment },
    });

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const updateComment = async (req, res) => {
  const { comment, updatedContent } = req.body;
  const filter = {
    _id: new ObjectId(req.params.id),
    "comments.timestamp": comment.timestamp,
  };
  const update = { $set: { "comments.$.content": updatedContent } };

  try {
    const result = await blogCollection.updateOne(filter, update);
    res.send(result);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).send("Failed to update comment.");
  }
};

module.exports = {
  navbarBlogs,
  postBlog,
  getHomeBlog,
  getSingleBlog,
  getMyBlogs,
  updateBlog,
  addComment,
  deleteBlog,
  updateComment,
};
