<script setup>
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { ref, reactive, toRaw, watch } from 'vue';
import { getUser, changeSinger } from '../api';
import { connect } from '../utils/websocket';
import { EVENT_HOME, EVENT_UPDATE_SCORE, EVENT_JUDGE_ONLINE, EVENT_JUDGE_OFFLINE, GAME_NAME } from '../utils/constant'
import { getName1stLetter } from '../utils/common';

const isIndex = ref(true);
let socket;
// 进入页面时，评委名单
let initJudges = [];
// 在线上的评委
let onlineJudges = [];
// 评分
let scores = {};

// 展示的评委
const judges = ref([]);
// 歌手名单
const singers = ref([]);
// 是否开启评分
// const running = ref(true);
// 当前歌手 Idx
const singerIdx = ref('');
// 页面标题
const gameName = ref(GAME_NAME);
// 成绩列表
const scoreList = reactive({
  value: [],
});

// 当前歌手的分数
const currentScore = reactive({
  avg: '-',
  total: 0,
  count: 0,
  values: {},
});

const singerswiper = ref(null);

const onSingerChange = (current) => {
  singerIdx.value = singers.value[current]._id;
  changeSinger(singerIdx.value).then(() => {
    // 优化：当 res.data 为空时刷新页面
    const singerScore = scores[singerIdx.value];
    currentScore.total = singerScore.total;
    currentScore.count = singerScore.count;
    currentScore.avg = singerScore.avg;
    currentScore.values = singerScore['values'];

    const scoredDetail = scores[singerIdx.value].values;
    const scoredJudges = initJudges.filter((judge) => scoredDetail[judge._id] !== undefined);
    const showJudges = scoredJudges.concat(...onlineJudges.filter((onlineJudge) => scoredDetail[onlineJudge._id] === undefined));
    document.querySelector('.judge-arousel .slick-list').classList.remove(`custom-class-${toRaw(judges.value).length}`);
    document.querySelector('.judge-arousel .slick-list').classList.add(`custom-class-${showJudges.length}`);
    
    judges.value = showJudges;
  });
};

const update = (isIndex) => {
  getUser().then(({ data: { data, active, scores: hscores } }) => {
    singers.value = data;
    const activeIndex = active !== undefined ? active : 0;
    singerIdx.value = data[activeIndex]._id;
    singerswiper.value.goTo(active, true);
    scores = hscores;

    const singerScore = scores[singerIdx.value]
    currentScore.total = singerScore.total;
    currentScore.count = singerScore.count;
    currentScore.avg = singerScore.avg;
    currentScore.values = singerScore.values;

    const scoredDetail = scores[singerIdx.value].values;
    const scoredJudges = initJudges.filter((judge) => scoredDetail[judge._id] !== undefined);
    const showJudges = scoredJudges.concat(...onlineJudges.filter((onlineJudge) => scoredDetail[onlineJudge._id] === undefined));
    document.querySelector('.judge-arousel .slick-list').classList.add(`custom-class-${showJudges.length}`);
    judges.value = showJudges;

    if (!isIndex) {
      const scoreRanges = [];
      data.forEach(singer => {
        scoreRanges.push({
          _id: singer._id,
          name: singer.name,
          class: singer.class,
          number: singer.number,
          total: scores[singer._id].total,
          avg: scores[singer._id].avg ?? '-',
        });
      });
      scoreRanges.sort((prev, next) => next.total - prev.total);
      scoreList.value = scoreRanges;
    }
  });
};

connect(EVENT_HOME, (target) => {
  socket = target;
  socket.on(EVENT_UPDATE_SCORE, ({ data }) => {
    // 正常流程是 true
    if (singerIdx.value === data.singerId) {
      currentScore.total += data.value;
      currentScore.count ++;
      currentScore.avg = (currentScore.total / currentScore.count).toFixed(2);
      currentScore.values[data.judgeId] = data.value;

      scores[data.singerId].total = currentScore.total
      scores[data.singerId].count = currentScore.count;
      scores[data.singerId].avg = currentScore.avg;
      scores[data.singerId]['values'][data.judgeId] = data.value;
    }
  });

  socket.on(EVENT_JUDGE_ONLINE, ({ data }) => {
    onlineJudges.push(data);
    if (toRaw(judges.value).findIndex((judge) => judge._id === data._id) === -1) {
      document.querySelector('.judge-arousel .slick-list').classList.remove(`custom-class-${toRaw(judges.value).length}`);
      judges.value.push(data);
      document.querySelector('.judge-arousel .slick-list').classList.add(`custom-class-${toRaw(judges.value).length}`);
    }
  });

  socket.on(EVENT_JUDGE_OFFLINE, ({ data }) => {
    console.log('EVENT_JUDGE_OFFLINE');
    const offlineIndex = onlineJudges.findIndex((judge) => judge._id === data);
    onlineJudges.splice(offlineIndex, 1);
    if (scores[singerIdx.value].values[data] === undefined) {
      const offlineJId = toRaw(judges.value).findIndex((judge) => judge._id === data);
      if (offlineJId > -1) {
        document.querySelector('.judge-arousel .slick-list').classList.remove(`custom-class-${toRaw(judges.value).length}`);
        judges.value.splice(offlineJId, 1);
        document.querySelector('.judge-arousel .slick-list').classList.add(`custom-class-${toRaw(judges.value).length}`);
      }
    }
  });
}, (allJudges) => {
  initJudges = allJudges;
  onlineJudges = initJudges.filter((judge) => judge.status);
  update();
});

