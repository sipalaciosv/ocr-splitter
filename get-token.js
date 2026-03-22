// Script para obtener el token de Firebase desde la consola del navegador
// Abre la app en http://localhost:5173, haz login, y ejecuta este código en la consola

// Versión 1: Directa
import { auth } from './src/lib/firebase'
auth.currentUser?.getIdToken().then(token => {
    console.log('🔑 TOKEN DE FIREBASE:')
    console.log(token)
    console.log('\n📋 Copiado al portapapeles!')
    navigator.clipboard.writeText(token)
})

// Versión 2: Si la versión 1 no funciona, usa esto en su lugar:
window.getFirebaseToken = async function () {
    try {
        const { auth } = await import('./src/lib/firebase')
        const token = await auth.currentUser?.getIdToken()
        console.log('🔑 TOKEN DE FIREBASE:')
        console.log(token)
        navigator.clipboard.writeText(token)
        console.log('📋 Token copiado al portapapeles!')
        return token
    } catch (error) {
        console.error('Error:', error)
    }
}

// Luego solo escribe: getFirebaseToken()
