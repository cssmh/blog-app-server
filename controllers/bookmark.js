const { ObjectId } = require("mongodb");
const client = require("../config/db");
const bookmarkCollection = client.db("BlogAppDB").collection("Bookmarks");

const postBookmark = async (req, res) => {
  try {
    const data = req.body;
    const result = await bookmarkCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.log(err);
  }
};

const getMyBookmark = async (req, res) => {
  try {
    if (req.decodedUser?.email !== req.query?.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    let query = {};
    if (req.query?.email) {
      query = { email: req.query.email };
    }
    const result = await bookmarkCollection.find(query).toArray();
    const ids = result?.map((bookmark) => bookmark.blogId);
    res.send({ result, ids });
  } catch (err) {
    console.log(err);
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const filter = { _id: new ObjectId(req.params?.id) };
    const bookmark = await bookmarkCollection.findOne(filter);
    if (!bookmark) {
      return res.status(404).send({ message: "Bookmark not found" });
    }
    if (req.decodedUser?.email !== bookmark.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    const result = await bookmarkCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
};
module.exports = { postBookmark, getMyBookmark, deleteBookmark };
