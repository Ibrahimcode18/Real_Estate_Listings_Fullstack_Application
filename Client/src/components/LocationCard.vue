<script setup>
import { Card } from 'ant-design-vue';
import { Tag } from 'ant-design-vue';
import { LikeOutlined, MessageOutlined, LikeFilled } from '@ant-design/icons-vue';
import { ref } from 'vue'

    const liked = ref(false);
// Define what data this component EXPECTS to receive
    defineProps({
        name: String,
        imageURL: String 
    })

</script>
<template>
    <a-card hoverable class="location-card">
        <template #cover>
            <div style="position: relative; height: 200px;">
                <img :alt="name" :src="imageURL || 'https://picsum.photos/300/200'" 
                    style="width: 100%; height: 100%; object-fit: cover;" 
                />
                <div class="location-name">
                    {{ name }}
                </div>
            </div>
        </template>
    </a-card>
</template>

<style scoped>
.location-card {
    width: 100%;
    max-width: 300px;
    overflow: hidden;
}

.location-name {
    position: absolute; 
    bottom: 0px; 
    text-align: center;
    width: 100%; 
    padding: 10px 15px; 
    color: white; 
    font-weight: bold; 
    font-size: 1.5rem;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}
</style>