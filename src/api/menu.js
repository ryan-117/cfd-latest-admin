import http from "../utils/http";
import API from "../config/index";

/**
 * @description 网站基本信息
 */
export let find = () => {
  return http({
    url: `${API.BASE_API}/cms/sysMenu/find`,
    method: "get",
  });
};

export let allRouter = () => {
  return http({
    url: `${API.BASE_API}/base/menu/allRouter`,
    method: "get",
  });
};

//更新基本信息
export let update = ({ id, content }) => {
  return http({
    url: `${API.BASE_API}/cms/sysMenu/update`,
    method: "post",
    data: {
      id,
      content,
    },
  });
};
