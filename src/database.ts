import { Context, Logger } from 'koishi'

import { MarketItem } from './types/index'
import { logs } from './index'

declare module 'koishi' {
    interface Tables {
        market_items: MarketItem
    }
}

export const MARKET_ITEMS_TABLE = 'market_items'

export class market_database {
    private ctx: Context
    private logs: Logger
    private _itemsCache: MarketItem[] = []

    constructor(ctx: Context) {
        this.ctx = ctx
        this.logs = logs
        this.setupDatabase()
    }
    async setupDatabase() {
        try {
            this.ctx.model.extend(MARKET_ITEMS_TABLE, {
                id: 'integer',
                name: 'string',
                description: 'string',
                price: 'integer',
                status: 'string',
                registered: 'boolean',
                image: 'string',
                tags: 'json',
                stock: 'integer',
                pluginName: 'string',
            }, { primary: 'id' })
        } catch (error) {
            this.logs.warn(`设置数据库表时出错: ${error.message}`)
        }
    }

    async getNewItemId(): Promise<number> {
        try {
            if (this._itemsCache.length === 0) return 1
            return this._itemsCache[this._itemsCache.length - 1].id + 1
        } catch (error) {
            this.logs.warn(`获取最新商品ID时出错: ${error.message}`)
            return 1
        }
    }

    async getAllMarketItem(): Promise<MarketItem[]> {
        return this.ctx.database.select(MARKET_ITEMS_TABLE).execute()
    }

    async getMarketItemById(itemId: number): Promise<MarketItem | null> {
        const item = this._itemsCache.find(item => item.id === itemId)
        return item || null
    }

    async addMarketItem(item: MarketItem): Promise<void> {
        await this.ctx.database.create(MARKET_ITEMS_TABLE, item)
        return
    }

    // 将商品信息更新到数据库中
    async updateMarketItem(items: MarketItem[]): Promise<void> {
        for (const item of items) {
            const { id, ...updateData } = item;
            await this.ctx.database.set(MARKET_ITEMS_TABLE, item.id, updateData)
        }
        return
    }

    async deleteMarketItem(itemId: number, pluginName?: string): Promise<void> {
        if (pluginName) {
            await this.ctx.database.remove(MARKET_ITEMS_TABLE, { pluginName: pluginName })
        } else {
            await this.ctx.database.remove(MARKET_ITEMS_TABLE, { id: itemId })
        }
        return
    }
}
