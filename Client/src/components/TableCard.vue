<template>
    <a-card :title="title" :style="{ marginBottom: '30px', borderColor: themeColor }">
        <a-table 
            :dataSource="data" 
            :columns="columns" 
            rowKey="id" 
            :pagination="{ pageSize: 5 }"
        >
            <template #bodyCell="{ column, record }">
                
                <template v-if="column.key === 'created_at' || column.key === 'date_registered'">
                    {{ formatDate(record[column.dataIndex]) }}
                </template>

                <template v-else-if="column.key === 'role'">
                    <a-tag :color="record.role === 'admin' ? 'purple' : 'blue'">
                        {{ record.role || 'user' }}
                    </a-tag>
                </template>

                <template v-else-if="column.key === 'action'">
                    <slot name="action" :record="record"></slot>
                </template>

            </template>
        </a-table>
    </a-card>
</template>

<script setup>
    defineProps({
        title: { type: String, required: true },
        data: { type: Array, required: true },
        columns: { type: Array, required: true },
        themeColor: { type: String, default: '#d9d9d9' }
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
    };
</script>