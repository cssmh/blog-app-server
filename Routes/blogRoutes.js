const express = require("express");
const {
  postBlog,
  getHomeBlog,
  getSingleBlog,
  getMyBlogs,
  updateBlog,
  addComment,
  deleteBlog,
  updateComment,
  navbarBlogs,
  likeBlog,
  unlikeBlog,
  likeComment,
  unlikeComment,
} = require("../controllers/blogCrud");
const { addJwt, getLogout } = require("../controllers/jwt");
const { isToken } = require("../middlewares/auth");
const {
  postBookmark,
  getMyBookmark,
  deleteBookmark,
} = require("../controllers/bookmark");

const router = express.Router();

// jwt
router.post("/jwt", addJwt);
router.get("/logout", getLogout);
// post blog
router.post("/blog", postBlog);
router.post("/bookmarks", postBookmark);
router.get("/nav-blog", navbarBlogs);
router.get("/home-blog", getHomeBlog);
router.get("/blog/:id", getSingleBlog);
router.get("/my-blogs", isToken, getMyBlogs);
router.get("/my-bookmarks", isToken, getMyBookmark);
// put
router.put("/update-blog/:id", isToken, updateBlog);
router.patch("/add-comment/:id", addComment);
router.patch("/update-comment/:id", updateComment);
router.patch("/like-blog/:id", likeBlog);
router.patch("/unlike-blog/:id", unlikeBlog);
// delete
router.delete("/blog/:id", isToken, deleteBlog);
router.delete("/bookmark/:id", isToken, deleteBookmark);

module.exports = router;
