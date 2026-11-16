<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData, withBase } from 'vitepress';

type ApiMethod = {
  full: string;
  short: string;
  api: string;
  link: string;
};

type SidebarItem = {
  link?: string;
  items?: SidebarItem[];
  apiMethod?: Omit<ApiMethod, 'link'>;
};

const messages: Record<string, { placeholder: string; clear: string; empty: string }> = {
  en: { placeholder: 'Filter API methods', clear: 'Clear method filter', empty: 'No matching API methods' },
  zh: { placeholder: '筛选 API 方法', clear: '清除方法筛选', empty: '没有匹配的 API 方法' },
  ru: { placeholder: 'Фильтр методов API', clear: 'Очистить фильтр методов', empty: 'Методы API не найдены' },
  fr: { placeholder: 'Filtrer les méthodes API', clear: 'Effacer le filtre des méthodes', empty: 'Aucune méthode API correspondante' },
  de: { placeholder: 'API-Methoden filtern', clear: 'Methodenfilter löschen', empty: 'Keine passenden API-Methoden' },
  it: { placeholder: 'Filtra i metodi API', clear: 'Cancella il filtro dei metodi', empty: 'Nessun metodo API corrispondente' },
  es: { placeholder: 'Filtrar métodos de API', clear: 'Borrar el filtro de métodos', empty: 'No hay métodos de API coincidentes' },
  ko: { placeholder: 'API 메서드 필터링', clear: '메서드 필터 지우기', empty: '일치하는 API 메서드가 없습니다' }
};

const { lang, theme } = useData();
const query = ref('');
const isFiltering = computed(() => query.value.trim().length > 0);
const copy = computed(() => messages[lang.value.split('-')[0]] ?? messages.en);

const methods = computed<ApiMethod[]>(() => {
  const found: ApiMethod[] = [];
  const seen = new Set<string>();
  const visit = (items: SidebarItem[]) => {
    for (const item of items) {
      if (item.apiMethod && item.link && !seen.has(item.link)) {
        seen.add(item.link);
        found.push({ ...item.apiMethod, link: item.link });
      }
      if (item.items) visit(item.items);
    }
  };
  visit(Array.isArray(theme.value.sidebar) ? theme.value.sidebar : []);
  return found;
});

const matches = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase();
  if (!needle) return [];
  return methods.value.filter((method) =>
    `${method.full} ${method.api}`.toLocaleLowerCase().includes(needle)
  );
});

function clear() {
  query.value = '';
}
</script>

<template>
  <div class="api-sidebar-filter" :data-active="isFiltering ? 'true' : 'false'">
    <div class="api-sidebar-filter-control" role="search">
      <svg class="api-sidebar-filter-search" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M8.5 2a6.5 6.5 0 1 0 3.98 11.65l4.43 4.44 1.42-1.42-4.44-4.43A6.5 6.5 0 0 0 8.5 2Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
      </svg>
      <input
        v-model="query"
        type="text"
        :placeholder="copy.placeholder"
        :aria-label="copy.placeholder"
        aria-controls="api-sidebar-filter-results"
        :aria-expanded="isFiltering"
        autocomplete="off"
        spellcheck="false"
        @keydown.esc="clear"
      />
      <button
        v-if="isFiltering"
        type="button"
        class="api-sidebar-filter-clear"
        :aria-label="copy.clear"
        :title="copy.clear"
        @click="clear"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="m5.05 3.64 5 5 5-5 1.41 1.41-5 5 5 5-1.41 1.41-5-5-5 5-1.41-1.41 5-5-5-5 1.41-1.41Z" />
        </svg>
      </button>
    </div>

    <div
      v-if="isFiltering"
      id="api-sidebar-filter-results"
      class="api-sidebar-filter-results"
    >
      <a
        v-for="method in matches"
        :key="method.full"
        class="api-sidebar-filter-result"
        :href="withBase(method.link)"
        :title="method.full"
        @click="clear"
      >
        <span class="api-sidebar-filter-result-api">{{ method.api }}</span>
        <span class="api-sidebar-filter-result-name">{{ method.short }}</span>
      </a>
      <p v-if="matches.length === 0" class="api-sidebar-filter-empty" role="status">
        {{ copy.empty }}
      </p>
    </div>
  </div>
</template>
