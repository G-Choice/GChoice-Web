import {createRouter, createWebHistory} from "vue-router";
import SideMenu from "../layouts/side-menu/Main.vue";
import TopMenu from "../layouts/top-menu/Main.vue";
import {isEmpty} from 'lodash';
import Login from "../views/login/Main.vue";
import ErrorPage from "../views/error-page/Main.vue";
import {AuthUtils} from "@/utils/localStorageUtils";
import store from "@/stores";
import Dashboard from "@/views/admin/Dashboard.vue";
import Category from "@/views/admin/Category.vue";
import Product from "@/views/admin/Product.vue";
import TrackOrder from "@/views/admin/TrackOrder.vue";
import Customer from "@/views/admin/CustomerManagement.vue";
const routes = [
  {
    path: "/shop",
    component: SideMenu,
    children: [
      {
        path: "",
        name: "base-menu",
        component: Dashboard,
        meta: {
          requiresAuth: false,
          id: 1
        },
      },
      {
        path: "category",
        name: "Category",
        component: Category,
        meta: {
          requiresAuth: false,
          id: 1
        },
      },
      {
        path: "product",
        name: "Product",
        component: Product,
        meta: {
          requiresAuth: false,
          id: 1
        },
      },
      {
        path: "order",
        name: "Order",
        component: TrackOrder,
        meta: {
          requiresAuth: false,
          id: 1
        },
      },
    ],
  },
  // {
  //   path: "/admin",
  //   component: SideMenu,
  //   children: [
  //     {
  //       path: "",
  //       name: "customer",
  //       component: Customer,
  //       meta: {
  //         requiresAuth: false,
  //         id: 1
  //       },
  //     }
  //   ]
  // },

  {
    path: '/station',
    component: TopMenu,
    children: [
      {
        path: '',
        name: 'customer',
        component: Customer,
        meta: {
          id: 0,
          requiresAuth: false
        }
      }
    ]
  },

  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/error-page",
    name: "error-page",
    component: ErrorPage,
  },
  {
    path: "/:pathMatch(.*)*",
    component: ErrorPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || {left: 0, top: 0};
  },
});

router.beforeEach(async (to, from, next) => {
  let token =  AuthUtils.getToken()
  let user = store.state.auth.user

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (token) {
    await store.dispatch('auth/getShopInfo', token)
    user = store.state.auth.user
  }

  if (!isEmpty(user)) {

    const hasAllPermissions = true

    if (!hasAllPermissions && to.path.startsWith('/admin')) {
      next({
        path: '/permission-page'
      });
      return;
    }
  }

  let checkMenu = true

  if (token && (to.path === '/login' || to.path === '/') && !isEmpty(user) && checkMenu) {
    next()
  } else if (!token && requiresAuth) {
    next({
      path: '/login'
    })
  } else if (token && requiresAuth && !checkMenu) {
    next({
      path: '/permission-page'
    })
  } else {
    next()
  }
})

export default router;
