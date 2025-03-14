<template>
  <v-container fluid class="fill-height pa-0">
    <v-row class="fill-height ma-0">
      <!-- Left side - Input section -->
      <v-col cols="12" md="6" class="pa-4 border-end d-flex flex-column">
        <h1 class="text-h4 mb-4">글 변환</h1>

        <v-form ref="form" v-model="valid" class="d-flex flex-column h-100">
          <!-- AI Model and Template selection in a row -->
          <v-row>
            <v-col cols="12" md="6" class="pb-2">
              <v-select
                v-model="selectedModel"
                :items="aiModels"
                label="Select AI Model"
                variant="outlined"
                :rules="[(v) => !!v || 'AI 모델을 선택해 주세요.']"
                required
                :disabled="isLoading"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6" class="pb-2">
              <v-select
                v-model="selectedTemplateId"
                :items="templates"
                item-title="name"
                item-value="id"
                label="Select Template"
                variant="outlined"
                :rules="[(v) => !!v || '템플릿을 선택해 주세요.']"
                :loading="templatesLoading"
                required
                :disabled="isLoading"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Subject input -->
          <v-text-field
            v-model="subject"
            label="Subject"
            variant="outlined"
            class="mb-4"
            :rules="[(v) => !!v || '제목을 입력해 주세요.']"
            required
            :disabled="isLoading"
          ></v-text-field>

          <!-- Original text input to fill available space -->
          <v-textarea
            v-model="originalText"
            label="Original Text"
            variant="outlined"
            :rules="[(v) => !!v || '변환이 필요한 원문을 입력해 주세요.']"
            class="flex-fill mb-6"
            style="min-height: 300px"
            required
            :disabled="isLoading"
          ></v-textarea>

          <!-- Transform and Write New buttons with centered alignment -->
          <div class="d-flex justify-center gap-4 mb-2">
            <v-btn
              color="primary"
              size="large"
              @click="transformText"
              :loading="isLoading"
              :disabled="!valid || isLoading"
              min-width="140"
              class="px-4 text-uppercase"
            >
              {{ isLoading ? "Transforming..." : "Transform" }}
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              @click="handleResetForm"
              min-width="140"
              class="px-4 text-uppercase"
            >
              Write New
            </v-btn>
          </div>
        </v-form>
      </v-col>

      <!-- Right side - Result section -->
      <v-col cols="12" md="6" class="pa-4 d-flex flex-column">
        <h1 class="text-h4 mb-4">변환 결과</h1>

        <!-- Result card that maintains fixed height relative to screen -->
        <div class="result-wrapper">
          <v-card
            class="result-card position-relative"
            variant="outlined"
            color="grey-lighten-4"
          >
            <!-- Loading overlay with different statuses - only show when process has started -->
            <div
              v-if="transformStatus !== 'idle' && transformStatus !== 'done'"
              class="loading-overlay"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="mt-4 text-primary">
                {{
                  transformStatus === "waiting"
                    ? "변환 대기 중입니다..."
                    : "변환 중입니다..."
                }}
              </div>
            </div>

            <v-card-text
              v-if="transformedText"
              class="result-text text-body-1 pa-4"
            >
              {{ transformedText }}
            </v-card-text>
            <v-card-text v-else class="placeholder-text text-body-1 pa-4">
              변환이 완료되면 여기에 변환 완료 결과물이 나타납니다.
            </v-card-text>
          </v-card>
        </div>

        <!-- Go to history button with centered alignment -->
        <div class="d-flex justify-center mt-6">
          <v-btn
            color="secondary"
            size="large"
            @click="goToHistory"
            min-width="180"
            class="px-6 text-uppercase"
          >
            Go to History
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService";

