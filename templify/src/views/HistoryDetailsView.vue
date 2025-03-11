<template>
  <v-container fluid class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          class="mr-2"
          @click="goBack"
        ></v-btn>
        <h1 class="text-h4">히스토리 상세</h1>
      </div>
      <v-btn
        icon
        color="primary"
        variant="text"
        @click="refreshHistoryDetails"
        :disabled="loading"
        :loading="loading"
        size="large"
      >
        <v-icon>mdi-refresh</v-icon>
        <v-tooltip activator="parent" location="bottom">
          히스토리 상세 정보 새로고침
        </v-tooltip>
      </v-btn>
    </div>

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
      히스토리 상세 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
    </v-alert>

    <!-- History details -->
    <div v-else-if="historyDetail">
      <!-- Metadata card -->
      <v-card class="mb-4" variant="outlined">
        <v-card-item>
          <v-card-title>변환 정보</v-card-title>
        </v-card-item>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <div class="text-subtitle-2 text-grey">템플릿</div>
              <div class="text-body-1 font-weight-medium">
                {{ historyDetail.templateName || "없음" }}
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-subtitle-2 text-grey">변환 날짜</div>
              <div class="text-body-1 font-weight-medium">
                {{ formatDate(historyDetail.transformedAt) }}
              </div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-subtitle-2 text-grey">토큰 수</div>
              <div class="text-body-1 font-weight-medium">
                {{ displayTokenCount(historyDetail.tokenCount) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Original text -->
      <v-card class="mb-4" variant="outlined">
        <v-card-item>
          <v-card-title>원본 텍스트</v-card-title>
        </v-card-item>
        <v-card-text>
          <div class="text-body-1 original-text">
            {{ historyDetail.originalText }}
          </div>
        </v-card-text>
      </v-card>

      <!-- Transformed text -->
      <v-card variant="outlined">
        <v-card-item>
          <v-card-title>변환 결과</v-card-title>
        </v-card-item>
        <v-card-text>
          <div v-if="isProcessing" class="text-body-1 processing-text">
            변환중...
          </div>
          <div v-else class="text-body-1 transformed-text">
            {{ historyDetail.transformedText }}
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Navigation buttons -->
    <div class="d-flex justify-center gap-4 mt-6">
      <v-btn
        color="secondary"
        size="large"
        min-width="180"
        class="px-6 text-uppercase"
        @click="goToHistoryList"
      >
        Back to History List
      </v-btn>

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
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import apiService from "@/services/apiService";

export default {
  name: "HistoryDetailsView",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const historyId = route.params.id;

    const historyDetail = ref(null);
    const loading = ref(true);
    const error = ref(false);

    // Computed property to check if transformation is still processing
    const isProcessing = computed(() => {
      return historyDetail.value && historyDetail.value.tokenCount === -1;
    });

    // Display token count properly
    const displayTokenCount = (tokenCount) => {
      if (tokenCount === -1) {
        return "계산중...";
      }
      return tokenCount || 0;
    };

    // Format date to 'yyyy-mm-dd HH:MM:ss'
    const formatDate = (dateString) => {
      if (!dateString) return "-";

      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Fetch history detail data
    const fetchHistoryDetail = async () => {
      loading.value = true;
      error.value = false;

      try {
        console.log(`Fetching history detail for ID: ${historyId}`);
        const response = await apiService.get(`/api/history/${historyId}`);

        if (response.data && response.data.status === 200) {
          historyDetail.value = response.data.data;
          console.log("History detail loaded:", historyDetail.value);
        } else {
          console.error("Invalid history detail data format:", response.data);
          error.value = true;
        }
      } catch (err) {
        console.error("Error fetching history detail:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const refreshHistoryDetails = () => {
      fetchHistoryDetail();
    };

    // Navigation
    const goBack = () => {
      router.back();
    };

    const goToHistoryList = () => {
      router.push("/history");
    };

    const goToWrite = () => {
      router.push("/write");
    };

    // Fetch data when component mounts
    onMounted(() => {
      console.log("HistoryDetailsView mounted, historyId:", historyId);
      if (!historyId) {
        console.error("No history ID provided");
        error.value = true;
        return;
      }

      fetchHistoryDetail();
    });

    return {
      historyDetail,
      loading,
      error,
      isProcessing,
      displayTokenCount,
      formatDate,
      goBack,
      goToHistoryList,
      goToWrite,
      refreshHistoryDetails,
    };
  },
};
</script>

<style scoped>
.original-text,
.transformed-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.transformed-text {
  font-weight: 500;
}

.processing-text {
  color: #1976d2;
  font-style: italic;
  font-weight: 500;
  font-size: 1.1rem;
}

.gap-4 {
  gap: 1rem;
}
</style>
