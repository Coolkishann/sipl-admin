// import express from 'express';
// import {
//   getAllBlogs,
//   getBlogById,
//   createBlog,
//   updateBlog,
//   deleteBlog
// } from '../controllers/blogController.js';

// const router = express.Router();

// router.get('/', getAllBlogs);
// router.get('/:id', getBlogById);
// router.post('/', createBlog);
// router.put('/:id', updateBlog);
// router.delete('/:id', deleteBlog);

// export default router;

import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllCategories,
  searchBlogs
} from '../controllers/blogController.js';
// import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/categories', getAllCategories);
router.get('/search', searchBlogs);
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
// router.post('/', upload.single('image'), createBlog);
// router.put('/:id', upload.single('image'), updateBlog);
// router.delete('/:id', deleteBlog);

export default router;

