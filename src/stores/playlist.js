import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'

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
  
  const duration = computed(() => currentSong.value?.time ?? 0)
  const now = computed(() =>  currentSong.value?.now ?? 0)
  
  async function setListSongs() {
    playlists.value
    .filter(playlist => playlist.songs.length === 0)
    .forEach(async ({playlistId, songs}, index) => {
      const url = "https://www.googleapis.com/youtube/v3/playlistItems" +
        "?playlistId=" + playlistId +
        "&key="+import.meta.env.VITE_YOUTUBE_API_KEY +
        "&part=contentDetails" +
        "&q=YouTube+Data+API" +
        "&type=video" +
        "&maxResults=10" +
        "&videoCaption=closedCaption";
      
        const { items, error } = await fetch(url).then(res => res.json());
        if(error){
          playlists.value.splice(index-1, 1);

          const { errors } = error;
          const messages = errors.map(({reason, message})=> `${reason}: ${message}`)
          alert(messages.join('\n'));
          return;
        }

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
  const isRandom = ref(false);
  function nextSong(){
    if(isRandom.value){
      return randomSong();
    }
    let song = currentSongIndex.value + 1;
    song = song < currentList.value.songs.length ? song : 0;
    currentSongIndex.value = song;
  }

  function lastSong(){
    if(isRandom.value){
      return randomSong();
    }
    let song = currentSongIndex.value - 1;
    song = song > -1 ? song : currentList.value.songs.length - 1;
    currentSongIndex.value = song;
  }

  function randomSong() {
    if(!isRandom.value){
      return;
    }
      const list = Math.round(Math.random());
      currentListIndex.value = list;

      const song = Math.floor(Math.random() *  currentList.value.songs.length);
      currentSongIndex.value = song;
  }


  nextTick(() => {
    setListSongs()
  });

  async function addNewPlaylist(playlistId) {
    const newPlaylist = {
      name: `新播放列表 ${playlists.value.length + 1}`, 
      playlistId: playlistId,
      songs: []
    };

    playlists.value.push(newPlaylist);
    
    await setListSongs();
  }

  return {
    currentSong,
    currentList,
    currentSongIndex,
    currentListIndex,
    playlists, 
    duration,
    now,
    isRandom,
    getVideoInfo,
    setListSongs,
    nextSong,
    lastSong,
    randomSong,
    addNewPlaylist
  }
})
