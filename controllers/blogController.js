import Blog from '../models/Blog.js';
import Counter from '../models/Counter.js';

// Get all blogs with optional filters and pagination
export const getAllBlogs = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    
    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination info
    const total = await Blog.countDocuments(query);
    
    // Get paginated blogs
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.status(200).json({ 
      success: true, 
      blogs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBlogs: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ blogId: parseInt(req.params.id) });
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new blog
export const createBlog = async (req, res) => {
  try {
    let counter = await Counter.findOneAndUpdate(
      { name: 'blogId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    
    const { 
      name, 
      title, 
      description, 
      category, 
      content, 
      metaTitle, 
      metaDescription, 
      keywords, 
      authorName, 
      status, 
      scheduledDate 
    } = req.body;
    
    // Validate required fields
    if (!name || !title || !category || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, title, category, and content are required' 
      });
    }
    
    // If status is scheduled, validate scheduledDate
    if (status === 'scheduled' && !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'scheduledDate is required when status is "scheduled"' 
      });
    }
    
    // Get image URL from Cloudinary upload or from body
    // If file is uploaded, use Cloudinary URL (req.file.path)
    // Otherwise, use image URL from body (for backward compatibility)
    const imageUrl = req.file ? req.file.path : (req.body.image || '');
    
    // If status is published, set publishedAt to now
    const publishedAt = status === 'published' ? new Date() : null;
    
    const blog = new Blog({
      blogId: counter.seq,
      name,
      title,
      description: description || '',
      category,
      image: imageUrl,
      content,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      keywords: keywords || '',
      authorName: authorName || '',
      status: status || 'draft',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      publishedAt
    });
    
    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { 
      name, 
      title, 
      description, 
      category, 
      content, 
      metaTitle, 
      metaDescription, 
      keywords, 
      authorName, 
      status, 
      scheduledDate 
    } = req.body;
    
    const blog = await Blog.findOne({ blogId: parseInt(req.params.id) });
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    
    // Update fields
    if (name !== undefined) blog.name = name;
    if (title !== undefined) blog.title = title;
    if (description !== undefined) blog.description = description;
    if (category !== undefined) blog.category = category;
    // If file is uploaded, use Cloudinary URL (req.file.path)
    // Otherwise, update with image URL from body if provided
    if (req.file) {
      blog.image = req.file.path;
    } else if (req.body.image !== undefined) {
      blog.image = req.body.image;
    }
    if (content !== undefined) blog.content = content;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (keywords !== undefined) blog.keywords = keywords;
    if (authorName !== undefined) blog.authorName = authorName;
    if (status !== undefined) {
      blog.status = status;
      // If changing to published and not already published, set publishedAt
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    if (scheduledDate !== undefined) {
      blog.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    }
    
    blog.updatedAt = new Date();
    await blog.save();
    
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ blogId: parseInt(req.params.id) });
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search blogs by title or content
export const searchBlogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query (q) parameter is required' 
      });
    }
    
    // Create search query for title and content
    const searchQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } }, // case-insensitive search in title
        { content: { $regex: q, $options: 'i' } } // case-insensitive search in content
      ]
    };
    
    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination info
    const total = await Blog.countDocuments(searchQuery);
    
    // Get paginated search results
    const blogs = await Blog.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.status(200).json({ 
      success: true, 
      blogs,
      searchQuery: q,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBlogs: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

