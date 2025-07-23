import { Context } from "koishi";
import { Config } from "./config";


export async function registerCommands(ctx: Context, config: Config) {
    switch (config.commandType) {
        case 'easy': {
            const shop = ctx.command('商城').alias('shop');
            shop.action(async ({ session }) => {
                switch (config.marketStyle) {
                    case 'text':
                        const items = ctx.market.Items;
                        let page = 1;
                        // 计算出总页数
                        const totalPages = Math.ceil(items.length / config.marketStyle_maxItemsPerPage);
                        // 计算出当前页的起始索引和结束索引
                        const startIndex = (page - 1) * config.marketStyle_maxItemsPerPage;
                        const endIndex = startIndex + config.marketStyle_maxItemsPerPage;
                        // 截取当前页的商品数据
                        const pageItems = items.slice(startIndex, endIndex);
                        // 构建商品列表字符串
                        let itemsString = ''
                        // 构建当前页商品的字符串
                        for (const item of pageItems) {
                            itemsString += `ID：${item.id}\n${item.name} - ${item.price}积分\n${item.description}\n`;
                        }
                        let marketString = config.marketStyleTextStyle;
                        marketString = marketString.replace('{items}', itemsString);
                        marketString = marketString.replace('{page}', page.toString());
                        marketString = marketString.replace('{totalPages}', totalPages.toString());
                        // 发送当前页的商品列表
                        await session.send(marketString);
                }
            })
            // 注册兑换指令
            const exchange = ctx.command('兑换 <id:number>').alias('exchange <id:string>');
            exchange.action(async ({ session }, id) => {
                if (!session.userId) return '无法识别您的id';
                const currentPoints = await ctx.points.get(session.userId);
                if (currentPoints < 0) return '您还没有积分账户，快去获得一些吧~'
                if (id == undefined) {
                    await session.send('请输入商品id');
                    const id = await session.prompt(60000)
                }
                const result = await ctx.market.purchaseItem(session.userId, id, session)
                if (!result.success) {
                    session.send(result.message)
                }
            })
        }
    }
}
