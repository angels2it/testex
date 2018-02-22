var express = require('express');
var router = express.Router();
var deferred = require('deferred');
const Youtube = require("youtube-api")
  , fs = require("fs")
  , readJson = require("r-json")
  ;
const CREDENTIALS = readJson(`${__dirname}/../credentials.json`);

router.get('/', function (req, res, next) {
  authYoutubeService();
  Youtube.playlists.list({
    "part": "id",
    "mine": true,
    "maxResults": 1
  }, function (err, data) {
    if (err != null || data.items.length === 0) {
      res.json({
        status: 'ERR',
        message: 'Your account doesn\'t has any playlist'
      });
      return;
    }
    res.json({
      status: 'OK',
      data: data.items[0].id
    });
  });
});

router.post('/', function (req, res, next) {
  var title = req.body.title;
  if (!title || title.length == 0) {
    res.send('Please set title of playlist');
    return;
  }
  var videos = req.body.videos;
  if (!videos || videos.length === 0) {
    res.send('Playlist need at least one video');
    return;
  }
  authYoutubeService();
  Youtube.playlists.insert({
    part: 'snippet,status',
    resource: {
      snippet: {
        title: title,
        description: 'A private playlist created with the YouTube API'
      },
      status: {
        privacyStatus: 'private'
      }
    }
  }, function (err, data) {
    if (err != null) {
      res.send(err);
      return;
    }
    var playlistId = data.id;
    var def = deferred();
    // start add first video (index = -1)
    checkFinishedAddVideo(res, playlistId, videos, -1, null, null);
  });
});

function authYoutubeService() {
  Youtube.authenticate({
    type: "oauth"
    , refresh_token: "1/iednq2-hOGAP85BUUNOouTz-GdsyoaNUOAsEq976-ZEQRDMGG9Dxw0EzX29zrxW1"
    , client_id: CREDENTIALS.web.client_id
    , client_secret: CREDENTIALS.web.client_secret
    , redirect_url: CREDENTIALS.web.redirect_uris[0]
  });
}

function checkFinishedAddVideo(res, playlistId, videos, index, win, fail) {
  if (fail != null) {
    res.send(fail);
    return;
  }
  index++;
  if (index == videos.length)
    res.send("OK");
  else {
    addVideoToPlaylist(playlistId, videos[index])(function (win, fail) {
      checkFinishedAddVideo(res, playlistId, videos, index, win, fail);
    });
  }
}

function addVideoToPlaylist(playlistId, videoId) {
  var def = deferred();
  var details = {
    videoId: videoId,
    kind: 'youtube#video'
  }
  Youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: details
      }
    }
  }, function (err, data) {
    if (err != null) {
      def.reject(err);
      return;
    }
    def.resolve();
  });
  return def.promise;
}

module.exports = router;