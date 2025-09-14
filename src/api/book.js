import http from "../utils/http.js";
import API from "../config/index.js";

//文章列表
export let search = (cur, keyword = "", cid = 0) => {
  return http({
    url: `${API.BASE_API}/cms/book/search?cur=${cur}&pageSize=20&keyword=${keyword}&cid=${cid}`,
    method: "get",
  });
};

//增
export let create = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/book/create`,
    method: "post",
    data: opt,
  });
};

//删
export let del = (id) => {
  return http({
    url: `${API.BASE_API}/cms/book/delete?id=${id}`,
    method: "get",
  });
};

//改
export let update = (opt) => {
  return http({
    url: `${API.BASE_API}/cms/book/update`,
    method: "post",
    data: opt,
  });
};

//文章详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/book/detail?id=${id}`,
    method: "get",
  });
};
