import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  contactId: { type: Number, unique: true }, // sequential ID
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  enquiryType: { type: String, required: true },
  message: { type: String, required: true }
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;
