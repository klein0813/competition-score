<script setup>
import { ref } from 'vue';

const fadeout = ref(false);

function onClick() {
  fadeout.value = true;
}
</script>

<template>
 <div class="index-view" :class="fadeout ? 'fadeout' : ''" @click="onClick">
    <div class="title">
      崇阳县第二高级中学首届“校园十佳歌手比赛”决赛
    </div>
    <div class="badge">
      <span>声</span>
      <span>之</span>
      <span>所</span>
      <span>向</span>
      &nbsp;&nbsp;&nbsp;
      <span>心</span>
      <span>之</span>
      <span>所</span>
      <span>往</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .index-view {
    position: absolute;
    z-index: 100;
    background-image: url(../assets/bg0.jpg);
    width: 100%;
    height: 100%;
    background-size: cover;
    opacity: 1;

    .title {
      margin-top: 143px;
      font-size: 58px;
      text-align: center;
      font-family: '汉仪超粗宋简';
      background: linear-gradient(180deg, #fffae9 0, #fffae9 20%, #ffce3c 60%, #e6b522);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge {
      letter-spacing: -35px;
      font-size: 157px;
      text-align: center;
      font-family: '汉仪尚巍手书W';
      background-image: url(../assets/goldsand.jpeg);
      background-size: contain;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

@keyframes fadeout {
  from { opacity: 1; }
  to { opacity: 0; display: none; }
}

.fadeout {
  animation-name: fadeout;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
  animation-duration: 500ms;
}
</style>
