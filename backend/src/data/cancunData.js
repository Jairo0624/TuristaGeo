// Datos de ejemplo de TuristaGeo (Cancún). Edita aquí y vuelve a correr `npm run seed`.
// Coordenadas en decimal: lat (norte) y lng (oeste, negativa). El seed las guarda como [lng, lat].
// Las coordenadas de los lugares se contrastaron con fuentes públicas (Wikipedia, INAH, Waymarking, Sygic, OSM).
// Los polígonos de las zonas son APROXIMADOS (dibujados a mano) y se pueden redibujar desde la app.

const categorias = [
  { nombre: 'Playas', descripcion: 'Playas públicas del Caribe mexicano', color: '#0ea5e9' },
  { nombre: 'Cultura e historia', descripcion: 'Museos y zonas arqueológicas', color: '#a855f7' },
  { nombre: 'Compras y mercados', descripcion: 'Mercados, artesanías y plazas comerciales', color: '#f59e0b' },
  { nombre: 'Naturaleza y parques', descripcion: 'Parques y áreas verdes', color: '#22c55e' },
  { nombre: 'Transporte', descripcion: 'Muelles, ferris y terminales', color: '#64748b' },
];

const lugares = [
  {
    nombre: 'Playa Delfines',
    categoria: 'Playas',
    precio: 'gratis',
    lat: 21.0620,
    lng: -86.7786,
    descripcion: 'Playa pública con mirador y el letrero de Cancún. Tiene palapas gratuitas y oleaje que gusta a los surfistas locales.',
  },
  {
    nombre: 'Playa Tortugas',
    categoria: 'Playas',
    precio: 'gratis',
    lat: 21.1396,
    lng: -86.7692,
    descripcion: 'Playa de aguas tranquilas frente a la bahía de Mujeres, frecuentada por familias. De su muelle salen paseos en catamarán y snorkel.',
  },
  {
    nombre: 'Playa Marlín',
    categoria: 'Playas',
    precio: 'gratis',
    lat: 21.1039,
    lng: -86.7628,
    descripcion: 'Playa de la Zona Hotelera sobre el Blvd. Kukulcán km 13, cerca de La Isla Shopping Village.',
  },
  {
    nombre: 'Museo Maya de Cancún',
    categoria: 'Cultura e historia',
    precio: 'bajo',
    lat: 21.07389,
    lng: -86.77722,
    descripcion: 'Museo del INAH en el Blvd. Kukulcán km 16.5 con una amplia colección de piezas mayas. La entrada incluye la zona arqueológica San Miguelito.',
  },
  {
    nombre: 'Zona Arqueológica El Rey',
    categoria: 'Cultura e historia',
    precio: 'bajo',
    lat: 21.0600,
    lng: -86.7818,
    descripcion: 'Sitio arqueológico maya con unas 47 estructuras en el km 18 del Blvd. Kukulcán. Es fácil encontrar iguanas entre las ruinas.',
  },
  {
    nombre: 'Mercado 28',
    categoria: 'Compras y mercados',
    precio: 'bajo',
    lat: 21.1617,
    lng: -86.8342,
    descripcion: 'Mercado tradicional del centro con locales de artesanías, ropa, souvenirs y comida regional. Se acostumbra regatear.',
  },
  {
    nombre: 'La Isla Shopping Village',
    categoria: 'Compras y mercados',
    precio: 'medio',
    lat: 21.10928,
    lng: -86.76396,
    descripcion: 'Centro comercial al aire libre junto a la laguna Nichupté, en el km 12.5, con tiendas y restaurantes.',
  },
  {
    nombre: 'Parque Urbano Kabah',
    categoria: 'Naturaleza y parques',
    precio: 'gratis',
    lat: 21.14377,
    lng: -86.8384,
    descripcion: 'Parque con vegetación de selva en pleno centro de la ciudad. Incluye un pequeño museo con fotografías del viejo Cancún.',
  },
  {
    nombre: 'Terminal Marítima Puerto Juárez',
    categoria: 'Transporte',
    precio: 'medio',
    lat: 21.1837,
    lng: -86.8071,
    descripcion: 'Terminal de Puerto Juárez, de donde salen los ferris a Isla Mujeres.',
  },
];

// Polígonos aproximados: [lng, lat], anillo cerrado
const zonas = [
  {
    nombre: 'Zona Hotelera',
    coordinates: [
      [-86.822, 21.166], [-86.769, 21.148], [-86.737, 21.137], [-86.738, 21.124],
      [-86.754, 21.109], [-86.766, 21.074], [-86.771, 21.052], [-86.775, 21.045],
      [-86.790, 21.046], [-86.790, 21.074], [-86.778, 21.109], [-86.758, 21.124],
      [-86.769, 21.131], [-86.822, 21.150], [-86.822, 21.166],
    ],
  },
  {
    nombre: 'Centro de Cancún',
    coordinates: [[-86.855, 21.140], [-86.818, 21.140], [-86.818, 21.172], [-86.855, 21.172], [-86.855, 21.140]],
  },
  {
    nombre: 'Puerto Juárez',
    coordinates: [[-86.818, 21.176], [-86.795, 21.176], [-86.795, 21.192], [-86.818, 21.192], [-86.818, 21.176]],
  },
];

const rutas = [
  {
    nombre: 'Cultura maya en un día',
    descripcion: 'Museo, ruinas y un atardecer en la playa.',
    duracion: '5 horas',
    lugares: ['Museo Maya de Cancún', 'Zona Arqueológica El Rey', 'Playa Delfines'],
  },
  {
    nombre: 'Playas de la Zona Hotelera',
    descripcion: 'Recorrido por tres playas públicas, de la bahía al mar abierto.',
    duracion: '6 horas',
    lugares: ['Playa Tortugas', 'Playa Marlín', 'Playa Delfines'],
  },
  {
    nombre: 'Centro y compras',
    descripcion: 'Naturaleza urbana, mercado tradicional y plaza comercial.',
    duracion: '4 horas',
    lugares: ['Parque Urbano Kabah', 'Mercado 28', 'La Isla Shopping Village'],
  },
];

// Reseñas de ejemplo para que el usuario demo muestre datos en la app
const resenas = [
  { lugar: 'Playa Delfines', calificacion: 5, comentario: 'Muy buena vista y palapas sin costo.' },
  { lugar: 'Museo Maya de Cancún', calificacion: 4, comentario: 'Buena colección y las ruinas están dentro del mismo predio.' },
  { lugar: 'Mercado 28', calificacion: 4, comentario: 'Conviene comparar precios y regatear.' },
  { lugar: 'Playa Tortugas', calificacion: 4, comentario: 'Aguas tranquilas, ideal para ir en familia.' },
];

module.exports = { categorias, lugares, zonas, rutas, resenas };
