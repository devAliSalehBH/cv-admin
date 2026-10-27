<script setup>
// AlinmaPay sends the browser back here after the admin pays on behalf of a client
// (same flow as the main app's /payment/result page): poll the order until the
// backend confirms it, then show the outcome.
const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();

useHead({ title: () => t('subscriptions.payment.title') });

const PENDING_ORDER_KEY = 'admin_pending_order_id';
const POLL_INTERVAL_MS = 3500;
const MAX_POLLS = 6;

const view = ref('checking'); // checking | completed | failed | timeout | missing
const order = ref(null);
let timer = null;
let cancelled = false;

const orderRef = () => {
  const q = route.query;
  const fromUrl = q.order_id || q.order || q.order_number;
  if (fromUrl) return String(fromUrl);
  try {
    return localStorage.getItem(PENDING_ORDER_KEY);
  } catch {
    return null;
  }
};

const poll = async (orderId, attempt) => {
  const res = await useApi().get(`admins/manage-subscriptions/orders/${encodeURIComponent(orderId)}/status`);
  if (cancelled) return;

  if (res?.success && res.data) {
    order.value = res.data;
    if (res.data.status === 'completed') {
      try {
        localStorage.removeItem(PENDING_ORDER_KEY);
      } catch {}
      view.value = 'completed';
      return;
    }
    if (res.data.status === 'failed') {
      view.value = 'failed';
      return;
    }
  } else if (res?.code === 404) {
    view.value = 'missing';
    return;
  }

  if (attempt + 1 >= MAX_POLLS) {
    view.value = 'timeout';
    return;
  }
  timer = setTimeout(() => poll(orderId, attempt + 1), POLL_INTERVAL_MS);
};

const start = () => {
  clearTimeout(timer);
  const orderId = orderRef();
  if (!orderId) {
    view.value = 'missing';
    return;
  }
  view.value = 'checking';
  poll(orderId, 0);
};

onMounted(() => {
  cancelled = false;
  start();
});
onBeforeUnmount(() => {
  cancelled = true;
  clearTimeout(timer);
});

const failureReason = computed(() => order.value?.payment_failed_reason || route.query.message || t('subscriptions.payment.failedDesc'));

const money = (n) =>
  new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
</script>

<template>
  <div class="result-wrap">
    <div class="result-card" role="status" aria-live="polite">
      <template v-if="view === 'checking'">
        <v-progress-circular indeterminate color="#2C85FE" size="52" width="4" />
        <h1 class="result-title">{{ $t('subscriptions.payment.checkingTitle') }}</h1>
        <p class="result-desc">{{ $t('subscriptions.payment.checkingDesc') }}</p>
      </template>

      <template v-else-if="view === 'completed'">
        <div class="result-icon result-icon--success"><CvIcon name="check" :size="30" :stroke-width="2.5" /></div>
        <h1 class="result-title">{{ $t('subscriptions.payment.successTitle') }}</h1>
        <p class="result-desc">{{ $t('subscriptions.payment.successDesc', { name: order?.client_name || '' }) }}</p>
        <dl v-if="order" class="result-details">
          <div>
            <dt>{{ $t('subscriptions.payment.client') }}</dt>
            <dd>{{ order.client_name }}</dd>
          </div>
          <div>
            <dt>{{ $t('subscriptions.payment.orderNumber') }}</dt>
            <dd dir="ltr">{{ order.order_number }}</dd>
          </div>
          <div>
            <dt>{{ $t('subscriptions.form.plan') }}</dt>
            <dd>{{ order.plan_title }}</dd>
          </div>
          <div>
            <dt>{{ $t('subscriptions.payment.amountPaid') }}</dt>
            <dd>{{ money(order.amount_paid || order.total_price) }}</dd>
          </div>
        </dl>
        <v-btn class="cv-btn cv-btn--dark px-8" variant="flat" :to="localePath('/subscriptions')">
          {{ $t('subscriptions.payment.back') }}
        </v-btn>
      </template>

      <template v-else-if="view === 'failed'">
        <div class="result-icon result-icon--error"><CvIcon name="x" :size="28" :stroke-width="2.5" /></div>
        <h1 class="result-title">{{ $t('subscriptions.payment.failedTitle') }}</h1>
        <p class="result-desc">{{ failureReason }}</p>
        <v-btn class="cv-btn cv-btn--dark px-8" variant="flat" :to="localePath('/subscriptions')">
          {{ $t('subscriptions.payment.back') }}
        </v-btn>
      </template>

      <template v-else-if="view === 'timeout'">
        <div class="result-icon result-icon--warn"><CvIcon name="clock" :size="28" :stroke-width="2" /></div>
        <h1 class="result-title">{{ $t('subscriptions.payment.timeoutTitle') }}</h1>
        <p class="result-desc">{{ $t('subscriptions.payment.timeoutDesc') }}</p>
        <v-btn class="cv-btn cv-btn--dark px-8" variant="flat" @click="start">
          {{ $t('subscriptions.payment.checkAgain') }}
        </v-btn>
        <NuxtLink :to="localePath('/subscriptions')" class="result-link">{{ $t('subscriptions.payment.back') }}</NuxtLink>
      </template>

      <template v-else>
        <div class="result-icon result-icon--muted"><CvIcon name="alert" :size="28" :stroke-width="2" /></div>
        <h1 class="result-title">{{ $t('subscriptions.payment.missingTitle') }}</h1>
        <p class="result-desc">{{ $t('subscriptions.payment.missingDesc') }}</p>
        <v-btn class="cv-btn cv-btn--dark px-8" variant="flat" :to="localePath('/subscriptions')">
          {{ $t('subscriptions.payment.back') }}
        </v-btn>
      </template>
    </div>
  </div>
</template>

<style scoped>
.result-wrap {
  display: flex;
  justify-content: center;
  padding-top: 80px;
}

.result-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 48px 40px;
  text-align: center;
  background: var(--color-bg);
  border: 1.16px solid var(--color-stroke);
  border-radius: 39.4px;
  box-shadow: var(--shadow-container);
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon--success {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-text);
}

.result-icon--error {
  background: var(--color-status-red-bg);
  color: var(--color-error);
}

.result-icon--warn {
  background: #fef0c7;
  color: #b54708;
}

.result-icon--muted {
  background: var(--color-status-black-bg);
  color: var(--color-text-sec);
}

.result-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: var(--color-text-pri);
  margin: 0;
}

.result-desc {
  font-size: 18px;
  line-height: 26px;
  color: var(--color-text-sec);
  margin: 0;
}

.result-details {
  width: 100%;
  margin: 0;
  padding: 16px 20px;
  background: var(--color-gray-bg);
  border-radius: var(--radius-16);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-details > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 15px;
}

.result-details dt {
  color: var(--color-text-sec);
}

.result-details dd {
  margin: 0;
  color: var(--color-text-header);
  font-weight: 500;
}

.result-link {
  font-size: 14px;
  color: var(--color-text-sec);
}
</style>
