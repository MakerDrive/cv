import {
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  validatePresentationAuthoringProject,
} from 'symbiote-workspace/browser';

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

export const CV_SHOW_AUTHORING_PROJECT_INPUT = freezeDeep(
/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */
{
  "assets": [
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-Dz26eASMhL6iqbeuplRMrZOtWUrscNFFWlfH4PfHXQU=",
      "contentHash": "sha256:f657646b15f95656ee3d31e37da18a7c0890a224e112f147562255e96dab1941",
      "durationMs": 57310,
      "id": "cv-show:audio:positioning",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-HHuX7z1A6pUHI8I2SggtiWVVtaKk87RZ3qrSIrXuxEI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-nKLtBDYeEMDAh54q/iQd3II/YWblLqCbCyueSuVDXVo=",
      "contentHash": "sha256:645d05c7ff3f117ebd6bad870678748306d00a88bc849e159c6caddf44ab9390",
      "durationMs": 63200,
      "id": "cv-show:audio:symbiote-workspace",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-mFUzwFRUVWUNGPIXqPiXLarUJzJEvRtURc/Fs2OgxYE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-kpkiDld/NHMoSw4BXQxLeb2wSVJjrKDlbdkVwuLsuPM=",
      "contentHash": "sha256:af5d27a397daf8eb4b0525136f8b13dd05d4b82fadbb72b351fc3246a8023fdc",
      "durationMs": 64510,
      "id": "cv-show:audio:symbiote-ui",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-cJqKpbsjkiEBqY0ffDLCb8aPpeLpE0uKQ8iva7EgcEI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-afAm/8iXvIzg71bG57I/vDYrgT2+JZ44ZPBuMHJ1m70=",
      "contentHash": "sha256:6d2976144f3039e683afe4e0e1388538e6a18005822be6c81130e4651400d98b",
      "durationMs": 22880,
      "id": "cv-show:audio:symbiote-engine",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-koiVNRlRMzzO533W+SdMuur2GoKXXPB6DHBMH7FO0go="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-oRjQ1FIw5xofTRhzcKO8RxwN6TVieihfpY+0CHBTlh4=",
      "contentHash": "sha256:d79f643febd6589f8d136cc87bba5fdc6315fd6c48d626bc45995833f655b9c5",
      "durationMs": 52060,
      "id": "cv-show:audio:agent-portal",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-n+cFJenC43hwh2vI/C6yGxDy2V0ymhJU6/5vrjYiRro="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-qKH8JK0x4ryABdgrwIZn9+cKCssOCRhaoUZyBMEjE5w=",
      "contentHash": "sha256:aee0c0a9b3b4f59a2be13fec14d8d7a0dec044216ca88ed287367b62cb0d48f5",
      "durationMs": 25160,
      "id": "cv-show:audio:symbiote-video-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-TxiaMyIZ8YRKyBYagEi8b+0PAqpjy7EkE0D8yvFQwFE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-0+z4G7/IJ7nACxNkxMs3I19CHVUpQkuu2/OwVrb1YyU=",
      "contentHash": "sha256:b602e0eae7fd39ea5e6ba12a241e5abc4e6a93b1350d3772c349d89d0619bde0",
      "durationMs": 68020,
      "id": "cv-show:audio:adaptive-maximo-workbench",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-c5hW+84A+bhUtdeRyeHQtaOVxTFtiXBD8P+RRStKsAU="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-gGXEwGF9XtDylVdn1bN5VVrB+kbko3gCOzGb2R2bouc=",
      "contentHash": "sha256:8942db1b6b7055d95bf218f88ba01ac12c9d9addfa2bc73cf7423e553daf1a49",
      "durationMs": 23680,
      "id": "cv-show:audio:agent-pool-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-1djkpO1R9wUn79rKrryp40hcRqF7XtrQ34sUDquj2/8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-PrLWmmF75M+bXYsQ4nWCjYKgUGPBGWCpfh54OPPRogA=",
      "contentHash": "sha256:386e701ad201aea96fde9d90f14bc6190f2f1313b098fb6fb3486b90e0deb72d",
      "durationMs": 29820,
      "id": "cv-show:audio:project-graph-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-NnhOqtDTjXByp4vfr1ChLQxuDODD8BnfeWOp9LJx8ro="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-2JDfCx9gxpTEumfYhO0RYxb/el4YXFvyhvUPhI5jFss=",
      "contentHash": "sha256:0d32c02884d41943f9ec5869025a1bf9500f0d166c742f35727a6d3863a55363",
      "durationMs": 36910,
      "id": "cv-show:audio:lifecycle-messaging-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-Ldz9rCTr2S3gtMCHaywAolFSrRRJz+/FLcmBQZYbwBM="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-GQlgt492NqNYLV6IwlMoXLV2LKAhstE2ib5dyj9yAvQ=",
      "contentHash": "sha256:5550fa6ddf9e78b5737b9e12ecf9d1f412bbb27574841b5cf8844fc1bfb3f512",
      "durationMs": 36990,
      "id": "cv-show:audio:mobile-smm-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-xEYC2VMzJnA2aEK3GewvNFnqF9iQDhG8KWC3McfZMVI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-McF61Jv+AbGnuIl/Hfu6KQVaDNok+AnnqQnR+Ve0yU0=",
      "contentHash": "sha256:569ab98234333cf81c7c8f82dc6d97ee7bce8f02726f344f20ee39fd984a2a38",
      "durationMs": 34500,
      "id": "cv-show:audio:f360-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-5e5h3kXZbfa6MX9eAtOhC/2fj7qN7In+nVpp9zc0EvE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-LsUOsAWonm1otX2hZhW2CAJ10GQwHXb4eV1ZKz8c+lw=",
      "contentHash": "sha256:4d9723325b266607651dad591329b89133078fd3131e0edf3d8ac969560516ec",
      "durationMs": 75980,
      "id": "cv-show:audio:autobox",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-zkomZmN06oAPrbuVxzQoPi988lc82oJ+QlQ7yEwH/fk="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-HELGUV9HbFAd3LPHMionEGjD/s7NFJqOY6VzAlBiT5w=",
      "contentHash": "sha256:95116b03e7a20a2a2043aa01e373076c8172d19b48c0d353a66b822c1db952c7",
      "durationMs": 122570,
      "id": "cv-show:audio:complexscan",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-CTzOI0MtBLi/icKNCUINqHxxBMLmlvolbkxaGni67w0="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-gJzMnJ7gLBBqtCQgN7AA6BuLfitA8WJmVmf/V30gmfU=",
      "contentHash": "sha256:c9fb961c8aded6139fce471ccc69b7bd0cd290d27c841369df8a60a7fc6b799c",
      "durationMs": 175460,
      "id": "cv-show:audio:photopizza",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-hCKbW9KIKXXMB/FhIJ8wSlPyy0+Bd9WmVwxbQEiWi6I="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-jzT3Vm0Lg40ryaXkk+rjLpeXxhG58W/5ZA2kL+qfbiQ=",
      "contentHash": "sha256:8a14be7f02c5024285c5970f6db4f53034777f00aeb2da29baa42fb138272bac",
      "durationMs": 78210,
      "id": "cv-show:audio:finale",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-VkpqVSXFSFW3GXtWbn1tSI+sBy139JBIw9djwG02Ego="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-uonzG/xZVYNnhiqdIwRwdSMEdAhybKxa3TolMhuA9wM=",
      "contentHash": "sha256:dbe621a95460f8aa7adafe7cdae2d950c2793767e1791ae16ad68078d18698d6",
      "durationMs": 81330,
      "id": "cv-show:audio:workspace-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-HxAA6MYJAWzKjRg52R/e61uPiIwrmMaBTaHbo2I+pso="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-lz0jCGTFagpDE1YzLaDptDpuH5eQE5bZd7yrRFalzGA=",
      "contentHash": "sha256:29dc9ab62436308acbc00fc00d6ba03765be217f6aae190ff4ec428e2f1540fc",
      "durationMs": 70750,
      "id": "cv-show:audio:symbiote-ui-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-KrqkXQkkP/BPg4enb36qXZ6ONTr9+CzLLhACJQsoRoY="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-uN/pKHVonyrkGaWxUv6OkdWSP27T9uq8+GNaVZnC8cU=",
      "contentHash": "sha256:319ae71afc81c094bfab238685db64a823a4088dbef377f77391fd11ac30547e",
      "durationMs": 43950,
      "id": "cv-show:audio:symbiote-engine-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-UcLvWjpMbN9lEQbFqfX+gm6HKjMPUExk9uSqG9hbdxM="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-uF/CYtvvQ0b+2OtL4Yr3Dxf93VG6bzjHjcuLOk86mTA=",
      "contentHash": "sha256:5a03a51ef983db415dab96b96c3740b2cabef4b8c44630b65bed98ba43121b67",
      "durationMs": 66800,
      "id": "cv-show:audio:agent-portal-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-6y9WU8Pi/hFcUSxiBCDt6qa3B04OWfyNdVwDjdprVbk="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-rYwy5P/9DJyAs3zsoBRLpW8LFnAFEs2LDkUZSGU8u8o=",
      "contentHash": "sha256:728b4de706f05550f5a968a3ea083d1d0f6fd470fa6bfb97ffe0207b3ef72205",
      "durationMs": 47120,
      "id": "cv-show:audio:video-studio-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-Ua6mcvC0aVbmBpoR5AUw5+S934GRrrL4GXc8zXjD8tE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-UBZpAHj2aI8X71rtJh8nJCjKwdAsxwjtFkP/vBLa4Ic=",
      "contentHash": "sha256:54710170e3e7f99c5c259efc207cb27232732dabb3a158ca9dcb0ca78b4fe513",
      "durationMs": 76130,
      "id": "cv-show:audio:maximo-workbench-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-17hTHSAf2rlQ+YknBA1aw7LJWSt65S2x0F4Lp+ObGmA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-lzch1FaG6oWnRND4LR1gYhbSuyqWDf1HksWYFMYte7c=",
      "contentHash": "sha256:6488aa70024768dea858fe073fddac9d8449e3200215de53d61473a0681febea",
      "durationMs": 54110,
      "id": "cv-show:audio:agent-pool-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-A27lvUEMCAnu35D89uCm3iITFi2BVW8wAUxXFcgdFb4="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-sZBZPECXizDCaiicc5T8kbVbBxj9MDZ3g/lwwHEd8HA=",
      "contentHash": "sha256:b5b2bf440ee098ff4c88b75db0701ac06b37e9b0be15ae13c7e0d0a7f59d2719",
      "durationMs": 58160,
      "id": "cv-show:audio:project-graph-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-bP9t/Wgec0WSTh85bTFXgvK0SKJjZb2E1FTGKiVUDGM="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-2eGxP6+B2MDcd5r8PVV9J3ehcLiealYY8NjPDkxOe0c=",
      "contentHash": "sha256:6ca8d280dbd412737a2befed9f5c1510223670e93a7553f37843318597a0ea25",
      "durationMs": 63800,
      "id": "cv-show:audio:lifecycle-platform-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-8wjzGqYecVMFRwpSA7NljHbug5ZQYQAipuK2NDy/yOE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-pkH8hvtzixns1jPcNxjb2YCSxf27MNFfqk2TmXzeBw8=",
      "contentHash": "sha256:170b66dfeaeb732c72aa32ae3b4b7e840b032b3367594155a7faba15600d9314",
      "durationMs": 65450,
      "id": "cv-show:audio:mobile-smm-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-HESgxGl/6WxDOC8STJCqFj79rSQGOQsXIA4/m4mngpc="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-HZ8RzQLe/PCFCixRRM+7RitdOU/8gjHsy6Bk8XY94D8=",
      "contentHash": "sha256:5e84ac9751f4243484d16533d2f20d64f998fc3f6f0b49705c9faddf9605fc97",
      "durationMs": 57410,
      "id": "cv-show:audio:f360-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-Q5XCIA7lhBilSjA57VrZUoeJaD8O7lPEnf7gN/2t8Ko="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-i7GIqYI6KU9gNYLnZjrHdVnxIa53IPyofNED3JQe8dc=",
      "contentHash": "sha256:47ce1a06ab3ad4ef55f3ed436241bdffe3efffb2b4fa745ca0e4fa15fedbd1d3",
      "durationMs": 125640,
      "id": "cv-show:audio:autobox-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-/a3Nt8xawm6G8HyRYRnTfoFTV9+UQbx7sv70aUkWRYA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-FUadvDNgJ43EswEe9KG3S+WgO18ZrV6sV1PhAQ0JU78=",
      "contentHash": "sha256:ceeeaeca0c0fcd6339bc535330531d931975eb49efd00509b06ca2a8d9fda988",
      "durationMs": 158100,
      "id": "cv-show:audio:complexscan-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-ka04gtHDHGi2OwrtEv39vq2P+msOb2PcPqE9bavOhuc="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-Wy57iYelFnVlcYnQeq1Xwbi4ZVyKRP6VrToNcTW0Su8=",
      "contentHash": "sha256:d1ee1d1d730d94e3c672e595618d25dcbdd9a9247f23ebe6afccbc7946bf2c3e",
      "durationMs": 191650,
      "id": "cv-show:audio:photopizza-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-/AN0LfqoltYR7Zi8Gh/GfcuSFW6YCqMg12e0AwmCsxc="
    }
  ],
  "cells": [
    {
      "dependsOn": [],
      "id": "cv-show:narration:positioning",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "positioning",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Привет, я Владимир. Я ар эн ди инженер. Больше всего мне интересны задачи, где готового технического задания ещё нет. Есть цель или проблема, и сначала нужно понять, как это вообще должно работать. За свою карьеру я был сооснователем Megavisor, создавал собственные коммерческие и опенсорс проекты и работал с программными платформами, медиа, автоматизацией и оборудованием. Сейчас, в две тысячи двадцать шестом году, мой основной фокус это программные платформы и агентные продукты. Для этой презентации я отобрал несколько проектов, где хорошо виден мой подход. Я не только решаю уже сформулированные задачи. Я нахожу проблемы и новые возможности, формирую идеи проектов и продуктов, запускаю их с нуля или развиваю новые направления внутри существующих систем. В каждом проекте я отдельно покажу, какую задачу решал и за что именно отвечал."
      },
      "turnId": "positioning"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-workspace",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-workspace",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "С середины две тысячи двадцать шестого года я развиваю Symbiote Workspace. Сейчас это центральный проект в моей работе. Чем сложнее система, тем тяжелее становится её универсальный интерфейс. Новому человеку часто нужно сначала изучить саму систему и только потом начинать решать в ней свои задачи. В Workspace я иду от конкретной задачи человека. Агент собирает рабочее пространство из готовых блоков под текущую ситуацию. Но на сборке интерфейса процесс не заканчивается. Интерфейс может объяснить, как он устроен, зачем появился конкретный элемент, почему сейчас важен определённый шаг, где есть риск и где требуется дополнительное подтверждение. Получается динамическая среда, где агент помогает справляться со сложностью, а человек сохраняет контроль и принимает решения. Такое рабочее пространство можно сохранить как исполняемую конфигурацию. Его можно перенести, открыть снова и продолжить работу. Некоторые мои проекты появились раньше Workspace и теперь постепенно становятся его конфигурациями."
      },
      "turnId": "symbiote-workspace"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-ui",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-ui",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать шестом году визуальной основой Workspace стала моя опенсорс библиотека Symbiote UI. В ней собраны компоненты, компоновки, графовые инструменты и семантические контракты интерфейса. Агент не просто берёт готовые блоки и размещает их на экране. Вместе с интерфейсом он формирует машиночитаемый контекст. Он описывает, что это за элементы, зачем они находятся на этом месте, какие у них состояния и какие действия доступны. В том числе такой контекст может публиковаться через Веб эм си пи. Благодаря этому агент после сборки понимает структуру собственного интерфейса и может использовать тот же контекст, чтобы объяснить её человеку. На Symbiote UI построен и интерфейс этого си ви. На нём работают панели, чат и сама интерактивная система презентации. То, что происходит прямо сейчас, это пример того же подхода. Рассказ синхронизирован со страницей. Интерфейс переводит внимание между элементами, выделяет их и буквально объясняет сам себя."
      },
      "turnId": "symbiote-ui"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-engine",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-engine",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать шестом году я также выделил серверный исполнительный слой в Symbiote Engine. Если Symbiote UI даёт визуальные блоки, то Engine даёт функциональные. Это библиотека для сервисов, графов выполнения, автоматизации и состояния. Workspace связывает визуальную и исполнительную части в одной конфигурации."
      },
      "turnId": "symbiote-engine"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-portal",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-portal",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "С начала две тысячи двадцать шестого года я развиваю Agent Portal. Сейчас я постепенно переношу его в Symbiote Workspace как одну из конфигураций. Проект появился как мой собственный управляющий слой над разными агентными средами. По сути это единый процесс поверх разных агентов, моделей и способов доступа к ним. Он позволяет сохранять контроль над контекстом, задачами и ресурсами и при этом менять исполнителей под конкретный этап. Когда я начинал эту линию, я не нашёл готового решения с нужным мне сочетанием возможностей, поэтому стал развивать собственную архитектуру. Часть управляющего контура мы открыли как опенсорс проект. А внутри Agent Portal есть два важных инструмента. Agent Pool отвечает за исполнение и распределение ресурсов. Project Graph отвечает за структуру и контекст проекта."
      },
      "turnId": "agent-portal"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-video-studio",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-video-studio",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать пятом и две тысячи двадцать шестом годах я развивал Symbiote Video Studio. Сейчас этот проект постепенно оформляется как конфигурация Workspace. Материалы, граф, таймлайн, предпросмотр и рендер собраны здесь в один видимый процесс. Агент работает с семантическими элементами интерфейса. А человек может видеть и проверять каждый этап."
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:adaptive-maximo-workbench",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "adaptive-maximo-workbench",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать шестом году одним из демонстрационных направлений Workspace стал мой эксперимент с ай би эм Maximo. Это хороший пример проблемы, которую я пытаюсь решить. В больших системах управления активами в одном контуре находятся заявки, оборудование, локации, бригады и множество связанных действий. Человеку приходится постоянно собирать контекст своей задачи из разных частей большой системы. Workspace позволяет строить процесс вокруг самой задачи. Заявка, конкретное оборудование, его состояние и доступные действия оказываются в одном актуальном контексте. В этом демо я показываю следующий шаг. Агент собирает рабочее пространство под конкретную задачу, а затем проводит человека по созданному интерфейсу и объясняет, что здесь находится и зачем это нужно. А здесь я развиваю ту же идею в икс ар пространстве. Рабочий интерфейс размещается вокруг пользователя, и вместе с ним появляются интерактивные три дэ объекты. Редуктор можно буквально взять в руки, повернуть и рассмотреть нужную деталь. При этом объект остаётся связанным с контекстом рабочей задачи."
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-pool-mcp",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-pool-mcp",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В начале две тысячи двадцать шестого года Agent Pool MCP оформился как самостоятельный эм си пи сервер. Его можно подключить непосредственно к агенту. В Agent Portal он работает как исполнительный слой. Он распределяет задачи между агентами, отслеживает состояние и владение задачей, передаёт сессии и маршрутизирует ресурсы."
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:project-graph-mcp",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "project-graph-mcp",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать шестом году я выделил второй самостоятельный инструмент. Project Graph MCP это опенсорс эм си пи сервер для навигации по кодовой базе. Он строит компактный граф репозитория. В Agent Portal этот граф отображается как визуальная карта проекта. Человек может выбрать интересующую часть проекта. А агент может раскрыть для неё зависимости, скелеты кода, документацию и дополнительный контекст. Так человек и агент работают с одной структурой проекта."
      },
      "turnId": "project-graph-mcp"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:lifecycle-messaging-platform",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "lifecycle-messaging-platform",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "С две тысячи двадцать второго по две тысячи двадцать шестой год я развивал Lifecycle Messaging Platform. Это маркетинговая платформа для автоматизации клиентских коммуникаций. Она объединяла сегментацию аудитории, управление кампаниями, сценарии согласованных эс эм эс коммуникаций и аналитику. Я проектировал эй пи ай, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. А для проверки физического модемного контура я сделал локальный Digital Twin с виртуальными устройствами и воспроизводимыми сценариями."
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:mobile-smm-platform",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "mobile-smm-platform",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Отдельным прикладным проектом стала мобильная эс эм эм платформа для управляемой работы с несколькими профилями. В одном контуре были собраны медиаматериалы, публикации, расписание, входящие обращения и очередь. Андроид устройства выполняли стабильные операции по заранее подготовленным сценариям. Если интерфейс приложения изменялся, агент мог остановить процесс, проанализировать актуальный экран и подготовить обновлённый сценарий для проверки. Управляемость обеспечивали лимиты, дедупликация, подтверждения и журнал действий."
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:f360-studio",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "f360-studio",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В две тысячи двадцать первом и две тысячи двадцать втором годах я основал и вёл F360 Studio. Это была коммерческая студия высокоточного три дэ сканирования. Здесь опыт музейной фотограмметрии превращался уже в законченный производственный процесс. Я выстраивал весь путь от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели. При переезде в Аргентину в две тысячи двадцать втором году физическую производственную базу пришлось закрыть."
      },
      "turnId": "f360-studio"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:autobox",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "autobox",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "С две тысячи девятнадцатого по две тысячи двадцать первый год внутри исследовательского направления Complex Scan я развивал Auto Box. Это был более сложный ар эн ди проект для автоматизации три дэ сканирования музейных объектов. В серийной предметной съёмке процесс можно заранее настроить под класс похожих товаров. Здесь почти каждый новый предмет создавал новую задачу. Своя геометрия. Свой материал. Свои поверхности. И отдельные требования по безопасности. Поэтому целью было постепенно автоматизировать уже не только движение оборудования, но и построение процесса съёмки под конкретный объект. Ещё до изготовления установки я сделал её три дэ визуализацию. До разработки сложной механики я отдельно проверял технологию фотограмметрии на более простом оборудовании. Здесь уже виден промежуточный результат одного из таких экспериментов. После этого я перешёл к физическому прототипу. А здесь первая рабочая версия Auto Box уже сканирует настоящий музейный объект в Эрмитаже. На этих примерах можно увидеть результат на позолоте, полированном металле, драгоценных камнях и сложной бронзовой поверхности."
      },
      "turnId": "autobox"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:complexscan",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "complexscan",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "С две тысячи семнадцатого по две тысячи двадцать второй год я развивал профессиональное направление Complex Scan. Это была коммерческая линия оборудования для автоматизации предметной съёмки и три дэ сканирования. Внутри направления появлялись как универсальные системы, так и специализированное оборудование под конкретные процессы. Основой стали профессиональные поворотные платформы с прозрачной рабочей поверхностью из осветлённого стекла. Здесь требования к механике, ресурсу, точности и производительности были уже заметно выше, чем у открытой PhotoPizza. Система поддерживала несколько режимов автоматической съёмки. Можно было работать пошагово. А для большого потока использовать непрерывное вращение и серийную съёмку камеры. Управлять оборудованием можно было с физического пульта или через веб приложение. Я проектировал механику и метод съёмки как единый продукт. Я собирал прототипы и первые экземпляры, готовил конструкцию для подрядчиков, выполнял финальную сборку и тестирование. Затем добавились упаковка, экспортная документация и международная логистика. В результате Complex Scan прошёл путь от ар эн ди прототипов до оборудования, которое поставлялось клиентам в разные страны. Одним из специализированных проектов внутри этого профессионального направления стал Booth Bot. Он решал конкретную производственную задачу. Нужно было автоматизировать каталожную съёмку большого потока винных бутылок непосредственно на складе заказчика. Не перевозить товар в фотостудию. А перенести студийный процесс к товару. По сути мы построили компактную автоматизированную фотостудию. Световые панели создавали заданный рисунок бликов. Закрытая конструкция изолировала сцену от внешнего освещения. Система автоматически определяла высоту бутылки и позиционировала камеру. От оператора требовалось подготовить бутылку и поставить её внутрь. Остальной настроенный процесс система выполняла автоматически. После съёмки изображение отделялось от фона, обрабатывалось и превращалось в готовый материал для каталога."
      },
      "turnId": "complexscan"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:photopizza",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "photopizza",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В начале две тысячи десятых годов одной из ключевых точек в моей истории стал Megavisor. Я был сооснователем проекта и техническим директором. Я отвечал за ар эн ди съёмочного направления и производство интерактивного контента. Megavisor был облачной платформой для фото на триста шестьдесят градусов, сферических три дэ панорам, видео и виртуальных туров. Я участвовал в проработке интерактивного плеера, который связывал эти форматы между собой. Например, из панорамы помещения можно было открыть находящийся внутри объект. Затем перейти к его вращению на триста шестьдесят градусов. А после этого открыть связанные фотографии и другие материалы. В этом ролике виден общий принцип платформы и то, как разные форматы могли работать внутри одного интерактивного пространства. В съёмочном направлении я руководил студией Gate Nine и выездным производством. Я организовывал съёмки, координировал фотографов и ретушёров, разрабатывал оборудование и выстраивал технологические процессы. Я также продюсировал промо и обучающие видеоматериалы, чтобы снизить порог входа в новый для рынка формат. Рост объёмов съёмки привёл к следующей инженерной задаче. Процесс нужно было автоматизировать. Так внутри Megavisor появилась PhotoPizza. PhotoPizza я начал развивать с две тысячи десятого года. Проект появился как решение конкретной производственной задачи. Съёмку объектов на триста шестьдесят градусов нужно было поставить на поток, чтобы она легко масштабировалась. Сначала я собрал прототип из доступных промышленных компонентов. Он позволил нам быстро проверить механику и саму технологию съёмки. На этом прототипе мы отработали основные принципы системы. После этого я начал проектировать PhotoPizza как лёгкое, мобильное и доступное решение. Одной из ключевых задач было совместить небольшую массу с высокой грузоподъёмностью. Платформу можно было привезти на выездную съёмку и установить силами одного фотографа. При этом крупные версии выдерживали человека и позволяли снимать тяжёлые и габаритные предметы. В результате PhotoPizza выросла в целый модельный ряд. Появились и подвесные версии для люстр, украшений, велосипедов и других объектов. Система оставалась модульной. Один блок управления мог работать с платформами разных размеров, слайдером PhotoSnail и моторизированной панорамной головкой. Параллельно мы снижали порог входа в саму технологию. Например, я сделал простой вариант платформы из доступных деталей, чтобы фотограф мог сначала проверить сам формат почти без вложений. Позже PhotoPizza стала опенсорс проектом. Вместе с оборудованием развивалась и программная часть. В итоге с телефона по вай фай можно было управлять оборудованием и камерой через веб приложение. А это результат масштабирования технологии на крупные объекты. Интерактивную последовательность мотоцикла можно вращать и рассматривать со всех сторон. PhotoPizza продолжала развиваться до моего переезда в Аргентину в две тысячи двадцать втором году."
      },
      "turnId": "photopizza"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:finale",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "conclude",
        "id": "finale",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Все эти проекты находятся в разных предметных областях. Но для меня это один тип работы. Я нахожу проблемы и новые возможности. Придумываю и формирую проекты, продукты и технические решения. Запускаю их с нуля или развиваю новые направления внутри уже существующих систем. Проверяю идеи на практике и довожу их до работающего результата. Иногда работа начинается практически с чистого листа. Иногда новая идея появляется внутри уже существующего продукта и постепенно превращается в отдельное направление или отдельный проект. В зависимости от задачи это может быть программное обеспечение, искусственный интеллект, электроника, механика, компьютерное зрение или сочетание нескольких технологий. Сейчас мой основной фокус находится в области программных платформ и агентных систем. Один из текущих проектов в этом направлении это Symbiote Workspace. Но сама предметная область для меня не является ограничением. Мне интересны сложные проекты, где можно увидеть новую возможность, разобраться в проблеме и превратить идею в работающую систему. Здесь можно подробнее посмотреть мои проекты, открыть резюме, исходный код или связаться со мной."
      },
      "turnId": "finale"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:workspace-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "workspace-details",
        "persona": "vladimir",
        "replyTo": "symbiote-workspace",
        "sourceRefs": [],
        "text": "Если посмотреть глубже, основной объект Workspace это не заранее написанное приложение, а конфигурация рабочей среды. В ней задаются компоновка, панели, модули, действия и связи между ними. Агент выбирает подходящие готовые блоки, формирует конфигурацию, проверяет её и собирает интерфейс в браузере. Это важно, потому что агент не генерирует каждый раз произвольный интерфейс с нуля. Он работает с известными компонентами и с понятными контрактами. Конфигурацию можно изменять уже во время работы. Например, добавить новую панель, перестроить рабочий процесс или открыть другой инструмент, не пересобирая отдельное приложение целиком. После этого состояние можно сохранить и открыть в другом совместимом хост приложении. При этом секреты, авторизация и пользовательские данные не нужно переносить внутрь самой конфигурации. Они остаются на стороне хоста. Для меня это позволяет разделить две вещи. Есть переносимое описание рабочего процесса. И есть конкретная среда, которая предоставляет ему доступ к данным, авторизации и инфраструктуре. Я развиваю Workspace как общий слой для специализированных рабочих процессов, а не как одно приложение для одной предметной области."
      },
      "turnId": "workspace-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-ui-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-ui-details",
        "persona": "vladimir",
        "replyTo": "symbiote-ui",
        "sourceRefs": [],
        "text": "Я развиваю Symbiote UI как библиотеку нейтральных интерфейсных блоков. Главная идея в том, что интерфейсы должны быть компонуемыми программно. Компонент при этом представляет собой не только визуальный элемент. Он может публиковать свою роль, состояние и безопасные действия. Для этого используются манифесты и семантические контракты. В том числе Веб эм си пи контракты. Так агент получает не набор пикселей, а понятную модель возможностей интерфейса. Например, он может знать, что перед ним список заявок, какая заявка выбрана, какие действия разрешены и какие данные связаны с текущим состоянием. Workspace использует этот каталог, когда собирает конкретную рабочую среду. Продуктовый смысл появляется уже на уровне конфигурации. Один и тот же нейтральный блок может использоваться в совершенно разных предметных областях. Для меня это принципиальное разделение. Библиотека предоставляет переиспользуемые возможности. А конкретный продукт или рабочий процесс придаёт им смысл. И за счёт того, что эти возможности описаны семантически, агент может работать с интерфейсом на том же уровне, на котором с ним работает человек."
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-engine-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-engine-details",
        "persona": "vladimir",
        "replyTo": "symbiote-engine",
        "sourceRefs": [],
        "text": "Symbiote Engine предоставляет компонуемые серверные примитивы. Это обработчики, команды, графы выполнения и хранение состояния. Идея здесь похожа на Symbiote UI. Я не хочу жёстко зашивать всю серверную логику внутрь одного продукта. Продукт может собрать свой процесс из небольших функциональных блоков. Workspace затем связывает этот процесс с интерфейсом и переносимой конфигурацией. Получается отдельный визуальный слой, отдельный исполнительный слой и понятный контракт между ними. Я специально сохраняю это разделение. Engine должен оставаться пригодным не только для Workspace. Его можно использовать в разных сервисах и рабочих средах, где нужен граф исполнения, состояние и управляемая автоматизация."
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-portal-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-portal-details",
        "persona": "vladimir",
        "replyTo": "agent-portal",
        "sourceRefs": [],
        "text": "В центре Agent Portal находится исполняемая канбан доска. Карточка здесь не просто запись о задаче. Она является частью реального процесса. Каждая колонка может запускать свой этап. Для неё можно задать действия, роли и пул специализированных агентов. Поэтому доска фактически становится визуальным описанием процесса исполнения. Для задач с кодом система может создать отдельную рабочую копию и отдельную ветку. Один агент выполняет задачу. После этого другой агент независимо проверяет результат. Если аудит проходит успешно, задача может двигаться дальше к публикации. Если агенты не согласны или появляется конфликт, карточка переводится к решению человека. Ещё одна часть архитектуры это управление ресурсами. Модели, аккаунты и подписки можно объединять в группы. Тогда конкретный этап получает исполнителя, у которого есть нужные возможности и доступный лимит. Это позволяет отделить логику процесса от конкретного провайдера или конкретной модели. Для меня Agent Portal стал практической лабораторией управляемой агентной разработки."
      },
      "turnId": "agent-portal-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:video-studio-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "video-studio-details",
        "persona": "vladimir",
        "replyTo": "symbiote-video-studio",
        "sourceRefs": [],
        "text": "В основе Studio лежит отдельное ядро Symbiote Video. Структура ролика описывается семантически. Например, через сцены, слои, клипы и переходы. Агент может сформировать такое описание в формате джейсон. После этого движок превращает его в реальные рабочие представления. Можно посмотреть граф. Можно проверить таймлайн. Можно запустить живой предпросмотр результата. Состояние проекта сохраняется, после чего процесс может перейти к экспорту. Для меня здесь снова важна одна и та же идея. Агент работает не с непрозрачным редактором через случайные клики. У него есть семантическая модель проекта и объявленные действия. Видео ядро уже работает. Сама Studio как универсальная конфигурация Workspace продолжает развиваться в альфа режиме."
      },
      "turnId": "video-studio-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:maximo-workbench-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "maximo-workbench-details",
        "persona": "vladimir",
        "replyTo": "adaptive-maximo-workbench",
        "sourceRefs": [],
        "text": "Здесь Workspace получает предметную конфигурацию для обслуживания оборудования. Панели связывают заявки, активы, локации, бригады и доступные безопасные действия. Для меня здесь важен общий контекст. Агент работает не с абстрактным текстовым описанием задачи отдельно от интерфейса. Он читает тот же актуальный контекст, который находится перед человеком. Действия тоже не должны быть произвольными. Интерфейс объявляет, что можно сделать с конкретным объектом и какие ограничения действуют сейчас. За счёт этого рабочая среда может не только показать информацию, но и сопровождать сам процесс. Она может объяснить последовательность действий, подсветить риск или потребовать подтверждение перед критическим шагом. Поэтому это демо для меня не только пример интерфейса для Maximo. Оно проверяет архитектуру Workspace на сложном корпоративном процессе. Икс ар версия проверяет тот же принцип уже без ограничения плоским экраном. Контекст задачи, интерфейс и связанный с ним физический объект можно разместить в одном пространстве. Реальные данные Maximo, авторизация и эй пи ай при этом подключаются отдельным интеграционным слоем. Сам Workbench остаётся демонстрационным проектом и альфа версией архитектуры."
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-pool-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-pool-details",
        "persona": "vladimir",
        "replyTo": "agent-pool-mcp",
        "sourceRefs": [],
        "text": "Я создавал Agent Pool как независимый слой исполнения для разных си эл ай агентов и разных моделей. Он не должен зависеть от одного конкретного провайдера. Система поддерживает параллельные задачи, последовательные пайплайны, передачу сессий, политики исполнения и группы ресурсов. Например, один процесс может поручить реализацию одному агенту. А независимую проверку результата другому. Так проверяющий агент не обязан наследовать рассуждения и предположения исполнителя. В сценариях кросс модельного ревью можно использовать модели разных провайдеров. Они независимо анализируют задачу, после чего результаты сравниваются и собираются в общий структурированный ответ. Для меня это способ строить процессы не вокруг одной умной модели, а вокруг системы исполнителей с разными ролями, возможностями и ограничениями."
      },
      "turnId": "agent-pool-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:project-graph-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "project-graph-details",
        "persona": "vladimir",
        "replyTo": "project-graph-mcp",
        "sourceRefs": [],
        "text": "Project Graph анализирует структуру репозитория и готовит несколько представлений одного проекта. Это зависимости, скелеты кода, компактная карта и проверяемые факты. Цель здесь не в том, чтобы загрузить весь репозиторий в контекст модели. Наоборот. Сначала строится компактная структура. После этого сильная модель получает только тот участок, который действительно нужен для конкретной задачи. Отдельно система может хранить факты браузерной или другой внешней проверки. То есть модель получает не только пересказ кода, но и структурированный контекст с происхождением конкретной информации. Более быстрая и дешёвая модель может заниматься построением карты. А более сильная модель использовать уже сфокусированный контекст для решения сложной задачи. Я рассматриваю этот слой как практический context engineering. То есть как управление тем, какую структуру проекта модель видит, в каком объёме и с какими связями."
      },
      "turnId": "project-graph-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:lifecycle-platform-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "lifecycle-platform-details",
        "persona": "vladimir",
        "replyTo": "lifecycle-messaging-platform",
        "sourceRefs": [],
        "text": "Этот проект соединял сразу несколько разных слоёв. Был веб продукт. Была серверная инфраструктура. И был физический контур доставки через модемы. Эй пи ай и база PostgreSQL хранили продуктовые данные и состояние системы. WebSocket связывал сервер с удалёнными исполнительными инстансами. Эти инстансы управляли пулами джи эс эм модемов через serial интерфейс и эй ти команды. В таком контуре нельзя исходить из того, что сеть и устройство всегда находятся в идеальном состоянии. Связь может пропасть. Модем может изменить состояние. Удалённый инстанс может перезапуститься. Поэтому очередь, повторяемое выполнение, состояние задач и мониторинг были частью самой архитектуры. Я старался сделать процесс восстанавливаемым и наблюдаемым на каждом этапе. При этом тестировать всё только на реальном пуле модемов неудобно и дорого. Поэтому я сделал локальный Digital Twin. Он воспроизводил физический контур виртуальными устройствами и позволял повторять нужные сценарии локально."
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:mobile-smm-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "mobile-smm-details",
        "persona": "vladimir",
        "replyTo": "mobile-smm-platform",
        "sourceRefs": [],
        "text": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Андроид устройствами. Для стабильных участков процесса используется заранее подготовленный джейсон сценарий. Он выполняет известный путь и записывает результат в журнал. Это дешевле и надёжнее, чем просить модель заново рассуждать на каждом обычном шаге. Но мобильный интерфейс может измениться. Если структура экрана больше не соответствует ожидаемому сценарию, исполнитель не должен продолжать нажимать вслепую. Он останавливается в безопасной точке. После этого агент анализирует новое состояние интерфейса и готовит обновлённый вариант сценария. Этот вариант сначала передаётся на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и подтверждение. Поэтому повторный запуск процесса не должен случайно дублировать уже выполненное действие. Здесь я соединяю детерминированную автоматизацию там, где она работает хорошо, и агентную адаптацию там, где действительно появляется неопределённость."
      },
      "turnId": "mobile-smm-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:f360-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "f360-details",
        "persona": "vladimir",
        "replyTo": "f360-studio",
        "sourceRefs": [],
        "text": "F триста шестьдесят переносила дисциплину музейной съёмки в коммерческую студийную работу. Для каждого объекта нужно было определить подходящие ракурсы и свет. Я контролировал исходный материал ещё на этапе съёмки. Плохой исходник гораздо дешевле переснять сразу, чем обнаружить проблему после долгой фотограмметрической обработки. После съёмки я проводил фотограмметрическую обработку и проверял геометрию модели. Отдельно контролировались текстуры. В результате получался не просто набор фотографий или сырой скан. Я выстроил единый путь от физического объекта до готовой три дэ модели и её презентации или публикации. Публичные примеры этой работы сохранились в видео и в портфолио моделей. Для меня F триста шестьдесят был ещё одним примером того, как исследовательская технология становится реальным производственным процессом. Работа студии завершилась в две тысячи двадцать втором году во время моего переезда."
      },
      "turnId": "f360-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:autobox-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "autobox-details",
        "persona": "vladimir",
        "replyTo": "autobox",
        "sourceRefs": [],
        "text": "Auto Box развивался итерациями. Важно, что это не был законченный автономный робот со всеми задуманными функциями одновременно. Часть контуров уже работала с реальными музейными объектами. Более автономные функции находились на разных стадиях прототипирования. Рабочая система управляла камерой, светом и механикой позиционирования. Сначала она могла снять полную серию. После этого компьютерное зрение анализировало материал, оценивало резкость и помогало отбирать фотографии для построения три дэ модели. Следующий уровень автоматизации был гораздо интереснее. Система должна была сначала получить черновую три дэ форму конкретного предмета. А затем сама построить план более детальной макросъёмки. Такой план включал зоны объекта, ракурсы, положения камеры, параметры оптики, глубину резкости и необходимое перекрытие кадров. Но геометрии предмета недостаточно. Нужно учитывать реальные размеры камеры, диапазон механики, возможные препятствия и безопасное расстояние до музейного объекта. После проверки основного принципа я проектировал и дополнительные контуры безопасности. Например, лидарный контроль расстояния на случай, если предмет случайно изменит положение. Этот слой оставался следующим этапом разработки. При этом первая рабочая технология уже применялась на настоящих музейных объектах. В Эрмитаже я собственноручно сканировал японские нэцкэ. Эти объекты использовались в музейной серии Нэцкэ под увеличительным стеклом. Позолоченный Будда показывает сохранение мелких повреждений и царапин на сложной металлической поверхности. У могольского кинжала одновременно присутствуют полированный металл, позолота и драгоценные камни. Для фотограмметрии это очень сложное сочетание материалов. А здесь можно увидеть сложный рельеф и характер поверхности бенинской бронзы. Для меня Auto Box был важен ещё и архитектурно. В ранних системах автоматизация в основном исполняла заранее описанный процесс. Здесь я уже двигался к системе, которая сначала изучает конкретный объект, затем формирует план и после этого управляет физическим исполнением."
      },
      "turnId": "autobox-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:complexscan-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "complexscan-details",
        "persona": "vladimir",
        "replyTo": "complexscan",
        "sourceRefs": [],
        "text": "Complex Scan я придумал как следующий коммерческий этап после открытой работы над PhotoPizza. Здесь уже нужно было не просто доказать идею, а сделать оборудование, которое будет постоянно работать у клиента. Прозрачный вращающийся диск, стабильная механика и управляемый свет давали чистые исходники для съёмки на триста шестьдесят градусов и для фотограмметрии. Прозрачная поверхность особенно важна для предметной съёмки. Она позволяет работать со светом вокруг объекта и не оставляет под ним обычное непрозрачное основание. Я собственноручно собирал прототипы и первые изделия. Когда конструкция стабилизировалась, я разбивал её на производимые детали и передавал отдельные операции профильным подрядчикам. После этого выполнял финальную сборку и тестирование. Но коммерческое оборудование не заканчивается в момент, когда устройство заработало. Его нужно безопасно упаковать, отправить через границу, оформить документы и получить у клиента в рабочем состоянии. Поэтому я отдельно проектировал транспортную упаковку, занимался экспортными документами и организовывал международные поставки. Ар эн ди этой линии позже стал технической базой для более специализированных систем. В том числе Booth Bot и музейного направления Auto Box. Здесь я уже проектировал не отдельный механизм, а почти весь производственный процесс целиком. Главная проблема была в масштабе. На большом складе постоянно появляются новые позиции. Возить каждую бутылку в отдельную профессиональную студию неудобно и дорого. При этом качество каталога должно оставаться одинаковым. Поэтому световая схема была частью самой машины. Для стеклянной бутылки особенно важен рисунок отражений. Управляемые панели позволяли заранее сформировать этот рисунок и повторять его для каждой следующей позиции. При необходимости свет можно было перенастроить под другой визуальный стиль. Корпус отсекал случайный свет помещения. Поэтому результат не зависел от окна, потолочного света или времени суток. Бутылки имеют разную высоту. Система автоматически измеряла объект и перемещала камеру так, чтобы сохранялась правильная геометрия и композиция. То есть оператору не нужно было заново выставлять штатив и строить кадр. Его задача была максимально простой. Подготовить товар. Удалить пыль и следы с поверхности. Поставить бутылку внутрь. После съёмки система отделяла объект от фона и готовила изображение для каталога. Следующим этапом должна была стать непосредственная публикация результата на сайте. Тогда весь процесс от физической бутылки на складе до карточки товара мог работать как единый автоматизированный конвейер."
      },
      "turnId": "complexscan-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:photopizza-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "photopizza-details",
        "persona": "vladimir",
        "replyTo": "photopizza",
        "sourceRefs": [],
        "text": "Для меня Megavisor был важен ещё и потому, что здесь я работал сразу на нескольких уровнях. Я занимался не только производством контента. Я участвовал в формировании самого продукта. Мы рассматривали интерактивный контент не как набор отдельных плееров. Пользователь мог двигаться между разными способами представления одного пространства или объекта. Например, находясь внутри сферической панорамы помещения, увидеть мотоцикл и открыть его как отдельный объект. После этого вращать уже сам мотоцикл. А затем перейти к обычной галерее или другому связанному материалу. Хот споты работали как связи между такими состояниями. Для веба того периода это был достаточно смелый подход. Параллельно я отвечал за реальное производство такого контента. Я руководил фотостудией, организовывал выездные съёмки на складах и в магазинах заказчиков и координировал фотографов и ретушёров. При росте объёмов быстро стало понятно, что одна хорошая фотостудия проблему не решает. Нужен технологический процесс, который можно масштабировать. Отдельным направлением были промо и обучающие материалы. Мы показывали фотографам и пользователям сервиса, как снимать контент на триста шестьдесят градусов, как его обрабатывать и как использовать в реальных проектах. То есть мы одновременно развивали сам продукт, технологию производства и рынок вокруг нового формата. Именно из этой производственной задачи выросла PhotoPizza. В самом начале мне было важно не сразу проектировать идеальное устройство, а быстро проверить принцип. Поэтому первый прототип был собран из доступных промышленных компонентов. Конструкционный алюминиевый профиль, шаговый двигатель и готовые элементы позволили быстро проверить механику и технологию съёмки. После этого я уже мог оптимизировать систему под реальную работу фотографа. Большая грузоподъёмность сама по себе не была новой задачей. Сложность была в том, чтобы получить её при небольшой массе и простой транспортировке. Я использовал конструкцию из листовых материалов и максимально простые механические узлы. Даже опорные элементы можно было собирать из доступных подшипников и стандартного крепежа. Так устройство было проще производить и ремонтировать. Постепенно появился модельный ряд под разные масштабы задачи. От макросъёмки небольших объектов до человека, бытовой техники и тяжёлых предметов. Подвесная конфигурация позволяла перевернуть сам принцип. Объект подвешивался и вращался сверху. Так можно было снимать люстру, украшение или велосипед, а ориентацию готовой последовательности изменить уже при обработке. При этом электронику не требовалось дублировать для каждой установки. Один универсальный контроллер подключался к разной механике. Он мог управлять поворотным столом, слайдером камеры и моторизированной панорамной головкой. Когда PhotoPizza стала открытым проектом, я подбирал доступные компоненты и описывал сборку и калибровку так, чтобы люди могли делать собственные версии. Это было продолжением идеи снижения порога входа. После Megavisor я продолжил развивать управляющее программное обеспечение на JavaScript и Espruino. Веб интерфейс позволял запускать процесс с обычного телефона без отдельной специализированной консоли. Этот открытый проект дал практическую основу для следующего этапа профессионального оборудования."
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "profile.experience.15-plus"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:positioning:01"
        }
      ],
      "id": "cv-show:cue:positioning.tenure-marker:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сейчас, в две тысячи двадцать шестом году"
        },
        "gestureDurationMs": 800,
        "leadMs": 1750,
        "settleBy": "none",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "oval",
          "series": "positioning-tenure"
        },
        "kind": "annotation",
        "targetId": "profile.experience.15-plus"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.tenure-marker:scroll"
        }
      ],
      "id": "cv-show:cue:positioning.tenure-marker",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сейчас, в две тысячи двадцать шестом году"
        },
        "gestureDurationMs": 2500,
        "leadMs": 600,
        "settleBy": "none",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:positioning:02"
        }
      ],
      "id": "cv-show:cue:positioning.workspace-transition:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "и за что именно отвечал"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.workspace-transition:scroll"
        }
      ],
      "id": "cv-show:cue:positioning.workspace-transition",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "и за что именно отвечал"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "profile/photo"
      },
      "dependsOn": [],
      "id": "cv-show:cue:positioning.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 8700,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-workspace"
      },
      "dependsOn": [],
      "id": "cv-show:cue:workspace.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.intro"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-workspace:01"
        }
      ],
      "id": "cv-show:cue:workspace.intro-frame:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Чем сложнее система"
        },
        "gestureDurationMs": 1800,
        "leadMs": 3450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.intro-frame:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.intro-frame",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Чем сложнее система"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.portable-config"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-workspace:02"
        }
      ],
      "id": "cv-show:cue:workspace.portable-config:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Такое рабочее пространство можно сохранить"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.portable-config"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.portable-config:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.portable-config",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Такое рабочее пространство можно сохранить"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.agent-portal"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-workspace:03"
        }
      ],
      "id": "cv-show:cue:workspace.agent-portal-card:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "постепенно становятся его конфигурациями"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.agent-portal"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.agent-portal-card:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.agent-portal-card",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "постепенно становятся его конфигурациями"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-ui"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-ui.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.graph-tooling"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui:01"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.graph-tooling:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "графовые инструменты и семантические контракты"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-ui.graph-tooling"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.graph-tooling:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.graph-tooling",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "графовые инструменты и семантические контракты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui:02"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.current-show:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "интерфейс этого си ви"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.current-show:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.current-show",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "интерфейс этого си ви"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui:03"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.show-player-pointer:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "То, что происходит прямо сейчас"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.show-player-pointer:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.show-player-pointer",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "То, что происходит прямо сейчас"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-link.symbiote-ui.github"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui:04"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.github-link:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Интерфейс переводит внимание"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2700,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-link.symbiote-ui.github"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.github-link:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.github-link",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Интерфейс переводит внимание"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "chat.action.symbiote-ui.details"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui:05"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.details-pointer:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "объясняет сам себя"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "arrow"
        },
        "kind": "annotation",
        "targetId": "chat.action.symbiote-ui.details"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.details-pointer:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.details-pointer",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "объясняет сам себя"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-engine"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-engine.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.intro"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-engine:01"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.intro:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "библиотека для сервисов"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-engine.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.intro:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.intro",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "библиотека для сервисов"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-engine:02"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.workspace-join:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace связывает визуальную и исполнительную части"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "underline",
          "series": "workspace-layers"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.workspace-join:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.workspace-join",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace связывает визуальную и исполнительную части"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/agent-portal"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-portal.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.process-path"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal:01"
        }
      ],
      "id": "cv-show:cue:agent-portal.path:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собственный управляющий слой"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "agent-portal-process"
        },
        "kind": "annotation",
        "targetId": "article.agent-portal.process-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.path:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.path",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собственный управляющий слой"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.human-decision"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal:02"
        }
      ],
      "id": "cv-show:cue:agent-portal.human-decision:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "контроль над контекстом, задачами и ресурсами"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "oval",
          "series": "agent-portal-process"
        },
        "kind": "annotation",
        "targetId": "article.agent-portal.human-decision"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.human-decision:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.human-decision",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "контроль над контекстом, задачами и ресурсами"
        },
        "gestureDurationMs": 3000,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.open-source"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal:03"
        }
      ],
      "id": "cv-show:cue:agent-portal.open-source:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Часть управляющего контура мы открыли"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.open-source"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.open-source:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.open-source",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Часть управляющего контура мы открыли"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-link.agent-portal.github"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal:04"
        }
      ],
      "id": "cv-show:cue:agent-portal.github-link:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "А внутри Agent Portal есть два важных инструмента"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-link.agent-portal.github"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.github-link:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.github-link",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "А внутри Agent Portal есть два важных инструмента"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-link.agent-portal.demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal:05"
        }
      ],
      "id": "cv-show:cue:agent-portal.demo-link:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Project Graph отвечает за структуру"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "arrow"
        },
        "kind": "annotation",
        "targetId": "project-link.agent-portal.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.demo-link:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.demo-link",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Project Graph отвечает за структуру"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-video-studio"
      },
      "dependsOn": [],
      "id": "cv-show:cue:video-studio.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-video-studio:01"
        }
      ],
      "id": "cv-show:cue:video-studio.visible-process:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "предпросмотр и рендер собраны"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3350,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.visible-process:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio.visible-process",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "предпросмотр и рендер собраны"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-video-studio:02"
        }
      ],
      "id": "cv-show:cue:video-studio.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент работает с семантическими элементами"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.demo:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент работает с семантическими элементами"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/adaptive-maximo-workbench"
      },
      "dependsOn": [],
      "id": "cv-show:cue:maximo.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.work-orders"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:adaptive-maximo-workbench:01"
        }
      ],
      "id": "cv-show:cue:maximo.work-orders:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "постоянно собирать контекст своей задачи"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.work-orders"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.work-orders:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.work-orders",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "постоянно собирать контекст своей задачи"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:adaptive-maximo-workbench:02"
        }
      ],
      "id": "cv-show:cue:maximo.asset-context:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "оказываются в одном актуальном контексте"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.asset-context:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.asset-context",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "оказываются в одном актуальном контексте"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/agent-pool-mcp"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-pool.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.execution-flow"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-pool-mcp:01"
        }
      ],
      "id": "cv-show:cue:agent-pool.flow:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределяет задачи между агентами"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "underline",
          "occurrence": 1,
          "quote": "tracks process state",
          "series": "agent-pool-flow"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.execution-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool.flow:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool.flow",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределяет задачи между агентами"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/project-graph-mcp"
      },
      "dependsOn": [],
      "id": "cv-show:cue:project-graph.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.graph-example"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-mcp:01"
        }
      ],
      "id": "cv-show:cue:project-graph.example:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактный граф репозитория"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.graph-example"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.example:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.example",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактный граф репозитория"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-mcp:02"
        }
      ],
      "id": "cv-show:cue:project-graph.context:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "раскрыть для неё зависимости"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.context:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.context",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "раскрыть для неё зависимости"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.readonly-node"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-mcp:03"
        }
      ],
      "id": "cv-show:cue:project-graph.node:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "документацию и дополнительный контекст"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.readonly-node"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.node:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.node",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "документацию и дополнительный контекст"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/lifecycle-messaging-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:lifecycle.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-scope"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-messaging-platform:01"
        }
      ],
      "id": "cv-show:cue:lifecycle.scope:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "маркетинговая платформа для автоматизации"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3350,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-scope"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.scope:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.scope",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "маркетинговая платформа для автоматизации"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-messaging-platform:02"
        }
      ],
      "id": "cv-show:cue:lifecycle.product-number:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сегментацию аудитории, управление кампаниями"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "label": "1",
          "marker": "number",
          "series": "lifecycle-layers"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.product-number:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.product-number",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сегментацию аудитории, управление кампаниями"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-messaging-platform:03"
        }
      ],
      "id": "cv-show:cue:lifecycle.runtime-number:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределение заданий, связь с удалёнными инстансами"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "label": "2",
          "marker": "number",
          "series": "lifecycle-runtime"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.runtime-number:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.runtime-number",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределение заданий, связь с удалёнными инстансами"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-messaging-platform:04"
        }
      ],
      "id": "cv-show:cue:lifecycle.digital-twin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "локальный Digital Twin"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "underline",
          "occurrence": 1,
          "quote": "mirrored the GSM modem pool",
          "series": "lifecycle-twin"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.digital-twin:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.digital-twin",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "локальный Digital Twin"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/mobile-smm-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:mobile-smm.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.system-map"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-platform:01"
        }
      ],
      "id": "cv-show:cue:mobile-smm.overview:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В одном контуре были собраны"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.system-map"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.overview:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.overview",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В одном контуре были собраны"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.stable-path"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-platform:02"
        }
      ],
      "id": "cv-show:cue:mobile-smm.stable-path:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Андроид устройства выполняли"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "mobile-smm-flow"
        },
        "kind": "annotation",
        "targetId": "article.mobile-smm-platform.stable-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.stable-path:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.stable-path",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Андроид устройства выполняли"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.agent-update"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-platform:03"
        }
      ],
      "id": "cv-show:cue:mobile-smm.agent-update:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "агент мог остановить процесс"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "oval",
          "series": "mobile-smm-flow"
        },
        "kind": "annotation",
        "targetId": "article.mobile-smm-platform.agent-update"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.agent-update:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.agent-update",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "агент мог остановить процесс"
        },
        "gestureDurationMs": 2500,
        "leadMs": 2800,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/f360-studio"
      },
      "dependsOn": [],
      "id": "cv-show:cue:f360.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:f360-studio:01"
        }
      ],
      "id": "cv-show:cue:f360.process:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "весь путь от физической съёмочной установки"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.process:scroll"
        }
      ],
      "id": "cv-show:cue:f360.process",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "весь путь от физической съёмочной установки"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:f360-studio:02"
        }
      ],
      "id": "cv-show:cue:f360.result:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "до геометрии, текстур и готовой презентации модели"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.result:scroll"
        }
      ],
      "id": "cv-show:cue:f360.result",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "до геометрии, текстур и готовой презентации модели"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/autobox-v1"
      },
      "dependsOn": [],
      "id": "cv-show:cue:autobox.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/IPEY0yiVb-I"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:01"
        }
      ],
      "id": "cv-show:cue:autobox.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Ещё до изготовления установки я сделал её три дэ визуализацию"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/IPEY0yiVb-I"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Ещё до изготовления установки я сделал её три дэ визуализацию"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/NWpMtNZjrzI"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:02"
        }
      ],
      "id": "cv-show:cue:autobox.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "проверял технологию фотограмметрии"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/NWpMtNZjrzI"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "проверял технологию фотограмметрии"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/8XsSHyQFtV8"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:03"
        }
      ],
      "id": "cv-show:cue:autobox.video-03:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "промежуточный результат одного из таких экспериментов"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/8XsSHyQFtV8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-03:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-03",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "промежуточный результат одного из таких экспериментов"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/zb47xAYQBcE"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:04"
        }
      ],
      "id": "cv-show:cue:autobox.video-04:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "перешёл к физическому прототипу"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/zb47xAYQBcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-04:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-04",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "перешёл к физическому прототипу"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/us3vQHuTYPw"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:05"
        }
      ],
      "id": "cv-show:cue:autobox.video-05:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сканирует настоящий музейный объект в Эрмитаже"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/us3vQHuTYPw"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-05:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-05",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сканирует настоящий музейный объект в Эрмитаже"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/FugBzpZqXZ0"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:06"
        }
      ],
      "id": "cv-show:cue:autobox.video-06:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "результат на позолоте"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/FugBzpZqXZ0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-06:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-06",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "результат на позолоте"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/iNqxRJgrqM8"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:07"
        }
      ],
      "id": "cv-show:cue:autobox.video-07:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "полированном металле"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/iNqxRJgrqM8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-07:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-07",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "полированном металле"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/M0cHqy3cScc"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:08"
        }
      ],
      "id": "cv-show:cue:autobox.video-08:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "драгоценных камнях"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/M0cHqy3cScc"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-08:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-08",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "драгоценных камнях"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/o4XzMKW8a2E"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox:09"
        }
      ],
      "id": "cv-show:cue:autobox.video-09:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сложной бронзовой поверхности"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/autobox-v1/youtube/o4XzMKW8a2E"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-09:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-09",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сложной бронзовой поверхности"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/complexscan"
      },
      "dependsOn": [],
      "id": "cv-show:cue:complexscan.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 7850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-line"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:01"
        }
      ],
      "id": "cv-show:cue:complexscan.line:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "коммерческая линия оборудования"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.product-line"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.line:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.line",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "коммерческая линия оборудования"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/MHfWHxVSgn4"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:02"
        }
      ],
      "id": "cv-show:cue:complexscan.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Система поддерживала несколько режимов автоматической съёмки"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/complexscan/youtube/MHfWHxVSgn4"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Система поддерживала несколько режимов автоматической съёмки"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/PFPoitVEWcE"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:03"
        }
      ],
      "id": "cv-show:cue:complexscan.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "физического пульта или через веб приложение"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/complexscan/youtube/PFPoitVEWcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "физического пульта или через веб приложение"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.international-delivery"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:04"
        }
      ],
      "id": "cv-show:cue:complexscan.delivery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "экспортная документация и международная логистика"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.international-delivery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.delivery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.delivery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "экспортная документация и международная логистика"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "projects/boothbot"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:05"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-open:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Одним из специализированных проектов"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/boothbot"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-open:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Одним из специализированных проектов"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/boothbot/ims/gallery"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:06"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-gallery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактную автоматизированную фотостудию"
        },
        "gestureDurationMs": 800,
        "leadMs": 3050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/boothbot/ims/gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-gallery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактную автоматизированную фотостудию"
        },
        "gestureDurationMs": 1800,
        "leadMs": 2050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.boothbot.solution"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan:07"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-catalog-ready:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовый материал для каталога"
        },
        "gestureDurationMs": 800,
        "leadMs": 4300,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "oval",
          "occurrence": 1,
          "quote": "готовый материал для каталога",
          "series": "boothbot-result"
        },
        "kind": "annotation",
        "targetId": "article.boothbot.solution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-catalog-ready:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-catalog-ready",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовый материал для каталога"
        },
        "gestureDurationMs": 3000,
        "leadMs": 3300,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/photopizza"
      },
      "dependsOn": [],
      "id": "cv-show:cue:photopizza.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:01"
        }
      ],
      "id": "cv-show:cue:photopizza.origin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Я отвечал за ар эн ди съёмочного направления"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.origin:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.origin",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Я отвечал за ар эн ди съёмочного направления"
        },
        "gestureDurationMs": 1600,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/megavisor/youtube/c3cCmDqO04c"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:02"
        }
      ],
      "id": "cv-show:cue:photopizza.megavisor-promo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В этом ролике виден общий принцип платформы"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/megavisor/youtube/c3cCmDqO04c"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.megavisor-promo:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.megavisor-promo",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В этом ролике виден общий принцип платформы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "projects/photopizza"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:03"
        }
      ],
      "id": "cv-show:cue:photopizza.page-open:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Так внутри Megavisor появилась PhotoPizza"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/photopizza"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.page-open:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.page-open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "PhotoPizza я начал развивать с две тысячи десятого года"
        },
        "gestureDurationMs": 800,
        "leadMs": 1150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/2lO2VsZFAz0"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:04"
        }
      ],
      "id": "cv-show:cue:photopizza.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сначала я собрал прототип из доступных промышленных компонентов"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/youtube/2lO2VsZFAz0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сначала я собрал прототип из доступных промышленных компонентов"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/6CpdVcjtZoU"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:05"
        }
      ],
      "id": "cv-show:cue:photopizza.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "На этом прототипе мы отработали основные принципы системы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/youtube/6CpdVcjtZoU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "На этом прототипе мы отработали основные принципы системы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.mechanics"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:06"
        }
      ],
      "id": "cv-show:cue:photopizza.mechanics:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "совместить небольшую массу с высокой грузоподъёмностью"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.mechanics"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.mechanics:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.mechanics",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "совместить небольшую массу с высокой грузоподъёмностью"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:07"
        }
      ],
      "id": "cv-show:cue:photopizza.controller:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "слайдером PhotoSnail и моторизированной панорамной головкой"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.controller"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.controller:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.controller",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "слайдером PhotoSnail и моторизированной панорамной головкой"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/f1cB4X1wI50"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:08"
        }
      ],
      "id": "cv-show:cue:photopizza.video-03:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "простой вариант платформы из доступных деталей"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/youtube/f1cB4X1wI50"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-03:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-03",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "простой вариант платформы из доступных деталей"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/cFPJqtcWNSU"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:09"
        }
      ],
      "id": "cv-show:cue:photopizza.video-04:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Позже PhotoPizza стала опенсорс проектом"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/youtube/cFPJqtcWNSU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-04:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-04",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Позже PhotoPizza стала опенсорс проектом"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/HeLMIjuMZac"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:10"
        }
      ],
      "id": "cv-show:cue:photopizza.video-05:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "с телефона по вай фай можно было управлять"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/youtube/HeLMIjuMZac"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-05:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-05",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "с телефона по вай фай можно было управлять"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/ims/spinner"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:11"
        }
      ],
      "id": "cv-show:cue:photopizza.spinner:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "результат масштабирования технологии на крупные объекты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2850,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "media/photopizza/ims/spinner"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.spinner:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.spinner",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "результат масштабирования технологии на крупные объекты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/index"
      },
      "dependsOn": [],
      "id": "cv-show:cue:finale.map",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.map.historical-branch"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:finale:01"
        }
      ],
      "id": "cv-show:cue:finale.history:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Но для меня это один тип работы"
        },
        "gestureDurationMs": 1500,
        "leadMs": 3150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "portfolio.map.historical-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.history:scroll"
        }
      ],
      "id": "cv-show:cue:finale.history",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Но для меня это один тип работы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.map.engineering-scale-route"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:finale:02"
        }
      ],
      "id": "cv-show:cue:finale.scale-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Проверяю идеи на практике"
        },
        "gestureDurationMs": 1500,
        "leadMs": 3200,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "finale-scale"
        },
        "kind": "annotation",
        "targetId": "portfolio.map.engineering-scale-route"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.scale-route:scroll"
        }
      ],
      "id": "cv-show:cue:finale.scale-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Проверяю идеи на практике"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:finale:03"
        }
      ],
      "id": "cv-show:cue:finale.workspace:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "это Symbiote Workspace"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.workspace:scroll"
        }
      ],
      "id": "cv-show:cue:finale.workspace",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "это Symbiote Workspace"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "chat.actions.finale"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:finale:04"
        }
      ],
      "id": "cv-show:cue:finale.actions:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь можно подробнее посмотреть мои проекты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "chat.actions.finale"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.actions:scroll"
        }
      ],
      "id": "cv-show:cue:finale.actions",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь можно подробнее посмотреть мои проекты"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "profile.contacts"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:finale:05"
        }
      ],
      "id": "cv-show:cue:finale.contacts:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "связаться со мной"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "profile.contacts"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.contacts:scroll"
        }
      ],
      "id": "cv-show:cue:finale.contacts",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "связаться со мной"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [],
      "id": "cv-show:cue:workspace-details.flow-frame",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:workspace-details:01"
        }
      ],
      "id": "cv-show:cue:workspace-details.flow-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент выбирает подходящие готовые блоки"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "workspace-config-flow"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-route:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.flow-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент выбирает подходящие готовые блоки"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.config-artifact"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:workspace-details:02"
        }
      ],
      "id": "cv-show:cue:workspace-details.artifact:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Конфигурацию можно изменять уже во время работы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.config-artifact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.artifact:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.artifact",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Конфигурацию можно изменять уже во время работы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.host-examples"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:workspace-details:03"
        }
      ],
      "id": "cv-show:cue:workspace-details.hosts:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Они остаются на стороне хоста"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.host-examples"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.hosts:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.hosts",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Они остаются на стороне хоста"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.programmatic-composition"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-ui-details.composition",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3150,
        "leadMs": 3750,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.provider-catalog"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui-details:01"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.catalog:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "публиковать свою роль, состояние"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-ui.provider-catalog"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.catalog:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.catalog",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "публиковать свою роль, состояние"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.manifest-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui-details:02"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.manifest:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "манифесты и семантические контракты"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.manifest-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.manifest:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.manifest",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "манифесты и семантические контракты"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.workspace-link"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-ui-details:03"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.workspace-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace использует этот каталог"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "arrow",
          "series": "symbiote-ui-workspace"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-ui.workspace-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.workspace-route:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.workspace-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace использует этот каталог"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-engine.layer-diagram"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-engine-details.layers",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-engine-details:01"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.execution:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Продукт может собрать свой процесс"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.execution:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.execution",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Продукт может собрать свой процесс"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:symbiote-engine-details:02"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace затем связывает этот процесс"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.demo:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace затем связывает этот процесс"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.workspace-gallery"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-portal-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3300,
        "leadMs": 3900,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.kanban-board"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal-details:01"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.board:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Карточка здесь не просто запись о задаче"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.kanban-board"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.board:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.board",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Карточка здесь не просто запись о задаче"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.column-settings"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal-details:02"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.settings:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Каждая колонка может запускать свой этап"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.column-settings"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.settings:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.settings",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Каждая колонка может запускать свой этап"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.process-diagram"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal-details:03"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.architecture:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для задач с кодом система"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.process-diagram"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.architecture:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.architecture",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для задач с кодом система"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.resource-groups"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-portal-details:04"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.resource-groups:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Модели, аккаунты и подписки"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.resource-groups"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.resource-groups:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.resource-groups",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Модели, аккаунты и подписки"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [],
      "id": "cv-show:cue:video-studio-details.flow",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:video-studio-details:01"
        }
      ],
      "id": "cv-show:cue:video-studio-details.route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "движок превращает его в реальные рабочие представления"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "video-studio-flow"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.route:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio-details.route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "движок превращает его в реальные рабочие представления"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:video-studio-details:02"
        }
      ],
      "id": "cv-show:cue:video-studio-details.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "запустить живой предпросмотр"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.demo:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio-details.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "запустить живой предпросмотр"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.work-order-demo"
      },
      "dependsOn": [],
      "id": "cv-show:cue:maximo-details.work-order",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3300,
        "leadMs": 3900,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:maximo-workbench-details:01"
        }
      ],
      "id": "cv-show:cue:maximo-details.asset:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Панели связывают заявки, активы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.asset:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.asset",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Панели связывают заявки, активы"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.safe-actions"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:maximo-workbench-details:02"
        }
      ],
      "id": "cv-show:cue:maximo-details.actions:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Интерфейс объявляет, что можно сделать"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.safe-actions"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.actions:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.actions",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Интерфейс объявляет, что можно сделать"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-pool-mcp.execution-runtime"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-pool-details.runtime",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.work-branch"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-pool-details:01"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.work:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "поручить реализацию одному агенту"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "agent-pool-review"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.work-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.work:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.work",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "поручить реализацию одному агенту"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.review-branch"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-pool-details:02"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.review:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "независимую проверку результата другому"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "agent-pool-review"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.review-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.review:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.review",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "независимую проверку результата другому"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.result"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:agent-pool-details:03"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.result:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общий структурированный ответ"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "agent-pool-review"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.result:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.result",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общий структурированный ответ"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.repository-root"
      },
      "dependsOn": [],
      "id": "cv-show:cue:project-graph-details.root",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.compact-skeleton"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-details:01"
        }
      ],
      "id": "cv-show:cue:project-graph-details.skeleton:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "скелеты кода, компактная карта"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.compact-skeleton"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.skeleton:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.skeleton",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "скелеты кода, компактная карта"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-details:02"
        }
      ],
      "id": "cv-show:cue:project-graph-details.fact:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "факты браузерной или другой внешней проверки"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.fact:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.fact",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "факты браузерной или другой внешней проверки"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.focus-zone"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:project-graph-details:03"
        }
      ],
      "id": "cv-show:cue:project-graph-details.focus:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "уже сфокусированный контекст"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.focus-zone"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.focus:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.focus",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "уже сфокусированный контекст"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [],
      "id": "cv-show:cue:lifecycle-details.product",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-platform-details:01"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.runtime:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Эй пи ай и база PostgreSQL"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.runtime:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.runtime",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Эй пи ай и база PostgreSQL"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.delivery-ops"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-platform-details:02"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.delivery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляли пулами джи эс эм модемов"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.delivery-ops"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.delivery:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.delivery",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляли пулами джи эс эм модемов"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.delivery-flow"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-platform-details:03"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "очередь, повторяемое выполнение"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "lifecycle-delivery"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.delivery-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.route:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "очередь, повторяемое выполнение"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:lifecycle-platform-details:04"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.twin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "локальный Digital Twin"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "parallel-route",
          "series": "lifecycle-twin"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.twin:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.twin",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "локальный Digital Twin"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.media-gallery"
      },
      "dependsOn": [],
      "id": "cv-show:cue:mobile-smm-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.schedule"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:01"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.schedule:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сервер управляет расписанием, очередью"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.schedule"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.schedule:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.schedule",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сервер управляет расписанием, очередью"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.queue"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:02"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.queue:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "подготовленный джейсон сценарий"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.queue"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.queue:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.queue",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "подготовленный джейсон сценарий"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.ui-change-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:03"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.ui-change:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "структура экрана больше не соответствует"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.ui-change-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.ui-change:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.ui-change",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "структура экрана больше не соответствует"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.local-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:04"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.draft:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Этот вариант сначала передаётся на проверку"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.local-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.draft:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.draft",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Этот вариант сначала передаётся на проверку"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.approval-log"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:05"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.approval:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "лимиты, устойчивую дедупликацию и подтверждение"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.approval-log"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.approval:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.approval",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "лимиты, устойчивую дедупликацию и подтверждение"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [],
      "id": "cv-show:cue:f360-details.path",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-one"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:f360-details:01"
        }
      ],
      "id": "cv-show:cue:f360-details.result-one:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Публичные примеры этой работы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-one"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.result-one:scroll"
        }
      ],
      "id": "cv-show:cue:f360-details.result-one",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Публичные примеры этой работы"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-two"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:f360-details:02"
        }
      ],
      "id": "cv-show:cue:f360-details.period:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "завершилась в две тысячи двадцать втором году"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-two"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.period:scroll"
        }
      ],
      "id": "cv-show:cue:f360-details.period",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "завершилась в две тысячи двадцать втором году"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "none",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [],
      "id": "cv-show:cue:autobox-details.working-system",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox-details:01"
        }
      ],
      "id": "cv-show:cue:autobox-details.working-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Рабочая система управляла камерой"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "autobox-working"
        },
        "kind": "annotation",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-route:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.working-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Рабочая система управляла камерой"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.netsuke-video"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox-details:02"
        }
      ],
      "id": "cv-show:cue:autobox-details.video:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собственноручно сканировал японские нэцкэ"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.autobox-v1.netsuke-video"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.video:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.video",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собственноручно сканировал японские нэцкэ"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.benin-bronze"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:autobox-details:03"
        }
      ],
      "id": "cv-show:cue:autobox-details.bronze:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "характер поверхности бенинской бронзы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.benin-bronze"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.bronze:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.bronze",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "характер поверхности бенинской бронзы"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.transparent-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:complexscan-details.platform",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.controlled-light"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan-details:01"
        }
      ],
      "id": "cv-show:cue:complexscan-details.light:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "стабильная механика и управляемый свет"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.controlled-light"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.light:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.light",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "стабильная механика и управляемый свет"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-gallery"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan-details:02"
        }
      ],
      "id": "cv-show:cue:complexscan-details.gallery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собирал прототипы и первые изделия"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.gallery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собирал прототипы и первые изделия"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.autobox-museum-link"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:complexscan-details:03"
        }
      ],
      "id": "cv-show:cue:complexscan-details.autobox:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "музейного направления Auto Box"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "emphasize",
          "marker": "route",
          "series": "complexscan-applications"
        },
        "kind": "annotation",
        "targetId": "article.complexscan.autobox-museum-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.autobox:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.autobox",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "музейного направления Auto Box"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "none",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [],
      "id": "cv-show:cue:photopizza-details.origin",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3150,
        "leadMs": 3750,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-attribution"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza-details:01"
        }
      ],
      "id": "cv-show:cue:photopizza-details.attribution:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Один универсальный контроллер подключался"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.controller-attribution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.attribution:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.attribution",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Один универсальный контроллер подключался"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.assembly-calibration"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza-details:02"
        }
      ],
      "id": "cv-show:cue:photopizza-details.documentation:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "описывал сборку и калибровку"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.assembly-calibration"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.documentation:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.documentation",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "описывал сборку и калибровку"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-media"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza-details:03"
        }
      ],
      "id": "cv-show:cue:photopizza-details.media:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "продолжил развивать управляющее программное обеспечение"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-media"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.media:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.media",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "продолжил развивать управляющее программное обеспечение"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.agentic-eam-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:adaptive-maximo-workbench:03"
        }
      ],
      "id": "cv-show:cue:maximo.agentic-demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В этом демо я показываю следующий шаг"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.agentic-eam-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.agentic-demo:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.agentic-demo",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В этом демо я показываю следующий шаг"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.xr-eam-example"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:adaptive-maximo-workbench:04"
        }
      ],
      "id": "cv-show:cue:maximo.xr-demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "А здесь я развиваю ту же идею в икс ар пространстве"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.xr-eam-example"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.xr-demo:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.xr-demo",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "А здесь я развиваю ту же идею в икс ар пространстве"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.agentic-eam-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:maximo-workbench-details:03"
        }
      ],
      "id": "cv-show:cue:maximo-details.demo-1:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Поэтому это демо для меня не только пример интерфейса"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.agentic-eam-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.demo-1:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.demo-1",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Поэтому это демо для меня не только пример интерфейса"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.xr-eam-example"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:maximo-workbench-details:04"
        }
      ],
      "id": "cv-show:cue:maximo-details.demo-xr:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Икс ар версия проверяет тот же принцип"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.xr-eam-example"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.demo-xr:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.demo-xr",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Икс ар версия проверяет тот же принцип"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 0,
        "sourceOutMs": 24860
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.open"
        }
      ],
      "id": "cv-show:audio-clip:positioning:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 24860,
        "sourceOutMs": 55600
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.tenure-marker"
        }
      ],
      "id": "cv-show:audio-clip:positioning:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 24860
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 55600,
        "sourceOutMs": 57310
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.workspace-transition"
        }
      ],
      "id": "cv-show:audio-clip:positioning:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 55600
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 0,
        "sourceOutMs": 7500
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.open"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-workspace:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 7500,
        "sourceOutMs": 49520
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.intro-frame"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-workspace:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 7500
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 49520,
        "sourceOutMs": 60800
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.portable-config"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-workspace:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 49520
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 60800,
        "sourceOutMs": 63200
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.agent-portal-card"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-workspace:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 60800
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 0,
        "sourceOutMs": 11160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.open"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 11160,
        "sourceOutMs": 45520
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.graph-tooling"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 11160
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 45520,
        "sourceOutMs": 52820
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.current-show"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 45520
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 52820,
        "sourceOutMs": 58460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.show-player-pointer"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 52820
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 58460,
        "sourceOutMs": 63060
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.github-link"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 58460
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 63060,
        "sourceOutMs": 64510
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.details-pointer"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 63060
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 0,
        "sourceOutMs": 12700
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.open"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 12700,
        "sourceOutMs": 17940
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.intro"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 12700
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 17940,
        "sourceOutMs": 22880
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.workspace-join"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 17940
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 0,
        "sourceOutMs": 11640
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.open"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 11640,
        "sourceOutMs": 22240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.path"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 11640
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 22240,
        "sourceOutMs": 37280
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.human-decision"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 22240
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 37280,
        "sourceOutMs": 41080
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.open-source"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 37280
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 41080,
        "sourceOutMs": 48660
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.github-link"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 41080
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 48660,
        "sourceOutMs": 52060
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.demo-link"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 48660
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 0,
        "sourceOutMs": 14280
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.open"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-video-studio:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 14280,
        "sourceOutMs": 18400
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.visible-process"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-video-studio:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 14280
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 18400,
        "sourceOutMs": 25160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.demo"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-video-studio:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 18400
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 0,
        "sourceOutMs": 22860
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.open"
        }
      ],
      "id": "cv-show:audio-clip:adaptive-maximo-workbench:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 22860,
        "sourceOutMs": 35360
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.work-orders"
        }
      ],
      "id": "cv-show:audio-clip:adaptive-maximo-workbench:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 22860
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 35360,
        "sourceOutMs": 37840
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.asset-context"
        }
      ],
      "id": "cv-show:audio-clip:adaptive-maximo-workbench:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 35360
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 37840,
        "sourceOutMs": 49640
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.agentic-demo"
        }
      ],
      "id": "cv-show:audio-clip:adaptive-maximo-workbench:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 37840
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 49640,
        "sourceOutMs": 68020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.xr-demo"
        }
      ],
      "id": "cv-show:audio-clip:adaptive-maximo-workbench:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 49640
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 15480
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool.open"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-mcp:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-mcp",
        "sourceInMs": 15480,
        "sourceOutMs": 23680
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool.flow"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-mcp:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 15480
        }
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 12040
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.open"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-mcp:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 12040,
        "sourceOutMs": 21720
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.example"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-mcp:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 12040
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 21720,
        "sourceOutMs": 24580
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.context"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-mcp:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 21720
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 24580,
        "sourceOutMs": 29820
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.node"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-mcp:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 24580
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 0,
        "sourceOutMs": 7160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.open"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-messaging-platform:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 7160,
        "sourceOutMs": 12300
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.scope"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-messaging-platform:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 7160
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 12300,
        "sourceOutMs": 21460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.product-number"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-messaging-platform:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 12300
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 21460,
        "sourceOutMs": 31820
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.runtime-number"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-messaging-platform:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 21460
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 31820,
        "sourceOutMs": 36910
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.digital-twin"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-messaging-platform:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 31820
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 0,
        "sourceOutMs": 8360
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.open"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-platform:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 8360,
        "sourceOutMs": 16080
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.overview"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-platform:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 8360
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 16080,
        "sourceOutMs": 23920
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.stable-path"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-platform:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 16080
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 23920,
        "sourceOutMs": 36990
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.agent-update"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-platform:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 23920
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 0,
        "sourceOutMs": 19160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.open"
        }
      ],
      "id": "cv-show:audio-clip:f360-studio:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 19160,
        "sourceOutMs": 23540
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.process"
        }
      ],
      "id": "cv-show:audio-clip:f360-studio:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 19160
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 23540,
        "sourceOutMs": 34500
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.result"
        }
      ],
      "id": "cv-show:audio-clip:f360-studio:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 23540
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 0,
        "sourceOutMs": 41020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.open"
        }
      ],
      "id": "cv-show:audio-clip:autobox:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 41020,
        "sourceOutMs": 49620
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-01"
        }
      ],
      "id": "cv-show:audio-clip:autobox:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 41020
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 49620,
        "sourceOutMs": 54980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-02"
        }
      ],
      "id": "cv-show:audio-clip:autobox:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 49620
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 54980,
        "sourceOutMs": 59600
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-03"
        }
      ],
      "id": "cv-show:audio-clip:autobox:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 54980
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 59600,
        "sourceOutMs": 64800
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-04"
        }
      ],
      "id": "cv-show:audio-clip:autobox:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 59600
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 64800,
        "sourceOutMs": 69900
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-05"
        }
      ],
      "id": "cv-show:audio-clip:autobox:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 64800
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 69900,
        "sourceOutMs": 71500
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-06"
        }
      ],
      "id": "cv-show:audio-clip:autobox:07",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 69900
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 71500,
        "sourceOutMs": 73020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-07"
        }
      ],
      "id": "cv-show:audio-clip:autobox:08",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 71500
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 73020,
        "sourceOutMs": 74320
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-08"
        }
      ],
      "id": "cv-show:audio-clip:autobox:09",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 73020
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 74320,
        "sourceOutMs": 75980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-09"
        }
      ],
      "id": "cv-show:audio-clip:autobox:10",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 74320
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 0,
        "sourceOutMs": 7240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.open"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 7240,
        "sourceOutMs": 31940
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.line"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 7240
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 31940,
        "sourceOutMs": 45020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-01"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 31940
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 45020,
        "sourceOutMs": 62980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-02"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 45020
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 62980,
        "sourceOutMs": 73820
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.delivery"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 62980
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 73820,
        "sourceOutMs": 94300
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-open"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 73820
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 94300,
        "sourceOutMs": 120920
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-gallery"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:07",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 94300
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 120920,
        "sourceOutMs": 122570
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-catalog-ready"
        }
      ],
      "id": "cv-show:audio-clip:complexscan:08",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 120920
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 0,
        "sourceOutMs": 8140
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.open"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 8140,
        "sourceOutMs": 41880
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.origin"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 8140
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 41880,
        "sourceOutMs": 74260
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.megavisor-promo"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 41880
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 74260,
        "sourceOutMs": 90240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.page-open"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 74260
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 90240,
        "sourceOutMs": 98480
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-01"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 90240
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 98480,
        "sourceOutMs": 109160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-02"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 98480
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 109160,
        "sourceOutMs": 136220
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.mechanics"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:07",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 109160
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 136220,
        "sourceOutMs": 144200
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.controller"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:08",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 136220
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 144200,
        "sourceOutMs": 151120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-03"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:09",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 144200
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 151120,
        "sourceOutMs": 157140
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-04"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:10",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 151120
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 157140,
        "sourceOutMs": 162460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-05"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:11",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 157140
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 162460,
        "sourceOutMs": 175460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.spinner"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:12",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 162460
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 0,
        "sourceOutMs": 4220
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.map"
        }
      ],
      "id": "cv-show:audio-clip:finale:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 4220,
        "sourceOutMs": 20040
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.history"
        }
      ],
      "id": "cv-show:audio-clip:finale:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 4220
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 20040,
        "sourceOutMs": 56360
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.scale-route"
        }
      ],
      "id": "cv-show:audio-clip:finale:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 20040
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 56360,
        "sourceOutMs": 71900
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.workspace"
        }
      ],
      "id": "cv-show:audio-clip:finale:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 56360
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 71900,
        "sourceOutMs": 77120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.actions"
        }
      ],
      "id": "cv-show:audio-clip:finale:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 71900
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 77120,
        "sourceOutMs": 78210
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.contacts"
        }
      ],
      "id": "cv-show:audio-clip:finale:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 77120
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 0,
        "sourceOutMs": 14100
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-frame"
        }
      ],
      "id": "cv-show:audio-clip:workspace-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 14100,
        "sourceOutMs": 30600
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-route"
        }
      ],
      "id": "cv-show:audio-clip:workspace-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 14100
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 30600,
        "sourceOutMs": 56480
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.artifact"
        }
      ],
      "id": "cv-show:audio-clip:workspace-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 30600
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 56480,
        "sourceOutMs": 81330
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.hosts"
        }
      ],
      "id": "cv-show:audio-clip:workspace-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 56480
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 0,
        "sourceOutMs": 13820
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.composition"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 13820,
        "sourceOutMs": 18660
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.catalog"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 13820
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 18660,
        "sourceOutMs": 36660
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.manifest"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 18660
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 36660,
        "sourceOutMs": 70750
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.workspace-route"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-ui-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 36660
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 0,
        "sourceOutMs": 16220
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.layers"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 16220,
        "sourceOutMs": 20200
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.execution"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 16220
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 20200,
        "sourceOutMs": 43950
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.demo"
        }
      ],
      "id": "cv-show:audio-clip:symbiote-engine-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 20200
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 0,
        "sourceOutMs": 4060
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.gallery"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 4060,
        "sourceOutMs": 9120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.board"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 4060
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 9120,
        "sourceOutMs": 21840
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.settings"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 9120
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 21840,
        "sourceOutMs": 46120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.architecture"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 21840
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 46120,
        "sourceOutMs": 66800
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.resource-groups"
        }
      ],
      "id": "cv-show:audio-clip:agent-portal-details:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 46120
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 0,
        "sourceOutMs": 14460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.flow"
        }
      ],
      "id": "cv-show:audio-clip:video-studio-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 14460,
        "sourceOutMs": 21400
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.route"
        }
      ],
      "id": "cv-show:audio-clip:video-studio-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 14460
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 21400,
        "sourceOutMs": 47120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.demo"
        }
      ],
      "id": "cv-show:audio-clip:video-studio-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 21400
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 0,
        "sourceOutMs": 5540
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.work-order"
        }
      ],
      "id": "cv-show:audio-clip:maximo-workbench-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 5540,
        "sourceOutMs": 25020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.asset"
        }
      ],
      "id": "cv-show:audio-clip:maximo-workbench-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 5540
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 25020,
        "sourceOutMs": 44700
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.actions"
        }
      ],
      "id": "cv-show:audio-clip:maximo-workbench-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 25020
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 44700,
        "sourceOutMs": 52160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.demo-1"
        }
      ],
      "id": "cv-show:audio-clip:maximo-workbench-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 44700
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 52160,
        "sourceOutMs": 76130
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.demo-xr"
        }
      ],
      "id": "cv-show:audio-clip:maximo-workbench-details:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 52160
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 0,
        "sourceOutMs": 21520
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.runtime"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 21520,
        "sourceOutMs": 24380
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.work"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 21520
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 24380,
        "sourceOutMs": 43200
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.review"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 24380
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 43200,
        "sourceOutMs": 54110
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.result"
        }
      ],
      "id": "cv-show:audio-clip:agent-pool-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 43200
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 0,
        "sourceOutMs": 7880
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.root"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 7880,
        "sourceOutMs": 27240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.skeleton"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 7880
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 27240,
        "sourceOutMs": 44080
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.fact"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 27240
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 44080,
        "sourceOutMs": 58160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.focus"
        }
      ],
      "id": "cv-show:audio-clip:project-graph-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 44080
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 0,
        "sourceOutMs": 9460
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.product"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-platform-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 9460,
        "sourceOutMs": 19660
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.runtime"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-platform-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 9460
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 19660,
        "sourceOutMs": 40240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.delivery"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-platform-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 19660
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 40240,
        "sourceOutMs": 56300
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.route"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-platform-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 40240
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 56300,
        "sourceOutMs": 63800
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.twin"
        }
      ],
      "id": "cv-show:audio-clip:lifecycle-platform-details:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 56300
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 0,
        "sourceOutMs": 5160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.gallery"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 5160,
        "sourceOutMs": 13400
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.schedule"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 5160
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 13400,
        "sourceOutMs": 27360
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.queue"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 13400
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 27360,
        "sourceOutMs": 42520
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.ui-change"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 27360
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 42520,
        "sourceOutMs": 47240
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.draft"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 42520
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 47240,
        "sourceOutMs": 65450
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.approval"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 47240
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 0,
        "sourceOutMs": 38980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.path"
        }
      ],
      "id": "cv-show:audio-clip:f360-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 38980,
        "sourceOutMs": 52580
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.result-one"
        }
      ],
      "id": "cv-show:audio-clip:f360-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 38980
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 52580,
        "sourceOutMs": 57410
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.period"
        }
      ],
      "id": "cv-show:audio-clip:f360-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 52580
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 0,
        "sourceOutMs": 17440
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-system"
        }
      ],
      "id": "cv-show:audio-clip:autobox-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 17440,
        "sourceOutMs": 83320
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-route"
        }
      ],
      "id": "cv-show:audio-clip:autobox-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 17440
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 83320,
        "sourceOutMs": 107160
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.video"
        }
      ],
      "id": "cv-show:audio-clip:autobox-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 83320
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 107160,
        "sourceOutMs": 125640
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.bronze"
        }
      ],
      "id": "cv-show:audio-clip:autobox-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 107160
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 0,
        "sourceOutMs": 15420
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.platform"
        }
      ],
      "id": "cv-show:audio-clip:complexscan-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 15420,
        "sourceOutMs": 35220
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.light"
        }
      ],
      "id": "cv-show:audio-clip:complexscan-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 15420
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 35220,
        "sourceOutMs": 73670
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.gallery"
        }
      ],
      "id": "cv-show:audio-clip:complexscan-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 35220
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 73670,
        "sourceOutMs": 158100
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.autobox"
        }
      ],
      "id": "cv-show:audio-clip:complexscan-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 73670
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 0,
        "sourceOutMs": 153440
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.origin"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:01",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 153440,
        "sourceOutMs": 167480
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.attribution"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:02",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 153440
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 167480,
        "sourceOutMs": 176260
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.documentation"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 167480
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 176260,
        "sourceOutMs": 191650
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.media"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 176260
        }
      },
      "turnId": "photopizza-details"
    }
  ],
  "id": "cv-show",
  "layers": [
    {
      "collisionDomainId": null,
      "id": "cv-show:layer:narration",
      "kind": "narration",
      "name": "Narration",
      "visualOwnerId": null
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:focus",
      "kind": "focus",
      "name": "Focus",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:annotation",
      "kind": "annotation",
      "name": "Annotation",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:interaction",
      "kind": "interaction",
      "name": "Interaction",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": null,
      "id": "cv-show:layer:state",
      "kind": "state",
      "name": "State",
      "visualOwnerId": null
    },
    {
      "collisionDomainId": null,
      "id": "cv-show:layer:audio",
      "kind": "audio",
      "name": "Narration audio",
      "visualOwnerId": null
    }
  ],
  "policy": {
    "collisionDomains": [
      {
        "exclusive": true,
        "id": "cv-show:presenter-gesture",
        "name": "CV Show presenter gesture"
      }
    ],
    "visualOwnerId": "cv-show:presenter"
  },
  "revision": 97,
  "schemaVersion": "workspace-presentation-authoring-project-v2",
  "script": {
    "grounding": {
      "sources": []
    },
    "locale": "ru",
    "metadata": {
      "cvShow": {
        "contractRevision": "34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
        "conversationRevision": "cv-show-agent-context-v1",
        "directives": {
          "cv-show:cue:agent-pool-details.result": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool-details.review": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool-details.runtime": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool-details.work": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool.flow": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.architecture": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.board": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.gallery": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-kanban-gallery"
            }
          },
          "cv-show:cue:agent-portal-details.resource-groups": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.settings": {
            "policy": "optional",
            "refinements": {
              "safePath": "open-readonly-settings"
            }
          },
          "cv-show:cue:agent-portal.demo-link": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.github-link": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.human-decision": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.open-source": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.path": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox-details.bronze": {
            "policy": "optional",
            "refinements": {
              "safePath": "rotate-interactive-model"
            }
          },
          "cv-show:cue:autobox-details.video": {
            "policy": "optional",
            "refinements": {}
          },
          "cv-show:cue:autobox-details.working-route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox-details.working-system": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-01": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-02": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-03": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-04": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-05": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-06": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-07": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-08": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-09": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan-details.autobox": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan-details.gallery": {
            "policy": "required",
            "refinements": {
              "safePath": "prototype-product-packaging-delivery"
            }
          },
          "cv-show:cue:complexscan-details.light": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan-details.platform": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.boothbot-catalog-ready": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.boothbot-gallery": {
            "policy": "required",
            "refinements": {
              "finalFrame": 5,
              "frameHoldMs": 250,
              "frames": [
                1,
                2,
                3,
                4,
                5
              ],
              "mode": "short-muted-montage",
              "safePath": "boothbot-five-frame-gallery-sequence"
            }
          },
          "cv-show:cue:complexscan.boothbot-open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.delivery": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "доставки клиентам в разные страны"
            }
          },
          "cv-show:cue:complexscan.line": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.video-01": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.video-02": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360-details.path": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360-details.period": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "2021–2022 годах"
            }
          },
          "cv-show:cue:f360-details.result-one": {
            "policy": "required",
            "refinements": {
              "safePath": "open-source-backed-result"
            }
          },
          "cv-show:cue:f360.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360.process": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360.result": {
            "policy": "required",
            "refinements": {
              "safePath": "open-source-backed-result"
            }
          },
          "cv-show:cue:finale.actions": {
            "policy": "required",
            "refinements": {
              "actions": [
                "projects",
                "resume",
                "contact"
              ],
              "persistent": true
            }
          },
          "cv-show:cue:finale.contacts": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.history": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.map": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.scale-route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.workspace": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.delivery": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.product": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.runtime": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.twin": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.digital-twin": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.product-number": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.runtime-number": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.scope": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "клиентских коммуникаций на основе согласия"
            }
          },
          "cv-show:cue:maximo-details.actions": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.asset": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.demo-1": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.demo-xr": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.work-order": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-work-order"
            }
          },
          "cv-show:cue:maximo.agentic-demo": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.asset-context": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.work-orders": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.xr-demo": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.approval": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.draft": {
            "policy": "required",
            "refinements": {
              "safePath": "draft-test-target-approval-dry-run"
            }
          },
          "cv-show:cue:mobile-smm-details.gallery": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.queue": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.schedule": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.ui-change": {
            "policy": "required",
            "refinements": {
              "safePath": "stop-analyze-propose-for-review"
            }
          },
          "cv-show:cue:mobile-smm.agent-update": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm.overview": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm.stable-path": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza-details.attribution": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza-details.documentation": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza-details.media": {
            "policy": "required",
            "refinements": {
              "safePath": "open-three-controller-media"
            }
          },
          "cv-show:cue:photopizza-details.origin": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "доступный, быстрый и повторяемый способ"
            }
          },
          "cv-show:cue:photopizza.controller": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.mechanics": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.megavisor-promo": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.origin": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "внутри проекта MEGAVISOR"
            }
          },
          "cv-show:cue:photopizza.page-open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.spinner": {
            "policy": "required",
            "refinements": {
              "playOnSettle": true
            }
          },
          "cv-show:cue:photopizza.video-01": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.video-02": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.video-03": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.video-04": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.video-05": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:positioning.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:positioning.tenure-marker": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:positioning.workspace-transition": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.fact": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "проверяемые браузерные факты"
            }
          },
          "cv-show:cue:project-graph-details.focus": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.root": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.skeleton": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph.context": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "компактный структурированный инженерный контекст"
            }
          },
          "cv-show:cue:project-graph.example": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph.node": {
            "policy": "optional",
            "refinements": {
              "safePath": "expand-readonly-node"
            }
          },
          "cv-show:cue:project-graph.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine-details.demo": {
            "policy": "optional",
            "refinements": {
              "safePath": "open-readonly-execution"
            }
          },
          "cv-show:cue:symbiote-engine-details.execution": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "компонуемые серверные примитивы"
            }
          },
          "cv-show:cue:symbiote-engine-details.layers": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.intro": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.workspace-join": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui-details.catalog": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui-details.composition": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "интерфейсы должны быть компонуемыми программно"
            }
          },
          "cv-show:cue:symbiote-ui-details.manifest": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-manifest"
            }
          },
          "cv-show:cue:symbiote-ui-details.workspace-route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.current-show": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.details-pointer": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.github-link": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.graph-tooling": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.show-player-pointer": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio-details.demo": {
            "policy": "required",
            "refinements": {
              "safePath": "graph-timeline-preview"
            }
          },
          "cv-show:cue:video-studio-details.flow": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio-details.route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio.demo": {
            "policy": "required",
            "refinements": {
              "safePath": "graph-timeline-preview"
            }
          },
          "cv-show:cue:video-studio.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio.visible-process": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "один видимый процесс"
            }
          },
          "cv-show:cue:workspace-details.artifact": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace-details.flow-frame": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace-details.flow-route": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace-details.hosts": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.agent-portal-card": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.intro-frame": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.portable-config": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "переносимая исполняемая конфигурация"
            }
          }
        },
        "entries": {
          "adaptive-maximo-workbench": {
            "branchId": "maximo-workbench-details",
            "chat": {
              "actionLabel": "Подробнее об Adaptive Maximo Workbench",
              "text": "Показываю корпоративный Demo/Alpha-кейс Adaptive Maximo Workbench."
            },
            "media": {
              "durationMilliseconds": 68020,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-0+z4G7/IJ7nACxNkxMs3I19CHVUpQkuu2/OwVrb1YyU=",
              "sourceAlignmentFileHash": "sha256:0f5eb6bf1ef88028928db06708a4356165ec1b8aa89bf914af2f6eb5afd9ef37",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-SHm77bXYF8kqMIxUhQmczhiwbVUqeoruCJchEVo5Adw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-c5hW+84A+bhUtdeRyeHQtaOVxTFtiXBD8P+RRStKsAU=",
              "wavHash": "sha256:b602e0eae7fd39ea5e6ba12a241e5abc4e6a93b1350d3772c349d89d0619bde0"
            },
            "period": "Date pending",
            "projectId": "projects/adaptive-maximo-workbench",
            "return": null,
            "subtitle": "Следующий пример — Adaptive Maximo Workbench. Он показывает, как заявки, оборудование, локации, бригады и доступные действия собираются в одном рабочем пространстве с общим актуальным контекстом. Сейчас это демонстрационный проект на стадии альфа-версии, показывающий возможности Workspace. Подключение к реальной системе Maximo выполняется как отдельная интеграция.",
            "title": "Adaptive Maximo Workbench"
          },
          "agent-pool-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Agent Pool MCP."
            },
            "media": {
              "durationMilliseconds": 54110,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-lzch1FaG6oWnRND4LR1gYhbSuyqWDf1HksWYFMYte7c=",
              "sourceAlignmentFileHash": "sha256:4425351b4e23d464f6a19127774528451cd3a25d25f06c79f19aafb3b5866d5e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-0Z1tk1HGgpGaYVlvrYY1f4Y1PPR0I9TZ7/I3z6NPJR0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-A27lvUEMCAnu35D89uCm3iITFi2BVW8wAUxXFcgdFb4=",
              "wavHash": "sha256:6488aa70024768dea858fe073fddac9d8449e3200215de53d61473a0681febea"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.agent-pool",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я создавал Agent Pool MCP как независимый слой исполнения для разных CLI-агентов и моделей. Он поддерживает параллельные задачи, последовательные pipelines, handoff сессий, политики и группы ресурсов. Один процесс может поручить реализацию одному агенту, а независимую проверку — другому. В сценариях cross-model peer review агенты разных провайдеров сравнивают выводы и возвращают общий структурированный результат.",
            "title": null
          },
          "agent-pool-mcp": {
            "branchId": "agent-pool-details",
            "chat": {
              "actionLabel": "Подробнее об Agent Pool MCP",
              "text": "Показываю исполнительный слой Agent Pool MCP."
            },
            "media": {
              "durationMilliseconds": 23680,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-gGXEwGF9XtDylVdn1bN5VVrB+kbko3gCOzGb2R2bouc=",
              "sourceAlignmentFileHash": "sha256:3521f4458df9806c4a41e5de3557d6b2cf29f6ee49acba536e42913b8d7bc63a",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-oR2K1haOhywFgP/JEyTYSDOXLgKxuxe+Bv890Z22EJE=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-1djkpO1R9wUn79rKrryp40hcRqF7XtrQ34sUDquj2/8=",
              "wavHash": "sha256:8942db1b6b7055d95bf218f88ba01ac12c9d9addfa2bc73cf7423e553daf1a49"
            },
            "period": "2026",
            "projectId": "projects/agent-pool-mcp",
            "return": null,
            "subtitle": "В начале 2026 года Agent Pool MCP оформился как самостоятельный MCP-сервер, который можно напрямую подключить к агенту. В Agent Portal он используется как исполнительный слой: распределяет задачи между агентами, отслеживает владение и состояние, передаёт сессии и маршрутизирует ресурсы.",
            "title": "Agent Pool MCP"
          },
          "agent-portal": {
            "branchId": "agent-portal-details",
            "chat": {
              "actionLabel": "Подробнее об Agent Portal",
              "text": "Показываю Agent Portal и его исполняемый процесс."
            },
            "media": {
              "durationMilliseconds": 52060,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-oRjQ1FIw5xofTRhzcKO8RxwN6TVieihfpY+0CHBTlh4=",
              "sourceAlignmentFileHash": "sha256:5efda7cc62d92bc5282ce39d038bf71df4453ef6cd145d823a63f7008be607ec",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-F4bYdpyipQk9GLvAyClTBk19zAQxxGtEBj0fl8hNpok=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-n+cFJenC43hwh2vI/C6yGxDy2V0ymhJU6/5vrjYiRro=",
              "wavHash": "sha256:d79f643febd6589f8d136cc87bba5fdc6315fd6c48d626bc45995833f655b9c5"
            },
            "period": "2025–2026",
            "projectId": "projects/agent-portal",
            "return": null,
            "subtitle": "Agent Portal — один из проектов, которые я сейчас переношу в Symbiote Workspace как конфигурации. Я развиваю его с начала две тысячи двадцать шестого года. Проект появился как собственный управляющий слой над разными агентными средами — своего рода harness над harnesses. Он объединяет их в один видимый процесс и позволяет сохранять контроль над контекстом, задачами и ресурсами, при этом быстро меняя агентов, модели и способы доступа к ним. Когда я начинал эту линию, я не нашёл готового решения с таким сочетанием возможностей, поэтому стал развивать собственный вариант. Мы решили открыть управляющий контур mcp-agent-portal, хотя развиваем Agent Portal прежде всего для собственной практической работы. Исходный код этого контура доступен на GitHub, а интерфейс Agent Portal можно посмотреть в интерактивном демо. Чтобы показать его внутреннее устройство, дальше я разберу два отдельных инструмента. Agent Pool MCP отвечает за исполнение и распределение ресурсов, а Project Graph MCP — за структуру и контекст проекта.",
            "title": "Agent Portal"
          },
          "agent-portal-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Agent Portal."
            },
            "media": {
              "durationMilliseconds": 66800,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-uF/CYtvvQ0b+2OtL4Yr3Dxf93VG6bzjHjcuLOk86mTA=",
              "sourceAlignmentFileHash": "sha256:fc913e0a7082e6b00d170e5c75011ef17a4ba133a96837764ddf02f3acfc7b20",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-VtZlwIDdHq5cLZg4XnPWemCwqmoPIkVyu8U8v28raNw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-6y9WU8Pi/hFcUSxiBCDt6qa3B04OWfyNdVwDjdprVbk=",
              "wavHash": "sha256:5a03a51ef983db415dab96b96c3740b2cabef4b8c44630b65bed98ba43121b67"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.agent-portal",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Agent Portal — мой проект для управляемой агентной разработки. Я придумал и реализовал его архитектуру, а в работе мы использовали его как общую среду. Его управляющий контур mcp-agent-portal опубликован как open-source проект. В центре находится исполняемая канбан-доска: каждая колонка запускает часть процесса и может получить свои действия, роли и пул специализированных агентов. Для задач с кодом система создаёт изолированную рабочую копию и ветку. Один агент выполняет работу, другой независимо проверяет результат. Успешный аудит открывает путь к публикации, а конфликт переводит карточку к решению человека. Модели и подписки объединяются в группы ресурсов, поэтому этап получает исполнителя с подходящими возможностями и доступным лимитом.",
            "title": null
          },
          "autobox": {
            "branchId": "autobox-details",
            "chat": {
              "actionLabel": "Подробнее об AUTOBOX",
              "text": "Показываю музейную технологию AUTOBOX."
            },
            "media": {
              "durationMilliseconds": 75980,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-LsUOsAWonm1otX2hZhW2CAJ10GQwHXb4eV1ZKz8c+lw=",
              "sourceAlignmentFileHash": "sha256:199a7951c59639332f5867378fd8f0df808f6d4dfdf5661bab777484730ccee0",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-gK8aGyDHQ3AXR9LRVyCrqEWKsXt3rHmQRmGbbsx8C9U=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-zkomZmN06oAPrbuVxzQoPi988lc82oJ+QlQ7yEwH/fk=",
              "wavHash": "sha256:4d9723325b266607651dad591329b89133078fd3131e0edf3d8ac969560516ec"
            },
            "period": "2019–2021",
            "projectId": "projects/autobox-v1",
            "return": null,
            "subtitle": "Перед F360 была музейная технология AUTOBOX, которую я развивал в 2019–2021 годах. Здесь показана предварительная 3D-визуализация оборудования AUTOBOX. Я подготовил её ещё до сборки установки, чтобы представить будущую конструкцию партнёрам, с которыми мы работали над 3D-сканированием музейных объектов в Эрмитаже. Здесь я отлаживаю процесс фотограмметрии на поворотном столе PhotoPizza. Это один из предварительных экспериментов, проведённых до разработки установки для Эрмитажа. Здесь показан промежуточный результат той же отладки в RealityCapture. Слева видны исходные фотографии позолоченного Будды, а в 3D-пространстве я вращаю уже обработанную модель и проверяю результат фотограмметрии перед разработкой оборудования для Эрмитажа. Здесь я собственноручно изготавливаю одну из деталей AUTOBOX v1 — лазером вырезаю вентиляционную сетку для светового модуля. Здесь собранный прототип AUTOBOX v1 сканирует нэцкэ в Эрмитаже. Это вводный ролик эрмитажной серии «Нэцкэ под увеличительным стеклом». Представленные в ней нэцкэ я собственноручно сканировал и визуализировал во время отладки технологии AUTOBOX. Для того же позолоченного Будды я сделал художественную 3D-визуализацию. Она показывает качество сканирования сложного металлического объекта: сохранились мелкие детали, повреждения и царапины. Здесь — художественная визуализация могольского кинжала из собрания Эрмитажа. Сочетание полированного металла, позолоты и инкрустации драгоценными камнями делало его особенно сложным для фотограмметрии, но нам удалось сохранить и форму, и детали разных материалов. Здесь — художественная визуализация головы королевы-матери из Королевства Бенин. Сканирование точно передало сложный рельеф и патину бронзовой поверхности.",
            "title": "AUTOBOX"
          },
          "autobox-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: AUTOBOX."
            },
            "media": {
              "durationMilliseconds": 125640,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-i7GIqYI6KU9gNYLnZjrHdVnxIa53IPyofNED3JQe8dc=",
              "sourceAlignmentFileHash": "sha256:36a9dff35bc1c86fabd07b408c3f0e04d67b81c4c319c456ad39aeca0bc1fda5",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-Mn0vgjAtfh7R+MnnOsdODw+tR58Rf1HJWyFCzUCZlsE=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/a3Nt8xawm6G8HyRYRnTfoFTV9+UQbx7sv70aUkWRYA=",
              "wavHash": "sha256:47ce1a06ab3ad4ef55f3ed436241bdffe3efffb2b4fa745ca0e4fa15fedbd1d3"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.autobox",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Рабочая система управляла камерой, светом и позиционированием. Она сначала снимала полную серию, после чего компьютерное зрение анализировало материал, оценивало резкость и отбирало исходники для построения 3D-модели. Следующий прототип начинал с чернового 3D-сканирования и упрощённой формы предмета. Затем он заранее рассчитывал весь план детальной макросъёмки: зоны, ракурсы, положения камеры, параметры оптики, глубину резкости и перекрытие. Расчёт учитывал сложную геометрию предмета, диапазон механики, габариты камеры, препятствия и безопасное расстояние. После проверки принципа я проектировал дополнительные контуры безопасности, включая лидарный контроль расстояния на случай смещения предмета. Этот слой остался следующим этапом разработки. Система AUTOBOX уже применялась в музеях. В Эрмитаже я сканировал японские нэцкэ, а технологическая линия применялась для бенинской бронзы в Кунсткамере.",
            "title": null
          },
          "complexscan": {
            "branchId": "complexscan-details",
            "chat": {
              "actionLabel": "Подробнее о ComplexScan",
              "text": "Показываю коммерческую линейку оборудования ComplexScan."
            },
            "media": {
              "durationMilliseconds": 122570,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-HELGUV9HbFAd3LPHMionEGjD/s7NFJqOY6VzAlBiT5w=",
              "sourceAlignmentFileHash": "sha256:b240f6aa65d4da8b6d41582ca4e8b22ae19dde743e50fbb7e6c22dfcd0064b2a",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-f7+8GEhwwdaazLV18BoeTISvcN0qx5aqcJrZEuTsMVs=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-CTzOI0MtBLi/icKNCUINqHxxBMLmlvolbkxaGni67w0=",
              "wavHash": "sha256:95116b03e7a20a2a2043aa01e373076c8172d19b48c0d353a66b822c1db952c7"
            },
            "period": "2017–2022",
            "projectId": "projects/complexscan",
            "return": null,
            "subtitle": "Теперь вернусь к ComplexScan — коммерческой линии оборудования, чьи разработки стали частью технической базы AUTOBOX. Я развивал ComplexScan в 2017–2022 годах. В линию входили прозрачные платформы для бестеневой съёмки предметов в формате фото 360 и для 3D-сканирования. Здесь я демонстрирую одну из таких платформ и веб-приложение, из которого управляю ею. Здесь я показываю обновлённые версии поворотной платформы ComplexScan и веб-приложения для управления ею. Я проектировал оборудование и метод съёмки как единый продукт и довёл линию до первых международных поставок. Отдельным прикладным проектом стал BoothBot. Это система автоматизации каталожной съёмки винных бутылок непосредственно на складе заказчика. Система объединяла компактную съёмочную будку, управляемые световые панели, моторизированную камеру, пресеты съёмки и автоматическую обработку фотографий. Световая сцена была заранее настроена для бестеневой съёмки и контролируемых бликов, поэтому фотографии практически не требовали ручной коррекции. Система автоматически отделяла бутылку от фона, оптимизировала изображение и выдавала готовый материал для каталога. Благодаря этому сотрудники без студийного опыта могли получать повторяемый результат прямо на складе. Следующим этапом должна была стать прямая публикация готовых фотографий на сайте, но после моего переезда в Аргентину развитие проекта было приостановлено.",
            "title": "ComplexScan"
          },
          "complexscan-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: ComplexScan."
            },
            "media": {
              "durationMilliseconds": 158100,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-FUadvDNgJ43EswEe9KG3S+WgO18ZrV6sV1PhAQ0JU78=",
              "sourceAlignmentFileHash": "sha256:88a721a2f60dc2f791162fb91877d6faddf4e8eefe113c0dc23017db15a2de52",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-LjlM/jRCgJ8TXLQMWhsYsuUXmXwcdUsupUs304O/DvU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ka04gtHDHGi2OwrtEv39vq2P+msOb2PcPqE9bavOhuc=",
              "wavHash": "sha256:ceeeaeca0c0fcd6339bc535330531d931975eb49efd00509b06ca2a8d9fda988"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.complexscan",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я придумал ComplexScan как коммерческую линию профессионального оборудования после open-source работы над PhotoPizza. Прозрачный вращающийся диск, стабильная механика и управляемый свет давали чистые исходники для съёмки объектов в формате 360 градусов и фотограмметрии. Я собственноручно собирал прототипы и первые изделия, разбивал конструкцию на детали для профильных подрядчиков, затем выполнял финальную сборку и тестирование. Отдельно я проектировал защитную упаковку, оформлял экспортные документы и организовывал доставки клиентам в разные страны. Позже R&D этой линии стало частью технической базы музейных систем вроде AUTOBOX.",
            "title": null
          },
          "f360-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: F360 Studio."
            },
            "media": {
              "durationMilliseconds": 57410,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-HZ8RzQLe/PCFCixRRM+7RitdOU/8gjHsy6Bk8XY94D8=",
              "sourceAlignmentFileHash": "sha256:01b05ae258124ff6c5b4c421cc88f8a26a31c8bd34a95829a30562d4ac1a3d99",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-F4OCEfbjt4WQISZBpbdy9wre38heI3Q3ZJPz15Jy548=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-Q5XCIA7lhBilSjA57VrZUoeJaD8O7lPEnf7gN/2t8Ko=",
              "wavHash": "sha256:5e84ac9751f4243484d16533d2f20d64f998fc3f6f0b49705c9faddf9605fc97"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.f360",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "F360 переносила дисциплину музейной съёмки в коммерческий студийный процесс. Для каждого объекта я планировал ракурсы и свет, контролировал исходные фотографии, проводил фотограмметрическую обработку и проверял геометрию с текстурами. Я собрал единый производственный путь от установки до финальной 3D-модели и её публикации. Публичные примеры сохранились на YouTube и в портфолио Sketchfab. Студия завершила работу в две тысячи двадцать втором году во время моего переезда.",
            "title": null
          },
          "f360-studio": {
            "branchId": "f360-details",
            "chat": {
              "actionLabel": "Подробнее о F360 Studio",
              "text": "Перехожу к исторической программно-аппаратной ветке и F360 Studio."
            },
            "media": {
              "durationMilliseconds": 34500,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-McF61Jv+AbGnuIl/Hfu6KQVaDNok+AnnqQnR+Ve0yU0=",
              "sourceAlignmentFileHash": "sha256:c6f83ae0acf7994026af77a230d2c1b1b5f159d40a9810f583dd61f1624bf7b9",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-WYl3LaDbFi+uBcEb6ohuQoBlPyhxbj/nU1NfaPNt+Go=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-5e5h3kXZbfa6MX9eAtOhC/2fj7qN7In+nVpp9zc0EvE=",
              "wavHash": "sha256:569ab98234333cf81c7c8f82dc6d97ee7bce8f02726f344f20ee39fd984a2a38"
            },
            "period": "2021–2022",
            "projectId": "projects/f360-studio",
            "return": null,
            "subtitle": "Теперь вернусь по истории программно-аппаратных проектов. В 2021–2022 годах я основал и вёл F360 Studio. Это проект высокоточного 3D-сканирования. Я выстраивал процесс от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели. При переезде в Аргентину физическую производственную базу пришлось закрыть.",
            "title": "F360 Studio"
          },
          "finale": {
            "branchId": null,
            "chat": {
              "text": "Возвращаю рассказ в настоящее и оставляю итоговые действия."
            },
            "media": {
              "durationMilliseconds": 78210,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-jzT3Vm0Lg40ryaXkk+rjLpeXxhG58W/5ZA2kL+qfbiQ=",
              "sourceAlignmentFileHash": "sha256:88c8f6cee81073927bfbea55c09823ab20222ef029d39262ce5741c6e3377f96",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-rgqMBmb+TXYATB3XqJgLXsxj51tzdyo9IBBxGts1K+c=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-VkpqVSXFSFW3GXtWbn1tSI+sBy139JBIw9djwG02Ego=",
              "wavHash": "sha256:8a14be7f02c5024285c5970f6db4f53034777f00aeb2da29baa42fb138272bac"
            },
            "period": "настоящее",
            "projectId": null,
            "return": null,
            "subtitle": "А теперь вернусь в настоящее. От программно-аппаратных систем для съёмки я пришёл к распределённой инфраструктуре и текущим агентным рабочим средам. Во всех этих проектах я соединяю исследование, архитектуру и реализацию в работающий процесс с понятными границами и проверяемым результатом. Сейчас главным центром этой работы стал Symbiote Workspace. Здесь можно продолжить знакомство с проектами, открыть резюме или связаться со мной.",
            "title": "Возврат в настоящее"
          },
          "lifecycle-messaging-platform": {
            "branchId": "lifecycle-platform-details",
            "chat": {
              "actionLabel": "Подробнее о Lifecycle Messaging Platform",
              "text": "Показываю распределённый контур Lifecycle Messaging Platform."
            },
            "media": {
              "durationMilliseconds": 36910,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-2JDfCx9gxpTEumfYhO0RYxb/el4YXFvyhvUPhI5jFss=",
              "sourceAlignmentFileHash": "sha256:c8e9539436983d6615264db05c295d5de066eb1d7359046f1c6c04bbeb72915a",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-Rj0T+OMKlEUUs8lc7NxSGPtN4ndmmgj+Sd/a5fRdlgo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-Ldz9rCTr2S3gtMCHaywAolFSrRRJz+/FLcmBQZYbwBM=",
              "wavHash": "sha256:0d32c02884d41943f9ec5869025a1bf9500f0d166c742f35727a6d3863a55363"
            },
            "period": "2022–2026",
            "projectId": "projects/lifecycle-messaging-platform",
            "return": null,
            "subtitle": "Теперь вернусь к периоду 2022–2026 и к Lifecycle Messaging Platform. Это маркетинговая платформа для автоматизации клиентских коммуникаций. Она включает сегментацию аудитории, управление маркетинговыми кампаниями, opt-in SMS-сценарии и аналитику. Я проектировал API, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. Для проверки модемного контура я сделал локальный Digital Twin с виртуальными устройствами и воспроизводимыми сценариями.",
            "title": "Lifecycle Messaging Platform"
          },
          "lifecycle-platform-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Lifecycle Messaging Platform."
            },
            "media": {
              "durationMilliseconds": 63800,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-2eGxP6+B2MDcd5r8PVV9J3ehcLiealYY8NjPDkxOe0c=",
              "sourceAlignmentFileHash": "sha256:ae55156dc3cbca1009a3b6483440c0066ab83be92d94fc528b46864ac7f1aa3e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-TiCPiMT4BVdeAXfH41ii3E5HcfUwa/zBj6mMbE9Zxp0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-8wjzGqYecVMFRwpSA7NljHbug5ZQYQAipuK2NDy/yOE=",
              "wavHash": "sha256:6ca8d280dbd412737a2befed9f5c1510223670e93a7553f37843318597a0ea25"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.lifecycle-platform",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Платформа соединяла веб-продукт, серверную инфраструктуру и физическую доставку через модемы. API и PostgreSQL хранили продуктовые данные. WebSocket связывал runtime, а распределённые инстансы управляли пулами GSM-модемов через serial и AT-команды. Связь и устройства могли менять состояние, поэтому очередь, повторяемое выполнение и мониторинг сохраняли управляемость процесса. Digital Twin воспроизводил физический контур для локальной проверки. В одном историческом эксперименте создание материалов и их проверка работали как независимые контуры с разными правилами оценки.",
            "title": null
          },
          "maximo-workbench-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Adaptive Maximo Workbench."
            },
            "media": {
              "durationMilliseconds": 76130,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-UBZpAHj2aI8X71rtJh8nJCjKwdAsxwjtFkP/vBLa4Ic=",
              "sourceAlignmentFileHash": "sha256:eb211cd51dbbf761558951886d978bfa2dd63dd2ebe7461e607b7309cebb9310",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-W7IZrMG7nDu8gfM3Qzodgmrlenei8ZZZUq/9uj7/S7E=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-17hTHSAf2rlQ+YknBA1aw7LJWSt65S2x0F4Lp+ObGmA=",
              "wavHash": "sha256:54710170e3e7f99c5c259efc207cb27232732dabb3a158ca9dcb0ca78b4fe513"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.maximo-workbench",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В этом демо Workspace получает предметную конфигурацию для обслуживания оборудования. Панели связывают заявки, активы, локации, бригады и безопасные действия. Агент читает тот же актуальный контекст, который видит человек, и работает через объявленные действия интерфейса. Этот контур проверяет архитектуру Workspace на корпоративном процессе. Реальные данные, авторизация и API системы Maximo подключаются отдельным интеграционным слоем.",
            "title": null
          },
          "mobile-smm-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Мобильная SMM-платформа."
            },
            "media": {
              "durationMilliseconds": 65450,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-pkH8hvtzixns1jPcNxjb2YCSxf27MNFfqk2TmXzeBw8=",
              "sourceAlignmentFileHash": "sha256:28c6e8b651652cbeaffa38cf13adc146515de4a31dfdf72b00629835cf74a7bf",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-dlw6M651soVTVfDQzcSrmmY58YxP4mqWCSP7sWKyVhk=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-HESgxGl/6WxDOC8STJCqFj79rSQGOQsXIA4/m4mngpc=",
              "wavHash": "sha256:170b66dfeaeb732c72aa32ae3b4b7e840b032b3367594155a7faba15600d9314"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.mobile-smm",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Android-устройствами. Готовый JSON-сценарий выполняет стабильный путь и записывает результат в журнал. Если структура экрана изменилась, исполнитель останавливается в безопасной точке. Агент анализирует актуальный экран, готовит обновлённый сценарий и передаёт его на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и approval. Демонстрация заканчивается dry-run или подтверждением в журнале без внешней отправки.",
            "title": null
          },
          "mobile-smm-platform": {
            "branchId": "mobile-smm-details",
            "chat": {
              "actionLabel": "Подробнее о мобильной SMM-платформе",
              "text": "Показываю отдельный прикладной кейс мобильной SMM-платформы."
            },
            "media": {
              "durationMilliseconds": 36990,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-GQlgt492NqNYLV6IwlMoXLV2LKAhstE2ib5dyj9yAvQ=",
              "sourceAlignmentFileHash": "sha256:f926c950736b29a636c5dc3d87e13d31157898c7eef8e7439705e8bf058c4408",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-2oLUCmKC/oDxygzkZ/ZgO7f1KlvGXOo3pqf4WyMQWjg=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-xEYC2VMzJnA2aEK3GewvNFnqF9iQDhG8KWC3McfZMVI=",
              "wavHash": "sha256:5550fa6ddf9e78b5737b9e12ecf9d1f412bbb27574841b5cf8844fc1bfb3f512"
            },
            "period": "Date pending",
            "projectId": "projects/mobile-smm-platform",
            "return": null,
            "subtitle": "Отдельный прикладной кейс — мобильная SMM-платформа для управляемой работы с несколькими профилями. В одном контуре собраны медиаматериалы, публикации, расписание, входящие обращения и очередь. Android-устройства выполняют стабильные операции по готовым сценариям. При изменении интерфейса агент останавливает процесс, анализирует экран и готовит обновление сценария для проверки. Управляемость обеспечивают лимиты, дедупликация, согласование и журнал.",
            "title": "Мобильная SMM-платформа"
          },
          "photopizza": {
            "branchId": "photopizza-details",
            "chat": {
              "actionLabel": "Подробнее о PhotoPizza",
              "text": "Показываю открытую основу этой линии — PhotoPizza."
            },
            "media": {
              "durationMilliseconds": 175460,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-gJzMnJ7gLBBqtCQgN7AA6BuLfitA8WJmVmf/V30gmfU=",
              "sourceAlignmentFileHash": "sha256:d02885b62d4a3475702155c218708e7efb8369fcc31ce29a6fceb8ac44d1598e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-30QLhpIbU3+/65xY4kvwYl/LfWpQtkDq9E6PpGKP10o=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-hCKbW9KIKXXMB/FhIJ8wSlPyy0+Bd9WmVwxbQEiWi6I=",
              "wavHash": "sha256:c9fb961c8aded6139fce471ccc69b7bd0cd290d27c841369df8a60a7fc6b799c"
            },
            "period": "2010–2022",
            "projectId": "projects/photopizza",
            "return": null,
            "subtitle": "В начале этой линии была PhotoPizza, которую я развивал с 2010 года. Проект появился внутри MEGAVISOR как инструмент для повторяемой съёмки объектов на 360 градусов. Здесь показан ускоренный демонстрационный ролик о сборке первой версии PhotoPizza — без подробной инструкции. Это промо MEGAVISOR, где показан весь спектр поддерживаемого контента, включая съёмку объектов на 360 градусов. Я продумал механику, электронику, прошивку, документацию и упаковку. Таймлапс сборки прототипа PhotoPizza из конструкционного алюминиевого профиля и шагового двигателя. Позже PhotoPizza стала open-source проектом. Здесь я показываю, как собрать простую поворотную платформу из подноса IKEA и вручную снять объект со всех сторон. Такие демонстрационные ролики я продюсировал для MEGAVISOR, чтобы популяризировать формат и снизить порог входа в технологию. Здесь я показываю новое веб-приложение PhotoPizza: с телефона запускаю съёмку и по Wi‑Fi управляю поворотным столом и камерой через веб-приложение. Универсальный блок управления работал с поворотными платформами, слайдером камеры и моторизированной панорамной головкой. На грузовой поворотной платформе PhotoPizza мы снимали даже тяжёлые объекты, включая мотоциклы, на 360 градусов. Проект продолжал развиваться до моего переезда в Аргентину в 2022 году.",
            "title": "PhotoPizza"
          },
          "photopizza-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: PhotoPizza."
            },
            "media": {
              "durationMilliseconds": 191650,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-Wy57iYelFnVlcYnQeq1Xwbi4ZVyKRP6VrToNcTW0Su8=",
              "sourceAlignmentFileHash": "sha256:1b50442cd4b3cbe204c12b9e7e24bba2ba16c0d22b5415b47da4b24226952984",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-hcb+uBJiikvTN8SBfbnNoQV5UxKfZKwSunJklulCAOY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/AN0LfqoltYR7Zi8Gh/GfcuSFW6YCqMg12e0AwmCsxc=",
              "wavHash": "sha256:d1ee1d1d730d94e3c672e595618d25dcbdd9a9247f23ebe6afccbc7946bf2c3e"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.photopizza",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Изначально PhotoPizza была внутренним инструментом MEGAVISOR — облачного сервиса для фото 360 объектов, 3D-панорам, видео и виртуальных туров. В MEGAVISOR я разрабатывал технологию и оборудование и составил техническое задание на управляющее программное обеспечение. Первую версию для Arduino по этому заданию реализовал привлечённый специалист. После MEGAVISOR я сам продолжил управляющее программное обеспечение на JavaScript и Espruino. Я подбирал доступные компоненты и подробно описывал сборку с калибровкой, чтобы люди могли собирать свои версии. Один контроллер управлял поворотной платформой, слайдером камеры и автоматической панорамной головкой. Этот открытый проект дал практическую основу для последующих экспериментов ComplexScan и AUTOBOX.",
            "title": null
          },
          "positioning": {
            "branchId": null,
            "chat": {
              "text": "Начинаю краткий обзор опыта и проектов."
            },
            "media": {
              "durationMilliseconds": 57310,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-Dz26eASMhL6iqbeuplRMrZOtWUrscNFFWlfH4PfHXQU=",
              "sourceAlignmentFileHash": "sha256:af9ea91d8e7e8b035ad018f8402010a23eec9f068d8bb673464ce092456883ee",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-0Pk8hf9d9athRppl6gXqPMt10VhKRiSwrT6VhDsWc5o=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-HHuX7z1A6pUHI8I2SggtiWVVtaKk87RZ3qrSIrXuxEI=",
              "wavHash": "sha256:f657646b15f95656ee3d31e37da18a7c0890a224e112f147562255e96dab1941"
            },
            "period": "present",
            "projectId": null,
            "return": null,
            "subtitle": "Привет, я Владимир. Я R&D-инженер: нахожу проблемы и продуктовые возможности, формулирую задачи, придумываю решения и довожу их до работающего результата — самостоятельно или отвечая за свою часть работы в команде. Сейчас мой основной фокус — программные платформы и агентные продукты. В этой презентации я покажу, как этот R&D-подход работает в разных предметных областях — от программных платформ до медиа и оборудования. В каждом проекте я отдельно обозначу свою роль.",
            "title": "Кто я"
          },
          "project-graph-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Project Graph MCP."
            },
            "media": {
              "durationMilliseconds": 58160,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-sZBZPECXizDCaiicc5T8kbVbBxj9MDZ3g/lwwHEd8HA=",
              "sourceAlignmentFileHash": "sha256:e597a1fea919a4ecb2a6876c2bccb2a98f05b7e446775b349e4cd2f9e59edb04",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-puK3AF+IjrnlA7rPh36RwJvViZDvCpYKqwk63x4djiI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-bP9t/Wgec0WSTh85bTFXgvK0SKJjZb2E1FTGKiVUDGM=",
              "wavHash": "sha256:b5b2bf440ee098ff4c88b75db0701ac06b37e9b0be15ae13c7e0d0a7f59d2719"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.project-graph",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Project Graph MCP анализирует структуру репозитория и готовит несколько представлений: зависимости, скелеты кода, краткую карту проекта и факты браузерной проверки. Более быстрая модель может собрать эту карту, а сильная модель получает сфокусированный контекст для решения. Я использую этот слой как context engineering и структурированное извлечение с графовыми связями.",
            "title": null
          },
          "project-graph-mcp": {
            "branchId": "project-graph-details",
            "chat": {
              "actionLabel": "Подробнее о Project Graph MCP",
              "text": "Показываю слой структуры и контекста Project Graph MCP."
            },
            "media": {
              "durationMilliseconds": 29820,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-PrLWmmF75M+bXYsQ4nWCjYKgUGPBGWCpfh54OPPRogA=",
              "sourceAlignmentFileHash": "sha256:fd40fbdcfc74ccfcdce718ed54b0e0ba1550b045be4ec2b937b57a029d9ab809",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-XmDF03uXyp9bGQ2AvkntJicuuW7hR6K36C48UMQL7JY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-NnhOqtDTjXByp4vfr1ChLQxuDODD8BnfeWOp9LJx8ro=",
              "wavHash": "sha256:386e701ad201aea96fde9d90f14bc6190f2f1313b098fb6fb3486b90e0deb72d"
            },
            "period": "2026",
            "projectId": "projects/project-graph-mcp",
            "return": null,
            "subtitle": "Второй инструмент — Project Graph MCP, самостоятельный open-source MCP-сервер для навигации по кодовой базе. Он строит компактный граф репозитория, который в Agent Portal отображается как визуальная карта проекта. Человек может выбрать интересующий узел, а агент — раскрыть для нужной части зависимости, скелеты кода, документацию и более подробный контекст. Так человек и агент работают с одной структурой проекта, а модель получает релевантные проверяемые факты, не перечитывая весь репозиторий. Исходный код доступен на GitHub, а интерактивное демо доступно по соседней ссылке.",
            "title": "Project Graph MCP"
          },
          "symbiote-engine": {
            "branchId": "symbiote-engine-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Engine",
              "text": "Показываю исполнительный слой — Symbiote Engine."
            },
            "media": {
              "durationMilliseconds": 22880,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-afAm/8iXvIzg71bG57I/vDYrgT2+JZ44ZPBuMHJ1m70=",
              "sourceAlignmentFileHash": "sha256:2435c3354aa423f24d94c40650346ebb72bc6afee2767d5aeca2d4bf2461f1a7",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-1py7nz2MsrqFi/dbqdPI9TeYq+ekRlmfxJjDbzu3t9o=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-koiVNRlRMzzO533W+SdMuur2GoKXXPB6DHBMH7FO0go=",
              "wavHash": "sha256:6d2976144f3039e683afe4e0e1388538e6a18005822be6c81130e4651400d98b"
            },
            "period": "2026",
            "projectId": "projects/symbiote-engine",
            "return": null,
            "subtitle": "Функциональные блоки даёт Symbiote Engine. Это серверная библиотека для сервисов, графов выполнения и автоматизации. Workspace соединяет визуальные блоки UI с этим исполнительным слоем в одной конфигурации.",
            "title": "Symbiote Engine"
          },
          "symbiote-engine-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Engine."
            },
            "media": {
              "durationMilliseconds": 43950,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-uN/pKHVonyrkGaWxUv6OkdWSP27T9uq8+GNaVZnC8cU=",
              "sourceAlignmentFileHash": "sha256:49c6dfe1fa213ba0f1968ed6593b228215bc3d168e6caa1af2d6d8ca3dc15777",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-PkcEJW0tC+ocIktlZfijsiRI9aqhhWMS9IaapKG30vI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-UcLvWjpMbN9lEQbFqfX+gm6HKjMPUExk9uSqG9hbdxM=",
              "wavHash": "sha256:319ae71afc81c094bfab238685db64a823a4088dbef377f77391fd11ac30547e"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.symbiote-engine",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Symbiote Engine предоставляет компонуемые серверные примитивы: обработчики, команды, графы выполнения и хранение состояния. Продукт собирает из них свой backend-процесс, а Workspace связывает исполнение с переносимой конфигурацией интерфейса. Я сохраняю разделение слоёв, чтобы Engine можно было использовать в разных рабочих средах и сервисах.",
            "title": null
          },
          "symbiote-ui": {
            "branchId": "symbiote-ui-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote UI",
              "text": "Показываю визуальную библиотечную основу — Symbiote UI."
            },
            "media": {
              "durationMilliseconds": 64510,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-kpkiDld/NHMoSw4BXQxLeb2wSVJjrKDlbdkVwuLsuPM=",
              "sourceAlignmentFileHash": "sha256:84798a6fdffc3764659ff9f619473196e85a95bc248ea658f948b7ff4585cc85",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-7PQWknviaq80xUJsGAYp0Bid92Ml4rqLPogxekvOQ6M=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-cJqKpbsjkiEBqY0ffDLCb8aPpeLpE0uKQ8iva7EgcEI=",
              "wavHash": "sha256:af5d27a397daf8eb4b0525136f8b13dd05d4b82fadbb72b351fc3246a8023fdc"
            },
            "period": "2026",
            "projectId": "projects/symbiote-ui",
            "return": null,
            "subtitle": "В основе визуальной части Workspace — open-source библиотека Symbiote UI. В ней собраны компоненты, компоновки, графовые инструменты и семантические контракты интерфейса. На её основе построен и весь интерфейс этого CV: навигация, рабочие панели, чат и плеер презентации. Исходный код и техническое описание доступны на GitHub, а прямо в этой презентации можно открыть подробный разбор проекта.",
            "title": "Symbiote UI"
          },
          "symbiote-ui-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote UI."
            },
            "media": {
              "durationMilliseconds": 70750,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-lz0jCGTFagpDE1YzLaDptDpuH5eQE5bZd7yrRFalzGA=",
              "sourceAlignmentFileHash": "sha256:880980d6c2e598777b4bcd059339a22f1d1857b3519d6277ec8c1f55bdb4516b",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-l+7X9zGR41BHm1pvVHiSqY50G2iRpPgqZT9+bGJysi0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-KrqkXQkkP/BPg4enb36qXZ6ONTr9+CzLLhACJQsoRoY=",
              "wavHash": "sha256:29dc9ab62436308acbc00fc00d6ba03765be217f6aae190ff4ec428e2f1540fc"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.symbiote-ui",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я развиваю Symbiote UI как библиотеку интерфейсных блоков, которые можно компоновать программно и описывать для агентов. Компоненты публикуют роли, состояния и безопасные действия через манифесты и WebMCP-контракты. Workspace использует этот каталог при сборке рабочей среды. Продуктовый смысл добавляет конкретная конфигурация, а библиотека сохраняет нейтральные переиспользуемые возможности.",
            "title": null
          },
          "symbiote-video-studio": {
            "branchId": "video-studio-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Video Studio",
              "text": "Показываю Symbiote Video Studio как актуальный workspace-кейс."
            },
            "media": {
              "durationMilliseconds": 25160,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-qKH8JK0x4ryABdgrwIZn9+cKCssOCRhaoUZyBMEjE5w=",
              "sourceAlignmentFileHash": "sha256:070638d77565d042a705f9d512e6fd70db6c231bc170fbf65b8f1de9c8984020",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-E6MbW6VLEjFGUDMl1QA/MZXCl5kGI/aX+MQ8Xwzz/Bo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-TxiaMyIZ8YRKyBYagEi8b+0PAqpjy7EkE0D8yvFQwFE=",
              "wavHash": "sha256:aee0c0a9b3b4f59a2be13fec14d8d7a0dec044216ca88ed287367b62cb0d48f5"
            },
            "period": "2025–2026",
            "projectId": "projects/symbiote-video-studio",
            "return": null,
            "subtitle": "Ещё один актуальный проект — Symbiote Video Studio. Материалы, граф, таймлайн, предпросмотр и рендер собраны здесь в один видимый процесс. Агент работает с семантическими элементами интерфейса, а человек может проверить каждый этап. Сейчас Studio оформляется как конфигурация Symbiote Workspace.",
            "title": "Symbiote Video Studio"
          },
          "symbiote-workspace": {
            "branchId": "workspace-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Workspace",
              "text": "Показываю текущий центр работы — Symbiote Workspace."
            },
            "media": {
              "durationMilliseconds": 63200,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-nKLtBDYeEMDAh54q/iQd3II/YWblLqCbCyueSuVDXVo=",
              "sourceAlignmentFileHash": "sha256:166ebcf3a92b72732ec8808ac2d1839a6a719620f48dbe3745c12ad75dceb55f",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-umrWkev806IG5kTy14wKpY5ayH7UHmeKRE9YMlWaoic=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-mFUzwFRUVWUNGPIXqPiXLarUJzJEvRtURc/Fs2OgxYE=",
              "wavHash": "sha256:645d05c7ff3f117ebd6bad870678748306d00a88bc849e159c6caddf44ab9390"
            },
            "period": "2026",
            "projectId": "projects/symbiote-workspace",
            "return": null,
            "subtitle": "Начну с текущего центра моей работы. С середины 2026 года я развиваю Symbiote Workspace — универсальную среду, где агент собирает рабочее пространство под конкретную задачу. Результат сохраняется в виде исполняемой конфигурации, которую можно переносить. Некоторые мои текущие проекты появились раньше Workspace и теперь постепенно становятся его конфигурациями.",
            "title": "Symbiote Workspace"
          },
          "video-studio-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Video Studio."
            },
            "media": {
              "durationMilliseconds": 47120,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-rYwy5P/9DJyAs3zsoBRLpW8LFnAFEs2LDkUZSGU8u8o=",
              "sourceAlignmentFileHash": "sha256:e696ee3a53fce557e67bd639c6c556be3843897ea9a61a357fa82f83c2814498",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-IkH90q2udRPT6539kMQNtj7UjElC2DHQteydKMsNSXU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-Ua6mcvC0aVbmBpoR5AUw5+S934GRrrL4GXc8zXjD8tE=",
              "wavHash": "sha256:728b4de706f05550f5a968a3ea083d1d0f6fd470fa6bfb97ffe0207b3ef72205"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.video-studio",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В основе Studio лежит ядро Symbiote Video. Агент описывает структуру ролика семантическим описанием в формате JSON: сцены, слои, клипы и переходы. Движок превращает описание в граф, таймлайн и композицию. В рабочей среде можно проверить node graph, запустить live preview, сохранить состояние и перейти к экспорту. Видео-ядро уже работает, а Studio как универсальная конфигурация Workspace продолжает развиваться в alpha-режиме.",
            "title": null
          },
          "workspace-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Workspace."
            },
            "media": {
              "durationMilliseconds": 81330,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-uonzG/xZVYNnhiqdIwRwdSMEdAhybKxa3TolMhuA9wM=",
              "sourceAlignmentFileHash": "sha256:1a6213a8efc14c524c3213182f5b11fb1846baafa6ce1823d4def7bda28c82cc",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-+GrkCC0zBdwpBAw4w6qDO/bdNIYOSz7Zx4KHrUUIl78=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-HxAA6MYJAWzKjRg52R/e61uPiIwrmMaBTaHbo2I+pso=",
              "wavHash": "sha256:dbe621a95460f8aa7adafe7cdae2d950c2793767e1791ae16ad68078d18698d6"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.workspace",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Рабочая среда описывается конфигурацией: в ней задаются компоновка, панели, модули, действия и связи. Агент подбирает готовые блоки, валидирует конфигурацию и собирает интерфейс в браузере. Конфигурацию можно обновлять во время работы, сохранять и открывать в совместимом host-приложении. Секреты, авторизация и пользовательские данные остаются на стороне host. Я развиваю эту архитектуру как общий слой для специализированных рабочих процессов.",
            "title": null
          }
        },
        "narrationLocale": "ru",
        "runtimePolicy": {
          "attention": {
            "cursorCount": 1,
            "cursorPersistent": true,
            "exclusive": [
              "cursor",
              "frame",
              "native-selection",
              "activation"
            ]
          },
          "audio": {
            "detailVideo": "static-frame-with-tour-speech",
            "exclusive": true,
            "shortVideo": "static-frame-with-tour-speech"
          },
          "branch": {
            "preserves": [
              "mode",
              "scene",
              "position",
              "playback",
              "subject"
            ],
            "returnState": "paused"
          },
          "marker": {
            "accumulatesWithinSeries": true,
            "clearOnAttentionChange": true
          },
          "ownership": {
            "productScenario": "cv",
            "sharedRuntime": "symbiote-ui"
          },
          "userInteraction": {
            "autoPause": "meaningful-only",
            "ignored": [
              "hover",
              "pointer-move"
            ],
            "resumeAction": "continue"
          }
        },
        "storyVersion": 1
      }
    },
    "personas": {
      "vladimir": {
        "locale": "ru",
        "name": "Владимир",
        "role": "presenter"
      }
    },
    "profile": "full",
    "source": "cv-show-authoring-project",
    "title": "CV Show"
  }
}
/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */
);

