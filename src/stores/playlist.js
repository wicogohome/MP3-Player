import { defineStore } from 'pinia'
import { ref, computed,nextTick } from 'vue'

export const usePlaylistStore = defineStore('playlist', () => {
  const currentSongIndex = ref(0)
  const currentListIndex = ref(0)
  const playlists = ref([
    {
      name: 'work', 
      playlistId: 'RDshtmgfivCyo',
      songs: []
    },
    {
      name: 'musical', 
      playlistId: 'RDPUlQNsl4Qvk',
      songs: []
    }
  ])
  const currentSong = computed(()=> playlists.value[currentListIndex.value]?.songs[currentSongIndex.value] ?? {})
  const currentList = computed(()=> playlists.value[currentListIndex.value] ?? {})
  
  const duration = computed(() => {
    const time = currentSong.value?.time ?? 0
    return Math.floor(time / 60) + ':' + (time % 60).toString().padStart(2,'0')
  })
  
  const now = computed(() => {
    const time = currentSong.value?.now ?? 0
    return Math.floor(time / 60) + ':' + (time % 60).toString().padStart(2,'0')
  })
  
  async function setListSongs() {
    playlists.value.forEach(async ({playlistId, songs}) => {
      const url = "https://www.googleapis.com/youtube/v3/playlistItems" +
        "?playlistId=" + playlistId +
        "&key="+import.meta.env.VITE_YOUTUBE_API_KEY +
        "&part=contentDetails" +
        "&q=YouTube+Data+API" +
        "&type=video" +
        "&maxResults=7" +
        "&videoCaption=closedCaption";
      
        const { items } = await fetch(url).then(res => res.json());
        items.forEach(async item => {
          songs.push(await getVideoInfo(item.contentDetails.videoId));
        });
    });
  }


  async function getVideoInfo(videoId) {
    const url = "https://www.googleapis.com/youtube/v3/videos" +
      "?id=" + videoId +
      "&key="+import.meta.env.VITE_YOUTUBE_API_KEY +
      "&part=snippet,contentDetails" +
      "&q=YouTube+Data+API" +
      "&type=video" +
      "&videoCaption=closedCaption";

      const { items } = await fetch(url).then(res => res.json());
      const { snippet:{ title, thumbnails:{ maxres, high }, channelTitle }, contentDetails:{ duration }} = items[0];
      const imgUrl= maxres?.url ?? high.url;
      let time = duration;
      time = time.slice(2, time.length);
      time = Number(time.slice(0, time.indexOf("M"))) * 60 + Number(time.slice(time.indexOf("M") + 1, time.length - 1));
      
      return {
        videoId: videoId,
        title: title,
        channelTitle: channelTitle,
        imgUrl: imgUrl,
        time: time,
        now: 0
      };

      
 
  }


  function nextSong(){
    let song = currentSongIndex.value + 1;
    song = song < currentList.value.songs.length ? song : 0;
    currentSongIndex.value = song;
  }

  function lastSong(){
    let song = currentSongIndex.value - 1;
    song = song > -1 ? song : currentList.value.songs.length - 1;
    currentSongIndex.value = song;
  }

  function randomSong() {
      const list = Math.round(Math.random());
      currentListIndex.value = list;

      const song = Math.floor(Math.random() *  currentList.value.songs.length);
      currentSongIndex.value = song;
  }


  nextTick(() => {
    setListSongs()
  });

  return {
    currentSong,
    currentList,
    currentSongIndex,
    currentListIndex,
    playlists, 
    duration,
    now,
    getVideoInfo,
    setListSongs,
    nextSong,
    lastSong,
    randomSong
  }
})
