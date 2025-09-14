<template>
  <div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="18" :md="18" :lg="18" :xl="18">

        <div class="bg-fff pd-20 radius-6 flex justify-around flex-wrap mb-10">
          <p class="mb-12 f-16 c-000 w-full">
            <span class="mr-20">用户：<strong class="f-18 fw-600">{{ username }}</strong> </span>
            <!-- <span class="mr-10">{{ city }}：{{ ip }}</span> -->
          </p>
          <router-link to="/article">
            <div class="flex flex-col align-c">
              <div class="tj-img">
                <img src="@/assets/img/ico-article.svg?url" />
              </div>
              <p class="f-14 text-c mt-5 c-1d2129">文章内容</p>
              <p class="f-20 text-c flex justify-center items-center">
                <el-statistic class="mr-6 line-b fw-500" :value="data.article" />
                <sub class="mt-1 f-12">篇</sub>
              </p>
            </div>
          </router-link>

          <router-link to="/tag">
            <div class="flex flex-col align-c">
              <div class="tj-img">
                <img src="@/assets/img/ico-will.svg?url" />
              </div>
              <p class="f-12 text-c mt-5 c-1d2129">文章标签</p>
              <p class="f-20 text-c flex justify-center items-center">
                <el-statistic class="mr-6 line-b fw-500" :value="data.tag" />
                <sub class="mt-1 f-12">个</sub>
              </p>

            </div>
          </router-link>

          <router-link to="/message">
            <div>
              <div class="tj-img">
                <img src="@/assets/img/ico-message.svg?url" />
              </div>
              <p class="f-12 text-c mt-5 c-1d2129">留言信息</p>
              <p class="f-20 text-c flex justify-center items-center">
                <el-statistic class="mr-6 line-b fw-500" :value="data.message" />
                <sub class="mt-1 f-12">条</sub>
              </p>
            </div>
          </router-link>
          <div>
            <div class="tj-img">
              <img src="@/assets/img/ico-up.svg?url" />
            </div>
            <p class="f-12 text-c mt-5">七日更新</p>
            <p class="f-20 text-c flex justify-center items-center">
              <el-statistic class="mr-6 line-b fw-500" :value="data.week" />
              <sub class="mt-1 f-12">条</sub>
            </p>

          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script name="DashBoard" setup>

import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { runEnv, tongji } from './api/index.js';
import ChanEcharts from '@/components/ChanEcharts/index.vue';
import { getCookie } from '@/utils/tool';
import { useTransition } from '@vueuse/core'

const username = ref(getCookie('username'));
const city = ref(getCookie('city'));
const ip = ref(getCookie('ip'));
const data = reactive({
  week: 0,
  message: 0,
  tag: 0,
  article: 0,
  version: '',
  appName: 'CFD',
  port: '',
  versionTime: '',
  author: '',
});

useTransition(data.article, {
  duration: 1500,
})

const dirname = ref('');
const loading = ref(true);
const option = ref({
  title: {
    text: '架构',
    left: '20',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000'
    }
  },
  tooltip: {
    trigger: 'item',
    borderWidth: 0,
    backgroundColor: '#fff',
    textStyle: {
      color: '#000',
    },
  },
  legend: {
    orient: 'vertical',
    right: '20',
    icon: 'circle',
    top: 'middle',
  },
  toolbox: {
    x: 'right',
    y: 'bottom',
  },
  series: [
    {
      name: '技术占比',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      padAngle: 5,
      color: ['#FADC19', '#9FDB1D', '#00B42A', '#3491FA', '#165DFF', '#722ED1'],
      itemStyle: {
        borderRadius: 10,
        borderWidth: 0,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 10,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 40, name: 'nodejs' },
        { value: 10, name: 'mysql' },
        { value: 40, name: 'vue3' },
        { value: 90, name: 'javascript' },
        { value: 10, name: 'css3' },
        { value: 10, name: 'html5' },
      ],
    },
  ],
});

onMounted(async () => {
  await getTongji();
  await getRunEnv();
});

async function getTongji() {
  try {
    const res = await tongji();
    if (res.code === 200) {
      Object.assign(data, res.data);
      loading.value = false;
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function getRunEnv() {
  try {
    const res = await runEnv();
    if (res.code === 200) {
      dirname.value = res.data.dirname;
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      });
    }
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
.h-230 {
  height: 310px;
}

.c-9ca4bf {
  color: #9ca4bf;
}

.chanyue-title,
.chanyue-author,
.chanyue-txt {
  font-family: "chanyue";
}

.tj-img {
  width: 54px;
  height: 54px;
  background-color: #f2f3f5;
  border-radius: 50%;
}

.chart {
  max-width: calc(50vw - 45px);
  height: 300px;
}

@media only screen and (max-width: 992px) {
  .chart {
    max-width: calc(100vw - 45px);
    height: 300px;
  }
}
</style>