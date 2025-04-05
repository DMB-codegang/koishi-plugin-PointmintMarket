<template>
    <k-layout>
        <k-card class="item-management">
            <el-table :data="items" border style="width: 100%">、
                <el-table-column type="index" label="商品ID" width="67"></el-table-column>
                <el-table-column prop="name" label="商品名称" width="150"></el-table-column>
                <el-table-column prop="description" label="商品介绍" width="230">
                    <template #default="scope">
                        <el-input v-model="scope.row.description" type="textarea"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="tags" label="标签" width="180">
                    <template #default="scope">
                        <el-input v-model="scope.row.tags" placeholder="多个标签以逗号分隔"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="176">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.price" :min="0" :precision="0"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="176">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.stock" :min="-1"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="上下架状态" width="120">
                    <template #default="scope">
                        <el-select v-model="scope.row.status" placeholder="请选择状态"
                            :disabled="scope.row.stock === 0 || scope.row.status === 'canceled'">
                            <el-option label="正常" value="available"></el-option>
                            <el-option label="下架" value="unavailable"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="商品状态" width="85">
                    <template #default="scope">
                        <div class="status-container">
                            <el-tag
                                :type="scope.row.stock === 0 || scope.row.registered === false ? 'danger' : scope.row.status === 'available' ? 'success' : 'warning'"
                                :effect="scope.row.stock === 0 || scope.row.registered === true ? 'dark' : scope.row.status === 'available' ? 'light' : 'plain'"
                                class="status-tag">
                                {{ scope.row.registered === false ? '未注册' : scope.row.stock === 0 ? '已售罄' : scope.row.status === 'available' ? '销售中' : '已下架' }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="saveItem(scope.row)">保存</el-button>
                        <el-button type="danger" size="small" @click="deleteItem(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </k-card>
    </k-layout>
</template>

<script>
import { send } from '@koishijs/client'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'


export default {
    setup() {
        const items = ref([])

        const fetchItems = async () => {
            try {
                const data = await send('get-Items')
                items.value = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    tags: item.tags,
                    registered: item.registered,
                    price: parseFloat(item.price),
                    stock: parseInt(item.stock),
                    status: item.status
                }))
                ElMessage.success('商品数据获取成功')
                console.log(items.value)
            } catch (error) {
                ElMessage.error('获取商品数据失败:' + error.message)
            }
        }

        // 组件挂载时获取数据
        onMounted(fetchItems)

        const saveItem = (item) => {
            try {
                // 确保status字段是合法的值
                if (!['available', 'unavailable'].includes(item.status)) {
                    item.status = 'unavailable'
                }
                send('save-Item', )
                ElMessage.success('商品已保存')
            } catch (error) {
                ElMessage.error('保存商品失败:' + error.message)
            }
        }

        const deleteItem = async (item) => {
            const confirm = await ElMessageBox.confirm('通常情况下应该通过停用对应插件来取消注册，请确定您清楚该操作的实际作用。确认删除该商品吗?', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning'
            })
            if (confirm == 'confirm') {
                try {
                    await send('delete-Item', item.id)
                    const index = items.value.findIndex(i => i.id === item.id)
                    items.value.splice(index, 1)
                    ElMessage.success('商品已删除')
                } catch (error) {
                    ElMessage.error('删除商品失败: ' + error.message)
                }
            }
        }

        return {
            items,
            saveItem,
            deleteItem
        }
    }
}
</script>

<style scoped>
.item-management {
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
}
</style>