<template>
  <div class="bg-fff radius-6 pd-20">
    <el-tabs v-model="activeName" @tab-click="handleClick">

      <el-tab-pane label="基本设置" class="mt-20" name="first">
        <el-form ref="infoRef" :model="info" label-width="84px">
          <el-form-item label="网站名称" prop="name" :rules="[
            {
              required: true,
              message: '请输入网站名称',
              trigger: 'blur',
            },
            {
              min: 2,
              max: 20,
              message: '长度在 2 到 20 个字符',
              trigger: 'blur',
            },
          ]">
            <el-input v-model="info.name"></el-input>
          </el-form-item>

          <el-form-item label="Logo">
            <el-input v-model="info.logo"></el-input>
            <el-space class="mt-10">
              <el-upload class="avatar-uploader" :http-request="handleUpload" :show-file-list="false"
                :before-upload="beforeUpload">
                <el-popover placement="top-start" title="上传" :width="200" trigger="hover" content="上传图片作为封面图，大小200k内">
                  <template #reference>
                    <el-icon class="avatar-uploader-icon">
                      <MostlyCloudy />
                    </el-icon>
                  </template>
                </el-popover>
              </el-upload>
              <el-popover v-if="info.logo" placement="right" :width="600" trigger="hover">
              <template #reference>
                <el-image class="logo pointer ml-10" :src="info.logo" />
              </template>
              <el-image :src="info.logo" />
            </el-popover>
          </el-space>
          </el-form-item>

          <el-form-item prop="domain" label="网站域名">
            <el-input v-model="info.domain"></el-input>
          </el-form-item>
          <el-form-item prop="email" label="站长邮箱">
            <el-input v-model="info.email" :rules="[
      {
        type: 'email',
        message: '请输入正确的邮箱',
        trigger: ['blur', 'change'],
      },
    ]"></el-input>
          </el-form-item>
          <el-form-item prop="icp" label="ICP备案号">
            <el-input v-model="info.icp"></el-input>
          </el-form-item>
          <el-form-item prop="code" label="统计代码">
            <el-input type="textarea" :rows="3" v-model="info.code"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-permission-disabled="['editor','admin','super']"  @click="submit(infoRef)">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="SEO设置" class="mt-20" name="second">
        <el-form ref="seoRef" :model="seo" label-width="84px">
          <el-form-item label="标题" prop="title" :rules="[
      {
        required: true,
        message: '请输入网站标题',
        trigger: 'blur',
      },
      {
        min: 2,
        max: 20,
        message: '长度在 2 到 20 个字符',
        trigger: 'blur',
      },
    ]">
            <el-input v-model="seo.title"></el-input>
          </el-form-item>
          <el-form-item prop="keywords" label="关键词">
            <el-input v-model="seo.keywords"></el-input>
          </el-form-item>
          <el-form-item prop="description" label="描述" :rules="[
      {
        min: 2,
        max: 255,
        message: '字数限制255',
        trigger: 'blur',
      },
    ]">
            <el-input type="textarea" :rows="3" v-model="seo.description"></el-input>
          </el-form-item>
          <el-form-item >
            <el-button v-permission-disabled="['editor','admin','super']" type="primary" @click="submit(seoRef)">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <ConfigSet />

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getSiteInfo, update } from "./api/index.js";
import ConfigSet from "./components/config.vue";
import { upload } from "@/api/upload.js";

const activeName = ref('first');
const infoRef = ref(null);
const seoRef = ref(null);

const info = reactive({
  id: '',
  name: '',
  domain: '',
  logo: '',
  email: '',
  icp: '',
  code: ''
});

const seo = reactive({
  id: '',
  title: '',
  keywords: '',
  description: ''
});


async function query() {
  try {
    const res = await getSiteInfo();
    if (res.code === 200) {
      const { id, name, domain, logo, email, icp, title, keywords, description } = res.data;
      Object.assign(info, { id, name, logo, domain, email, icp });
      Object.assign(seo, { id, title, keywords, description });
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({ message: res.msg, type: 'warning' });
    }
  } catch (error) {
    console.error(error);
  }
}

const beforeUpload = (rawFile) => {
  if (rawFile.type.indexOf("image") === -1) {
    // eslint-disable-next-line no-undef
    ElMessage("上传文件只能是图片格式");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 0.2) {
    // eslint-disable-next-line no-undef
    ElMessage("上传图片必须小于200k");
    return false;
  }
  return true;
};

const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file.file);
  const response = await upload(formData,'5');
  if (response.code === 200) {
    info.logo = response.data.path;
  }
};

async function updateData(data) {
  try {
    const res = await update(data);
    if (res.code === 200) {
      // eslint-disable-next-line no-undef
      ElMessage({ message: '更新成功^_^', type: 'success' });
      await query();
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({ message: res.msg, type: 'warning' });
    }
  } catch (error) {
    console.error(error);
  }
}

function handleClick(tab) {
  activeName.value = tab.paneName;
}

function submit(formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      if (activeName.value === 'first') {
        await updateData(info);
      } else {
        await updateData(seo);
      }
    } else {
      console.log('error submit!!');
    }
  });
}

onMounted(query);
</script>

<style scoped>
.logo{
  width: 100%;
  max-width: 80px;
  height: auto;
}
</style>
