import { ref } from 'vue';

export function useUI() {
  const isListShow = ref(false);

  function formatTime(sec, defaultString = "--:--") {
    if(sec === 0){
      return defaultString;
    }
    return Math.floor(sec / 60) + ':' + (sec % 60).toString().padStart(2,'0');
  }

  return {
    isListShow,
    formatTime
  };
}
