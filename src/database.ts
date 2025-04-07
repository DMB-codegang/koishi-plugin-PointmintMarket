import { Context, Logger } from 'koishi'

import { MarketItem, PartialMarketItem } from './types/index'
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
    private lock: string[] = []

    private _itemsCache: MarketItem[] = []
    get Items(): MarketItem[] {
        return this._itemsCache
    }
    private async updateCache() {
        this._itemsCache = await this.ctx.database.select(MARKET_ITEMS_TABLE).execute()
    }

    // 用于确认数据库是否完成初始化
    private _initialized: boolean = false
    get initialized(): boolean {
        return this._initialized
    }

    constructor(ctx: Context) {
        this.ctx = ctx
        this.logs = logs
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
        this._initialized = true
    }

    async getNewItemId(): Promise<number> {
        await this.updateCache()
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
        await this.updateCache()
        const item = this._itemsCache.find(item => item.id == itemId)
        return item || null
    }

    async addMarketItem(item: MarketItem): Promise<void> {
        if (this._itemsCache.find(Items => Items.name === item.name && Items.pluginName === item.pluginName)) {
            logs.warn(`商品 ${item.name} 已存在`)
            return
        }
        await this.ctx.database.create(MARKET_ITEMS_TABLE, item)
        this.updateCache()
        return
    }

    // 交换两个商品的位置，id保持原位置
    async swapMarketItem(itemId1: number, itemId2: number): Promise<void> {
        const item1 = await this.getMarketItemById(itemId1)
        const item2 = await this.getMarketItemById(itemId2)
        if (!item1 || !item2) {
            logs.warn(`商品 ${item1} 或 ${item2} 不存在`)
            return
        }
        item1.id = itemId2
        item2.id = itemId1
        await this.updateMarketItem([item1, item2])
        return
    }

    // 将商品信息更新到数据库中
    async updateMarketItem(items: PartialMarketItem[]): Promise<void> {
        for (const item of items) {
            const { id, ...updateData } = item;
            await this.ctx.database.set(MARKET_ITEMS_TABLE, item.id, updateData)
        }
        this.updateCache()
        return
    }

    async deleteMarketItem(itemId: number, pluginName?: string): Promise<void> {
        if (pluginName) {
            await this.ctx.database.remove(MARKET_ITEMS_TABLE, { pluginName: pluginName })
        } else {
            await this.ctx.database.remove(MARKET_ITEMS_TABLE, { id: itemId })
        }
        this.updateCache()
        return
    }

    // 减少库存，需要使用内存锁
    async reduceStock(itemId: number): Promise<Boolean> {
        if (this.lock.includes(itemId.toString())) {
            while (this.lock.includes(itemId.toString())) {
                await new Promise(resolve => setTimeout(resolve, 10))
            }
        }
        this.lock.push(itemId.toString())
        const item = await this.getMarketItemById(itemId)
        if (!item) {
            logs.warn(`商品 ${itemId} 不存在`)
            this.lock = this.lock.filter(id => id !== itemId.toString())
            return false
        } 
        if (item.stock === undefined || item.stock === null || item.stock == -1) {
            logs.warn(`商品 ${itemId} 没有库存或库存设为了无限`)
            this.lock = this.lock.filter(id => id !== itemId.toString())
            return false
        }
        if (item.stock == 0) {
            logs.warn(`商品 ${itemId} 库存不足`)
            this.lock = this.lock.filter(id => id !== itemId.toString())
            return false
        }
        item.stock--
        await this.updateMarketItem([item])
        this.lock = this.lock.filter(id => id !== itemId.toString())
        return true
    }
}
