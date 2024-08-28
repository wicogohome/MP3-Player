import { ref } from 'vue';
import { usePlaylistStore } from '@/stores/playlist';

export function usePlaylistInput() {
  const newPlaylist = ref('');
  const playlistStore = usePlaylistStore();

  const addNewPlaylist = async () => {
    const trimmed = newPlaylist.value.trim();
    if (trimmed === '') return;

    try {
      await playlistStore.addNewPlaylist(trimmed);
      
      newPlaylist.value = '';
    } catch (error) {
      alert('新增失敗:', error);
    }
  };

  return {
    newPlaylist,
    addNewPlaylist
  };
}
