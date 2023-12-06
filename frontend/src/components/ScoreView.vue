<script setup>
import { reactive, computed } from 'vue';
import { getName1stLetter } from '../utils/common';

const props = defineProps(['judges', 'onlineJids']);
// 评分
let scores = {};
let judgeCount = 0;

// 当前歌手的分数
const currentScore = reactive({
  avg: '-',
  total: 0,
  count: 0,
  values: {},
  iValues: {},
});

const showAvg = computed(() => {
  return currentScore.count === props.judges.length;
})

const formatScore = (score) => score?.toFixed(2);

function updateScore(sId) {
  const singerScore = scores[sId];
  currentScore.total = singerScore.total;
  currentScore.count = singerScore.count;
  currentScore.values = singerScore['values'];
  if (currentScore.count === judgeCount) {
    currentScore.avg = singerScore.avg;
    currentScore.iValues = singerScore['iValues'];
  } else {
    currentScore.iValues = {};
  }
}

function updateScores(hscores, sId) {
  scores = hscores;

  for (const key in scores) {
    if (Object.hasOwnProperty.call(scores, key)) {
      if (scores[key].count === judgeCount) {
        let total = 0;
        let count = 0;
        const { iValues, values } = scores[key];
        for (const jid in values) {
          if (Object.hasOwnProperty.call(values, jid) && !iValues[jid]) {
            total += values[jid];
            count++;
          }
        }
        scores[key].total = total;
        scores[key].avg = count > 0 ? (total / count).toFixed(2).padEnd(4, '0') : null;
      }
    }
  }
  const singerScore = scores[sId]
  currentScore.count = singerScore.count;
  currentScore.values = singerScore.values;
  // 所有评委已打分
  if (singerScore.count === judgeCount) {
    currentScore.avg = singerScore.avg;
    currentScore.iValues = singerScore.iValues;
  } else {
    currentScore.iValues = {};
  }

  return scores;
}

function updateByJudge(sid, data) {
  if (sid === data.singerId) {
    currentScore.count++;
    currentScore.values[data.judgeId] = data.value;

    scores[data.singerId].count = currentScore.count;
    scores[data.singerId]['values'][data.judgeId] = data.value;

    if (currentScore.count === judgeCount) {
      let total = 0;
      let count = 0;
      const min = {
        jid: '',
        value: 10001,
      };
      const max = {
        jid: '',
        value: -1,
      };
      for (const jid in currentScore.values) {
        if (Object.hasOwnProperty.call(currentScore.values, jid)) {
          const value = currentScore.values[jid];
          if (min.value > value) {
            min.value = value;
            min.jid = jid;
          }
          if (max.value <= value) {
            max.value = value;
            max.jid = jid;
          }
        }
      }
      const iValues = {
        [min.jid]: min.value,
        [max.jid]: max.value,
      };
      count = 0;
      for (const jid in currentScore.values) {
        if (Object.hasOwnProperty.call(currentScore.values, jid) && !iValues[jid]) {
          const value = currentScore.values[jid];
          total += value;
          count++;
        }
      }

      const avg = Number(total / count).toFixed(2).padEnd(4, '0');
      scores[sid].total = total;
      scores[sid].avg = avg;
      currentScore.avg = avg;
      currentScore.total = total;
      currentScore.iValues = iValues;
    }
  }
}

defineExpose({
  updateScore,
  updateScores,
  updateByJudge,
})
</script>

<template>
  <div class="score-info">
    <span>平均分：</span>
    <span class="score-avg" v-text="showAvg ? currentScore.avg : '-'"></span>
  </div>
  <div class="score-info">
    <span>已评分 {{ currentScore.count ?? 0 }} 人/总评委 {{ props.judges.length }} 人</span>
    <span style="font-size: 12px;" v-if="showAvg">(规则：去掉一个最高分，去掉一个最低分)</span>
  </div>
  <a-carousel class="judge-arousel" :dots="false" dot-position="left" :autoplay="showAvg">
    <div class="score-item" :class="currentScore.iValues[judge._id] ? 'invalid-score' : ''" v-for="judge in props.judges " :key="judge._id">
      <div class="judge-info">
        <a-avatar
          class="judge-avatar"
          :class="props.onlineJids.includes(judge._id) ? 'online' : ''"
          style="color: #f56a00; background-color: #fde3cf"
        >
          {{ getName1stLetter(judge.name) }}
        </a-avatar>
        <div class="judge-name">{{ judge.name }}</div>
      </div>
      <div>评分：<span style="color: #f56a00;">{{ formatScore(currentScore.values[judge._id]) || '-' }}</span> 分</div>
    </div>
  </a-carousel>
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

.score {
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
    position: relative;
    display: flex;
    align-items: center;
  }

  .invalid-score::before {
    position: absolute;
    content: '';
    width: 100%;
    height: 2px;
    background-color: darkgrey;
    left: 0;
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
</style>
