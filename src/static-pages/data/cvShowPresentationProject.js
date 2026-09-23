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
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-obKXQ+SOc+9bn6vfgbwaGMxYuz/Ky8wu9iq7gJE37V0=",
      "contentHash": "sha256:d9eb096a5d1236614919a325eede8bafa7c50258c85eada7e0422c72a0bac644",
      "durationMs": 63260,
      "id": "cv-show:audio:positioning",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-LuwV2dwxWaZOKfuC08u5Yc3AEP6/+UFqRVOX1LxPvrM="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-NL8IL1ph+MzrVb6IX66LFGLrQoh3MD/yCvRWuHoUQWM=",
      "contentHash": "sha256:ae1641905f87b5040701dcbdf2efbd40adf5e9e8b77b78c415fbacc947759864",
      "durationMs": 70630,
      "id": "cv-show:audio:symbiote-workspace",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-YXuQolDOaE8WRAb4Kc/9vzp/62QDTtHwY+nSQ7ZknR8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-2r1VInw9iTyodEVr7vwARrJ7BjS0eQ45Gkb2k/2M5Kc=",
      "contentHash": "sha256:047b5066a73789ee509524e71f78b4615dfde8c1c16251551b67bb222920f1e7",
      "durationMs": 69200,
      "id": "cv-show:audio:symbiote-ui",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-mvuhZQp82s99i5OdxAuUcW7WLGihKEcq+dPgtvrn2Vc="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-WRUJUshL2UdftrDNYKubxusBw10zkkDV1xqv/DJsA68=",
      "contentHash": "sha256:095ce6829172cb9aebef61a144b717d710f603c4c16d281f588a2b9f2623655a",
      "durationMs": 23620,
      "id": "cv-show:audio:symbiote-engine",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-5CUBaqksm8bZmikJU+ptbaVuiM1Cyn/PDQkim9GtcKg="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-kGiq5IHHkjZfpMh5d6oYAg7j8jEjplgfEt4mYR0RyIU=",
      "contentHash": "sha256:1d46070962af8c21773dec3b1c0ce34fab8245bac04f204884a52a146fd1cae3",
      "durationMs": 56750,
      "id": "cv-show:audio:agent-portal",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-HiY3FFhnVFArQPt5Xl+A/5Muu46Iwj04K9iFfM47CDs="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-n7AkAWn4gHZ9zhGpAoY1yU2rehbJjE8O0Z93k+2MWbc=",
      "contentHash": "sha256:c3c8f96cf93b7bd81e3ed6eac8b53a1d60fc8853cbe13af568c6e575a1a3ea75",
      "durationMs": 24600,
      "id": "cv-show:audio:symbiote-video-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-X+4EJg/eofJ9/Es/tZloAa3cju/0x3ASANeTufVBOh8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-kL4q/ymnVAvqBhvWLNVyH9gkwajgU5lBJscgi3jgrNc=",
      "contentHash": "sha256:f14756b6aa3fe876dfaa79256cedd96903c479d13159b553291b36008848c0de",
      "durationMs": 79380,
      "id": "cv-show:audio:adaptive-maximo-workbench",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-cfZSbf3WryvSVq/yOwhQplpyekRoX1pOw6gb7DkFEyI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-xWBs+npGeRGpZYQtilPQHBQR9SHtceOBC7bJRnCyv54=",
      "contentHash": "sha256:5ff5633bb1acd316ca0b3e0dc5b888a8bcff2c232f443bd38635d6cd275a4d2b",
      "durationMs": 24670,
      "id": "cv-show:audio:agent-pool-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-Kp1+4ZZNmx+Tt2DissxIWk4sjAJ8tbHVrfWRlKvKuLU="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-fnbSjpdQS/O5qdzl4NrztDrTeCbz6ZDNJDpVFdJnKVY=",
      "contentHash": "sha256:5ab7ec8a45c27a6db57f77d6471937556cd0d202b3af5b18c84903a766354392",
      "durationMs": 35480,
      "id": "cv-show:audio:project-graph-mcp",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-tEQAMxF6qU/U5dKU8BdC/JGpLu3uh6sl1f30iZWnBXI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-JFKHWXtQbdIkp1o25RgiL2Zb5jLarlBx2lBiW28Y3+I=",
      "contentHash": "sha256:d3c5cf10545bbb445d872f5c0203b2c1cd6f5be34bb19836af190791dedf27a7",
      "durationMs": 40100,
      "id": "cv-show:audio:lifecycle-messaging-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-oJNaubNs4ntZ7fTRyOGbU3lQIcYUafM4EQdJxAI+tIg="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-K6u8/R6on/C+HYuI79BfIwsY6+JU1NZhgVccSCeYDZk=",
      "contentHash": "sha256:636bf67474e1217d4e9119da73212d616cfd18d3fea063598e9898e23297805c",
      "durationMs": 36290,
      "id": "cv-show:audio:mobile-smm-platform",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-hjxwprd6CEo0EFg1YSwZMhIGqXR62MKu4GV0rSUABqs="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-cMzwzkozNxEna2laiZXYGFPX1F/+fz46sD/COuyIcvc=",
      "contentHash": "sha256:0ffc1334575d5711cf9faebddf0b589568b01fa6811b147c45976424f34ef43c",
      "durationMs": 29130,
      "id": "cv-show:audio:f360-studio",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-FATZbSMYqq2UanDL9uYO6Wlj3cMyq1FUsggGFkawOes="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-oG/GdUvrb/v+E0JlY/nvj6WNM1r61eHmFTJ8PPu/aRY=",
      "contentHash": "sha256:cfe418f54d17744dd776edfaeab80fbb9b1d40a5097d5f067479fc97d6f95fba",
      "durationMs": 77520,
      "id": "cv-show:audio:autobox",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-6R2QwSGot4RZgs4etSKe6V8TV6vywxRxGYAXdr5PWT4="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-VhjpBEw4wMCm9z1I7OYwLiWgZKN7gaUwoADGbsCzF8Q=",
      "contentHash": "sha256:46fd6450a619ace40df5d7ef6dae0f99af4528744f9a4a15b49e61bb64d18b5a",
      "durationMs": 140410,
      "id": "cv-show:audio:complexscan",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-bKjFnVAmFk7B4vBqUFvqrn4g4rK2sNKRhDJ3hbu/Fkc="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-rvClv8jylTQqUgsWeZCgov45NSqUk2EcpV6IKfLhRFc=",
      "contentHash": "sha256:b6c8e993ee3fc505f0fd3266e083d431396a0c85de11772fe9c8b608d3c53be4",
      "durationMs": 191840,
      "id": "cv-show:audio:photopizza",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-TbHaOaReTQ/H7XiogAsbpePmcTKAnJDilU7q/cGArBE="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-QyTo71rfDmYp2pxEgHpy0erDfunAwxyi6Jqq/BqQoT0=",
      "contentHash": "sha256:feee4452bb0256603a4714b7e178425a82282cbe73f7b79bd963feb98fa82807",
      "durationMs": 81780,
      "id": "cv-show:audio:finale",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-VazVaJR8NAnB8p6cGTHgu35IcvytsPCG9tiVCrKn+i4="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-DMO+OUrAHQljNkbA1vk6/ojQDqzRUK+fwyWuJBN3YqY=",
      "contentHash": "sha256:e92db0dd5317a001e64da2d5ca06b28ffc9d8998d4e750c2c799bca3f86213ac",
      "durationMs": 83540,
      "id": "cv-show:audio:workspace-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-jrNqp7RU3AF3xVEEqw/9JzNk0lRoJ9GkaXXNBg1XCD8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-6S2Xa4UBgfSoC/H7Wh3U59yMTfTPgUUxgXDlhjLZ6OE=",
      "contentHash": "sha256:3e6d9df6dd87c1f91f30459d98e6d49ed4601483fdb7f1f490d3e8e3076fa59e",
      "durationMs": 78110,
      "id": "cv-show:audio:symbiote-ui-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-+81Y+xS13NCLo8/+P/CsW8v4gp+HBTiC/AhHl5M9QAc="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-wJtVlTyv5Mc3CoV2RTQI6+/cRswaPNumaJuCynBJXUU=",
      "contentHash": "sha256:3166b6652b5029f685cd62dd956bba740778bc57398e57b77ebf50b3b5dc6124",
      "durationMs": 51150,
      "id": "cv-show:audio:symbiote-engine-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-5NCrTqYkaEgxDb5l347k/2oE0caflGOgnmgZvmBI9oA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-0mUmVB/IWZ5lx0CkvEDuKtAlRqxs1zZUpCevUriNelE=",
      "contentHash": "sha256:da9237b5e5fd2dbb15989f1fcf8839688934c612e3644ce97e5f8f4bd7f53070",
      "durationMs": 69720,
      "id": "cv-show:audio:agent-portal-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-vxDEMlHGxAI6MBnCr3/fOKhcpbr6+JL+ISrQoXEpfjA="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-BA28kt1FQLCGN1+kjbXcHFNYoQE4p+fLCYnZYC8oM4c=",
      "contentHash": "sha256:db2dcaf9b27c024025dba390c70728284b6e93375c069303e647f5638cde1c79",
      "durationMs": 53220,
      "id": "cv-show:audio:video-studio-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-slvlIBgsy+jjEoLU5VInbA/18CT+duZZXCpZUvhKtdw="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-TA2IwUpuihEMgWftC776+YCPrGHSq9PD8HTAnz38L4o=",
      "contentHash": "sha256:d11e9ae8504ee9fe560f7a317b21db8d989cbad9eba4751232917564e494008d",
      "durationMs": 84120,
      "id": "cv-show:audio:maximo-workbench-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-pUCW+dgdjpId/8mYJfNk6xPDwg8fmOv/RfJd/NJN2u8="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-FBqOPELIKkvacmGS0niiFid4pm7+6KdPLV938t0vL28=",
      "contentHash": "sha256:852d8456daeb5fa12547eb8f5f6b7489f939750cdde3214fb41b3924d05d4a5b",
      "durationMs": 56310,
      "id": "cv-show:audio:agent-pool-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-gllo9pgSdBR3jl6I9oaPvzckMeReD01KgTIfxc5KGtw="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-/+UmUA9EUvFClsfsevDo6DEgXExEvZrzWblyiGq9Z+o=",
      "contentHash": "sha256:3f4e07efe4d80a4b899525af50df2dab2dd18fa9aa8a5c6b0ab8339d28217485",
      "durationMs": 66260,
      "id": "cv-show:audio:project-graph-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-/vfAAZylYEfWcLCIjx5D1CC2ud0YAHxSQjf1/3kuN80="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-16xfGDGO3sZUHO4zX077eCeH/FZe9G95ClN4fePXsQ0=",
      "contentHash": "sha256:e283b0b28fd72090cabf2a22451df83169b8c91e04651053614fea85f17327ca",
      "durationMs": 70400,
      "id": "cv-show:audio:lifecycle-platform-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-ZyPN7t6vX721eg/Df0hth/UKRI2DbhiubOOdUqImd/M="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-9btVM75OtupC1LOw2r+cqVzcS/Uv+wCRzPBIuaRlneQ=",
      "contentHash": "sha256:bec2db0944a815ea22c74c01430c92b9d68acd14d8a0eb4178006efc2af068bd",
      "durationMs": 74620,
      "id": "cv-show:audio:mobile-smm-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-DznaAZ70EcxG72YNAG64istUUe5XFavtVufQUB60yK0="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-dZ5O3yLqqKxHAWm07frmuwLcOUYIWDKSVqpYnzPAV5U=",
      "contentHash": "sha256:b745e3e12f528ebca398fab0ac029e6d88139ff0604251d7c2b14526f1f243da",
      "durationMs": 54430,
      "id": "cv-show:audio:f360-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-H4HzeJocLU65y2yUlwTdEIAciUO+t5BHdnkRduB2Z7s="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-7y32O17uT1UQ6EKKN4LYiCz/QN11Xp3euH7J14z3sRw=",
      "contentHash": "sha256:f5e559d1ae494ee8f34ef466ea951b65d8c383653d8bea6a0831db53a6a005dc",
      "durationMs": 142940,
      "id": "cv-show:audio:autobox-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-UzO5RZpHxocBExV7TmNRii7ZfTfyAs7y2+dvbU8rKLo="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-qzFWYwAqdRr4ofVfo3rjgJTbGU2ypWu737HTDKpJf0k=",
      "contentHash": "sha256:00fd6008f79d05c30bc2e3142d39a02c5402959d95fb39b6732c334d7bd85e39",
      "durationMs": 180510,
      "id": "cv-show:audio:complexscan-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-IA9tHOlbJgVvIxJP9N05Z7yx6/Y8OQJHmtWEUpwh1uI="
    },
    {
      "alignmentHash": "workspace-aligned-sequence-v3:sha256-v5KdiVNYtLWWkxJg2A4AsWKgWLKa5lANHLcYnZHxQFk=",
      "contentHash": "sha256:94144b39c737d4a6a0147af29e68bacaede846eaf9a25be5e7b4ccbae54a8e6e",
      "durationMs": 223320,
      "id": "cv-show:audio:photopizza-details",
      "kind": "audio",
      "mediaType": "audio/wav",
      "sourceTimelineHash": "presentation-timeline-v3:sha256-3th1LNsrlPtVpwyF6mhMr5JtJekSWxlon2FeMYlTmlQ="
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
        "text": "С начала две тысячи двадцать шестого года я развиваю Agent Portal. Сейчас я постепенно переношу его в Symbiote Workspace как одну из конфигураций. Проект появился как мой собственный управляющий слой над разными агентными средами. По сути это единый процесс поверх разных агентов, моделей и способов доступа к ним. Он позволяет сохранять контроль над контекстом, задачами и ресурсами и при этом менять исполнителей под конкретный этап. Когда я начинал эту линию, я не нашёл готового решения с нужным мне сочетанием возможностей, поэтому стал развивать собственную архитектуру. Часть слоя управления мы открыли как опенсорс проект. А внутри Agent Portal есть два важных инструмента. Agent Pool отвечает за исполнение и распределение ресурсов. Project Graph отвечает за структуру и контекст проекта."
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
        "text": "В две тысячи двадцать шестом году одним из демонстрационных направлений Workspace стал мой эксперимент с ай би эм Maximo. Это хороший пример проблемы, которую я пытаюсь решить. В больших системах управления активами в одном контуре находятся заявки, оборудование, локации, бригады и множество связанных действий. Человеку приходится постоянно собирать контекст своей задачи из разных частей большой системы. Workspace позволяет строить процесс вокруг самой задачи. Заявка, конкретное оборудование, его состояние и доступные действия оказываются в одном актуальном контексте. В этом демонстраторе я показываю следующий шаг. Агент собирает рабочее пространство под конкретную задачу, а затем проводит человека по созданному интерфейсу и объясняет, что здесь находится и зачем это нужно. А здесь я развиваю ту же идею в икс ар пространстве. Рабочий интерфейс размещается вокруг пользователя, и вместе с ним появляются интерактивные три дэ объекты. Редуктор можно буквально взять в руки, повернуть и рассмотреть нужную деталь. При этом объект остаётся связанным с контекстом рабочей задачи."
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
        "text": "С две тысячи двадцать второго по две тысячи двадцать шестой год я развивал Lifecycle Messaging Platform. Это маркетинговая платформа для автоматизации клиентских коммуникаций. Она объединяла сегментацию аудитории, управление кампаниями, сценарии согласованных эс эм эс коммуникаций и аналитику. Я проектировал эй пи ай, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. А для проверки физического модемного звена я сделал локальный Digital Twin с виртуальными устройствами и воспроизводимыми сценариями."
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
        "text": "В две тысячи двадцать первом и две тысячи двадцать втором годах я основал и вёл F360 Studio. Это была коммерческая студия высокоточного три дэ сканирования. Здесь опыт музейной фотограмметрии превращался уже в законченный производственный процесс. Я выстраивал весь путь от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели."
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
        "text": "С две тысячи семнадцатого по две тысячи двадцать второй год я развивал профессиональное направление Complex Scan. Это была коммерческая линия оборудования для автоматизации предметной съёмки и три дэ сканирования. Внутри направления появлялись как универсальные системы, так и специализированное оборудование под конкретные процессы. Основой стали профессиональные поворотные платформы с прозрачной рабочей поверхностью из осветлённого стекла. Здесь требования к механике, ресурсу, точности и производительности были уже заметно выше, чем у открытого проекта PhotoPizza. Система поддерживала несколько режимов автоматической съёмки. Можно было работать пошагово. А для большого потока использовать непрерывное вращение и серийную съёмку камеры. Управлять оборудованием можно было с физического пульта или через веб приложение. Я проектировал механику и метод съёмки как единый продукт. Я собирал прототипы и первые экземпляры, готовил конструкцию для подрядчиков, выполнял финальную сборку и тестирование. Затем добавились упаковка, экспортная документация и международная логистика. В результате Complex Scan прошёл путь от ар эн ди прототипов до оборудования, которое поставлялось клиентам в разные страны. Одним из специализированных проектов внутри этого профессионального направления стал Booth Bot. Он решал конкретную производственную задачу. Нужно было автоматизировать каталожную съёмку большого потока винных бутылок непосредственно на складе заказчика. Не перевозить товар в фотостудию. А перенести студийный процесс к товару. По сути мы построили компактную автоматизированную фотостудию. Световые панели создавали заданный рисунок бликов. Закрытая конструкция изолировала сцену от внешнего освещения. Система автоматически определяла высоту бутылки и позиционировала камеру. От оператора требовалось подготовить бутылку и поставить её внутрь. Остальной настроенный процесс система выполняла автоматически. После съёмки изображение отделялось от фона, обрабатывалось и превращалось в готовый материал для каталога."
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
        "text": "В начале две тысячи десятых годов одной из ключевых точек в моей истории стал Megavisor. Я был сооснователем проекта и техническим директором. Я отвечал за ар эн ди съёмочного направления и производство интерактивного контента. Megavisor был облачной платформой для фото на триста шестьдесят градусов, сферических три дэ панорам, видео и виртуальных туров. Я участвовал в проработке интерактивного плеера, который связывал эти форматы между собой. Например, из панорамы помещения можно было открыть находящийся внутри объект. Затем перейти к его вращению на триста шестьдесят градусов. А после этого открыть связанные фотографии и другие материалы. В этом ролике виден общий принцип платформы и то, как разные форматы могли работать внутри одного интерактивного пространства. В съёмочном направлении я руководил студией Gate Nine и выездным производством. Я организовывал съёмки, координировал фотографов и ретушёров, разрабатывал оборудование и выстраивал технологические процессы. Я также продюсировал промо и обучающие видеоматериалы, чтобы снизить порог входа в новый для рынка формат. Рост объёмов съёмки привёл к следующей инженерной задаче. Процесс нужно было автоматизировать. Так внутри Megavisor появилась PhotoPizza. PhotoPizza я начал развивать с две тысячи десятого года. Проект появился как решение конкретной производственной задачи. Съёмку объектов на триста шестьдесят градусов нужно было поставить на поток, чтобы она легко масштабировалась. Сначала я собрал прототип из доступных промышленных компонентов. Он позволил нам быстро проверить механику и саму технологию съёмки. На этом прототипе мы отработали основные принципы системы. После этого я начал проектировать PhotoPizza как лёгкое, мобильное и доступное решение. Одной из ключевых задач было совместить небольшую массу с высокой грузоподъёмностью. Платформу можно было привезти на выездную съёмку и установить силами одного фотографа. При этом крупные версии выдерживали человека и позволяли снимать тяжёлые и габаритные предметы. В результате PhotoPizza выросла в целый модельный ряд. Появились и подвесные версии для люстр, украшений, велосипедов и других объектов. Система оставалась модульной. Один блок управления мог работать с платформами разных размеров, слайдером PhotoSnail и моторизированной панорамной головкой. Параллельно мы снижали порог входа в саму технологию. Например, я сделал простой вариант платформы из доступных деталей, чтобы фотограф мог сначала проверить сам формат почти без вложений. Позже PhotoPizza стала опенсорс проектом. Вместе с оборудованием развивалась и программная часть. В итоге с телефона по вай фай можно было управлять оборудованием и камерой через веб приложение. А это результат масштабирования технологии на крупные объекты. Интерактивную последовательность мотоцикла можно вращать и рассматривать со всех сторон."
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
        "text": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Андроид устройствами. Для стабильных участков процесса используется заранее подготовленный сценарий в формате джейсон. Он выполняет известный путь и записывает результат в журнал. Это дешевле и надёжнее, чем просить модель заново рассуждать на каждом обычном шаге. Но мобильный интерфейс может измениться. Если структура экрана больше не соответствует ожидаемому сценарию, исполнитель не должен продолжать нажимать вслепую. Он останавливается в безопасной точке. После этого агент анализирует новое состояние интерфейса и готовит обновлённый вариант сценария. Этот вариант сначала передаётся на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и подтверждение. Поэтому повторный запуск процесса не должен случайно дублировать уже выполненное действие. Здесь я соединяю детерминированную автоматизацию там, где она работает хорошо, и агентную адаптацию там, где действительно появляется неопределённость."
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
        "text": "F триста шестьдесят переносила дисциплину музейной съёмки в коммерческую студийную работу. Для каждого объекта нужно было определить подходящие ракурсы и свет. Я контролировал исходный материал ещё на этапе съёмки. Плохой исходник гораздо дешевле переснять сразу, чем обнаружить проблему после долгой фотограмметрической обработки. После съёмки я проводил фотограмметрическую обработку и проверял геометрию модели. Отдельно контролировались текстуры. В результате получался не просто набор фотографий или сырой скан. Я выстроил единый путь от физического объекта до готовой три дэ модели и её презентации или публикации. Публичные примеры этой работы сохранились в видео и в портфолио моделей. Для меня F триста шестьдесят был ещё одним примером того, как исследовательская технология становится реальным производственным процессом."
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
        "gestureDurationMs": 2000,
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
          "quote": "Часть слоя управления мы открыли"
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
          "quote": "Часть слоя управления мы открыли"
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
        "leadMs": 4500,
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
        "gestureDurationMs": 3200,
        "leadMs": 3500,
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
        "gestureDurationMs": 2600,
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
        "gestureDurationMs": 7500,
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
        "gestureDurationMs": 2600,
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
          "quote": "подготовленный сценарий в формате джейсон"
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
          "quote": "подготовленный сценарий в формате джейсон"
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
          "quote": "Публичные примеры этой работы сохранились"
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
          "quote": "Публичные примеры этой работы сохранились"
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
          "quote": "Для меня F триста шестьдесят был ещё одним примером"
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
          "quote": "Для меня F триста шестьдесят был ещё одним примером"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/qsXmS4mFvYc"
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
          "quote": "В этом демонстраторе я показываю следующий шаг"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/qsXmS4mFvYc"
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
          "quote": "В этом демонстраторе я показываю следующий шаг"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/DUzUnbO2VVs"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/DUzUnbO2VVs"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/qsXmS4mFvYc"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/qsXmS4mFvYc"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/DUzUnbO2VVs"
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
        "targetId": "media/adaptive-maximo-workbench/youtube/DUzUnbO2VVs"
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
        "sourceOutMs": 28000
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
        "sourceInMs": 28000,
        "sourceOutMs": 60940
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
          "offsetMs": 28000
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:positioning",
        "sourceInMs": 60940,
        "sourceOutMs": 63260
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
          "offsetMs": 60940
        }
      },
      "turnId": "positioning"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 0,
        "sourceOutMs": 8780
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
        "sourceInMs": 8780,
        "sourceOutMs": 55560
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
          "offsetMs": 8780
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 55560,
        "sourceOutMs": 67780
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
          "offsetMs": 55560
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-workspace",
        "sourceInMs": 67780,
        "sourceOutMs": 70630
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
          "offsetMs": 67780
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 0,
        "sourceOutMs": 11060
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
        "sourceInMs": 11060,
        "sourceOutMs": 48700
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
          "offsetMs": 11060
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 48700,
        "sourceOutMs": 55160
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
          "offsetMs": 48700
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 55160,
        "sourceOutMs": 63160
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
          "offsetMs": 55160
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 63160,
        "sourceOutMs": 67640
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
          "offsetMs": 63160
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui",
        "sourceInMs": 67640,
        "sourceOutMs": 69200
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
          "offsetMs": 67640
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 0,
        "sourceOutMs": 12580
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
        "sourceInMs": 12580,
        "sourceOutMs": 18460
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
          "offsetMs": 12580
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine",
        "sourceInMs": 18460,
        "sourceOutMs": 23620
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
          "offsetMs": 18460
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 0,
        "sourceOutMs": 11260
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
        "sourceInMs": 11260,
        "sourceOutMs": 23000
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
          "offsetMs": 11260
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 23000,
        "sourceOutMs": 39120
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
          "offsetMs": 23000
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 39120,
        "sourceOutMs": 43660
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
          "offsetMs": 39120
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 43660,
        "sourceOutMs": 52640
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
          "offsetMs": 43660
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal",
        "sourceInMs": 52640,
        "sourceOutMs": 56750
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
          "offsetMs": 52640
        }
      },
      "turnId": "agent-portal"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 0,
        "sourceOutMs": 13760
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
        "sourceInMs": 13760,
        "sourceOutMs": 17660
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
          "offsetMs": 13760
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-video-studio",
        "sourceInMs": 17660,
        "sourceOutMs": 24600
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
          "offsetMs": 17660
        }
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 0,
        "sourceOutMs": 25960
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
        "sourceInMs": 25960,
        "sourceOutMs": 40980
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
          "offsetMs": 25960
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 40980,
        "sourceOutMs": 44080
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
          "offsetMs": 40980
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 44080,
        "sourceOutMs": 58560
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
          "offsetMs": 44080
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:adaptive-maximo-workbench",
        "sourceInMs": 58560,
        "sourceOutMs": 79380
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
          "offsetMs": 58560
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 15520
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
        "sourceInMs": 15520,
        "sourceOutMs": 24670
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
          "offsetMs": 15520
        }
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 0,
        "sourceOutMs": 13860
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
        "sourceInMs": 13860,
        "sourceOutMs": 25480
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
          "offsetMs": 13860
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 25480,
        "sourceOutMs": 28240
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
          "offsetMs": 25480
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-mcp",
        "sourceInMs": 28240,
        "sourceOutMs": 35480
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
          "offsetMs": 28240
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 0,
        "sourceOutMs": 7540
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
        "sourceInMs": 7540,
        "sourceOutMs": 14200
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
          "offsetMs": 7540
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 14200,
        "sourceOutMs": 24240
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
          "offsetMs": 14200
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 24240,
        "sourceOutMs": 34520
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
          "offsetMs": 24240
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-messaging-platform",
        "sourceInMs": 34520,
        "sourceOutMs": 40100
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
          "offsetMs": 34520
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 0,
        "sourceOutMs": 7160
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
        "sourceInMs": 7160,
        "sourceOutMs": 14940
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
          "offsetMs": 7160
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 14940,
        "sourceOutMs": 22920
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
          "offsetMs": 14940
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-platform",
        "sourceInMs": 22920,
        "sourceOutMs": 36290
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
          "offsetMs": 22920
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 0,
        "sourceOutMs": 20800
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
        "sourceInMs": 20800,
        "sourceOutMs": 24940
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
          "offsetMs": 20800
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-studio",
        "sourceInMs": 24940,
        "sourceOutMs": 29130
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
          "offsetMs": 24940
        }
      },
      "turnId": "f360-studio"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 0,
        "sourceOutMs": 42048
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
        "sourceInMs": 42048,
        "sourceOutMs": 49880
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
          "offsetMs": 42048
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 49880,
        "sourceOutMs": 55120
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
          "offsetMs": 49880
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 55120,
        "sourceOutMs": 59740
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
          "offsetMs": 55120
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 59740,
        "sourceOutMs": 65220
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
          "offsetMs": 59740
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 65220,
        "sourceOutMs": 70760
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
          "offsetMs": 65220
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 70760,
        "sourceOutMs": 72460
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
          "offsetMs": 70760
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 72460,
        "sourceOutMs": 74040
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
          "offsetMs": 72460
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 74040,
        "sourceOutMs": 75420
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
          "offsetMs": 74040
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox",
        "sourceInMs": 75420,
        "sourceOutMs": 77520
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
          "offsetMs": 75420
        }
      },
      "turnId": "autobox"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 0,
        "sourceOutMs": 8360
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
        "sourceInMs": 8360,
        "sourceOutMs": 39880
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
          "offsetMs": 8360
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 39880,
        "sourceOutMs": 54460
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
          "offsetMs": 39880
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 54460,
        "sourceOutMs": 72780
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
          "offsetMs": 54460
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 72780,
        "sourceOutMs": 83740
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
          "offsetMs": 72780
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 83740,
        "sourceOutMs": 107780
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
          "offsetMs": 83740
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 107780,
        "sourceOutMs": 138320
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
          "offsetMs": 107780
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan",
        "sourceInMs": 138320,
        "sourceOutMs": 140410
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
          "offsetMs": 138320
        }
      },
      "turnId": "complexscan"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 0,
        "sourceOutMs": 9200
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
        "sourceInMs": 9200,
        "sourceOutMs": 43340
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
          "offsetMs": 9200
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 43340,
        "sourceOutMs": 80400
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
          "offsetMs": 43340
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 80400,
        "sourceOutMs": 98660
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
          "offsetMs": 80400
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 98660,
        "sourceOutMs": 107220
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
          "offsetMs": 98660
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 107220,
        "sourceOutMs": 120160
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
          "offsetMs": 107220
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 120160,
        "sourceOutMs": 153120
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
          "offsetMs": 120160
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 153120,
        "sourceOutMs": 161640
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
          "offsetMs": 153120
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 161640,
        "sourceOutMs": 168435
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
          "offsetMs": 161640
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 168435,
        "sourceOutMs": 176820
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
          "offsetMs": 168435
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 176820,
        "sourceOutMs": 182600
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
          "offsetMs": 176820
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza",
        "sourceInMs": 182600,
        "sourceOutMs": 191840
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
          "offsetMs": 182600
        }
      },
      "turnId": "photopizza"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 0,
        "sourceOutMs": 3560
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
        "sourceInMs": 3560,
        "sourceOutMs": 21240
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
          "offsetMs": 3560
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 21240,
        "sourceOutMs": 58900
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
          "offsetMs": 21240
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 58900,
        "sourceOutMs": 74000
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
          "offsetMs": 58900
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 74000,
        "sourceOutMs": 80320
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
          "offsetMs": 74000
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:finale",
        "sourceInMs": 80320,
        "sourceOutMs": 81780
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
          "offsetMs": 80320
        }
      },
      "turnId": "finale"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 0,
        "sourceOutMs": 14060
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
        "sourceInMs": 14060,
        "sourceOutMs": 31800
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
          "offsetMs": 14060
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 31800,
        "sourceOutMs": 57400
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
          "offsetMs": 31800
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:workspace-details",
        "sourceInMs": 57400,
        "sourceOutMs": 83540
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
          "offsetMs": 57400
        }
      },
      "turnId": "workspace-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 0,
        "sourceOutMs": 14500
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
        "sourceInMs": 14500,
        "sourceOutMs": 19940
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
          "offsetMs": 14500
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 19940,
        "sourceOutMs": 41260
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
          "offsetMs": 19940
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-ui-details",
        "sourceInMs": 41260,
        "sourceOutMs": 78110
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
          "offsetMs": 41260
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 0,
        "sourceOutMs": 17380
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
        "sourceInMs": 17380,
        "sourceOutMs": 22320
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
          "offsetMs": 17380
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:symbiote-engine-details",
        "sourceInMs": 22320,
        "sourceOutMs": 51150
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
          "offsetMs": 22320
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 0,
        "sourceOutMs": 4460
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
        "sourceInMs": 4460,
        "sourceOutMs": 10260
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
          "offsetMs": 4460
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 10260,
        "sourceOutMs": 24460
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
          "offsetMs": 10260
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 24460,
        "sourceOutMs": 51420
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
          "offsetMs": 24460
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-portal-details",
        "sourceInMs": 51420,
        "sourceOutMs": 69720
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
          "offsetMs": 51420
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 0,
        "sourceOutMs": 16420
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
        "sourceInMs": 16420,
        "sourceOutMs": 24920
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
          "offsetMs": 16420
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:video-studio-details",
        "sourceInMs": 24920,
        "sourceOutMs": 53220
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
          "offsetMs": 24920
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 0,
        "sourceOutMs": 5680
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
        "sourceInMs": 5680,
        "sourceOutMs": 27760
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
          "offsetMs": 5680
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 27760,
        "sourceOutMs": 48260
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
          "offsetMs": 27760
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 48260,
        "sourceOutMs": 57440
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
          "offsetMs": 48260
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:maximo-workbench-details",
        "sourceInMs": 57440,
        "sourceOutMs": 84120
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
          "offsetMs": 57440
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 0,
        "sourceOutMs": 22580
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
        "sourceInMs": 22580,
        "sourceOutMs": 25600
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
          "offsetMs": 22580
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 25600,
        "sourceOutMs": 44540
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
          "offsetMs": 25600
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:agent-pool-details",
        "sourceInMs": 44540,
        "sourceOutMs": 56310
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
          "offsetMs": 44540
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 0,
        "sourceOutMs": 7260
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
        "sourceInMs": 7260,
        "sourceOutMs": 32140
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
          "offsetMs": 7260
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 32140,
        "sourceOutMs": 50220
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
          "offsetMs": 32140
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:project-graph-details",
        "sourceInMs": 50220,
        "sourceOutMs": 66260
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
          "offsetMs": 50220
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 0,
        "sourceOutMs": 10480
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
        "sourceInMs": 10480,
        "sourceOutMs": 21600
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
          "offsetMs": 10480
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 21600,
        "sourceOutMs": 42640
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
          "offsetMs": 21600
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 42640,
        "sourceOutMs": 61620
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
          "offsetMs": 42640
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:lifecycle-platform-details",
        "sourceInMs": 61620,
        "sourceOutMs": 70400
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
          "offsetMs": 61620
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 0,
        "sourceOutMs": 6510
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
        "sourceInMs": 6510,
        "sourceOutMs": 15630
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
          "offsetMs": 6510
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 15630,
        "sourceOutMs": 31770
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
          "offsetMs": 15630
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 31770,
        "sourceOutMs": 47930
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
          "offsetMs": 31770
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 47930,
        "sourceOutMs": 53190
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
          "offsetMs": 47930
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:mobile-smm-details",
        "sourceInMs": 53190,
        "sourceOutMs": 74620
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
          "offsetMs": 53190
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 0,
        "sourceOutMs": 41040
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
        "sourceInMs": 41040,
        "sourceOutMs": 45380
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
          "offsetMs": 41040
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:f360-details",
        "sourceInMs": 45380,
        "sourceOutMs": 54430
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
          "offsetMs": 45380
        }
      },
      "turnId": "f360-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 0,
        "sourceOutMs": 17940
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
        "sourceInMs": 17940,
        "sourceOutMs": 93440
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
          "offsetMs": 17940
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 93440,
        "sourceOutMs": 121740
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
          "offsetMs": 93440
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:autobox-details",
        "sourceInMs": 121740,
        "sourceOutMs": 142940
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
          "offsetMs": 121740
        }
      },
      "turnId": "autobox-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 0,
        "sourceOutMs": 16920
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
        "sourceInMs": 16920,
        "sourceOutMs": 37700
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
          "offsetMs": 16920
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 37700,
        "sourceOutMs": 83880
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
          "offsetMs": 37700
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:complexscan-details",
        "sourceInMs": 83880,
        "sourceOutMs": 180510
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
          "offsetMs": 83880
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 0,
        "sourceOutMs": 178400
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
        "sourceInMs": 178400,
        "sourceOutMs": 193880
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
          "offsetMs": 178400
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 193880,
        "sourceOutMs": 204340
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
          "offsetMs": 193880
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "audio": {
        "assetId": "cv-show:audio:photopizza-details",
        "sourceInMs": 204340,
        "sourceOutMs": 223320
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
          "offsetMs": 204340
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
  "revision": 105,
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
              "frameHoldMs": 1000,
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
              "durationMilliseconds": 79380,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-kL4q/ymnVAvqBhvWLNVyH9gkwajgU5lBJscgi3jgrNc=",
              "sourceAlignmentFileHash": "sha256:e8e5416623368db09c705fb08265f7e587feb08a922dc72f324cdda702d2566e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-pVZnELyJQ3BqvEep/9khhRZd9Q6cGEZz/eKAQVuP6Tk=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-cfZSbf3WryvSVq/yOwhQplpyekRoX1pOw6gb7DkFEyI=",
              "wavHash": "sha256:f14756b6aa3fe876dfaa79256cedd96903c479d13159b553291b36008848c0de"
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
              "durationMilliseconds": 56310,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-FBqOPELIKkvacmGS0niiFid4pm7+6KdPLV938t0vL28=",
              "sourceAlignmentFileHash": "sha256:12e59a3f0879eae647a687b86eb514e096af4cc708ec78c89573db84d945ff92",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-0Z1tk1HGgpGaYVlvrYY1f4Y1PPR0I9TZ7/I3z6NPJR0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-gllo9pgSdBR3jl6I9oaPvzckMeReD01KgTIfxc5KGtw=",
              "wavHash": "sha256:852d8456daeb5fa12547eb8f5f6b7489f939750cdde3214fb41b3924d05d4a5b"
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
              "durationMilliseconds": 24670,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-xWBs+npGeRGpZYQtilPQHBQR9SHtceOBC7bJRnCyv54=",
              "sourceAlignmentFileHash": "sha256:331962b2f944432659863952c7dbd2fd9f706867030b43bf1e17d7b8b6ea518b",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-oR2K1haOhywFgP/JEyTYSDOXLgKxuxe+Bv890Z22EJE=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-Kp1+4ZZNmx+Tt2DissxIWk4sjAJ8tbHVrfWRlKvKuLU=",
              "wavHash": "sha256:5ff5633bb1acd316ca0b3e0dc5b888a8bcff2c232f443bd38635d6cd275a4d2b"
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
              "durationMilliseconds": 56750,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-kGiq5IHHkjZfpMh5d6oYAg7j8jEjplgfEt4mYR0RyIU=",
              "sourceAlignmentFileHash": "sha256:4d82c0b0ab2ca9c725da817ac24305a0f6fad0ecbfb09a2aad961dab28c31ad2",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-6xzuLz52dXPYhXt19fzuW1tXZEgxDuhA994tO23SH7Q=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-HiY3FFhnVFArQPt5Xl+A/5Muu46Iwj04K9iFfM47CDs=",
              "wavHash": "sha256:1d46070962af8c21773dec3b1c0ce34fab8245bac04f204884a52a146fd1cae3"
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
              "durationMilliseconds": 69720,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-0mUmVB/IWZ5lx0CkvEDuKtAlRqxs1zZUpCevUriNelE=",
              "sourceAlignmentFileHash": "sha256:ea486dd05a49ad65be8f51f96f86518494f8d1eb10711c88c75382f699cf7ac3",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-VtZlwIDdHq5cLZg4XnPWemCwqmoPIkVyu8U8v28raNw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-vxDEMlHGxAI6MBnCr3/fOKhcpbr6+JL+ISrQoXEpfjA=",
              "wavHash": "sha256:da9237b5e5fd2dbb15989f1fcf8839688934c612e3644ce97e5f8f4bd7f53070"
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
              "durationMilliseconds": 77520,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-oG/GdUvrb/v+E0JlY/nvj6WNM1r61eHmFTJ8PPu/aRY=",
              "sourceAlignmentFileHash": "sha256:d94bc17e9f64cde669e13b0e2262b37759d10a3c649296c9c1dd7faebdca3bf0",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-gK8aGyDHQ3AXR9LRVyCrqEWKsXt3rHmQRmGbbsx8C9U=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-6R2QwSGot4RZgs4etSKe6V8TV6vywxRxGYAXdr5PWT4=",
              "wavHash": "sha256:cfe418f54d17744dd776edfaeab80fbb9b1d40a5097d5f067479fc97d6f95fba"
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
              "durationMilliseconds": 142940,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-7y32O17uT1UQ6EKKN4LYiCz/QN11Xp3euH7J14z3sRw=",
              "sourceAlignmentFileHash": "sha256:328d788e93a25511ea4566f955e4d68f66801534118fef40e5dade4de6f13521",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-Mn0vgjAtfh7R+MnnOsdODw+tR58Rf1HJWyFCzUCZlsE=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-UzO5RZpHxocBExV7TmNRii7ZfTfyAs7y2+dvbU8rKLo=",
              "wavHash": "sha256:f5e559d1ae494ee8f34ef466ea951b65d8c383653d8bea6a0831db53a6a005dc"
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
              "durationMilliseconds": 140410,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-VhjpBEw4wMCm9z1I7OYwLiWgZKN7gaUwoADGbsCzF8Q=",
              "sourceAlignmentFileHash": "sha256:9f290c87cfb4b100cbe7e6af5709661ed54d13aa8f0b30e81fce4310e3adae4c",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-pHsue9S3U63B+dnqVEFGMsbtTIB9OjQjuRa/QE/hAf0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-bKjFnVAmFk7B4vBqUFvqrn4g4rK2sNKRhDJ3hbu/Fkc=",
              "wavHash": "sha256:46fd6450a619ace40df5d7ef6dae0f99af4528744f9a4a15b49e61bb64d18b5a"
            },
            "period": "2017–2022",
            "projectId": "projects/complexscan",
            "return": null,
            "subtitle": "Теперь вернусь к ComplexScan — коммерческой линии оборудования, чьи разработки стали частью технической базы AUTOBOX. Я развивал ComplexScan в 2017–2022 годах. В линию входили прозрачные платформы для бестеневой съёмки предметов в формате фото 360 и для 3D-сканирования. Здесь я демонстрирую одну из таких платформ и веб-приложение, из которого управляю ею. Здесь я показываю обновлённые версии поворотной платформы ComplexScan и веб-приложения для управления ею. Я проектировал оборудование и метод съёмки как единый продукт и довёл линию до первых международных поставок. Отдельным прикладным проектом стал BoothBot. Это система автоматизации каталожной съёмки винных бутылок непосредственно на складе заказчика. Система объединяла компактную съёмочную будку, управляемые световые панели, моторизированную камеру, пресеты съёмки и автоматическую обработку фотографий. Световая сцена была заранее настроена для бестеневой съёмки и контролируемых бликов, поэтому фотографии практически не требовали ручной коррекции. Система автоматически отделяла бутылку от фона, оптимизировала изображение и выдавала готовый материал для каталога. Благодаря этому сотрудники без студийного опыта могли получать повторяемый результат прямо на складе. Следующим этапом должна была стать прямая публикация готовых фотографий на сайте, но развитие проекта было приостановлено.",
            "title": "ComplexScan"
          },
          "complexscan-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: ComplexScan."
            },
            "media": {
              "durationMilliseconds": 180510,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-qzFWYwAqdRr4ofVfo3rjgJTbGU2ypWu737HTDKpJf0k=",
              "sourceAlignmentFileHash": "sha256:911739adfa22b8a50d78cc4e6d5d403eb40edc1c604ac190c01cccaaf8f9adaa",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-LjlM/jRCgJ8TXLQMWhsYsuUXmXwcdUsupUs304O/DvU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-IA9tHOlbJgVvIxJP9N05Z7yx6/Y8OQJHmtWEUpwh1uI=",
              "wavHash": "sha256:00fd6008f79d05c30bc2e3142d39a02c5402959d95fb39b6732c334d7bd85e39"
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
              "durationMilliseconds": 54430,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-dZ5O3yLqqKxHAWm07frmuwLcOUYIWDKSVqpYnzPAV5U=",
              "sourceAlignmentFileHash": "sha256:6fcb9fa07ebef84a2c33e2b6449035f6ff6308a0ee5d2fc81b292bea2d3b0ffe",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-D2lgOl8LwbKPxraY2zulllBMb5seuOruCPSjB/svGHo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-H4HzeJocLU65y2yUlwTdEIAciUO+t5BHdnkRduB2Z7s=",
              "wavHash": "sha256:b745e3e12f528ebca398fab0ac029e6d88139ff0604251d7c2b14526f1f243da"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.f360",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "F360 переносила дисциплину музейной съёмки в коммерческий студийный процесс. Для каждого объекта я планировал ракурсы и свет, контролировал исходные фотографии, проводил фотограмметрическую обработку и проверял геометрию с текстурами. Я собрал единый производственный путь от установки до финальной 3D-модели и её публикации. Публичные примеры сохранились на YouTube и в портфолио Sketchfab.",
            "title": null
          },
          "f360-studio": {
            "branchId": "f360-details",
            "chat": {
              "actionLabel": "Подробнее о F360 Studio",
              "text": "Перехожу к исторической программно-аппаратной ветке и F360 Studio."
            },
            "media": {
              "durationMilliseconds": 29130,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-cMzwzkozNxEna2laiZXYGFPX1F/+fz46sD/COuyIcvc=",
              "sourceAlignmentFileHash": "sha256:008413af3dc927cff8186ea05d899ec399f95c3b01fc926ee1e18d151aa6110f",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-JMlrh2J0HobzGA9c0Ed3zvI9qvCOkEagOVE3OMzg3RQ=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-FATZbSMYqq2UanDL9uYO6Wlj3cMyq1FUsggGFkawOes=",
              "wavHash": "sha256:0ffc1334575d5711cf9faebddf0b589568b01fa6811b147c45976424f34ef43c"
            },
            "period": "2021–2022",
            "projectId": "projects/f360-studio",
            "return": null,
            "subtitle": "Теперь вернусь по истории программно-аппаратных проектов. В 2021–2022 годах я основал и вёл F360 Studio. Это проект высокоточного 3D-сканирования. Я выстраивал процесс от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели.",
            "title": "F360 Studio"
          },
          "finale": {
            "branchId": null,
            "chat": {
              "text": "Возвращаю рассказ в настоящее и оставляю итоговые действия."
            },
            "media": {
              "durationMilliseconds": 81780,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-QyTo71rfDmYp2pxEgHpy0erDfunAwxyi6Jqq/BqQoT0=",
              "sourceAlignmentFileHash": "sha256:48ce08a5be6c15f5a7baba3c769985ffd4ee5c710afa35fee4f07409e670694d",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-rgqMBmb+TXYATB3XqJgLXsxj51tzdyo9IBBxGts1K+c=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-VazVaJR8NAnB8p6cGTHgu35IcvytsPCG9tiVCrKn+i4=",
              "wavHash": "sha256:feee4452bb0256603a4714b7e178425a82282cbe73f7b79bd963feb98fa82807"
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
              "durationMilliseconds": 40100,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-JFKHWXtQbdIkp1o25RgiL2Zb5jLarlBx2lBiW28Y3+I=",
              "sourceAlignmentFileHash": "sha256:025ad715cdad9d6b2857ae11cdab725fc610ddf8f1984c7bd195d0aa2d5f8f9c",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-NdA/SMrLfqpY/D3BamBRdt4WFT7Oec/7fPEFXNiRM8s=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-oJNaubNs4ntZ7fTRyOGbU3lQIcYUafM4EQdJxAI+tIg=",
              "wavHash": "sha256:d3c5cf10545bbb445d872f5c0203b2c1cd6f5be34bb19836af190791dedf27a7"
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
              "durationMilliseconds": 70400,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-16xfGDGO3sZUHO4zX077eCeH/FZe9G95ClN4fePXsQ0=",
              "sourceAlignmentFileHash": "sha256:d7dd832db3c2a9a5170cfe73fdac9d08198dd706c1fdb3a166b62fbad07d749e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-TiCPiMT4BVdeAXfH41ii3E5HcfUwa/zBj6mMbE9Zxp0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ZyPN7t6vX721eg/Df0hth/UKRI2DbhiubOOdUqImd/M=",
              "wavHash": "sha256:e283b0b28fd72090cabf2a22451df83169b8c91e04651053614fea85f17327ca"
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
              "durationMilliseconds": 84120,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-TA2IwUpuihEMgWftC776+YCPrGHSq9PD8HTAnz38L4o=",
              "sourceAlignmentFileHash": "sha256:770740cd144b2be09875916b99549996b17e1b326c7ce171f0f663fd7f9999fd",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-W7IZrMG7nDu8gfM3Qzodgmrlenei8ZZZUq/9uj7/S7E=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-pUCW+dgdjpId/8mYJfNk6xPDwg8fmOv/RfJd/NJN2u8=",
              "wavHash": "sha256:d11e9ae8504ee9fe560f7a317b21db8d989cbad9eba4751232917564e494008d"
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
              "durationMilliseconds": 74620,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-9btVM75OtupC1LOw2r+cqVzcS/Uv+wCRzPBIuaRlneQ=",
              "sourceAlignmentFileHash": "sha256:dff35e79af793977c8c7c75ca747e6e196dbbc515312a1bfb467352d858eca64",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-3+QSY8V/49CMs8GiWWw+3S7Zu78QmzuPVSsO6nSbDbY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-DznaAZ70EcxG72YNAG64istUUe5XFavtVufQUB60yK0=",
              "wavHash": "sha256:bec2db0944a815ea22c74c01430c92b9d68acd14d8a0eb4178006efc2af068bd"
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
              "durationMilliseconds": 36290,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-K6u8/R6on/C+HYuI79BfIwsY6+JU1NZhgVccSCeYDZk=",
              "sourceAlignmentFileHash": "sha256:4cbd0dadf49a094ec18438b23e8becf17a19300047ec4b2a4cd1fc1c682f708f",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-2oLUCmKC/oDxygzkZ/ZgO7f1KlvGXOo3pqf4WyMQWjg=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-hjxwprd6CEo0EFg1YSwZMhIGqXR62MKu4GV0rSUABqs=",
              "wavHash": "sha256:636bf67474e1217d4e9119da73212d616cfd18d3fea063598e9898e23297805c"
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
              "durationMilliseconds": 191840,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-rvClv8jylTQqUgsWeZCgov45NSqUk2EcpV6IKfLhRFc=",
              "sourceAlignmentFileHash": "sha256:c32f3da5a048857746dfa411e1ec582d4bc78b0774298fd8f3eeb9c9cf3e97b0",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-dOvGskhqL6xmaMvZ/7Ppm10AIqEpQuy0w4yCpitOpUU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-TbHaOaReTQ/H7XiogAsbpePmcTKAnJDilU7q/cGArBE=",
              "wavHash": "sha256:b6c8e993ee3fc505f0fd3266e083d431396a0c85de11772fe9c8b608d3c53be4"
            },
            "period": "2010–2022",
            "projectId": "projects/photopizza",
            "return": null,
            "subtitle": "В начале этой линии была PhotoPizza, которую я развивал с 2010 года. Проект появился внутри MEGAVISOR как инструмент для повторяемой съёмки объектов на 360 градусов. Здесь показан ускоренный демонстрационный ролик о сборке первой версии PhotoPizza — без подробной инструкции. Это промо MEGAVISOR, где показан весь спектр поддерживаемого контента, включая съёмку объектов на 360 градусов. Я продумал механику, электронику, прошивку, документацию и упаковку. Таймлапс сборки прототипа PhotoPizza из конструкционного алюминиевого профиля и шагового двигателя. Позже PhotoPizza стала open-source проектом. Здесь я показываю, как собрать простую поворотную платформу из подноса IKEA и вручную снять объект со всех сторон. Такие демонстрационные ролики я продюсировал для MEGAVISOR, чтобы популяризировать формат и снизить порог входа в технологию. Здесь я показываю новое веб-приложение PhotoPizza: с телефона запускаю съёмку и по Wi‑Fi управляю поворотным столом и камерой через веб-приложение. Универсальный блок управления работал с поворотными платформами, слайдером камеры и моторизированной панорамной головкой. На грузовой поворотной платформе PhotoPizza мы снимали даже тяжёлые объекты, включая мотоциклы, на 360 градусов. Проект продолжал развиваться до две тысячи двадцать второго года.",
            "title": "PhotoPizza"
          },
          "photopizza-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: PhotoPizza."
            },
            "media": {
              "durationMilliseconds": 223320,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-v5KdiVNYtLWWkxJg2A4AsWKgWLKa5lANHLcYnZHxQFk=",
              "sourceAlignmentFileHash": "sha256:639062c357ad67ad9633f9f7acd4bbe8afdea5e4e88f521fb50b9045125ecba2",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-hcb+uBJiikvTN8SBfbnNoQV5UxKfZKwSunJklulCAOY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-3th1LNsrlPtVpwyF6mhMr5JtJekSWxlon2FeMYlTmlQ=",
              "wavHash": "sha256:94144b39c737d4a6a0147af29e68bacaede846eaf9a25be5e7b4ccbae54a8e6e"
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
              "durationMilliseconds": 63260,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-obKXQ+SOc+9bn6vfgbwaGMxYuz/Ky8wu9iq7gJE37V0=",
              "sourceAlignmentFileHash": "sha256:db1d60e022153a03995caee9356981645a158732c8c0dce65b017e6c05e99d17",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-0Pk8hf9d9athRppl6gXqPMt10VhKRiSwrT6VhDsWc5o=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-LuwV2dwxWaZOKfuC08u5Yc3AEP6/+UFqRVOX1LxPvrM=",
              "wavHash": "sha256:d9eb096a5d1236614919a325eede8bafa7c50258c85eada7e0422c72a0bac644"
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
              "durationMilliseconds": 66260,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-/+UmUA9EUvFClsfsevDo6DEgXExEvZrzWblyiGq9Z+o=",
              "sourceAlignmentFileHash": "sha256:5f9b17a20ad5ea5e5b9ec4b28320e0219fa687460a9dfeb60cc7a3fe08d795e3",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-puK3AF+IjrnlA7rPh36RwJvViZDvCpYKqwk63x4djiI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/vfAAZylYEfWcLCIjx5D1CC2ud0YAHxSQjf1/3kuN80=",
              "wavHash": "sha256:3f4e07efe4d80a4b899525af50df2dab2dd18fa9aa8a5c6b0ab8339d28217485"
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
              "durationMilliseconds": 35480,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-fnbSjpdQS/O5qdzl4NrztDrTeCbz6ZDNJDpVFdJnKVY=",
              "sourceAlignmentFileHash": "sha256:438635095a2bb5a8ed28062cd6a7d03164ac99c0e52ba889ef9aa098d8cd205e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-XmDF03uXyp9bGQ2AvkntJicuuW7hR6K36C48UMQL7JY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-tEQAMxF6qU/U5dKU8BdC/JGpLu3uh6sl1f30iZWnBXI=",
              "wavHash": "sha256:5ab7ec8a45c27a6db57f77d6471937556cd0d202b3af5b18c84903a766354392"
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
              "durationMilliseconds": 23620,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-WRUJUshL2UdftrDNYKubxusBw10zkkDV1xqv/DJsA68=",
              "sourceAlignmentFileHash": "sha256:fb86d9ab5d9dd14f8931d72988ba7044d7244799d0fc42547ee26d2ce885f333",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-1py7nz2MsrqFi/dbqdPI9TeYq+ekRlmfxJjDbzu3t9o=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-5CUBaqksm8bZmikJU+ptbaVuiM1Cyn/PDQkim9GtcKg=",
              "wavHash": "sha256:095ce6829172cb9aebef61a144b717d710f603c4c16d281f588a2b9f2623655a"
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
              "durationMilliseconds": 51150,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-wJtVlTyv5Mc3CoV2RTQI6+/cRswaPNumaJuCynBJXUU=",
              "sourceAlignmentFileHash": "sha256:d84fba8ab5742b6e4f4d0c201ea38acc87c791a8da22ea9de53dc047afc6c947",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-PkcEJW0tC+ocIktlZfijsiRI9aqhhWMS9IaapKG30vI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-5NCrTqYkaEgxDb5l347k/2oE0caflGOgnmgZvmBI9oA=",
              "wavHash": "sha256:3166b6652b5029f685cd62dd956bba740778bc57398e57b77ebf50b3b5dc6124"
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
              "durationMilliseconds": 69200,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-2r1VInw9iTyodEVr7vwARrJ7BjS0eQ45Gkb2k/2M5Kc=",
              "sourceAlignmentFileHash": "sha256:1f624dab8a80ae801638e589c1df6e524f93d54887cfba1dd60440bcc7755c7e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-7PQWknviaq80xUJsGAYp0Bid92Ml4rqLPogxekvOQ6M=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-mvuhZQp82s99i5OdxAuUcW7WLGihKEcq+dPgtvrn2Vc=",
              "wavHash": "sha256:047b5066a73789ee509524e71f78b4615dfde8c1c16251551b67bb222920f1e7"
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
              "durationMilliseconds": 78110,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-6S2Xa4UBgfSoC/H7Wh3U59yMTfTPgUUxgXDlhjLZ6OE=",
              "sourceAlignmentFileHash": "sha256:1a4442e0a2b8db1c3e308bed86d4786c4e6d18afa791c583f8ac37cd51aea030",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-l+7X9zGR41BHm1pvVHiSqY50G2iRpPgqZT9+bGJysi0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-+81Y+xS13NCLo8/+P/CsW8v4gp+HBTiC/AhHl5M9QAc=",
              "wavHash": "sha256:3e6d9df6dd87c1f91f30459d98e6d49ed4601483fdb7f1f490d3e8e3076fa59e"
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
              "durationMilliseconds": 24600,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-n7AkAWn4gHZ9zhGpAoY1yU2rehbJjE8O0Z93k+2MWbc=",
              "sourceAlignmentFileHash": "sha256:a36c0e3e246bb916442470abfdc930393eb3ed85007eb8c46bd06fdec5f1077d",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-E6MbW6VLEjFGUDMl1QA/MZXCl5kGI/aX+MQ8Xwzz/Bo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-X+4EJg/eofJ9/Es/tZloAa3cju/0x3ASANeTufVBOh8=",
              "wavHash": "sha256:c3c8f96cf93b7bd81e3ed6eac8b53a1d60fc8853cbe13af568c6e575a1a3ea75"
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
              "durationMilliseconds": 70630,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-NL8IL1ph+MzrVb6IX66LFGLrQoh3MD/yCvRWuHoUQWM=",
              "sourceAlignmentFileHash": "sha256:9f4d1b17c911da6b16283c72bc63afed55ef1db19dbba792ed564c619c83ca9c",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-umrWkev806IG5kTy14wKpY5ayH7UHmeKRE9YMlWaoic=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-YXuQolDOaE8WRAb4Kc/9vzp/62QDTtHwY+nSQ7ZknR8=",
              "wavHash": "sha256:ae1641905f87b5040701dcbdf2efbd40adf5e9e8b77b78c415fbacc947759864"
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
              "durationMilliseconds": 53220,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-BA28kt1FQLCGN1+kjbXcHFNYoQE4p+fLCYnZYC8oM4c=",
              "sourceAlignmentFileHash": "sha256:7c7827cac93e4a71b42fc9fc743d4d0453c6dba640851f30f98f5317e7496d4d",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-IkH90q2udRPT6539kMQNtj7UjElC2DHQteydKMsNSXU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-slvlIBgsy+jjEoLU5VInbA/18CT+duZZXCpZUvhKtdw=",
              "wavHash": "sha256:db2dcaf9b27c024025dba390c70728284b6e93375c069303e647f5638cde1c79"
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
              "durationMilliseconds": 83540,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-DMO+OUrAHQljNkbA1vk6/ojQDqzRUK+fwyWuJBN3YqY=",
              "sourceAlignmentFileHash": "sha256:cd7560145af77768a4c39e46a221528408ed96058514880e7d81591e5ad7d6d6",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v2:cell:sha256-+GrkCC0zBdwpBAw4w6qDO/bdNIYOSz7Zx4KHrUUIl78=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-jrNqp7RU3AF3xVEEqw/9JzNk0lRoJ9GkaXXNBg1XCD8=",
              "wavHash": "sha256:e92db0dd5317a001e64da2d5ca06b28ffc9d8998d4e750c2c799bca3f86213ac"
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
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WqPoIYWG+cGu1rccIYRUR/xoDVPRH+5wau/SDrzOuwQ=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-LbWAitNz77QEwRGNo8QCR0FBI9KJw9bWz6jDOxDUsDw=",
    "entries": [
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-Z3RBM9ZJWfG1mkC3hhNZZyo8WBBsgtmkrEZbNIQjyZs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ctRBiieen1Vn2yNcnh07aNw4dgnsuzuXxMVGLkxXGlQ=",
        "entryId": "positioning",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-OcZorlimN8tjnNvrAvd1hKHbK6nisZYW/0n84a/WcuI=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-0KJ8QavG0byvlpzW983XXdS8BRTuJR5KcbzbMwh2FDE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-r9OKtIAABu7lpI0bjSeR1vk8hqwxk3WGaHk3dPf9r/w=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CSFYFEf1RRqJsQ6FnPDjgGrjYmxq12xslUw4JSK9oOE=",
        "entryId": "symbiote-workspace",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-LNZCXHOR0HMT7N4HBar295r7akWtkldh9A2rBtAg95o=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-TKG2nzqsScOKlp7PXJ4R5C5zcUyvfQG2EKzXTd9BGTo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZmNKnbBmixNRjiEe41jE2S4UAyj17jiZYUA2aJLUdZI=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-KL7gAQCEHCX6dZOWkmDjGvAwQ1Kp1u0CyF3D3TWqIyg=",
        "entryId": "symbiote-ui",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-UM3u9BjwDxi006G9/34AjUqMwo7M9vz/viuU1T+Ip/Y=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-DmJ1PnXko6AY1TM0UQwYy6t4nqW5L6EOaYmxeoHWArQ="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-UVWTzVKYkA/LSou8+P7AMlUpiDS2ILkdalRA1NcsrSs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-zPCnOmVWtP/N/5+Nv4RZYcM8oRcXs78N1ZaC/VGd+g8=",
        "entryId": "symbiote-engine",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-qo4U4OruoRqEbAlO37jVG3D/h5Bv+NxaMXLy2HgrZZo=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-ayF5G/HYSmfK2N3TuTQLR9lNUKc2k2Jyn/N+HGvxGuE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-6m/OHVdKGNag494XUIeUWyZ8ztC9KjRWUkvvt6dTvyE=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-p2ZZKDkXJF+634zkIevLx0ytbU1ndDaCZzyz0hqMma8=",
        "entryId": "agent-portal",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-HQlJ3wLzMrYGfpFzP8SBK52sQrb5Vj50WH9+whXMMq4=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-U5xYPd6+RKhH3kn0pN0sJzHMJTi32vKUQ0WTnAvZ6GU=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Ec51w0d021JETTpqHSSkay/WqAeac2D9jJP2i8jodJs="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-a/r8z/RkRINLLL/yzgEsDFNRFxQDqbJh2cazfltAFDs=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-a5hz8CB1wd9BvSe2pJBYSs6FZBQJI7N47WVQ1bvkr44=",
        "entryId": "symbiote-video-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-zS4S5h/4Ng0f1kciMFUQfa8vXldqfnvDyQzZE35SdDA=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-JC/dtWwy5bGGInorBUZ8A63ndsU3AZYRo0Y0SXIWfwg="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-H0+MlZFyt+4d89JzJJ0+241hldLgt/8ybMaHzfHTjbM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-dz3x4A46f0XwbXw67NnVa9w15mvYpvniceVnK4P7/cU=",
        "entryId": "adaptive-maximo-workbench",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-IkAYzb73jJsRYwt0cd/SiEbqYz/9BbxO9V8cLKikeA0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-7yUdHVBVXifkCLq2r/3qWsCvNQuphlTVQM1SVntZ/1g=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-lPbMPmrAQcFz/S2ax7udH2bWpD0aK1WDZoSdN37MAlI="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-pwD5Km+AGO3sJVeyUbXcVTEBhTezMBAYz8xuxaxa/wg=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Og03ra0A8hmHTQ61GpHq8FKi+TEGMZo4PdiR7iOAplk=",
        "entryId": "agent-pool-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-c8VnwOKVj5TVk8V/XTEPpwhIUdJkIFxuxVdb2Rl/zC0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-C6G5YP4/VzBXQXs+xboagYm8ao3+0nuV3sm1poTWr74=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-mcp",
          "cv-show:cue:agent-pool.open",
          "cv-show:cue:agent-pool.flow:scroll",
          "cv-show:cue:agent-pool.flow",
          "cv-show:audio-clip:agent-pool-mcp:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-AoTIBM8mXBGXZDJmqp7ieUVsXl54JhoVCAEWIOj1Ikk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-zYEtt4pCmFmtxm7QWDWTEUV+xW+vef/PSbLeH/gGFg0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-3LA774V4jymZ1hLXZ8aljaI2pnYljZo+Gd3GgW3gZuc=",
        "entryId": "project-graph-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Vg2GAEq+Z5Mgag6lh/KNshncCiLLT39H9I6fy6rMTuc=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-dBz8MZ3vphUctIVP0wiTnETURnSe3GIqHcAYipAXzXE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-kNg91O6Vlg8g7pFHv5spbaUABMLIOzuVN45S/Kc4aVk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-0XJnRxCOFbWsu4Fslyrv7hzH4sAbhG0UBqFp3+YFvGo=",
        "entryId": "lifecycle-messaging-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-sGjHmk1MUuSBsKJS9TTRlm4cC0O1oLpZvpUYKVzGRuI=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-rd5XWahbXiMfsBFby0WhdeIdDSlev4fN7pto/tAG5jc=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-4JfVyYJ09h2m3JHlptnILUMemtNCz0QWEDCYmgsRXmo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-CLqSpctt2GZ4JXv4w2UuSPTpQTn2hU3nUwXlP5lQjRg=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-8i/HpJrVig+XzP0sIcKRiMx3ahNurfjL8JMYH1riVJs=",
        "entryId": "mobile-smm-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-zW7xEJRj/EsNIxA+LAnRJwE/qQ8f5URdICkDImgZ+BI=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Vvmgz+hNTyoF1WYXS4CV0JOYt8UAGiWUNUk7HJbz3z8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-LrDv1gR268ZmyakdY+0AsgEn4PV3h0gGMfGllfa8gH0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-VHll1CyMzQDJAyl/ZhAw6PP5nl19W2eo22usil4i7w8=",
        "entryId": "f360-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-oCmAXS5P1EJ7OqPktBfRzjeT0j2a9DOhp7PAYZ2UOeY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-U8EiRM/sIoPO05j/lKdnVrop5MrQKLh5VcqW/kyYaW8=",
        "sourceCellIds": [
          "cv-show:narration:f360-studio",
          "cv-show:cue:f360.open",
          "cv-show:cue:f360.process:scroll",
          "cv-show:cue:f360.process",
          "cv-show:cue:f360.result:scroll",
          "cv-show:cue:f360.result",
          "cv-show:audio-clip:f360-studio:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-0u9zLsQQnlhRnkiePQu5Ywr1vFHWgcQP0wjGCxDmveo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-znuzWiTpOMuq2tdwRyjMRWMi9xWBVCP9bLzj6fRHgUA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-DwzrR4+BRsQoAGgOTsXMyjePr01sErD2ZCajhsH41vk=",
        "entryId": "autobox",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-iVfR9agQsrLMxL4ZrSTc/GDV9z5vZx1hyRnWc1Oafp4=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-NS8/0C8QmQIF885ZC1pTOM6SjbZw/Z7yjKP0BFzb9D4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-PSlxWKHMtOSPDeDSAUej7TX+OUhBp8ab3RobdUqR/w8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-57F9vz4xDDjjB6QhIk5WUF72t6Dcg4M5hr6aXTH39lE=",
        "entryId": "complexscan",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-MPHAQL50wAayxGbDXih4hUx9M9QwE8pn3vv8TwE7PEQ=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-rhyJ4LVfNnvCNFNEKii6VVj7xw8suzlkPUb0BygA5Rc=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-dVSounSl836U/c5KphgeRHPpYedRo1TmO8r9VrOIS2A="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-PwhzgCCQi0AFF/znw6joZfpUI1GEzMirtJVE9dvHFeE=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-yfb0KR5ieVAGYv0AOUy80X5Wyy3pOD6M9QuZ2OVsk4Q=",
        "entryId": "photopizza",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Q6OKVsPLdWmR8OD6qefDTXbjSM+DcQMOjyVyjM2BE8U=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-q9rQV2coScSj990b6Lp1L4A7yuDd/OmXm0FH9b+zYE4=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-YkgrejvthJv0Z1viB3PfYvdff51xSAVceFJrwhJycS8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-hed0POh9/bQd0evkUsiV7b7Sjg0xoxx/D1MUqQBKRwk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-NMK08ng0yJHm/sUqkZNGcXPKQ126y22LysMKz+wPURk=",
        "entryId": "finale",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-j6a7KdH2e1jvjfu938gCG3clADKdC2mDCIjZB5PAJsI=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Zw2Im3DkJU9Ilex/p1Wjr/ubM/jup79n0gGTaYftLK8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-50zwX8cQtElV6OtHomeC4JWGj98Qh4QIaP1V1jN+Lp8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-bIuRCKQ8ilDxqC3DRqYpYSITUy6birvAnbsIneSQhV4=",
        "entryId": "workspace-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-3ZzzEGaGJgGFnfgQBTju5YLY6y6rQIY6AuIm+xYHHSQ=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-WRpz7bjj0v98wSW86S75BoL89D38auqKBjsYDndfPbk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-wynZRFWp9JWcnYLGgI1RlVNUag6DazM6CA2sFNkoyhI=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-whYfl80RajkiQbAdx1AjlQc3CSVvq/2aoIzdKn/a+Fs=",
        "entryId": "symbiote-ui-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-RzliWekE6jJWJ+egQf8CQtxvql8mjo49BAHzommfWSM=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-tP7ynST9i9g4PYIJiqupjKeYVuG4jH+8iJVqEGIksJw="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-AqFnLkNA/gDkWdlbcdjp+O+9gqMzZLdCSjWiJk3jq4I=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-kyQ1czJy2MQgfutnh1VRL4G6e/cV86Y/Pg59QCsL4oA=",
        "entryId": "symbiote-engine-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-XoTJoaA/kzaYdwPaTh3DwZTv6AO+Xs9fMd5ontPbpCo=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-FEeoxiDin2wo2JHigCbVN4ooRb08OaOF+vg4O9XvQCY="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-FS+VJDwJFfYszGhc43+G0DVJjIS7d2uxq8juO5/U0Sw=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-d4Wk6Fad/Y+1CaaDpub70YYX2pz/WnmYDdkDxM69giA=",
        "entryId": "agent-portal-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-uh4UXuVkjZyTmMDtSvJxt5BgLfP7KMs5JFUVvvOAJNc=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-JQqu3CwPmoXRseVanImG1hbg/RHe2FjiZvG6mWIeJgA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-HTqvv1jk/8ppdLSW21p4iDUvaVYwEhda+9B9DnJ3gWc=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Hs4mVGom+3PoWKS9U+izdbxkz3gUaA8wRhD8/ft+PmU=",
        "entryId": "video-studio-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-o5lXHQF3I7U66MKQsVAhU7lD6G9T5Dg9JNKYK8QmCxU=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-d5Sqqub52jEYXL+y3xqlVL5ByBVEbkhLN4reUnPIaPQ="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-GGIR5NDLFEwyH4oP4SGXRxlvLm2IzKzcUI8HHVoD8ro=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ovIXSDsC0c8sQqYCyGoBRfh9socR47mYsIi80MlZQWg=",
        "entryId": "maximo-workbench-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Y4+5WODm0EpJmMMG+Ek3l7UV5IKgDH+RE22bKU5hbgQ=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-eMedv1lcramvJ5rKvVw4KLokf3/uHlXnuHEsFamkfic="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-vb7+jCe9xozucC5sy+XueN3RHFVf0I5HZ61bpVX8V98=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-But1VG2MD44GGzgBqWekxHvL6rjvCwjfVqtQMwLzaWY=",
        "entryId": "agent-pool-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-eL4g5rdaR2i6x27a9fvueUT8oTjNRhRAEei/dorxXvE=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-x5AsSMEm8OgPVUDFKnd1D7YOj5MJh+scvNzKRob/rao="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-04zHxYD7/Net9HZNWc0qTR+X9tYeYvYguUIVcFGbhL0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-899Sdhy3mayybCxX4wR6HKMt0b4uNDPQl/AzrvpnP/U=",
        "entryId": "project-graph-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-L1HpgqNuZ1Nl0iY2Zxe0sNA2U4Z3ILYpTOW/2VuEsY0=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-CBnTaKdRmf5T9ATld3K/KEMDJPe6d1YtPWPEfVM519o="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ut/GU6jLroudiLGplaf7eNx7qEvXtDcwlscu3IpsQ+Q=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CD9yb24P9Z4e0i7nlxRZ/G6qdMKlMnr3cko2ufU8aQk=",
        "entryId": "lifecycle-platform-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-hN1sCAK9hXNvnrT6134q5kCqrh3/4KOX2D5P3r9ZULQ=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-B4uOGjtpNr8ByO8ls/uLfcdX5MwA/vaY1F9q77ry44U="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-EUzPV+vL6zAjbUgqQ/2n39BGaI8XCSb3ZHZenz/Aoko=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-MuDzvffrqFa9JCuELzHmb3KhB3YKglj7RTfWSmF3xwI=",
        "entryId": "mobile-smm-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-HM6Cd5suYQs1sJv81/kalPgCkteQoxl6usjNt53ZuGo=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-f1hIr4M0XBVG7XNOKeHrJAQn4VFp2EUi9zJsarjL4dA=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-MXZW+aqYNojEEH7lfhWVDuXVueKlKwtARhHnX/cST5o="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-FLswUr3jroK2TlcaU8RETHgavPETrOFyXz/0zxo/5f8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-n+00zZxJ3k2ftGh/oGtcr/9/J0cl1DV4Qk6aql8Uemo=",
        "entryId": "f360-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-SYeEWeodu6OhG6sq9vo1S3emjwr5ivRs9NF5Hggc/94=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-Kd3mjaquAnS49it6mYsel9nNhuSvJ2VwERqzART4NLs=",
        "sourceCellIds": [
          "cv-show:narration:f360-details",
          "cv-show:cue:f360-details.path",
          "cv-show:cue:f360-details.result-one:scroll",
          "cv-show:cue:f360-details.result-one",
          "cv-show:cue:f360-details.period:scroll",
          "cv-show:cue:f360-details.period",
          "cv-show:audio-clip:f360-details:01"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-uMYMBCQrUNq1PjS1NUcklUpBgj8R4gk18z0juZms0IU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-SfethfxkdWJplTiNwQPQfXxyi/R635F2liXiK/ncfRQ=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-EFMF1cD/C2Vdk/2jqrl3EApmLc5BPkNCeOs9DKJU8Co=",
        "entryId": "autobox-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-7oxwkPeQdviLKVuO1uKbuq40dK3SgRT0srTbEcesDTs=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-bHMkOS5U/6OLjjdVIYyDkkhGMkVMCigLTDqJV7lRoRk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-LNYDLP2BrYMWwRgWEkGvZ644NhAtwu98ctv9O360sug=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-D6jUWjPnVd/LsYJ+mdNzn7kBxWfo6sOYbNTT2YgwrvM=",
        "entryId": "complexscan-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-a06wpktyxEuHocV6o2zNHD7POubMlZFYtgqQwBFZkYw=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-t0XuJkZJfrFDOpcETVCjzn/wZigDzEwdKYvcPBv4CVQ="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-3wsztHtvr3d0s1WyjWea8m0s39KLf/vCt+rvslrAl6M=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ZEc6vZeHt6obZ1ongAFs+Q9MqkR225knA68PJs/lMB8=",
        "entryId": "photopizza-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-qyCFIUS3Wo+VJeHZv6xfqBpjSX18FV39J1aoeI61prQ=",
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
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-iIeaM4QMx3ev9k5HLtQyzGTo9t2S58Vcdxuh3Jc/wig="
      }
    ],
    "hash": "cv-show-audio-provenance-v1:sha256-Toh+qD+8CzjTtaZkP0vXL6kdbKaRGUhI44496ya5pBc=",
    "schemaVersion": "cv-show-audio-provenance-v1",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-hZR4zGbcS+1kKMC1Pado/SUj4i8PhLUSveMGP6Ox12E="
  },
  "artifactTreeHash": "cv-show-audio-artifact-tree-v1:cb1ed716e3b856bf99e9b20558a3044890f888f79454dbc96236ee781620de0f",
  "entryReleaseIds": [
    "cv-show-audio-entry-release-v1:7954166ef9c9b0fb737219d0b2fb725a2869ae35995dc6ab50f35e96f5a74815",
    "cv-show-audio-entry-release-v1:661e20b9f3e1f0f3fcb95a47a06dec14114d211dbeadd97c690cc0b36669c8b0",
    "cv-show-audio-entry-release-v1:17b9cdab6cdf7d1f4d5ee9d87d1e6a0fd068f751e6cbf32b54a17910b96822f0",
    "cv-show-audio-entry-release-v1:bc34267ae683ab8b94eb6265addbdf2cdf52f358ef2a52e32e10b7c60cb618fb",
    "cv-show-audio-entry-release-v1:f98d443ffd3573a6afbcd6e0c961a19ed4ac48075019731ceb107d569ec1c513",
    "cv-show-audio-entry-release-v1:d1ffa145d0804c9c318ba443e5b870e6668735f7b5baf26598ed905cc0eb20ef",
    "cv-show-audio-entry-release-v1:513ed550b28f23416d7ce7d14ad6cf9bad3b3675794811d347f30168c7b17dfd",
    "cv-show-audio-entry-release-v1:f4d5e99c71d68d2eeec9d19b3fff9a2accc345c564f69d2deab37ad256f25279",
    "cv-show-audio-entry-release-v1:6dfd31a21fcf6d56975009ec1e0a822b82103a1ef39fba64c2a8bf999cdb4df6",
    "cv-show-audio-entry-release-v1:b232dc1d3732bf086112ac5246d34d918738f408ed9dd06a48fe2b4790b8ff82",
    "cv-show-audio-entry-release-v1:a4dfd98d9803c89b13bb07de5d88692983416abfead112646ed54b528a9e1b25",
    "cv-show-audio-entry-release-v1:688153f135c08657dd4da6832c54ae56a3cfa7e547cb37ea1aa016ad0329cddf",
    "cv-show-audio-entry-release-v1:beeffd7f861574f49288512258ad1a166419b13435d0e18fbf22f51b6c06883b",
    "cv-show-audio-entry-release-v1:c3edb31414bd3af0fd2524bed90cefad952f776a077f42c8989bfeb7f65b7812",
    "cv-show-audio-entry-release-v1:62e73fb8949cd4a5bafa2a60d16b2c9cb5f784e873ac775f110158f247ce6056",
    "cv-show-audio-entry-release-v1:319d97a333f7143494e4ff75a109fc976807a1a576b27e7d527051840875b05f",
    "cv-show-audio-entry-release-v1:a32ca34358e61c487eb018b4b68e44248b084521e4f5b32ca66186ea7d0486be",
    "cv-show-audio-entry-release-v1:c063c8e2836ed4703e0cfaba385c5f5ea34fe2e5f67274dd94db5e2faf3d1360",
    "cv-show-audio-entry-release-v1:c2608348f7118a4fc82af6fbbe6e555d69f685794b0865b38ba39d749be105f0",
    "cv-show-audio-entry-release-v1:d8f6c2f415af491380ebb995f2ff1ccdb2147bef4a4ff3730cf087958fca0f29",
    "cv-show-audio-entry-release-v1:54221116ac10d48d6f5de4d4dceb6c581928b86d6e656ad9c15a3746f1b90f9f",
    "cv-show-audio-entry-release-v1:af71f9417b3bbbb6e0da785015472630d904a0522c0e770e4662a7f9d07341ae",
    "cv-show-audio-entry-release-v1:cb1688afcdc22a310f6f27ec384ebd05d22b64302e1d0973a4118e5e61e86a6e",
    "cv-show-audio-entry-release-v1:141965f21c85f2d4dd5881a6209fb42fc6c7c9db0db95d28c8dee59fff7c583a",
    "cv-show-audio-entry-release-v1:bb91d71f76da8a34ecba4346adac9fc317aeaa5ff9f783d5535b97c1c5c8414a",
    "cv-show-audio-entry-release-v1:4c533284ee6edc811f49384a2362f4f73eaae2dd750496ae020d497abcb0f69c",
    "cv-show-audio-entry-release-v1:40cfdcdd041fb2c6c8179ef9299bd159116117c83fc33666f5b74dfecde2e3bf",
    "cv-show-audio-entry-release-v1:ed12b4f6bbb5b1f4d9337f932d1fcae011d5a6c98eb85ac11613b066bc3df41e",
    "cv-show-audio-entry-release-v1:7ec1acb66734f166ab364964ccfba710c50c222d745668fc2b92e8727a6d3fd5",
    "cv-show-audio-entry-release-v1:df464cd8181ff0f3c6b2cf1db42507835e74c3137b38460a898503fdaaf059d8"
  ],
  "manifests": {
    "alignment": {
      "model": "large-v3-turbo",
      "path": "alignment/large-v3-turbo/f80297f608f75d47/manifest.json",
      "sha256": "e2c2f2d5a6d0f0e7e20661a06d55764861e43c5b620468b0fb1b1ef5e14db691",
      "size": 3834020
    },
    "audio": {
      "path": "manifest.json",
      "sha256": "3a83687d5259a6792d66df8ca8e1435cb245855d933af13c5d683c35eba4ab5f",
      "size": 80749
    },
    "directory": "cb1ed716e3b856bf99e9b20558a3044890f888f79454dbc96236ee781620de0f",
    "locale": "ru",
    "voice": "barzana-2"
  },
  "mediaCollectionIdentity": {
    "collectionId": "cv-show:34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
    "identity": "cv-show-authoring-media-collection-v1:sha256-TrsBvzt+Tu+NyqS/8aIFQeKDdRN6WbtEcx+/lbegGyQ=",
    "manifestHash": "cv-show-media-manifest-v1:sha256-/kqDiyeUMuC/S32LalHRYOB8eJa8XhSIVTCQo8qE/Bc=",
    "schemaVersion": "workspace-presentation-media-collection-v1"
  },
  "planId": "cv-show-audio-release-plan-v1:c99eab51a44fd4e85e7dee494e650332ec6abc313892a2facc23c8a8e75b0942",
  "predecessorReleaseId": "cv-show-audio-release-v1:fbd922067c03b15d88c51921dc5b591714841049e81267777d0778d88e1ae456",
  "profiles": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WqPoIYWG+cGu1rccIYRUR/xoDVPRH+5wau/SDrzOuwQ=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-LbWAitNz77QEwRGNo8QCR0FBI9KJw9bWz6jDOxDUsDw=",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-hZR4zGbcS+1kKMC1Pado/SUj4i8PhLUSveMGP6Ox12E="
  },
  "project": {
    "authoringProjectHash": "workspace-presentation-authoring-project-v2:sha256-SrEMxji9/bmyAEPoRX/tSJ4tavjca0foFhROdLgOu9I=",
    "revision": 105
  },
  "releaseId": "cv-show-audio-release-v1:fbe88e46c067b215b31d7266bb43893d33562bb908b927f20d22737f51501def",
  "schemaVersion": "cv-show-audio-release-v1",
  "verificationHash": "cv-show-audio-release-verification-v1:3588e3c0d29047fbb9dcfb1e78d3617fe2eefdcba88a0745dc5e8ac9caeb0643"
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
