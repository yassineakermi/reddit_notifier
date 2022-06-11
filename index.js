const cron = require('node-cron');
var fs = require('fs')
const axios = require('axios').default;
var last_scrape_date;

// UPDATE WITH ITEMS YOU WANT TO SEARCH FOR
let subreddits = ['slavelabour', 'forhire']

const nodemailer = require('nodemailer');

// UPDATE WITH EMAIL YOU WANT TO RECEIVE AT
let emailRecipient = "yassineakermiy@gmail.com"

// UPDATE WITH YOUR SENDING EMAIL ACCOUNT
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yassineakermiylondon@gmail.com',
    pass: 'kgpayictsaksyivk'
  }
});

const SendMail = (item, sub) => {
  const mailOptions = {
    from: sub,
    to: emailRecipient,
    subject: `${item.data?.title}`,
    text: `${item.data?.title}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })

}


async function ScrapeNewPosts() {

  fs.readFile('./last_scrape.json', 'utf-8', function (err, data) {
    last_scrape_date = JSON.parse(data).last_scrape_date;
    console.log('uuu', last_scrape_date)
     subreddits.map(sub => {
      axios.get(`https://www.reddit.com/r/${sub}/new.json?sort=new`)
        .then(subNewPosts => subNewPosts.data?.data?.children?.forEach(child => {
          if ((child.data?.link_flair_text === "Task" || child.data?.link_flair_text === "Hiring") && child.data?.created > last_scrape_date) {
            SendMail(child, sub)
          }
        }))
    })

    let new_date = JSON.parse(data)
    new_date.last_scrape_date = Math.round(new Date() / 1000)
    fs.writeFile('./last_scrape.json', JSON.stringify(new_date), 'utf-8', function(err) {
      if (err) throw err
      console.log('Updated past items')
    })
  })
}




cron.schedule('*/1 * * * *', async function() {
      ScrapeNewPosts()
});