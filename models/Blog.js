import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  blogId: { type: Number, unique: true }, // sequential ID
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' }, // blog description/summary
  category: { type: String, required: true }, // category name
  image: { type: String, default: '' }, // blog image
  content: { type: String, required: true }, // blog data/content
  metaTitle: { type: String, default: '' }, // SEO meta title
  metaDescription: { type: String, default: '' }, // SEO meta description
  keywords: { type: String, default: '' }, // SEO keywords (comma-separated)
  authorName: { type: String, default: '' }, // author name
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled'], 
    default: 'draft' 
  },
  scheduledDate: { type: Date, default: null }, // for scheduled posts
  publishedAt: { type: Date, default: null }, // when blog was published
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Blog = mongoose.model('Blog', BlogSchema);

export default Blog;

