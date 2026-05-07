export { unreachable } from "./lib/helpers/exceptions/unreachable";
export { formatCurrency } from "./lib/helpers/format/format-currency";
export { formatDuration } from "./lib/helpers/format/format-duration";
export {
  formatFullName,
  formatNameInitials,
} from "./lib/helpers/format/format-owner/format-owner.fn";
export { formatPhoneNumber } from "./lib/helpers/format/format-phone-number/format-phone-number.fn";
export { formatToStringArray } from "./lib/helpers/format/format-string-array/format-string-array.fn";
export { formatZodError } from "./lib/helpers/format/format-zod-error";
export { generateFakeUUID } from "./lib/helpers/generate-fake-uuid";
export { getCurrencyRange } from "./lib/helpers/get-currency-range";
export { getDaysDiff } from "./lib/helpers/get-days-difference";
export { getDurationRange } from "./lib/helpers/get-duration-range";
export { getFile } from "./lib/helpers/get-file/get-file.fn";
export { getTailwindBreakpoint } from "./lib/helpers/get-tailwind-breakpoint";
export { isCSV } from "./lib/helpers/is/is-csv/is-csv.fn";
export { isEmailFromOptee } from "./lib/helpers/is/is-email-from-optee";
export { isNotNullish } from "./lib/helpers/is/is-not-nullish/is-not-nullish.fn";
export { isNullish } from "./lib/helpers/is/is-nullish/is-nullish.fn";
export { isPdf } from "./lib/helpers/is/is-pdf/is-pdf.fn";
export { logError } from "./lib/helpers/log/log-error.fn";
export { normalize } from "./lib/helpers/normalize";
export { removeDuplicate } from "./lib/helpers/remove-duplicate/remove-duplicate.fn";
export { removeNullishProps } from "./lib/helpers/remove-nullish-props/remove-nullish-props.fn";
export { sleep } from "./lib/helpers/sleep";
export { addMonth } from "./lib/helpers/transform/add-month/add-month.fn";
export { dateOnly } from "./lib/helpers/transform/date-only/date-only.fn";
export {
  buildOpeningHours,
  currentStatus,
  formatOpeningHours,
} from "./lib/helpers/transform/periods-to-opening-hours/periods-to-opening-hours.fn";
export type {
  IsoWeekday,
  OpeningHours,
} from "./lib/helpers/transform/periods-to-opening-hours/periods-to-opening-hours.fn";
export { withTimeout } from "./lib/helpers/with-timeout/with-timeout.fn";
export * from "./lib/public-env";
export * from "./lib/types/file.type";
export type { ExtractParams } from "./lib/types/function-parameters.type";
export type { nullish } from "./lib/types/nullish.type";
export * from "./lib/types/paginated-resource.type";
export type { Prettify } from "./lib/types/prettify.type";
