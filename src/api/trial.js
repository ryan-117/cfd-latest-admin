import http from "../utils/http.js";
import API from "../config/index.js";

//试用列表
export let search = (cur = 1) => {
  return http({
    url: `${API.BASE_API}/cms/trial/search?cur=${cur}&pageSize=20`,
    method: "get",
  });
};

//试用详情
export let detail = (id) => {
  return http({
    url: `${API.BASE_API}/cms/trial/detail?id=${id}`,
    method: "get",
  });
};

export let findField = (cid) => {
  return http({
    url: `${API.BASE_API}/cms/trial/findField?cid=${cid}`,
    method: "get",
  });
};

export let tongji = () => {
  return http({
    url: `${API.BASE_API}/cms/trial/tongji`,
    method: "get",
  });
};
