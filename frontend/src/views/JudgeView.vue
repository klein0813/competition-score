<script setup>
import { ref, reactive, toRaw } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';
import { getJudgeByName, getJudgeById } from '../api';
import { connect } from '../utils/websocket';
import {
  LS_KEY_JID,
  EVENT_SCORE,
  EVENT_SINGER_CHANGE,
  WIN_EVENT_UNLOAD,
  EVENT_GET_SCORE,
} from '../utils/constant'

let jid = localStorage.getItem(LS_KEY_JID);

const score = ref(null);
const loading = ref(false);
const showError = ref(false);
const name = ref('');
const open = ref(true);
const hasScore = ref(false);

let singer = reactive({ value: {} });

let socket;

const getScoreResponse = (response) => {
  if (response._id) {
    hasScore.value = true;
    score.value = response.value;
  } else {
    hasScore.value = false;
    score.value = null;
  }
};

const onSubmit = () => {
  loading.value = true;
  socket.emit(EVENT_SCORE, score.value, () => {
    socket.emit(EVENT_GET_SCORE, null, (response) => {
      getScoreResponse(response);
      loading.value = false;
    });
  });
};

const toContent = (jid) => {
  connect(jid, (target) => {
    socket = target;
    socket.on(EVENT_SINGER_CHANGE, function({ data }) {
      singer.value = data ?? {};
      socket.emit(EVENT_GET_SCORE, null, getScoreResponse);
    });
    window.addEventListener(WIN_EVENT_UNLOAD, socket.close);
  }, (currentSinger) => {
    singer.value = currentSinger ?? {};
    toRaw(singer.value)._id && socket.emit(EVENT_GET_SCORE, null, getScoreResponse);
  });
};

if (jid) {
  getJudgeById(jid).then(({ data }) => {
    if (data?._id) {
      name.value = data.name;
      open.value = false;
      toContent(jid);
    } else {
      localStorage.removeItem(LS_KEY_JID);
    }
  });
}

const handleOk = async () => {
  const { data } = await getJudgeByName(name.value);
  if (data?._id) {
    open.value = false;
    jid = data._id;
    localStorage.setItem(LS_KEY_JID, jid);
    toContent(jid);
    return;
  }

  showError.value = true;
};

const pageHeight = ref(window.innerHeight);
</script>

<template>
  <a-watermark class="judge" :style="{ height: `${pageHeight}px` }" :content="name" :gap="[16, 32]">
    <a-avatar shape="square" class="avatar">
      <template #icon><UserOutlined /></template>
    </a-avatar>
    <div class="singer-info number">{{ singer.value.number }}号</div>
    <div class="singer-info class-name">{{ singer.value.class }}班 {{ singer.value.name }}</div>
    <a-input-number id="inputNumber" class="number-input" size="large" v-model:value="score" :min="0.01" :max="10" :disabled="hasScore || !singer.value._id" />
    <a-button
      type="primary"
      class="submit-button"
      size="large"
      :loading="loading"
      :disabled="hasScore || !singer.value._id"
      @click="onSubmit"
    >
      {{ hasScore ? '已' : '' }}打分
    </a-button>
    <a-modal title="请输入名字" v-model:open="open" :closable="false" :mask-closable="false" :centered="true">
      <a-input v-model:value="name" :status="showError ? 'error' : ''" placeholder="评委名字" />
      <div v-if="showError" style="color: red;">名字不存在，请联系管理员添加</div>
      <template #footer>
        <a-button key="submit" type="primary" @click="handleOk">提交</a-button>
      </template>
    </a-modal>
  </a-watermark>
</template>

<style lang="less" scoped>
.judge {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.avatar {
  width: 120px;
  height: 120px;
  margin-top: 30px;
  font-size: 64px;
  line-height: 120px;
}

.singer-info {
  font-size: 28px;
  font-family: cursive;
  line-height: 28px;
}

.number {
  margin-top: 6px;
}

.number-input {
  width: 40%;
  margin-top: 8px;
}

:deep(.ant-input-number-input) {
  text-align: center;
  font-size: 24px;
  font-family: cursive;
}

.submit-button {
  width: 80%;
  margin-top: 20px;
  font-size: 24px;
  font-family: cursive;
  line-height: 24px;
}
</style>
