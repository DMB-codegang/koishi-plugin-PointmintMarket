import { Context, Service, Session } from "koishi";

import 'koishi-plugin-pointmint'

import { name, logs } from './index'
import { Config } from './config'
import { market_database } from "./database";
import { MarketItem, MarketItemRegisterOptions, PluginFeedback, PurchaseResult } from "./types";

export class MarketService extends Service {
    static inject = ['points']
    static [Service.provide] = 'market'

    private cfg: Config
    private db: market_database
    private registerLock: boolean = false
    constructor(ctx: Context, cfg: Config) {
        super(ctx, 'market')
        this.cfg = cfg
        this.db = new market_database(ctx)
    }

    // 商品id和回调函数的映射
    private registeredCallbacks: Map<number, (session: Session) => Promise<boolean | PluginFeedback | string>> = new Map()

    // 注册商品
    async registerItem(pluginName: string, options: MarketItemRegisterOptions) {
        // 添加请求锁防止重复提交
        if (this.registerLock) {
            // 等待到锁释放
            while (this.registerLock) {
                await new Promise(resolve => setTimeout(resolve, 100))
            } 
        }
        this.registerLock = true
        // 检查是否有商品名与插件名都相同的商品，有的话判定为相同插件，仅进行更新
        const Items = await this.db.getAllMarketItem()
        const existingItem = Items.find(item => item.name == options.name && item.pluginName == pluginName)
        if (existingItem) {
            // 更新商品信息
            existingItem.image = options.image || null
            existingItem.registered = true
            await this.db.updateMarketItem([existingItem])
            this.registeredCallbacks.set(existingItem.id, options.onPurchase)
            logs.info(`插件 ${pluginName} 已更新商品 ${existingItem.name}`)
        } else {
            // 生成新的商品ID
            const newItemId = await this.db.getNewItemId()
            // 生成新的商品
            const newItem: MarketItem = {
                id: newItemId,
                name: options.name,
                description: options.description,
                tags: options.tags,
                price: options.price || 0,
                stock: 0,
                status: 'unavailable',
                registered: true,
                image: options.image,
                pluginName: pluginName,
            }
            // 添加到商品列表
            this.db.addMarketItem(newItem)
            this.registeredCallbacks.set(newItemId, options.onPurchase)
            logs.info(`插件 ${pluginName} 已注册商品 ${newItem.name}`)
        }
        // 释放请求锁
        this.registerLock = false
    }

    // 购买商品
    async purchaseItem(userId: string, itemId: number, session: Session): Promise<PurchaseResult> {
        // 获取商品信息
        const item = await this.db.getMarketItemById(itemId)
        if (!item) {
            return { success: false, message: '商品不存在' }
        }
        // 检查库存
        if (item.stock == 0) {
            return { success: false, message: '商品已售罄' }
        }
        // 生成交易ID
        const transactionId = this.ctx.points.generateTransactionId()
        // 获取购买回调
        const callback = this.registeredCallbacks.get(itemId)
        if (!callback) {
            await this.ctx.points.rollback(userId, transactionId, name)
            return { success: false, message: '商品回调函数未注册', item: item }
        }

        // 扣除积分
        const result = await this.ctx.points.reduce(userId, transactionId, item.price, name)
        if (result.code < 200 || result.code >= 300) {
            return { success: false, message: result.msg, item: item }
        }
        // 执行购买回调
        const callbackResult = await callback(session)
        if (typeof callbackResult === 'boolean') {
            if (!callbackResult) {
                // 购买失败，回滚积分
                await this.ctx.points.rollback(userId, transactionId, name)
                return { success: false, message: '购买失败', item: item }
            }
        } else if (typeof callbackResult === 'string') {
            // 购买失败，回滚积分
            await this.ctx.points.rollback(userId, transactionId, name)
            return { success: false, message: callbackResult, item: item }
        } else {
            if (callbackResult.code !== 0) {
                // 购买失败，回滚积分
                await this.ctx.points.rollback(userId, transactionId, name)
                return { success: false, message: callbackResult.msg, item: item }
            }
        }
        if (item.stock !== undefined || item.stock !== null) {
            item.stock--
        }
        return { success: true, message: '购买成功', transactionId: transactionId, item: item }
    }

    // 取消注册商品
    async unregisterItem(itemId: number) {
        // 从回调映射中删除对应的回调
        this.registeredCallbacks.delete(itemId)
        let item = await this.db.getMarketItemById(itemId)
        if (!item) {
            return
        }
        item.registered = false
        this.db.updateMarketItem([item])
    }

    // 取消注册某插件的所有商品
    async unregisterItems(pluginName: string) {
        const Items = await this.db.getAllMarketItem()
        const items = Items.filter(item => item.pluginName === pluginName)
        if (items.length === 0) {
            return
        }
        // 从回调映射中删除对应的回调
        for (const item of items) {
            this.registeredCallbacks.delete(item.id)
            item.registered = false
        }
        this.db.updateMarketItem(items)
        logs.info(`插件 ${pluginName} 已取消注册所有商品`)
    }

    // 删除某商品
    async deleteItemById(itemId: number) {
        // 从回调映射中删除对应的回调
        this.registeredCallbacks.delete(itemId)
        this.db.deleteMarketItem(itemId)
    }
}

declare module 'koishi' {
    interface Context {
        market: MarketService
    }
}