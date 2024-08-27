<script >
import { ref, computed, watch, nextTick,defineComponent } from 'vue';
export default defineComponent({
    setup() {
        const currentSong = ref(0);
        const currentList = ref(0);
        const playlist = ref([
            [{
                videoId: 'shtmgfivCyo',
                title: "BIN - 悪食(MV)",
                channelTitle: "BIN official",
                imgUrl: "https://i.ytimg.com/vi/shtmgfivCyo/maxresdefault.jpg",
                time: 200,
                now: 0,
            }],
            []
        ]);
        const lists = ref([{name: 'work', playlistId: 'RDshtmgfivCyo'}, {name: 'musical', playlistId: 'RDPUlQNsl4Qvk'}]);
        const videoIdArrs = ref({work: [], musical: []});
        const player = ref(null);
        const isPlaying = ref(false);
        const isRandom = ref(false);
        const isListShow = ref(false);
        const myTimer = ref(null);
        const vol = ref(70);

        function loadPlayer() {
            if (typeof(YT) === 'undefined' || typeof(YT.Player) === 'undefined') {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubePlayerAPIReady = onYouTubeIframeAPIReady;
            } else {
                onYouTubeIframeAPIReady();
            }
        }

        function onYouTubeIframeAPIReady() {
            player.value = new YT.Player('youtube', {
                height: '0',
                width: '0',
                videoId: playlist.value[currentList.value][currentSong.value].videoId,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        function onPlayerReady(event) {
            document.getElementById('play-btn').addEventListener('click', () => {
                player.value.playVideo();
            });
            document.getElementById('pause-btn').addEventListener('click', () => {
                player.value.pauseVideo();
            });
        }

        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
                isPlaying.value = true;
                const playerTotalTime = player.value.getDuration();
                myTimer.value = setInterval(() => {
                    const playerCurrentTime = player.value.getCurrentTime();
                    playlist.value[currentList.value][currentSong.value].now = Math.floor(playerCurrentTime);
                }, 500);
            } else {
                isPlaying.value = false;
                if (event.data === YT.PlayerState.ENDED) {
                    nextSong();
                }
            }
        }

        function seek() {
            const now = playlist.value[currentList.value][currentSong.value].now;
            clearInterval(myTimer.value);
            player.value.seekTo(now);
            player.value.playVideo();
        }

        function nextSong() {
            let song = currentSong.value + 1;
            song = song < playlist.value[currentList.value].length ? song : 0;
            currentSong.value = song;
            player.value.loadVideoById(playlist.value[currentList.value][currentSong.value].videoId);
        }

        function lastSong() {
            let song = currentSong.value - 1;
            song = song > -1 ? song : playlist.value[currentList.value].length - 1;
            currentSong.value = song;
            player.value.loadVideoById(playlist.value[currentList.value][currentSong.value].videoId);
        }

        function randomSong() {
            if (isRandom.value) {
                const list = Math.round(Math.random());
                console.log(list);
                currentList.value = list;
                const song = Math.floor(Math.random() * playlist.value[currentList.value].length);
                console.log(song);
                currentSong.value = song;
                player.value.loadVideoById(playlist.value[currentList.value][currentSong.value].videoId);
            }
        }

        function makeRequest(videoId, type) {
            const url = "https://www.googleapis.com/youtube/v3/videos" +
                "?id=" + videoId +
                "&key=AIzaSyBcyWVyJ-OsOIJSB6WhVg3N8UQc34kp1aA" +
                "&part=snippet,contentDetails" +
                "&q=YouTube+Data+API" +
                "&type=video" +
                "&videoCaption=closedCaption";

            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function () {
                const response = JSON.parse(this.responseText);
                for (let i = 0; i < response.items.length; i++) {
                    const item = response.items[i];
                    const title = item.snippet.title;
                    let imgUrl;
                    try {
                        imgUrl = item.snippet.thumbnails.maxres.url;
                    } catch (e) {
                        imgUrl = item.snippet.thumbnails.high.url;
                    }

                    let time = item.contentDetails.duration;
                    time = time.slice(2, time.length);
                    time = Number(time.slice(0, time.indexOf("M"))) * 60 + Number(time.slice(time.indexOf("M") + 1, time.length - 1));

                    const channelTitle = item.snippet.channelTitle;
                    if (type === 'work') {
                        playlist.value[0].push({
                            videoId: videoId,
                            title: title,
                            channelTitle: channelTitle,
                            imgUrl: imgUrl,
                            time: time,
                            now: 0
                        });
                    } else {
                        playlist.value[1].push({
                            videoId: videoId,
                            title: title,
                            channelTitle: channelTitle,
                            imgUrl: imgUrl,
                            time: time,
                            now: 0
                        });
                    }
                }
            }
            xhr.send();
        }

        function makeListRequest() {
            lists.value.forEach((val, ind) => {
                const url = "https://www.googleapis.com/youtube/v3/playlistItems" +
                    "?playlistId=" + val.playlistId +
                    "&key=AIzaSyBcyWVyJ-OsOIJSB6WhVg3N8UQc34kp1aA" +
                    "&part=contentDetails" +
                    "&q=YouTube+Data+API" +
                    "&type=video" +
                    "&maxResults=7" +
                    "&videoCaption=closedCaption";
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = function () {
                    const response = JSON.parse(this.responseText);
                    for (let i = 0; i < response.items.length; i++) {
                        const item = response.items[i];
                        if (ind === 0) {
                            videoIdArrs.value.work.push(item.contentDetails.videoId);
                            makeRequest(item.contentDetails.videoId, 'work');
                        } else {
                            videoIdArrs.value.musical.push(item.contentDetails.videoId);
                            makeRequest(item.contentDetails.videoId, 'musical');
                        }
                    }
                }
                xhr.send();
            });
        }

        const duration = computed(() => {
            const time = playlist.value[currentList.value][currentSong.value].time;
            const sec = time % 60 > 9 ? time % 60 : '0' + time % 60;
            return Math.floor(time / 60) + ':' + sec;
        });

        const now = computed(() => {
            const time = playlist.value[currentList.value][currentSong.value].now;
            const sec = time % 60 > 9 ? time % 60 : '0' + time % 60;
            return Math.floor(time / 60) + ':' + sec;
        });

        watch(currentSong, () => {
            player.value.loadVideoById(playlist.value[currentList.value][currentSong.value].videoId);
        });

        watch(isRandom, () => {
            if (isRandom.value) {
                randomSong();
            }
        });

        watch(vol, () => {
            player.value.setVolume(vol.value);
        });

        nextTick(() => {
            makeListRequest();
        });

        loadPlayer();

        return {
            currentSong,
            currentList,
            playlist,
            lists,
            videoIdArrs,
            player,
            isPlaying,
            isRandom,
            isListShow,
            myTimer,
            vol,
            seek,
            nextSong,
            lastSong,
            randomSong,
            makeRequest,
            makeListRequest,
            duration,
            now
        };
    }
});
</script>

<template>
    <div id="youtube"></div>
    <div class="row justify-content-center">
        <div class="playlist" :class="{'list-show':isListShow}">
            <div class="playlist-left">
                <input type="text" name="search" class="input-custom">
                <div class="playlist-left-list mt-5">
                    <div class="left-title">播放列表</div>
                    <ul class="list-unstyled ul-left">
                        <li v-for="(list,index) in lists" class="li-left" @click="currentList=index">
                            <div class="triangle" :class="{'active':index===currentList}">
                                <img src='/image/tra.svg' alt="三角" width="15"></div>
                            <span class="text-uppercase">{{list.name}}</span></li>
                    </ul>
                    <div class="left-title">歌手</div>
                    <div class="left-title">我的最愛</div>
                </div>
            </div>
            <div class="playlist-right">
                <div class="row no-gutters list-top">
                    <b class="list-title mr-auto text-uppercase">{{lists[currentList].name}}</b>
                    <div class="list-btn" @click="isListShow=!isListShow">List
                        <div class="w-100"></div>
                        <i class="fas fa-bars fa-2x"></i></div>
                </div>
                <div class="song-list">
                    <ul class="list-unstyled ul-right">
                        <li v-for="(song,index) in playlist[currentList]" class="li-right" @click="currentSong=index">
                            <div class="row no-gutters  justify-content-between">
                                <div class="ellipsis-text-container">
                                    <div class="ellipsis-text">
                                        <h5><b>{{song.title}}</b></h5>
                                    </div>
                                </div>
                                <div class="ellipsis-text-container-right">
                                    <div class="ellipsis-text text-secondary">{{song.channelTitle}}</div>
                                </div>
                                <div class="w-100"></div>
                                <div class="ellipsis-text-container">
                                    <div class="ellipsis-text">{{song.channelTitle}}</div>
                                </div>
                                <p class="text-right"> {{Math.floor(song.time/60) +':'+ song.time%60}}</p>
                            </div>

                        </li>
                    </ul>
                </div>
                <div class="img-place bg-dark" style="height: 20%"><img src="/image/「專輯封面」的圖片搜尋結果.jpg" height="100%"></div>
            </div>
        </div>
        <div id="player" class="mt-3" :class="{'player-right':isListShow}">
            <div class="row no-gutters mt-3 justify-content-center">
                <a :href="'https://www.youtube.com/watch?v='+playlist[currentList][currentSong].videoId" target="_blank">
                <div class="circle d-flex mr-5"
                     :class="{'active':isPlaying}"
                     :style="{backgroundSize:'auto 495px',backgroundImage:'url('+playlist[currentList][currentSong].imgUrl+')',backgroundRepeat:'no-repeat',backgroundPosition:'center center'}">
                    <div class="circle-sm mx-auto d-flex align-self-center"></div>

                </div>
                </a>
                <div class="btn-row">
                    <div class="btn-set" @click="lastSong()">
                        <div class="btn-shadow"></div>
                        <div class="player-next-btn player-btn-sm">
                            <img src="/image/next.svg" alt="next" width="22"></div>
                    </div>

                    <div class="w-100"></div>
                    <div class="btn-set" @click="nextSong()">
                        <div class="btn-shadow"></div>
                        <div class="player-pre-btn player-btn-sm  ">
                            <img src="/image/next.svg" alt="next" width="22" style="transform: rotate(180deg)"></div>
                    </div>
                    <div class="w-100"></div>
                    <div class="btn-set"  @click="isRandom=!isRandom" style="margin-top: 285px;">
                        <div class="btn-shadow" :class="{'click':isRandom}"></div>
                        <div class="player-random-btn player-btn-sm" :class="{'btn-is-random':isRandom}">
                            <img src="/image/Group 20.svg" alt="next" width="30"></div>
                    </div>
                </div>

            </div>
            <div class="row  no-gutters justify-content-around mt-3">
                <div class="mt-2 col-4 title-col">
                    <div class="title ellipsis-text"><b>{{playlist[currentList][currentSong].title}}</b>
                        <div class="channel ellipsis-text">{{playlist[currentList][currentSong].channelTitle}}</div>
                    </div>
                </div>

                <div class="btn-set col-4">
                    <div class="btn-shadow" style="width: 40%;top: -2px;left: 78px;"></div>
                    <div id="player-hand" class="hand-default" :class="{'hand-active':isPlaying}"><img src="/image/player.svg" alt="player"></div>
                    <div id="play-btn" class="player-start-btn player-btn-lg mx-auto" v-show="!isPlaying">
                        <img src="/image/play.svg" alt="play" width="30"></div>
                    <div id="pause-btn" class="player-puase-btn player-btn-lg mx-auto" v-show="isPlaying">
                        <img src="/image/stop.svg" alt="play" width="30"></div>

                </div>
                <div class="mt-2 col-4">
                    <div class="slidecontainer" style="padding-right: 45px;">
                        <input type="range" min="1" max="100" v-model="vol" class="slider" id="vol"
                               :style="{background: 'rgba(0, 0, 0, 0) linear-gradient(to right, rgb(197, 197, 197)'+vol+'%,rgb(255, 255, 255)'+vol+'%) repeat scroll 0% 0%'}">
                        <img src="/image/sound.svg" alt="sound" width="20px" id="sound-img"></div>
                    </div>


            </div>
            <div class="row no-gutters">
                <div id="through_time" class="offset-1 col-1">{{now}}</div>
                <div class="col-9">
                    <div class="slidecontainer">
                        <input type="range" :min=0 :max="playlist[currentList][currentSong].time"
                               v-model="playlist[currentList][currentSong].now" class="slider " id="time"
                               @change="seek()"
                               :style="{background: 'rgba(0, 0, 0, 0) linear-gradient(to right, rgb(197, 197, 197)'+(playlist[currentList][currentSong].now/playlist[currentList][currentSong].time)*100+'%,rgb(255, 255, 255)'+(playlist[currentList][currentSong].now/playlist[currentList][currentSong].time)*100+'%) repeat scroll 0% 0%'}">
                    </div>
                </div>
                <div id="full_time" class="col-1">{{duration}}</div>
            </div>
            <div class="shadow">
                <div class="player-line-right"></div>
                <div class="player-shadow-right"></div>
                <div class="w-100"></div>
                <div class="player-line-bottom"></div>
                <div class="player-shadow-bottom"></div>
            </div>

        </div>
    </div>
</template>

