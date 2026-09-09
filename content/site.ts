/**
 * Contenido de la web.
 *
 * En el proyecto original estos textos, fotos y precios se editaban desde un
 * panel (Sanity). Esta versión es *solo la web*: el contenido vive aquí, en
 * un único archivo. Para cambiar un texto, un precio o una foto, edita este
 * archivo y vuelve a desplegar.
 *
 * Las imágenes y vídeos son archivos locales de `public/`.
 */

export type ImageRef = { url: string; alt?: string }

export const siteSettings = {
  brandName: 'la Gloria',
  brandTagline: 'LIMA · QUITO · CARTAGENA',
  siteTitle: 'La Gloria Restaurante',
  siteDescription:
    'Comida peruana y mediterránea con tintes ecuatorianos, en Quito. Reserva tu mesa en La Gloria Restaurante.',
  navItems: [
    { label: 'INICIO', href: '#inicio', boxed: false },
    { label: 'SOBRE LA GLORIA', href: '#sobre', boxed: false },
    { label: 'MENÚ', href: '#menu', boxed: false },
    { label: 'SERVICIOS', href: '#especiales', boxed: false },
    { label: 'RESERVAS', href: '#reservas', boxed: true },
    { label: 'TIENDA', href: '#footer', boxed: false },
    { label: 'CARRITO', href: '#footer', boxed: false },
  ],
  showLanguageSwitch: true,
  drinksButtonEnabled: true,
  drinksButtonLabel: 'BEBIDAS',
  // El asistente de chat habla con un agente externo (n8n). Deja `chatWebhookUrl`
  // vacío para ocultar el botón por completo.
  chatButtonEnabled: true,
  chatWebhookUrl: 'https://n8n-n8n.kwtwgj.easypanel.host/webhook/chat-soporte',
  chatTitle: 'Atención al Cliente',
  chatSubtitle: 'Normalmente respondemos al instante',
  chatWelcome:
    '¡Hola! Soy el asistente de La Gloria. ¿En qué puedo ayudarte? Puedo informarte sobre la carta, los horarios o tu reserva.',
  chatPlaceholder: 'Escribe tu mensaje…',
  chatNotifications: ['¿Deseas reservar? 🍽️', 'Contáctanos 💬'],
}

const CDN = 'https://res.cloudinary.com/foewxv45/image/upload'
const img = (id: string, w = 1920) => `${CDN}/f_auto,q_auto,w_${w},c_limit/${id}.jpg`
const imgw = (id: string, w = 1920) => `${CDN}/f_auto,q_auto,w_${w},c_limit/${id}`

export const hero = {
  title: 'Bienvenidos a la Gloria\nRestaurante',
  slides: [
    { url: img('lgherosalonbg'), alt: 'Salón La Gloria' },
    { url: img('lgheroclientes'), alt: 'Clientes disfrutando' },
    { url: img('lgheroplato'), alt: 'Plato especial' },
  ] as ImageRef[],
  ctas: [
    { label: 'Reservaciones', href: '#reservas' },
    { label: 'Conoce nuestro menú', href: '#menu' },
  ],
}

export const about = {
  heading:
    'Nos especializamos en comida peruana y mediterránea con tintes ecuatorianos',
  body: 'Cada día preparamos cuidadosamente nuestro ritual para poner en escena un inmenso mundo lleno de olores, sabores y sensaciones, para festejar juntos la Fiesta de la Vida.',
  imageLeft: { url: img('lgabouthostess', 600), alt: 'Hostess La Gloria' } as ImageRef,
  imageRight: { url: img('lgaboutplatos', 600), alt: 'Platos especiales La Gloria' } as ImageRef,
}

export const experience = {
  heading: 'Un instante de La Gloria',
  subheading: 'Desliza para vivir el momento',
  enabled: true,
}

