import { Context } from 'koishi'

import { MarketItem } from './types/index'

export const MARKET_ITEMS_TABLE = 'market_items'
// export const PURCHASE_RECORDS_TABLE = 'market_purchases'

declare module 'koishi' {
    interface Tables {
        market_items: MarketItem
        // market_purchases: PurchaseRecord
    }
}

export class market_database {
    constructor(ctx: Context) {
        this.setupDatabase(ctx)
    }

    setupDatabase(ctx: Context) {
        // 商品表
        ctx.model.extend(MARKET_ITEMS_TABLE, {
            id: 'string',
            name: 'string',
            description: 'string',
            price: 'integer',
            image: 'string',
            tags: 'json',
            stock: 'integer',
        }, { primary: 'id' })

        // 购买记录表
        // ctx.model.extend(PURCHASE_RECORDS_TABLE, {
        //     id: 'string',
        //     userId: 'string',
        //     username: 'string',
        //     itemId: 'string',
        //     itemName: 'string',
        //     price: 'integer',
        //     purchaseTime: 'timestamp',
        //     transactionId: 'string',
        //     plugin: 'string',
        //     metadata: 'json',
        //     feedback: 'json'
        // }, { primary: 'id' })
    }

    async getMarketItemById(ctx: Context, id: string): Promise<MarketItem> {
        const items = await ctx.database.get(MARKET_ITEMS_TABLE, { id })
        return items[0]
    }
}



