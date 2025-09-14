
/**
 * @description: 权限指令
 * @param {Object} el 指令所绑定的元素
 * @param {Object} binding 指令所绑定的值
 * @param {Object} vnode 指令所绑定的虚拟节点
 * @returns {void}
 * @usage: 用法: <button v-permission="['admin']">仅管理员可见</button>
 * @usage: 特性: 无权限时直接从 DOM 移除，适合“重新登录生效”的场景
 */

export default {
  mounted(el, binding) {
    const userStr = sessionStorage.getItem('user');
    let role = '';
    try {
      role = JSON.parse(userStr)?.userInfo?.role || '';
    } catch (e) {
      console.warn('[v-permission-disabled] 用户信息解析失败', e);
    }
    let permissions = binding.value;
    const hasPermission = permissions.includes(role);
    if (!hasPermission) {
      setCSS(el);
    }
  },
};

// 禁用元素并绑定点击提示
function setCSS(el) {
  // 设置视觉样式
  el.style.display = 'none';
}