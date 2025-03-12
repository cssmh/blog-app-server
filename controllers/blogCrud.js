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
  const sortOption = req.query?.sort || "latest";

  try {
    const query = {};
    if (category) query.category = category;

    let aggregationPipeline = [{ $match: query }];

    if (sortOption === "random") {
      aggregationPipeline.push({ $sample: { size: 10 } });
    } else if (sortOption === "popular") {
      aggregationPipeline.push(
        {
          $addFields: {
            commentsCount: { $size: { $ifNull: ["$comments", []] } },
          },
        },
        { $sort: { commentsCount: -1 } }
      );
    } else {
      aggregationPipeline.push({ $sort: { timestamp: -1 } });
    }

    let result = await blogCollection.aggregate(aggregationPipeline).toArray();
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

const likeBlog = async (req, res) => {
  const { email } = req.body; // Logged-in user's email

  if (!email || !blogId) {
    return res.status(400).send({ message: "Email and blog ID are required" });
  }

  try {
    const filter = { _id: new ObjectId(blogId) };
    const blog = await blogCollection.findOne(filter);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    // Initialize the likes array if it doesn't exist
    if (!blog.likes) {
      await blogCollection.updateOne(filter, { $set: { likes: [] } });
    }

    // Check if the user has already liked the blog
    if (blog.likes.includes(email)) {
      return res.status(400).send({ message: "You already liked this blog" });
    }

    // Add the user's email to the likes array
    const result = await blogCollection.updateOne(filter, {
      $push: { likes: email },
    });

    res.send(result);
  } catch (error) {
    console.error("Error liking blog:", error);
    res
      .status(500)
      .send({ message: "Failed to like blog", error: error.message });
  }
};

const unlikeBlog = async (req, res) => {
  const { email } = req.body; // Logged-in user's email
  const blogId = req.params.id;

  if (!email || !blogId) {
    return res.status(400).send({ message: "Email and blog ID are required" });
  }

  try {
    const filter = { _id: new ObjectId(blogId) };
    const blog = await blogCollection.findOne(filter);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    // Initialize the likes array if it doesn't exist
    if (!blog.likes) {
      await blogCollection.updateOne(filter, { $set: { likes: [] } });
    }

    // Check if the user has liked the blog
    if (!blog.likes.includes(email)) {
      return res
        .status(400)
        .send({ message: "You haven't liked this blog yet" });
    }

    // Remove the user's email from the likes array
    const result = await blogCollection.updateOne(filter, {
      $pull: { likes: email },
    });

    res.send(result);
  } catch (error) {
    console.error("Error unliking blog:", error);
    res
      .status(500)
      .send({ message: "Failed to unlike blog", error: error.message });
  }
};

const likeComment = async (req, res) => {
  const { email } = req.body; // Logged-in user's email
  const { blogId, commentId } = req.params;

  if (!email || !blogId || !commentId) {
    return res
      .status(400)
      .send({ message: "Email, blog ID, and comment ID are required" });
  }

  try {
    const filter = {
      _id: new ObjectId(blogId),
      "comments._id": new ObjectId(commentId),
    };
    const blog = await blogCollection.findOne(filter);

    if (!blog) {
      return res.status(404).send({ message: "Blog or comment not found" });
    }

    // Find the comment
    const comment = blog.comments.find((c) => c._id.toString() === commentId);

    // Initialize the likes array if it doesn't exist
    if (!comment.likes) {
      await blogCollection.updateOne(filter, {
        $set: { "comments.$.likes": [] },
      });
    }

    // Check if the user has already liked the comment
    if (comment.likes.includes(email)) {
      return res
        .status(400)
        .send({ message: "You already liked this comment" });
    }

    // Add the user's email to the likes array
    const result = await blogCollection.updateOne(filter, {
      $push: { "comments.$.likes": email },
    });

    res.send(result);
  } catch (error) {
    console.error("Error liking comment:", error);
    res
      .status(500)
      .send({ message: "Failed to like comment", error: error.message });
  }
};

const unlikeComment = async (req, res) => {
  const { email } = req.body; // Logged-in user's email
  const { blogId, commentId } = req.params;

  if (!email || !blogId || !commentId) {
    return res
      .status(400)
      .send({ message: "Email, blog ID, and comment ID are required" });
  }

  try {
    const filter = {
      _id: new ObjectId(blogId),
      "comments._id": new ObjectId(commentId),
    };
    const blog = await blogCollection.findOne(filter);

    if (!blog) {
      return res.status(404).send({ message: "Blog or comment not found" });
    }

    // Find the comment
    const comment = blog.comments.find((c) => c._id.toString() === commentId);

    // Check if the user has liked the comment
    if (!comment.likes || !comment.likes.includes(email)) {
      return res
        .status(400)
        .send({ message: "You haven't liked this comment yet" });
    }

    // Remove the user's email from the likes array
    const result = await blogCollection.updateOne(filter, {
      $pull: { "comments.$.likes": email },
    });

    res.send(result);
  } catch (error) {
    console.error("Error unliking comment:", error);
    res
      .status(500)
      .send({ message: "Failed to unlike comment", error: error.message });
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
  likeBlog,
  unlikeBlog,
  likeComment,
  unlikeComment,
};
