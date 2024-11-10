const express = require("express");
const {
  postBlog,
  getHomeBlog,
  getAllBlog,
  getSingleBlog,
  getMyBlogs,
  updateBlog,
  addComment,
  deleteBlog,
} = require("../controllers/blogCrud");

const router = express.Router();

router.post("/blog", postBlog);
router.get("/home-blog", getHomeBlog);
router.get("/all-blogs", getAllBlog);
router.get("/blog/:id", getSingleBlog);
router.get("/my-blogs", getMyBlogs);
// put
router.put("/update-blog/:id", updateBlog);
router.patch("/add-comment/:id", addComment);
// delete
router.delete("/blog/:id", deleteBlog);

module.exports = router;
