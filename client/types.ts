/** 市场商品项基础定义 */
export interface MarketItem {
    /** 商品唯一标识 */
    id: string
    /** 商品展示名称 (最大长度50字符) */
    name: string
    /** 商品描述 */
    description: string
    /** 商品价格 */
    price: number
    /** 提供该服务的插件名称 */
    pluginName: string
    /** 商品封面图URL (可选) */
    image?: string
    /** 商品标签 (用于搜索和过滤) */
    tags?: string[]
    /** 商品库存量 (undefined/unll表示不限库存) */
    stock?: number
}