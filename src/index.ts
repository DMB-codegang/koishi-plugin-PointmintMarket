import { Context, Logger, Schema } from 'koishi'

import { } from '@koishijs/plugin-console'
import { resolve } from 'path'

// 导入pointmint插件的类型声明
import { } from 'koishi-plugin-pointmint'

import { market_database, MARKET_ITEMS_TABLE } from './database'
import { MarketService } from './services'
import { MarketItem } from './types'
import { MarketItemRegisterOptions } from './types/services'
import { registerCommands } from './command'
import { } from './console'
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

declare module '@koishijs/plugin-console' {
  interface Events {
      'get-Items'(): Promise<MarketItem[]>
      'save-Item'(items: MarketItem): void
      'delete-Item'(id: number): void
  }
}

export function apply(ctx: Context, config: Config) {
  const db = new market_database(ctx)
  db.setupDatabase()

  ctx.console.addListener('get-Items', () => db.getAllMarketItem())
  // db.getAllMarketItem()会返回一个Promise<MarketItem[]>
  ctx.console.addListener('save-Item', async (data) => {
    // data为单个MarketItem，将该商品信息更新到Items中
    const itemId = data.id
    const Items = await db.getAllMarketItem()
    const registeredItem = Items.find(item => item.id === itemId)
    if (registeredItem) {
      registeredItem.name = data.name
      registeredItem.description = data.description
      registeredItem.tags = data.tags
      registeredItem.price = data.price
      registeredItem.stock = data.stock
      registeredItem.status = data.status
      // 回写
      db.updateMarketItem([registeredItem])
    }
  })
  ctx.console.addListener('delete-Item', (id: number) => {
    ctx.market.deleteItemById(id)
  })
  ctx.console.addEntry({
    dev: resolve(__dirname, '../client/index.ts'),
    prod: resolve(__dirname, '../dist'),
  })

  registerCommands(ctx, config)
  ctx.plugin(MarketService)
}