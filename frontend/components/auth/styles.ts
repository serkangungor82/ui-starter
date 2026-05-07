export const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

export const labelClass =
  "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

export const submitBtnClass =
  "mt-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

export const linkBtnClass =
  "font-semibold text-indigo-600 hover:underline dark:text-indigo-400";

/**
 * "Doğrula" yan butonu için stil — phone/email input'larının sağında.
 * Dar (px-3), input yüksekliğine yapışan, gri outline; verified state
 * (`data-verified="true"`) yeşile döner.
 */
export const verifyBtnClass =
  "shrink-0 inline-flex min-w-[110px] items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/40 data-[verified=true]:border-emerald-300 data-[verified=true]:bg-emerald-50 data-[verified=true]:text-emerald-700 dark:data-[verified=true]:border-emerald-900/40 dark:data-[verified=true]:bg-emerald-950/30 dark:data-[verified=true]:text-emerald-300";
