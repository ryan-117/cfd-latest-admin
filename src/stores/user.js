import { defineStore } from 'pinia'
import { allRouter } from '@/api/menu.js'
const modules = import.meta.glob('@/views/**/*.vue')
import { setCookie, removeCookie } from '@/utils/tool.js'
import { treeOneLevel} from '@/utils/tool.js'
export const userStore = defineStore('user', {
  state: () => ({
    token: '',
    role: '',
    menus:[],
    userInfo: null,
    menuList: [], //左侧菜单
  }),
  actions: {
    setToken(token) {
      setCookie('token', token)
      this.token = token
    },

    setMenus(menus) {
      this.menus = menus
    },

    setUserInfo(userInfo) {
      this.userInfo = userInfo
      setCookie('username', userInfo.username)
    },

    setRole(role) {
      this.role = role
    },

    async getMenuList() {
      try {
        let res = await allRouter()
        if(res.code == 200){
          const {perms,routers} = res.data;
        setCookie('perms',perms);
        routers.forEach(item => {
          item.meta = {
            title: item.title,
            icon: item.icon,
            isShow: item.is_show == '1'? true:false,
            perms: item.perms,
          }
          delete item.title
          delete item.icon
          delete item.is_show
          delete item.perms
        })
        this.menuList = dealRoute(treeOneLevel(routers));
        }

      } catch (error) {
        console.log(error)
      }
    },

    // 退出登录
    logout() {
      this.$reset();
      removeCookie('token')
      removeCookie('username')
    },
  },
  persist: {
    enabled: true, //开启
    strategies: [
      {
        key: 'user',
        storage: sessionStorage,
      },
    ],
  },
})

//更具接口返回的路由，动态加载组件
function dealRoute(routes) {
  let res = [] //递归的适合函数内部形成作用域，不影响这个
  routes.forEach(item => {
    if (item.component) {
      item.component = item.component.replace('@/', '/src/')
      item.component = modules[`${item.component}`]
    }
    res.push(item)
    if (item.children) {
      dealRoute(item.children)
    }
  })
  return res
}
