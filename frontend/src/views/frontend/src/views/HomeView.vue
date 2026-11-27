
<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">
          PORTAL GAMINGOWY
        </span>

        <h1>
          Twój świat.
          <span>Twoje gry.</span>
        </h1>

        <p>
          Odkrywaj nowe tytuły, oceniaj gry
          i buduj własną bibliotekę.
          Wszystko w jednym miejscu.
        </p>

        <RouterLink to="/games" class="hero-button">
          Odkryj gry
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 70vh;
}

.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  background:
    radial-gradient(
      ellipse at 50% 30%,
      rgba(139, 92, 246, 0.16),
      transparent 65%
    ),
    #0B0F19;
}

.hero-content {
  max-width: 800px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  margin-bottom: 24px;
  border: 1px solid #8B5CF6;
  border-radius: 30px;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.hero h1 {
  font-size: clamp(40px, 6vw, 76px);
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 24px;
}

.hero h1 span {
  display: block;
  color: #8B5CF6;
}

.hero p {
  max-width: 580px;
  margin: 0 auto 32px;
  color: #94A3B8;
  font-size: 18px;
  line-height: 1.8;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 28px;
  background: #8B5CF6;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  transition: background 0.2s;
}

.hero-button:hover {
  background: #7C3AED;
}

@media (max-width: 600px) {
  .hero {
    padding: 64px 20px;
  }

  .hero p {
    font-size: 16px;
  }
}
</style>
