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
  updateComment,
  navbarBlogs,
} = require("../controllers/blogCrud");
const { addJwt, getLogout } = require("../controllers/jwt");
const { isToken } = require("../middlewares/auth");

const router = express.Router();

// jwt
router.post("/jwt", addJwt);
router.get("/logout", getLogout);
// post blog
router.post("/blog", postBlog);
router.get("/nav-blog", navbarBlogs);
router.get("/home-blog", getHomeBlog);
router.get("/all-blogs", getAllBlog);
router.get("/blog/:id", getSingleBlog);
router.get("/my-blogs", isToken, getMyBlogs);
// put
router.put("/update-blog/:id", isToken, updateBlog);
router.patch("/add-comment/:id", addComment);
router.patch("/update-comment/:id", updateComment);
// delete
router.delete("/blog/:id", isToken, deleteBlog);

module.exports = router;
