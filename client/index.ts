import { Context, icons } from '@koishijs/client'
import Page from './page.vue'
import icon from './assets/logo.vue'

icons.register('logo', icon)

export default (ctx: Context) => {

  ctx.page({
    name: '积分商城管理',
    path: '/item-market-admin',
    icon: 'logo',
    component: Page,
  })
}