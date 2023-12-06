<script setup>
import { onMounted } from 'vue';
const props = defineProps(['audio', 'auid', 'audioSource', 'analyser', 'song']);

// 音乐播放器
class MusicPlayer {
    constructor(data = {
        effectColor: "#FFFFFF"
    }) {
        this._requestID = null;
        // 特效单体
        this._effectEntity = new Entity();
        this._effectEntity.addComp(new MusicBtnSingleComp({
            callback: () => {
              this.animateControl();
            }
        }));
        this._effectEntity.addComp(new MusicSingleComp({
            musicSrc: data.musicSrc
        }));
        this._effectEntity.addComp(new MusicEffectSingleComp({
            effectColor: data.effectColor
        }))
    }

    _renderFrame() {
        this._requestID = requestAnimationFrame(this._renderFrame.bind(this));

        this._effectEntity.getComp("MusicEffectSingleComp").byteFrequencyDate = this._effectEntity.getComp("MusicSingleComp").byteFrequencyDate;
    }

    reset() {
      cancelAnimationFrame(this._requestID);
    }

    animateControl() {
      this._effectEntity.getComp("MusicBtnSingleComp").isRotate = !this._effectEntity.getComp("MusicBtnSingleComp").isRotate;
      !this._effectEntity.getComp("MusicSingleComp").isReady &&(this._effectEntity.getComp("MusicSingleComp").isReady = true);
      console.log('isPlay', this._effectEntity.getComp("MusicSingleComp").isPlay);
      this._effectEntity.getComp("MusicSingleComp").isPlay = !this._effectEntity.getComp("MusicSingleComp").isPlay;

      if(!this._effectEntity.getComp("MusicSingleComp").isPlay) {
          cancelAnimationFrame(this._requestID);
      } else {
          this._requestID = requestAnimationFrame(this._renderFrame.bind(this));
      }
    }
}

// 单体
class Entity {
    constructor() {
        this._compMap = new Map();
    }

    addComp(comp) {
        this._compMap.set(comp.name, comp);
    }

    getComp(compName) {
        return this._compMap.get(compName);
    }
}

// 音乐按钮
class MusicBtnSingleComp {
    constructor(data) {
        this.name = "MusicBtnSingleComp";
        this._isRotate = false;
        this._musicBtnDom = document.querySelector("#auid");
        this._musicBtnDom.addEventListener("click", data.callback);
    }

    set isRotate(value) {
        if (value) {
            this._musicBtnDom.classList.remove("rotate");
        } else {
            this._musicBtnDom.classList.add("rotate");
        }
        this._isRotate = value;
    }

    get isRotate() {
        return this._isRotate;
    }
}

// 音乐
class MusicSingleComp {
    constructor() {
        this.name = "MusicSingleComp";
        this._fftSize = 512;

        this._myAudioDom = props.audio;

        this._isReady = false;
        this._isPlay = false;
        this._analyser = null;
        this._dataArray = [];
    }

    set isReady(value) {
        if (value) {
            this._analyser = props.analyser;
            const bufferLength = this._analyser.frequencyBinCount;
            this._dataArray = new Uint8Array(bufferLength);
        }
        this._isReady = value;
    }

    get isReady() {
        return this._isReady;
    }

    set isPlay(value) {
        if (value) {
            this._myAudioDom.play();
        } else {
            this._myAudioDom.pause();
        }
        this._isPlay = value;
    }

    get isPlay() {
        return this._isPlay;
    }

    get byteFrequencyDate() {
        this._analyser.getByteFrequencyData(this._dataArray);
        return this._dataArray.slice(0, 120);
    }
}

// 音乐特效
class MusicEffectSingleComp {
    constructor(data) {
        this.name = "MusicEffectSingleComp";
        this._effectColor = data.effectColor;
        this._canvasDom = document.querySelector(".my-canvas");
        this._canvasDom.width = 400;
        this._canvasDom.height = 400;
        this._ctx = this._canvasDom.getContext("2d");
        this._byteFrequencyData;
        this._randomData = Uint8Array.from(new Uint8Array(120), (v,k) => k);
        this._randomData.sort(() => Math.random() - 0.5);
        this.byteFrequencyDate = new Uint8Array(120).fill(0);
    }

    set byteFrequencyDate(value) {
        this._byteFrequencyData = value;
        const bData = [];
        this._randomData.forEach(value => {
            bData.push(this._byteFrequencyData[value]);
        })

        const angle = Math.PI * 2 / bData.length;
        this._ctx.clearRect(0, 0, this._canvasDom.width, this._canvasDom.height);
        this._ctx.fillStyle = this._effectColor;
        this._ctx.save();
        this._ctx.translate(this._canvasDom.width / 2, this._canvasDom.height / 2);
        bData.forEach((value, index) => {
            this._ctx.save();
            this._ctx.rotate(angle * index);
            this._ctx.beginPath();
            const h = value / 256 * 60;
            this._ctx.roundRect(-4, 140, 4, (h < 4) ? 4 : h, 4);
            // 若上行的 roundRect 存在兼容性问题可以更换为下面注释的代码
            // this._ctx.fillRect(-4, 140,  4, (h < 4) ? 4 : h);
            this._ctx.fill();
            this._ctx.restore();
        });
        this._ctx.restore();
    }
}

console.log(props.auid);

function formatSong(song) {
    return song.substring(0, 4);
}

let reset = () => {};

defineExpose({
  reset
})

onMounted(() => {
  const musicPlayer = new MusicPlayer();
  reset = musicPlayer.reset;
});
</script>

<template>
 <div class="music-box">
    <canvas class="my-canvas"></canvas>
    <button :id="props.auid" class="my-music-btn rotate">{{ formatSong(props.song) }}</button>
  </div>
</template>

<style scoped>
  .music-box {
      position: absolute;
      top: 21vh;
      left: 0;
      right: 0;
      margin: auto;
      z-index: 1;
      width: 400px;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(.5);
  }

  .my-canvas {
      position: absolute;
      top: 0;
  }
  .my-music-btn {
      position: relative;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      border: none;
      outline: none;
      animation: music-btn-anim 20s infinite linear;
      color: #fff;
      font-size: 90px;
      font-family: cursive;
      background-color: transparent;
  }

  .my-music-btn.rotate {
      animation-play-state: paused;
  }

  @keyframes music-btn-anim {
      from {
          transform: rotate(0deg);
      }

      to {
          transform: rotate(360deg);
      }
  }
</style>
