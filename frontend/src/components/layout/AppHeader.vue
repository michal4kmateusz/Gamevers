
<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <RouterLink to="/" class="logo">
        GAME<span>VERS</span>
      </RouterLink>

      <nav class="navigation" aria-label="Nawigacja główna">
        <RouterLink to="/">Strona główna</RouterLink>
        <RouterLink to="/games">Gry</RouterLink>
        <RouterLink to="/library">Moja biblioteka</RouterLink>
      </nav>

      <RouterLink to="/login" class="login-button">
        Zaloguj się
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: #111827;
  border-bottom: 1px solid #293244;
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

.logo span {
  color: #8B5CF6;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 28px;
}

.navigation a {
  color: #94A3B8;
  font-size: 14px;
  font-weight: 500;
}

.navigation a:hover,
.navigation a.router-link-active {
  color: #F8FAFC;
}

.login-button {
  background: #8B5CF6;
  color: white;
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.login-button:hover {
  background: #7C3AED;
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .navigation {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
