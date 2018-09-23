var fs = require('fs');
const { promisify } = require('util');
const readFIle = promisify(fs.readFile);
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

console.log(TOKEN_PATH);
module.exports = async function callw() {
  const credentials = await JSON.parse(await readFIle('client_secret.json'));
  const token = await JSON.parse(await readFIle(TOKEN_PATH));

  console.log('アピい', token);

  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  oauth2Client.credentials = token;
  return await getLiveChatMessage(oauth2Client);
}

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  var liveChatId =  authorize(JSON.parse(content), getLiveChatId);
  console.log(liveChatId);
  
  authorize(JSON.parse(content), getLiveChatMessage);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });


}

function getLiveChatId(auth)
{
  var service = google.youtube('v3');
  var liveChatId = null;
  service.liveBroadcasts.list({
    auth: auth,
    part: 'snippet',
    id: "o3oWoxbURqk",//TODO videoID
    //https://www.youtube.com/watch?v=o3oWoxbURqk

  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var videos = response.data.items;
    console.log(videos.length);    
    if (videos.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  videos[0].id,
                  videos[0].snippet.title,
                  videos[0].snippet.liveChatId);
      liveChatId = videos[0].snippet.liveChatId;

    }

  });
}

async function getLiveChatMessage(auth)
{
    var service = google.youtube('v3');
    var pageToken = '';
    
    const callYouTube = service.liveChatMessages.list({
      auth: auth,
      part: 'snippet,authorDetails',
      liveChatId: "EiEKGFVDeEZWU2ZTblB3Qnl0WFNpZG1NbmlkdxIFL2xpdmU",//TODO LiveChatID
      pageToken: pageToken,
    });

    return callYouTube.then(response =>  {
      const messages = response.data.items;
      console.log(messages.length);    
      if (messages.length == 0) {
        console.log('No channel found.');
      } 
      else {
        for(let i = 0;i < messages.length;i++)
        {
          console.log('message %s name: %s userChannelId: %s ChannelUrl:%s',
          messages[i].snippet.displayMessage,
          messages[i].authorDetails.displayName,
          messages[i].authorDetails.channelId,
          messages[i].authorDetails.channelUrl
          );

        }
        pageToken = response.data["nextPageToken"];
      }
      return messages;
    })
    .catch(err => {
      console.log('The API returned an error: ' + err);
    });
  
}
