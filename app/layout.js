export const metadata = {
  title: 'Mundial Porras',
  description: 'Juega a las porras del Mundial con tus amigos',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#060f0a"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="manifest" href="/manifest.json"/>
      </head>
      <body style={{margin:0,padding:0,background:'#060f0a'}}>{children}</body>
    </html>
  );
}
