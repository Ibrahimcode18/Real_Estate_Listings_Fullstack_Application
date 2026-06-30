<template>
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <h1 style="margin-bottom: 30px;">Admin Dashboard</h1>

        <div v-if="loading" style="text-align: center; margin-top: 50px;">
            <a-spin size="large" />
            <p>Loading data...</p>
        </div>

        <div v-else>
            
            <TableCard 
                title="Pending Agent Requests" 
                :data="pendingAgents" 
                :columns="agentColumns" 
                themeColor="#faad14"
            >
                <template #action="{ record }">
                    <a-button type="primary" size="small" @click="handleApprove(record.id)">
                        Approve Agent
                    </a-button>
                </template>
            </TableCard>

            <TableCard 
                title="Approved Agents" 
                :data="approvedAgents" 
                :columns="agentColumns" 
                themeColor="#52c41a"
            >
                <template #action="{ record }">
                    <a-button type="primary" danger ghost size="small" @click="handleSuspend(record.id)">
                        Suspend
                    </a-button>
                </template>
            </TableCard>

            <TableCard 
                title="System Users" 
                :data="allUsers" 
                :columns="userColumns" 
                themeColor="#1890ff"
            />

        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import TableCard from '@/components/TableCard.vue';
    import { useUserStore } from '@/stores/user';
    import { useRouter } from 'vue-router';
    import { API_BASE_URL } from '@/services/api';

    const loading = ref(true);
    const rawAgents = ref([]);
    const allUsers = ref([]);
    const userStore = useUserStore();
    const router = useRouter();

    // Filter agents based on approval status
    const pendingAgents = computed(() => {
        if (!Array.isArray(rawAgents.value)) return [];
        return rawAgents.value.filter(agent => agent && (agent.is_approved === 0 || agent.is_approved === false));
    });

    const approvedAgents = computed(() => {
        if (!Array.isArray(rawAgents.value)) return [];
        return rawAgents.value.filter(agent => agent && (agent.is_approved === 1 || agent.is_approved === true));
    });

    const agentColumns = [
        { title: 'Agency Name', dataIndex: 'agency_name', key: 'agency_name' },
        { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
        { title: 'License No.', dataIndex: 'license_number', key: 'license_number' },
        { title: 'About', dataIndex: 'about', key: 'about', ellipsis: true },
        { title: 'Requested Date', dataIndex: 'created_at', key: 'created_at' },
        { title: 'Action', key: 'action' }
    ];

    const userColumns = [
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'First Name', dataIndex: 'first_name', key: 'first_name' },
        { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
        { title: 'Date Registered', dataIndex: 'date_registered', key: 'date_registered' }
    ];

    onMounted(async () => {
        if (userStore.user?.role !== 'admin') {
            alert("You are not authorised to access this page");
            router.push('/');
            return;
        }
        try {

            const agentsRes = await fetch(`${API_BASE_URL}/api/v1/agents`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (agentsRes.ok) {
                rawAgents.value = await agentsRes.json();
            }

            const usersRes = await fetch(`${API_BASE_URL}/api/v1/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (usersRes.ok) {
                allUsers.value = await usersRes.json();
            }

        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            loading.value = false;
        }
    });

    
    const handleApprove = async (agentId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/agents/${agentId}/approve`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const agent = rawAgents.value.find(a => a.id === agentId);
                if (agent) {
                    agent.is_approved = 1; 
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleSuspend = async (agentId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/agents/${agentId}/suspend`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const agent = rawAgents.value.find(a => a.id === agentId);
                if (agent) {
                    agent.is_approved = 0; 
                }
            } else if (res.status === 403) {
                const data = await res.json();
                alert(data.message);
            }
        } catch (e) { 
            console.error(e); 
        }
    };
</script>