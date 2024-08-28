import { ref } from 'vue';
import { usePlaylistStore } from '@/stores/playlist'

export function usePlayer(currentSong) {
  const player = ref(null);
  const isPlaying = ref(false);
  const isReady = ref(false);
  const playerTimer = ref(null);

  const store = usePlaylistStore();

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
    
    if(!currentSong.value?.videoId){
      return setTimeout(()=> onYouTubeIframeAPIReady(), 300)
      }

      player.value = new YT.Player('youtube', {
        height: '0',
        width: '0',
        videoId: currentSong.value.videoId,
        events: {
          'onReady': ()=> isReady.value = true,
          'onStateChange': onPlayerStateChange
          }
        });
  }

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      isPlaying.value = true;
      startTimer();
    } else {
      isPlaying.value = false;
      clearTimer();
      if (event.data === YT.PlayerState.ENDED) {
        store.nextSong();
      }
    }
  }

  function startTimer() {
    clearTimer();
    playerTimer.value = setInterval(() => {
      const playerCurrentTime = player.value.getCurrentTime();
      currentSong.value.now = Math.floor(playerCurrentTime);
    }, 500);
  }

  function clearTimer() {
    if (playerTimer.value) {
      clearInterval(playerTimer.value);
      playerTimer.value = null;
    }
  }


  return {
    loadPlayer,
    player,
    playerTimer,
    isReady,
    isPlaying
  };
}
