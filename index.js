require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const request=require('request')
app.use(bodyParser.json());
app.use(cors());

app.post('/webhook/livechat', async (req, res) => {
  try {
    const chat = req.body.payload.chat;
    let ip = chat.users[0]?.last_visit?.ip || 'IP not available';
    const lastPages = chat.users[0]?.last_visit?.last_pages || [];
    const chatCreatedAt = new Date(chat.thread.created_at);

    let maxDuration = 0;
    let longestPage = { 
      url: 'No pages visited',
      duration: 0,
      opened_at: null
    };

    if (lastPages.length > 0) {
      
      const sortedPages = [...lastPages].sort((a, b) => 
        new Date(a.opened_at) - new Date(b.opened_at));

    
      for (let i = 0; i < sortedPages.length; i++) {
        const pageStart = new Date(sortedPages[i].opened_at);
        const pageEnd = i < sortedPages.length - 1 
          ? new Date(sortedPages[i + 1].opened_at) 
          : chatCreatedAt;
          
        const duration = pageEnd - pageStart;

        if (duration > maxDuration) {
          maxDuration = duration;
          longestPage = {
            url: sortedPages[i].url,
            duration: duration,
            opened_at: sortedPages[i].opened_at
          };
        }
      }
    }

    
   ip='172.225.30.54'
    const datazappResponse = await axios.post(
      'https://secureapi.datazapp.com/Appendv2',
      {
        ApiKey: "NKBTHXMFEJ",         
        AppendModule: "ReverseIPAppend",
        AppendType: "3",
        Data: [{ IP: ip }]           
      }
    );
console.log(datazappResponse.data.ResponseDetail.Data)


    return res.status(200).json({
      ip,
      longestPage: {
        ...longestPage,
        duration: longestPage.duration > 0 
          ? `${Math.round(longestPage.duration/1000)} seconds` 
          : 'Single page visit'
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error processing lead.' });
  }
});




app.listen(5000, () => {
  console.log('API server running on port 5000'); 
});