// Demo delivery promise for one serviceable postcode. Replace this rule with a
// retailer's delivery service when integrating a real fulfilment system.
export const DEMO_POSTCODE = '560001'

const datePartsInZone = (date) => Object.fromEntries(
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).filter((part) => part.type !== 'literal').map(({ type, value }) => [type, value]),
)

export function demoDeliveryEstimate(postalCode, now = new Date()) {
  const normalized = String(postalCode ?? '').replace(/\s+/g, '')
  if (normalized !== DEMO_POSTCODE) {
    return {
      postal_code: normalized,
      serviceable: false,
      estimated_delivery_date: null,
      estimated_arrival: null,
      message: `Demo delivery is configured for postcode ${DEMO_POSTCODE}.`,
    }
  }

  const { year, month, day } = datePartsInZone(now)
  const today = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12))
  const daysUntilFriday = (5 - today.getUTCDay() + 7) % 7 || 7
  today.setUTCDate(today.getUTCDate() + daysUntilFriday)
  const estimatedDeliveryDate = today.toISOString().slice(0, 10)
  const estimatedArrival = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(today)

  return {
    postal_code: normalized,
    serviceable: true,
    estimated_delivery_date: estimatedDeliveryDate,
    estimated_arrival: estimatedArrival,
    message: `Estimated delivery by ${estimatedArrival}.`,
  }
}
