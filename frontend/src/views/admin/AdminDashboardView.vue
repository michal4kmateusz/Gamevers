
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// Dane demonstracyjne.
// Później zastąpią je statystyki z API Laravel.
const stats = ref([
  {
    label: 'Gry w katalogu',
    value: 24,
    icon: '🎮'
  },
  {
    label: 'Użytkownicy',
    value: 128,
    icon: '👥'
  },
  {
    label: 'Recenzje',
    value: 56,
    icon: '⭐'
  },
  {
    label: 'Do moderacji',
    value: 3,
    icon: '📋'
  }
])


const modules = [
  {
    title: 'Zarządzanie grami',
    description: 'Dodawanie, edycja i usuwanie gier.',
    icon: '🎮',
    path: '/admin/games'
  },
  {
    title: 'Moderacja recenzji',
    description: 'Przeglądanie i moderowanie opinii graczy.',
    icon: '⭐',
    path: null
  }
]
  
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <header class="page-header">
        <p class="eyebrow">GAMEVERS ADMIN</p>
        <h1>Panel administratora</h1>
        <p>
          Zarządzaj katalogiem gier i treściami
          społeczności Gamevers.
        </p>
      </header>

      <section class="stats-section">
        <h2>Statystyki portalu</h2>

        <div class="stats-grid">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
          >
            <span class="stat-icon" aria-hidden="true">
              {{ stat.icon }}
            </span>

            <strong>{{ stat.value }}</strong>
            <span class="stat-label">{{ stat.label }}</span>
          </article>
        </div>
      </section>

      <section class="modules-section">
        <h2>Zarządzanie portalem</h2>

        <div class="modules-grid">
          <article
            v-for="module in modules"
            :key="module.title"
            class="module-card"
          >
            <span class="module-icon" aria-hidden="true">
              {{ module.icon }}
            </span>

            <h3>{{ module.title }}</h3>
            <p>{{ module.description }}</p>

            <span class="coming-soon">
              Moduł w przygotowaniu
            </span>
          </article>
        </div>
      </section>

      <p class="demo-notice">
        Panel korzysta z danych demonstracyjnych.
        Dostęp administratora i operacje zarządzania
        zostaną zabezpieczone po stronie Laravel.
      </p>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 75vh;
  padding: 60px 24px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 48px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin-bottom: 12px;
}

.page-header > p:last-child {
  color: #94A3B8;
  line-height: 1.7;
}

.stats-section,
.modules-section {
  margin-bottom: 48px;
}

.stats-section h2,
.modules-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.stat-icon {
  font-size: 26px;
}

.stat-card strong {
  font-size: 36px;
  color: #F8FAFC;
}

.stat-label {
  color: #94A3B8;
  font-size: 14px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.module-card {
  padding: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.module-icon {
  display: block;
  font-size: 28px;
  margin-bottom: 18px;
}

.module-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
}

.module-card p {
  color: #94A3B8;
  line-height: 1.7;
  margin-bottom: 24px;
}

.coming-soon {
  display: inline-block;
  padding: 10px 14px;
  background: #222039;
  border-radius: 8px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 600;
}

.demo-notice {
  padding-top: 24px;
  border-top: 1px solid #293244;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 40px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 400px) {
  .stat-card {
    padding: 16px;
  }

  .stat-card strong {
    font-size: 28px;
  }
}
</style>
