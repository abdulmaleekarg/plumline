import { money } from './format'

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function sendOrderConfirmation({ to, order, items }) {
  const rows = items
    .map((i) => `<tr><td>${esc(i.name)} × ${i.quantity}</td><td align="right">${money(i.unit_price_cents * i.quantity)}</td></tr>`)
    .join('')

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#2B1B3D">
    <h1 style="font-size:22px">Thanks for your order, ${esc(order.name)}</h1>
    <p>Order #${order.number} is confirmed. We'll ship to:</p>
    <p>${esc(order.address)}<br>${esc(order.city)} ${esc(order.postal_code)}<br>${esc(order.country)}</p>
    <table width="100%" cellpadding="6" style="border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}
      <tr><td><strong>Total</strong></td><td align="right"><strong>${money(order.total_cents)}</strong></td></tr>
    </table>
    <p style="font-size:13px;color:#6B5C7E">Questions? Reply to this email.</p>
  </div>`

  const text =
    `Thanks for your order, ${order.name}.\nOrder #${order.number}\n\n` +
    items.map((i) => `${i.name} x ${i.quantity}  ${money(i.unit_price_cents * i.quantity)}`).join('\n') +
    `\n\nTotal: ${money(order.total_cents)}`

  const base = process.env.MAILGUN_API_BASE || 'https://api.mailgun.net'
  const res = await fetch(`${base}/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`api:${(process.env.MAILGUN_API_KEY || '').trim()}`).toString('base64'),,
    },
    body: new URLSearchParams({
      from: process.env.MAILGUN_FROM,
      to,
      subject: `Order #${order.number} confirmed`,
      text,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Mailgun ${res.status}: ${await res.text()}`)
}
