<template>
  <a-modal :open="open" :title="isEditing ? 'Update Location' : 'Add New Location'"
    :confirmLoading="isSubmitting" @ok="handleSubmit" @cancel="handleCancel"
    :okText="isEditing ? 'Save Changes' : 'Create Location'"
  >
    <a-form layout="vertical">
      <a-form-item label="City Name" required>
        <a-input v-model:value="form.city" />
      </a-form-item>
      
      <a-form-item label="Image URL">
        <a-input v-model:value="form.image_url" placeholder="https://example.com/image.jpg" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { API_BASE_URL } from '@/services/api';

const props = defineProps({
  open: Boolean,
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'saved'])
const isSubmitting = ref(false)
const form = reactive({ city: '', image_url: '' })

const isEditing = computed(() => !!props.initialData?.id)

watch(() => props.initialData, (newData) => {
  if (newData) {
    form.city = newData.city
    form.image_url = newData.image_url
  }
}, { immediate: true })

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    form.city = ''
    form.image_url = ''
  }
})

const handleCancel = () => {
  emit('update:open', false)
}

const handleSubmit = async () => {
  if (!form.city) {
    alert('City name is required.')
    return
  }

  isSubmitting.value = true
  
  const url = isEditing.value 
      ? `${API_BASE_URL}/api/v1/locations/${props.initialData.id}` 
      : `${API_BASE_URL}/api/v1/locations`
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      const savedLocation = await res.json()
      emit('saved', savedLocation, isEditing.value)
      handleCancel() 
    } else {
      const errorData = await res.json()
      alert(`Failed to save: ${errorData.message}`)
    }
  } catch (error) {
    console.error('Error saving:', error)
    alert('A network error occurred.')
  } finally {
    isSubmitting.value = false
  }
}
</script>