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
          ></v-textarea>

          <!-- Transform button with centered alignment -->
          <div class="d-flex justify-center mb-2">
            <v-btn
              color="primary"
              size="large"
              @click="transformText"
              :loading="isLoading"
              :disabled="!valid || isLoading"
              min-width="180"
              class="px-6 text-uppercase"
            >
              Transform
            </v-btn>
          </div>
        </v-form>
      </v-col>

      <!-- Right side - Result section -->
      <v-col cols="12" md="6" class="pa-4 d-flex flex-column">
        <h1 class="text-h4 mb-4">변환 결과</h1>

        <!-- Result card that fills available space -->
        <v-card
          class="flex-fill mb-6"
          variant="outlined"
          color="grey-lighten-4"
        >
          <v-card-text
            v-if="transformedText"
            class="result-text text-body-1 h-100"
          >
            {{ transformedText }}
          </v-card-text>
          <v-card-text v-else class="placeholder-text text-body-1 h-100">
            변환이 완료되면 여기에 변환 완료 결과물이 나타납니다.
          </v-card-text>
        </v-card>

        <!-- Go to history button with centered alignment to match Transform button -->
        <div class="d-flex justify-center mb-2">
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
import { ref, onMounted } from "vue";
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

    // Methods
    const transformText = async () => {
      const isValid = await form.value.validate();
      if (!isValid.valid) return;

      isLoading.value = true;

      const payload = {
        // model: selectedModel.value,
        templateId: selectedTemplateId.value,
        title: subject.value,
        content: originalText.value,
      };

      try {
        console.log("payload's templateId:", payload.templateId);
        const response = await apiService.post("/api/write/article", payload);
        transformedText.value = response.data.data.transformedContent;
      } catch (error) {
        console.error("Transformation error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const goToHistory = () => {
      router.push("/history");
    };

    // Fetch templates when component is mounted
    onMounted(() => {
      fetchTemplates();
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
      goToHistory,
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

/* Make result card content fill available space */
.v-card.flex-fill :deep(.v-card-text) {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* Improved text styles for result area */
.result-text {
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 500 !important;
  line-height: 1.6 !important;
  white-space: pre-wrap;
}

.placeholder-text {
  color: rgba(0, 0, 0, 0.7) !important;
  font-weight: 500 !important;
}
</style>
