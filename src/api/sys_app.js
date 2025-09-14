import http from "../utils/http.js";
import API from "../config/index.js";

export let find = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/find`,
    method: "get",
  });
};

export let views = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/views`,
    method: "get",
  });
};

export let folder = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/folder`,
    method: "get",
  });
}

export let config = () => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/config`,
    method: "get",
  });
};

export let update = (data) => {
  return http({
    url: `${API.BASE_API}/cms/sysApp/update`,
    method: "post",
    data,
  });
};
