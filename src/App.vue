<script >
import { defineComponent } from 'vue';
import { usePlaylistStore } from './stores/playlist'
import { usePlayer } from './utils/usePlayer';
import { storeToRefs } from 'pinia';
import { usePlayerControls } from './utils/usePlayerControls';
import { useUI } from './utils/useUI';
import { usePlaylistInput } from './utils/usePlaylistInput';

export default defineComponent({
    setup() {
        const playlistStore = usePlaylistStore()
        const { playlists, currentSong, currentSongIndex, currentList ,currentListIndex, duration, now, isRandom  } = storeToRefs(playlistStore)
        const { player, isReady, isPlaying ,loadPlayer, playerTimer } = usePlayer(currentSong);
        const { play, pause, seek, randomSong, nextSong, lastSong, vol } = usePlayerControls(player, currentSong, playerTimer);

        const { isListShow, formatTime } = useUI();
        const { newPlaylist, addNewPlaylist } = usePlaylistInput();

        loadPlayer();

       
        return {
            // playlists
            playlists,
            currentSong,
            currentList,
            currentSongIndex,
            currentListIndex,

            // player controls
            play,
            pause,
            seek,
            nextSong,
            lastSong,
            randomSong,

            // player status
            vol,
            duration,
            now,
            isReady,
            isPlaying,
            isRandom,

            isListShow,
            formatTime,

            // add playlist
            newPlaylist,
            addNewPlaylist
        }
    }
})
</script>

