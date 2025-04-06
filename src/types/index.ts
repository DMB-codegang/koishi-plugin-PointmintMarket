import { Session } from "koishi";

/** 商品注册选项配置 */
export interface MarketItemRegisterOptions {
    /** 商品名称 (必填) */
    name: string
    /** 商品详细描述 */
    description?: string
    /** 默认价格 */
    price?: number
    /** 商品图片链接 */
    image?: string
    /** 搜索关键词标签 */
    tags?: string[]
    /** 
     * 购买回调函数
     * @param userId 购买用户ID
     * @param username 购买时用户名
     * @returns 返回boolean表示简单成功/失败，返回PluginFeedback可提供详细反馈
     */
    onPurchase: (session: Session) => Promise<boolean | PluginFeedback | string>
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

/** 市场商品项基础定义 */
export interface MarketItem {
    /** 商品唯一标识 */
    id: number
    /** 商品展示名称 (最大长度50字符) */
    name: string
    /** 商品描述 */
    description: string
    /** 商品价格 */
    price: number
    /** 商品库存量 (undefined/unll表示不限库存) */
    stock: number
    /** 商品状态 */
    // available: 正常销售
    // soldout: 已售罄
    // unavailable: 不可售
    // canceled: 被取消注册
    status: 'available' | 'unavailable'
    /** 是否注册 */
    registered: boolean
    /** 提供该服务的插件名称 */
    pluginName: string
    /** 商品封面图URL (可选) */
    image?: string
    /** 商品标签 (用于搜索和过滤) */
    tags?: string[]
}