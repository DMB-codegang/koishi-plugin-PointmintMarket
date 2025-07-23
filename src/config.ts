import { Schema } from 'koishi'

export interface Config {
  // 基本设置
  commandType: string
  // 交易设置
  /** 购买时先操作积分还是先操作积分 */
  purchaseOrder: string
  // 基本样式设置
  marketStyleDefaultError: string
  // 积分商城样式选择
  marketStyle: string
  marketStyle_maxItemsPerPage: number
  marketStyleTextStyle?: string
  marketStylePlugin?: string
  marketStylePlugin_marketName?: string
  // 调试设置
  /** 是否启用调试日志 */
  debug?: boolean
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    commandType: Schema.union([
      Schema.const('easy').description('简单模式，使用`积分商城`和`兑换`命令'),
      Schema.const('interactive').disabled().description('交互模式，使用指令`积分商城`进入后通过交互选择并兑换商品'),
    ]).default('easy').description('选择使用哪种命令模式'),
  }).description('基本设置'),
  Schema.object({
    purchaseOrder: Schema.union([
      Schema.const('points-first').description('先扣除积分，再兑换商品'),
      Schema.const('item-first').description('先兑换商品，再扣除积分'),
    ]).description('购买时先操作积分还是先操作积分'),
  }),
  Schema.object({
    marketStyleDefaultError: Schema.string().default('未知错误').description('未知错误时的默认提示，使用`{code}`表示错误码，`{msg}`表示错误信息'),
  }).description('基本样式设置'),
  Schema.object({
    marketStyle_maxItemsPerPage: Schema.number().default(3).min(1).description('单页最大商品数量'),
    marketStyle: Schema.union([
      Schema.const('text').description('使用纯文本输出商品信息'),
      Schema.const('plugin').disabled().experimental().description('使用其他插件输出商品信息'),
    ]).default('text').description('选择输出积分商城的商品信息的方式'),
  }).description('积分商城个性化设置'),
  Schema.union([
    Schema.object({
      marketStyle: Schema.const('text').required(),
    }),
    Schema.object({
      marketStyle: Schema.const('text'),
      marketStyleTextStyle: Schema.string().role('textarea', { rows: [4, 3] })
        .default('【积分商城】\n {items} \n 当前为{page}页，共{totalPages}页 \n up上一页，down下一页，回复其他退出')
        .description('选择输出积分商城的商品信息的文本样式，使用`{items}`表示商品信息，`{page}`表示当前页数，`{totalPages}`表示总页数'),
    }),
    Schema.object({
      marketStyle: Schema.const('plugin'),
      marketStylePlugin: Schema.union([]).description('选择输出积分商城的商品信息的插件'),
      marketStylePlugin_marketName: Schema.string().description('商城的名称'),
    }),
  ]),

  Schema.object({
    debug: Schema.boolean().default(false).description('是否启用调试日志'),
  }).description('调试设置'),
])