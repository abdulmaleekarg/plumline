import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import CartProvider from '@/components/CartProvider'
import Header from '@/components/Header'

const font = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font' })

export const metadata = { title: 'Plumline', description: 'Notebooks, pens and paper.' }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
