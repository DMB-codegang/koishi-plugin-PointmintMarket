import { Context, Logger } from 'koishi'

// 导入pointmint插件的类型声明
import { } from 'koishi-plugin-pointmint'

import { MarketService } from './services'
import { MarketItemRegisterOptions } from './types/services'
import { registerCommands } from './command'
import { Config } from './config'
export * from './config'

export { MarketService }
export { MarketItemRegisterOptions }
export const name = 'pointmintmarket'
export const description = '积分商城系统 - 为其他插件提供商品注册和购买功能'

export const inject = {
  required: ['points','database']
}

export const logs = new Logger(name)

export function apply(ctx: Context, config: Config) {
  registerCommands(ctx, config)
  ctx.plugin(MarketService)
  // logs.info('插件已加载')
}