export default {
  name: "WriteView",
  setup() {
    const form = ref(null);
    const valid = ref(false);
    const isLoading = ref(false);
    const templatesLoading = ref(false);
    const router = useRouter();

    // Form inputs
    const selectedModel = ref("");
    const selectedTemplateId = ref("");
    const subject = ref("");
    const originalText = ref("");
    const transformedText = ref("");

    // Templates from API
    const templates = ref([]);

    // New polling variables
    const currentArticleId = ref(null);
    const pollingInterval = ref(null);
    const transformStatus = ref("idle"); // 'idle', 'waiting', 'processing', 'done'

    // AI Models
    const aiModels = [
      { title: "GPT-4", value: "gpt4" },
      // { title: "Claude 3", value: "claude3" },
      // { title: "Llama 3", value: "llama3" },
      // { title: "Mistral Large", value: "mistral" },
    ];

    // Fetch templates from API
    const fetchTemplates = async () => {
      templatesLoading.value = true;
      try {
        const response = await apiService.get("/api/write/template/list");
        if (
          response.data &&
          response.data.status === 200 &&
          response.data.data
        ) {
          templates.value = response.data.data;
        } else {
          console.error("Invalid template data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        templatesLoading.value = false;
      }
    };

    // Poll for article transformation status
    const pollArticleStatus = async () => {
      if (!currentArticleId.value) return;

      try {
        const response = await apiService.get(
          `/api/history/article/${currentArticleId.value}`
        );
        const articleData = response.data.data;

        if (!articleData.id) {
          // Transformation not yet initialized
          transformStatus.value = "waiting";
        } else if (articleData.tokenCount === -1) {
          // Transformation in progress
          transformStatus.value = "processing";
        } else {
          // Transformation complete
          transformStatus.value = "done";
          transformedText.value = articleData.transformedText;
          // Stop polling once complete
          clearInterval(pollingInterval.value);
          pollingInterval.value = null;
          isLoading.value = false;
        }
      } catch (error) {
        console.error("Error polling article status:", error);
      }
    };

    // Start polling
    const startPolling = (articleId) => {
      currentArticleId.value = articleId;
      transformStatus.value = "waiting";

      // Clear any existing interval
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
      }

      // Start immediately with first check
      pollArticleStatus();

      // Then set up the interval for every 5 seconds
      pollingInterval.value = setInterval(pollArticleStatus, 5000);
    };

    // Methods
    const transformText = async () => {
      const isValid = await form.value.validate();
      if (!isValid.valid) return;

      isLoading.value = true;
      transformStatus.value = "waiting";
      transformedText.value = "";

      const payload = {
        // model: selectedModel.value,
        templateId: selectedTemplateId.value,
        title: subject.value,
        content: originalText.value,
      };

      try {
        console.log("payload's templateId:", payload.templateId);
        const response = await apiService.post("/api/write/article", payload);

        // Instead of directly setting transformedText, start polling
        const articleId = response.data.data.id;
        if (articleId) {
          startPolling(articleId);
        } else {
          console.error("No article ID returned from API");
          isLoading.value = false;
        }
      } catch (error) {
        console.error("Transformation error:", error);
        isLoading.value = false;
      }
    };

    // Reset the form to start over with a new article
    const handleResetForm = () => {
      // Reset form inputs
      selectedModel.value = "";
      selectedTemplateId.value = "";
      subject.value = "";
      originalText.value = "";
      transformedText.value = "";

      // Reset status
      transformStatus.value = "idle";

      // Stop polling if in progress
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
      }

      // Reset article ID
      currentArticleId.value = null;

      // Reset loading state
      isLoading.value = false;

      // Reset form validation
      if (form.value) {
        form.value.reset();
      }
    };

    const goToHistory = () => {
      router.push("/history");
    };

    // Fetch templates when component is mounted
    onMounted(() => {
      fetchTemplates();
    });

    // Clean up interval when component is unmounted
    onBeforeUnmount(() => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
      }
    });

    return {
      valid,
      form,
      isLoading,
      templatesLoading,
      selectedModel,
      selectedTemplateId,
      subject,
      originalText,
      transformedText,
      aiModels,
      templates,
      transformText,
      handleResetForm,
      goToHistory,
      transformStatus,
    };
  },
};
</script>

<style scoped>
.border-end {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

@media (max-width: 960px) {
  .border-end {
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
}

/* Make textarea fill the available space */
.v-textarea :deep(.v-field__input) {
  min-height: 300px !important;
  height: 100% !important;
}

.v-textarea :deep(.v-field__field) {
  height: 100% !important;
}

/* Result wrapper and card with fixed height */
.result-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  max-height: calc(100vh - 230px);
}

.result-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-card .v-card-text {
  flex: 1;
  overflow-y: auto;
  max-height: 100%;
  white-space: pre-wrap;
}

/* Improved text styles for result area */
.result-text {
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 500 !important;
  line-height: 1.6 !important;
}

.placeholder-text {
  color: rgba(0, 0, 0, 0.7) !important;
  font-weight: 500 !important;
}

/* Loading overlay styles */
.position-relative {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.gap-4 {
  gap: 1rem;
}
</style>
