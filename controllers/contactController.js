import Contact from '../models/Contact.js';
import Counter from '../models/Counter.js';

// Create new contact
export const createContact = async (req, res) => {
  try {
    let counter = await Counter.findOneAndUpdate(
      { name: 'contactId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const { fullName, emailAddress, contactNumber, enquiryType, message } = req.body;
    const contact = new Contact({
      contactId: counter.seq,
      fullName,
      emailAddress,
      contactNumber,
      enquiryType,
      message
    });
    await contact.save();
    res.status(201).json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export contacts as CSV
export const exportContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    const csvHeader = 'Full Name,Email Address,Contact Number,Enquiry Type,Message\n';
    const csvRows = contacts.map(x =>
      `"${x.fullName}","${x.emailAddress}","${x.contactNumber}","${x.enquiryType}","${x.message}"`
    ).join('\n');
    const csv = csvHeader + csvRows;
    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

