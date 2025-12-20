const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock Data
const CAMPAIGNS = [
  { id: 1, title: 'testing 1wer', description: 'test', budget: 'HKD 0', status: 'Active', candidate: 0, invitationEnd: 'Mar 22, 2025', action: false },
  { id: 2, title: 'f', description: 'f', budget: 'HKD 0', status: 'Active', candidate: 0, invitationEnd: 'May 13, 2025', action: false },
  { id: 3, title: 'Test send out email to remind influencers', description: 'Test send out email to remind influenc...', budget: 'HKD 0', status: 'Active', candidate: 0, invitationEnd: 'Apr 11, 2025', action: false },
  { id: 4, title: 'ff', description: 'ff', budget: 'HKD 0', status: 'Active', candidate: 0, invitationEnd: 'Apr 26, 2025', action: false },
  { id: 5, title: 'test email send out to sponsor product', description: 'test email send out to sponsor product', budget: 'HKD 0', status: 'Active', candidate: 43, invitationEnd: 'Jul 23, 2025', action: false },
  { id: 6, title: 'dd', description: 'dd', budget: 'HKD 0', status: 'Active', candidate: 6, invitationEnd: 'Oct 28, 2025', action: false },
];

const TRANSACTIONS = [
    { id: 1, description: 'Top up', party: 'Starnet', date: 'Jul 30, 2023, 4:35 PM', amount: '+ 2,000' },
    { id: 2, description: 'Credit Transfer', party: 'Influencer 1', date: 'Jul 30, 2023, 4:35 PM', amount: '- 2,000' },
    { id: 3, description: 'Top up', party: 'Starnet', date: 'Jul 30, 2023, 4:35 PM', amount: '+ 2,000' },
    { id: 4, description: 'Credit Transfer', party: 'Influencer 1', date: 'Jul 30, 2023, 4:35 PM', amount: '- 2,000' },
];

const USER = {
    name: 'Tracy Lee',
    companyName: 'Test Company Name',
    email: 'trevorphilips@gmail.com',
    phoneCode: '+852',
    phoneNumber: '01239854234',
    credit: '12,546',
    totalTopUp: '15.2K',
    totalExpenses: '2.4K'
};

// API Routes
app.get('/api/campaigns', (req, res) => {
  res.json(CAMPAIGNS);
});

app.get('/api/transactions', (req, res) => {
    res.json(TRANSACTIONS);
});

app.get('/api/user', (req, res) => {
    res.json(USER);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
