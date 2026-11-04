<script setup>
// Live treasury balance for the Steem DAO page.
// Client-side JSON-RPC to api.steemit.com (CORS: open). Renders the
// server-provided fallback until the fetch resolves; falls back permanently
// on error. A 10-minute localStorage cache keeps crawler traffic off the node.
import { ref, onMounted } from 'vue';

defineProps({
  fallback: { type: String, required: true }
});

const value = ref('');
const CACHE_KEY = 'steem-docs-dao-treasury';
const CACHE_MS = 10 * 60 * 1000;

onMounted(async () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && typeof cached.v === 'string' && Date.now() - cached.t < CACHE_MS) {
      value.value = cached.v;
      return;
    }
    const res = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_accounts',
        params: [['steem.dao']],
        id: 1
      })
    });
    const data = await res.json();
    const bal = data && data.result && data.result[0] && data.result[0].sbd_balance;
    if (typeof bal === 'string' && bal.includes('SBD')) {
      value.value = bal;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: bal }));
    }
  } catch {
    // network or RPC failure: keep the fallback text
  }
});
</script>

<template>
  <strong>{{ value || fallback }}</strong>
</template>
