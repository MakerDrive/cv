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
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-+F/LbfxEcmB2hnTnvdQAdG+9+1QfDYRRPAeieHY6laU=",
      "contentHash": "sha256:f2ad321ede2c25296cb5c89aecdf16ac7f0eb06a67f54261801dc9b4a0f0ee82",
      "durationMs": 32160,
      "id": "cv-show:audio:positioning",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-2u3hU+KHdynv0+zLGxqPisQIIlylyFqeDioCz1l3GbM="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-I6uoUqUBCRp76sfJ0e4oSg3OG96y5XuEQWi9RKrRYss=",
      "contentHash": "sha256:04def085eccc94eec8b21327dab5e6e5c454cc3c498ebc9ff8e2064461358c5a",
      "durationMs": 23910,
      "id": "cv-show:audio:symbiote-workspace",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-ZGwQrurNHOr9u7x+ZQ6A6rEVOAn4gjlJPOIV09xgSUo="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-sjBAP3KVDuNGZFjDkffKUuwRLIMEU7bTSoa7W1JnnN0=",
      "contentHash": "sha256:5ab8a4dddf5c59baee600e12b107d52bd632621cc0d5f2a1ae778fbfd46233ff",
      "durationMs": 28370,
      "id": "cv-show:audio:symbiote-ui",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-U5sb1Db6R5BabMkraBMEASUguVduNKE+cph9WT4GXBs="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-GeID0VUpGpUtgSGxmpT+YAXZC9NcdkC4A/f3IqcKRW4=",
      "contentHash": "sha256:103b25038b75b5de107d3d9c3d13165ade0cde21de4a694032fafe254d35af97",
      "durationMs": 15200,
      "id": "cv-show:audio:symbiote-engine",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-PzOY4auoLHXP92JPnCcEw4RwAimCNQx+OgZpuC/74qo="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-H5gAsEoW1cyHBBMCgv7OuJwm1VuqV0S88mWwQFoDBqI=",
      "contentHash": "sha256:1a6799d9624a41f4f2658cbcfc38ecd4b4f87e30dca00d340f34165da87bc387",
      "durationMs": 69920,
      "id": "cv-show:audio:agent-portal",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-dN41DuEBpzm6ETMpb+Bp4S1ydjjm+iAKTjk7W9Yjcic="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-qBsMLEq/fuw61Fnzvl3dpLhnKitD7H9j+JNJnegqqMA=",
      "contentHash": "sha256:48ce775c70f8233f99d1d9d1c42731d3784475d86ce6eb379f5e9d8878ab18a0",
      "durationMs": 19510,
      "id": "cv-show:audio:symbiote-video-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-FEtfkkztWhQzjUtK3QoymF7H7MdVTsR8/j9z5jChqZ8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-u0MHeXyYJgfALT5I2lz0hqmUXHSekfAZwVNg54qkTiY=",
      "contentHash": "sha256:cf509267118d43e06c9c40e5d7eb91ed33cd9ecb689cda5522f6bf97644f79ba",
      "durationMs": 25520,
      "id": "cv-show:audio:adaptive-maximo-workbench",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-ALb50OuzZ9noME4rLOqneulQtnHXvSEIhadSuI+h29U="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-L9JlNmhNT+4IQzOLX8IRmJm7anBYZRiL3FnWuIr/iO8=",
      "contentHash": "sha256:e1d09e85d25f5e57b1b37cabcc55ee8f5955d9b402d60e742f5824297f9ebdc2",
      "durationMs": 22610,
      "id": "cv-show:audio:agent-pool-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-/ySKn4aXXs9JJge17sY2P6exQplUzQcALKKCrDjA2ao="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-zUGqeZY57jwR2IOKDRgjRy4b26ZFte1RMJ8bnxr8EMs=",
      "contentHash": "sha256:470f154c45eba3426bf95f4346f16d9971483ba4872919ac03bbfbaaf186dba9",
      "durationMs": 38810,
      "id": "cv-show:audio:project-graph-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-724/UnGUjLxE6dgIc82SmehIWVg4+M7RBD/R68YQwPs="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-KuizwC2b5SJfYB2mjp1q20EqoFONX5vIamFDV7Sem0w=",
      "contentHash": "sha256:cfc14d92d0123a639ddaab07a0f79bc8e9469f0ed1327ec18c07173595787fb2",
      "durationMs": 38320,
      "id": "cv-show:audio:lifecycle-messaging-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-ydUxOrl3L4i4Hkp9+aBOK4AMW+yqtD2rdBb8anDycUU="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-5GAH2OASjLEWj2gOmz/LiPUXY3XhQajXIqcytx21E5I=",
      "contentHash": "sha256:9923da285e8b6825791ca863a51408dd1059e8531e472ec90637031310882e5e",
      "durationMs": 31420,
      "id": "cv-show:audio:mobile-smm-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-sOSAb9XNvcUgZSAWaQ/dJGMLDUWkHw5V0dkC+/b6wwI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-i680OAjFFqhGZ1mYgbeKo9RIrhDKZWTtGngdDQWHOY0=",
      "contentHash": "sha256:884effdb0f335433f927752c7eeb26d31d1eb2ae2c15260558430bbc252b95eb",
      "durationMs": 27900,
      "id": "cv-show:audio:f360-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-PKdfdO9fGh1iQHgI4IR4DhM1F4p941A5Zf1/G7XNCU8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-oMXzLDwPbi/5clFiIoeuOgq0NNFMQuYoLFZ7fUbmJ6I=",
      "contentHash": "sha256:4f5bce02c6bf8bb940aa4631a15cd9a481a0ab88df7d1c298b9967565a6c4456",
      "durationMs": 121280,
      "id": "cv-show:audio:autobox",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-zns4VQv8cvqVzQd7+n42yu2JXmZF2fpbXI5c97f1Dh4="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-13h/xGq7VSqr24eDFml7kcdFdgwZwBpJHMco0UaeJmc=",
      "contentHash": "sha256:d24b58728b952761ed49aba69db6d00683970191269115eac1d2bbdc94805933",
      "durationMs": 95010,
      "id": "cv-show:audio:complexscan",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-MudOQgH57mmRLnpTfdG1a+t1xQlPxfgnPAthg/68nsU="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-Njh22b6LvBJ5ZA8ltXtN7t16wuxQUe8nWPOzgkRO7vI=",
      "contentHash": "sha256:c383da42502eea708e3367108c8a82365fb47311df15ecfc0c4ad17d32a25843",
      "durationMs": 86080,
      "id": "cv-show:audio:photopizza",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-PeMJB374K2Hc7MYZ+6bFGjR3iBsj+Kh3yYqpCrPbh0w="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-3/v7C4dnMpHww9y4a+TtyT+RaePlpg7SpC30BVlwJ8g=",
      "contentHash": "sha256:55998a1fdce049efe8d88425076289eb53c1f64d6991d556a06729665fe06700",
      "durationMs": 30550,
      "id": "cv-show:audio:finale",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-OB7OEHyj11TqEft0b+OZrVjmcJh/Fom+zzUEJWv8oAk="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-xyqkp62n/w+BX7TDwiBNJf++u0uTclLL+N/N6V6TFUQ=",
      "contentHash": "sha256:0c404601661e4251401a4b6016a935d5edb189b7d99482115bf997b355e824a7",
      "durationMs": 29070,
      "id": "cv-show:audio:workspace-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-9yW5MROcgwVYAK0RnBmc7xc0I9OS21v45XUeMgUlrAA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-auZssrnGEC8BT0247CNGk2unHJcZMxiQlDls+qDS1zo=",
      "contentHash": "sha256:0fb03d28883796d06835976923cf836e182edf5e8aaaddc2b164400a46c52822",
      "durationMs": 24160,
      "id": "cv-show:audio:symbiote-ui-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-GwXYSlfLHSYdDcUvNJBcs8Zx9XI7q2i/tqbZ3PGoaJg="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-F7eGu9ToYcv46i/UcbP0cgBUW0U3QjYqE8cXgsj8Plg=",
      "contentHash": "sha256:d3f86fc104133ecf1d77afb4e2a9d902eb2abd7d86ac6e083edfc8e01a39fe88",
      "durationMs": 22970,
      "id": "cv-show:audio:symbiote-engine-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-+RIZT38oMvGRSwCC2k1VkygSsTkisdeS4ZEb7UkLnKY="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-EdBvgn7WgmP6d/KYyF6QA3v8V9n3DVAPht4tz+FiO+A=",
      "contentHash": "sha256:5c10e4ce97aae523fd221fcb389b73682fc031fc99ebb20250721101cadcbc55",
      "durationMs": 48960,
      "id": "cv-show:audio:agent-portal-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-tYXuX0I0RVZeHzVtXt5HabhW3zBodNl9U3dcgAYYfn0="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-R7OvxsS9ivnHAFOKshj0fpBISNrqy0DAJFzmlTD/k9U=",
      "contentHash": "sha256:823eb69844948acb90bcad1e6b7cfd94372699e3ece8db42ea9e72bc05c3d817",
      "durationMs": 29640,
      "id": "cv-show:audio:video-studio-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-x/zZnT9bQPi4eXVwDxJpZeJquDnTpiqoOKTg8NiOg64="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-zyf0Cs3j402P1cLYG3k13hlzk4x93I/DLttL/bgp/SI=",
      "contentHash": "sha256:ea7c3b69528b03f5d1ca3b122c2c4a48f90460387226d37666498f1cdb61893d",
      "durationMs": 32650,
      "id": "cv-show:audio:maximo-workbench-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-yqByhNi22rzaxyLbO8E+hZri453hodwesr8pJWY8k64="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-MAysqc9Y7SwZuCDHHgAFlayKnUqynu2DRr6Lrmf3TXM=",
      "contentHash": "sha256:f6b4b332ed56db47716f0bc579c49897ddcee2e13419f3b5f2b6dfc9c7e3d003",
      "durationMs": 29280,
      "id": "cv-show:audio:agent-pool-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-93nUeU+vEC5yVQ2KM+RwWnTCYQq4l/SP0Uo39liQtB8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-doJGQbCkN59UhduTpqaVNRJsgq+xij6XDGURXsmks2A=",
      "contentHash": "sha256:cc5a97dfc66b8fcb508def6c9d1ede2babf65fa712e8c4350b4884181aa1af7e",
      "durationMs": 23360,
      "id": "cv-show:audio:project-graph-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-msxvkmt7a+94R3uRMdpfDhNYqQKcUMVLV54Rxc4bYds="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-//tLsWxMidg7AcdQFjzJeCM1IrDhcbiq9mJNRPu5vg0=",
      "contentHash": "sha256:2a54f77aada55de8a83723706a416d43c98b56fbb8d1f3ebe7ca5e17e0600458",
      "durationMs": 40420,
      "id": "cv-show:audio:lifecycle-platform-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-EkNC6CgEVdMTtu5BlnLR0QTdl/7LjBiyF2JNFEGjwK0="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-zu/jiPi4Y8Z1k9hcLyPQvGqj/6MoG2rHtawiA2TWPDI=",
      "contentHash": "sha256:25dbd5b963b9cc8c7c4197af98df3b95ac3b9c6bc8f9dd2710455f2201a20d5d",
      "durationMs": 38000,
      "id": "cv-show:audio:mobile-smm-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-mPjlYYnwRUeq4nt5oZuntS0G1S0wEtehh8fLSc5u0Ho="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-m4Cd//n0sh1fVnRbIkKz/cF5j6PnarE5bf3yEw3gILE=",
      "contentHash": "sha256:0f9415d586250df8c1ee6e94f226cb9abb2d0c0af4580b95cc3f2edaaae26863",
      "durationMs": 32270,
      "id": "cv-show:audio:f360-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-pXFp+LVNNCB2UJynyllogkFdFcZ6fBpldgbtN8C6eZs="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-xFdlL3Su4IZzgVdPecW5nbxlM7Y4+XgboSEQ/+GEdIs=",
      "contentHash": "sha256:e9ec12b980c9afb8159c67789dc031f85240a9680f692940a79b12217dc5a8d8",
      "durationMs": 60400,
      "id": "cv-show:audio:autobox-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-P28gMNIVDoMZdM6kpxreQ4rR/dDXiNvvOHdsHP3bXWA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-GIJGRE3C0ISUoNh4V2V3zCMHnVJ9T5cQlBRSlvZbkvk=",
      "contentHash": "sha256:24949f922f59f73033da998490726bba4659ddeb3d1bf623401d57d12d97d7f1",
      "durationMs": 44510,
      "id": "cv-show:audio:complexscan-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-pnvHjRrludIscnnDwPMziVFN079XLsaR6XgV92bKpms="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-bO3Nz5AKfHONvv18moS6QpDtz7uNuKjrrhBtkVHQxIk=",
      "contentHash": "sha256:77a4572d197b763f95d094223bc9aa67f67e9aba75b36d39cd12cb22a070f011",
      "durationMs": 47980,
      "id": "cv-show:audio:photopizza-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-OdhPxgVkPh1ejXKF//iLpIEH7H+T3X75JWX30b60My8="
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
        "text": "Привет, я Владимир. Я ар эн ди-инженер: нахожу проблемы и продуктовые возможности, формулирую задачи, придумываю решения и довожу их до работающего результата — самостоятельно или отвечая за свою часть работы в команде. Сейчас мой основной фокус — программные платформы и агентные продукты. В этой презентации я покажу, как этот ар эн ди-подход работает в разных предметных областях — от программных платформ до медиа и оборудования. В каждом проекте я отдельно обозначу свою роль."
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
        "text": "Начну с текущего центра моей работы. С середины две тысячи двадцать шестого года я развиваю Симбиот Воркспейс — универсальную среду, где агент собирает рабочее пространство под конкретную задачу. Результат сохраняется в виде исполняемой конфигурации, которую можно переносить. Некоторые мои текущие проекты появились раньше Воркспейса и теперь постепенно становятся его конфигурациями."
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
        "text": "Визуальная часть Воркспейса построена на оупен сорс библиотеке Симбиот ю-ай. В ней собраны компоненты, компоновки, графовые инструменты и семантические контракты интерфейса. На её основе построен и весь интерфейс этого си-ви: навигация, рабочие панели, чат и плеер презентации. Исходный код и техническое описание доступны на Гитхаб, а прямо в этой презентации можно открыть подробный разбор проекта."
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
        "text": "Функциональные блоки даёт Symbiote Engine. Это серверная библиотека для сервисов, графов выполнения и автоматизации. Workspace соединяет визуальные блоки UI с этим исполнительным слоем в одной конфигурации."
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
        "text": "Эйджент Портал — один из проектов, которые я сейчас переношу в Симбиот Воркспейс как конфигурации. Я развиваю его с начала две тысячи двадцать шестого года. Проект появился как собственный управляющий слой над разными агентными средами — своего рода харнесс над харнессес. Он объединяет их в один видимый процесс и позволяет сохранять контроль над контекстом, задачами и ресурсами, при этом быстро меняя агентов, модели и способы доступа к ним. Когда я начинал эту линию, я не нашёл готового решения с таким сочетанием возможностей, поэтому стал развивать собственный вариант. Мы решили открыть управляющий контур эм-си-пи эйджент портал, хотя развиваем Эйджент Портал прежде всего для собственной практической работы. Исходный код этого контура доступен на Гитхаб, а интерфейс Эйджент Портал можно посмотреть в интерактивном демо. Чтобы показать его внутреннее устройство, дальше я разберу два отдельных инструмента. Эйджент Пул эм-си-пи отвечает за исполнение и распределение ресурсов, а Проджект Граф эм-си-пи — за структуру и контекст проекта."
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
        "text": "Ещё один актуальный проект — Симбиот Видео Студио. Материалы, граф, таймлайн, предпросмотр и рендер собраны здесь в один видимый процесс. Агент работает с семантическими элементами интерфейса, а человек может проверить каждый этап. Сейчас Студио оформляется как конфигурация Симбиот Воркспейс."
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
        "text": "Следующий пример — Адаптив Максимо Воркбенч. Он показывает, как заявки, оборудование, локации, бригады и доступные действия собираются в одном рабочем пространстве с общим актуальным контекстом. Сейчас это демонстрационный проект на стадии альфа-версии, показывающий возможности Воркспейса. Подключение к реальной системе Максимо выполняется как отдельная интеграция."
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
        "text": "В начале две тысячи двадцать шестого года Эйджент Пул эм-си-пи оформился как самостоятельный эм-си-пи-сервер, который можно напрямую подключить к агенту. В Эйджент Портал он используется как исполнительный слой: распределяет задачи между агентами, отслеживает владение и состояние, передаёт сессии и маршрутизирует ресурсы."
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
        "text": "Второй инструмент — Проджект Граф эм-си-пи, самостоятельный оупен сорс эм-си-пи-сервер для навигации по кодовой базе. Он строит компактный граф репозитория, который в Эйджент Портал отображается как визуальная карта проекта. Человек может выбрать интересующий узел, а агент — раскрыть для нужной части зависимости, скелеты кода, документацию и более подробный контекст. Так человек и агент работают с одной структурой проекта, а модель получает релевантные проверяемые факты, не перечитывая весь репозиторий. Исходный код доступен на Гитхаб, а интерактивное демо доступно по соседней ссылке."
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
        "text": "Теперь вернусь к Лайфсайкл Месседжинг Платформ, которую я развивал с две тысячи двадцать второго по две тысячи двадцать шестой год. Это маркетинговая платформа для автоматизации клиентских коммуникаций. Она включает сегментацию аудитории, управление маркетинговыми кампаниями, опт-ин эс-эм-эс сценарии и аналитику. Я проектировал эй-пи-ай, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. Для проверки модемного контура я сделал локальный Диджитал Твин с виртуальными устройствами и воспроизводимыми сценариями."
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
        "text": "Отдельный прикладной кейс — мобильная эс-эм-эм платформа для управляемой работы с несколькими профилями. В одном контуре собраны медиаматериалы, публикации, расписание, входящие обращения и очередь. Андроид-устройства выполняют стабильные операции по готовым сценариям. При изменении интерфейса агент останавливает процесс, анализирует экран и готовит обновление сценария для проверки. Управляемость обеспечивают лимиты, дедупликация, согласование и журнал."
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
        "text": "Теперь вернусь по истории программно-аппаратных проектов. В две тысячи двадцать первом — две тысячи двадцать втором годах я основал и вёл проект «Эф триста шестьдесят Студио». Он занимался высокоточным три дэ-сканированием. Я выстраивал процесс от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели. При переезде в Аргентину физическую производственную базу пришлось закрыть."
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
        "text": "Перед эф триста шестьдесят была музейная технология Авто Бокс, которую я развивал в две тысячи девятнадцатом — две тысячи двадцать первом годах. Здесь показана предварительная три дэ-визуализация оборудования Авто Бокс. Я подготовил её ещё до сборки установки, чтобы представить будущую конструкцию партнёрам, с которыми мы работали над три дэ-сканированием музейных объектов в Эрмитаже. Здесь я отлаживаю процесс фотограмметрии на поворотном столе PhotoPizza. Это один из предварительных экспериментов, проведённых до разработки установки для Эрмитажа. Здесь показан промежуточный результат той же отладки в Реалити Кэпчер. Слева видны исходные фотографии позолоченного Будды, а в три дэ-пространстве я вращаю уже обработанную модель и проверяю результат фотограмметрии перед разработкой оборудования для Эрмитажа. Здесь я собственноручно изготавливаю одну из деталей первой версии Авто Бокс — лазером вырезаю вентиляционную сетку для светового модуля. Здесь собранный прототип первой версии Авто Бокс сканирует нэцкэ в Эрмитаже. Это вводный ролик эрмитажной серии «Нэцкэ под увеличительным стеклом». Представленные в ней нэцкэ я собственноручно сканировал и визуализировал во время отладки технологии Авто Бокс. Для того же позолоченного Будды я сделал художественную три дэ-визуализацию. Она показывает качество сканирования сложного металлического объекта: сохранились мелкие детали, повреждения и царапины. Здесь — художественная визуализация могольского кинжала из собрания Эрмитажа. Сочетание полированного металла, позолоты и инкрустации драгоценными камнями делало его особенно сложным для фотограмметрии, но нам удалось сохранить и форму, и детали разных материалов. Здесь — художественная визуализация головы королевы-матери из Королевства Бенин. Сканирование точно передало сложный рельеф и патину бронзовой поверхности."
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
        "text": "Теперь вернусь к Комплекс Скан — коммерческой линии оборудования, чьи разработки стали частью технической базы Авто Бокс. Я развивал Комплекс Скан в две тысячи семнадцатом — две тысячи двадцать втором годах. В линию входили прозрачные платформы для бестеневой съёмки предметов в формате фото триста шестьдесят и для три дэ-сканирования. Здесь я демонстрирую одну из таких платформ и веб-приложение, из которого управляю ею. Здесь я показываю обновлённые версии поворотной платформы Комплекс Скан и веб-приложения для управления ею. Я проектировал оборудование и метод съёмки как единый продукт и довёл линию до первых международных поставок. Отдельным прикладным проектом стал Бут Бот. Это система автоматизации каталожной съёмки винных бутылок непосредственно на складе заказчика. Система объединяла компактную съёмочную будку, управляемые световые панели, моторизированную камеру, пресеты съёмки и автоматическую обработку фотографий. Световая сцена была заранее настроена для бестеневой съёмки и контролируемых бликов, поэтому фотографии практически не требовали ручной коррекции. Система автоматически отделяла бутылку от фона, оптимизировала изображение и выдавала готовый материал для каталога. Благодаря этому сотрудники без студийного опыта могли получать повторяемый результат прямо на складе. Следующим этапом должна была стать прямая публикация готовых фотографий на сайте, но после моего переезда в Аргентину развитие проекта было приостановлено."
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
        "text": "В начале этой линии была PhotoPizza, которую я развивал с две тысячи десятого года. Проект появился внутри Мегавизор как инструмент для повторяемой съёмки объектов на триста шестьдесят градусов. Здесь показан ускоренный демонстрационный ролик о сборке первой версии PhotoPizza — без подробной инструкции. Это промо Мегавизор, где показан весь спектр поддерживаемого контента, включая съёмку объектов на триста шестьдесят градусов. Я продумал механику, электронику, прошивку, документацию и упаковку. Таймлапс сборки прототипа PhotoPizza из конструкционного алюминиевого профиля и шагового двигателя. Позже PhotoPizza стала оупен сорс проектом. Здесь я показываю, как собрать простую поворотную платформу из подноса ИКЕА и вручную снять объект со всех сторон. Такие демонстрационные ролики я продюсировал для Мегавизор, чтобы популяризировать формат и снизить порог входа в технологию. Здесь я показываю новое веб-приложение PhotoPizza: с телефона запускаю съёмку и по вай-фай управляю поворотным столом и камерой через веб-приложение. Универсальный блок управления работал с поворотными платформами, слайдером камеры и моторизированной панорамной головкой. На грузовой поворотной платформе PhotoPizza мы снимали даже тяжёлые объекты, включая мотоциклы, на триста шестьдесят градусов. Проект продолжал развиваться до моего переезда в Аргентину в две тысячи двадцать втором году."
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
        "text": "А теперь вернусь в настоящее. От программно-аппаратных систем для съёмки я пришёл к распределённой инфраструктуре и текущим агентным рабочим средам. Во всех этих проектах я соединяю исследование, архитектуру и реализацию в работающий процесс с понятными границами и проверяемым результатом. Сейчас главным центром этой работы стал Symbiote Workspace. Здесь можно продолжить знакомство с проектами, открыть резюме или связаться со мной."
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
        "text": "Рабочая среда описывается конфигурацией: в ней задаются компоновка, панели, модули, действия и связи. Агент подбирает готовые блоки, валидирует конфигурацию и собирает интерфейс в браузере. Конфигурацию можно обновлять во время работы, сохранять и открывать в совместимом host-приложении. Секреты, авторизация и пользовательские данные остаются на стороне host. Я развиваю эту архитектуру как общий слой для специализированных рабочих процессов."
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
        "text": "Я развиваю Symbiote UI как библиотеку интерфейсных блоков, которые можно компоновать программно и описывать для агентов. Компоненты публикуют роли, состояния и безопасные действия через манифесты и WebMCP-контракты. Workspace использует этот каталог при сборке рабочей среды. Продуктовый смысл добавляет конкретная конфигурация, а библиотека сохраняет нейтральные переиспользуемые возможности."
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
        "text": "Симбиот Энджин предоставляет компонуемые серверные примитивы: обработчики, команды, графы выполнения и хранение состояния. Продукт собирает из них свой бэкенд-процесс, а Воркспейс связывает исполнение с переносимой конфигурацией интерфейса. Я сохраняю разделение слоёв, чтобы Энджин можно было использовать в разных рабочих средах и сервисах."
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
        "text": "Эйджент Портал — мой проект для управляемой агентной разработки. Я придумал и реализовал его архитектуру, а в работе мы использовали его как общую среду. Его управляющий контур эм-си-пи Эйджент Портал опубликован как оупен сорс проект. В центре находится исполняемая канбан-доска: каждая колонка запускает часть процесса и может получить свои действия, роли и пул специализированных агентов. Для задач с кодом система создаёт изолированную рабочую копию и ветку. Один агент выполняет работу, другой независимо проверяет результат. Успешный аудит открывает путь к публикации, а конфликт переводит карточку к решению человека. Модели и подписки объединяются в группы ресурсов, поэтому этап получает исполнителя с подходящими возможностями и доступным лимитом."
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
        "text": "В основе Студии лежит ядро Симбиот Видео. Агент описывает структуру ролика семантическим описанием в формате джейсон: сцены, слои, клипы и переходы. Движок превращает описание в граф, таймлайн и композицию. В рабочей среде можно проверить нод-граф, запустить лайв-превью, сохранить состояние и перейти к экспорту. Видео-ядро уже работает, а Студия как универсальная конфигурация Воркспейса продолжает развиваться в альфа-режиме."
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
        "text": "В этом демо Воркспейс получает предметную конфигурацию для обслуживания оборудования. Панели связывают заявки, активы, локации, бригады и безопасные действия. Агент читает тот же актуальный контекст, который видит человек, и работает через объявленные действия интерфейса. Этот контур проверяет архитектуру Воркспейса на корпоративном процессе. Реальные данные, авторизация и эй-пи-ай системы Максимо подключаются отдельным интеграционным слоем."
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
        "text": "Я создавал Agent Pool MCP как независимый слой исполнения для разных CLI-агентов и моделей. Он поддерживает параллельные задачи, последовательные pipelines, handoff сессий, политики и группы ресурсов. Один процесс может поручить реализацию одному агенту, а независимую проверку — другому. В сценариях cross-model peer review агенты разных провайдеров сравнивают выводы и возвращают общий структурированный результат."
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
        "text": "Project Graph MCP анализирует структуру репозитория и готовит несколько представлений: зависимости, скелеты кода, краткую карту проекта и факты браузерной проверки. Более быстрая модель может собрать эту карту, а сильная модель получает сфокусированный контекст для решения. Я использую этот слой как context engineering и структурированное извлечение с графовыми связями."
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
        "text": "Платформа соединяла веб-продукт, серверную инфраструктуру и физическую доставку через модемы. Эй-пи-ай и Постгрес-кью-эл хранили продуктовые данные. Вебсокет связывал рантайм, а распределённые инстансы управляли пулами джи-эс-эм-модемов через сириал и эй-ти-команды. Связь и устройства могли менять состояние, поэтому очередь, повторяемое выполнение и мониторинг сохраняли управляемость процесса. Диджитал Твин воспроизводил физический контур для локальной проверки. В одном историческом эксперименте создание материалов и их проверка работали как независимые контуры с разными правилами оценки."
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
        "text": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Android-устройствами. Готовый JSON-сценарий выполняет стабильный путь и записывает результат в журнал. Если структура экрана изменилась, исполнитель останавливается в безопасной точке. Агент анализирует актуальный экран, готовит обновлённый сценарий и передаёт его на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и approval. Демонстрация заканчивается dry-run или подтверждением в журнале без внешней отправки."
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
        "text": "F триста шестьдесят переносила дисциплину музейной съёмки в коммерческий студийный процесс. Для каждого объекта я планировал ракурсы и свет, контролировал исходные фотографии, проводил фотограмметрическую обработку и проверял геометрию с текстурами. Я собрал единый производственный путь от установки до финальной три D-модели и её публикации. Публичные примеры сохранились на YouTube и в портфолио Sketchfab. Студия завершила работу в две тысячи двадцать втором году во время моего переезда."
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
        "text": "Рабочая система управляла камерой, светом и позиционированием. Она сначала снимала полную серию, после чего компьютерное зрение анализировало материал, оценивало резкость и отбирало исходники для построения три дэ-модели. Следующий прототип начинал с чернового три дэ-сканирования и упрощённой формы предмета. Затем он заранее рассчитывал весь план детальной макросъёмки: зоны, ракурсы, положения камеры, параметры оптики, глубину резкости и перекрытие. Расчёт учитывал сложную геометрию предмета, диапазон механики, габариты камеры, препятствия и безопасное расстояние. После проверки принципа я проектировал дополнительные контуры безопасности, включая лидарный контроль расстояния на случай смещения предмета. Этот слой остался следующим этапом разработки. Система Авто Бокс уже применялась в музеях. В Эрмитаже я сканировал японские нэцкэ, а технологическая линия применялась для бенинской бронзы в Кунсткамере."
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
        "text": "Я придумал Комплекс Скан как коммерческую линию профессионального оборудования после оупен сорс работы над PhotoPizza. Прозрачный вращающийся диск, стабильная механика и управляемый свет давали чистые исходники для съёмки объектов в формате триста шестьдесят градусов и фотограмметрии. Я собственноручно собирал прототипы и первые изделия, разбивал конструкцию на детали для профильных подрядчиков, затем выполнял финальную сборку и тестирование. Отдельно я проектировал защитную упаковку, оформлял экспортные документы и организовывал доставки клиентам в разные страны. Позже ар эн ди этой линии стало частью технической базы музейных систем вроде Авто Бокс."
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
        "text": "Изначально PhotoPizza была внутренним инструментом Мегавизор — облачного сервиса для фото триста шестьдесят объектов, трёхмерных панорам, видео и виртуальных туров. В Мегавизор я разрабатывал технологию и оборудование и составил техническое задание на управляющее программное обеспечение. Первую версию для Ардуино по этому заданию реализовал привлечённый специалист. После Мегавизор я сам продолжил управляющее программное обеспечение на Джаваскрипте и Эспруино. Я подбирал доступные компоненты и подробно описывал сборку с калибровкой, чтобы люди могли собирать свои версии. Один контроллер управлял поворотной платформой, слайдером камеры и автоматической панорамной головкой. Этот открытый проект дал практическую основу для последующих экспериментов Комплекс Скан и Авто Бокс."
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
          "quote": "в разных предметных областях"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
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
          "quote": "в разных предметных областях"
        },
        "gestureDurationMs": 2500,
        "leadMs": 2800,
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
          "quote": "В каждом проекте"
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
          "quote": "В каждом проекте"
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
          "quote": "С середины две тысячи двадцать шестого года"
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
          "quote": "С середины две тысячи двадцать шестого года"
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
          "quote": "Результат сохраняется"
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
          "quote": "Результат сохраняется"
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
          "quote": "Некоторые мои текущие проекты"
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
          "quote": "Некоторые мои текущие проекты"
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
          "quote": "графовые инструменты"
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
          "quote": "графовые инструменты"
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
          "quote": "весь интерфейс этого си-ви"
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
          "quote": "весь интерфейс этого си-ви"
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
          "quote": "плеер презентации"
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
          "quote": "плеер презентации"
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
          "quote": "Гитхаб"
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
          "quote": "Гитхаб"
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
          "quote": "подробный разбор проекта"
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
          "quote": "подробный разбор проекта"
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
          "quote": "серверная библиотека"
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
          "quote": "серверная библиотека"
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
          "quote": "Workspace соединяет"
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
          "quote": "Workspace соединяет"
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
          "quote": "один видимый процесс"
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
          "quote": "один видимый процесс"
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
          "quote": "Мы решили открыть управляющий контур"
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
          "quote": "Мы решили открыть управляющий контур"
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
          "quote": "Гитхаб"
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
          "quote": "Гитхаб"
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
          "quote": "интерактивном демо"
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
          "quote": "интерактивном демо"
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
          "quote": "предпросмотр и рендер"
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
          "quote": "предпросмотр и рендер"
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
          "quote": "Агент работает"
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
          "quote": "Агент работает"
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
          "quote": "заявки, оборудование"
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
          "quote": "заявки, оборудование"
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
          "quote": "общим актуальным контекстом"
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
          "quote": "общим актуальным контекстом"
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
          "quote": "распределяет задачи"
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
          "marker": "route",
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
          "quote": "распределяет задачи"
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
          "quote": "компактный граф"
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
          "quote": "компактный граф"
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
          "quote": "раскрыть для нужной части"
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
          "quote": "раскрыть для нужной части"
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
          "quote": "проверяемые факты"
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
          "quote": "проверяемые факты"
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
          "quote": "маркетинговая платформа"
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
          "quote": "маркетинговая платформа"
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
          "quote": "сегментацию аудитории"
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
          "quote": "сегментацию аудитории"
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
          "quote": "распределение заданий"
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
          "series": "lifecycle-layers"
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
          "quote": "распределение заданий"
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
          "quote": "Диджитал Твин"
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
          "marker": "bidirectional-route",
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
          "quote": "Диджитал Твин"
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
          "quote": "В одном контуре"
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
          "quote": "В одном контуре"
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
          "quote": "Андроид-устройства"
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
          "quote": "Андроид-устройства"
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
          "quote": "При изменении интерфейса"
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
          "quote": "При изменении интерфейса"
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
          "quote": "процесс от физической"
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
          "quote": "процесс от физической"
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
          "quote": "готовой презентации модели"
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
          "quote": "готовой презентации модели"
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
          "quote": "Здесь показана предварительная три дэ-визуализация оборудования Авто Бокс"
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
          "quote": "Здесь показана предварительная три дэ-визуализация оборудования Авто Бокс"
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
          "quote": "Здесь я отлаживаю процесс фотограмметрии"
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
          "quote": "Здесь я отлаживаю процесс фотограмметрии"
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
          "quote": "Здесь показан промежуточный результат той же отладки"
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
          "quote": "Здесь показан промежуточный результат той же отладки"
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
          "quote": "Здесь я собственноручно изготавливаю"
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
          "quote": "Здесь я собственноручно изготавливаю"
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
          "quote": "Здесь собранный прототип первой версии Авто Бокс"
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
          "quote": "Здесь собранный прототип первой версии Авто Бокс"
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
          "quote": "Это вводный ролик эрмитажной серии"
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
          "quote": "Это вводный ролик эрмитажной серии"
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
          "quote": "Для того же позолоченного Будды"
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
          "quote": "Для того же позолоченного Будды"
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
          "quote": "Здесь — художественная визуализация могольского кинжала"
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
          "quote": "Здесь — художественная визуализация могольского кинжала"
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
          "quote": "Здесь — художественная визуализация головы королевы-матери"
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
          "quote": "Здесь — художественная визуализация головы королевы-матери"
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
          "quote": "коммерческой линии оборудования"
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
          "quote": "коммерческой линии оборудования"
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
          "quote": "Здесь я демонстрирую одну из таких платформ"
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
          "quote": "Здесь я демонстрирую одну из таких платформ"
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
          "quote": "Здесь я показываю обновлённые версии"
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
          "quote": "Здесь я показываю обновлённые версии"
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
          "quote": "международных поставок"
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
          "quote": "международных поставок"
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
          "quote": "Отдельным прикладным проектом стал Бут Бот"
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
          "quote": "Отдельным прикладным проектом стал Бут Бот"
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
          "quote": "Система объединяла компактную съёмочную будку"
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
          "quote": "Система объединяла компактную съёмочную будку"
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
          "quote": "Проект появился внутри Мегавизор"
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
          "quote": "Проект появился внутри Мегавизор"
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
        "targetId": "media/photopizza/youtube/2lO2VsZFAz0"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza:02"
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
          "quote": "Здесь показан ускоренный демонстрационный ролик"
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
          "quote": "Здесь показан ускоренный демонстрационный ролик"
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
          "cellId": "cv-show:audio-clip:photopizza:03"
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
          "quote": "Это промо Мегавизор"
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
          "quote": "Это промо Мегавизор"
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
          "cellId": "cv-show:audio-clip:photopizza:04"
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
          "quote": "Я продумал механику"
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
          "quote": "Я продумал механику"
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
          "cellId": "cv-show:audio-clip:photopizza:05"
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
          "quote": "Таймлапс сборки прототипа PhotoPizza"
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
          "quote": "Таймлапс сборки прототипа PhotoPizza"
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
          "cellId": "cv-show:audio-clip:photopizza:06"
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
          "quote": "Здесь я показываю, как собрать простую поворотную платформу"
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
          "quote": "Здесь я показываю, как собрать простую поворотную платформу"
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
          "cellId": "cv-show:audio-clip:photopizza:07"
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
          "quote": "Здесь я показываю новое веб-приложение PhotoPizza"
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
          "quote": "Здесь я показываю новое веб-приложение PhotoPizza"
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
          "cellId": "cv-show:audio-clip:photopizza:08"
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
          "quote": "Универсальный блок управления"
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
          "quote": "Универсальный блок управления"
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
          "cellId": "cv-show:audio-clip:photopizza:09"
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
          "quote": "На грузовой поворотной платформе PhotoPizza"
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
          "quote": "На грузовой поворотной платформе PhotoPizza"
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
          "quote": "От программно-аппаратных систем"
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
          "quote": "От программно-аппаратных систем"
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
          "quote": "Во всех этих проектах"
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
          "quote": "Во всех этих проектах"
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
          "quote": "Сейчас главным центром"
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
          "quote": "Сейчас главным центром"
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
          "quote": "Здесь можно продолжить"
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
          "quote": "Здесь можно продолжить"
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
          "quote": "Агент подбирает"
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
          "quote": "Агент подбирает"
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
          "quote": "Конфигурацию можно обновлять"
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
          "quote": "Конфигурацию можно обновлять"
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
          "quote": "Секреты, авторизация"
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
          "quote": "Секреты, авторизация"
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
          "quote": "Компоненты публикуют"
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
          "quote": "Компоненты публикуют"
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
          "quote": "манифесты"
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
          "quote": "манифесты"
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
          "quote": "Workspace использует"
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
          "quote": "Workspace использует"
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
          "quote": "Продукт собирает"
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
          "quote": "Продукт собирает"
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
          "quote": "Воркспейс связывает"
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
          "quote": "Воркспейс связывает"
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
          "quote": "В центре находится"
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
          "quote": "В центре находится"
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
          "quote": "каждая колонка"
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
          "quote": "каждая колонка"
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
          "quote": "Для задач с кодом"
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
          "quote": "Для задач с кодом"
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
          "quote": "Модели и подписки"
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
          "quote": "Модели и подписки"
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
          "quote": "Движок превращает"
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
          "quote": "Движок превращает"
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
          "quote": "В рабочей среде"
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
          "quote": "В рабочей среде"
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
          "quote": "Панели связывают"
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
          "quote": "Панели связывают"
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
          "quote": "работает через объявленные действия"
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
          "quote": "работает через объявленные действия"
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
          "quote": "поручить реализацию"
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
          "quote": "поручить реализацию"
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
          "quote": "независимую проверку"
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
          "quote": "независимую проверку"
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
          "quote": "общий структурированный результат"
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
          "quote": "общий структурированный результат"
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
          "quote": "скелеты кода"
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
          "quote": "скелеты кода"
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
          "quote": "факты браузерной проверки"
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
          "quote": "факты браузерной проверки"
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
          "quote": "сфокусированный контекст"
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
          "quote": "сфокусированный контекст"
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
          "quote": "Эй-пи-ай"
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
          "quote": "Эй-пи-ай"
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
          "quote": "управляли пулами"
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
          "quote": "управляли пулами"
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
          "quote": "Диджитал Твин"
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
          "quote": "Диджитал Твин"
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
          "quote": "Сервер управляет расписанием"
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
          "quote": "Сервер управляет расписанием"
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
          "quote": "Готовый JSON-сценарий"
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
          "quote": "Готовый JSON-сценарий"
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
          "quote": "Если структура экрана изменилась"
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
          "quote": "Если структура экрана изменилась"
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
          "cellId": "cv-show:audio-clip:mobile-smm-details:04"
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
          "quote": "Исходящие действия"
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
          "quote": "Исходящие действия"
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
        "targetId": "article.mobile-smm-platform.local-demo"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:mobile-smm-details:05"
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
          "quote": "Демонстрация заканчивается"
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
          "quote": "Демонстрация заканчивается"
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
          "quote": "Публичные примеры"
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
          "quote": "Публичные примеры"
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
          "quote": "Студия завершила работу"
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
          "quote": "Студия завершила работу"
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
          "quote": "компьютерное зрение"
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
          "quote": "компьютерное зрение"
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
          "quote": "В Эрмитаже я сканировал"
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
          "quote": "В Эрмитаже я сканировал"
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
          "quote": "бенинской бронзы"
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
          "quote": "бенинской бронзы"
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
          "quote": "управляемый свет"
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
          "quote": "управляемый свет"
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
          "quote": "собирал прототипы"
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
          "quote": "собирал прототипы"
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
          "quote": "музейных систем"
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
          "quote": "музейных систем"
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
          "quote": "версию для Ардуино"
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
          "quote": "версию для Ардуино"
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
          "cellId": "cv-show:audio-clip:photopizza-details:02"
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
          "quote": "я сам продолжил"
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
          "quote": "я сам продолжил"
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
        "targetId": "article.photopizza.assembly-calibration"
      },
      "dependsOn": [
        {
          "barrier": "ended",
          "cellId": "cv-show:audio-clip:photopizza-details:03"
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
          "quote": "сборку с калибровкой"
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
          "quote": "сборку с калибровкой"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "none",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 0,
        "sourceOutMs": 23360
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
        "sourceInMs": 23360,
        "sourceOutMs": 29080
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
          "offsetMs": 23360
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 29080,
        "sourceOutMs": 32160
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
          "offsetMs": 29080
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 0,
        "sourceOutMs": 2298
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
        "sourceInMs": 2298,
        "sourceOutMs": 12220
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
          "offsetMs": 2298
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 12220,
        "sourceOutMs": 17060
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
          "offsetMs": 12220
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 17060,
        "sourceOutMs": 23910
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
          "offsetMs": 17060
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 0,
        "sourceOutMs": 9560
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
        "sourceInMs": 9560,
        "sourceOutMs": 14920
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
          "offsetMs": 9560
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 14920,
        "sourceOutMs": 19240
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
          "offsetMs": 14920
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 19240,
        "sourceOutMs": 23100
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
          "offsetMs": 19240
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 23100,
        "sourceOutMs": 26760
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
          "offsetMs": 23100
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 26760,
        "sourceOutMs": 28370
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
          "offsetMs": 26760
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 0,
        "sourceOutMs": 3740
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
        "sourceInMs": 3740,
        "sourceOutMs": 8940
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
          "offsetMs": 3740
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 8940,
        "sourceOutMs": 15200
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
          "offsetMs": 8940
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 0,
        "sourceOutMs": 19520
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
        "sourceInMs": 19520,
        "sourceOutMs": 21900
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
          "offsetMs": 19520
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 21900,
        "sourceOutMs": 37860
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
          "offsetMs": 21900
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 37860,
        "sourceOutMs": 50420
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
          "offsetMs": 37860
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 50420,
        "sourceOutMs": 53260
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
          "offsetMs": 50420
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 53260,
        "sourceOutMs": 69920
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
          "offsetMs": 53260
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 0,
        "sourceOutMs": 5880
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
        "sourceInMs": 5880,
        "sourceOutMs": 9660
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
          "offsetMs": 5880
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 9660,
        "sourceOutMs": 19510
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
          "offsetMs": 9660
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 0,
        "sourceOutMs": 4620
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
        "sourceInMs": 4620,
        "sourceOutMs": 12120
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
          "offsetMs": 4620
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 12120,
        "sourceOutMs": 25520
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
          "offsetMs": 12120
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 14740
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
        "sourceInMs": 14740,
        "sourceOutMs": 22610
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
          "offsetMs": 14740
        }
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 9820
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
        "sourceInMs": 9820,
        "sourceOutMs": 19380
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
          "offsetMs": 9820
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 19380,
        "sourceOutMs": 30640
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
          "offsetMs": 19380
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 30640,
        "sourceOutMs": 38810
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
          "offsetMs": 30640
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 0,
        "sourceOutMs": 9180
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
        "sourceInMs": 9180,
        "sourceOutMs": 13980
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
          "offsetMs": 9180
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 13980,
        "sourceOutMs": 24180
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
          "offsetMs": 13980
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 24180,
        "sourceOutMs": 32920
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
          "offsetMs": 24180
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 32920,
        "sourceOutMs": 38320
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
          "offsetMs": 32920
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 0,
        "sourceOutMs": 6980
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
        "sourceInMs": 6980,
        "sourceOutMs": 13620
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
          "offsetMs": 6980
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 13620,
        "sourceOutMs": 18880
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
          "offsetMs": 13620
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 18880,
        "sourceOutMs": 31420
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
          "offsetMs": 18880
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 0,
        "sourceOutMs": 15380
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
        "sourceInMs": 15380,
        "sourceOutMs": 21880
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
          "offsetMs": 15380
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 21880,
        "sourceOutMs": 27900
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
          "offsetMs": 21880
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 0,
        "sourceOutMs": 8780
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
        "sourceInMs": 8780,
        "sourceOutMs": 25900
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
          "offsetMs": 8780
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 25900,
        "sourceOutMs": 36880
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
          "offsetMs": 25900
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 36880,
        "sourceOutMs": 53280
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
          "offsetMs": 36880
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 53280,
        "sourceOutMs": 63160
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
          "offsetMs": 53280
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 63160,
        "sourceOutMs": 68660
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
          "offsetMs": 63160
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 68660,
        "sourceOutMs": 79820
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
          "offsetMs": 68660
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 79820,
        "sourceOutMs": 92520
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
          "offsetMs": 79820
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 92520,
        "sourceOutMs": 110820
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
          "offsetMs": 92520
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 110820,
        "sourceOutMs": 121280
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
          "offsetMs": 110820
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 0,
        "sourceOutMs": 1680
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
        "sourceInMs": 1680,
        "sourceOutMs": 21560
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
          "offsetMs": 1680
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 21560,
        "sourceOutMs": 27220
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
          "offsetMs": 21560
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 27220,
        "sourceOutMs": 40200
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
          "offsetMs": 27220
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 40200,
        "sourceOutMs": 41780
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
          "offsetMs": 40200
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 41780,
        "sourceOutMs": 52160
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
          "offsetMs": 41780
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 52160,
        "sourceOutMs": 77380
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
          "offsetMs": 52160
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 77380,
        "sourceOutMs": 95010
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
          "offsetMs": 77380
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 0,
        "sourceOutMs": 5240
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
        "sourceInMs": 5240,
        "sourceOutMs": 12200
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
          "offsetMs": 5240
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 12200,
        "sourceOutMs": 19120
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-01"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 12200
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 19120,
        "sourceOutMs": 26280
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-02"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 19120
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 26280,
        "sourceOutMs": 31000
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.mechanics"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 26280
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 31000,
        "sourceOutMs": 40360
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-03"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 31000
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 40360,
        "sourceOutMs": 54980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-04"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:07",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 40360
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 54980,
        "sourceOutMs": 66200
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-05"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:08",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 54980
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 66200,
        "sourceOutMs": 73020
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.controller"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:09",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 66200
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 73020,
        "sourceOutMs": 86080
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.spinner"
        }
      ],
      "id": "cv-show:audio-clip:photopizza:10",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 73020
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 0,
        "sourceOutMs": 2200
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
        "sourceInMs": 2200,
        "sourceOutMs": 11460
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
          "offsetMs": 2200
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 11460,
        "sourceOutMs": 20520
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
          "offsetMs": 11460
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 20520,
        "sourceOutMs": 24680
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
          "offsetMs": 20520
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 24680,
        "sourceOutMs": 29320
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
          "offsetMs": 24680
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 29320,
        "sourceOutMs": 30550
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
          "offsetMs": 29320
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 0,
        "sourceOutMs": 7480
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
        "sourceInMs": 7480,
        "sourceOutMs": 13340
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
          "offsetMs": 7480
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 13340,
        "sourceOutMs": 19100
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
          "offsetMs": 13340
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 19100,
        "sourceOutMs": 29070
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
          "offsetMs": 19100
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 0,
        "sourceOutMs": 7380
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
        "sourceInMs": 7380,
        "sourceOutMs": 11060
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
          "offsetMs": 7380
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 11060,
        "sourceOutMs": 13540
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
          "offsetMs": 11060
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 13540,
        "sourceOutMs": 24160
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
          "offsetMs": 13540
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 0,
        "sourceOutMs": 8360
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
        "sourceInMs": 8360,
        "sourceOutMs": 11418
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
          "offsetMs": 8360
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 11418,
        "sourceOutMs": 22970
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
          "offsetMs": 11418
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 0,
        "sourceOutMs": 15980
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
        "sourceInMs": 15980,
        "sourceOutMs": 18780
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
          "offsetMs": 15980
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 18780,
        "sourceOutMs": 25700
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
          "offsetMs": 18780
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 25700,
        "sourceOutMs": 40480
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
          "offsetMs": 25700
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 40480,
        "sourceOutMs": 48960
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
          "offsetMs": 40480
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 0,
        "sourceOutMs": 11160
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
        "sourceInMs": 11160,
        "sourceOutMs": 15180
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
          "offsetMs": 11160
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 15180,
        "sourceOutMs": 29640
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
          "offsetMs": 15180
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 0,
        "sourceOutMs": 6680
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
        "sourceInMs": 6680,
        "sourceOutMs": 17540
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
          "offsetMs": 6680
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 17540,
        "sourceOutMs": 32650
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
          "offsetMs": 17540
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 0,
        "sourceOutMs": 16040
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
        "sourceInMs": 16040,
        "sourceOutMs": 18460
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
          "offsetMs": 16040
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 18460,
        "sourceOutMs": 27280
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
          "offsetMs": 18460
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 27280,
        "sourceOutMs": 29280
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
          "offsetMs": 27280
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 0,
        "sourceOutMs": 7160
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
        "sourceInMs": 7160,
        "sourceOutMs": 9480
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
          "offsetMs": 7160
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 9480,
        "sourceOutMs": 14900
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
          "offsetMs": 9480
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 14900,
        "sourceOutMs": 23360
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
          "offsetMs": 14900
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 0,
        "sourceOutMs": 6060
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
        "sourceInMs": 6060,
        "sourceOutMs": 15240
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
          "offsetMs": 6060
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 15240,
        "sourceOutMs": 20860
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
          "offsetMs": 15240
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 20860,
        "sourceOutMs": 26740
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
          "offsetMs": 20860
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 26740,
        "sourceOutMs": 40420
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
          "offsetMs": 26740
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 0,
        "sourceOutMs": 5300
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
        "sourceInMs": 5300,
        "sourceOutMs": 10520
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
          "offsetMs": 5300
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 10520,
        "sourceOutMs": 16200
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
          "offsetMs": 10520
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 16200,
        "sourceOutMs": 27400
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
          "offsetMs": 16200
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 27400,
        "sourceOutMs": 32720
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.approval"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:05",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 27400
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 32720,
        "sourceOutMs": 38000
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.draft"
        }
      ],
      "id": "cv-show:audio-clip:mobile-smm-details:06",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 32720
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 0,
        "sourceOutMs": 23660
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
        "sourceInMs": 23660,
        "sourceOutMs": 27400
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
          "offsetMs": 23660
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 27400,
        "sourceOutMs": 32270
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
          "offsetMs": 27400
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 0,
        "sourceOutMs": 7020
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
        "sourceInMs": 7020,
        "sourceOutMs": 53880
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
          "offsetMs": 7020
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 53880,
        "sourceOutMs": 58680
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
          "offsetMs": 53880
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 58680,
        "sourceOutMs": 60400
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
          "offsetMs": 58680
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 0,
        "sourceOutMs": 11980
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
        "sourceInMs": 11980,
        "sourceOutMs": 21060
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
          "offsetMs": 11980
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 21060,
        "sourceOutMs": 41980
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
          "offsetMs": 21060
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 41980,
        "sourceOutMs": 44510
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
          "offsetMs": 41980
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 0,
        "sourceOutMs": 19920
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
        "sourceInMs": 19920,
        "sourceOutMs": 24660
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
          "offsetMs": 19920
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 24660,
        "sourceOutMs": 32220
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.media"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:03",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 24660
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 32220,
        "sourceOutMs": 47980
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.documentation"
        }
      ],
      "id": "cv-show:audio-clip:photopizza-details:04",
      "kind": "audio-clip",
      "layerId": "cv-show:layer:audio",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 32220
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
  "revision": 58,
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
          "cv-show:cue:maximo-details.work-order": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-work-order"
            }
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
          "cv-show:cue:photopizza.spinner": {
            "policy": "required",
            "refinements": {}
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
              "durationMilliseconds": 25520,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-u0MHeXyYJgfALT5I2lz0hqmUXHSekfAZwVNg54qkTiY=",
              "sourceAlignmentFileHash": "sha256:296eb3e2a4536d700390a0973f506772d6874454fd9697bfce36bc309466b1b5",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-MOSOoyuP+7S0uSxhWhdTojYUdVYfHQaXQFjRqyMI/Rc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ALb50OuzZ9noME4rLOqneulQtnHXvSEIhadSuI+h29U=",
              "wavHash": "sha256:cf509267118d43e06c9c40e5d7eb91ed33cd9ecb689cda5522f6bf97644f79ba"
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
              "durationMilliseconds": 29280,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-MAysqc9Y7SwZuCDHHgAFlayKnUqynu2DRr6Lrmf3TXM=",
              "sourceAlignmentFileHash": "sha256:7cfd46e60325f623f86780a542ab4452c77e1f906bd89f79879183667afa4293",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-9IpVRo8Fk1YEM0d8bvj8BqpWxjZfE8nFoMvF03pQAWo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-93nUeU+vEC5yVQ2KM+RwWnTCYQq4l/SP0Uo39liQtB8=",
              "wavHash": "sha256:f6b4b332ed56db47716f0bc579c49897ddcee2e13419f3b5f2b6dfc9c7e3d003"
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
              "durationMilliseconds": 22610,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-L9JlNmhNT+4IQzOLX8IRmJm7anBYZRiL3FnWuIr/iO8=",
              "sourceAlignmentFileHash": "sha256:79739ed1f1664f2c95772a6808e20e0a5dffd3d86965556495ff3091fa2aa440",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-xPFCz6idueKTMojSGntWn0WgnQ1l6V2xGDoT+7Ru08Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/ySKn4aXXs9JJge17sY2P6exQplUzQcALKKCrDjA2ao=",
              "wavHash": "sha256:e1d09e85d25f5e57b1b37cabcc55ee8f5955d9b402d60e742f5824297f9ebdc2"
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
              "durationMilliseconds": 69920,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-H5gAsEoW1cyHBBMCgv7OuJwm1VuqV0S88mWwQFoDBqI=",
              "sourceAlignmentFileHash": "sha256:833299c23986e2d057ae2ee266eac1f82e49192f9b4a76b4ceff3b38b3f437b7",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-Kbbta5bGntb6sGAz8M2VxB9YPaeshtJOGYPx2qrVVrw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-dN41DuEBpzm6ETMpb+Bp4S1ydjjm+iAKTjk7W9Yjcic=",
              "wavHash": "sha256:1a6799d9624a41f4f2658cbcfc38ecd4b4f87e30dca00d340f34165da87bc387"
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
              "durationMilliseconds": 48960,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-EdBvgn7WgmP6d/KYyF6QA3v8V9n3DVAPht4tz+FiO+A=",
              "sourceAlignmentFileHash": "sha256:4aa90d36f4bbceecb1563019c61ca5713ae2200fd7962e57f184d0b4ff0129c9",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-mjGcgiSsVWz0Y1VIjbNWGs4zVi+g10+DkevhvcrbX4g=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-tYXuX0I0RVZeHzVtXt5HabhW3zBodNl9U3dcgAYYfn0=",
              "wavHash": "sha256:5c10e4ce97aae523fd221fcb389b73682fc031fc99ebb20250721101cadcbc55"
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
              "durationMilliseconds": 121280,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-oMXzLDwPbi/5clFiIoeuOgq0NNFMQuYoLFZ7fUbmJ6I=",
              "sourceAlignmentFileHash": "sha256:eacd2e3c2ff2b14f8659e30e401f2dd75855d903a721f80cdea8d1a4902ce28a",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-CjomOjQJnhLB0SueH8wxrGCMWvoQcWeAqznNCsUyC4w=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-zns4VQv8cvqVzQd7+n42yu2JXmZF2fpbXI5c97f1Dh4=",
              "wavHash": "sha256:4f5bce02c6bf8bb940aa4631a15cd9a481a0ab88df7d1c298b9967565a6c4456"
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
              "durationMilliseconds": 60400,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-xFdlL3Su4IZzgVdPecW5nbxlM7Y4+XgboSEQ/+GEdIs=",
              "sourceAlignmentFileHash": "sha256:281227847925e3f90f25d80f4140e73e7041cebc9b52eb5208eaad6793452ff4",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-jKpKr5hf4GUZlnOBdsXWynO7TzWD1YpSGUvyY/Bk8wc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-P28gMNIVDoMZdM6kpxreQ4rR/dDXiNvvOHdsHP3bXWA=",
              "wavHash": "sha256:e9ec12b980c9afb8159c67789dc031f85240a9680f692940a79b12217dc5a8d8"
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
              "durationMilliseconds": 95010,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-13h/xGq7VSqr24eDFml7kcdFdgwZwBpJHMco0UaeJmc=",
              "sourceAlignmentFileHash": "sha256:d296ce1e039ef941fb9301651589800db53600f9866d4a25bb64719683da61f3",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-m6fzfczEG6SDTvlL4q5FWrf0rop7AceL/diuYKuaucc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-MudOQgH57mmRLnpTfdG1a+t1xQlPxfgnPAthg/68nsU=",
              "wavHash": "sha256:d24b58728b952761ed49aba69db6d00683970191269115eac1d2bbdc94805933"
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
              "durationMilliseconds": 44510,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-GIJGRE3C0ISUoNh4V2V3zCMHnVJ9T5cQlBRSlvZbkvk=",
              "sourceAlignmentFileHash": "sha256:61d4a619033aeb4e8b776a7a8f5b56293676222c7f5264d26fa545a1a58cd3a5",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-bu5nq+3xNrNh5VjXiflfwYgNpL6HdVCvnr6cgnSnR2Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-pnvHjRrludIscnnDwPMziVFN079XLsaR6XgV92bKpms=",
              "wavHash": "sha256:24949f922f59f73033da998490726bba4659ddeb3d1bf623401d57d12d97d7f1"
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
              "durationMilliseconds": 32270,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-m4Cd//n0sh1fVnRbIkKz/cF5j6PnarE5bf3yEw3gILE=",
              "sourceAlignmentFileHash": "sha256:559e0f16da2aa2745259aa2426a29183a9e84531e62ed4966e314a470cd1948d",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-D40V9gkmElcV2stI9fQmd/Jbm2VatxX8GUr3cM8yFqI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-pXFp+LVNNCB2UJynyllogkFdFcZ6fBpldgbtN8C6eZs=",
              "wavHash": "sha256:0f9415d586250df8c1ee6e94f226cb9abb2d0c0af4580b95cc3f2edaaae26863"
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
              "durationMilliseconds": 27900,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-i680OAjFFqhGZ1mYgbeKo9RIrhDKZWTtGngdDQWHOY0=",
              "sourceAlignmentFileHash": "sha256:28a76ec6ce2112fc671ecb7542069b28e3bde02dd7c76a2c9d556040e60154f8",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-Gw7+5+65krzKIU0ZkwwYr3H8sbdCOg351Plf5UbDa4A=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-PKdfdO9fGh1iQHgI4IR4DhM1F4p941A5Zf1/G7XNCU8=",
              "wavHash": "sha256:884effdb0f335433f927752c7eeb26d31d1eb2ae2c15260558430bbc252b95eb"
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
              "durationMilliseconds": 30550,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-3/v7C4dnMpHww9y4a+TtyT+RaePlpg7SpC30BVlwJ8g=",
              "sourceAlignmentFileHash": "sha256:8b4af568655ddfa0d9eff799e5601bdbdfbf250c07a142acf4e6354d89fcee53",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-zEKe86L75HPsyI/fsXucx39wiCmIUvhcIHUmesRnzKU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-OB7OEHyj11TqEft0b+OZrVjmcJh/Fom+zzUEJWv8oAk=",
              "wavHash": "sha256:55998a1fdce049efe8d88425076289eb53c1f64d6991d556a06729665fe06700"
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
              "durationMilliseconds": 38320,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-KuizwC2b5SJfYB2mjp1q20EqoFONX5vIamFDV7Sem0w=",
              "sourceAlignmentFileHash": "sha256:17f12a3bb0b7a41a6b03c647c8b3649d7eed68eb927f0403a706a606e2a9e779",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-AV/E0bSyyAbmuwesLBUXcSSCrL0V5m5+dsau4Kkn2Ts=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ydUxOrl3L4i4Hkp9+aBOK4AMW+yqtD2rdBb8anDycUU=",
              "wavHash": "sha256:cfc14d92d0123a639ddaab07a0f79bc8e9469f0ed1327ec18c07173595787fb2"
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
              "durationMilliseconds": 40420,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-//tLsWxMidg7AcdQFjzJeCM1IrDhcbiq9mJNRPu5vg0=",
              "sourceAlignmentFileHash": "sha256:6b5700c0cbd85497bd953b0c2820ebd2cf5adc3487539f8d183cd08d267960d4",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-uvwn8stlqbbjdnpw+bpXh+BLCn69rdmIQFPkZi60hgg=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-EkNC6CgEVdMTtu5BlnLR0QTdl/7LjBiyF2JNFEGjwK0=",
              "wavHash": "sha256:2a54f77aada55de8a83723706a416d43c98b56fbb8d1f3ebe7ca5e17e0600458"
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
              "durationMilliseconds": 32650,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-zyf0Cs3j402P1cLYG3k13hlzk4x93I/DLttL/bgp/SI=",
              "sourceAlignmentFileHash": "sha256:c78e0815294ab8cb2c0fea6ef8bbfeccbf2e8737b8d4d40a46d20883d178db7e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-sjY2PLIb5w6CRZ/sMaJQLGQNYrLjBtLdYmTK7wpL6Ro=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-yqByhNi22rzaxyLbO8E+hZri453hodwesr8pJWY8k64=",
              "wavHash": "sha256:ea7c3b69528b03f5d1ca3b122c2c4a48f90460387226d37666498f1cdb61893d"
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
              "durationMilliseconds": 38000,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-zu/jiPi4Y8Z1k9hcLyPQvGqj/6MoG2rHtawiA2TWPDI=",
              "sourceAlignmentFileHash": "sha256:c2fd7d2aeb605a55a82fb4bed27d79c1d55caf753a6080e68469cb18f668a3f9",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-WHrxXDqRPQtDain/HwUeuxbbUv+Gv+LZw25C9EfP7co=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-mPjlYYnwRUeq4nt5oZuntS0G1S0wEtehh8fLSc5u0Ho=",
              "wavHash": "sha256:25dbd5b963b9cc8c7c4197af98df3b95ac3b9c6bc8f9dd2710455f2201a20d5d"
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
              "durationMilliseconds": 31420,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-5GAH2OASjLEWj2gOmz/LiPUXY3XhQajXIqcytx21E5I=",
              "sourceAlignmentFileHash": "sha256:b2e4092c9e45b1174b6b5ca6bc55636f9472fc1c75e249c22b448643862c7409",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-aMs6udHIy2fG13yKtBvwpaPgmeDkujfduMEVN41g/RU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-sOSAb9XNvcUgZSAWaQ/dJGMLDUWkHw5V0dkC+/b6wwI=",
              "wavHash": "sha256:9923da285e8b6825791ca863a51408dd1059e8531e472ec90637031310882e5e"
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
              "durationMilliseconds": 86080,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-Njh22b6LvBJ5ZA8ltXtN7t16wuxQUe8nWPOzgkRO7vI=",
              "sourceAlignmentFileHash": "sha256:0353944ab09614b330c1bd7b0e41f141666b262993fc28df6b1460f56442e4b2",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-fplAN/meLuhnvdaFhbzTmy9tUyrYx7wh9Qv0aN6dWl0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-PeMJB374K2Hc7MYZ+6bFGjR3iBsj+Kh3yYqpCrPbh0w=",
              "wavHash": "sha256:c383da42502eea708e3367108c8a82365fb47311df15ecfc0c4ad17d32a25843"
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
              "durationMilliseconds": 47980,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-bO3Nz5AKfHONvv18moS6QpDtz7uNuKjrrhBtkVHQxIk=",
              "sourceAlignmentFileHash": "sha256:a34738465b670cca3683881c93a984b4609c772e7680d10b811ac2a9474dab5e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-BSox/HYgsn3uUAk/qeqI+qSIyMqel4o3z+S1AZYvdBM=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-OdhPxgVkPh1ejXKF//iLpIEH7H+T3X75JWX30b60My8=",
              "wavHash": "sha256:77a4572d197b763f95d094223bc9aa67f67e9aba75b36d39cd12cb22a070f011"
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
              "durationMilliseconds": 32160,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-+F/LbfxEcmB2hnTnvdQAdG+9+1QfDYRRPAeieHY6laU=",
              "sourceAlignmentFileHash": "sha256:20501f979f46c93396c3b3a1d26eebbfd689b3bb92d03beb1085593d01363dce",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-/OVD3ceD8xV72eZtni3z0UvlMcff6v6DkWarl1OnNgI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-2u3hU+KHdynv0+zLGxqPisQIIlylyFqeDioCz1l3GbM=",
              "wavHash": "sha256:f2ad321ede2c25296cb5c89aecdf16ac7f0eb06a67f54261801dc9b4a0f0ee82"
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
              "durationMilliseconds": 23360,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-doJGQbCkN59UhduTpqaVNRJsgq+xij6XDGURXsmks2A=",
              "sourceAlignmentFileHash": "sha256:f87ffed117b6b3892e3482cb6ed604f67fffbbb53a00ca6f1d8df4f7e428a04b",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-G/f27jo8Oj1UMot+MkMOu5Kh8xwL4JCSaXUh3b7OD+Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-msxvkmt7a+94R3uRMdpfDhNYqQKcUMVLV54Rxc4bYds=",
              "wavHash": "sha256:cc5a97dfc66b8fcb508def6c9d1ede2babf65fa712e8c4350b4884181aa1af7e"
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
              "durationMilliseconds": 38810,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-zUGqeZY57jwR2IOKDRgjRy4b26ZFte1RMJ8bnxr8EMs=",
              "sourceAlignmentFileHash": "sha256:6fbc8bde8d7455eeafd694768069be9a76b8ad16147bf206ae56d24e152eb432",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-96e9tHufOl01YTiwilsnamH3YmM9GTVcwGB0N7xBWPM=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-724/UnGUjLxE6dgIc82SmehIWVg4+M7RBD/R68YQwPs=",
              "wavHash": "sha256:470f154c45eba3426bf95f4346f16d9971483ba4872919ac03bbfbaaf186dba9"
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
              "durationMilliseconds": 15200,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-GeID0VUpGpUtgSGxmpT+YAXZC9NcdkC4A/f3IqcKRW4=",
              "sourceAlignmentFileHash": "sha256:3fdf19cb86e1c82e39cbac3fe92d0ced879f2032cb1827a3ce1d2d3df69e79b1",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-My2rzO2kXuLWAL09R7GtVCO1BhDGaRhSYnKBRzBEtyc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-PzOY4auoLHXP92JPnCcEw4RwAimCNQx+OgZpuC/74qo=",
              "wavHash": "sha256:103b25038b75b5de107d3d9c3d13165ade0cde21de4a694032fafe254d35af97"
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
              "durationMilliseconds": 22970,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-F7eGu9ToYcv46i/UcbP0cgBUW0U3QjYqE8cXgsj8Plg=",
              "sourceAlignmentFileHash": "sha256:87e65765e3e0df265212fcb284f3ade6572752fcfb3fb8e0edb73f06c48c31c6",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-g/xW6pzwZaqKabGV18GLsTE4ILnNTnDgAr74JbBVq+Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-+RIZT38oMvGRSwCC2k1VkygSsTkisdeS4ZEb7UkLnKY=",
              "wavHash": "sha256:d3f86fc104133ecf1d77afb4e2a9d902eb2abd7d86ac6e083edfc8e01a39fe88"
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
              "durationMilliseconds": 28370,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-sjBAP3KVDuNGZFjDkffKUuwRLIMEU7bTSoa7W1JnnN0=",
              "sourceAlignmentFileHash": "sha256:ad7d2515e76ca2aa63a1bf01c791c89da0c33a9993e8d549daec60ff597c6747",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-6Kb+7AlXwZMnS2PqiV5Ps2gYaaKrOci3a7pdKrSUnb0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-U5sb1Db6R5BabMkraBMEASUguVduNKE+cph9WT4GXBs=",
              "wavHash": "sha256:5ab8a4dddf5c59baee600e12b107d52bd632621cc0d5f2a1ae778fbfd46233ff"
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
              "durationMilliseconds": 24160,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-auZssrnGEC8BT0247CNGk2unHJcZMxiQlDls+qDS1zo=",
              "sourceAlignmentFileHash": "sha256:ae2fe1d60c96686996aa0bde122faa9c464dc7cbb27a1d88c374de1f8b174031",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-fLRJzFUs7LlBi+acGWjVV35OjLHQ/tEfbq0DxB5UaIc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-GwXYSlfLHSYdDcUvNJBcs8Zx9XI7q2i/tqbZ3PGoaJg=",
              "wavHash": "sha256:0fb03d28883796d06835976923cf836e182edf5e8aaaddc2b164400a46c52822"
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
              "durationMilliseconds": 19510,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-qBsMLEq/fuw61Fnzvl3dpLhnKitD7H9j+JNJnegqqMA=",
              "sourceAlignmentFileHash": "sha256:26518a3c926131ba21f5c27a86b7fe7e88d0f81e747503b9df95773097820549",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-p2f+yDjmVOui4kAnEnKiHMJRbb8axeJQ07nFQyZnj7Q=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-FEtfkkztWhQzjUtK3QoymF7H7MdVTsR8/j9z5jChqZ8=",
              "wavHash": "sha256:48ce775c70f8233f99d1d9d1c42731d3784475d86ce6eb379f5e9d8878ab18a0"
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
              "durationMilliseconds": 23910,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-I6uoUqUBCRp76sfJ0e4oSg3OG96y5XuEQWi9RKrRYss=",
              "sourceAlignmentFileHash": "sha256:d5ae2b0f7284765ea0660940f1d50c08bccacef4d45db867b5c47e2f8fcbe002",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-YoGLPjbpCZRLULd4yXZMFaPerf+ktt2DMc5anRhC8Mw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ZGwQrurNHOr9u7x+ZQ6A6rEVOAn4gjlJPOIV09xgSUo=",
              "wavHash": "sha256:04def085eccc94eec8b21327dab5e6e5c454cc3c498ebc9ff8e2064461358c5a"
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
              "durationMilliseconds": 29640,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-R7OvxsS9ivnHAFOKshj0fpBISNrqy0DAJFzmlTD/k9U=",
              "sourceAlignmentFileHash": "sha256:186afe0c7481f2793717596d1acab427d17671a6bda12932b16ef3dda99d2851",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-a9HC87onL69BhdD4bz1j+MGhu7cjpdpYxCMfLlUNMRU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-x/zZnT9bQPi4eXVwDxJpZeJquDnTpiqoOKTg8NiOg64=",
              "wavHash": "sha256:823eb69844948acb90bcad1e6b7cfd94372699e3ece8db42ea9e72bc05c3d817"
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
              "durationMilliseconds": 29070,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-xyqkp62n/w+BX7TDwiBNJf++u0uTclLL+N/N6V6TFUQ=",
              "sourceAlignmentFileHash": "sha256:8f3fad035b189fdf6d6ab8a3c3614df287fd200286c3c0999a84d7b54d165bfa",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-6lTA33BPjdmi7z8rOekzlA4klDp01epNYlwo3jGxeW4=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-9yW5MROcgwVYAK0RnBmc7xc0I9OS21v45XUeMgUlrAA=",
              "wavHash": "sha256:0c404601661e4251401a4b6016a935d5edb189b7d99482115bf997b355e824a7"
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
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-OoFvivzENGa5wfEW1kFbphwiRswvFbNaEbR1dJuKqPI=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-hc1I5rsSfJvf0gTluOVh9De2CWajji7Ww2gHoR/nJR0=",
        "entryId": "positioning",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-S0k2TlWrrOizMftK9t+KsRHTIi7peOOGIW08DlPwBwY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-dxBEsduvjtmTNwLbU1uJQCnEBOiDUprEcSkGDfNCxYA=",
        "sourceCellIds": [
          "cv-show:narration:positioning",
          "cv-show:cue:positioning.tenure-marker:scroll",
          "cv-show:cue:positioning.tenure-marker",
          "cv-show:cue:positioning.workspace-transition:scroll",
          "cv-show:cue:positioning.workspace-transition",
          "cv-show:cue:positioning.open",
          "cv-show:audio-clip:positioning:01",
          "cv-show:audio-clip:positioning:02",
          "cv-show:audio-clip:positioning:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-yLaH9xpKKsSRO1hMdrWOSl28DtRLX1/BO62zaIbyWTA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-qdrPVn9ggP4amwgYwKlwi3zq7btnRfQUc095J3/7KPM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-joOmqGiMioWUzMd2sdCdPCFqVCyt5ZCTeKKte3y1khc=",
        "entryId": "symbiote-workspace",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-++9zwkAKg/3FPfbuLzNCXqqd/jgObRb1uncrv0GdKCE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-UbbrcM4ikcMgRMzNoGBE6k1Vj83ePMgBIzPPZIHi7e0=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-workspace",
          "cv-show:cue:workspace.open",
          "cv-show:cue:workspace.intro-frame:scroll",
          "cv-show:cue:workspace.intro-frame",
          "cv-show:cue:workspace.portable-config:scroll",
          "cv-show:cue:workspace.portable-config",
          "cv-show:cue:workspace.agent-portal-card:scroll",
          "cv-show:cue:workspace.agent-portal-card",
          "cv-show:audio-clip:symbiote-workspace:01",
          "cv-show:audio-clip:symbiote-workspace:02",
          "cv-show:audio-clip:symbiote-workspace:03",
          "cv-show:audio-clip:symbiote-workspace:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-7gxTFEtPQ78FzB54az94oEY1EPdp8ID9IXD6V8xsNQY="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZaTdoRWHM2mqIsS6pDl9QdD6ESC+dMqA60vWNFkuifA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-A/9hAPWMYrVgsccAd7NxqhROOBbk9WfOt1grTudQt/c=",
        "entryId": "symbiote-ui",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-cH37iVJEi2TF+PIhN0hOb8dj9Igrglva7ezOvV6YPkw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-pVMG9ecEWuzUdnOer0iiygLnqLMMLP91PCHvMLQeNqg=",
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
          "cv-show:audio-clip:symbiote-ui:01",
          "cv-show:audio-clip:symbiote-ui:02",
          "cv-show:audio-clip:symbiote-ui:03",
          "cv-show:audio-clip:symbiote-ui:04",
          "cv-show:audio-clip:symbiote-ui:05",
          "cv-show:audio-clip:symbiote-ui:06"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-FP9gX62UdytRUUyG54tVrafTbbnQYlAtOI/lYtgTyh4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-prEOt9D6+zfU7YNYiNJuGgId538rkvOdjzNEeasL45w=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-wmZr7eZWdXmG8WObEMtp72KatUbSaf7oILUlIoI+548=",
        "entryId": "symbiote-engine",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-kDogXk3XThzAMDd2E5od8/UR2irlFA/AGlU8Mt7y3lw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-rPFrozOo8qk7JXLQWW5Red6QWTeq7aQg2Px44b28TV8=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine",
          "cv-show:cue:symbiote-engine.open",
          "cv-show:cue:symbiote-engine.intro:scroll",
          "cv-show:cue:symbiote-engine.intro",
          "cv-show:cue:symbiote-engine.workspace-join:scroll",
          "cv-show:cue:symbiote-engine.workspace-join",
          "cv-show:audio-clip:symbiote-engine:01",
          "cv-show:audio-clip:symbiote-engine:02",
          "cv-show:audio-clip:symbiote-engine:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-flVqK6b0pA4uEgvhReKDQdNoOlvYcS3+QA/v6whdC/s="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZHbA4WS1a7Pu5mRSMQ9VVnXe0RDVqY7qI+gpmKfWApg=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ciXihHWlj5lIkcs14EYFk3p90aZAiKefU07DXWDxAjQ=",
        "entryId": "agent-portal",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-lGrjx+cro2VloqVIRpVz5nH7DnKL9TT5wvv/cOMZG4w=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-hHSrN01ig6BsXnERdAzeJUwGplCkdWOMuSpFEDraEKc=",
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
          "cv-show:audio-clip:agent-portal:01",
          "cv-show:audio-clip:agent-portal:02",
          "cv-show:audio-clip:agent-portal:03",
          "cv-show:audio-clip:agent-portal:04",
          "cv-show:audio-clip:agent-portal:05",
          "cv-show:audio-clip:agent-portal:06"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-/7wLBaAaFVobkdHXEWpFT0PJsfFXpKmz7THXVDQkj8g="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-7nMDkWQX3/9OelAIh5xuAEDQ9MCfw7spgmYC/F5Q2qo=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-mEPT5jjP8MKZrLWbG0+YTSymd+L8aSgX6iim/foPj8Y=",
        "entryId": "symbiote-video-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-MGPyO2/nzxr1hgGdS+wvJNXJQ6MuCLBSYgu/SqP60W8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-ifz7EfSK7QYcW3S8lVr3/0U+fzK+NRoOLXeWUEDV2Nw=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-video-studio",
          "cv-show:cue:video-studio.open",
          "cv-show:cue:video-studio.visible-process:scroll",
          "cv-show:cue:video-studio.visible-process",
          "cv-show:cue:video-studio.demo:scroll",
          "cv-show:cue:video-studio.demo",
          "cv-show:audio-clip:symbiote-video-studio:01",
          "cv-show:audio-clip:symbiote-video-studio:02",
          "cv-show:audio-clip:symbiote-video-studio:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-qxSGZpPkOjcMOUHxcl/VVH5Qcf/WsEAkMENzNULa4+A="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-t2cviazPEEIKCOfjIIkjxYj6uLPK1uVSPEvGrTYFBi4=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-U7g8SKjMkPJC64ZtVlHx+zXc+oTVSAP+cjCOW9M7UQM=",
        "entryId": "adaptive-maximo-workbench",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-bhzPfM0bAE0L0t9L1tLeQbP2+ry7YpIMN/9hc6BVS30=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-9w22SiO7Nm5B5/qUGMODYmHuH7gDiI54W9xLIbnO2ho=",
        "sourceCellIds": [
          "cv-show:narration:adaptive-maximo-workbench",
          "cv-show:cue:maximo.open",
          "cv-show:cue:maximo.work-orders:scroll",
          "cv-show:cue:maximo.work-orders",
          "cv-show:cue:maximo.asset-context:scroll",
          "cv-show:cue:maximo.asset-context",
          "cv-show:audio-clip:adaptive-maximo-workbench:01",
          "cv-show:audio-clip:adaptive-maximo-workbench:02",
          "cv-show:audio-clip:adaptive-maximo-workbench:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-lczUOwbNRsVBNwXdKxK7/Watb/xQYkIpXcy9cePhuWo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-iKlnRRlbsiBaRtgKAwUiqVH23R7/qPsb1AKVKetB1Uw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-o0iavxCoWdqNEMKqmbNk7ptmepQ9FsVeDUdhmJNRkfI=",
        "entryId": "agent-pool-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-rqi8aO1QwBNoXjtd+S5OLTLdl9+ePloCaOBZMVGjOgM=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-yO9FZv9AI0u20GFC9q8tJmfNvNnxcef9AFQ/62n82/A=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-mcp",
          "cv-show:cue:agent-pool.open",
          "cv-show:cue:agent-pool.flow:scroll",
          "cv-show:cue:agent-pool.flow",
          "cv-show:audio-clip:agent-pool-mcp:01",
          "cv-show:audio-clip:agent-pool-mcp:02"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-oI3mv0/3TAV8KqHPS4wpZgDPJLyFGo+gYZdIgoIAwx4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-hfEvQNBhI4ehdNXbEWlM9lZ2G8cvAdZwJOhANj99Tbc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-iKzK5YDypI8aHUsYvCeG/Xsi2YHKh1z1bFgGn/pCMKI=",
        "entryId": "project-graph-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-XSAjA8C4SHR0PQvewov48CSVSjXj07OZUhezXnk2lNo=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-U58IW8+hFFKJ0WGIvcHjDwhN8KMZkqtvi5FSngtQSRM=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-mcp",
          "cv-show:cue:project-graph.open",
          "cv-show:cue:project-graph.example:scroll",
          "cv-show:cue:project-graph.example",
          "cv-show:cue:project-graph.context:scroll",
          "cv-show:cue:project-graph.context",
          "cv-show:cue:project-graph.node:scroll",
          "cv-show:cue:project-graph.node",
          "cv-show:audio-clip:project-graph-mcp:01",
          "cv-show:audio-clip:project-graph-mcp:02",
          "cv-show:audio-clip:project-graph-mcp:03",
          "cv-show:audio-clip:project-graph-mcp:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-khvzxZ2eBFNLVOKkH5rM/CEC/PoFQiPbvixwX21eCkc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-wm8tn+xgj8lI42tu25aL0Ho08nn2nHKc+mSKeS625n0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-5p45YcNjwANYXQRU9fhr6Yj5X7W+i/qTFDgGKPgb2fo=",
        "entryId": "lifecycle-messaging-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-E3Q2rQ3vts7n0DvofljrJ7sYSgPKUZmM7t+DWMeuu+4=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-e9dVkJdL6qPnp3kFiK2h2SH69pVXKfHV6CrhyIKZE5I=",
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
          "cv-show:audio-clip:lifecycle-messaging-platform:01",
          "cv-show:audio-clip:lifecycle-messaging-platform:02",
          "cv-show:audio-clip:lifecycle-messaging-platform:03",
          "cv-show:audio-clip:lifecycle-messaging-platform:04",
          "cv-show:audio-clip:lifecycle-messaging-platform:05"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-jETwRxb75wNlXxMZ3tArJPLbm8DXuXRSN9FieQrcT9U="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-eHD0GTkJkPQKPCc5wbLpTQ5in//Uo5Ul2D+SANFoCp0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Fdez7My13mI7r73CQ/jYd+xPAJxR6siXN25lYvvNDe4=",
        "entryId": "mobile-smm-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-cOxclao3fVt9oiH1/xvFE/Uo3uuVJMCXMBhJfDpjR6M=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-Ac/jCGDy0hJcWz7bdx1KROioryrSykCibPGdQX+B/X0=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-platform",
          "cv-show:cue:mobile-smm.open",
          "cv-show:cue:mobile-smm.overview:scroll",
          "cv-show:cue:mobile-smm.overview",
          "cv-show:cue:mobile-smm.stable-path:scroll",
          "cv-show:cue:mobile-smm.stable-path",
          "cv-show:cue:mobile-smm.agent-update:scroll",
          "cv-show:cue:mobile-smm.agent-update",
          "cv-show:audio-clip:mobile-smm-platform:01",
          "cv-show:audio-clip:mobile-smm-platform:02",
          "cv-show:audio-clip:mobile-smm-platform:03",
          "cv-show:audio-clip:mobile-smm-platform:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-44fqkjky36J8mhcxYJnzRxvEf59JcTz63dg1nm8ymbU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-hkImF0HWBjJT3bN9XLyrD7IOYcTr6V190jiLihz8rv8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-qVJoZg1MNwpO7dDBHIV9eiqskiNUD8p6nAvd7pEsnLk=",
        "entryId": "f360-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-CDXLONHzM+JLvrAU3WzKM5gC/y+p6OpZXbxrTlxDcK0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-5KaNWJqdPAJrPzLJ7I9leCuCbiP2zGe+z5ncvIS9sXM=",
        "sourceCellIds": [
          "cv-show:narration:f360-studio",
          "cv-show:cue:f360.open",
          "cv-show:cue:f360.process:scroll",
          "cv-show:cue:f360.process",
          "cv-show:cue:f360.result:scroll",
          "cv-show:cue:f360.result",
          "cv-show:audio-clip:f360-studio:01",
          "cv-show:audio-clip:f360-studio:02",
          "cv-show:audio-clip:f360-studio:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-2cvgiQm/DRi8coM/sZaQCliXxQhKq8kfJqXdc8XOa/E="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ap2DLUKzfEMCqS/gjjbjt8AdXbNBnsk731glnhjUYZo=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CySjPrStiHkk3m9Ktvzdp2q9+mSmBTHMjYouFgL806E=",
        "entryId": "autobox",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-LYwF+xucsF7wb0fUchazT+3w7tb/4KAV5RaltkGRQHU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-GZg3+Rt6JZp0LcquiEZgx6UxvmLZgMdQ8InFeW4jQas=",
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
          "cv-show:audio-clip:autobox:01",
          "cv-show:audio-clip:autobox:02",
          "cv-show:audio-clip:autobox:03",
          "cv-show:audio-clip:autobox:04",
          "cv-show:audio-clip:autobox:05",
          "cv-show:audio-clip:autobox:06",
          "cv-show:audio-clip:autobox:07",
          "cv-show:audio-clip:autobox:08",
          "cv-show:audio-clip:autobox:09",
          "cv-show:audio-clip:autobox:10"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-EJHKO8F9O1D3WFEiDK0J+h03t9jnRnlnbeCYtz5Y3O0="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-npJojdqkfYW6cUe0i5szdd30TkCUgzVk5DtMyFdbXV8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-zs35g8/EZTjlRUISaww7h1yrw8Iwc3WaETpMYEh2oLc=",
        "entryId": "complexscan",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-gfWjPJQP6o06YVwqihS7Gvkdv7qFdYSZ5fANLww+KWA=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-RhHLqu1IunZDXarbqVL+mh2ziBau2UsP7MDmysLF8bA=",
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
          "cv-show:audio-clip:complexscan:01",
          "cv-show:audio-clip:complexscan:02",
          "cv-show:audio-clip:complexscan:03",
          "cv-show:audio-clip:complexscan:04",
          "cv-show:audio-clip:complexscan:05",
          "cv-show:audio-clip:complexscan:06",
          "cv-show:audio-clip:complexscan:07",
          "cv-show:audio-clip:complexscan:08"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-yx1pOx9bOR85SueiPPjimBk9aNaf9p31g2VXx11vWh0="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-wXI9MSrLSgolD4qcskhVsLnfaUmSEY4YLf9mdw4ADpk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-iEojcDJQAVDYbOe3HEXi+zc9YZy/OX0FXTy0jIU1lW4=",
        "entryId": "photopizza",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-FccqzoeBS39v0IL9maz2hii1rLqXsNC4+LD5vvfQDXY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-rvSrWiSaWyfQScaCabmt/6nUDzqler3xf80mnTiaPHo=",
        "sourceCellIds": [
          "cv-show:narration:photopizza",
          "cv-show:cue:photopizza.open",
          "cv-show:cue:photopizza.origin:scroll",
          "cv-show:cue:photopizza.origin",
          "cv-show:cue:photopizza.video-01:scroll",
          "cv-show:cue:photopizza.video-01",
          "cv-show:cue:photopizza.video-02:scroll",
          "cv-show:cue:photopizza.video-02",
          "cv-show:cue:photopizza.mechanics:scroll",
          "cv-show:cue:photopizza.mechanics",
          "cv-show:cue:photopizza.video-03:scroll",
          "cv-show:cue:photopizza.video-03",
          "cv-show:cue:photopizza.video-04:scroll",
          "cv-show:cue:photopizza.video-04",
          "cv-show:cue:photopizza.video-05:scroll",
          "cv-show:cue:photopizza.video-05",
          "cv-show:cue:photopizza.controller:scroll",
          "cv-show:cue:photopizza.controller",
          "cv-show:cue:photopizza.spinner:scroll",
          "cv-show:cue:photopizza.spinner",
          "cv-show:audio-clip:photopizza:01",
          "cv-show:audio-clip:photopizza:02",
          "cv-show:audio-clip:photopizza:03",
          "cv-show:audio-clip:photopizza:04",
          "cv-show:audio-clip:photopizza:05",
          "cv-show:audio-clip:photopizza:06",
          "cv-show:audio-clip:photopizza:07",
          "cv-show:audio-clip:photopizza:08",
          "cv-show:audio-clip:photopizza:09",
          "cv-show:audio-clip:photopizza:10"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-OriP+doAo4+r0kpq9RIa65QPbs6C1FVaE4Hs+/7ARFs="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-h7HVJr6espKfoOJCh6bKspJRdbUJx++9z/nooxWcUUc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-bzx2WwMVWLk0SBUKqBP8HBR0bz6ycgkpv73NStas0S8=",
        "entryId": "finale",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-ekNbKO6XlXaAo8DAhFr5ES5Y+4s7S1Q6NJF1BErF7yI=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-BcabBttpbInDPu/kwUru5AmIeUyt5woUzwkETudnwtE=",
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
          "cv-show:audio-clip:finale:01",
          "cv-show:audio-clip:finale:02",
          "cv-show:audio-clip:finale:03",
          "cv-show:audio-clip:finale:04",
          "cv-show:audio-clip:finale:05",
          "cv-show:audio-clip:finale:06"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-rWU7mMsFV+ubyhx6XlAYWBmbzowyaZKOPA5aJK7GyYw="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-lcBhuobGzFKiOy7rZElWqe2rhGvLL4FBZkhJ4lud1KA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-KfGrnJavNeMMgn3TcZhgVmwaKaEr1miuHzVMqRhJfz0=",
        "entryId": "workspace-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-i5zfbVnjdLNfhoWKuTcmtfJ/HngZSsycaFNgpqdFQq4=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-tiB1+KZ73hSqxn50Gi6Q6AjZLo/hoJ4cvlbAMbIObrk=",
        "sourceCellIds": [
          "cv-show:narration:workspace-details",
          "cv-show:cue:workspace-details.flow-frame",
          "cv-show:cue:workspace-details.flow-route:scroll",
          "cv-show:cue:workspace-details.flow-route",
          "cv-show:cue:workspace-details.artifact:scroll",
          "cv-show:cue:workspace-details.artifact",
          "cv-show:cue:workspace-details.hosts:scroll",
          "cv-show:cue:workspace-details.hosts",
          "cv-show:audio-clip:workspace-details:01",
          "cv-show:audio-clip:workspace-details:02",
          "cv-show:audio-clip:workspace-details:03",
          "cv-show:audio-clip:workspace-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-REl1jXRSVmzu+Up/W2+Iy8Oql822P+uyKHnjx/04xYc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-+ct0jcSPwCDyC9oBUNoljCjN1ixGDG/WnmHA3ALglyE=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-9/TXPiqkYToVC2hT3tSxdYtZvG6DVygwwrJOXjdKPtU=",
        "entryId": "symbiote-ui-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-DZJQoBNG4CfscNyobjT1KmtwMyO5kvBMCYlpqk5JnXs=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-ocL+PPhzotor+2wU6+91cX2FOOIQWXQ/Lg6CP47T45I=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-ui-details",
          "cv-show:cue:symbiote-ui-details.composition",
          "cv-show:cue:symbiote-ui-details.catalog:scroll",
          "cv-show:cue:symbiote-ui-details.catalog",
          "cv-show:cue:symbiote-ui-details.manifest:scroll",
          "cv-show:cue:symbiote-ui-details.manifest",
          "cv-show:cue:symbiote-ui-details.workspace-route:scroll",
          "cv-show:cue:symbiote-ui-details.workspace-route",
          "cv-show:audio-clip:symbiote-ui-details:01",
          "cv-show:audio-clip:symbiote-ui-details:02",
          "cv-show:audio-clip:symbiote-ui-details:03",
          "cv-show:audio-clip:symbiote-ui-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-+sXOW3TTlXWmYPiw1K/eutI7ZocP5T5bLI63lJzQ2wM="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-mNOldRErDtHl3Oqh3CAVK27y9ZWYtd35Oy6aIQ64Kzc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-DbmdTUx9eF2K4xYDfQrdrwU5IPmMnBoxkrrzAEPSEBA=",
        "entryId": "symbiote-engine-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-6pjfTMJI4GgBh4n1oRLJg8n7lMd/B4tEwtx73z1lrH4=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-vAPE5+ClcJDHV1isvi60+0b18U7XExEhSy4WLuUS2E4=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine-details",
          "cv-show:cue:symbiote-engine-details.layers",
          "cv-show:cue:symbiote-engine-details.execution:scroll",
          "cv-show:cue:symbiote-engine-details.execution",
          "cv-show:cue:symbiote-engine-details.demo:scroll",
          "cv-show:cue:symbiote-engine-details.demo",
          "cv-show:audio-clip:symbiote-engine-details:01",
          "cv-show:audio-clip:symbiote-engine-details:02",
          "cv-show:audio-clip:symbiote-engine-details:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-sea0ntzsn46lXmUbBvZ8F5e4bTBvW+Tvgptu/eqFzZ4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-GjcHlx9uIHfhkb/+t0yw5kmovTIDElSOZbyKNCwC/Fw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-bZdav/KUBzi8Yh+PJZm5mTamVdWrbja2VE5z/2M+ysA=",
        "entryId": "agent-portal-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Cod6CmKdfJgHI7bA7yHUuvvDpG0R2K0AaUN0gvBi2DE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-LH2LnPFuGcnIkUo7nbqFqw5vqfObN9MX30u6rjn7yPU=",
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
          "cv-show:audio-clip:agent-portal-details:01",
          "cv-show:audio-clip:agent-portal-details:02",
          "cv-show:audio-clip:agent-portal-details:03",
          "cv-show:audio-clip:agent-portal-details:04",
          "cv-show:audio-clip:agent-portal-details:05"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-nfVlm+0+58ESQj1YJJh78YWui3f03lHDOm5An2oX6OE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-tey/cJ3NPXXG3oCsawKpNR3a7fuj/GXd2cx3x9U16jM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-T/XONow1l7gpHWFTWveZh1xObRP5JL9Ol325wzdvOGg=",
        "entryId": "video-studio-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-imVlAXoz0is9wbsH2ZPg9uGXY3B5LIt+g1wLBrSlflg=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-u/7RRCgEpeXa3mqZUwYcT5sl7OSrRQQ3ZMp/0ifQcCs=",
        "sourceCellIds": [
          "cv-show:narration:video-studio-details",
          "cv-show:cue:video-studio-details.flow",
          "cv-show:cue:video-studio-details.route:scroll",
          "cv-show:cue:video-studio-details.route",
          "cv-show:cue:video-studio-details.demo:scroll",
          "cv-show:cue:video-studio-details.demo",
          "cv-show:audio-clip:video-studio-details:01",
          "cv-show:audio-clip:video-studio-details:02",
          "cv-show:audio-clip:video-studio-details:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-At9Jx1Mc7+RBVwrqqj7HiVwBhPrF43KVxIv1l2XvYrk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-eLPTzIhaedrS4ftmxF2TKAl4Aaqm3Nrh6i68lZWgASc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-yQbfMyHGarM0oTQ3XipI4PpY5+QRkZFE/E8bZzq3tcU=",
        "entryId": "maximo-workbench-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-HxvmYmtpiDJgj/x2jwW9FnWBDzyT5kbRtZKF5ip7CTc=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-JZW8lD5OQcpuYV8nYmOIRLYilQXO3etv53Ec7bLj0JA=",
        "sourceCellIds": [
          "cv-show:narration:maximo-workbench-details",
          "cv-show:cue:maximo-details.work-order",
          "cv-show:cue:maximo-details.asset:scroll",
          "cv-show:cue:maximo-details.asset",
          "cv-show:cue:maximo-details.actions:scroll",
          "cv-show:cue:maximo-details.actions",
          "cv-show:audio-clip:maximo-workbench-details:01",
          "cv-show:audio-clip:maximo-workbench-details:02",
          "cv-show:audio-clip:maximo-workbench-details:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-dX0FPhM4xlyJpkAezkCig+ND6GhmRvSTZj4hOOr7jaI="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-jX/4WcBD1qJQQ3JveUM/4uK7qXDe384a18TlvA6YZLo=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ZXJLFGtyPgAPK03yzax5uwszA7aKqgDop8QMHqofjkU=",
        "entryId": "agent-pool-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-XV9hYlFy0cJbFxFM1lnnJEhGewWdBOXJI/QoOW4s60I=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-F+8mq4X6QpUzNMaj7beb+DPpeCjG7r3Id/74KuVgais=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-details",
          "cv-show:cue:agent-pool-details.runtime",
          "cv-show:cue:agent-pool-details.work:scroll",
          "cv-show:cue:agent-pool-details.work",
          "cv-show:cue:agent-pool-details.review:scroll",
          "cv-show:cue:agent-pool-details.review",
          "cv-show:cue:agent-pool-details.result:scroll",
          "cv-show:cue:agent-pool-details.result",
          "cv-show:audio-clip:agent-pool-details:01",
          "cv-show:audio-clip:agent-pool-details:02",
          "cv-show:audio-clip:agent-pool-details:03",
          "cv-show:audio-clip:agent-pool-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-5HORJujJQPWYr4ZST2necaaQvac5HaHtn9gviQtJToA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-+jGVIzCJrAIrV4OX0rF4utaJz1xdHrqw+pb9RsfiPKw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-GN+hKaWCxc5XCxvZjVZz9d5hrrzt3a2JkNZr5oZUT8M=",
        "entryId": "project-graph-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-WaoVf9Hs0EEKsW4bYu93GitZd16xi4XNsAXOmF+Eb5Q=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-lDGzFtBnppSvyLGrSfyd84peKskC0N/12iG2x86yHEQ=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-details",
          "cv-show:cue:project-graph-details.root",
          "cv-show:cue:project-graph-details.skeleton:scroll",
          "cv-show:cue:project-graph-details.skeleton",
          "cv-show:cue:project-graph-details.fact:scroll",
          "cv-show:cue:project-graph-details.fact",
          "cv-show:cue:project-graph-details.focus:scroll",
          "cv-show:cue:project-graph-details.focus",
          "cv-show:audio-clip:project-graph-details:01",
          "cv-show:audio-clip:project-graph-details:02",
          "cv-show:audio-clip:project-graph-details:03",
          "cv-show:audio-clip:project-graph-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-U5672TR7hX8fvDKzDRF2GIfuxd0VL8mrR0O9gab/ZU8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-gpRCYqNVwzl5y9yODo1Q5OHemBsw82XEHxKb9UgHEQw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-X1hojUbShrJXTWLNXZT3b2AB7T+fOpvaaiORZoabToE=",
        "entryId": "lifecycle-platform-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-GX+Qa+msr1SSgBdfkwNxm3dtvfTYL4fcYL6R4+NQUBE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-VPD167zTRt4KHh8fu8YJE/7HqZUGlgmcs0ZdJjKKXJU=",
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
          "cv-show:audio-clip:lifecycle-platform-details:01",
          "cv-show:audio-clip:lifecycle-platform-details:02",
          "cv-show:audio-clip:lifecycle-platform-details:03",
          "cv-show:audio-clip:lifecycle-platform-details:04",
          "cv-show:audio-clip:lifecycle-platform-details:05"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-HxP6GKgUOmx+y9DssebwGvOvTylnCIjAUnN4nns3oTo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-wtWH+9Tx9xv8z2Jb51GSz/P8pck/1OXyWMHLNOBhEAA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-BYkMPY/8LnVitCKo0wwFG4LUdRjaIOAgPWc9MuCQP8Y=",
        "entryId": "mobile-smm-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-pbu3tLh0Abu95omfAYJCETcR1hwxgTWxnNk7xm4oaYE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-uNbHfsKyRsyupm9Q7sWKgTC2krCOsrR0IC/VmL6Lzko=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-details",
          "cv-show:cue:mobile-smm-details.gallery",
          "cv-show:cue:mobile-smm-details.schedule:scroll",
          "cv-show:cue:mobile-smm-details.schedule",
          "cv-show:cue:mobile-smm-details.queue:scroll",
          "cv-show:cue:mobile-smm-details.queue",
          "cv-show:cue:mobile-smm-details.ui-change:scroll",
          "cv-show:cue:mobile-smm-details.ui-change",
          "cv-show:cue:mobile-smm-details.approval:scroll",
          "cv-show:cue:mobile-smm-details.approval",
          "cv-show:cue:mobile-smm-details.draft:scroll",
          "cv-show:cue:mobile-smm-details.draft",
          "cv-show:audio-clip:mobile-smm-details:01",
          "cv-show:audio-clip:mobile-smm-details:02",
          "cv-show:audio-clip:mobile-smm-details:03",
          "cv-show:audio-clip:mobile-smm-details:04",
          "cv-show:audio-clip:mobile-smm-details:05",
          "cv-show:audio-clip:mobile-smm-details:06"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-oU24ypo+CjabJYt10vI3YJwIvpopDOV4mHYtEgG/Ptc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-lUj7LLwMd/cwLYSQmpv48AehBOk11DKKj3r2r+1uYxk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-pEjbsr30dgiKh9MEZUN7pUDUPs5fO/F+7VKRmm+lrew=",
        "entryId": "f360-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-8dVqehPB8NZ0AVXKcDqm4BLmyiC/vgccgUhHqGFAEBk=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-0ZEUAlsmhBEdOIPKTqo8Gj4UgZPb+GSKxeyzBtgSJUs=",
        "sourceCellIds": [
          "cv-show:narration:f360-details",
          "cv-show:cue:f360-details.path",
          "cv-show:cue:f360-details.result-one:scroll",
          "cv-show:cue:f360-details.result-one",
          "cv-show:cue:f360-details.period:scroll",
          "cv-show:cue:f360-details.period",
          "cv-show:audio-clip:f360-details:01",
          "cv-show:audio-clip:f360-details:02",
          "cv-show:audio-clip:f360-details:03"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Ssr/l/Xbdj0SWF+n4at2pap8gnDOuEJhlyDJfPZ91UU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-AiNAPrPl54/afY16RzCZZUq8v3lwTr88LhXKyUH2Yno=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ImaA2RshXAutQt/1b9AGHOMn8Z/RlF10FJlSvvjSYb8=",
        "entryId": "autobox-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-V2kKSc56FA/n5K5viWkRnRUDHnfKpKamCLLnk9b/2gU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-6csEh0htMxmNJ/3fOuGNSNa5ORPv/V+217b3J1NzbVg=",
        "sourceCellIds": [
          "cv-show:narration:autobox-details",
          "cv-show:cue:autobox-details.working-system",
          "cv-show:cue:autobox-details.working-route:scroll",
          "cv-show:cue:autobox-details.working-route",
          "cv-show:cue:autobox-details.video:scroll",
          "cv-show:cue:autobox-details.video",
          "cv-show:cue:autobox-details.bronze:scroll",
          "cv-show:cue:autobox-details.bronze",
          "cv-show:audio-clip:autobox-details:01",
          "cv-show:audio-clip:autobox-details:02",
          "cv-show:audio-clip:autobox-details:03",
          "cv-show:audio-clip:autobox-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-WQY7qQ9vo0DJ5/50LwnrAIvLLC3Gc6aK7eFUqLRE0W4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZRK5eCOI9KKaO1AuH7ohLqY6/L6IHQ0VqD/+zgHyN20=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-F3vqRea1WSWi4FV23/bfI6lb0yA2ZWHoOT81A7UNn5w=",
        "entryId": "complexscan-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-6o//IBsw73VTj+xJgPqPBBpjBrZGM3091m3+O6vnthM=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-o9CKpFoEKrEZtW7rX+dpvbHp+ZyX64laSoQB0rV5xOg=",
        "sourceCellIds": [
          "cv-show:narration:complexscan-details",
          "cv-show:cue:complexscan-details.platform",
          "cv-show:cue:complexscan-details.light:scroll",
          "cv-show:cue:complexscan-details.light",
          "cv-show:cue:complexscan-details.gallery:scroll",
          "cv-show:cue:complexscan-details.gallery",
          "cv-show:cue:complexscan-details.autobox:scroll",
          "cv-show:cue:complexscan-details.autobox",
          "cv-show:audio-clip:complexscan-details:01",
          "cv-show:audio-clip:complexscan-details:02",
          "cv-show:audio-clip:complexscan-details:03",
          "cv-show:audio-clip:complexscan-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-OljR2W5LrzBmzyNNYe0nSwgC9mPS7BPMz5WHMXKD+bc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-RzJNDnztfOkeOuCTLW27WJnqqKgszvu3+ZoPWkUENNM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-f1O8yEhGHT4MfIVigmxxtcEFDM9YhFo2m+MK10tJjfY=",
        "entryId": "photopizza-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-9w0aE3NLw14POBqDiSxMEu5aqd6TqMy6kapDvtdUfc8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-t4vZbFG7+D0VUUgiASmco4OxFk7NO+feUWqUhquT+KI=",
        "sourceCellIds": [
          "cv-show:narration:photopizza-details",
          "cv-show:cue:photopizza-details.origin",
          "cv-show:cue:photopizza-details.attribution:scroll",
          "cv-show:cue:photopizza-details.attribution",
          "cv-show:cue:photopizza-details.media:scroll",
          "cv-show:cue:photopizza-details.media",
          "cv-show:cue:photopizza-details.documentation:scroll",
          "cv-show:cue:photopizza-details.documentation",
          "cv-show:audio-clip:photopizza-details:01",
          "cv-show:audio-clip:photopizza-details:02",
          "cv-show:audio-clip:photopizza-details:03",
          "cv-show:audio-clip:photopizza-details:04"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-f4gSknuhftAdYHmtgP6dwr2V6fV6MakuY3iSoCC6Aac="
      }
    ],
    "hash": "cv-show-audio-provenance-v1:sha256-ie9z3T2zPpBYH5nwSOrUGSk/y20glMPzAI9kwyzNNwE=",
    "schemaVersion": "cv-show-audio-provenance-v1",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "artifactTreeHash": "cv-show-audio-artifact-tree-v1:0b7904bd023b999f4471c80e8ab14fbc2585b6c3b812d009e912dc315b804c5c",
  "entryReleaseIds": [
    "cv-show-audio-entry-release-v1:5dd57ec27db64e42aecd5767d9b7705553a07d4cdf1849ced449ef05717c29aa",
    "cv-show-audio-entry-release-v1:22a661f3298c7c53491ebc964b4f97b9cecfb8f2d8599fc841e3e525f4a1c99e",
    "cv-show-audio-entry-release-v1:b2d91e8fd3be548a89ffd40d7f82354afa3424068e3ac3545639fd4354929729",
    "cv-show-audio-entry-release-v1:f36504faf99d61fcce52b0a7690d631a2f751ea8fc9e44f8b38cdd001d1a3cf3",
    "cv-show-audio-entry-release-v1:0601cc1d50a9279e493f53ac7e8605888100ef9f5015d81663595f91beb6ab93",
    "cv-show-audio-entry-release-v1:7edeeab3b801c9ff2f488597385622e6f3cdc07709a86dc6ecaf1d00a732718e",
    "cv-show-audio-entry-release-v1:aac40fffbe9903920192329a47cf042062a5890f9e81440fd0bc33162598f800",
    "cv-show-audio-entry-release-v1:51242e5e65079fb75612bd7759c89c58762ec6f1eba8be5ded0eae6ec9a83fc5",
    "cv-show-audio-entry-release-v1:23b500870b752a9f137942b4f28b3402f2c74df0682507b5334bf04ac9df117a",
    "cv-show-audio-entry-release-v1:6cc05fd66cb0d5b15cc3cbe5f79b63779e8750c6dc797e66f77ee2c5d42b345c",
    "cv-show-audio-entry-release-v1:d1d1f189a072013c3c3865422dfac65ed1ec019a6e6e7e19b1c5f09e1639f482",
    "cv-show-audio-entry-release-v1:dde2669ef120bf63e13a3aae9f2f0d6c65a9aa324eb28f869e9f030c53db7a7b",
    "cv-show-audio-entry-release-v1:892a723725f9f679181b51d34b86778fcba76bb46ec89d838350b593be1c7438",
    "cv-show-audio-entry-release-v1:51362e55e93e6474765984e4fc0043b390b88e9ace6e4b4e88a6823d5425a742",
    "cv-show-audio-entry-release-v1:b5b92a1863217e997b6ba788fb28bbc3a8d07ffd9335a6d470ab3272e44c2f28",
    "cv-show-audio-entry-release-v1:351a48a983553f6a39e86fd9c62b7048f314b591212de4a520cbce1a1b9b3587",
    "cv-show-audio-entry-release-v1:a05e373204f323aabb0e191ce8499e4fe51efcaab53039a5f8c2e6ba6bec283e",
    "cv-show-audio-entry-release-v1:c09b870f70c574ee7291830caa52d045db6752dfd6623b0b0803047e0e5d0f01",
    "cv-show-audio-entry-release-v1:9b31b13b2d47f36109dea909e68c6502ae799302761b04d40a1591ed6a68c93d",
    "cv-show-audio-entry-release-v1:a1aabcb3eb17a0cf94e2e82557c43897603b6ca256f8804274a24d6a3260fe35",
    "cv-show-audio-entry-release-v1:9b9b3618efbfa0efff0bb64fffe99a2eaa54f88ca690470c1f297b0ebee9ad86",
    "cv-show-audio-entry-release-v1:db67f22f8d3fd1b4b0675410d8edd50506ea62ff08a8c2a2724c1873763a47d3",
    "cv-show-audio-entry-release-v1:a7c9e7fe602f3b45cab2175839016bf604a9bf957d604424ceb310521638dd50",
    "cv-show-audio-entry-release-v1:cd3dc002337fbadede16759ca927ba0e4a6d15fbca6d5db6163b949132f8dcf3",
    "cv-show-audio-entry-release-v1:901179e30096e0f8cf8691ea5495a9e43ef6f4ddde063b0e92a362886e8dbc9c",
    "cv-show-audio-entry-release-v1:d116520bc97def88577cd33e5e350e70cffdf43525e149c8942715d9a2951aec",
    "cv-show-audio-entry-release-v1:82774b1c798791031febc7d3b0b506a17d9e1136600575f1d14838d2b6369bfc",
    "cv-show-audio-entry-release-v1:f96352c0fe74ed18b1accc09b125838de1e05294ea949362fda15bc0d346395e",
    "cv-show-audio-entry-release-v1:5873dacf8f0e15ecc77d0e75321a6987b7cd74788e751113c8d8d19dff78fb11",
    "cv-show-audio-entry-release-v1:381bc685863211fcb66e3be5bf1e65e66c6b733dd432644cc9a06218f08b63e0"
  ],
  "manifests": {
    "alignment": {
      "model": "large-v3-turbo",
      "path": "alignment/large-v3-turbo/66f9f319ba19bde1/manifest.json",
      "sha256": "eed37ed5620cd0eee2f954b4c1b5d745c3e1f9df1dfe55a0b8f31e933e3f8dce",
      "size": 1858999
    },
    "audio": {
      "path": "manifest.json",
      "sha256": "e87a7052a37f07b5011217b62d06093f47e2b87e9bf794410ef8fd9b0c7bc0ae",
      "size": 53744
    },
    "directory": "0b7904bd023b999f4471c80e8ab14fbc2585b6c3b812d009e912dc315b804c5c",
    "locale": "ru",
    "voice": "barzana-2"
  },
  "mediaCollectionIdentity": {
    "collectionId": "cv-show:34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
    "identity": "cv-show-authoring-media-collection-v1:sha256-8QDUykVHCqXXyNQHlUHiSE4yPn2cwFhVio+N9hl3gmU=",
    "manifestHash": "cv-show-media-manifest-v1:sha256-gu6Xs6rx6/TzBx9Rz+lzZxx/ASslezsrh7JgEk48JD8=",
    "schemaVersion": "workspace-presentation-media-collection-v1"
  },
  "planId": "cv-show-audio-release-plan-v1:e0e574092fec358046df7bc1d3c2cbc0bcca2c3e75f85a636b37aa8b1f6e46e0",
  "predecessorReleaseId": "cv-show-audio-release-v1:52f4497146b3c65ef6df4173824773dceb5fc2871bec37115c26329d7921613d",
  "profiles": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WJXMA0f9i4DwyS1CYrZ3FSAznMtAbhDA/lcaYjQVtNY=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-xkDP1BOrbemy4iknmMC7Vj4rwXfu/OsnY5Q7ZPGcfIc=",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "project": {
    "authoringProjectHash": "workspace-presentation-authoring-project-v2:sha256-CL/tfkF/FvDWnKQYhLMuFpFwwq/yx4C7X6FOrrWPTkY=",
    "revision": 58
  },
  "schemaVersion": "cv-show-audio-release-v1",
  "verificationHash": "cv-show-audio-release-verification-v1:4dcc8427e40f5fd401d0c2858de32dc645451c5e594e4e83c3063b10b4620856",
  "releaseId": "cv-show-audio-release-v1:d9543a397f0e9ef451c1be5ba94d8badc962df4fa2c9cd02c5f5cdfc1fbda61f"
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
