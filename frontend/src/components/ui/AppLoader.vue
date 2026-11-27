
<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: 'Ładowanie...'
  },

  description: {
    type: String,
    default: ''
  },

  size: {
    type: String,
    default: 'medium',
    validator: (value) =>
      ['small', 'medium', 'large'].includes(value)
  },

  fullPage: {
    type: Boolean,
    default: false
  }
})

const loaderClasses = computed(() => ({
  'loader--small': props.size === 'small',
  'loader--medium': props.size === 'medium',
  'loader--large': props.size === 'large',
  'loader--full-page': props.fullPage
}))
</script>

<template>
  <div
    class="loader"
    :class="loaderClasses"
    role="status"
    aria-live="polite"
  >
    <div
      class="loader-spinner"
      aria-hidden="true"
    ></div>

    <div class="loader-content">
      <strong class="loader-message">
        {{ message }}
      </strong>

      <p
        v-if="description"
        class="loader-description"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  width: 100%;
  box-sizing: border-box;
  padding: 40px 20px;
  text-align: center;
  color: #F8FAFC;
}

.loader-spinner {
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  border: 5px solid #293244;
  border-top-color: #8B5CF6;
  border-right-color: #22D3EE;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loader-message {
  font-size: 15px;
  font-weight: 700;
}

.loader-description {
  margin: 0;
  max-width: 340px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.loader--small {
  gap: 12px;
  padding: 20px 12px;
}

.loader--small .loader-spinner {
  width: 28px;
  height: 28px;
  border-width: 3px;
}

.loader--small .loader-message {
  font-size: 13px;
}

.loader--large {
  gap: 24px;
  padding: 65px 20px;
}

.loader--large .loader-spinner {
  width: 68px;
  height: 68px;
  border-width: 6px;
}

.loader--large .loader-message {
  font-size: 18px;
}

.loader--full-page {
  min-height: 65vh;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-spinner {
    animation: none;
    border-color: #8B5CF6;
    border-right-color: #293244;
  }
}

@media (max-width: 600px) {
  .loader {
    padding: 30px 16px;
  }

  .loader--full-page {
    min-height: 55vh;
  }
}
</style>
