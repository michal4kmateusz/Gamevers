
<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <RouterLink to="/" class="footer-logo">
            GAME<span>VERS</span>
          </RouterLink>

          <p>
            Twój świat gier. Odkrywaj, oceniaj
            i buduj swoją bibliotekę.
          </p>
        </div>

        <nav class="footer-navigation" aria-label="Nawigacja stopki">
          <h3>Nawigacja</h3>
          <RouterLink to="/">Strona główna</RouterLink>
          <RouterLink to="/games">Katalog gier</RouterLink>
          <RouterLink to="/library">Moja biblioteka</RouterLink>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Gamevers. Projekt edukacyjny.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #111827;
  border-top: 1px solid #293244;
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 24px 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  padding-bottom: 40px;
}

.footer-brand {
  max-width: 340px;
}

.footer-logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
}

.footer-logo span {
  color: #8B5CF6;
}

.footer-brand p {
  margin-top: 16px;
  color: #94A3B8;
  line-height: 1.7;
  font-size: 14px;
}

.footer-navigation {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.footer-navigation h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.footer-navigation a {
  color: #94A3B8;
  font-size: 14px;
}

.footer-navigation a:hover {
  color: #8B5CF6;
}

.footer-bottom {
  border-top: 1px solid #293244;
  padding-top: 20px;
  text-align: center;
}

.footer-bottom p {
  color: #94A3B8;
  font-size: 13px;
  margin: 0;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    gap: 28px;
  }
}
</style>
