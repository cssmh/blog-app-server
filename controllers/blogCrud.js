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
};

const addComment = async (req, res) => {
  const { user, content, timestamp } = req.body;
  try {
    const newComment = { user, content, timestamp };
    const filter = { _id: new ObjectId(req.params.id) };
    const result = await blogCollection.updateOne(filter, {
      $push: { comments: newComment },
    });

    res.send(result);
  } catch (error) {
    console.log(error);
  }
};

const deleteBlog = async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params?.id) };
    const result = await blogCollection.deleteOne(query);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  postBlog,
  getHomeBlog,
  getAllBlog,
  getSingleBlog,
  getMyBlogs,
  updateBlog,
  addComment,
  deleteBlog,
};
