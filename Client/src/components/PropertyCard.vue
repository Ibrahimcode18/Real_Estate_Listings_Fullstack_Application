<script setup>
import { Card } from 'ant-design-vue';
import { Tag } from 'ant-design-vue';
import { LikeOutlined, MessageOutlined, LikeFilled } from '@ant-design/icons-vue';
import { ref } from 'vue'

// Define what data this component EXPECTS to receive
    defineProps({
        title: String,
        location: String,
        price: String,
        listing_type: String,
        imageURL: String 
    })

</script>
<template>
    <a-card hoverable style="width: 300px">
        <template #cover>
            <img :alt="title" :src="imageURL || 'https://picsum.photos/300/200'" />
        </template>
        <a-card-meta :title="title">
            <template #description>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
                    <span style="color: #555;">
                        {{ location || 'Location unavailable' }}, England
                    </span>
                    <span 
                        v-if="listing_type" 
                        :style="{ color: listing_type === 'rent' ? 'green' : 'red' }"
                        style="font-size: 1.1rem; font-weight: bold;"
                    >
                        {{ listing_type === 'sale' ? 'For Sale' : 'To Rent' }}
                    </span>
                    <span style="font-size: 1.1rem; font-weight: bold; color: black;">
                        £{{ price ? price: '0' }}
                    </span>
                
                </div>
            </template>
        </a-card-meta>
    </a-card>
</template>