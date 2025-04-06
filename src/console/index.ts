import { Context } from 'koishi'
import { logs } from '../index'
import { MarketItem } from '../types'
import { market_database } from '../database'

declare module '@koishijs/plugin-console' {
    interface Events {
      'get-Items'(): Promise<MarketItem[]>
      'save-Items'(items: MarketItem[]): void
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
        // db.getAllMarketItem()会返回一个Promise<MarketItem[]>
        this.ctx.console.addListener('save-Items', async (data) => {
            this.db.updateMarketItem(data)
        })
        this.ctx.console.addListener('delete-Item', (id: number) => {
          this.ctx.market.deleteItemById(id)
        })
    }
}