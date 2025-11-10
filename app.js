import express from 'express';
import mongoose from 'mongoose';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose'; // correct
// import User from './models/User.js'; // Make sure model file uses export default
import Contact from './models/Contact.js';
import Counter from './models/Counter.js';

AdminJS.registerAdapter(AdminJSMongoose);

const app = express();

await mongoose.connect('mongodb+srv://codestudios:Nisargh123!@tracker.2usqids.mongodb.net/?retryWrites=true&w=majority&appName=sipl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log('Connected to MongoDB');


const adminJs = new AdminJS({
  resources: [
    {
      resource: Contact,
      options: {
        actions: {
// export: {
//   icon: 'Download',
//   label: 'Export Contacts',
//   actionType: 'resource',
//   handler: async (request, response, context) => {
//     const contacts = await Contact.find();
//     const csvHeader = 'Full Name,Email Address,Contact Number,Enquiry Type,Message\n';
//     const csvRows = contacts.map(x =>
//       `"${x.fullName}","${x.emailAddress}","${x.contactNumber}","${x.enquiryType}","${x.message}"`
//     ).join('\n');
//     const csv = csvHeader + csvRows;

//     // Return as a file instead of sending headers directly
//     return {
//       record: null,
//       notice: {
//         message: 'Contacts exported',
//         type: 'success',
//       },
//       file: {
//         name: 'contacts.csv',
//         content: Buffer.from(csv, 'utf-8'),
//         mimeType: 'text/csv',
//       }
//     };
//   },
//   component: false // no UI needed for download
// }
export: {
  icon: 'Download',
  label: 'Export Contacts',
  actionType: 'resource',
  handler: async (request, response, context) => {
   return {
      redirectUrl: '/api/contacts/export',
      target: '_blank'
    };
  },
  component: false
}


        }
      }
    }
    // You can add other resources here
  ],
  rootPath: '/admin'
});


const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate: async (email, password) => {
    if (email === 'CodeStudios@gmail.com' && password === 'Nisargh123!') {
      return { email, role: 'admin' };
    }
    if (email === 'SIPLAdmin@gmail.com' && password === 'SIPLAdmin@123!') {
      return { email, role: 'admin' };
    }
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: 'yourSecretPassword'
});
app.use(adminJs.options.rootPath, adminRouter);

app.use(express.json()); // Ensure this is present for parsing JSON bodies
app.get('/api/contacts/export', async (req, res) => {
  const contacts = await Contact.find();
  const csvHeader = 'Full Name,Email Address,Contact Number,Enquiry Type,Message\n';
  const csvRows = contacts.map(x =>
    `"${x.fullName}","${x.emailAddress}","${x.contactNumber}","${x.enquiryType}","${x.message}"`
  ).join('\n');
  const csv = csvHeader + csvRows;
  res.header('Content-Type', 'text/csv');
  res.attachment('contacts.csv');
  res.send(csv);
});

app.post('/api/contact', async (req, res) => {
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
});

app.listen(8080, () => console.log('AdminJS is running on http://localhost:8080/admin'));
