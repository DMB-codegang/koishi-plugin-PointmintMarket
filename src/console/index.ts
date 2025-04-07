import { Context } from 'koishi'
import { resolve } from 'path'
import { logs } from '../index'
import { MarketItem } from '../types'
import { market_database } from '../database'

declare module '@koishijs/plugin-console' {
  interface Events {
    'get-Items'(): Promise<MarketItem[]>
    'save-Items'(items: MarketItem[]): void
    'swap-Items'(data: { id1: number, id2: number }): 'success' | 'failed'
    'delete-Item'(id: number): void
  }
}

export class consoleData {
  private ctx: Context
  private db: market_database
  constructor(ctx: Context) {
    this.ctx = ctx
    this.db = new market_database(ctx)
    this.init()
  }

  init() {
    this.ctx.console.addListener('get-Items', () => this.db.getAllMarketItem())

    this.ctx.console.addListener('save-Items', async (data) => {
      // 只保存部分数据
      const items = data.map((item) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          tags: item.tags,
          status: item.status,
        }
      })
      this.db.updateMarketItem(items)
    })

    this.ctx.console.addListener('swap-Items', (data) => {
      try {
        this.db.swapMarketItem(data.id1, data.id2)
        return 'success'
      } catch (error) {
        return 'failed' 
      }
    })

    this.ctx.console.addListener('delete-Item', (id: number) => {
      this.ctx.market.deleteItemById(id)
    })

    this.ctx.console.addEntry({
      dev: resolve(__dirname, '../../client/index.ts'),
      prod: resolve(__dirname, '../../dist'),
    })
  }
}