# 积分商城插件 (pointmintmarket)

[![npm](https://img.shields.io/npm/v/koishi-plugin-pointmintmarket?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pointmintmarket)

积分商城系统 - 为其他插件提供商品注册和购买功能，降低开发者的开发难度和提高用户的易用性。

> [!WARNING]
> 该插件仍处于开发阶段，接口可能会发生变化。

## 功能特点

- 统一的商品注册和管理接口
- 完整的商品购买流程（开发中）
- 灵活的商品分类和标签系统（开发中）
- 库存管理功能
- 购买记录追踪（开发中）
- 依赖于 pointmint 积分系统

## 使用方法

### 用户命令

- `商城` - 查看商城商品列表
- `兑换 <商品id>` - 兑换指定商品

### 开发者接入

#### 注册商品

```typescript
import { Context } from 'koishi'

export const inject = ['market']

export function apply(ctx: Context) {
  ctx.market.registerItem('your-plugin-name', {
    name: '测试商品',
    description: '这是一个测试商品',
    tags: ['测试', '示例'],
    onPurchase: async (userId, username, transactionId) => {
      // 处理购买逻辑
      await session.send(`用户 ${username} 购买了测试商品`)
      return true // 返回购买处理结果
    }
  })
}
```
