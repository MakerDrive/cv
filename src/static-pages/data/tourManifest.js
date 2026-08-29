import {
  CV_SHOW_ATTENTION_TIMELINES,
  CV_SHOW_STORY,
} from './cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from './cvShowWebAudioRelease.js';

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

export const TOUR_ATTENTION_TIMELINES = CV_SHOW_ATTENTION_TIMELINES;
export const TOUR_RUNTIME_POLICY = CV_SHOW_STORY.runtimePolicy;
export const TOUR_SHORT_SEQUENCE = CV_SHOW_STORY.short;
export const TOUR_SCENES = CV_SHOW_STORY.scenes;
export const TOUR_DETAIL_BRANCHES = CV_SHOW_STORY.branches;

export const TOUR_LOCAL_AUDIO_CONFIG = freezeDeep({
  audio: 'local',
  locale: CV_SHOW_WEB_AUDIO_RELEASE.locale,
  voice: CV_SHOW_WEB_AUDIO_RELEASE.voiceId,
  webAudioRelease: {
    schemaVersion: CV_SHOW_WEB_AUDIO_RELEASE.schemaVersion,
    releaseId: CV_SHOW_WEB_AUDIO_RELEASE.releaseId,
    sourceMasterReleaseId: CV_SHOW_WEB_AUDIO_RELEASE.sourceMasterReleaseId,
    voiceId: CV_SHOW_WEB_AUDIO_RELEASE.voiceId,
    locale: CV_SHOW_WEB_AUDIO_RELEASE.locale,
    revision: CV_SHOW_WEB_AUDIO_RELEASE.revision,
    manifest: { ...CV_SHOW_WEB_AUDIO_RELEASE.manifest },
  },
});
