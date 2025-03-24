import { Context, Service, Session} from "koishi";
import { randomUUID } from 'crypto';

import 'koishi-plugin-pointmint'

import { name, logs } from './index'
import { Config } from './config'
import { MarketItem } from "./types/index";
import { MarketItemRegisterOptions, PluginFeedback, PurchaseResult } from './types/services'

export class MarketService extends Service {
    static inject = ['points']
    static [Service.provide] = 'market'

    private cfg: Config
    constructor(ctx: Context, cfg: Config) {
        super(ctx, 'market')
        this.cfg = cfg
    }

    // 商品数据
    Items: MarketItem[] = []
    private registeredCallbacks: Map<string, (userId: string, username: string, session: Session) => Promise<boolean | PluginFeedback | string>> = new Map()

    async registerItem(pluginName: string, options: MarketItemRegisterOptions) {
        const itemId = options.id || randomUUID()
        this.registeredCallbacks.set(itemId, options.onPurchase)
        //如果有id重复的就删除旧的导入新的
        if (this.Items.find(item => item.id === itemId)) {
            this.Items = this.Items.filter(item => item.id !== itemId)
        }
        this.Items.push({
            id: itemId,
            name: options.name,
            description: options.description,
            price: options.price,
            pluginName: pluginName,
            image: options.image || undefined,
            tags: options.tags || undefined,
            stock: options.stock || undefined
        })
        logs.info(this.Items)
    }

    // 购买商品
    async purchaseItem(userId: string, itemId: string, session: Session): Promise<PurchaseResult> {
        // 获取商品信息
        const item = this.Items.find(item => item.id === itemId)
        if (!item) {
            return { success: false, message: '商品不存在' }
        }
        // 检查库存
        if ((item.stock !== undefined || item.stock !== null) && item.stock <= 0) {
            return { success: false, message: '商品已售罄' }
        }
        // 获取用户名
        const username = await this.ctx.points.getUserName(userId) || userId
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
        const callbackResult = await callback(userId, username, session)
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
        if (item.stock !== undefined || item.stock!== null) {
            item.stock--
        }
        return { success: true, message: '购买成功', transactionId: transactionId, item: item }
    }
}

declare module 'koishi' {
    interface Context {
        market: MarketService
    }
}