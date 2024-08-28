import { ref, watch } from 'vue';
import { usePlaylistStore } from '@/stores/playlist'
export function usePlayerControls(player, currentSong, playerTimer) {

  // basic 
  const store = usePlaylistStore();
  function play(){
    player.value.playVideo();
  }

  function pause(){
    player.value.pauseVideo();
  }

  function seek() {
    const now = currentSong.value.now;
    clearInterval(playerTimer.value);
    player.value.seekTo(now);
    player.value.playVideo();
  }

  const vol = ref(70);
  watch(vol, () => {
    player.value.setVolume(vol.value);
  });

  // sequence controls
  function nextSong() {
    store.nextSong();
  }

  function lastSong() {
    store.lastSong();
  }

  // random 
  const isRandom = ref(false);
  function randomSong() {
    if (isRandom.value) {
      store.randomSong();
    }
  }
  watch(isRandom, () => {
    if (isRandom.value) {
      randomSong();
    }
  });


  // load video
  function loadVideo(videoId){
    if(videoId && player.value){
      player.value.loadVideoById(videoId);
    }
  }
  watch(currentSong, () => {
    loadVideo(currentSong.value?.videoId);
  });


  return {
    play,
    pause,
    seek,
    vol,

    isRandom,
    randomSong,
    nextSong,
    lastSong,
  };
}
