<script setup>
import { ref, reactive } from 'vue';
import { getUser } from '../api';
import { connect } from '../utils/websocket';
import { EVENT_HOME, EVENT_UPDATE_SCORE, EVENT_JUDGE_ONLINE, EVENT_JUDGE_OFFLINE, GAME_NAME } from '../utils/constant'
import AudioVisualization from '../components/AudioVisualization.vue';
import IndexView from '../components/IndexView.vue';
import SingerView from '../components/SingerView.vue';
import ScoreView from '../components/ScoreView.vue';

const isIndex = ref(true);
let socket;
// 在线上的评委
let onlineJids = ref([]);

// 展示的评委
const judges = ref([]);
let judgeCount = 0;
// 歌手名单
const singers = ref([]);
const swiperIndex = ref(0);
// 是否开启评分
// const running = ref(true);
// 当前歌手 Idx
const singerIdx = ref('');
// 页面标题
const gameName = ref(GAME_NAME);

const scorelist = ref(null);
const audom = ref(null);
const audom2 = ref(null);
const scoreview = ref(null);

const au = new Audio();
const audio = reactive(au);
const audioSource = reactive({ value: null, analyser: null });
const song = ref('');

const onSingerChange = (data) => {
  // 优化：当 res.data 为空时刷新页面
  const { accompany, sId, song: ssong } = data;
  scoreview.value.updateScore(sId);
  audio.src = accompany ? `src/assets/audio/${accompany}` : null;
  audio.currentTime = 0;
  console.log('audom', audom);
  audom.value.reset();
  audom2.value.reset();
  song.value = ssong;
};

const update = (isIndex) => {
  getUser().then(({ data: { data, active, scores: hscores } }) => {
    singers.value = data;
    console.log('update getUser', singers);
    const activeIndex = active !== undefined ? active : 0;
    swiperIndex.value = activeIndex;

    singerIdx.value = data[activeIndex]._id;
    audio.src = data[activeIndex].accompany ? `src/assets/audio/${data[activeIndex].accompany}` : null;
    song.value = data[activeIndex].song;
    const scores = scoreview.value.updateScores(hscores, data[activeIndex]._id);
    if (!isIndex) {
      scorelist.value.update(data, scores);
    }
  });
};

connect(EVENT_HOME, (target) => {
  socket = target;
  // 有评委提交了评分
  socket.on(EVENT_UPDATE_SCORE, ({ data }) => {
    // 正常流程是 true
    scoreview.value.updateByJudge(singerIdx.value, data)
  });
  // 有评委上线
  socket.on(EVENT_JUDGE_ONLINE, ({ data }) => {
    onlineJids.value.push(data._id);
  });
  // 有评委上线
  socket.on(EVENT_JUDGE_OFFLINE, ({ data }) => {
    const offlineIndex = onlineJids.value.findIndex((jid) => jid === data);
    onlineJids.value.splice(offlineIndex, 1);
  });
}, (allJudges) => {
  judges.value = allJudges;
  judgeCount = allJudges.length;
  document.querySelector('.judge-arousel .slick-list').classList.add(`custom-class-${judgeCount >= 4 ? 4 : judgeCount}`);
  update();
});

function onMenuChange() {
  isIndex.value = !isIndex.value;
  update(isIndex.value);
}

let isStarting = false;
function onBegin() {
  if (isStarting) {
    return;
  }
  isStarting = true;
  audio.controls = false;
  audio.loop = false;
  audio.autoplay = false;
  audio.crossOrigin = 'anonymous';
  console.log(audio)
  window.audio = au

  var audioContext = new window.AudioContext();
  var analyser = audioContext.createAnalyser();
  var smoothingTimeConstant = 0.65;
  var fftSize = 8192;//32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768
  analyser.connect( audioContext.destination );
  analyser.smoothingTimeConstant = smoothingTimeConstant;
  analyser.fftSize = fftSize;
  var auSource = audioContext.createMediaElementSource( audio ); 
  auSource.connect( analyser );
  audioSource.value = auSource;
  audioSource.analyser = analyser;
}
</script>

<template>
  <main>
    <index-view @click="onBegin"></index-view>
    <div class="home-page">
      <div class="title" v-html="gameName"></div>
      <audio-visualization ref="audom" :audio="audio" :audio-source="audioSource.value" :analyser="audioSource.analyser" auid="auid"></audio-visualization>
      <div class="main">
        <a-button class="show-all" @click="onMenuChange" ghost>{{ isIndex ? '查看全部' : '返回列表' }}</a-button>
        <div class="content" v-show="isIndex">
          <div class="singer-swiper">
            <singer-view :active="swiperIndex" :singers="singers" @singer-change="onSingerChange"></singer-view>
            <audio-visualization2 ref="audom2" :audio="audio" :audio-source="audioSource.value" :analyser="audioSource.analyser" :song="song" auid="auid"></audio-visualization2>
          </div>
          <div class="score">
            <score-view ref="scoreview" :judges="judges" :online-jids="onlineJids"></score-view>
          </div>
        </div>
        <div class="content score-list-content" v-show="!isIndex">
          <score-list ref="scorelist"></score-list>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="less" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/bg2.jpg');
  background-position: center;
  background-size: cover;
  color: #fff;
}

.title {
  position: relative;
  font-family: '汉仪尚巍手书W';
  background: linear-gradient(180deg,#fffae9 0,#fffae9 30%,#ffce3c 60%, #e6b522);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 56px;
  text-align: center;
  height: 180px;
  line-height: 180px;
  z-index: 1;
}

.main {
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 0;
  flex: 1;
  margin: 0 100px 100px 100px;
  // background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    filter: blur(20px);
    // background: url(/src/assets/bg.jpg);
    // background-size: cover;
    // background-position: center;
  }

  .show-all {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 1;
  }

  .menu {
    display: flex;

    .status {
      margin-left: auto;
      transform: scale(1.5);
      transform-origin: top;
    }
  }

  .content {
    flex: 1;
    display: flex;
    // background-color: rgba(0, 0, 0, .1);
  }

  .score {
    width: 50%;
    padding: 20px 20px 0 20px;
    // background-color: rgba(0, 0, 0, .3);
    border-radius: 12px;
  }

  .singer-swiper {
    position: relative;
    width: 50%;
    // background-color: rgba(0,0,0,0.3);
  }
}

.score-list-content {
  padding: 20px 0 36px; 
}
</style>
