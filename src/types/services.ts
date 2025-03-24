
import { Context, Session } from "koishi";
import { MarketItem } from "./index";
/** 商品注册选项配置 */
export interface MarketItemRegisterOptions {
    /** 商品ID (可选，不填时自动生成UUID) */
    id?: string
    /** 商品名称 (必填) */
    name: string
    /** 商品详细描述 */
    description: string
    /** 基础定价 */
    price: number
    /** 商品展示图URL */
    image?: string
    /** 商品分类路径 */
    category?: string
    /** 搜索关键词标签 */
    tags?: string[]
    /** 初始库存设置 */
    stock?: number
    /** 自定义元数据 */
    metadata?: Record<string, any>
    /** 
     * 购买回调函数
     * @param userId 购买用户ID
     * @param username 购买时用户名
     * @returns 返回boolean表示简单成功/失败，返回PluginFeedback可提供详细反馈
     */
    onPurchase?: (userId: string, username: string, session: Session) => Promise<boolean | PluginFeedback | string>
}

/** 插件操作反馈标准格式 */
export interface PluginFeedback {
    /** 反馈状态码 (0表示成功) */
    code: number
    /** 反馈消息内容 */
    msg: string
}

export interface PurchaseResult {
    success: boolean
    message: string
    transactionId?: string
    item?: MarketItem
}