import { ref } from 'vue';

export function useUI() {
  const isListShow = ref(false);

  return {
    isListShow
  };
}
