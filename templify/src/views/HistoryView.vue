<template>
  <v-container fluid class="pa-4">
    <h1 class="text-h4 mb-4">변환 히스토리</h1>

    <!-- Loading indicator -->
    <div v-if="loading" class="d-flex justify-center align-center my-6">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <!-- Error message -->
    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
      히스토리를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
    </v-alert>

    <!-- Empty state -->
    <v-alert
      v-else-if="histories.length === 0"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      변환 히스토리가 없습니다.
    </v-alert>

    <!-- History data table -->
    <v-card v-else variant="outlined">
      <v-data-table
        :headers="headers"
        :items="processedHistories"
        :items-per-page="10"
        class="history-table"
        :sort-by="[{ key: 'createdDate', order: 'desc' }]"
      >
        <template #[`item.index`]="{ item }">
          <a @click="viewDetail(item.id)" class="clickable-cell">{{
            item.index
          }}</a>
        </template>

        <template #[`item.articleTitle`]="{ item }">
          <a @click="viewDetail(item.id)" class="clickable-cell">{{
            item.articleTitle
          }}</a>
        </template>

        <template #[`item.content`]="{ item }">
          <a
            @click="viewDetail(item.id)"
            class="clickable-cell text-truncate d-block"
          >
            {{ item.content }}
          </a>
        </template>

        <template #[`item.createdAt`]="{ item }">
          <span class="nowrap">{{ item.createdAt }}</span>
        </template>
      </v-data-table>
    </v-card>

    <!-- Back to Write button -->
    <div class="d-flex justify-center mt-6">
      <v-btn
        color="primary"
        size="large"
        min-width="180"
        class="px-6 text-uppercase"
        @click="goToWrite"
      >
        Back to Write
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService";

export default {
  name: "HistoryView",
  setup() {
    const router = useRouter();
    const histories = ref([]);
    const loading = ref(true);
    const error = ref(false);

    // Table headers
    const headers = [
      { title: "NO", key: "index", width: "60px", align: "center" },
      { title: "Template", key: "templateName", width: "120px" },
      { title: "Title", key: "articleTitle", width: "300px" },
      { title: "Content", key: "content" },
      {
        title: "Created At",
        key: "createdAt",
        width: "160px",
        align: "center",
        sortable: true,
      },
    ];

    // Format date to 'yyyy-mm-dd HH:MM:ss'
    const formatDate = (dateString) => {
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Process history data for display
    const processedHistories = computed(() => {
      // Sort histories by createdAt in descending order
      const sortedHistories = [...histories.value].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return sortedHistories.map((history, index) => ({
        index: index + 1,
        id: history.id,
        requestId: history.requestId,
        templateName: history.templateName,
        articleTitle: history.articleTitle,
        content: history.transformedText,
        originalText: history.originalText,
        createdAt: formatDate(history.createdAt),
        createdDate: new Date(history.createdAt), // Hidden field for sorting
      }));
    });

    // Fetch history data
    const fetchHistories = async () => {
      loading.value = true;
      error.value = false;

      try {
        const response = await apiService.get("/api/history/list");
        if (response.data && response.data.status === 200) {
          histories.value = response.data.data;
        } else {
          console.error("Invalid history data format:", response.data);
          error.value = true;
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    // Navigation
    const goToWrite = () => {
      router.push("/write");
    };

    // Navigate to detail view
    const viewDetail = (id) => {
      router.push(`/history/${id}`);
    };

    // Fetch data when component mounts
    onMounted(() => {
      fetchHistories();
    });

    return {
      histories,
      processedHistories,
      headers,
      loading,
      error,
      goToWrite,
      viewDetail,
    };
  },
};
</script>

<style scoped>
.history-table :deep(th) {
  font-weight: 600 !important;
  font-size: 0.95rem !important;
}

.history-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.history-table :deep(td) {
  max-width: 0;
  overflow: hidden;
}

.clickable-cell {
  cursor: pointer;
  color: inherit;
  text-decoration: none;
}

.clickable-cell:hover {
  color: var(--v-primary-base);
  text-decoration: underline;
}

.nowrap {
  white-space: nowrap;
}

/* Provide additional styling for mobile */
@media (max-width: 600px) {
  .history-table :deep(th:nth-child(2)),
  .history-table :deep(td:nth-child(2)) {
    max-width: 80px;
  }
}
</style>
