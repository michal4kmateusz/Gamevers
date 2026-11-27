
<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <div class="games-view">
    <div class="games-container">
      <div class="page-header">
        <h1>Odkrywaj gry</h1>
        <p>
          Przeglądaj katalog i znajdź
          swój kolejny ulubiony tytuł.
        </p>
      </div>

      <div class="filters">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Szukaj gier..."
          aria-label="Szukaj gier"
        />

        <select aria-label="Filtruj według gatunku">
          <option value="">Wszystkie gatunki</option>
        </select>

        <select aria-label="Sortuj gry">
          <option value="title">Nazwa A-Z</option>
          <option value="rating">Najwyżej oceniane</option>
          <option value="newest">Najnowsze</option>
        </select>
      </div>

      <section class="games-section">
        <h2>Katalog gier</h2>

        <div class="empty-state">
          <p>
            Gry pojawią się tutaj po
            podłączeniu API Laravel.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.games-view {
  min-height: 75vh;
  padding: 60px 24px;
}

.games-container {
  max-width: 1280px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 36px;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin-bottom: 12px;
}

.page-header p {
  color: #94A3B8;
  font-size: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 48px;
}

.filters input,
.filters select {
  width: 100%;
  padding: 14px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #F8FAFC;
  outline: none;
}

.filters input:focus,
.filters select:focus {
  border-color: #8B5CF6;
}

.games-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.empty-state {
  padding: 64px 24px;
  background: #151B2B;
  border: 1px dashed #293244;
  border-radius: 14px;
  text-align: center;
}

.empty-state p {
  color: #94A3B8;
  margin: 0;
}

@media (max-width: 768px) {
  .games-view {
    padding: 40px 16px;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
