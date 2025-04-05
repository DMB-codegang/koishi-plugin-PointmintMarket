import { Context } from 'koishi'
import { logs } from '../index'
import { MarketItem } from '../types'
import { market_database } from '../database'



export class consoleData {
    private ctx: Context
    private db: market_database
    constructor(ctx: Context) {
        this.ctx = ctx
        this.db = new market_database(ctx)
    }

    init() {

    }
}