export const specials = {
  heading: 'Especiales de nuestra carta',
  subheading: 'Innovando siempre para deleitar tus sentidos',
  videoUrl: '/videos/video-especiales.mp4',
  dishes: [
    { name: 'Ceviche mixto de mariscos', url: img('lgdish1', 800) },
    { name: 'Mixto frito con ceviche', url: img('lgdish2', 800) },
    { name: 'Seco de res con mote y patacón', url: img('lgdish3', 800) },
    { name: 'Pizza Margherita napolitana', url: img('lgdish4', 800) },
    { name: 'Cheesecake de lúcuma', url: img('lgdish5', 800) },
    { name: 'Entrada fría en copa de mariscos', url: img('lgdish6', 800) },
  ],
}

export const menu = {
  heading: 'Nuestro Menú',
  subheading: 'Selección completa de todas nuestras delicias',
  watermark: 'Menú',
  videoUrl: '/videos/video-menu.mp4',
  buttonLabel: 'Ver menú completo',
  buttonHref: '#footer',
  categories: [
    {
      title: 'Entradas Frías',
      items: [
        { name: 'Tiradito de pesca blanca', description: 'alcaparras / aguacate / ají amarillo / leche de tigre', price: '$12' },
        { name: 'Tartar de atún rojo', description: 'cebollín / jengibre / soya / aguacate', price: '$13' },
        { name: 'Tataki de atún rojo', description: 'ajo blanco / ponzu / cebollino / aceitunas kalamata', price: '$12' },
        { name: 'Frescas láminas de atún', description: 'aguacate / rabanito / vinagreta blanca', price: '$12' },
      ],
    },
    {
      title: 'Pescados',
      items: [
        { name: 'Pesca del día "al mare"', description: 'Sauvignon Blanc / almejas / camarones al limón / aceite de oliva', price: '$26' },
        { name: 'Corvina al "tabaco de cocina"', description: 'costra de polvo de hongos / puré de espinaca', price: '$22' },
        { name: 'Mero al pil pil', description: 'ajo, perejil… choclo frito y mote / maduro asado', price: '$22' },
        { name: 'Salmón ahumado al momento', description: 'con su arroz salvaje / salsa de setas', price: '$22' },
        { name: 'Fresco atún rojo "pepper steak"', description: 'papitas al perejil / espárragos / bacon', price: '$22' },
      ],
    },
    {
      title: 'Reses, Aves, Corderos y Lechones',
      items: [
        { name: 'Rack de Costillitas de Cordero serrano', description: 'papitas panaderas / reducción de tinto joven', price: '$29' },
        { name: 'Lomo fino de res grillado', description: 'a las 4 pimientas o en salsa al vino tinto / láminas de papa gratinadas', price: '$20' },
        { name: 'Seco de chivo', description: 'delicado arroz / maduro frito / aguacate', price: '$15' },
        { name: 'Bife de chorizo uruguayo (300gr.)', description: 'con sus papas chauchas fritas y ensalada fresca', price: '$39' },
      ],
    },
  ],
}

export const reservations = {
  heading: 'Nos encantaría recibirte pronto',
  lead: 'Realiza tu reserva en el siguiente link',
  backgroundUrl: img('lgherosalonbg'),
  backgroundAlt: 'Salón de La Gloria Restaurante',
  partySizeOptions: [
    '2 personas', '1 persona', '3 personas', '4 personas',
    '5 personas', '6 personas', '7 personas', '8 personas',
  ],
  submitLabel: 'Encuentra una mesa',
  reservationEmail: 'niauparii@gmail.com',
  orText: 'o llámanos al',
  phoneDisplay: '+593 99 916 9570',
  phoneNumber: '+593999169570',
  contactName: 'La Gloria Restaurante',
  address: 'Valladolid N24-519 y Francisco Salazar',
  contactEmail: 'reservas@lagloria.com.ec',
}

