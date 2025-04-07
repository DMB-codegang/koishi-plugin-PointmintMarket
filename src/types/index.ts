import { Session } from "koishi";

/** 商品注册选项配置
 * @param name 商品名称
 * @param description 商品详细描述
 * @param price 商品价格
 * @param image 商品图片链接（可选）
 * @param tags 商品搜索关键词标签
 * @param onPurchase 购买回调函数
 */
export interface MarketItemRegisterOptions {
    name: string
    description?: string
    price?: number & { __brand: 'PositiveNumber' }
    image?: string & { __brand: 'URL' }
    tags?: string[]
    /** 
     * 购买回调函数
     * @param userId 购买用户ID
     * @param username 购买时用户名
     * @returns 返回boolean表示简单成功/失败，返回PluginFeedback可提供详细反馈
     */
    onPurchase: (session: Session) => Promise<boolean | PluginFeedback | string>
}

/** 插件操作反馈标准格式
 * @param code 状态码 (0表示成功)
 * @param msg 反馈消息内容
 */
export interface PluginFeedback {
    code: number
    msg: string
}

/** 购买商品返回的格式
 * @param success 是否购买成功
 * @param message 反馈消息内容
 * @param transactionId 交易ID (购买成功时返回)
 * @param item 商品信息 (购买成功时返回)
 */
export interface PurchaseResult {
    success: boolean
    message: string
    transactionId?: string
    item?: MarketItem
}

/** 市场商品项基础定义
 * @param id 商品唯一标识
 * @param name 商品名称
 * @param description 商品描述
 * @param tags 商品标签
 * @param price 商品价格
 * @param stock 商品库存
 * @param status 商品状态
 * @param registered 是否注册
 * @param pluginName 注册插件名称
 * @param image 商品封面图URL (可选)
 */
export interface MarketItem {
    id: number
    name: string
    description: string
    tags: string[]
    price: number
    stock: number
    status: 'available' | 'unavailable'
    registered: boolean
    pluginName: string
    image?: string
}

/** 市场商品项的全部非必选定义 */
export type PartialMarketItem = Partial<MarketItem>