<template>
    <div id="youtube"></div>
    <div class="row " :class="{
      'justify-content-end':isListShow,
      'justify-content-center': !isListShow,
    }">
        <div class="playlist" :class="{'list-show':isListShow}">
            <div class="playlist-left ">
                <div class="position-relative">
                    <input 
                        type="text" 
                        name="search" 
                        class="input-custom" 
                        v-model="newPlaylist"
                        placeholder="Youtube list"
                    >
                    <div class="position-absolute search-btn" @click="addNewPlaylist"> <img  src="/image/search.svg"></div>
                   
                </div>
                <div class="playlist-left-list mt-5">
                    <div class="left-title">播放列表</div>
                    <ul class="list-unstyled ul-left">
                        <li v-for="(list, index) in playlists" :key="index" class="li-left" @click="currentListIndex=index">
                            <div class="triangle" :class="{'active':index===currentListIndex}">
                                <img src='/image/tra.svg' alt="三角" width="15">
                            </div>
                            <span class="text-uppercase ">{{list.name}}</span>
                        </li>
                    </ul>
                    <div class="left-title">歌手</div>
                    <div class="left-title">我的最愛</div>
                </div>
            </div>
            <div class="playlist-right">
                <div class="row no-gutters list-top">
                    <b class="list-title mr-auto text-uppercase ellipsis-text">{{currentList.name}}</b>
                    <div class="list-btn" @click="isListShow=!isListShow">List
                        <div class="w-100"></div>
                        <i class="fas fa-bars fa-2x"></i></div>
                </div>
                <div class="song-list">
                    <ul class="list-unstyled ul-right">
                        <li v-for="(song,index) in currentList.songs" :key="index" class="li-right" @click="currentSongIndex=index">
                            <div class="row no-gutters  justify-content-between">
                                <div class="ellipsis-text-container">
                                    <div class="ellipsis-text song-title">
                                        <b>{{song.title}}</b>
                                    </div>
                                </div>
                                <div class="ellipsis-text-container-right">
                                    <div class="ellipsis-text text-secondary">{{song.channelTitle}}</div>
                                </div>
                                <div class="w-100"></div>
                                <div class="ellipsis-text-container">
                                    <div class="ellipsis-text">{{song.channelTitle}}</div>
                                </div>
                                <p class="text-right"> {{formatTime(song?.time ?? 0)}}</p>
                            </div>

                        </li>
                    </ul>
                </div>
                <!-- <div class="img-place bg-dark" style="height: 20%"><img src="/image/「專輯封面」的圖片搜尋結果.jpg" height="100%"></div> -->
            </div>
        </div>
        <div id="player" class="d-flex flex-column justify-content-around" :class="{'player-right':isListShow}">
            <div class="row no-gutters justify-content-center">
                <a :href="'https://www.youtube.com/watch?v='+currentSong.videoId" target="_blank" class="circle-href">
                <div class="circle d-flex"
                     :class="{'active':isPlaying}"
                     :style="{backgroundSize:'auto 100%',backgroundImage:'url('+currentSong.imgUrl+')',backgroundRepeat:'no-repeat',backgroundPosition:'center center'}">
                    <div class="circle-sm mx-auto d-flex align-self-center"></div>

                </div>
                </a>
                <div class="btn-row d-flex flex-column justify-content-between">
                  <div>
                    <div class="btn-set" @click="lastSong()">
                        <div class="btn-shadow"></div>
                        <div class="player-next-btn player-btn-sm">
                            <img src="/image/next.svg" alt="next" width="22"></div>
                    </div>

                    <div class="btn-set" @click="nextSong()">
                        <div class="btn-shadow"></div>
                        <div class="player-pre-btn player-btn-sm  ">
                            <img src="/image/next.svg" alt="next" width="22" style="transform: rotate(180deg)"></div>
                    </div>
                  </div>
                  
       
                    <div class="btn-set btn-random"  @click="randomSong()">
                        <div class="btn-shadow" :class="{'click':isRandom}"></div>
                        <div class="player-random-btn player-btn-sm" :class="{'btn-is-random':isRandom}">
                            <img src="/image/Group 20.svg" alt="next" width="30"></div>
                    </div>
                </div>

            </div>
            <div class="row  no-gutters justify-content-around ">
                <div class="col-4 title-col">
                    <div class="title ellipsis-text active">
                            <b>{{currentSong.title}}</b>
                        </div>
                    <div class="channel ellipsis-text">{{currentSong.channelTitle}}</div>
                 
                </div>

                <div class="btn-set col-4 m-0 d-flex justify-content-center">
                  <div class="position-relative">
                    <div class="btn-shadow control-btn"></div>
                    <div id="player-hand" class="hand-default" :class="{'hand-active':isPlaying}">
                      <img src="/image/player.svg" alt="player">
                    </div>

                    <div class="player-start-btn player-btn-lg mx-auto" v-if="!isPlaying && isReady" @click="play">
                        <img src="/image/play.svg" alt="play" width="30"></div>
                    <div class="player-puase-btn player-btn-lg mx-auto" v-else-if="isPlaying || !isReady" @click="pause">
                        <img src="/image/stop.svg" alt="play" width="30"></div>

                  </div>
              
                </div>
                <div class="mt-2 col-4">
                    <div class="slidecontainer" style="padding-right: 45px;">
                        <input type="range" min="1" max="100" v-model="vol" class="slider" id="vol"
                               :style="{background: 'rgba(0, 0, 0, 0) linear-gradient(to right, rgb(197, 197, 197)'+vol+'%,rgb(255, 255, 255)'+vol+'%) repeat scroll 0% 0%'}">
                        <img src="/image/sound.svg" alt="sound" width="20px" id="sound-img"></div>
                    </div>


            </div>
            <div class="row no-gutters px-4">
                <div id="through_time" class="col-md-1 col-2 text-right pr-3">{{ formatTime(now, "0:00") }}</div>
                <div class="col-md-10 col-8 ">
                    <div class="slidecontainer">
                        <input type="range" :min=0 :max="currentSong.time"
                               v-model="currentSong.now" class="slider " id="time"
                               @change="seek()"
                               :style="{background: 'rgba(0, 0, 0, 0) linear-gradient(to right, rgb(197, 197, 197)'+(currentSong.now/currentSong.time)*100+'%,rgb(255, 255, 255)'+(currentSong.now/currentSong.time)*100+'%) repeat scroll 0% 0%'}">
                    </div>
                </div>
                <div id="full_time" class="col-md-1 col-2">{{ formatTime(duration) }}</div>
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

