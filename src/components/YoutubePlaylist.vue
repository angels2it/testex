<template>
  <div class="pll-main" v-if="currentVideoId">
    <div id="pll-video-player">
        <iframe :src="currentVideoEmbed"
        :width="width" 
        :height="height" 
        frameborder="0" 
        allow="autoplay; encrypted-media" 
        allowfullscreen>
        </iframe>
        </div>
        <div id="pll-video-list" v-bind:style="{height: height}">
          <div id="pll-info">
            <span id="pll-title">Crypto Famyly</span>
          <span id="pll-subtitle">Freedom - {{currentVideoIndex + 1}} / {{totalVideo}}</span>
          </div>
          <q-list highlight no-border>
  <q-item v-for="video in videos" :key="video.contentDetails.videoId" class="pll-video-item" v-on:click.native="videoClicked(video)">
      <q-item-side :image="video.snippet.thumbnails.default.url" />
          <q-item-main>
            <q-item-tile label class="pll-video-item-title">{{ video.snippet.title }}</q-item-tile>
            <q-item-tile sublabel>{{ video.snippet.channelTitle }}</q-item-tile>
          </q-item-main>
  </q-item>
</q-list>
        </div>
  </div>
</template>

<script>
import axios from "axios";

let HTTP = null;

var components = Object.assign({}, Quasar.components);
export default {
  name: "YoutubePlaylist",
  components: components,
  props: {
    playlistApi: {
      type: String,
      required: true
    },
    playlistId: {
      type: String,
      required: true
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      currentVideoId: null,
      currentVideoIndex: 0,
      videos: []
    };
  },
  computed: {
    currentVideoEmbed: function() {
      return "https://www.youtube.com/embed/" + this.currentVideoId;
    },
    totalVideo: function() {
      return this.videos.length;
    }
  },
  created() {
    var vm = this;
    if (!vm.playlistApi || vm.playlistApi.length === 0) {
      console.log("Pleaqse config playlist api");
      return;
    }
    HTTP = axios.create({
      baseURL: vm.playlistApi
    });
    // vm.getCurrentPlaylist(function(err, playlistId) {
    //   if (err != null) {
    //     console.log(err);
    //     return;
    //   }
    // });
    vm.getVideosOfPlayList(vm.playlistId, function(err, data) {
      vm.videos = data;
      if (vm.videos.length > 0) {
        vm.currentVideoId = vm.videos[0].contentDetails.videoId;
      }
    });
  },
  methods: {
    videoClicked: function(video) {
      this.currentVideoIndex = this.videos.indexOf(video);
      this.currentVideoId = video.contentDetails.videoId;
    },
    getCurrentPlaylist: function(callback) {
      HTTP.get(`playlists`)
        .then(response => {
          var data = response.data;
          if (data.status != "OK") {
            console.log(data.message);
            callback(data.message, null);
            return;
          }
          callback(null, data.data);
        })
        .catch(e => {
          callback(e.message, null);
        });
    },
    getVideosOfPlayList: function(id, callback) {
      HTTP.get("playlists/" + id)
        .then(response => response.data)
        .then(data => {
          callback(data.message, data.data);
        })
        .catch(e => {
          callback(e.message, null);
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#pll-main {
  display: block;
}
#pll-video-player {
  width: 70%;
  float: left;
}
#pll-video-list {
  width: 30%;
  height: 100%;
  display: inline-block;
  background-color: #f5f5f5;
  text-align: left;
}
#pll-info {
  padding: 15px 15px 0px 15px;
}
#pll-title {
  font-size: 20px;
  font-weight: bold;
  display: block;
}
#pll-subtitle {
  font-size: 14px;
  font-weight: normal;
  line-height: 1;
  letter-spacing: 0;
}
.pll-video-item {
}
.pll-video-item-title {
  font-weight: bold;
}
</style>
