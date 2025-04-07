<template>
    <k-layout>
        <template #header>
            <div class="custom-header">
                <h2>商品管理</h2>
                <div class="header-actions">
                    <el-button class="refresh-data-btn" type="primary" size="small" @click="fetchItems">刷新数据</el-button>
                </div>
            </div>
        </template>

        <k-card class="item-management">
            <el-table :data="items" border style="width: 100%" key="items-table">
                <el-table-column type="index" label="商品ID" width="67"></el-table-column>
                <el-table-column prop="name" label="商品名称" width="120"></el-table-column>
                <el-table-column prop="pluginName" label="来自插件" width="150"></el-table-column>
                <el-table-column prop="description" label="商品介绍" width="230">
                    <template #default="scope">
                        <el-input v-model.lazy="scope.row.description" type="textarea"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="tags" label="标签" width="180">
                    <template #default="scope">
                        <el-input v-model.lazy="scope.row.tags" placeholder="多个标签以逗号分隔"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="176">
                    <template #default="scope">
                        <el-input-number v-model.lazy="scope.row.price" :min="0" :precision="0"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存" width="176">
                    <template #default="scope">
                        <el-input-number v-model.lazy="scope.row.stock" :min="-1"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="上下架状态" width="120">
                    <template #default="scope">
                        <el-switch v-model.lazy="scope.row.status" active-value="available" inactive-value="unavailable"
                            :disabled="scope.row.stock === 0 || scope.row.registered === false" active-text="上架"
                            inactive-text="下架" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #e6a23c" />
                    </template>
                </el-table-column>
                <el-table-column label="商品状态" width="85">
                    <template #default="scope">
                        <div class="status-container">
                            <el-tag
                                :type="scope.row.stock === 0 || scope.row.registered === false ? 'danger' : scope.row.status === 'available' ? 'success' : 'warning'"
                                :effect="scope.row.stock === 0 || scope.row.registered === true ? 'dark' : scope.row.status === 'available' ? 'light' : 'plain'"
                                class="status-tag">
                                {{ scope.row.registered === false ? '未注册' : scope.row.stock === 0 ? '已售罄' :
                                    scope.row.status === 'available' ? '销售中' : '已下架' }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="info" size="small" :disabled="scope.$index === 0"
                            @click="moveItem(scope.row, 'up')">
                            ↑
                        </el-button>
                        <el-button type="info" size="small" :disabled="scope.$index === items.length - 1"
                            @click="moveItem(scope.row, 'down')">
                            ↓
                        </el-button>
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
                    pluginName: item.pluginName,
                    tags: item.tags,
                    registered: item.registered,
                    price: parseFloat(item.price),
                    stock: parseInt(item.stock),
                    status: item.status
                }))
                ElMessage.success('商品数据获取成功')
            } catch (error) {
                ElMessage.error('获取商品数据失败:' + error.message)
            }
        }

        // 组件挂载时获取数据
        onMounted(fetchItems)

        const saveItem = (item) => {
            try {
                item.tags = typeof item.tags === 'string'
                    ? item.tags.split(',').map(tag => tag.trim())
                    : Array.isArray(item.tags)
                        ? item.tags
                        : []
                item.price = parseFloat(item.price)
                item.stock = parseInt(item.stock)
                send('save-Items', [item])
                ElMessage.success('商品已保存')
                // 更新商品数据
                const index = items.value.findIndex(i => i.id === item.id)
                items.value[index] = item
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

        const moveItem = (item, direction) => {
            try {
                const currentIndex = items.value.findIndex(i => i.id === item.id)
                const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

                if (targetIndex < 0 || targetIndex >= items.value.length) return

                // 保存目标项的ID
                const targetItemId = items.value[targetIndex].id

                // 交换本地数据
                const temp = items.value[currentIndex]
                items.value[currentIndex] = items.value[targetIndex]
                items.value[targetIndex] = temp

                // 发送交换请求
                send('swap-Items', {
                    id1: item.id,
                    id2: targetItemId
                }).then(() => {
                    fetchItems()
                }).catch((error) => {
                    // 如果请求失败，恢复本地数据
                    const temp = items.value[currentIndex]
                    items.value[currentIndex] = items.value[targetIndex]
                    items.value[targetIndex] = temp
                    ElMessage.error('调整商品位置失败: ' + error.message)
                })
            } catch (error) {
                ElMessage.error('调整商品位置失败: ' + error.message)
            }
        }

        return {
            items,
            fetchItems,
            saveItem,
            deleteItem,
            moveItem
        }
    }
}
</script>

<style scoped>
@font-face {
    font-family: 'Aa偷吃可爱长大的';
    src: url('./AaCute.ttf');
    font-weight: normal;
    font-style: normal;
}

.item-management {
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    font-family: 'Aa偷吃可爱长大的'; /* 应用自定义字体 */
}

/* 添加自定义 header 样式 */
.custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    width: 100%; /* 确保占满整个宽度 */
    font-family: 'Aa偷吃可爱长大的'; /* 应用自定义字体 */
}

.custom-header h2 {
    margin: 0; /* 移除标题默认边距 */
    font-size: 18px; /* 调整标题大小 */
    font-family: 'Aa偷吃可爱长大的'; /* 应用自定义字体 */
}

/* 为表格内容应用字体 */
:deep(.el-table) {
    font-family: 'Aa偷吃可爱长大的';
}

.header-actions {
    margin-left: auto; /* 确保按钮靠右 */
    display: flex;
    gap: 8px;
}

.refresh-data-btn {
    font-family: 'Aa偷吃可爱长大的';
}

/* 调整按钮禁用和启用状态的样式 */
:deep(.el-button.is-disabled) {
    opacity: 0.5;
    background-color: #8d8d8d;
}

:deep(.el-button--info) {
    background-color: #909399;
}
</style>