export const footer = {
  scheduleTitle: 'HORARIO',
  schedule: [
    { days: 'Lunes a viernes', hours: '12h30 a 23h00' },
    { days: 'Sábado', hours: '12h30 a 17h00 – 20h30 a 23h00' },
    { days: 'Domingo', hours: '12h30 a 16h30' },
  ],
  reserveTitle: 'RESERVAR CON:',
  reserveLinkLabel: 'Realiza tu reserva aquí',
  reserveLinkHref: '#reservas',
  socialTitle: 'RRSS',
  // Sin `url` el icono se pinta pero no enlaza a ningún sitio.
  socials: [
    { network: 'facebook' },
    { network: 'instagram' },
    { network: 'google' },
    { network: 'tripadvisor' },
    { network: 'tiktok' },
  ],
  copyright: '© 2025 La Gloria Restaurant',
}

export const drinksPage = {
  heroLabel: 'Carta de',
  title: 'Bebidas',
  intro: 'Limonadas artesanales & combinaciones de temporada',
  backLabel: '← Inicio',
  sectionTitle: 'Limonadas Artesanales',
  footerText: 'LIMA · QUITO · CARTAGENA  |  LA GLORIA RESTAURANTE',
  drinks: [
    {
      name: 'Limonada de Arándano', tag: 'Blueberry', price: 'desde $8',
      description: 'Arándanos frescos, limón exprimido, hielo & menta. Refrescante y antioxidante.',
      sizes: ['Small', 'Large'],
      image: { url: img('lgbebidablueberry', 600), alt: 'Limonada de Arándano' },
    },
    {
      name: 'Limonada de Fresa', tag: 'Strawberry', price: 'desde $8',
      description: 'Fresas naturales, limón fresco, hielo & sirope artesanal.',
      sizes: ['Small', 'Large'],
      image: { url: imgw('lgbebidastrawberry', 600), alt: 'Limonada de Fresa' },
    },
    {
      name: 'Mango Tropical', tag: 'Tropical', price: 'desde $9',
      description: 'Mango maduro, maracuyá, menta fresca & hielo granizado.',
      sizes: ['Small', 'Large'],
      image: { url: imgw('lgbebidamango', 600), alt: 'Mango Tropical' },
    },
    {
      name: 'Uva & Lichi', tag: 'Exotic', price: 'desde $9',
      description: 'Uvas moradas, lichi, limón & agua con gas. Elegante y refrescante.',
      sizes: ['Small', 'Large'],
      image: { url: imgw('lgbebidalychee', 600), alt: 'Uva y Lichi' },
    },
    {
      name: 'Frappuccino de Caramelo', tag: 'Signature', price: 'desde $10',
      description: 'Café helado, caramelo, crema batida & topping de sirope. Cremoso e irresistible.',
      sizes: ['Small', 'Large'],
      image: { url: img('lgbebidafrapp', 600), alt: 'Frappuccino de Caramelo' },
    },
    {
      name: 'Macchiato de Caramelo', tag: 'Coffee', price: 'desde $9',
      description: 'Espresso sobre leche fría con caramelo, hielo & notas dulces. Intenso y refrescante.',
      sizes: ['Small', 'Large'],
      image: { url: imgw('lgbebidamacchiato', 600), alt: 'Macchiato de Caramelo' },
    },
  ],
}

export const objects3d = {
  enabled: true,
  heading: 'Explora en 3D',
  subheading: 'Arrastra · Gira · Descubre',
  items: [
    {
      id: 'komi',
      label: 'Personaje',
      name: 'Komi',
      description:
        'Personaje anime de alta fidelidad generado con tecnología Multiview — cada detalle, cada textura, navegable en tiempo real desde cualquier dispositivo.',
    },
    {
      id: 'camiseta',
      label: 'Producto',
      name: 'Camiseta Técnica',
      description:
        'Camiseta de alto rendimiento con tejido respirable y diseño minimalista — optimizada con Draco + WebP para exploración 3D fluida en cualquier pantalla.',
      price: 'desde $35',
    },
  ],
}
