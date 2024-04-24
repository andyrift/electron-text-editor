import { onBeforeUnmount, onMounted, ref } from "vue";

export const useTime = () => {
  const time = ref<string>("");
  const refreshTime = () => {
    time.value = Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format();
  };
  let interval: NodeJS.Timeout | undefined = undefined
  onBeforeUnmount(() => {
    clearInterval(interval);
  });

  onMounted(() => {
    interval = setInterval(refreshTime, 1000);
  })
  return time;
}