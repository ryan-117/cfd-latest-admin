import http from '../utils/http.js'
import API from '../config/index.js'

/**
 * @description 获取上传方式
 * @returns 获取上传方式 1本地上传 2七牛云
 */
export let getUploadWay = async () => {
  let res = await http({
    url: `${API.BASE_API}/cms/site/info`,
    method: 'get',
  })
  if (res.code === 200) {
    return res.data.uploadWay
  }
  return '1'
}

/**
 *
 * @param {*} data
 * @param {*} type 1-单图 2-多图 3-文件 4-多文件 5-logo上传 6-分页图片上传 7-合并图片
 */
export let upload = async (data, type = '1') => {
  let uploadWay = await getUploadWay()
  //本地上传
  if (uploadWay == '1') {
    if (type == '1') {
      return uploadImg(data)
    } else if (type == '2') {
      return uploadImgs(data)
    } else if (type == '3') {
      return uploadFile(data)
    } else if (type == '4') {
      return uploadFiles(data)
    } else if (type == '5') {
      return uploadLogo(data)
    } else if (type == '6') {
      return uploadChunk(data)
    } else if (type == '7') {
      return uploadMerge(data)
    }
    return
  }

  //七牛云上传
  if (uploadWay == '2') {
    return http({
      url: `${API.BASE_API}/cms/qiniu/upload`,
      method: 'post',
      headers: {
        'Content-type': 'multipart/form-data',
      },
      data: data,
    })
  }
}

/**
 * @description 上传单个图片
 * @param {*} data
 * @returns
 */
export let uploadImg = data => {
  return http({
    url: `${API.BASE_API}/base/upload/img`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 上传多个图片
 * @param {*} data
 * @returns
 */
export let uploadImgs = data => {
  return http({
    url: `${API.BASE_API}/base/upload/imgs`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 上传单个文件
 * @param {*} data
 * @returns
 */
export let uploadFile = data => {
  return http({
    url: `${API.BASE_API}/base/upload/file`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 上传多个文件
 * @param {*} data
 * @returns
 */
export let uploadFiles = data => {
  return http({
    url: `${API.BASE_API}/base/upload/files`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 上传logo
 * @param {*} data
 * @returns
 */
export let uploadLogo = data => {
  return http({
    url: `${API.BASE_API}/base/upload/logo`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 上传chunk
 * @param {*} data
 * @returns
 */
export let uploadChunk = data => {
  return http({
    url: `${API.BASE_API}/base/upload/chunk`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}

/**
 * @description 合并chunk
 * @param {*} data
 * @returns
 */
export let uploadMerge = data => {
  return http({
    url: `${API.BASE_API}/base/upload/merge`,
    method: 'post',
    headers: {
      'Content-type': 'multipart/form-data',
    },
    data: data,
  })
}
