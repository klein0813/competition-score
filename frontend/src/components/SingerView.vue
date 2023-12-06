<script setup>
import { ref, computed } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { changeSinger } from '../api';
import { getName1stLetter } from '../utils/common';

const props = defineProps(['active', 'singers']);
const emits = defineEmits(['singer-change']);

const hiddenPrevArrow = computed(() => {
  return props.active === 0;
});

const hiddenNextArrow = computed(() => {
  return props.active === props.singers.length - 1;
});

const singerIdx = ref('');
const singerswiper = ref(null);

const onSingerChange = (current) => {
  const { accompany, _id: sId, song } = props.singers[current];
  changeSinger(sId).then(() => {
    singerIdx.value = sId;
    emits('singer-change', {
      accompany,
      sId,
      song,
    });
  });
};
</script>

<template>
  <a-carousel arrows ref="singerswiper" :dots="false" :after-change="onSingerChange">
    <template #prevArrow>
      <div class="custom-slick-arrow" v-show="!hiddenPrevArrow" style="left: 10px; z-index: 1">
        <left-outlined />
      </div>
    </template>
    <template #nextArrow>
      <div class="custom-slick-arrow" v-show="!hiddenNextArrow" style="right: 10px">
        <right-outlined />
      </div>
    </template>
    <div class="singer-container" v-for="singer in props.singers" :key="singer._id">
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
</template>

<style lang="less" scoped>
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

  .singer-avatar {
    width: 72px;
    height: 72px;
    line-height: 72px;
    font-size: 28px;
    box-sizing: content-box;
  }
</style>
