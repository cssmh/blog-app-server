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

const getHomeBlog = async (req, res) => {
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
};

const getAllBlog = async (req, res) => {
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

module.exports = {
  postBlog, getHomeBlog, getAllBlog, getSingleBlog, getMyBlogs, updateBlog,
  addComment, deleteBlog, updateComment
};
