// sw.js (Línea 2 - CORREGIDA)
// IMPORTANTE: Esta es la forma más compatible para importar el SDK del Service Worker.
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Configuración de Firebase (copiada de firebase.js)
const firebaseConfig = {
    apiKey: "AIzaSyAkyJAy5vieRmHjoZWPEezUDzywQWlMh_E",
    authDomain: "lili-418a8.firebaseapp.com",
    projectId: "lili-418a8",
    storageBucket: "lili-418a8.firebasestorage.app",
    messagingSenderId: "926454298512",
    appId: "1:926454298512:web:4dff9df8c533a69113a515",
    measurementId: "G-WJ3PV6V4DP"
};

// Inicializar Firebase para el Service Worker
firebase.initializeApp(firebaseConfig);

//Asignar nombre y version de la cache
const CACHE_NAME = 'v1_cache_LilianaGonzalezPWA';

//ficheros a cachear en la aplicacion
var urlsToCache = [
    './',
    './css/styles.css',
    './img/favicon.png',
    './img/rock1.png',
    './img/rock2.png', 
    './img/rock3.png',
    './img/facebook.png',
    './img/instagram.png',
    './img/twitter.png',
    './img/favicon-1024.png',
    './img/favicon-512.png',
    './img/favicon-384.png',
    './img/favicon-256.png',
    './img/favicon-192.png',
    './img/favicon-128.png',
    './img/favicon-96.png',
    './img/favicon-64.png',
    './img/favicon-32.png',
    './img/favicon-16.png',
];


//Evento install
//Instalacion del service worker y guardar en cache los recursos estaticos
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache)
            .then(() => {
                self.skipWaiting();
            });
        })
        .catch(err => console.log('No se ha registrado el cache', err))
    );

});

//Evento activate
//Que la app funcione sin conexion
self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME];

    e.waitUntil(
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if(cacheWhitelist.indexOf(cacheName) === -1){
                        //Borrar elementos que no se necesitan
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            //Activar cache
            self.clients.claim();
        })
    );
});

//Evento fetch
// sw.js

self.addEventListener('fetch', e => {
    // 💥 NUEVA LÓGICA: Excluir peticiones de Firebase y API (Network Only)
    // El método 'match' busca el patrón en la URL de la petición.
    const url = e.request.url;

    // Si la URL es de Firebase o de la API de Google, usa Network Only (no cachear)
    if (url.includes('firestore.googleapis.com') || 
        url.includes('firebase-firestore.googleapis.com') ||
        url.includes('firebasejs') ) {
        return e.respondWith(fetch(e.request));
    }
    
    // Si NO es una petición de API, usa la estrategia Cache First para los archivos estáticos
    e.respondWith(
        caches.match(e.request)
        .then(res => {
            if (res) {
                return res;
            }
            return fetch(e.request);
        })
    );
});

// Evento Push (Muestra la notificación recibida de FCM)
self.addEventListener('push', (event) => {
    // Si la notificación no viene de Firebase o está vacía, evitamos errores.
    if (event.data) {
        // Extraemos el payload (título, cuerpo, etc.)
        const data = event.data.json().notification;
        
        const title = data.title || '¡Nueva Alerta!';
        const options = {
            body: data.body || 'Entérate de las novedades del Rock.',
            icon: '/img/favicon-192.png', // Debe existir en tu proyecto
            badge: '/img/favicon-96.png'
            };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});
// Evento Click (Maneja la acción cuando el usuario hace click en la notificación)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Abre la página principal (la raíz) al hacer click
    event.waitUntil(
        clients.openWindow('/') 
    );
});


