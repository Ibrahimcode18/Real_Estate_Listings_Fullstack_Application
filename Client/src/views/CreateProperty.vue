<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { UploadOutlined } from '@ant-design/icons-vue'; 

const router = useRouter();
const locations = ref([]); 
const loading = ref(true);

const fileList = ref([]); 
const imageFile = ref(null); 
const isSubmitting = ref(false);

const formState = reactive({
    location_id: null,
    title: '',
    description: '',
    price: null,
    listing_type: 'sale',
    image_url: '' 
});

const fetchLocations = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/locations');
        if (response.ok) {
            locations.value = await response.json();
        }
    } catch (error) {
        console.error('Network error fetching locations:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchLocations();
});

 
const beforeUpload = (file) => {
    fileList.value = [file]; 
    imageFile.value = file; 
    return false; 
};

const handleRemove = () => {
    fileList.value = [];
    imageFile.value = null;
};


const onSubmit = async () => {
    
    if (!imageFile.value) {
        alert("Please select a property image before submitting.");
        return;
    }

    isSubmitting.value = true;

    try {
        console.log("Starting Step 1: Uploading Image...");
        // Image Upload
        const formData = new FormData();
        formData.append('upload', imageFile.value); 

        const imageResponse = await fetch('http://localhost:3000/api/v1/images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!imageResponse.ok) throw new Error("Image upload failed.");
        
        const imageData = await imageResponse.json();
        const finalImageUrl = imageData.links.path;
        
        // Upload property fields
        console.log("Starting Step 2: Saving Property Data...");
        
        formState.image_url = finalImageUrl;
        const propertyResponse = await fetch('http://localhost:3000/api/v1/properties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formState)
        });

        if (propertyResponse.ok) {
            alert('Property listed successfully!');
            router.push('/'); 
        } else {
            const errorData = await propertyResponse.json();
            throw new Error(`Property saving failed: ${errorData.message}`);
        }

    } catch (error) {
        console.error("Submission Error:", error);
        alert(error.message || "An error occurred while creating the property.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div style="max-width: 600px; margin: 50px auto;">
        <a-card title="Create New Property Listing">
            
            <div v-if="loading" style="text-align: center; padding: 20px;">
                <a-spin size="large" tip="Loading locations..." />
            </div>

            <a-form v-else :model="formState" layout="vertical" @finish="onSubmit">
                
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Location" name="location_id" :rules="[{ required: true, message: 'Please select a location' }]">
                            <a-select v-model:value="formState.location_id" placeholder="Select a city">
                                <a-select-option v-for="loc in locations" :key="loc.id" :value="loc.id">
                                    {{ loc.name || loc.city }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Listing Type" name="listing_type" :rules="[{ required: true }]">
                            <a-select v-model:value="formState.listing_type">
                                <a-select-option value="sale">For Sale</a-select-option>
                                <a-select-option value="rent">For Rent</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="16">
                        <a-form-item label="Property Title" name="title" :rules="[{ required: true, message: 'Title is required' }]">
                            <a-input v-model:value="formState.title" placeholder="e.g., Beautiful 2-Bed Flat" :maxlength="62" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8">
                        <a-form-item label="Price (£)" name="price" :rules="[{ required: true, message: 'Price is required' }]">
                            <a-input-number v-model:value="formState.price" style="width: 100%" :min="0" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="Description" name="description" :rules="[{ required: true, message: 'Please add a description' }]">
                    <a-textarea v-model:value="formState.description" :rows="4" placeholder="Describe the property..." />
                </a-form-item>

                <a-form-item label="Property Image" required>
                    <a-upload
                        :file-list="fileList"
                        :before-upload="beforeUpload"
                        @remove="handleRemove"
                        :max-count="1"
                        accept="image/*"
                    >
                        <a-button>
                            <upload-outlined></upload-outlined>
                            Select Image
                        </a-button>
                    </a-upload>
                </a-form-item>

                <a-form-item style="margin-top: 24px;">
                    <a-button type="primary" html-type="submit" size="large" :loading="isSubmitting" block>
                        Create Property
                    </a-button>
                </a-form-item>
            </a-form>

        </a-card>
    </div>
</template>