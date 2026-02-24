import './globals.css'

export const metadata = {
  title: 'Tusenbruk — A Thousand Uses',
  description: 'A private community for those who use, love, and trade the objects that carry their stories.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Barlow+Condensed:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