watch(isIndex, (newVal) => {
  update(newVal);
});

// watch(running, async (newVal) => {
// })
</script>

<template>
  <main>
    <div class="home-page">
      <div class="title" v-html="gameName"></div>
      <div class="main">
        <a-button class="show-all" @click="isIndex = !isIndex" ghost>{{ isIndex ? '查看全部' : '返回列表' }}</a-button>
        <div class="content" v-show="isIndex">
          <div class="singer-swiper">
            <a-carousel arrows ref="singerswiper" :dots="false" :after-change="onSingerChange">
              <template #prevArrow>
                <div class="custom-slick-arrow" style="left: 10px; z-index: 1">
                  <left-outlined />
                </div>
              </template>
              <template #nextArrow>
                <div class="custom-slick-arrow" style="right: 10px">
                  <right-outlined />
                </div>
              </template>
              <div class="singer-container" v-for="singer in singers" :key="singer._id">
                <a-avatar
                  class="singer-avatar"
                  style="background-color: #1890ff"
                >
                  {{ getName1stLetter(singer.name) }}
                </a-avatar>
                <div style="margin-top: 10px;">{{ singer.number }}号</div>
                <div>{{ singer.class }}班 {{ singer.name }}</div>
              </div>
            </a-carousel>
          </div>
          <div class="score">
            <div class="score-info">
              <span>平均分：</span>
              <span class="score-avg" v-text="currentScore.avg ?? '-'"></span>
            </div>
            <div class="score-info">已评分 {{ currentScore.count ?? 0 }} 人/总评委 {{ judges.length }} 人</div>
            <a-carousel class="judge-arousel" :dots="false" dot-position="left" :autoplay="currentScore.count === judges.length">
              <div class="score-item" v-for="judge in judges " :key="judge._id">
                <div class="judge-info">
                  <a-avatar
                    class="judge-avatar"
                    style="color: #f56a00; background-color: #fde3cf"
                  >
                    {{ getName1stLetter(judge.name) }}
                  </a-avatar>
                  <div class="judge-name">{{ judge.name }}</div>
                </div>
                <div>评分：<span style="color: #f56a00;">{{ currentScore.values[judge._id] || '-' }}</span> 分</div>
              </div>
            </a-carousel>
          </div>
        </div>
        <div class="content score-list-content" v-show="!isIndex">
          <div class="score-list">
            <div
              class="score-list-item"
              v-for="(item, index) in scoreList.value"
              :key="item._id"
            >
              <img v-if="index === 0" class="singer-score-avatar" src="../assets/golden.png">
              <img v-else-if="index === 1" class="singer-score-avatar" src="../assets/silver.png">
              <img v-else-if="index === 2" class="singer-score-avatar" src="../assets/bronze.png">
              <!-- <object v-if="index === 0" class="singer-avatar" data="../assets/gold.svg" type="image/svg+xml" /> -->
              <!-- <a-avatar
                class="singer-avatar"
                style="background-color: #1890ff"
                v-else
              >
                {{ getName1stLetter(item.name) }}
              </a-avatar> -->
              <div v-else class="singer-score-avatar">
                <a-avatar class="singer-score-avatar-content" shape="square">{{ index + 1 }}</a-avatar>
                <img class="avatar-frame" src="../assets/avatar_frame.png">
              </div>
              <!-- <div style="margin-top: 10px;">{{ item.number }}号</div> -->
              <div>{{ item.class }}班 {{ item.name }}</div>
              <div>平均分：<span style="color: #f56a00;">{{ item.avg }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="less" scoped>
:deep(.slick-list.custom-class-1) {
  height: 108px !important;
}

:deep(.slick-list.custom-class-2) {
  height: 216px !important;
}

:deep(.slick-list.custom-class-3) {
  height: 326px !important;
}

:deep(.slick-list.custom-class-4) {
  height: 432px !important;
}

  .home-page {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background-image: url('../assets/bg.jpg');
    background-position: center;
    background-size: cover;
    color: #fff;
  }

  .title {
    font-family: cursive;
    font-size: 48px;
    text-align: center;
    height: 140px;
    line-height: 140px;
  }

  .main {
    position: relative;
    display: flex;
    flex-direction: column;
    z-index: 0;
    flex: 1;
    margin: 0 100px 100px 100px;
    background-color: rgba(0, 0, 0, 0.5);
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
      background: url(/src/assets/bg.jpg);
      background-size: cover;
      background-position: center;
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
      background-color: rgba(0, 0, 0, .1);
    }

    .score {
      width: 50%;
      padding: 20px 20px 0 20px;
      background-color: rgba(0, 0, 0, .3);
      border-radius: 12px;

      &-info {
        font-size: 20px;
      }

      &-avg {
        color: rgb(245, 106, 0);
        font-size: 28px;
      }

      &-item {
        display: flex !important;
        justify-content: space-between;
        align-items: center;
        height: 100px;
        padding: 0 10px;
        margin-top: 8px;
        border: 1px solid;
        font-size: 22px;
        color: #fff;
      }

      .judge-info {
        display: flex;
        align-items: center;
      }

      .judge-name {
        margin-left: 6px;
      }

      .judge-avatar {
        width: 56px;
        height: 56px;
        line-height: 56px;
        font-size: 22px;
        box-sizing: content-box;
      }
    }

    .singer-swiper {
      width: 50%;
      // background-color: rgba(0,0,0,0.3);

      .ant-carousel {
        height: 100%;
      }

      :deep(.slick-slide) {
        height: 320px;
      }

      :deep(.slick-slider) {
        text-align: center;
        // height: inherit;
        // line-height: 160px;
        overflow: hidden;
      }

      .singer-container {
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        height: 320px;
        align-items: center;
        color: #fff;
        font-size: 32px;
        font-family: cursive;
        line-height: 36px;
      }

      // .slick-list {
      //   height: inherit;
      // }

      // .slick-track {
      //   height: inherit;
      // }

      :deep(.slick-arrow.custom-slick-arrow) {
        width: 25px;
        height: 25px;
        font-size: 25px;
        color: #fff;
        // background-color: rgba(31, 45, 61, 0.11);
        transition: ease all 0.3s;
        opacity: 0.6;
        z-index: 1;
      }

      :deep(.slick-prev) {
        left: 48px !important;
      }

      :deep(.slick-next) {
        right: 48px !important;
      }

      :deep(.slick-arrow.custom-slick-arrow:before) {
        display: none;
      }

      :deep(.slick-arrow.custom-slick-arrow:hover) {
        color: #fff;
        opacity: 0.8;
      }

      :deep(.slick-slide h3) {
        color: #fff;
      }
    }

    .singer-avatar {
      width: 72px;
      height: 72px;
      line-height: 72px;
      font-size: 28px;
      box-sizing: content-box;
    }

    .singer-score-avatar {
      width: 120px;
      height: 120px;
      position: relative;
      margin: 0 auto;
    }

    .singer-score-avatar-content {
      width: 88px;
      height: 88px;
      margin-top: 7px;
      border-radius: 17px;
      font-size: 48px;
      line-height: 80px;
      background-image: linear-gradient(45deg, #935623, #f4d387);
    }
  }

  .score-list-content {
    padding: 20px 0 36px; 
  }

  .score-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 70vh;
    font-size: 20px;
    line-height: normal;
    overflow-y: scroll;

    &-item {
      position: relative;
      text-align: center;
      width: 9%;

      &:nth-child(1) {
        width: 100%;
      }

      &:nth-child(2),
      &:nth-child(3) {
        width: 30%;
        margin-top: -72px;
      }

      &:nth-child(2) {
        margin-left: 20%;
      }

      &:nth-child(3) {
        margin-right: 20%;
      }

      &:nth-child(n + 4) {
        .singer-score-avatar {
          padding-top: 15px;
        }
      }

      &:nth-child(4),
      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7),
      &:nth-child(8),
      &:nth-child(9),
      &:nth-child(10) {
        width: 11%;
      }

      &:nth-child(4) {
        margin-left: 11.5%;
      }

      &:nth-child(10) {
        margin-right: 11.5%;
      }

      &:nth-child(11) {
        margin-left: 5%;
      }

      &:nth-child(20) {
        margin-right: 5%;
      }
    }

    .avatar-frame {
      position: absolute;
      left: 0;
      right: 0;
      width: 100px;
      height: 100px;
      margin: 0 auto;
    }
  }

  :where(.css-dev-only-do-not-override-185kyl0).ant-switch.ant-switch-checked {
    background: #1677ff;
}
  :where(.css-dev-only-do-not-override-185kyl0).ant-switch.ant-switch-checked:hover:not(.ant-switch-disabled) {
    background: #4096ff;
}
:where(.css-dev-only-do-not-override-185kyl0).ant-switch:hover:not(.ant-switch-disabled) {
  background: rgba(255, 255, 255, 0.45);
}
  :where(.css-dev-only-do-not-override-185kyl0).ant-switch {
        background: rgba(255, 255, 255, 0.25);
      }

      ::-webkit-scrollbar {
  /*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  }
</style>