export const CV_SHOW_AUDIO_RELEASE = freezeDeep(
/* CV_SHOW_AUDIO_RELEASE_INPUT:START */
{
  "acceptedProvenance": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WJXMA0f9i4DwyS1CYrZ3FSAznMtAbhDA/lcaYjQVtNY=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-xkDP1BOrbemy4iknmMC7Vj4rwXfu/OsnY5Q7ZPGcfIc=",
    "entries": [
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-Z3RBM9ZJWfG1mkC3hhNZZyo8WBBsgtmkrEZbNIQjyZs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ctRBiieen1Vn2yNcnh07aNw4dgnsuzuXxMVGLkxXGlQ=",
        "entryId": "positioning",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-OKm9IHCERe1y+Y2DIcborkFzAi9NgOiNcUXzQgYDgKw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-vnpNfkPIsLEK5xqsQxmLy2NNj2AgL8WLAkJ0nbiMw3g=",
        "sourceCellIds": [
          "cv-show:narration:positioning",
          "cv-show:cue:positioning.tenure-marker:scroll",
          "cv-show:cue:positioning.tenure-marker",
          "cv-show:cue:positioning.workspace-transition:scroll",
          "cv-show:cue:positioning.workspace-transition",
          "cv-show:cue:positioning.open",
          "cv-show:audio-clip:positioning:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-waA8OYH6PJf0tvLE3qSJD+Xb7P5rO69uTNm2InvxbS4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-r9OKtIAABu7lpI0bjSeR1vk8hqwxk3WGaHk3dPf9r/w=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CSFYFEf1RRqJsQ6FnPDjgGrjYmxq12xslUw4JSK9oOE=",
        "entryId": "symbiote-workspace",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-16pTGhW4OVbc43ZnwQvqeI5XKTBP67EtBWwYYOFFRuc=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-yMDwqWitxBGefF+kLgklF+hJeywZI/SK+2AYT7P7Ue0=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-workspace",
          "cv-show:cue:workspace.open",
          "cv-show:cue:workspace.intro-frame:scroll",
          "cv-show:cue:workspace.intro-frame",
          "cv-show:cue:workspace.portable-config:scroll",
          "cv-show:cue:workspace.portable-config",
          "cv-show:cue:workspace.agent-portal-card:scroll",
          "cv-show:cue:workspace.agent-portal-card",
          "cv-show:audio-clip:symbiote-workspace:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-RahVWYUNQc4qrkK4/Uh//nJXdZFwgqUdbfS0SUl3Mn4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZmNKnbBmixNRjiEe41jE2S4UAyj17jiZYUA2aJLUdZI=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-KL7gAQCEHCX6dZOWkmDjGvAwQ1Kp1u0CyF3D3TWqIyg=",
        "entryId": "symbiote-ui",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-OQRZV1BSoAbeBUpxLsWjaws5cpxPG4LGcel6hKh91jo=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-MkVA2BloN9R/VlYGROLp1wB4CSngv7vmUNF7YDCiCJ8=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-ui",
          "cv-show:cue:symbiote-ui.open",
          "cv-show:cue:symbiote-ui.graph-tooling:scroll",
          "cv-show:cue:symbiote-ui.graph-tooling",
          "cv-show:cue:symbiote-ui.current-show:scroll",
          "cv-show:cue:symbiote-ui.current-show",
          "cv-show:cue:symbiote-ui.show-player-pointer:scroll",
          "cv-show:cue:symbiote-ui.show-player-pointer",
          "cv-show:cue:symbiote-ui.github-link:scroll",
          "cv-show:cue:symbiote-ui.github-link",
          "cv-show:cue:symbiote-ui.details-pointer:scroll",
          "cv-show:cue:symbiote-ui.details-pointer",
          "cv-show:audio-clip:symbiote-ui:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-OMtx7ocghU6AsQntGkRK2qHzfWY0IfPfqLLghoyjlqA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-UVWTzVKYkA/LSou8+P7AMlUpiDS2ILkdalRA1NcsrSs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-PFN/UJD+Uzg6TKF1lswuVepH8mLJjeiSm2TNLcrRVbE=",
        "entryId": "symbiote-engine",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-d6KQYEuEd0/9vyU8GQ3L0bm34S8SkPG3NrH1kxM/h/0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-dRQLaIUeoXkmV0EEH0g0D8MXc8oDRoUlm4seBmFI/q4=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine",
          "cv-show:cue:symbiote-engine.open",
          "cv-show:cue:symbiote-engine.intro:scroll",
          "cv-show:cue:symbiote-engine.intro",
          "cv-show:cue:symbiote-engine.workspace-join:scroll",
          "cv-show:cue:symbiote-engine.workspace-join",
          "cv-show:audio-clip:symbiote-engine:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Z57mlla8cetxc+jwHS8kMltSrITJsCyT4xnHtPgHYLA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-v79dvY9GP+QP0A3ahJTuAyFhXhC+42LaneV4Lwd/aT8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-p2ZZKDkXJF+634zkIevLx0ytbU1ndDaCZzyz0hqMma8=",
        "entryId": "agent-portal",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-yXBZV6YE71ODpS5KklsH9E9k2aTIFmf0upiP7V4u+IU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-0c8+syaJnLGyPe1JA0JTSRKkRAKB3RGZBQCrg1tSzyw=",
        "sourceCellIds": [
          "cv-show:narration:agent-portal",
          "cv-show:cue:agent-portal.open",
          "cv-show:cue:agent-portal.path:scroll",
          "cv-show:cue:agent-portal.path",
          "cv-show:cue:agent-portal.human-decision:scroll",
          "cv-show:cue:agent-portal.human-decision",
          "cv-show:cue:agent-portal.open-source:scroll",
          "cv-show:cue:agent-portal.open-source",
          "cv-show:cue:agent-portal.github-link:scroll",
          "cv-show:cue:agent-portal.github-link",
          "cv-show:cue:agent-portal.demo-link:scroll",
          "cv-show:cue:agent-portal.demo-link",
          "cv-show:audio-clip:agent-portal:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-s+f16O2P6MZyzXybglzLgyZBQxIkSFdcs2qLXGWUIsw="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-a/r8z/RkRINLLL/yzgEsDFNRFxQDqbJh2cazfltAFDs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-a5hz8CB1wd9BvSe2pJBYSs6FZBQJI7N47WVQ1bvkr44=",
        "entryId": "symbiote-video-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-0klUKDott7S9Mw/Z4/TTqQ8RGO6PkWVnAovxmW2Ty6E=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-A1CHbKPpHChO7RbFbgpGby+4A/grHEOoZc0TA24m3Rg=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-video-studio",
          "cv-show:cue:video-studio.open",
          "cv-show:cue:video-studio.visible-process:scroll",
          "cv-show:cue:video-studio.visible-process",
          "cv-show:cue:video-studio.demo:scroll",
          "cv-show:cue:video-studio.demo",
          "cv-show:audio-clip:symbiote-video-studio:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-04W/ZvVF/s+ZaGFKgVYI12e2Vyc5GzNl9pUSZ5vxU3I="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-lqNgxzRXqz4ZVcb+BXruK5UMDBmQKfAK8vzi1ervStw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-FpMuqq0VBJXa0/dW4ZPJ7LGniO8c+ec+VI62sIYcRpI=",
        "entryId": "adaptive-maximo-workbench",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-AeTOqf4JiQiQbMRK2naSvb8YZGVun1I61WzA+7HrtqA=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-O2lQ9XlyUKt1+MBWYzGkE2/VExEVPZBqGqE/JsWUU5Y=",
        "sourceCellIds": [
          "cv-show:narration:adaptive-maximo-workbench",
          "cv-show:cue:maximo.open",
          "cv-show:cue:maximo.work-orders:scroll",
          "cv-show:cue:maximo.work-orders",
          "cv-show:cue:maximo.asset-context:scroll",
          "cv-show:cue:maximo.asset-context",
          "cv-show:cue:maximo.agentic-demo:scroll",
          "cv-show:cue:maximo.agentic-demo",
          "cv-show:cue:maximo.xr-demo:scroll",
          "cv-show:cue:maximo.xr-demo",
          "cv-show:audio-clip:adaptive-maximo-workbench:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-kLMeEQJrZBg35ud2PpBwVjLHchXQ7FcVnfeshd2HLgA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-pwD5Km+AGO3sJVeyUbXcVTEBhTezMBAYz8xuxaxa/wg=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Og03ra0A8hmHTQ61GpHq8FKi+TEGMZo4PdiR7iOAplk=",
        "entryId": "agent-pool-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-agips5EvsgGk49xhHzMToQEZ3moQJDf3wzELMQc6pPE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-C6G5YP4/VzBXQXs+xboagYm8ao3+0nuV3sm1poTWr74=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-mcp",
          "cv-show:cue:agent-pool.open",
          "cv-show:cue:agent-pool.flow:scroll",
          "cv-show:cue:agent-pool.flow",
          "cv-show:audio-clip:agent-pool-mcp:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-KYuYEhLWUCcN5y//Qpr+vubCcPrjAqQIgxUdiwGJRjI="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-zYEtt4pCmFmtxm7QWDWTEUV+xW+vef/PSbLeH/gGFg0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-3LA774V4jymZ1hLXZ8aljaI2pnYljZo+Gd3GgW3gZuc=",
        "entryId": "project-graph-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-M2qJHEmP4ZUZpfZjmqDI9zuBJbZxyLGls1yFjtX5Pq8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-+EC8nBmFju1m+frEr0dnj5HiwOCvRdpQCaHdpylgeGs=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-mcp",
          "cv-show:cue:project-graph.open",
          "cv-show:cue:project-graph.example:scroll",
          "cv-show:cue:project-graph.example",
          "cv-show:cue:project-graph.context:scroll",
          "cv-show:cue:project-graph.context",
          "cv-show:cue:project-graph.node:scroll",
          "cv-show:cue:project-graph.node",
          "cv-show:audio-clip:project-graph-mcp:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-xrpfW7QJs4cEixTIMpwJYT4hfFUGAP1YOXjZb4IuP9A="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-kNg91O6Vlg8g7pFHv5spbaUABMLIOzuVN45S/Kc4aVk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-0XJnRxCOFbWsu4Fslyrv7hzH4sAbhG0UBqFp3+YFvGo=",
        "entryId": "lifecycle-messaging-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-gRoCEOE5PFPwwKKW9gA+8WwNDKTGaTe/XmxKFjS1b44=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-6+s2/0V2hwAvMTkkwp6MGItspS+LLF8gDf2Sjl9a19s=",
        "sourceCellIds": [
          "cv-show:narration:lifecycle-messaging-platform",
          "cv-show:cue:lifecycle.open",
          "cv-show:cue:lifecycle.scope:scroll",
          "cv-show:cue:lifecycle.scope",
          "cv-show:cue:lifecycle.product-number:scroll",
          "cv-show:cue:lifecycle.product-number",
          "cv-show:cue:lifecycle.runtime-number:scroll",
          "cv-show:cue:lifecycle.runtime-number",
          "cv-show:cue:lifecycle.digital-twin:scroll",
          "cv-show:cue:lifecycle.digital-twin",
          "cv-show:audio-clip:lifecycle-messaging-platform:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-8HQo9BxGxQ+mX1pHxlF1/muZnaJrL1+5+CRvXz3oUt0="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-CLqSpctt2GZ4JXv4w2UuSPTpQTn2hU3nUwXlP5lQjRg=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-iKMGdnfgoHgQZ0RN09CM8IZcav9LKBNJNvDootrUzaE=",
        "entryId": "mobile-smm-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-LQIJ1Dq93QIJrfL2I9kDqE4K3XuTPAnyjrupH0aqTAY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-P2WmeWKJfAQnXps50oD3UDAWv75HHICC0MSl5PMwnxw=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-platform",
          "cv-show:cue:mobile-smm.open",
          "cv-show:cue:mobile-smm.overview:scroll",
          "cv-show:cue:mobile-smm.overview",
          "cv-show:cue:mobile-smm.stable-path:scroll",
          "cv-show:cue:mobile-smm.stable-path",
          "cv-show:cue:mobile-smm.agent-update:scroll",
          "cv-show:cue:mobile-smm.agent-update",
          "cv-show:audio-clip:mobile-smm-platform:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-7g8pmsvPdNdLdCm9fmPZBPk+fq0l6IRqE3h7PbXKNe8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-LrDv1gR268ZmyakdY+0AsgEn4PV3h0gGMfGllfa8gH0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-VHll1CyMzQDJAyl/ZhAw6PP5nl19W2eo22usil4i7w8=",
        "entryId": "f360-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-cgPAlNiPz0Mfa6cu3XyV9sdIUi8IxihdxtvjHAJGJso=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-P6oHq80mAdO/fa3fXlJRZ6jXM8gv2zztv+CiHnreB/Y=",
        "sourceCellIds": [
          "cv-show:narration:f360-studio",
          "cv-show:cue:f360.open",
          "cv-show:cue:f360.process:scroll",
          "cv-show:cue:f360.process",
          "cv-show:cue:f360.result:scroll",
          "cv-show:cue:f360.result",
          "cv-show:audio-clip:f360-studio:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-6Ebu0JeH8zmlNlsBjPLc4VmlRjlbeiSxQ/oqFMYaVkU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-znuzWiTpOMuq2tdwRyjMRWMi9xWBVCP9bLzj6fRHgUA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-DwzrR4+BRsQoAGgOTsXMyjePr01sErD2ZCajhsH41vk=",
        "entryId": "autobox",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-VBi4gGp8+1y/Df81/PTrFnO7rb2TeC1OmMeqAP7dtmA=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-zKo9rXu/DgjzJEak34ri0gwsr7cki8v1hLqyHx49Cv0=",
        "sourceCellIds": [
          "cv-show:narration:autobox",
          "cv-show:cue:autobox.open",
          "cv-show:cue:autobox.video-01:scroll",
          "cv-show:cue:autobox.video-01",
          "cv-show:cue:autobox.video-02:scroll",
          "cv-show:cue:autobox.video-02",
          "cv-show:cue:autobox.video-03:scroll",
          "cv-show:cue:autobox.video-03",
          "cv-show:cue:autobox.video-04:scroll",
          "cv-show:cue:autobox.video-04",
          "cv-show:cue:autobox.video-05:scroll",
          "cv-show:cue:autobox.video-05",
          "cv-show:cue:autobox.video-06:scroll",
          "cv-show:cue:autobox.video-06",
          "cv-show:cue:autobox.video-07:scroll",
          "cv-show:cue:autobox.video-07",
          "cv-show:cue:autobox.video-08:scroll",
          "cv-show:cue:autobox.video-08",
          "cv-show:cue:autobox.video-09:scroll",
          "cv-show:cue:autobox.video-09",
          "cv-show:audio-clip:autobox:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-gjpm2BzQ3+DOBHHArUWQMG+brHfhP8gAJR3LYzlTe2E="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-PSlxWKHMtOSPDeDSAUej7TX+OUhBp8ab3RobdUqR/w8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-LS/wvx41nEzctYJlLbbIJezpa372Z/ePSmUVbDhSQZI=",
        "entryId": "complexscan",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-eq6FtPPwkaZpSOO6+sWw726J/9XCpXEB5SfWNSF7yW0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-CIm1u3tH6Kp4jE015OG52H/OIw/GXPCB7StcOmllbNY=",
        "sourceCellIds": [
          "cv-show:narration:complexscan",
          "cv-show:cue:complexscan.open",
          "cv-show:cue:complexscan.line:scroll",
          "cv-show:cue:complexscan.line",
          "cv-show:cue:complexscan.video-01:scroll",
          "cv-show:cue:complexscan.video-01",
          "cv-show:cue:complexscan.video-02:scroll",
          "cv-show:cue:complexscan.video-02",
          "cv-show:cue:complexscan.delivery:scroll",
          "cv-show:cue:complexscan.delivery",
          "cv-show:cue:complexscan.boothbot-open:scroll",
          "cv-show:cue:complexscan.boothbot-open",
          "cv-show:cue:complexscan.boothbot-gallery:scroll",
          "cv-show:cue:complexscan.boothbot-gallery",
          "cv-show:cue:complexscan.boothbot-catalog-ready:scroll",
          "cv-show:cue:complexscan.boothbot-catalog-ready",
          "cv-show:audio-clip:complexscan:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-eS7KMgLnmMRIHLZa3ZCtvVYfUbta+gojrQ0HqmkE6hA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-PwhzgCCQi0AFF/znw6joZfpUI1GEzMirtJVE9dvHFeE=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-sOzLj/OUrrksQhxTqCFkg7Zj4OUwrK9xc7WrHd/TW7I=",
        "entryId": "photopizza",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-g3wmp0bPoNh+Km87gvQXWimcz4B62uq4QoJqEJ3T6ms=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-Mou2DdHLPse0rJpvnVn6y9fkxTKvjBLxEkVh4tonx74=",
        "sourceCellIds": [
          "cv-show:narration:photopizza",
          "cv-show:cue:photopizza.open",
          "cv-show:cue:photopizza.origin:scroll",
          "cv-show:cue:photopizza.origin",
          "cv-show:cue:photopizza.megavisor-promo:scroll",
          "cv-show:cue:photopizza.megavisor-promo",
          "cv-show:cue:photopizza.page-open:scroll",
          "cv-show:cue:photopizza.page-open",
          "cv-show:cue:photopizza.video-01:scroll",
          "cv-show:cue:photopizza.video-01",
          "cv-show:cue:photopizza.video-02:scroll",
          "cv-show:cue:photopizza.video-02",
          "cv-show:cue:photopizza.mechanics:scroll",
          "cv-show:cue:photopizza.mechanics",
          "cv-show:cue:photopizza.controller:scroll",
          "cv-show:cue:photopizza.controller",
          "cv-show:cue:photopizza.video-03:scroll",
          "cv-show:cue:photopizza.video-03",
          "cv-show:cue:photopizza.video-04:scroll",
          "cv-show:cue:photopizza.video-04",
          "cv-show:cue:photopizza.video-05:scroll",
          "cv-show:cue:photopizza.video-05",
          "cv-show:cue:photopizza.spinner:scroll",
          "cv-show:cue:photopizza.spinner",
          "cv-show:audio-clip:photopizza:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-rxmrXyNwEwkcjSsODgAJBwr1r1YuOf1u7JDZqvwHEWU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-hed0POh9/bQd0evkUsiV7b7Sjg0xoxx/D1MUqQBKRwk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-NMK08ng0yJHm/sUqkZNGcXPKQ126y22LysMKz+wPURk=",
        "entryId": "finale",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-NhIIa/JtwaokJR7tTRXEojfCCKFBEM/GKeWfYysCqfg=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-2Q3zKvxa+VHQ5CGdCOG5QAhghQrurpEeHRV+45jGYTs=",
        "sourceCellIds": [
          "cv-show:narration:finale",
          "cv-show:cue:finale.map",
          "cv-show:cue:finale.history:scroll",
          "cv-show:cue:finale.history",
          "cv-show:cue:finale.scale-route:scroll",
          "cv-show:cue:finale.scale-route",
          "cv-show:cue:finale.workspace:scroll",
          "cv-show:cue:finale.workspace",
          "cv-show:cue:finale.actions:scroll",
          "cv-show:cue:finale.actions",
          "cv-show:cue:finale.contacts:scroll",
          "cv-show:cue:finale.contacts",
          "cv-show:audio-clip:finale:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-g7lVARDu3XnuA0q3j62o1xF0romblD7ijEiv+sRJAZ0="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-50zwX8cQtElV6OtHomeC4JWGj98Qh4QIaP1V1jN+Lp8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-bIuRCKQ8ilDxqC3DRqYpYSITUy6birvAnbsIneSQhV4=",
        "entryId": "workspace-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-9slOMn9LDieJea8czw4QWUsjv2UD0JkhmzQPw9Ml8lA=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-0+GskdT+d9TrDSahaSvn5xtbQ2XJopUaTXWmkQ6Q3Ns=",
        "sourceCellIds": [
          "cv-show:narration:workspace-details",
          "cv-show:cue:workspace-details.flow-frame",
          "cv-show:cue:workspace-details.flow-route:scroll",
          "cv-show:cue:workspace-details.flow-route",
          "cv-show:cue:workspace-details.artifact:scroll",
          "cv-show:cue:workspace-details.artifact",
          "cv-show:cue:workspace-details.hosts:scroll",
          "cv-show:cue:workspace-details.hosts",
          "cv-show:audio-clip:workspace-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-3zyUlNgabmlylr18384q6gWAKkcHodY3VKOqtXpDJYE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-wynZRFWp9JWcnYLGgI1RlVNUag6DazM6CA2sFNkoyhI=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-whYfl80RajkiQbAdx1AjlQc3CSVvq/2aoIzdKn/a+Fs=",
        "entryId": "symbiote-ui-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-v/KQv08wMsy0LuLx37WHfZRZEoPtRCkxSNsU3vWxMk4=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-szFDkgKGCCAfIhojrbMFXU6owfyGREz7bPgrSFjF+uM=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-ui-details",
          "cv-show:cue:symbiote-ui-details.composition",
          "cv-show:cue:symbiote-ui-details.catalog:scroll",
          "cv-show:cue:symbiote-ui-details.catalog",
          "cv-show:cue:symbiote-ui-details.manifest:scroll",
          "cv-show:cue:symbiote-ui-details.manifest",
          "cv-show:cue:symbiote-ui-details.workspace-route:scroll",
          "cv-show:cue:symbiote-ui-details.workspace-route",
          "cv-show:audio-clip:symbiote-ui-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-ZWZGd9LrmaR4dvHp71DUbJNSJ9NiSg/iXpfdSsQ8Epc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-AqFnLkNA/gDkWdlbcdjp+O+9gqMzZLdCSjWiJk3jq4I=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-kyQ1czJy2MQgfutnh1VRL4G6e/cV86Y/Pg59QCsL4oA=",
        "entryId": "symbiote-engine-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-WpRG0hgSbD7qWPki1HCbVOGbCIXT6HGGd20nv672eTI=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-bG1UB0qMT+LAB1I19GM9mku8xzhfpItO+axQ0AVN0X0=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine-details",
          "cv-show:cue:symbiote-engine-details.layers",
          "cv-show:cue:symbiote-engine-details.execution:scroll",
          "cv-show:cue:symbiote-engine-details.execution",
          "cv-show:cue:symbiote-engine-details.demo:scroll",
          "cv-show:cue:symbiote-engine-details.demo",
          "cv-show:audio-clip:symbiote-engine-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-YijS0ylZgVJYmrHANZyM0I+zCNT+RkqbQZD22CDOSlg="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-FS+VJDwJFfYszGhc43+G0DVJjIS7d2uxq8juO5/U0Sw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-d4Wk6Fad/Y+1CaaDpub70YYX2pz/WnmYDdkDxM69giA=",
        "entryId": "agent-portal-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-aaDFGCfljfidqpGV4MEDuqnEr/usW5KDfOGj0xMgajE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-cA0CivFNUC2/8RMMk0Q7iLhQcUJOMyBEehY0hP1bs3o=",
        "sourceCellIds": [
          "cv-show:narration:agent-portal-details",
          "cv-show:cue:agent-portal-details.gallery",
          "cv-show:cue:agent-portal-details.board:scroll",
          "cv-show:cue:agent-portal-details.board",
          "cv-show:cue:agent-portal-details.settings:scroll",
          "cv-show:cue:agent-portal-details.settings",
          "cv-show:cue:agent-portal-details.architecture:scroll",
          "cv-show:cue:agent-portal-details.architecture",
          "cv-show:cue:agent-portal-details.resource-groups:scroll",
          "cv-show:cue:agent-portal-details.resource-groups",
          "cv-show:audio-clip:agent-portal-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-bE09TaQzhp+h4Bq4s/UanAzEzWYEpdBYv3EFqYtmIq4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-HTqvv1jk/8ppdLSW21p4iDUvaVYwEhda+9B9DnJ3gWc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Hs4mVGom+3PoWKS9U+izdbxkz3gUaA8wRhD8/ft+PmU=",
        "entryId": "video-studio-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-jkNBbzuhSodveC9l7PL7oWKp9CVIgeVZ7ey/nlz9TCE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-3BwwEdNVvjnSCpy++Z/apvxxoYPCZbWkUZ2tIrHNxXg=",
        "sourceCellIds": [
          "cv-show:narration:video-studio-details",
          "cv-show:cue:video-studio-details.flow",
          "cv-show:cue:video-studio-details.route:scroll",
          "cv-show:cue:video-studio-details.route",
          "cv-show:cue:video-studio-details.demo:scroll",
          "cv-show:cue:video-studio-details.demo",
          "cv-show:audio-clip:video-studio-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-J9Y+bWf8mW2xhwRdZf7FiTHhzfSSv9CUcKMLSngCsAs="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-GGIR5NDLFEwyH4oP4SGXRxlvLm2IzKzcUI8HHVoD8ro=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-pTDO5rRsPEd7S6rnFmtJ87GbD/G6qYyiw3+4upP4a5Q=",
        "entryId": "maximo-workbench-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-TwVkfkfYlbymUT/gJu7dB7zUGEz3fr1muNxPkeh/UAk=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-I6KngwFvqUvNhMKsWmRhHRUIT0FPmZ4D4n9o7wywJqs=",
        "sourceCellIds": [
          "cv-show:narration:maximo-workbench-details",
          "cv-show:cue:maximo-details.work-order",
          "cv-show:cue:maximo-details.asset:scroll",
          "cv-show:cue:maximo-details.asset",
          "cv-show:cue:maximo-details.actions:scroll",
          "cv-show:cue:maximo-details.actions",
          "cv-show:cue:maximo-details.demo-1:scroll",
          "cv-show:cue:maximo-details.demo-1",
          "cv-show:cue:maximo-details.demo-xr:scroll",
          "cv-show:cue:maximo-details.demo-xr",
          "cv-show:audio-clip:maximo-workbench-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-492HP5snybTVFt/blQnQMDBJMIGimQSDYeIr6TpL07Y="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-vb7+jCe9xozucC5sy+XueN3RHFVf0I5HZ61bpVX8V98=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-But1VG2MD44GGzgBqWekxHvL6rjvCwjfVqtQMwLzaWY=",
        "entryId": "agent-pool-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Waq5UXv6mfj0GC5HCjifNJp2Ccc6nchz2hx+fMLyF4c=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-aRdam/AcgMIVFfn5F+7jAoZJrhkdX61Z6U9fY98W0wY=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-details",
          "cv-show:cue:agent-pool-details.runtime",
          "cv-show:cue:agent-pool-details.work:scroll",
          "cv-show:cue:agent-pool-details.work",
          "cv-show:cue:agent-pool-details.review:scroll",
          "cv-show:cue:agent-pool-details.review",
          "cv-show:cue:agent-pool-details.result:scroll",
          "cv-show:cue:agent-pool-details.result",
          "cv-show:audio-clip:agent-pool-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-XG1ARgu5EcUuNyKOjH98vZ8dWVdWI5KLWqPI4YyJMsk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-04zHxYD7/Net9HZNWc0qTR+X9tYeYvYguUIVcFGbhL0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-899Sdhy3mayybCxX4wR6HKMt0b4uNDPQl/AzrvpnP/U=",
        "entryId": "project-graph-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Fx4exz4ctNWGtxH01jPjx4v0afwLzHVgwySfzkHTUTE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-kLikhFYOXjIN7lXfKEhiwZ/zvUuvGxPE647iP74m4KE=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-details",
          "cv-show:cue:project-graph-details.root",
          "cv-show:cue:project-graph-details.skeleton:scroll",
          "cv-show:cue:project-graph-details.skeleton",
          "cv-show:cue:project-graph-details.fact:scroll",
          "cv-show:cue:project-graph-details.fact",
          "cv-show:cue:project-graph-details.focus:scroll",
          "cv-show:cue:project-graph-details.focus",
          "cv-show:audio-clip:project-graph-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-9PirKqiDy3ODgdwSNjbbxr/TE/LhDNA/zvzpm9leC3s="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ut/GU6jLroudiLGplaf7eNx7qEvXtDcwlscu3IpsQ+Q=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CD9yb24P9Z4e0i7nlxRZ/G6qdMKlMnr3cko2ufU8aQk=",
        "entryId": "lifecycle-platform-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-fj7ow9qrz7DPtuwxSe63gScSCUxNxZvzlVW3utxyA6A=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-vulvX1OjIRTJi9ONkjNKnPbqcWNhAFchetqPBpqpniU=",
        "sourceCellIds": [
          "cv-show:narration:lifecycle-platform-details",
          "cv-show:cue:lifecycle-details.product",
          "cv-show:cue:lifecycle-details.runtime:scroll",
          "cv-show:cue:lifecycle-details.runtime",
          "cv-show:cue:lifecycle-details.delivery:scroll",
          "cv-show:cue:lifecycle-details.delivery",
          "cv-show:cue:lifecycle-details.route:scroll",
          "cv-show:cue:lifecycle-details.route",
          "cv-show:cue:lifecycle-details.twin:scroll",
          "cv-show:cue:lifecycle-details.twin",
          "cv-show:audio-clip:lifecycle-platform-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-sVgffeXvDFuWJI8emd757r1kTq6SoIMEhWAaonDv9oY="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-RjSNpeUpz8R53TnAzomnb6HwV1gyy6eqZK+qdkXF724=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-MuDzvffrqFa9JCuELzHmb3KhB3YKglj7RTfWSmF3xwI=",
        "entryId": "mobile-smm-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-0zho++swEjzwwe/seNAUFkAE97Ce1DBhvA5bkUvzuWU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-U+S7J4EaiGhWa1LRCrk92WUmKxaeehXxpIRE5boIg10=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-details",
          "cv-show:cue:mobile-smm-details.gallery",
          "cv-show:cue:mobile-smm-details.schedule:scroll",
          "cv-show:cue:mobile-smm-details.schedule",
          "cv-show:cue:mobile-smm-details.queue:scroll",
          "cv-show:cue:mobile-smm-details.queue",
          "cv-show:cue:mobile-smm-details.ui-change:scroll",
          "cv-show:cue:mobile-smm-details.ui-change",
          "cv-show:cue:mobile-smm-details.draft:scroll",
          "cv-show:cue:mobile-smm-details.draft",
          "cv-show:cue:mobile-smm-details.approval:scroll",
          "cv-show:cue:mobile-smm-details.approval",
          "cv-show:audio-clip:mobile-smm-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-57Vi68wcjipvH1qeNgQ2u9hORLug1WbfOxROZUF8HJc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-uKWY3T5D8B92Nt7nQJdH7sniI6ImPdHvQvOc/ZdVZFw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-n+00zZxJ3k2ftGh/oGtcr/9/J0cl1DV4Qk6aql8Uemo=",
        "entryId": "f360-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-tRVCIG6IhWL/r/3YQOLrk0W9JO1Gk8yQbdj1XqdEawY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-FQxh1Skna4v3LsDLTJ044NiUTMfRxCQqq5jc7K50Dj4=",
        "sourceCellIds": [
          "cv-show:narration:f360-details",
          "cv-show:cue:f360-details.path",
          "cv-show:cue:f360-details.result-one:scroll",
          "cv-show:cue:f360-details.result-one",
          "cv-show:cue:f360-details.period:scroll",
          "cv-show:cue:f360-details.period",
          "cv-show:audio-clip:f360-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-zhrvxn74QtOT2rPdTgiJVaARUt4q9WiJxD4bFBG/ISY="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-SfethfxkdWJplTiNwQPQfXxyi/R635F2liXiK/ncfRQ=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-EFMF1cD/C2Vdk/2jqrl3EApmLc5BPkNCeOs9DKJU8Co=",
        "entryId": "autobox-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-+B/hREMFDy+GX3N9Ll4GK6WiLiB55QG0bH86hrKFNek=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-4lr+LnH/rwSVkJZ7O3+QPYD2iNOO9RA6AOeSlvvnfAM=",
        "sourceCellIds": [
          "cv-show:narration:autobox-details",
          "cv-show:cue:autobox-details.working-system",
          "cv-show:cue:autobox-details.working-route:scroll",
          "cv-show:cue:autobox-details.working-route",
          "cv-show:cue:autobox-details.video:scroll",
          "cv-show:cue:autobox-details.video",
          "cv-show:cue:autobox-details.bronze:scroll",
          "cv-show:cue:autobox-details.bronze",
          "cv-show:audio-clip:autobox-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-SpRZkZqPBq0pP2V2V0URlZM3iWrfYD0qyNtdGzML36s="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-LNYDLP2BrYMWwRgWEkGvZ644NhAtwu98ctv9O360sug=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-D6jUWjPnVd/LsYJ+mdNzn7kBxWfo6sOYbNTT2YgwrvM=",
        "entryId": "complexscan-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-0kos5K0Ps8CJgJ6Rpv0MxjC2kfVWS3Gc/hVDUMG5qlU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-X3QmfQyYZAGvXb6ryUPLHN65BJQxFDEFevQwzn+DDwA=",
        "sourceCellIds": [
          "cv-show:narration:complexscan-details",
          "cv-show:cue:complexscan-details.platform",
          "cv-show:cue:complexscan-details.light:scroll",
          "cv-show:cue:complexscan-details.light",
          "cv-show:cue:complexscan-details.gallery:scroll",
          "cv-show:cue:complexscan-details.gallery",
          "cv-show:cue:complexscan-details.autobox:scroll",
          "cv-show:cue:complexscan-details.autobox",
          "cv-show:audio-clip:complexscan-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-v3O6o6HPdlPo3MNQP28gXFeBK3LtgY9LmqbIPdQo0ew="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-3wsztHtvr3d0s1WyjWea8m0s39KLf/vCt+rvslrAl6M=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ZEc6vZeHt6obZ1ongAFs+Q9MqkR225knA68PJs/lMB8=",
        "entryId": "photopizza-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-tGXoT8ySCvrddZn2t2sMSYNkOMxoFctMuwcEqZmuKGk=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-3Bm6He/hBCtIYbEtaJ+t+QZa3OfkgCVfTjMHKTiJ1AY=",
        "sourceCellIds": [
          "cv-show:narration:photopizza-details",
          "cv-show:cue:photopizza-details.origin",
          "cv-show:cue:photopizza-details.attribution:scroll",
          "cv-show:cue:photopizza-details.attribution",
          "cv-show:cue:photopizza-details.documentation:scroll",
          "cv-show:cue:photopizza-details.documentation",
          "cv-show:cue:photopizza-details.media:scroll",
          "cv-show:cue:photopizza-details.media",
          "cv-show:audio-clip:photopizza-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-pl5FPD9FH9I3QS/DaGDZ0lLLQAIXmc9vmG669JXLmMQ="
      }
    ],
    "hash": "cv-show-audio-provenance-v1:sha256-0lZpRmAdR99rCgHc441oRp3zhf9mWkdbb0zDnDwuHu4=",
    "schemaVersion": "cv-show-audio-provenance-v1",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "artifactTreeHash": "cv-show-audio-artifact-tree-v1:0332cdd05f461a3c1f7e9a9b14cf1820f054ad895752451893df74bc22569220",
  "entryReleaseIds": [
    "cv-show-audio-entry-release-v1:7dc09c5ebbc20ed676ae92bb46730e502ed384c75268e25e4fd79cf555c903d1",
    "cv-show-audio-entry-release-v1:5641efd9f618d94aac255ba74501775f5b682a483e6eb36653889b509e38c9e5",
    "cv-show-audio-entry-release-v1:e07ba084658cb1c3717550593fa84dd34fe31eed956a2a1b9a1854a1e3cecfba",
    "cv-show-audio-entry-release-v1:95630bce45a60190e8f418f12f7a13cc1acb5d6ac562244e0b0ee0a3e0099e46",
    "cv-show-audio-entry-release-v1:ecc8ec92b4129513335c5b38ecd5f508e795f1c9c9dfae1a9e9bf4ce5bb92e8d",
    "cv-show-audio-entry-release-v1:63e6e716d0580e07ef59ba4eadd2b95565cf9f42d6f74c5e65bc5606cc94b807",
    "cv-show-audio-entry-release-v1:42738210fa1f109346174b5e1e008209a2581f16cc12c59e3abd1b3b93f89e16",
    "cv-show-audio-entry-release-v1:7ebaa81bc2db56efb2db5b2ff888b5a5799f037caaa48b7fb96d3c836d640102",
    "cv-show-audio-entry-release-v1:56da26433e4ca51fd71d8db7471182de96bf18e7d9728bb6fe0e512afeaec1dc",
    "cv-show-audio-entry-release-v1:bdf9802dbb323e8a495bb5f8110efd8ac0603cb9b7855e65feb1b9c03f3ede9f",
    "cv-show-audio-entry-release-v1:3a97b0dc1ebb8d0d4550edda3c8aa71d5c33da85f8c2581c4c4df76751afd2a5",
    "cv-show-audio-entry-release-v1:6be6fb708552681dbcf98c1f4c85daf1fc35261e0eba88f699519a729b7e61ff",
    "cv-show-audio-entry-release-v1:94448ed3c8b97444c712553f5eb6b855c55e7a42e8b75c0036e11f1486467315",
    "cv-show-audio-entry-release-v1:752ec7dde8bfce8873d8f146b76b211131362d7c830a6b474c75b7ef3157fa09",
    "cv-show-audio-entry-release-v1:5cc39e0f06bf452579d4ba90f7224946d882194d345ebcacd071eb3879ae1317",
    "cv-show-audio-entry-release-v1:9299e9ced9457090ae369a2166e5d447757b4d8d248b997be3e7be4fa02b1b6c",
    "cv-show-audio-entry-release-v1:b2bd37bd1e1338bb8b4f9f5f7c48938a4450ffbf9b762c44258b685325c31bbe",
    "cv-show-audio-entry-release-v1:89a710371cf8198410a512e98e9be4b33f73c1352060580c19068546b6b08552",
    "cv-show-audio-entry-release-v1:fc61203f18f36609573631db350701183b37708165ae9bcf32f4b0a0dbaad3c7",
    "cv-show-audio-entry-release-v1:b38ba9670f90c63ef13d76b8ab1b4a0ab308f657566ca1ed0e43a2af9a7f1e35",
    "cv-show-audio-entry-release-v1:ec644bdf1211af9432bd60d4331c1e39e72abdb064e9690e61ec0cb64ce1ead9",
    "cv-show-audio-entry-release-v1:31e891aefeb50ab3ccfd881444ab297b6c196a1502f1f4ff2edbe33b501ca075",
    "cv-show-audio-entry-release-v1:7a4245ed4bf6eaebda6649448966a2fd51a51fbcbd6977cdc3c6cb6153aa5210",
    "cv-show-audio-entry-release-v1:b28c376f11e967e741b069650816af24bc8b8d2178c3abf1163bc59bcabb0ed0",
    "cv-show-audio-entry-release-v1:a4f8aff873f0a324220dc6f162d292ae2b943cfe2bd76f67c21e62601d1eb408",
    "cv-show-audio-entry-release-v1:db476098995df9a9718b660a3d5e899ff331ed2b2f911917349dad4b17222728",
    "cv-show-audio-entry-release-v1:09bf0ecb4890fe7939e44ef1a68642b96329418f4d2b69dcf2c65905769fa486",
    "cv-show-audio-entry-release-v1:73406ac884a8fb3421124f4fe7409f0445eb052d0f39fa719759742613247c1e",
    "cv-show-audio-entry-release-v1:5245e6d5ae01cec4cdb9a9008401b71d8a6866665db42f96b2990bbe91d00685",
    "cv-show-audio-entry-release-v1:95e05c508146b506f9ee2b705f80ba7ac3099c16d87c7a595a2db35b1ccb6dc2"
  ],
  "manifests": {
    "alignment": {
      "model": "large-v3-turbo",
      "path": "alignment/large-v3-turbo/36d2d0b97e3f5c60/manifest.json",
      "sha256": "03cbbb179518e3b88cd50da6a5d22ecdbbae149be98fa3a7d4e81e8657344e53",
      "size": 3849790
    },
    "audio": {
      "path": "manifest.json",
      "sha256": "d1ccadb06e91430639606aedd2b2b63540c3f1d2ea2f46ae2bf225eb2184ca0f",
      "size": 81297
    },
    "directory": "0332cdd05f461a3c1f7e9a9b14cf1820f054ad895752451893df74bc22569220",
    "locale": "ru",
    "voice": "barzana-2"
  },
  "mediaCollectionIdentity": {
    "collectionId": "cv-show:34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
    "identity": "cv-show-authoring-media-collection-v1:sha256-iMFhk0ASRJSaQlYJMQZP8yljdOO3Xm6xRPOjkJwP3eA=",
    "manifestHash": "cv-show-media-manifest-v1:sha256-n1Ewl/E2rJeQVvIWZfbNz+MaxL/pJuHS0m1Okjv9/jY=",
    "schemaVersion": "workspace-presentation-media-collection-v1"
  },
  "planId": "cv-show-audio-release-plan-v1:78e9fb2ac553fa79c7d99cd8d513150a47b4b35113dcfb92c0acdfaf23d2f387",
  "predecessorReleaseId": "cv-show-audio-release-v1:effc43f3f64aa1c56699ecb455770b063dad95bf148c7b8539598e1165255945",
  "profiles": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WJXMA0f9i4DwyS1CYrZ3FSAznMtAbhDA/lcaYjQVtNY=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-xkDP1BOrbemy4iknmMC7Vj4rwXfu/OsnY5Q7ZPGcfIc=",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "project": {
    "authoringProjectHash": "workspace-presentation-authoring-project-v2:sha256-jl0di8c+j3Txao/pmwEUIIAP+t6vh38RWPrVqJ1A/G0=",
    "revision": 97
  },
  "releaseId": "cv-show-audio-release-v1:1e7c05f1334becee2858e3c6651cae664c20868e1a7ebe905b88271fc2d96500",
  "schemaVersion": "cv-show-audio-release-v1",
  "verificationHash": "cv-show-audio-release-verification-v1:d0b09cff5ac9f2477059d2a4b0fdfbeedca4f5a93992b2ed86832e47531b70d9"
}
/* CV_SHOW_AUDIO_RELEASE_INPUT:END */
);

function cvShowMetadata(project) {
  const value = project.script.metadata?.cvShow;
  if (!value?.entries || !value?.directives) {
    throw new TypeError('CV Show presentation project metadata is invalid');
  }
  return value;
}

function directiveMetadataForTurn(project, entryId) {
  const cvShow = cvShowMetadata(project);
  const directives = cvShow.directives;
  const sourceOrder = cvShow.slice?.sourceCellIds;
  const cells = sourceOrder
    ? sourceOrder.map((cellId) => project.cells.find(({ id }) => id === cellId)).filter(Boolean)
    : project.cells;
  return cells
    .filter((cell) => (
      cell.kind === 'cue' && cell.turnId === entryId && !cell.id.endsWith(':scroll')
    ))
    .map((cell) => [cell.id, directives[cell.id] || { refinements: {} }]);
}

function directiveId(cellId) {
  return cellId.replace(/^cv-show:cue:/u, '');
}

function directiveType(cell, refinements) {
  if (cell.cue.kind === 'focus') return 'frame';
  if (cell.cue.kind === 'annotation') return 'marker';
  if (cell.cue.interaction?.type === 'navigate') return 'navigate';
  if (
    Object.hasOwn(refinements, 'mode')
    && (Object.hasOwn(refinements, 'action') || Array.isArray(refinements.frames))
  ) return 'media';
  if (cell.cue.interaction?.type === 'select') return 'native-selection';
  if (Array.isArray(refinements.actions)) return 'chat-action';
  return 'activate';
}

function projectSourceDirective(project, cellId) {
  const cell = project.cells.find(({ id }) => id === cellId);
  const value = cvShowMetadata(project).directives[cellId];
  if (!cell || !value) throw new TypeError(`Unknown CV Show directive cell: ${cellId}`);
  const refinements = structuredClone(value.refinements || {});
  const annotation = cell.cue.kind === 'annotation' ? cell.cue.annotation : null;
  if (Object.hasOwn(refinements, 'fromMilliseconds')) {
    refinements.startMs = refinements.fromMilliseconds;
    delete refinements.fromMilliseconds;
  }
  if (Object.hasOwn(refinements, 'toMilliseconds')) {
    refinements.endMs = refinements.toMilliseconds;
    delete refinements.toMilliseconds;
  }
  return freezeDeep({
    id: directiveId(cell.id),
    type: directiveType(cell, refinements),
    ...(cell.cue.targetId ? { target: cell.cue.targetId } : {}),
    policy: value.policy,
    ...refinements,
    ...(annotation ? {
      intent: annotation.intent,
      ...(annotation.marker ? { shape: annotation.marker } : {}),
      ...(annotation.label ? { label: annotation.label } : {}),
      ...(annotation.series ? { series: annotation.series } : {}),
      ...(annotation.quote ? { quote: annotation.quote } : {}),
      ...(annotation.occurrence ? { occurrence: annotation.occurrence } : {}),
    } : {}),
    timing: cell.timing.at.anchor === 'turn-start'
      ? { phase: 'setup' }
      : {
          phase: 'speech',
          anchor: cell.timing.at.anchor,
          quote: cell.timing.at.quote,
          occurrence: cell.timing.at.occurrence,
          edge: cell.timing.at.edge,
          offsetMs: -cell.timing.leadMs,
        },
  });
}

export function projectCvShowAttentionTimelines(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  return freezeDeep(Object.fromEntries(
    Object.keys(cvShowMetadata(project).entries).map((entryId) => {
      const directives = directiveMetadataForTurn(project, entryId);
      const setup = directives.find(([cellId]) => (
        project.cells.find(({ id }) => id === cellId)?.timing.at.anchor === 'turn-start'
      ));
      const speech = Object.fromEntries(directives
        .filter(([cellId]) => (
          project.cells.find(({ id }) => id === cellId)?.timing.at.anchor === 'speech'
        ))
        .map(([cellId]) => {
          const cell = project.cells.find(({ id }) => id === cellId);
          return [directiveId(cellId), { quote: cell.timing.at.quote, leadMs: cell.timing.leadMs }];
        }));
      return [entryId, { setup: setup ? directiveId(setup[0]) : '', speech }];
    }),
  ));
}

export function projectCvShowStory(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const cvShow = cvShowMetadata(project);
  const entries = timeline.turns.map((turn) => {
    const value = cvShow.entries[turn.id];
    if (!value) throw new TypeError(`Unknown CV Show entry: ${turn.id}`);
    const parent = turn.replyTo || (cvShow.slice?.turnId === turn.id ? cvShow.slice.parent : null);
    return freezeDeep({
      id: turn.id,
      ...(parent ? { sceneId: parent } : {}),
      ...(value.period ? { period: value.period } : {}),
      ...(value.projectId ? { projectId: value.projectId } : {}),
      directives: directiveMetadataForTurn(project, turn.id)
        .map(([cellId]) => projectSourceDirective(project, cellId)),
      ...(value.branchId ? { branchId: value.branchId } : {}),
      ...(value.return ? { return: structuredClone(value.return) } : {}),
      ...(value.title ? { title: value.title } : {}),
      subtitle: value.subtitle,
      speech: turn.text,
      chat: structuredClone(value.chat),
    });
  });
  const scenes = entries.filter((entry) => !entry.sceneId);
  const branches = Object.fromEntries(entries
    .filter((entry) => entry.sceneId)
    .map((entry) => [entry.id, entry]));
  return freezeDeep({
    version: cvShow.storyVersion,
    contractRevision: cvShow.contractRevision,
    conversationRevision: cvShow.conversationRevision,
    narrationLocale: cvShow.narrationLocale,
    runtimePolicy: structuredClone(cvShow.runtimePolicy),
    short: scenes.map(({ id }) => id),
    scenes,
    branches,
  });
}

export function projectCvShowDirective(projectCell, projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const cellId = projectCell.id.endsWith(':scroll')
    ? projectCell.id.slice(0, -':scroll'.length)
    : projectCell.id;
  return projectSourceDirective(project, cellId);
}

export const CV_SHOW_PRESENTATION_PROJECT = createPresentationAuthoringProject(
  CV_SHOW_AUTHORING_PROJECT_INPUT,
);
export const CV_SHOW_MEDIA_BINDINGS = freezeDeep(Object.fromEntries(Object.entries(
  cvShowMetadata(CV_SHOW_PRESENTATION_PROJECT).entries,
).map(([entryId, value]) => [entryId, structuredClone(value.media)])));
export const CV_SHOW_PRESENTATION_TIMELINE = createPresentationAuthoringTimelineProjection(
  CV_SHOW_PRESENTATION_PROJECT,
);
export const CV_SHOW_PRESENTATION_PROJECT_HASHES = createPresentationAuthoringProjectHashes(
  CV_SHOW_PRESENTATION_PROJECT,
);
export const CV_SHOW_STORY = projectCvShowStory(CV_SHOW_PRESENTATION_PROJECT);
export const CV_SHOW_ATTENTION_TIMELINES = projectCvShowAttentionTimelines(
  CV_SHOW_PRESENTATION_PROJECT,
);
