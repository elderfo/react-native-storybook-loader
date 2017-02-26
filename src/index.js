import storyLoader from '../output/storyLoader';

export function loadStories() {
  if (storyLoader && storyLoader.loadStories) {
    storyLoader.loadStories();
  }
}
