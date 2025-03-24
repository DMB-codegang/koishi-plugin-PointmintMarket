# 积分商城插件 (pointmintmarket)

[![npm](https://img.shields.io/npm/v/koishi-plugin-pointmintmarket?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-pointmintmarket)

积分商城系统 - 为其他插件提供商品注册和购买功能，显著降低开发者的开发难度和提高用户的易用性。

## 功能特点

- 统一的商品注册和管理接口
- 完整的商品购买流程
- 灵活的商品分类和标签系统
- 库存管理功能
- 购买记录追踪
- 与 pointmint 积分系统无缝集成

## 安装方法

```bash
npm install koishi-plugin-pointmintmarket
```

## 使用方法

### 用户命令

- `商城.列表 [分类]` - 查看商品列表，可选按分类筛选
  - `-t <标签>` - 按标签筛选
  - `-min <价格>` - 设置最低价格
  - `-max <价格>` - 设置最高价格
  - `-p <插件>` - 按插件筛选
- `商城.详情 <商品ID>` - 查看商品详情
- `商城.购买 <商品ID>` - 购买商品
- `商城.分类` - 查看所有商品分类
- `商城.标签` - 查看所有商品标签
- `商城.记录` - 查看个人购买记录

### 开发者接口

#### 注册商品

```typescript
import { Context } from 'koishi'

export function apply(ctx: Context) {
  // 注册一个简单的商品
  ctx.market.registerItem('your-plugin-name', {
    name: '测试商品',
    description: '这是一个测试商品',
    price: 100,
    category: '测试分类',
    tags: ['测试', '示例'],
    stock: 10,
    onPurchase: async (userId, username, transactionId) => {
      // 处理购买逻辑
      ctx.logger('your-plugin').info(`用户 ${username} 购买了测试商品`)
      return true // 返回购买处理结果
    }
  })
}
```

#### 更新商品

```typescript
const itemId = 'your-item-id'
ctx.market.updateItem('your-plugin-name', itemId, {
  price: 150,
  stock: 5
})
```

#### 删除商品

```typescript
ctx.market.removeItem('your-plugin-name', 'your-item-id')
```

#### 获取商品列表

```typescript
// 获取所有商品
const allItems = await ctx.market.getItems()

// 按条件筛选商品
const filteredItems = await ctx.market.getItems({
  category: '特定分类',
  tags: ['特定标签'],
  minPrice: 50,
  maxPrice: 200
})
```

#### 获取商品详情

```typescript
const item = await ctx.market.getItemById('item-id')
```

## 示例插件

以下是一个完整的示例插件，展示如何使用积分商城：

```typescript
import { Context } from 'koishi'

export const name = 'example-market-plugin'

export function apply(ctx: Context) {
  // 注册一个虚拟物品
  const itemId = ctx.market.registerItem('example-market-plugin', {
    name: 'VIP会员(1天)',
    description: '购买后获得1天VIP会员资格',
    price: 500,
    category: 'VIP特权',
    tags: ['会员', '特权'],
    stock: 999,
    onPurchase: async (userId, username, transactionId) => {
      // 这里实现购买后的逻辑，例如给用户添加VIP角色
      try {
        // 记录用户的VIP到期时间
        const now = new Date()
        const expireTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1天后
        
        // 假设你有一个存储VIP信息的数据库表
        await ctx.database.upsert('vip_users', [
          {
            userId,
            expireTime,
            transactionId
          }
        ])
        
        // 通知用户
        const user = await ctx.database.getUser(userId)
        if (user?.platform && user?.channelId) {
          await ctx.bots[user.platform].sendPrivateMessage(user.channelId, 
            `恭喜您成功购买VIP会员！有效期至：${expireTime.toLocaleString()}`
          )
        }
        
        return true
      } catch (error) {
        ctx.logger('example-plugin').error(`处理VIP购买失败: ${error}`)
        return false
      }
    }
  })
  
  ctx.logger('example-plugin').info(`已注册商品: ${itemId}`)
  
  // 你也可以注册更多不同类型的商品
}
```

## 依赖

- koishi: ^4.18.3
- koishi-plugin-pointmint: 需要安装并启用

## 许可证

MIT
