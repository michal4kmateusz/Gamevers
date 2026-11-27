
<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) =>
      ['success', 'error', 'info', 'warning']
        .includes(value)
  },

  message: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: ''
  },

  dismissible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const notificationTitle = computed(() => {
  if (props.title) return props.title

  const titles = {
    success: 'Sukces',
    error: 'Błąd',
    info: 'Informacja',
    warning: 'Uwaga'
  }

  return titles[props.type]
})

const notificationIcon = computed(() => {
  const icons = {
    success: '✓',
    error: '!',
    info: 'i',
    warning: '!'
  }

  return icons[props.type]
})

function closeNotification() {
  emit('close')
}
</script>

<template>
  <div
    class="notification"
    :class="`notification--${type}`"
    :role="type === 'error' || type === 'warning'
      ? 'alert'
      : 'status'"
  >
    <div class="notification-icon" aria-hidden="true">
      {{ notificationIcon }}
    </div>

    <div class="notification-content">
      <strong class="notification-title">
        {{ notificationTitle }}
      </strong>

      <p class="notification-message">
        {{ message }}
      </p>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="notification-close"
      aria-label="Zamknij powiadomienie"
      @click="closeNotification"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.notification {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
  padding: 17px 18px;
  border: 1px solid;
  border-radius: 12px;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 800;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}

.notification-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.notification-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
}

.notification-close:hover {
  background: rgb(255 255 255 / 8%);
}

.notification-close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Sukces */
.notification--success {
  background: #10362B;
  border-color: #166534;
  color: #6EE7B7;
}

/* Błąd */
.notification--error {
  background: #3B1D29;
  border-color: #7F1D1D;
  color: #FCA5A5;
}

/* Informacja */
.notification--info {
  background: #172A42;
  border-color: #1D4ED8;
  color: #93C5FD;
}

/* Ostrzeżenie */
.notification--warning {
  background: #3A2B13;
  border-color: #92400E;
  color: #FCD34D;
}

@media (max-width: 600px) {
  .notification {
    padding: 14px;
    gap: 11px;
  }

  .notification-message {
    font-size: 12px;
  }
}
</style>
