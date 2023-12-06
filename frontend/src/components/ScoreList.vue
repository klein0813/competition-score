<script setup>
import { reactive } from 'vue';

// 成绩列表
const scoreList = reactive({
  value: [],
});

function update(singers, scores) {
  console.log(scores);
  const scoreRanges = [];
  singers.forEach(singer => {
    scoreRanges.push({
      _id: singer._id,
      name: singer.name,
      class: singer.class,
      number: singer.number,
      total: scores[singer._id].total ?? 0,
      avg: scores[singer._id].avg ?? '-',
    });
  });
  scoreRanges.sort((prev, next) => next.total - prev.total);
  scoreList.value = scoreRanges;
}

defineExpose({
  update,
})
</script>

<template>
<div class="score-list">
  <div
    class="score-list-item"
    v-for="(item, index) in scoreList.value"
    :key="item._id"
  >
    <img v-if="index === 0" class="singer-score-avatar" src="../assets/golden.png">
    <img v-else-if="index === 1" class="singer-score-avatar" src="../assets/silver.png">
    <img v-else-if="index === 2" class="singer-score-avatar" src="../assets/bronze.png">
    <div v-else class="singer-score-avatar">
      <a-avatar class="singer-score-avatar-content" shape="square">{{ index + 1 }}</a-avatar>
      <img class="avatar-frame" src="../assets/avatar_frame.png">
    </div>
    <div>{{ item.class }}班 {{ item.name }}</div>
    <div>平均分：<span style="color: #f56a00;">{{ item.avg }}</span></div>
  </div>
</div>
</template>

<style lang="less" scoped>
.score-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 70vh;
  font-size: 18px;
  line-height: normal;
  overflow-y: scroll;

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

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}

.online {
  border: 1px solid;
}
</style>
