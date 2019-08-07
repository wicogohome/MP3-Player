var app = new Vue({
    el: '#app',
    data: {
        current_song: 0,
        current_list: 0,
        playlist: [
            [{
                video_id: 'shtmgfivCyo',
                title: "BIN - 悪食(MV)",
                channel_title: "BIN official",
                img_url: "https://i.ytimg.com/vi/shtmgfivCyo/maxresdefault.jpg",
                time: 200,
                now: 0,
            }],
            []
        ],
        lists: [{name: 'work', playlist_id: 'RDshtmgfivCyo'}, {name: 'musical', playlist_id: 'RDPUlQNsl4Qvk'}],
        video_id_arrs: {work: [], musical: []},
        player: '',
        is_playing: false,
        is_random: false,
        is_list_show: false,
        mytimer: '',
        vol:70,

    },
    mounted() {
        this.loadPlayer();

    },
    methods: {
        loadPlayer: function () {
            if (typeof(YT) === 'undefined' || typeof(YT.Player) === 'undefined') {

                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubePlayerAPIReady = function () {
                    app.onYouTubeIframeAPIReady();
                };

            } else {
                app.onYouTubeIframeAPIReady();

            }
        }
        , onYouTubeIframeAPIReady: function () {
            this.player = new YT.Player('youtube', {
                height: '0',
                width: '0',
                videoId: app.playlist[app.current_list][app.current_song].video_id,
                events: {
                    'onReady': app.onPlayerReady,
                    'onStateChange': app.onPlayerStateChange
                }
            });

        }, onPlayerReady: function (event) {

            $('#play-btn').click(function () {
                app.player.playVideo();
            });
            $('#pause-btn').click(function () {
                app.player.pauseVideo();
            });

        }, onPlayerStateChange: function (event) {
            if (event.data === YT.PlayerState.PLAYING) {
                app.is_playing = true;
                var playerTotalTime = app.player.getDuration();
                this.mytimer = setInterval(function () {
                    var playerCurrentTime = app.player.getCurrentTime();
                    app.playlist[app.current_list][app.current_song].now = Math.floor(playerCurrentTime);
                }, 500);
            } else {
                app.is_playing = false;
                if (event.data === YT.PlayerState.ENDED) {
                    app.nextSong();
                }
            }
        },
        seek: function () {
            var now = app.playlist[app.current_list][app.current_song].now;
            clearInterval(this.mytimer);
            app.player.seekTo(now);
            app.player.playVideo();

        },
        nextSong: function () {
            var song = app.current_song + 1;
            song = song < app.playlist[app.current_list].length ? song : 0;
            app.current_song = song;
            this.player.loadVideoById(app.playlist[app.current_list][app.current_song].video_id);
        },
        lastSong: function () {
            var song = app.current_song - 1;
            song = song > -1 ? song : app.playlist[app.current_list].length-1 ;
            app.current_song = song;
            this.player.loadVideoById(app.playlist[app.current_list][app.current_song].video_id);
        },
        randomSong: function () {
            if (this.is_random) {
                var list = Math.round(Math.random());
                console.log(list);
                app.current_list = list;
                var song = Math.floor(Math.random() * app.playlist[app.current_list].length);
                console.log(song);
                app.current_song = song;
                this.player.loadVideoById(app.playlist[app.current_list][app.current_song].video_id);
            }

        },
        makeRequest: function (video_id, type) {

            var url = "https://www.googleapis.com/youtube/v3/videos" +
                "?id=" + video_id +
                "&key=AIzaSyBcyWVyJ-OsOIJSB6WhVg3N8UQc34kp1aA" +
                "&part=snippet,contentDetails" +
                "&q=YouTube+Data+API" +
                "&type=video" +
                "&videoCaption=closedCaption";

            xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function () {

                var response = JSON.parse(this.responseText);
                for (var i = 0; i < response.items.length; i++) {
                    var item = response.items[i];
                    var title = item.snippet.title;
                    try {
                        var imgUrl = item.snippet.thumbnails.maxres.url;
                    }
                    catch (e) {
                        imgUrl = item.snippet.thumbnails.high.url;
                    }

                    var time = item.contentDetails.duration;
                    time = time.slice(2, time.length);
                    time = Number(time.slice(0, time.indexOf("M"))) * 60 + Number(time.slice(time.indexOf("M") + 1, time.length - 1));

                    var channel_title = item.snippet.channelTitle;
                    if (type === 'work') {
                        app.playlist[0].push({
                            video_id: video_id,
                            title: title,
                            channel_title: channel_title,
                            img_url: imgUrl,
                            time: time,
                            now: 0
                        });
                    } else {
                        app.playlist[1].push({
                            video_id: video_id,
                            title: title,
                            channel_title: channel_title,
                            img_url: imgUrl,
                            time: time,
                            now: 0
                        });
                    }

                }

            }
            xhr.send();
        }
        ,
        makeListRequest: function () {
            this.lists.forEach(function (val, ind) {
                var url = "https://www.googleapis.com/youtube/v3/playlistItems" +
                    "?playlistId=" + val.playlist_id +
                    "&key=AIzaSyBcyWVyJ-OsOIJSB6WhVg3N8UQc34kp1aA" +
                    "&part=contentDetails" +
                    "&q=YouTube+Data+API" +
                    "&type=video" +
                    "&maxResults=7" +
                    "&videoCaption=closedCaption";
                xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = function () {
                    // do something
                    var response = JSON.parse(this.responseText);
                    for (var i = 0; i < response.items.length; i++) {
                        var item = response.items[i];
                        if (ind === 0) {
                            app.video_id_arrs.work.push(item.contentDetails.videoId);
                            app.makeRequest(item.contentDetails.videoId, 'work');
                        } else {
                            app.video_id_arrs.musical.push(item.contentDetails.videoId);
                            app.makeRequest(item.contentDetails.videoId, 'musical');
                        }

                    }

                }
                xhr.send();

            });


        }
    },
    computed: {
        duration: function () {
            var time = this.playlist[this.current_list][this.current_song].time;
            var sec = time % 60 > 9 ? time % 60 : '0' + time % 60;
            return Math.floor(time / 60) + ':' + sec;
        },
        now: function () {
            var time = this.playlist[this.current_list][this.current_song].now;
            var sec = time % 60 > 9 ? time % 60 : '0' + time % 60;
            return Math.floor(time / 60) + ':' + sec;
        }
    },
    watch: {
        current_song: function () {
            this.player.loadVideoById(app.playlist[app.current_list][app.current_song].video_id);
        },
        is_random: function () {
            if (this.is_random) {
                this.randomSong();
            }
        },
        vol:function () {
            this.player.setVolume(this.vol);
        }
    }

});
Vue.nextTick(function () {
    app.makeListRequest();
});