import { Context, Logger, Schema } from 'koishi'

import { } from '@koishijs/plugin-console'
import { resolve } from 'path'

// 导入pointmint插件的类型声明
import { } from 'koishi-plugin-pointmint'

import { market_database } from './database'
import { MarketService } from './services'

import { registerCommands } from './command'
import { MarketItemRegisterOptions } from './types'
import { consoleData } from './console'
// 导入控制台类型定义
import { Config } from './config'
export * from './config'

export { MarketService }
export { MarketItemRegisterOptions }
export const name = 'pointmintmarket'
export const description = '积分商城系统 - 为其他插件提供商品注册和购买功能'

export const inject = {
  required: ['points', 'database', 'console']
}

export const logs = new Logger(name)

export function apply(ctx: Context, config: Config) {
  const db = new market_database(ctx)
  const cd = new consoleData(ctx)
  ctx.console.addEntry({
    dev: resolve(__dirname, '../client/index.ts'),
    prod: resolve(__dirname, '../dist'),
  })


  registerCommands(ctx, config)
  ctx.plugin(MarketService)
}